import React, { useState, useEffect } from "react";
import { connectWallet } from "./web3";
import { getTransactions, sendFunds } from "./contract";
import "bootstrap/dist/css/bootstrap.min.css";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, 
  PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer 
} from "recharts";

function App() {
  const [walletAddress, setWalletAddress] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalTransactions: 0,
    totalETHSent: "0.0000",
    mostActiveUsers: [],
  });

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    document.body.className = darkMode ? "dark-mode" : "light-mode";
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const handleConnect = async () => {
    const signer = await connectWallet();
    if (signer) {
      setWalletAddress(await signer.getAddress());
      fetchAnalytics();
    }
  };

  const handleSend = async () => {
    setStatus("Sending...");
    const tx = await sendFunds(recipient, message, amount);
    if (tx) {
      setStatus(`Transaction sent! Hash: ${tx.hash}`);
      setTimeout(fetchAnalytics, 10000);
    } else {
      setStatus("Transaction failed.");
    }
  };

  const fetchAnalytics = async () => {
    const data = await getTransactions();
    setTransactions(data.transactions);
    setAnalytics({
      totalTransactions: data.totalTransactions,
      totalETHSent: data.totalETHSent,
      mostActiveUsers: data.mostActiveUsers,
    });
  };

  useEffect(() => {
    if (walletAddress) {
      fetchAnalytics();
    }
  }, [walletAddress]);

  // Prepare Data for Charts
  const activeUsersData = analytics.mostActiveUsers.map(([user, count]) => ({
    name: user.substring(0, 6) + "...",
    value: count,
  }));

  const transactionsData = transactions.map((tx, index) => ({
    name: `Tx ${index + 1}`,
    eth: parseFloat(tx.amount),
  }));

  return (
    <div className={`container mt-4 text-center ${darkMode ? "dark-bg" : "light-bg"}`}>
      <h1 className="text-primary mb-4">Web3 DApp</h1>
      
      {/* 🌙 Dark Mode Toggle */}
      <button
        className="dark-mode-toggle"
        onClick={() => setDarkMode(!darkMode)}
      >
        {darkMode ? "☀️" : "🌙"}
      </button>

      {walletAddress ? (
        <>
          <p className="text-success"><strong>Connected:</strong> {walletAddress}</p>
          
          {/* Send Transaction Form */}
          <div className="card p-4 shadow-sm">
            <h3 className="text-secondary">Send ETH</h3>
            <input
              type="text"
              className="form-control my-2"
              placeholder="Recipient Address"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
            <input
              type="text"
              className="form-control my-2"
              placeholder="Amount (ETH)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <input
              type="text"
              className="form-control my-2"
              placeholder="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button className="btn btn-primary" onClick={handleSend}>Send ETH</button>
            <p className="text-info mt-2">{status}</p>
          </div>

          {/* Analytics Dashboard */}
          <div className="card p-4 mt-4 shadow-sm">
            <h3 className="text-secondary">Analytics Dashboard</h3>
            <p><strong>Total Transactions:</strong> {analytics.totalTransactions}</p>
            <p><strong>Total ETH Sent:</strong> {analytics.totalETHSent} ETH</p>

            {/* Most Active Users Pie Chart */}
            <h4 className="mt-3">Most Active Users</h4>
            {activeUsersData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={activeUsersData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                    {activeUsersData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={["#0088FE", "#00C49F", "#FFBB28", "#FF8042"][index % 4]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p>No active users yet.</p>
            )}
          </div>

          {/* ETH Sent Per Transaction Bar Chart */}
          <div className="card p-4 mt-4 shadow-sm">
            <h3 className="text-secondary">ETH Sent Per Transaction</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={transactionsData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="eth" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Transactions Over Time Line Chart */}
          <div className="card p-4 mt-4 shadow-sm">
            <h3 className="text-secondary">Transactions Over Time</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={transactionsData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="eth" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Transaction History */}
          <div className="card p-4 mt-4 shadow-sm">
            <h3 className="text-secondary">Transaction History</h3>
            {transactions.length > 0 ? (
              <ul className="list-group">
                {transactions.map((tx, index) => (
                  <li key={index} className="list-group-item">
                    <p><strong>From:</strong> {tx.from}</p>
                    <p><strong>To:</strong> {tx.to}</p>
                    <p><strong>Amount:</strong> {tx.amount} ETH</p>
                    <p><strong>Message:</strong> {tx.message}</p>
                    <p><strong>Timestamp:</strong> {tx.timestamp}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No transactions yet.</p>
            )}
          </div>
        </>
      ) : (
        <button className="btn btn-success" onClick={handleConnect}>Connect Wallet</button>
      )}
    </div>
  );
}

export default App;
