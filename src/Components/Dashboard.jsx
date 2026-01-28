import { useEffect, useState } from "react";
import { useBanking } from "../context/BankingContext";
import "../styles/dashboard.css";
import {
  FiTrendingUp, FiTrendingDown, FiDollarSign,
  FiCreditCard, FiArrowUpRight, FiArrowDownRight, FiEye,
  FiEyeOff, FiLock, FiX, FiCheck, FiPlus, FiSend,
  FiFileText, FiUsers, FiPieChart, FiShoppingBag,
  FiPhone, FiWifi, FiZap, FiChevronDown, FiSun,
  FiMoon, FiAlertCircle, FiCheckCircle, FiClock,
  FiMoreVertical, FiRefreshCw, FiDownload, FiUpload
} from "react-icons/fi";

function formatINR(value) {
  if (typeof value !== "number") return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}

// Add Money Modal Component
function AddMoneyModal({ isOpen, onClose, onAdd }) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const quickAmounts = [500, 1000, 2000, 5000];

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const numAmount = parseFloat(amount);
    if (!amount || numAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      onAdd(numAmount, note);
      setAmount("");
      setNote("");
      setLoading(false);
      onClose();
    }, 800);
  };

  const handleQuickAmount = (amt) => {
    setAmount(amt.toString());
  };

  const handleClose = () => {
    setAmount("");
    setNote("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content add-money-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add Money</h3>
          <button className="modal-close-btn" onClick={handleClose}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="amount">Enter Amount</label>
            <div className="input-with-icon">
              <span className="input-icon">₹</span>
              <input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                min="1"
                step="1"
                autoFocus
                required
              />
            </div>
          </div>

          <div className="quick-amounts">
            {quickAmounts.map((amt) => (
              <button
                key={amt}
                type="button"
                className="quick-amount-btn"
                onClick={() => handleQuickAmount(amt)}
              >
                ₹{amt}
              </button>
            ))}
          </div>

          <div className="form-group">
            <label htmlFor="note">Note (Optional)</label>
            <input
              id="note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note"
              maxLength="100"
            />
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Money"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// PIN Verification Modal Component
function PinModal({ isOpen, onClose, onVerify, error, loading }) {
  const [pin, setPin] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onVerify(pin);
  };

  const handleClose = () => {
    setPin("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content pin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-icon">
            <FiLock />
          </div>
          <h3>Verify PIN</h3>
          <button className="modal-close-btn" onClick={handleClose}>
            <FiX />
          </button>
        </div>

        <p className="modal-description">Enter your 4-digit PIN to view balance</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="password"
              value={pin}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                setPin(value);
              }}
              placeholder="••••"
              maxLength="4"
              className="pin-input"
              required
              autoFocus
            />
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || pin.length !== 4}
            >
              {loading ? "Verifying..." : "Verify"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Success Toast Component
function SuccessToast({ message, isVisible, onClose }) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="success-toast">
      <FiCheck className="toast-icon" />
      <span>{message}</span>
    </div>
  );
}

// Account Lock Screen Component
function AccountLockScreen({ accounts, onUnlock, error }) {
  const [selectedId, setSelectedId] = useState(accounts[0]?.id);
  const [mpin, setMpin] = useState(['', '', '', '']);
  const [localError, setLocalError] = useState('');

  const handleUnlock = () => {
    const pin = mpin.join('');
    if (pin.length !== 4) {
      setLocalError('Enter 4-digit MPIN');
      return;
    }
    onUnlock(selectedId, pin);
  };

  const handleMpinChange = (index, val) => {
    if (!/^\d*$/.test(val)) return;
    const newMpin = [...mpin];
    newMpin[index] = val;
    setMpin(newMpin);

    // Auto-focus next
    if (val && index < 3) {
      const nextInput = document.getElementById(`mpin-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  return (
    <div className="modal-overlay" style={{ display: 'flex', backdropFilter: 'blur(8px)', zIndex: 9999 }}>
      <div className="modal-content" style={{ maxWidth: '400px', width: '90%', textAlign: 'center' }}>
        <div className="modal-icon" style={{ background: '#e0f2fe', color: '#0ea5e9', margin: '0 auto 1rem' }}>
          <FiLock />
        </div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Select Account</h2>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>Choose an account and enter MPIN to access</p>

        <div className="form-group" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
          <label>Select Account</label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', marginTop: '0.5rem' }}
          >
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>
                {acc.bankName} - {acc.accountNumber}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ textAlign: 'left' }}>
          <label>Enter MPIN</label>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', justifyContent: 'center' }}>
            {[0, 1, 2, 3].map(i => (
              <input
                key={i}
                id={`mpin-${i}`}
                type="password"
                maxLength="1"
                value={mpin[i]}
                onChange={(e) => handleMpinChange(i, e.target.value)}
                style={{
                  width: '50px', height: '50px', textAlign: 'center', fontSize: '1.25rem',
                  borderRadius: '0.5rem', border: '1px solid #e2e8f0'
                }}
              />
            ))}
          </div>
        </div>

        {(error || localError) && (
          <div style={{ color: '#ef4444', marginTop: '1rem', fontSize: '0.875rem' }}>
            {error || localError}
          </div>
        )}

        <button
          className="btn-primary"
          onClick={handleUnlock}
          style={{ width: '100%', marginTop: '2rem', padding: '1rem' }}
        >
          Unlock Access
        </button>
      </div>
    </div>
  );
}

function Dashboard({ darkMode, setDarkMode }) {
  const { state, deposit, getTotalBalance, loginAccount, logoutAccount } = useBanking();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [balanceVisible, setBalanceVisible] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [pinError, setPinError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState("savings");
  // darkMode is now a prop
  const [recentBeneficiaries, setRecentBeneficiaries] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const storedUser = localStorage.getItem("epic_logged_user");

    if (storedUser) {
      try {
        const parsedData = JSON.parse(storedUser);
        if (isMounted) {
          setData(parsedData);
        }
        return;
      } catch (e) {
        console.warn("localStorage data invalid, trying API");
      }
    }

    async function loadAPI() {
      try {
        const res = await fetch("/dashboardData.json", { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed to load dashboard data (${res.status})`);
        const json = await res.json();
        if (isMounted) {
          setData(Array.isArray(json) ? json[0] : json);
        }
      } catch (e) {
        if (isMounted) setError(e?.message || "Failed to load dashboard data");
      }
    }

    loadAPI();
    return () => { isMounted = false; };
  }, []);
   
   //Load Recent Benefiacries
  useEffect(() => {
    const loadBeneficiaries = () => {
      const stored = localStorage.getItem("recent_beneficiaries");
      if (stored) {
        try {
          const beneficiaries = JSON.parse(stored);
          setRecentBeneficiaries(beneficiaries.slice(0, 4));
        } catch (e) {
          console.error("Failed to load beneficiaries:", e);
        }
      }
    };
    loadBeneficiaries();
  }, []);

  const handleShowBalance = () => {
    setShowPinModal(true);
    setPinError("");
  };

  const verifyPin = (enteredPin) => {
    setVerifying(true);
    setPinError("");

    setTimeout(() => {
      const storedPin = data?.user?.pin;
      const storedMpin = data?.user?.mpin;

      if (storedPin === enteredPin || storedMpin === enteredPin) {
        setBalanceVisible(true);
        setShowPinModal(false);
        setPinError("");
      } else {
        setPinError("Invalid PIN. Please try again.");
      }
      setVerifying(false);
    }, 800);
  };

  const handleAddMoney = (amount, note) => {
    const account = state.accounts[0];

    if (!account) {
      const updatedData = {
        ...data,
        balance: {
          ...data.balance,
          available: (data.balance?.available || 0) + amount
        }
      };
      setData(updatedData);
      localStorage.setItem("epic_logged_user", JSON.stringify(updatedData));
    } else {
      const result = deposit(account.id, amount, note || 'Money added via dashboard');

      if (result.success) {
        const updatedData = {
          ...data,
          balance: {
            ...data.balance,
            available: result.balanceAfter
          }
        };
        setData(updatedData);
      }
    }

    setSuccessMessage(`₹${amount.toLocaleString('en-IN')} added successfully!`);
    setShowSuccessToast(true);
  };

  const handleQuickAction = (action) => {
    const event = new CustomEvent('navigateTo', { detail: action });
    window.dispatchEvent(event);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  if (error) {
    return (
      <div className="dashboard-loading">
        <div className="error-card">{error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  // Use active account data if available
  const user = state.user || data?.user;
  const account = state.activeAccount || data?.account;
  const dataBalance = data?.balance;
  const transactions = state.transactions || data?.transactions || []; // Global transactions for now, or filter by account

  // If we have accounts but no active account selected, return NULL (parent or valid lock screen handles this)
  // But since we are inside Dashboard, we must render the LOCK SCREEN here if needed.
  const showLockScreen = state.accounts.length > 0 && !state.activeAccount;

  const available = state.activeAccount ? state.activeAccount.balance : (state.accounts.length > 0 ? 0 : (dataBalance?.available || 0));

  const totals = transactions.reduce(
    (acc, t) => {
      const amt = typeof t?.amount === "number" ? t.amount : 0;
      if (t?.type === "Credit") acc.income += amt;
      if (t?.type === "Debit") acc.expenses += amt;
      return acc;
    },
    { income: 0, expenses: 0 }
  );

  const recentTransactions = transactions.slice(0, 3);

  // Calculate investments value (mock data)
  const investmentsValue = 125000;

  // LOCK SCREEN RENDER
  if (showLockScreen) {
    return (
      <div className={`modern-dashboard ${darkMode ? 'dark-mode' : ''}`}>
        <AccountLockScreen
          accounts={state.accounts}
          onUnlock={(id, mpin) => {
            const res = loginAccount(id, mpin);
            if (!res.success) setPinError(res.error);
          }}
          error={pinError}
        />
      </div>
    );
  }

  return (
    <div className={`modern-dashboard ${darkMode ? 'dark-mode' : ''}`}>
      <PinModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onVerify={verifyPin}
        error={pinError}
        loading={verifying}
      />

      <AddMoneyModal
        isOpen={showAddMoneyModal}
        onClose={() => setShowAddMoneyModal(false)}
        onAdd={handleAddMoney}
      />

      <SuccessToast
        message={successMessage}
        isVisible={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
      />

      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1 className="greeting">{getGreeting()}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="subtext">Here's your financial overview</p>
        </div>
        <div className="header-right">
          {state.activeAccount && (
            <div className="account-info-pill">
              <span className="pill-dot"></span>
              <span>{state.activeAccount.accountNumber}</span>
            </div>
          )}
          <button
            className="action-btn-outline"
            onClick={logoutAccount}
            title="Switch Account"
            style={{ marginRight: '1rem', padding: '0.5rem 1rem', borderRadius: '2rem', border: '1px solid #ccc', background: 'transparent' }}
          >
            <FiRefreshCw style={{ marginRight: '0.5rem' }} /> Switch Account
          </button>

          <button
            className="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? "Light Mode" : "Dark Mode"}
          >
            {darkMode ? <FiSun /> : <FiMoon />}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card balance-card">
          <div className="card-header">
            <div className="card-icon balance-icon">
              <FiDollarSign />
            </div>
            <button
              className="visibility-toggle"
              onClick={() => balanceVisible ? setBalanceVisible(false) : handleShowBalance()}
            >
              {balanceVisible ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          <div className="card-content">
            <p className="card-label">Available Balance</p>
            {balanceVisible ? (
              <h2 className="card-value">{formatINR(available)}</h2>
            ) : (
              <h2 className="card-value masked">● ● ● ● ● ●</h2>
            )}
            <div className="card-trend positive">
              <FiTrendingUp />
              <span>+12.5% from last month</span>
            </div>
          </div>
        </div>

        <div className="summary-card income-card">
          <div className="card-header">
            <div className="card-icon income-icon">
              <FiArrowDownRight />
            </div>
            <button className="card-menu">
              <FiMoreVertical />
            </button>
          </div>
          <div className="card-content">
            <p className="card-label">Total Income</p>
            <h2 className="card-value">{formatINR(totals.income)}</h2>
            <div className="card-trend positive">
              <FiTrendingUp />
              <span>+8.2% this month</span>
            </div>
          </div>
        </div>

        <div className="summary-card expense-card">
          <div className="card-header">
            <div className="card-icon expense-icon">
              <FiArrowUpRight />
            </div>
            <button className="card-menu">
              <FiMoreVertical />
            </button>
          </div>
          <div className="card-content">
            <p className="card-label">Total Spending</p>
            <h2 className="card-value">{formatINR(totals.expenses)}</h2>
            <div className="card-trend negative">
              <FiTrendingDown />
              <span>-5.3% this month</span>
            </div>
          </div>
        </div>

        <div className="summary-card investment-card">
          <div className="card-header">
            <div className="card-icon investment-icon">
              <FiPieChart />
            </div>
            <button className="card-menu">
              <FiMoreVertical />
            </button>
          </div>
          <div className="card-content">
            <p className="card-label">Investments Value</p>
            <h2 className="card-value">{formatINR(investmentsValue)}</h2>
            <div className="card-trend positive">
              <FiTrendingUp />
              <span>+15.7% returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Left Column */}
        <div className="dashboard-left">
          {/* Charts Section */}
          <div className="charts-section">
            <div className="chart-card spending-chart">
              <div className="chart-header">
                <h3>Spending Breakdown</h3>
                <select className="chart-period">
                  <option>This Month</option>
                  <option>Last Month</option>
                  <option>Last 3 Months</option>
                </select>
              </div>
              <div className="chart-content">
                <div className="donut-chart">
                  <svg viewBox="0 0 200 200" className="donut-svg">
                    <circle cx="100" cy="100" r="80" fill="none" stroke="#e5e7eb" strokeWidth="30" />
                    <circle cx="100" cy="100" r="80" fill="none" stroke="#3b82f6" strokeWidth="30"
                      strokeDasharray="251.2 251.2" strokeDashoffset="62.8" transform="rotate(-90 100 100)" />
                    <circle cx="100" cy="100" r="80" fill="none" stroke="#10b981" strokeWidth="30"
                      strokeDasharray="125.6 376.8" strokeDashoffset="-188.4" transform="rotate(-90 100 100)" />
                    <circle cx="100" cy="100" r="80" fill="none" stroke="#f59e0b" strokeWidth="30"
                      strokeDasharray="75.36 427.04" strokeDashoffset="-314" transform="rotate(-90 100 100)" />
                  </svg>
                  <div className="donut-center">
                    <p className="donut-label">Total</p>
                    <p className="donut-value">{formatINR(totals.expenses)}</p>
                  </div>
                </div>
                <div className="chart-legend">
                  <div className="legend-item">
                    <span className="legend-dot" style={{ background: '#3b82f6' }}></span>
                    <span className="legend-label">Shopping</span>
                    <span className="legend-value">40%</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot" style={{ background: '#10b981' }}></span>
                    <span className="legend-label">Food & Dining</span>
                    <span className="legend-value">30%</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot" style={{ background: '#f59e0b' }}></span>
                    <span className="legend-label">Bills & Utilities</span>
                    <span className="legend-value">20%</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot" style={{ background: '#e5e7eb' }}></span>
                    <span className="legend-label">Others</span>
                    <span className="legend-value">10%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="chart-card income-expense-chart">
              <div className="chart-header">
                <h3>Income vs Expense</h3>
                <select className="chart-period">
                  <option>Last 6 Months</option>
                  <option>Last Year</option>
                </select>
              </div>
              <div className="chart-content">
                <div className="line-chart">
                  <svg viewBox="0 0 400 200" className="line-svg">
                    <defs>
                      <linearGradient id="incomeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="expenseGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* Grid lines */}
                    <line x1="0" y1="40" x2="400" y2="40" stroke="#e5e7eb" strokeWidth="1" opacity="0.5" />
                    <line x1="0" y1="80" x2="400" y2="80" stroke="#e5e7eb" strokeWidth="1" opacity="0.5" />
                    <line x1="0" y1="120" x2="400" y2="120" stroke="#e5e7eb" strokeWidth="1" opacity="0.5" />
                    <line x1="0" y1="160" x2="400" y2="160" stroke="#e5e7eb" strokeWidth="1" opacity="0.5" />

                    {/* Income line */}
                    <path d="M 0 120 L 66 100 L 133 80 L 200 90 L 267 60 L 333 70 L 400 50"
                      fill="url(#incomeGradient)" stroke="none" />
                    <path d="M 0 120 L 66 100 L 133 80 L 200 90 L 267 60 L 333 70 L 400 50"
                      fill="none" stroke="#10b981" strokeWidth="3" />

                    {/* Expense line */}
                    <path d="M 0 140 L 66 130 L 133 120 L 200 125 L 267 110 L 333 115 L 400 100"
                      fill="url(#expenseGradient)" stroke="none" />
                    <path d="M 0 140 L 66 130 L 133 120 L 200 125 L 267 110 L 333 115 L 400 100"
                      fill="none" stroke="#ef4444" strokeWidth="3" />
                  </svg>
                </div>
                <div className="chart-legend horizontal">
                  <div className="legend-item">
                    <span className="legend-dot" style={{ background: '#10b981' }}></span>
                    <span className="legend-label">Income</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot" style={{ background: '#ef4444' }}></span>
                    <span className="legend-label">Expense</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="transactions-card">
            <div className="card-header-row">
              <h3>Recent Transactions</h3>
              <button className="view-all-btn" onClick={() => handleQuickAction('transactions')}>
                View All
              </button>
            </div>
            <div className="transactions-list">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((txn) => {
                  const isCredit = txn.type === "Credit" || txn.type === "DEPOSIT"; // FIX: Treat DEPOSIT as credit
                  return (
                    <div key={txn.id} className="transaction-row">
                      <div className={`transaction-icon ${isCredit ? "credit" : "debit"}`}>
                        {isCredit ? <FiArrowDownRight /> : <FiArrowUpRight />}
                      </div>
                      <div className="transaction-info">
                        <h4 className="transaction-title">{txn.title}</h4>
                        <span className="transaction-date">{txn.date}</span>
                      </div>
                      <div className={`transaction-amount ${isCredit ? "credit" : "debit"}`}>
                        {isCredit ? "+" : "-"} {formatINR(txn.amount)}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="no-transactions">
                  <p>No recent transactions</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="dashboard-right">
          {/* Smart Insights & Alerts */}
          <div className="insights-card">
            <h3>Insights & Alerts</h3>
            <div className="insights-list">
              <div className="insight-item success">
                <div className="insight-icon">
                  <FiCheckCircle />
                </div>
                <div className="insight-content">
                  <h4>Great Savings!</h4>
                  <p>You saved 25% more this month</p>
                </div>
              </div>
              <div className="insight-item warning">
                <div className="insight-icon">
                  <FiClock />
                </div>
                <div className="insight-content">
                  <h4>Bill Reminder</h4>
                  <p>Credit card payment due in 3 days</p>
                </div>
              </div>
              <div className="insight-item info">
                <div className="insight-icon">
                  <FiAlertCircle />
                </div>
                <div className="insight-content">
                  <h4>Spending Alert</h4>
                  <p>Shopping expenses 40% higher</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions-card">
            <h3>Quick Actions</h3>
            <div className="quick-actions-grid">
              <button className="quick-action-btn" onClick={() => handleQuickAction('transfer')}>
                <div className="action-icon">
                  <FiSend />
                </div>
                <span>Transfer</span>
              </button>
              <button className="quick-action-btn" onClick={() => handleQuickAction('transfer')}>
                <div className="action-icon">
                  <FiFileText />
                </div>
                <span>Pay Bills</span>
              </button>
              <button className="quick-action-btn" onClick={() => setShowAddMoneyModal(true)}>
                <div className="action-icon">
                  <FiPlus />
                </div>
                <span>Add Money</span>
              </button>
              <button className="quick-action-btn" onClick={() => handleQuickAction('investments')}>
                <div className="action-icon">
                  <FiPieChart />
                </div>
                <span>Invest</span>
              </button>
            </div>
          </div>

          {/* Recent Beneficiaries */}
          {recentBeneficiaries.length > 0 && (
            <div className="beneficiaries-card">
              <div className="card-header-row">
                <h3>Recent Beneficiaries</h3>
                <button className="add-btn" onClick={() => handleQuickAction('transfer')}>
                  <FiPlus />
                </button>
              </div>
              <div className="beneficiaries-list">
                {recentBeneficiaries.map((beneficiary, index) => (
                  <div key={index} className="beneficiary-item" onClick={() => handleQuickAction('transfer')}>
                    <div className="beneficiary-avatar">
                      {beneficiary.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="beneficiary-info">
                      <h4>{beneficiary.name}</h4>
                      <p>{beneficiary.bank || 'Bank'}</p>
                    </div>
                    <button className="beneficiary-action">
                      <FiSend />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
