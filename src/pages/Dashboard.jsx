import { useState, useEffect, useMemo } from 'react';
import { getTransactions } from '../utils/localStorage';
import products from '../data/pos_item.json';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { format, subDays, subWeeks, subMonths, isAfter, parseISO, startOfDay } from 'date-fns';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

function Dashboard() {
    const [transactions, setTransactions] = useState([]);
    const [top5SortBy, setTop5SortBy] = useState('total'); // 'total' or 'quantity'
    const [period, setPeriod] = useState('daily'); // 'daily', 'weekly', 'monthly'

    useEffect(() => {
        setTransactions(getTransactions());
    }, []);

    // Calculate total sales of all time
    const totalSales = useMemo(() => {
        return transactions.reduce((sum, t) => sum + t.total, 0);
    }, [transactions]);

    // Total transaction count
    const totalTransactions = transactions.length;

    // Filter transactions by period for summary
    const periodSummary = useMemo(() => {
        const now = new Date();
        let startDate;
        let periodLabel;

        switch (period) {
            case 'daily':
                startDate = startOfDay(now);
                periodLabel = "Today";
                break;
            case 'weekly':
                startDate = subWeeks(now, 1);
                periodLabel = "This Week";
                break;
            case 'monthly':
                startDate = subMonths(now, 1);
                periodLabel = "This Month";
                break;
            default:
                startDate = startOfDay(now);
                periodLabel = "Today";
        }

        const filtered = transactions.filter(t =>
            isAfter(parseISO(t.date), startDate) || format(parseISO(t.date), 'yyyy-MM-dd') === format(startDate, 'yyyy-MM-dd')
        );

        const sales = filtered.reduce((sum, t) => sum + t.total, 0);
        const count = filtered.length;
        const items = filtered.reduce((sum, t) => sum + t.quantity, 0);

        return { sales, count, items, periodLabel };
    }, [transactions, period]);

    // Sales by product
    const salesByProduct = useMemo(() => {
        const productSales = {};
        transactions.forEach(t => {
            if (!productSales[t.productName]) {
                productSales[t.productName] = { quantity: 0, total: 0, category: t.category };
            }
            productSales[t.productName].quantity += t.quantity;
            productSales[t.productName].total += t.total;
        });
        return Object.entries(productSales)
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.total - a.total);
    }, [transactions]);

    // Top 5 selling items with sort option
    const top5Items = useMemo(() => {
        const sorted = [...salesByProduct].sort((a, b) =>
            top5SortBy === 'quantity' ? b.quantity - a.quantity : b.total - a.total
        );
        return sorted.slice(0, 5);
    }, [salesByProduct, top5SortBy]);

    // Line chart data - daily sales for last 30 days
    const lineChartData = useMemo(() => {
        const last30Days = [];
        for (let i = 29; i >= 0; i--) {
            const date = subDays(new Date(), i);
            const dateStr = format(date, 'yyyy-MM-dd');
            const dayTransactions = transactions.filter(t => t.date === dateStr);
            const dayTotal = dayTransactions.reduce((sum, t) => sum + t.total, 0);
            last30Days.push({
                date: format(date, 'MMM dd'),
                sales: dayTotal
            });
        }
        return last30Days;
    }, [transactions]);

    // Pie chart data - sales by category
    const pieChartData = useMemo(() => {
        const categorySales = {};
        transactions.forEach(t => {
            if (!categorySales[t.category]) {
                categorySales[t.category] = 0;
            }
            categorySales[t.category] += t.total;
        });
        return Object.entries(categorySales).map(([name, value]) => ({ name, value }));
    }, [transactions]);

    return (
        <div className="dashboard">
            <h1 className="page-title">Dashboard</h1>

            {/* Summary Cards */}
            <div className="summary-cards">
                <div className="card stat-card">
                    <div className="stat-icon">💰</div>
                    <div className="stat-info">
                        <span className="stat-label">Total Sales (All Time)</span>
                        <span className="stat-value">${totalSales.toLocaleString()}</span>
                    </div>
                </div>

                <div className="card stat-card">
                    <div className="stat-icon">📦</div>
                    <div className="stat-info">
                        <span className="stat-label">Total Transactions</span>
                        <span className="stat-value">{totalTransactions}</span>
                    </div>
                </div>

                <div className="card stat-card">
                    <div className="stat-icon">🏷️</div>
                    <div className="stat-info">
                        <span className="stat-label">Products Sold</span>
                        <span className="stat-value">{salesByProduct.length}</span>
                    </div>
                </div>
            </div>

            {/* Period Summary Card */}
            <div className="card period-summary-card">
                <div className="period-header">
                    <h3>Sales Summary</h3>
                    <div className="period-toggle">
                        <button
                            className={period === 'daily' ? 'active' : ''}
                            onClick={() => setPeriod('daily')}
                        >
                            Daily
                        </button>
                        <button
                            className={period === 'weekly' ? 'active' : ''}
                            onClick={() => setPeriod('weekly')}
                        >
                            Weekly
                        </button>
                        <button
                            className={period === 'monthly' ? 'active' : ''}
                            onClick={() => setPeriod('monthly')}
                        >
                            Monthly
                        </button>
                    </div>
                </div>
                <div className="period-stats-grid">
                    <div className="period-stat">
                        <span className="period-stat-value">${periodSummary.sales.toLocaleString()}</span>
                        <span className="period-stat-label">Revenue ({periodSummary.periodLabel})</span>
                    </div>
                    <div className="period-stat">
                        <span className="period-stat-value">{periodSummary.count}</span>
                        <span className="period-stat-label">Transactions</span>
                    </div>
                    <div className="period-stat">
                        <span className="period-stat-value">{periodSummary.items}</span>
                        <span className="period-stat-label">Items Sold</span>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="charts-container">
                <div className="card chart-card">
                    <h3>Sales Trends (Last 30 Days)</h3>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={lineChartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#6b7280"
                                    fontSize={11}
                                    label={{ value: 'Date', position: 'insideBottom', offset: -10, fill: '#6b7280' }}
                                />
                                <YAxis
                                    stroke="#6b7280"
                                    fontSize={11}
                                    label={{ value: 'Sales ($)', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
                                />
                                <Tooltip
                                    formatter={(value) => [`$${value.toLocaleString()}`, 'Sales']}
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="sales"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                                    activeDot={{ r: 6, fill: '#2563eb' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card chart-card">
                    <h3>Sales by Category</h3>
                    <div className="chart-wrapper">
                        {pieChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={pieChartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={3}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {pieChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value) => `$${value.toLocaleString()}`}
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                                        }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="no-data">No sales data yet</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Top 5 & Sales by Product */}
            <div className="tables-container">
                <div className="card table-card">
                    <div className="table-header">
                        <h3>Top 5 Selling Items</h3>
                        <div className="sort-toggle">
                            <button
                                className={top5SortBy === 'quantity' ? 'active' : ''}
                                onClick={() => setTop5SortBy('quantity')}
                            >
                                By Quantity
                            </button>
                            <button
                                className={top5SortBy === 'total' ? 'active' : ''}
                                onClick={() => setTop5SortBy('total')}
                            >
                                By Revenue
                            </button>
                        </div>
                    </div>
                    {top5Items.length > 0 ? (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Product</th>
                                    <th>Quantity</th>
                                    <th>Total Sales</th>
                                </tr>
                            </thead>
                            <tbody>
                                {top5Items.map((item, index) => (
                                    <tr key={item.name}>
                                        <td className="rank">#{index + 1}</td>
                                        <td>{item.name}</td>
                                        <td>{item.quantity}</td>
                                        <td className="amount">${item.total.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="no-data">No sales data yet</div>
                    )}
                </div>

                <div className="card table-card">
                    <h3>Sales by Product</h3>
                    {salesByProduct.length > 0 ? (
                        <div className="table-scroll">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Category</th>
                                        <th>Qty Sold</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {salesByProduct.map((item) => (
                                        <tr key={item.name}>
                                            <td>{item.name}</td>
                                            <td><span className="category-badge">{item.category}</span></td>
                                            <td>{item.quantity}</td>
                                            <td className="amount">${item.total.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="no-data">No sales data yet</div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
