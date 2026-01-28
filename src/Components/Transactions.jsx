import React, { useEffect, useState } from "react";
import { useBanking } from "../context/BankingContext";
import "../styles/Transactions.css";

import { FiCheckCircle, FiAlertCircle, FiX } from "react-icons/fi";

// Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast ${type}`}>
      <div className="toast-icon">
        {type === 'success' ? <FiCheckCircle /> : <FiAlertCircle />}
      </div>
      <div className="toast-message">{message}</div>
      <button className="toast-close" onClick={onClose}>
        <FiX />
      </button>
    </div>
  );
};

const TransactionPage = ({ onBack, darkMode }) => {
  const { state } = useBanking();
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [accounts, setAccounts] = useState([]);

  // Toast State
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // 🔥 Load transactions from banking context or logged user
  useEffect(() => {
    // First try to get from banking context
    if (state.transactions && state.transactions.length > 0) {
      setTransactions(state.transactions);
      setAccounts(state.accounts || []);
    } else {
      // Fallback to localStorage
      const stored = localStorage.getItem("epic_logged_user");
      if (stored) {
        const user = JSON.parse(stored);
        setTransactions(user.transactions || []);

        // Also load user accounts if available
        if (user.accounts) {
          setAccounts(user.accounts);
        }
      }
    }
  }, [state.transactions, state.accounts]);

  // 🔎 Filters (same logic)
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      !search ||
      t.title?.toLowerCase().includes(search.toLowerCase()) ||
      t.type?.toLowerCase().includes(search.toLowerCase()) ||
      t.senderName?.toLowerCase().includes(search.toLowerCase()) ||
      t.receiverName?.toLowerCase().includes(search.toLowerCase());

    const txnDate = new Date(t.date);
    const now = new Date();

    const matchesDate =
      dateFilter === "all" ||
      (dateFilter === "today" && txnDate.toDateString() === now.toDateString()) ||
      (dateFilter === "week" && (now - txnDate) / (1000 * 60 * 60 * 24) <= 7) ||
      (dateFilter === "month" &&
        txnDate.getMonth() === now.getMonth() &&
        txnDate.getFullYear() === now.getFullYear());

    return matchesSearch && matchesDate;
  });

  // 📊 Stats (same logic)
  const totalAmount = filteredTransactions.reduce(
    (sum, t) => sum + (t.amount || 0),
    0
  );

  // 📤 Export CSV (same logic)
  const exportCSV = () => {
    if (!filteredTransactions.length) return addToast("No data to export", "error");

    const headers = ["Date", "Title", "Type", "Amount"];
    const rows = filteredTransactions.map((t) => [
      new Date(t.date).toLocaleString(),
      t.title || `${t.senderName} → ${t.receiverName}`,
      t.type || "transfer",
      t.amount
    ]);

    const csv =
      headers.join(",") +
      "\n" +
      rows.map((r) => r.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "transactions.csv";
    a.click();
  };

  // 📤 Export JSON (same logic)
  const exportJSON = () => {
    const blob = new Blob(
      [JSON.stringify(filteredTransactions, null, 2)],
      { type: "application/json" }
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "transactions.json";
    a.click();
  };

  // 🧹 Clear (same logic)
  const clearTransactions = () => {
    if (!window.confirm("Clear all transactions?")) return;

    const stored = JSON.parse(localStorage.getItem("epic_logged_user"));
    stored.transactions = [];
    localStorage.setItem("epic_logged_user", JSON.stringify(stored));

    setTransactions([]);
  };

  return (
    <div className={`transaction-page ${darkMode ? 'dark-mode' : ''}`}>
      <div className="transaction-container">
        {/* HEADER */}
        <div className="page-header">
          <div className="page-header-content">
            <h1 className="page-title">Transactions</h1>
            <p className="page-subtitle">Track your financial history </p>
          </div>
          <button className="back-button" onClick={onBack}>
            ← Back
          </button>
        </div>

        {/* STATS */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div>
              <p className="stat-label">Total Transactions</p>
              <p className="stat-value">{filteredTransactions.length}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div>
              <p className="stat-label">Total Amount</p>
              <p className="stat-value">₹{totalAmount.toLocaleString("en-IN")}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div>
              <p className="stat-label">Accounts Active</p>
              <p className="stat-value">{accounts.length}</p>
            </div>
          </div>
        </div>

        {/* FILTERS & EXPORTS */}
        <div className="filters-container">
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="actions-wrapper">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="form-select"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">This Month</option>
            </select>

            <button className="action-btn csv-btn" onClick={exportCSV}>
              CSV
            </button>
            <button className="action-btn json-btn" onClick={exportJSON}>
              JSON
            </button>
            {filteredTransactions.length > 0 && (
              <button className="action-btn clear-btn" onClick={clearTransactions}>
                Clear
              </button>
            )}
          </div>
        </div>

        {/* LIST */}
        <div className="transactions-list-wrapper">
          {filteredTransactions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p className="empty-title">No transactions found</p>
              <p className="empty-subtitle">Try adjusting your filters or search</p>
            </div>
          ) : (
            <>
              <div className="transactions-content">
                {filteredTransactions.map((t) => {
                  const isCredit = t.type === "Credit" || t.type === "DEPOSIT"; // FIX: Treat DEPOSIT as credit
                  return (
                    <div key={t.id} className="transaction-item">
                      <div className={`transaction-icon-box ${isCredit ? "credit" : "debit"}`}>
                        {isCredit ? "↓" : "↑"}
                      </div>
                      <div className="transaction-main">
                        <div className="transaction-info-top">
                          <span className="transaction-title">
                            {t.title || `${t.senderName || 'Transfer'} → ${t.receiverName || 'Beneficiary'}`}
                          </span>
                          <span className={`transaction-amount ${isCredit ? "credit" : "debit"}`}>
                            {isCredit ? "+" : "-"} ₹{Math.abs(t.amount).toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="transaction-info-bottom">
                          <span className="transaction-date">{new Date(t.date).toLocaleString()}</span>
                          <span className="transaction-type">{t.description || t.type}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* SUMMARY */}
              <div className="list-footer">
                <span>Showing {filteredTransactions.length} items</span>
                <span>Total Volume: <strong>₹{totalAmount.toLocaleString("en-IN")}</strong></span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Toast Container */}
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default TransactionPage;
