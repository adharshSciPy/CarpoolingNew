import "../admin/adminwallet.css"

const AdminWallet = () => {
  const transactions = [
    { userId: "user123", amount: 100, date: "2025-06-20" },
    { userId: "user456", amount: 150, date: "2025-06-21" },
    { userId: "user789", amount: 75, date: "2025-06-22" },
  ];

  return (
    <div className="admin-wallet-container">
      <div className="admin-wallet-card">
        <h2 className="admin-wallet-title">Admin Wallet Dashboard</h2>

        <table className="wallet-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Amount Paid (₹)</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, index) => (
              <tr key={index}>
                <td>{tx.userId}</td>
                <td>₹{tx.amount}</td>
                <td>{tx.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminWallet;