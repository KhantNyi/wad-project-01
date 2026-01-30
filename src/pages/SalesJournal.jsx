import { useState, useEffect } from 'react';
import { getTransactions, saveTransaction, deleteTransaction } from '../utils/localStorage';
import products from '../data/pos_item.json';
import { format } from 'date-fns';

function SalesJournal() {
    const [transactions, setTransactions] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        setTransactions(getTransactions());
    }, []);

    // Find product by itemName (using itemName as ID since we don't have explicit IDs)
    const selectedProductData = products.find(p => p.itemName === selectedProduct);
    const totalPrice = selectedProductData ? selectedProductData.unitPrice * quantity : 0;

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!selectedProduct || quantity < 1) {
            alert('Please select a product and enter a valid quantity');
            return;
        }

        const transaction = {
            id: Date.now(), // Generate a unique ID for the transaction
            productName: selectedProductData.itemName,
            category: selectedProductData.category,
            unitPrice: selectedProductData.unitPrice,
            quantity: quantity,
            total: totalPrice,
            date: date
        };

        const newTransaction = saveTransaction(transaction);
        setTransactions([...transactions, newTransaction]);

        // Reset form
        setSelectedProduct('');
        setQuantity(1);
        setDate(format(new Date(), 'yyyy-MM-dd'));

        // Show success message
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
    };

    const handleDelete = (id) => {
        const confirmed = window.confirm('Are you sure you want to delete this transaction?');
        if (confirmed) {
            const updated = deleteTransaction(id);
            setTransactions(updated);
        }
    };

    // Sort transactions by date (newest first)
    const sortedTransactions = [...transactions].sort((a, b) =>
        new Date(b.date) - new Date(a.date) || b.id - a.id
    );

    return (
        <div className="sales-journal">
            <h1 className="page-title">Sales Journal</h1>

            {/* Add Transaction Form */}
            <div className="card form-card">
                <h3>📝 Record New Sale</h3>
                <form onSubmit={handleSubmit} className="sale-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="product">Product</label>
                            <select
                                id="product"
                                value={selectedProduct}
                                onChange={(e) => setSelectedProduct(e.target.value)}
                                required
                            >
                                <option value="">Select a product...</option>
                                {products.map((product, index) => (
                                    <option key={index} value={product.itemName}>
                                        {product.itemName} - ${product.unitPrice} ({product.category})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="quantity">Quantity</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                id="quantity"
                                value={quantity}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    setQuantity(val === '' ? '' : parseInt(val));
                                }}
                                onBlur={(e) => {
                                    if (!quantity || quantity < 1) setQuantity(1);
                                }}
                                placeholder="Enter quantity"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="date">Date</label>
                            <input
                                type="date"
                                id="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-footer">
                        <div className="total-display">
                            <span className="total-label">Total Price:</span>
                            <span className="total-amount">${totalPrice.toLocaleString()}</span>
                        </div>
                        <button type="submit" className="submit-btn" disabled={!selectedProduct}>
                            <span>➕</span> Add Transaction
                        </button>
                    </div>
                </form>

                {showSuccess && (
                    <div className="success-message">
                        ✅ Transaction added successfully!
                    </div>
                )}
            </div>

            {/* Transactions List */}
            <div className="card">
                <h3>📜 All Transactions ({transactions.length})</h3>

                {transactions.length > 0 ? (
                    <div className="table-scroll">
                        <table className="data-table transactions-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Product</th>
                                    <th>Category</th>
                                    <th>Qty</th>
                                    <th>Unit Price</th>
                                    <th>Total</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedTransactions.map((t) => (
                                    <tr key={t.id}>
                                        <td>{format(new Date(t.date), 'MMM dd, yyyy')}</td>
                                        <td>{t.productName}</td>
                                        <td><span className="category-badge">{t.category}</span></td>
                                        <td>{t.quantity}</td>
                                        <td>${t.unitPrice.toLocaleString()}</td>
                                        <td className="amount">${t.total.toLocaleString()}</td>
                                        <td>
                                            <button
                                                type="button"
                                                className="delete-btn"
                                                onClick={() => handleDelete(t.id)}
                                                title="Delete transaction"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="no-data">
                        <p>No transactions yet</p>
                        <p className="hint">Add your first sale using the form above!</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SalesJournal;
