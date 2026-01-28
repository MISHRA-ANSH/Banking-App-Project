import React, { useState, useEffect } from 'react';
import { useBanking } from '../context/BankingContext';
import "../styles/AccountsCards.css"
import {
  FiCreditCard,
  FiPlus,
  FiEye,
  FiEyeOff,
  FiLock,
  FiRefreshCw,
  FiTrash2,
  FiEdit2,
  FiCopy,
  FiBarChart2,
  FiTrendingUp,
  FiDollarSign,
  FiCalendar,
  FiShield,
  FiBell,
  FiSettings,
  FiDownload,
  FiFilter,
  FiSearch,
  FiChevronRight,
  FiCheckCircle,
  FiAlertCircle,
  FiCreditCard as FiCard,
  FiSmartphone,
  FiGlobe,
  FiShoppingBag,
  FiCoffee,
  FiHome,
  FiTruck,
  FiHeart,
  FiBook,
  FiMusic,
  FiVideo,
  FiX
} from 'react-icons/fi';

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

const AccountsCards = ({ onBack, darkMode }) => {
  /* Updated to use Context Data */
  const { state, createAccount, deleteAccount, getTotalBalance, deposit, withdraw, updateAccountMpin, toggleAccountStatus } = useBanking();
  const [activeTab, setActiveTab] = useState('accounts');
  const [showCardNumber, setShowCardNumber] = useState({});
  const [cards, setCards] = useState([]);

  // Toast State
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Transaction Modal State
  const [showTransModal, setShowTransModal] = useState(false);
  const [transType, setTransType] = useState('deposit'); // 'deposit' or 'withdraw'
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [transAmount, setTransAmount] = useState('');
  const [transError, setTransError] = useState('');

  // Use accounts directly from Context
  const accounts = state.accounts;
  const transactions = state.transactions;

  // Stats derivation
  const stats = {
    totalBalance: getTotalBalance(),
    totalCredit: cards.reduce((sum, card) => sum + (card.type === 'credit' ? card.limit : 0), 0),
    cardsActive: cards.filter(card => card.status === 'active').length,
    monthlySpent: transactions
      .filter(t => t.amount < 0 && new Date(t.date).getMonth() === new Date().getMonth())
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
  };

  useEffect(() => {
    // Still load cards from local storage as they aren't in main context yet (out of scope for now, keeping existing logic)
    const storedCards = localStorage.getItem('user_cards');
    if (storedCards) {
      setCards(JSON.parse(storedCards));
    } else {
      // Default cards if none
      setCards([
        {
          id: 1,
          name: 'Platinum Credit Card',
          type: 'credit',
          cardNumber: '1234 5678 9012 3456',
          expiry: '12/26',
          cvv: '123',
          bank: 'Global Bank',
          balance: 15000,
          limit: 100000,
          available: 85000,
          status: 'active',
          color: '#667eea',
          transactions: 45,
          rewards: 12500
        }
      ]);
    }
  }, []);

  // Add Account Modal State
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [newAccountData, setNewAccountData] = useState({
    bankName: 'Epic Bank',
    accountType: 'Savings',
    initialBalance: '',
    mpin: ''
  });

  // Manage Account Modal State
  const [showManageModal, setShowManageModal] = useState(false);
  const [selectedAccountForManagement, setSelectedAccountForManagement] = useState(null);
  const [manageMode, setManageMode] = useState('menu'); // 'menu', 'change-mpin', 'forgot-mpin', 'delete-confirm'
  const [mpinInputs, setMpinInputs] = useState({ oldMpin: '', newMpin: '', confirmMpin: '', loginPin: '' });
  const [manageError, setManageError] = useState('');
  const [manageSuccess, setManageSuccess] = useState('');
  const [showAccountSelectionModal, setShowAccountSelectionModal] = useState(false);

  const handleAddAccount = () => {
    setShowAddAccountModal(true);
  };

  const handleAddAccountSubmit = () => {
    // Basic Validation
    if (!newAccountData.bankName || !newAccountData.mpin) {
      alert("Please fill in all required fields");
      return;
    }

    if (newAccountData.mpin.length !== 4 || isNaN(newAccountData.mpin)) {
      alert("MPIN must be a 4-digit number");
      return;
    }

    const accountData = {
      accountNumber: Math.floor(100000000000 + Math.random() * 900000000000).toString(),
      accountType: newAccountData.accountType,
      bankName: newAccountData.bankName,
      initialBalance: newAccountData.initialBalance || 0,
      mpin: newAccountData.mpin
    };

    const result = createAccount(accountData);

    if (result.success) {
      setShowAddAccountModal(false);
      setNewAccountData({
        bankName: 'Epic Bank',
        accountType: 'Savings',
        initialBalance: '',
        mpin: ''
      });
      alert(`Account Added Successfully!\nAccount Number: ${accountData.accountNumber}`);
    } else {
      alert(`Failed to create account: ${result.error}`);
    }
  };

  const handleAddCard = () => {
    const newCard = {
      id: cards.length + 1,
      name: 'New Credit Card',
      type: 'credit',
      cardNumber: `XXXX XXXX XXXX ${Math.floor(1000 + Math.random() * 9000)}`,
      expiry: `${String(new Date().getMonth() + 1).padStart(2, '0')}/${new Date().getFullYear() + 3}`,
      cvv: '***',
      bank: 'Global Bank',
      balance: 0,
      limit: 50000,
      available: 50000,
      status: 'active',
      color: '#8b5cf6',
      transactions: 0,
      rewards: 0
    };
    const updatedCards = [...cards, newCard];
    setCards(updatedCards);
    localStorage.setItem('user_cards', JSON.stringify(updatedCards));
  };

  const handleBlockCard = (cardId) => {
    if (window.confirm('Are you sure you want to block this card?')) {
      const updatedCards = cards.map(card =>
        card.id === cardId ? { ...card, status: card.status === 'blocked' ? 'active' : 'blocked' } : card
      );
      setCards(updatedCards);
      localStorage.setItem('user_cards', JSON.stringify(updatedCards));
    }
  };

  const handleDeleteCard = (cardId) => {
    if (window.confirm('Are you sure you want to delete this card?')) {
      const updatedCards = cards.filter(card => card.id !== cardId);
      setCards(updatedCards);
      localStorage.setItem('user_cards', JSON.stringify(updatedCards));
    }
  };

  const handleCopyCardNumber = (cardNumber) => {
    navigator.clipboard.writeText(cardNumber.replace(/\s/g, ''));
    alert('Card number copied to clipboard!');
  };

  const toggleCardNumber = (cardId) => {
    setShowCardNumber(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };


  const handleManageClick = (account) => {
    setSelectedAccountForManagement(account);
    setManageMode('menu');
    setMpinInputs({ oldMpin: '', newMpin: '', confirmMpin: '', loginPin: '' });
    setManageError('');
    setManageSuccess('');
    setShowManageModal(true);
  };

  const handleChangeMpin = () => {
    setManageError('');
    setManageSuccess('');

    if (mpinInputs.newMpin.length !== 4 || isNaN(mpinInputs.newMpin)) {
      setManageError('New MPIN must be 4 digits');
      return;
    }
    if (mpinInputs.newMpin !== mpinInputs.confirmMpin) {
      setManageError('New MPINs do not match');
      return;
    }

    // Verify Old MPIN (In a real app, backend would do this, here we check locally or trust context)
    // Since context updateAccountMpin doesn't force old MPIN check, we can check it here against local state if we want, 
    // but for "Change MPIN" flow it's best practice. Context verifyAccountMpin is available.
    // But verifyAccountMpin is in context, let's assume we can use it or just rely on the inputs.
    // Wait, I didn't export verifyAccountMpin in the hook destructuring in step 1.
    // Let's assume the user knows the old MPIN if they are in this flow, or rely on 'Forgot MPIN'

    // For now, let's just proceed with update, but assuming we want to optionally check old MPIN if we had access.
    // Ideally updateAccountMpin should take oldMpin, but I implemented it to just take newMpin (admin/override style).
    // So let's just check equality with current account mpin from state if possible.
    if (String(selectedAccountForManagement.mpin) !== String(mpinInputs.oldMpin)) {
      setManageError('Incorrect Old MPIN');
      return;
    }

    const result = updateAccountMpin(selectedAccountForManagement.id, mpinInputs.newMpin);
    if (result.success) {
      setManageSuccess('MPIN Changed Successfully');
      setTimeout(() => setShowManageModal(false), 1500);
    } else {
      setManageError(result.error);
    }
  };

  const handleForgotMpin = () => {
    setManageError('');
    setManageSuccess('');

    // Verify Login PIN (Profile PIN)
    // state.user.pin is the profile PIN
    if (String(state.user?.pin) !== String(mpinInputs.loginPin)) {
      setManageError('Incorrect Login PIN');
      return;
    }

    if (mpinInputs.newMpin.length !== 4 || isNaN(mpinInputs.newMpin)) {
      setManageError('New MPIN must be 4 digits');
      return;
    }
    if (mpinInputs.newMpin !== mpinInputs.confirmMpin) {
      setManageError('New MPINs do not match');
      return;
    }

    const result = updateAccountMpin(selectedAccountForManagement.id, mpinInputs.newMpin);
    if (result.success) {
      setManageSuccess('MPIN Reset Successfully');
      addToast('MPIN Reset Successfully', 'success');
      setTimeout(() => setShowManageModal(false), 1500);
    } else {
      setManageError(result.error);
      addToast(result.error, 'error');
    }
  };

  const handleDeleteAccountConfirm = () => {
    if (selectedAccountForManagement.balance > 0) {
      setManageError('Cannot delete account with available balance. Please withdraw funds first.');
      return;
    }

    const result = deleteAccount(selectedAccountForManagement.id);
    if (result.success) {
      setShowManageModal(false);
      addToast('Account deleted successfully', 'success');
    } else {
      setManageError(result.error);
      addToast(result.error, 'error');
    }
  };

  const handleToggleStatus = () => {
    const result = toggleAccountStatus(selectedAccountForManagement.id);
    if (result.success) {
      setManageSuccess(result.message);
      addToast(result.message, 'success');
      setSelectedAccountForManagement(prev => ({ ...prev, status: prev.status === 'active' ? 'deactivated' : 'active' }));
    } else {
      setManageError(result.error);
      addToast(result.error, 'error');
    }
  };



  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case 'shopping': return <FiShoppingBag />;
      case 'food & drink': return <FiCoffee />;
      case 'entertainment': return <FiVideo />;
      case 'income': return <FiTrendingUp />;
      case 'transport': return <FiTruck />;
      case 'electronics': return <FiSmartphone />;
      case 'health': return <FiHeart />;
      case 'education': return <FiBook />;
      case 'bills': return <FiHome />;
      case 'music': return <FiMusic />;
      default: return <FiShoppingBag />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#06d6a0';
      case 'blocked': return '#ef476f';
      case 'expiring': return '#f59e0b';
      case 'pending': return '#f59e0b';
      case 'completed': return '#06d6a0';
      default: return '#666';
    }
  };

  const tabs = [
    { id: 'accounts', label: 'Accounts', icon: <FiCreditCard /> },
    { id: 'cards', label: 'Cards', icon: <FiCard /> },
    { id: 'transactions', label: 'Transactions', icon: <FiBarChart2 /> },
    { id: 'analytics', label: 'Analytics', icon: <FiTrendingUp /> }
  ];

  const renderManageAccountModal = () => {
    if (!showManageModal || !selectedAccountForManagement) return null;

    const modalStyle = {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100
    };

    const contentStyle = {
      background: darkMode ? '#1e293b' : 'white', padding: '2rem', borderRadius: '1rem', width: '400px',
      color: darkMode ? '#f8fafc' : 'inherit', maxHeight: '90vh', overflowY: 'auto'
    };

    const inputStyle = {
      width: '100%', padding: '0.75rem', borderRadius: '0.5rem',
      border: '1px solid #ccc', backgroundColor: darkMode ? '#0f172a' : 'white',
      color: darkMode ? 'white' : 'black', marginBottom: '1rem'
    };

    return (
      <div style={modalStyle}>
        <div style={contentStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3>Manage Account</h3>
            <button onClick={() => setShowManageModal(false)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
          </div>

          {manageError && <div style={{ background: '#fee2e2', color: '#ef476f', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>{manageError}</div>}
          {manageSuccess && <div style={{ background: '#dcfce7', color: '#06d6a0', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>{manageSuccess}</div>}

          <div style={{ marginBottom: '1rem', padding: '1rem', background: darkMode ? '#0f172a' : '#f1f5f9', borderRadius: '0.5rem' }}>
            <p style={{ margin: 0, fontWeight: 'bold' }}>{selectedAccountForManagement.bankName} - {selectedAccountForManagement.accountType}</p>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>{selectedAccountForManagement.accountNumber}</p>
          </div>

          {manageMode === 'menu' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button
                onClick={() => setManageMode('change-mpin')}
                style={{ padding: '1rem', textAlign: 'left', borderRadius: '0.5rem', border: '1px solid #e2e8f0', background: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}
              >
                <FiLock /> Change MPIN
              </button>
              <button
                onClick={() => setManageMode('forgot-mpin')}
                style={{ padding: '1rem', textAlign: 'left', borderRadius: '0.5rem', border: '1px solid #e2e8f0', background: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}
              >
                <FiRefreshCw /> Forgot MPIN
              </button>
              <button
                onClick={handleToggleStatus}
                style={{ padding: '1rem', textAlign: 'left', borderRadius: '0.5rem', border: '1px solid #e2e8f0', background: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}
              >
                {selectedAccountForManagement.status === 'active' ? <FiEyeOff /> : <FiEye />}
                {selectedAccountForManagement.status === 'active' ? 'Deactivate Account' : 'Activate Account'}
              </button>
              <button
                onClick={() => setManageMode('delete-confirm')}
                style={{ padding: '1rem', textAlign: 'left', borderRadius: '0.5rem', border: '1px solid #fee2e2', background: '#fee2e2', color: '#ef476f', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}
              >
                <FiTrash2 /> Delete Account
              </button>
            </div>
          )}

          {manageMode === 'change-mpin' && (
            <div>
              <h4>Change MPIN</h4>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Old MPIN</label>
              <input type="password" maxLength="4" placeholder="****" style={inputStyle} value={mpinInputs.oldMpin} onChange={e => setMpinInputs({ ...mpinInputs, oldMpin: e.target.value })} />

              <label style={{ display: 'block', marginBottom: '0.5rem' }}>New MPIN</label>
              <input type="password" maxLength="4" placeholder="****" style={inputStyle} value={mpinInputs.newMpin} onChange={e => setMpinInputs({ ...mpinInputs, newMpin: e.target.value })} />

              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Confirm New MPIN</label>
              <input type="password" maxLength="4" placeholder="****" style={inputStyle} value={mpinInputs.confirmMpin} onChange={e => setMpinInputs({ ...mpinInputs, confirmMpin: e.target.value })} />

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button onClick={() => setManageMode('menu')} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: 'none', background: '#e2e8f0', cursor: 'pointer' }}>Back</button>
                <button onClick={handleChangeMpin} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: 'none', background: '#3b82f6', color: 'white', cursor: 'pointer' }}>Update MPIN</button>
              </div>
            </div>
          )}

          {manageMode === 'forgot-mpin' && (
            <div>
              <h4>Reset MPIN</h4>
              <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Enter your Login PIN to verification.</p>

              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Login PIN</label>
              <input type="password" maxLength="6" placeholder="Login PIN" style={inputStyle} value={mpinInputs.loginPin} onChange={e => setMpinInputs({ ...mpinInputs, loginPin: e.target.value })} />

              <label style={{ display: 'block', marginBottom: '0.5rem' }}>New MPIN</label>
              <input type="password" maxLength="4" placeholder="****" style={inputStyle} value={mpinInputs.newMpin} onChange={e => setMpinInputs({ ...mpinInputs, newMpin: e.target.value })} />

              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Confirm New MPIN</label>
              <input type="password" maxLength="4" placeholder="****" style={inputStyle} value={mpinInputs.confirmMpin} onChange={e => setMpinInputs({ ...mpinInputs, confirmMpin: e.target.value })} />

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button onClick={() => setManageMode('menu')} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: 'none', background: '#e2e8f0', cursor: 'pointer' }}>Back</button>
                <button onClick={handleForgotMpin} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: 'none', background: '#3b82f6', color: 'white', cursor: 'pointer' }}>Reset MPIN</button>
              </div>
            </div>
          )}

          {manageMode === 'delete-confirm' && (
            <div style={{ textAlign: 'center' }}>
              <FiAlertCircle size={48} color="#ef476f" style={{ marginBottom: '1rem' }} />
              <h4>Delete Account?</h4>
              <p>Are you sure you want to delete this account? This action cannot be undone.</p>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button onClick={() => setManageMode('menu')} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: 'none', background: '#e2e8f0', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleDeleteAccountConfirm} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: 'none', background: '#ef476f', color: 'white', cursor: 'pointer' }}>Delete</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAccountSelectionModal = () => {
    if (!showAccountSelectionModal) return null;

    const modalStyle = {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100
    };

    const contentStyle = {
      background: darkMode ? '#1e293b' : 'white', padding: '2rem', borderRadius: '1rem', width: '400px',
      color: darkMode ? '#f8fafc' : 'inherit', maxHeight: '80vh', overflowY: 'auto'
    };

    return (
      <div style={modalStyle}>
        <div style={contentStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3>Select Account to Manage</h3>
            <button onClick={() => setShowAccountSelectionModal(false)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {accounts.map(acc => (
              <div
                key={acc.id}
                onClick={() => {
                  handleManageClick(acc);
                  setShowAccountSelectionModal(false);
                }}
                style={{
                  padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', cursor: 'pointer',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: darkMode ? '#0f172a' : 'white',
                  opacity: acc.status === 'deactivated' ? 0.7 : 1
                }}
              >
                <div>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>{acc.bankName}</p>
                  <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8 }}>{acc.accountNumber}</p>
                </div>
                <FiSettings />
              </div>
            ))}
            {accounts.length === 0 && <p>No accounts found.</p>}
          </div>
        </div>
      </div>
    );
  };



  const renderAccounts = () => (
    <div className="accounts-section">
      <div className="section-header">
        <h3>Bank Accounts</h3>
        <button className="add-button" onClick={handleAddAccount}>
          <FiPlus /> Add Account
        </button>
      </div>

      <div className="accounts-grid">
        {accounts.map(account => (
          <div key={account.id} className="account-card">
            <div className="account-header">
              <div className="account-icon">
                <FiCreditCard />
              </div>
              <div className="account-info">
                <h4>{account.name}</h4>
                <p>{account.bank} • {account.type}</p>
              </div>
              <span className={`account-status ${account.status}`}>
                {account.status}
              </span>
            </div>

            <div className="account-details">
              <div className="detail-row">
                <span className="detail-label">Account Number</span>
                <span className="detail-value">{account.accountNumber}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Available Balance</span>
                <span className="detail-value balance">
                  {formatCurrency(account.balance)}
                </span>
              </div>
              {account.interestRate && (
                <div className="detail-row">
                  <span className="detail-label">Interest Rate</span>
                  <span className="detail-value rate">
                    {account.interestRate}%
                  </span>
                </div>
              )}
            </div>

            <div className="account-actions">
              <button
                className="action-btn view-btn"
                onClick={() => {
                  setTransType('deposit');
                  setSelectedAccountId(account.id);
                  setShowTransModal(true);
                }}
              >
                <FiPlus /> Deposit
              </button>
              <button
                className="action-btn transfer-btn"
                onClick={() => {
                  setTransType('withdraw');
                  setSelectedAccountId(account.id);
                  setShowTransModal(true);
                }}
              >
                <FiDollarSign /> Withdraw
              </button>
              <button
                className="action-btn settings-btn"
                style={{ background: '#e2e8f0', color: '#1e293b' }}
                onClick={() => handleManageClick(account)}
              >
                <FiSettings /> Manage
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Manage Account Modal */}
      {renderManageAccountModal()}

      {/* Transaction Modal */}
      {showTransModal && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="modal-content" style={{
            background: darkMode ? '#1e293b' : 'white', padding: '2rem', borderRadius: '1rem', width: '400px',
            color: darkMode ? '#f8fafc' : 'inherit'
          }}>
            <h3>{transType === 'deposit' ? 'Deposit Funds' : 'Withdraw Funds'}</h3>

            <div style={{ margin: '1.5rem 0' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Amount</label>
              <input
                type="number"
                value={transAmount}
                onChange={(e) => {
                  setTransAmount(e.target.value);
                  setTransError('');
                }}
                placeholder="Enter amount"
                style={{
                  width: '100%', padding: '0.75rem', borderRadius: '0.5rem',
                  border: '1px solid #ccc', backgroundColor: darkMode ? '#0f172a' : 'white',
                  color: darkMode ? 'white' : 'black'
                }}
              />
              {transError && <p style={{ color: '#ef476f', marginTop: '0.5rem', fontSize: '0.875rem' }}>{transError}</p>}
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowTransModal(false);
                  setTransAmount('');
                  setTransError('');
                }}
                style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', background: '#94a3b8', color: 'white', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!transAmount || parseFloat(transAmount) <= 0) {
                    setTransError('Please enter a valid amount');
                    return;
                  }

                  let result;
                  if (transType === 'deposit') {
                    result = deposit(selectedAccountId, parseFloat(transAmount));
                  } else {
                    result = withdraw(selectedAccountId, parseFloat(transAmount));
                  }

                  if (result.success) {
                    setShowTransModal(false);
                    setTransAmount('');
                    alert(`${transType === 'deposit' ? 'Deposit' : 'Withdrawal'} successful!`);
                  } else {
                    setTransError(result.error);
                  }
                }}
                style={{
                  padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none',
                  background: transType === 'deposit' ? '#06d6a0' : '#ef476f',
                  color: 'white', cursor: 'pointer'
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="quick-actions">
        <h4>Quick Actions</h4>
        <div className="actions-grid">
          <button className="quick-action" onClick={handleAddAccount}>
            <FiPlus /> Open New Account
          </button>
          <button className="quick-action">
            <FiBarChart2 /> View Statements
          </button>
          <button className="quick-action" onClick={() => setShowAccountSelectionModal(true)}>
            <FiSettings /> Manage Accounts
          </button>
          <button className="quick-action">
            <FiDownload /> Export Statements
          </button>
        </div>
      </div>

      {/* Account Selection Modal */}
      {renderAccountSelectionModal()}

      {showAddAccountModal && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="modal-content" style={{
            background: darkMode ? '#1e293b' : 'white', padding: '2rem', borderRadius: '1rem', width: '400px',
            color: darkMode ? '#f8fafc' : 'inherit'
          }}>
            <h3>Add New Account</h3>

            <div style={{ margin: '1.5rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Bank Name</label>
                <input
                  type="text"
                  value={newAccountData.bankName}
                  onChange={(e) => setNewAccountData({ ...newAccountData, bankName: e.target.value })}
                  placeholder="e.g. HDFC Bank"
                  className="form-input"
                  style={{
                    width: '100%', padding: '0.75rem', borderRadius: '0.5rem',
                    border: '1px solid #ccc', backgroundColor: darkMode ? '#0f172a' : 'white',
                    color: darkMode ? 'white' : 'black'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Account Type</label>
                <select
                  value={newAccountData.accountType}
                  onChange={(e) => setNewAccountData({ ...newAccountData, accountType: e.target.value })}
                  className="form-input"
                  style={{
                    width: '100%', padding: '0.75rem', borderRadius: '0.5rem',
                    border: '1px solid #ccc', backgroundColor: darkMode ? '#0f172a' : 'white',
                    color: darkMode ? 'white' : 'black'
                  }}
                >
                  <option value="Savings">Savings</option>
                  <option value="Current">Current</option>
                  <option value="Salary">Salary</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Initial Balance</label>
                <input
                  type="number"
                  value={newAccountData.initialBalance}
                  onChange={(e) => setNewAccountData({ ...newAccountData, initialBalance: e.target.value })}
                  placeholder="0.00"
                  className="form-input"
                  style={{
                    width: '100%', padding: '0.75rem', borderRadius: '0.5rem',
                    border: '1px solid #ccc', backgroundColor: darkMode ? '#0f172a' : 'white',
                    color: darkMode ? 'white' : 'black'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Set MPIN (4 Digits)</label>
                <input
                  type="password"
                  maxLength="4"
                  value={newAccountData.mpin}
                  onChange={(e) => setNewAccountData({ ...newAccountData, mpin: e.target.value })}
                  placeholder="****"
                  className="form-input"
                  style={{
                    width: '100%', padding: '0.75rem', borderRadius: '0.5rem',
                    border: '1px solid #ccc', backgroundColor: darkMode ? '#0f172a' : 'white',
                    color: darkMode ? 'white' : 'black'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowAddAccountModal(false)}
                style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', background: '#94a3b8', color: 'white', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddAccountSubmit}
                style={{
                  padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none',
                  background: '#6366f1',
                  color: 'white', cursor: 'pointer'
                }}
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderCards = () => (
    <div className="cards-section">
      <div className="section-header">
        <h3>My Cards</h3>
        <button className="add-button" onClick={handleAddCard}>
          <FiPlus /> Add Card
        </button>
      </div>

      <div className="cards-grid">
        {cards.map(card => (
          <div key={card.id} className="card-item">
            {/* Action Buttons Overlay */}
            <div className="card-actions-overlay">
              <button
                className="card-action-btn"
                onClick={() => toggleCardNumber(card.id)}
                title={showCardNumber[card.id] ? 'Hide Number' : 'Show Number'}
              >
                {showCardNumber[card.id] ? <FiEyeOff /> : <FiEye />}
              </button>
              <button
                className="card-action-btn"
                onClick={() => handleCopyCardNumber(card.cardNumber)}
                title="Copy Card Number"
              >
                <FiCopy />
              </button>
            </div>

            {/* Header: Branding */}
            <div className="card-header">
              <div className="card-brand">
                <div className="brand-text-top">
                  <span className="brand-logo-icon">∞</span> kotak
                </div>
                <div className="brand-text-sub">| Privy+</div>
              </div>

              {/* Red Infinity Logo Simulation */}
              <div className="card-infinity-logo">
                <div className="infinity-loop"></div>
                <div className="infinity-loop right"></div>
              </div>
            </div>

            {/* Chip */}
            <div className="card-chip"></div>

            {/* Card Number */}
            <div className="card-number">
              {showCardNumber[card.id] ? card.cardNumber : '**** **** **** ' + card.cardNumber.slice(-4)}
            </div>

            {/* Footer: Name & Visa */}
            <div className="card-footer">
              <div className="card-holder-name">
                {state.user?.name || 'NISHITA LATISH SUVARNA'}
              </div>
              <div className="visa-logo">
                VISA
                <span className="visa-sub">Signature</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card-management">
        <h4>Card Management</h4>
        <div className="management-options">
          <div className="option-card">
            <FiLock className="option-icon" />
            <div className="option-content">
              <h5>Security Settings</h5>
              <p>Manage PIN, limits, and security</p>
            </div>
            <FiChevronRight className="option-arrow" />
          </div>
          <div className="option-card">
            <FiBell className="option-icon" />
            <div className="option-content">
              <h5>Transaction Alerts</h5>
              <p>Set up spending notifications</p>
            </div>
            <FiChevronRight className="option-arrow" />
          </div>
          <div className="option-card">
            <FiShield className="option-icon" />
            <div className="option-content">
              <h5>Card Protection</h5>
              <p>Insurance and fraud protection</p>
            </div>
            <FiChevronRight className="option-arrow" />
          </div>
          <div className="option-card">
            <FiDollarSign className="option-icon" />
            <div className="option-content">
              <h5>Spending Limits</h5>
              <p>Set daily/monthly spending limits</p>
            </div>
            <FiChevronRight className="option-arrow" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderTransactions = () => (
    <div className="transactions-section">
      <div className="section-header">
        <h3>Recent Transactions</h3>
        <div className="header-actions">
          <div className="search-box">
            <FiSearch />
            <input type="text" placeholder="Search transactions..." />
          </div>
          <button className="filter-btn">
            <FiFilter /> Filter
          </button>
        </div>
      </div>

      <div className="transactions-list">
        {transactions.map(transaction => (
          <div key={transaction.id} className="transaction-item">
            <div className="transaction-icon" style={{ background: getStatusColor(transaction.status) + '20' }}>
              {getCategoryIcon(transaction.category)}
            </div>
            <div className="transaction-details">
              <div className="transaction-header">
                <h5>{transaction.merchant}</h5>
                <span className="transaction-amount" style={{ color: transaction.amount < 0 ? '#ef476f' : '#06d6a0' }}>
                  {transaction.amount < 0 ? '-' : '+'}{formatCurrency(Math.abs(transaction.amount))}
                </span>
              </div>
              <div className="transaction-footer">
                <span className="transaction-category">{transaction.category}</span>
                <span className="transaction-date">{transaction.date} • {transaction.time}</span>
                <span className="transaction-status" style={{ color: getStatusColor(transaction.status) }}>
                  {transaction.status === 'completed' ? <FiCheckCircle /> : <FiAlertCircle />}
                  {transaction.status}
                </span>
              </div>
            </div>
            <button className="transaction-action">
              <FiChevronRight />
            </button>
          </div>
        ))}
      </div>

      <div className="transaction-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#667eea20' }}>
            <FiTrendingUp />
          </div>
          <div className="stat-content">
            <h5>Total Spent</h5>
            <p className="stat-value">{formatCurrency(stats.monthlySpent)}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#06d6a020' }}>
            <FiCreditCard />
          </div>
          <div className="stat-content">
            <h5>Transactions</h5>
            <p className="stat-value">{transactions.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f59e0b20' }}>
            <FiCalendar />
          </div>
          <div className="stat-content">
            <h5>This Month</h5>
            <p className="stat-value">{transactions.filter(t => new Date(t.date).getMonth() === new Date().getMonth()).length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ef476f20' }}>
            <FiShoppingBag />
          </div>
          <div className="stat-content">
            <h5>Top Category</h5>
            <p className="stat-value">Shopping</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="analytics-section">
      <div className="section-header">
        <h3>Spending Analytics</h3>
        <select className="period-select">
          <option>Last 30 days</option>
          <option>Last 3 months</option>
          <option>Last 6 months</option>
          <option>Last year</option>
        </select>
      </div>

      <div className="analytics-grid">
        <div className="chart-card">
          <h4>Spending by Category</h4>
          <div className="category-chart">
            {['Shopping', 'Food & Drink', 'Entertainment', 'Transport', 'Bills'].map((category, index) => (
              <div key={category} className="category-item">
                <div className="category-info">
                  <span className="category-icon">{getCategoryIcon(category)}</span>
                  <span className="category-name">{category}</span>
                </div>
                <div className="category-bar">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${(index + 1) * 20}%`,
                      background: ['#667eea', '#06d6a0', '#f59e0b', '#ef476f', '#8b5cf6'][index]
                    }}
                  ></div>
                </div>
                <span className="category-percent">{(index + 1) * 20}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h4>Monthly Overview</h4>
          <div className="monthly-chart">
            {[25000, 45000, 32000, 58000, 41000, 67000, 52000].map((amount, index) => (
              <div key={index} className="month-bar">
                <div
                  className="bar"
                  style={{ height: `${(amount / 80000) * 100}%` }}
                ></div>
                <span className="month-label">Month {index + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="insights-section">
        <h4>Financial Insights</h4>
        <div className="insights-grid">
          <div className="insight-card positive">
            <FiTrendingUp className="insight-icon" />
            <div className="insight-content">
              <h5>Spending Decreased</h5>
              <p>Your spending decreased by 15% this month</p>
            </div>
          </div>
          <div className="insight-card warning">
            <FiAlertCircle className="insight-icon" />
            <div className="insight-content">
              <h5>High Entertainment Spend</h5>
              <p>Entertainment expenses are 40% above average</p>
            </div>
          </div>
          <div className="insight-card info">
            <FiBell className="insight-icon" />
            <div className="insight-content">
              <h5>Upcoming Bill</h5>
              <p>Credit card bill of ₹12,500 due in 3 days</p>
            </div>
          </div>
          <div className="insight-card positive">
            <FiCheckCircle className="insight-icon" />
            <div className="insight-content">
              <h5>Good Savings Rate</h5>
              <p>You saved 35% of your income this month</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  /* Removed legacy userData check */

  return (
    <div className={`accounts-cards-container ${darkMode ? 'dark-mode' : ''}`}>
      {/* Toast Container */}
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>

      <div className="accounts-cards-layout">
        {/* Static Sidebar */}
        <div className="sidebar-container">
          <div className="sidebar-header">
            <h2 className="sidebar-title">Accounts</h2>
          </div>

          <nav className="sidebar-nav">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`sidebar-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="nav-icon">{tab.icon}</span>
                <span className="nav-label">{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Quick Actions moved to Sidebar Bottom */}
          <div className="sidebar-quick-actions">
            <div className="quick-actions-header">Quick Actions</div>
            <button className="sidebar-action-btn" onClick={handleAddAccount}>
              <FiPlus /> New Account
            </button>
            <button className="sidebar-action-btn">
              <FiBarChart2 /> Statements
            </button>
            <button className="sidebar-action-btn">
              <FiDownload /> Export
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="main-content-wrapper">
          <div className="content-header">
            <div>
              <h1 className="page-title">
                {tabs.find(t => t.id === activeTab)?.label}
              </h1>
              <p className="page-subtitle">Manage your {activeTab} information</p>
            </div>
            <button className="accounts-back-button" onClick={onBack}>
              ← Dashboard
            </button>
          </div>

          {/* Stats Cards (Dynamic based on view) */}
          <div className="stats-overview">
            <div className="stat-overview-card">
              <div className="stat-icon-overview"><FiCreditCard /></div>
              <div className="stat-content-overview">
                <h4>Total Balance</h4>
                <p className="stat-value-overview">{formatCurrency(stats.totalBalance)}</p>
              </div>
            </div>
            <div className="stat-overview-card">
              <div className="stat-icon-overview"><FiCard /></div>
              <div className="stat-content-overview">
                <h4>Active Cards</h4>
                <p className="stat-value-overview">{stats.cardsActive}</p>
              </div>
            </div>
          </div>

          <div className="content-body">
            {activeTab === 'accounts' && renderAccounts()}
            {activeTab === 'cards' && renderCards()}
            {activeTab === 'transactions' && renderTransactions()}
            {activeTab === 'analytics' && renderAnalytics()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountsCards;