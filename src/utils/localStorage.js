const TRANSACTIONS_KEY = 'sales_transactions';

export const getTransactions = () => {
    const data = localStorage.getItem(TRANSACTIONS_KEY);
    return data ? JSON.parse(data) : [];
};

export const saveTransaction = (transaction) => {
    const transactions = getTransactions();
    const newTransaction = {
        ...transaction,
        id: Date.now(),
        createdAt: new Date().toISOString()
    };
    transactions.push(newTransaction);
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
    return newTransaction;
};

export const deleteTransaction = (id) => {
    const transactions = getTransactions();
    const filtered = transactions.filter(t => t.id !== id);
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(filtered));
    return filtered;
};

export const clearTransactions = () => {
    localStorage.removeItem(TRANSACTIONS_KEY);
};
