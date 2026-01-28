import React, { useEffect, useState, useRef } from "react";
import { useBanking } from "../context/BankingContext";
import "../styles/transfer.css";
import {
  FiSmartphone,
  FiHash,
  FiCreditCard,
  FiMaximize,
  FiUser,
  FiBell,
  FiShare2,
  FiRefreshCcw,
  FiRefreshCw,
  FiDollarSign,
  FiFileText,
  FiShield,
  FiTrendingUp,
  FiGlobe,
  FiSettings,
  FiGrid,
  FiPlus,
  FiBarChart2,
  FiHelpCircle,
  FiLock,
  FiActivity,
  FiBriefcase,
  FiHome,
  FiPackage,
  FiTruck,
  FiMap,
  FiCheckSquare,
  FiAlertCircle,
  FiX,
  FiShoppingBag,
  FiVideo,
  FiMusic,
  FiBook,
  FiHeart,
  FiCoffee,
  FiCamera,
  FiStar,
  FiTarget,
  FiGift,
  FiCalendar,
  FiPieChart,
  FiDroplet,
  FiWifi,
  FiBookOpen,
  FiFilm,
  FiRadio,
  FiShoppingCart,
  FiPhone,
  FiMail,
  FiDatabase,
  FiChevronRight,
  FiRepeat,
  FiCheckCircle
} from "react-icons/fi";

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

function Transfer({ darkMode }) { // Accepting darkMode prop if passed, or use context
  /* Updated to use Context Data */
  const { state, transfer: contextTransfer, verifyAccountMpin } = useBanking();
  const [activeTab, setActiveTab] = useState("other");
  const [selectedMethod, setSelectedMethod] = useState("account");

  // New State for Source Account
  const [selectedSourceAccount, setSelectedSourceAccount] = useState("");
  const [destinationAccount, setDestinationAccount] = useState(""); // For Self Transfer
  const [amount, setAmount] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [activeCategory, setActiveCategory] = useState("transfer");
  const [remarks, setRemarks] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState(['', '', '', '']);
  const [pinError, setPinError] = useState('');
  const [isPinProcessing, setIsPinProcessing] = useState(false);
  const [receiverData, setReceiverData] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  /* Removed Duplicate Declarations */
  const pinInputRefs = useRef([]);

  // Toast State
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    // Set default source account
    if (state.accounts && state.accounts.length > 0) {
      setSelectedSourceAccount(state.accounts[0].id);
    }

    // Load all users for beneficiary lookup
    const usersJSON = localStorage.getItem("epic_all_users");
    if (usersJSON) {
      setAllUsers(JSON.parse(usersJSON));
    }
  }, [state.accounts]);

  // PIN Modal Handlers
  useEffect(() => {
    if (showPinModal) {
      setPin(['', '', '', '']);
      setPinError('');
      setIsPinProcessing(false);
      setTimeout(() => {
        if (pinInputRefs.current[0]) {
          pinInputRefs.current[0].focus();
        }
      }, 100);
    }
  }, [showPinModal]);

  const handlePinChange = (index, value) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }

    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setPinError('');

    // Auto-focus logic preserved, but auto-submit removed
    if (value && index < 3) {
      pinInputRefs.current[index + 1].focus();
    }
  };

  const handlePinKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      pinInputRefs.current[index - 1].focus();
      const newPin = [...pin];
      newPin[index - 1] = '';
      setPin(newPin);
    }
  };

  const verifyUserPin = (enteredPin) => {
    try {
      console.log("🔍 Checking PIN:", enteredPin);

      // Get logged in user
      const loggedUser = JSON.parse(localStorage.getItem("epic_logged_user"));

      if (!loggedUser || !loggedUser.user) {
        console.log("❌ No user found");
        return false;
      }

      // Check in logged user data
      console.log("Checking logged user:", loggedUser.user);

      const userData = loggedUser.user;

      // Check common PIN field names
      if (userData.pin && enteredPin === userData.pin.toString()) {
        console.log("✅ PIN found in user.pin");
        return true;
      }

      if (userData.password && enteredPin === userData.password.toString()) {
        console.log("✅ PIN found in user.password");
        return true;
      }

      if (userData.mpin && enteredPin === userData.mpin.toString()) {
        console.log("✅ PIN found in user.mpin");
        return true;
      }

      if (userData.transactionPin && enteredPin === userData.transactionPin.toString()) {
        console.log("✅ PIN found in user.transactionPin");
        return true;
      }

      // Check in all users data
      const allUsers = JSON.parse(localStorage.getItem("epic_all_users") || "[]");
      const currentUser = allUsers.find(u => u.user?.crn === loggedUser.user?.crn);

      if (currentUser && currentUser.user) {
        console.log("Checking current user from allUsers:", currentUser.user);

        if (currentUser.user.pin && enteredPin === currentUser.user.pin.toString()) {
          console.log("✅ PIN found in allUsers.user.pin");
          return true;
        }

        if (currentUser.user.password && enteredPin === currentUser.user.password.toString()) {
          console.log("✅ PIN found in allUsers.user.password");
          return true;
        }

        if (currentUser.user.mpin && enteredPin === currentUser.user.mpin.toString()) {
          console.log("✅ PIN found in allUsers.user.mpin");
          return true;
        }

        if (currentUser.user.transactionPin && enteredPin === currentUser.user.transactionPin.toString()) {
          console.log("✅ PIN found in allUsers.user.transactionPin");
          return true;
        }
      }

      console.log("❌ PIN not found in any field");
      console.log("Available user data:", JSON.stringify(loggedUser.user, null, 2));

      return false;

    } catch (error) {
      console.error("PIN verification error:", error);
      return false;
    }
  };

  const handlePinSubmit = (pinOverride) => {
    // Check if pinOverride is an array (it might be an event object if called via onClick)
    const actualPin = Array.isArray(pinOverride) ? pinOverride : pin;
    const enteredPin = actualPin.join('');

    if (enteredPin.length !== 4) {
      setPinError('Please enter 4-digit MPIN');
      return;
    }

    setIsPinProcessing(true);
    setPinError('');

    setTimeout(() => {
      // Verify MPIN for VALID SELECTED ACCOUNT
      if (verifyAccountMpin(selectedSourceAccount, enteredPin)) {
        setIsPinProcessing(false);
        setShowPinModal(false);
        processTransfer();
      } else {
        setIsPinProcessing(false);
        setPinError('Invalid MPIN for the selected account');
        setPin(['', '', '', '']);
        // Refocus
        if (pinInputRefs.current[0]) {
          pinInputRefs.current[0].focus();
        }
      }
    }, 1000);
  };

  const processTransfer = () => {
    if (!identifier || !amount) {
      setError("Please fill all required fields");
      return;
    }

    const cleanAccountNumber = identifier.replace(/\s/g, '');

    // Configured to execute immediately as MPIN was already verified
    transferMoney(cleanAccountNumber, amount, remarks);
  };

  const handleSwap = () => {
    const temp = selectedSourceAccount;
    setSelectedSourceAccount(destinationAccount);
    setDestinationAccount(temp);
  };

  // Account Card Render Helper
  const AccountCard = ({ type, accountId, onClick, label }) => {
    const account = state.accounts.find(a => a.id === accountId);

    return (
      <div
        className={`transfer-account-card ${!account ? 'empty' : ''}`}
        onClick={onClick}
        style={{
          background: darkMode ? '#1e293b' : 'white',
          border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
          borderRadius: '1rem',
          padding: '1.5rem',
          cursor: 'pointer',
          transition: 'all 0.2s',
          marginBottom: '1rem',
          position: 'relative',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </div>

        {account ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: '600', fontSize: '1.125rem', marginBottom: '0.25rem' }}>
                {account.bankName}
              </div>
              <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                xxxx {account.accountNumber.slice(-4)}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: '600', color: '#10b981' }}>
                ₹{parseFloat(account.balance).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Available</div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', color: '#94a3b8', gap: '0.5rem' }}>
            <div style={{ padding: '0.5rem', background: '#f1f5f9', borderRadius: '50%' }}>
              <FiCreditCard />
            </div>
            <span>Select Account</span>
            <FiChevronRight style={{ marginLeft: 'auto' }} />
          </div>
        )}
      </div>
    );
  };

  const handleProceedToPay = () => {
    if (selectedMethod === "self") {
      if (!destinationAccount || !amount) {
        setError("Please select accounts and amount");
        return;
      }

      const destAcc = state.accounts.find(a => a.id === destinationAccount);
      if (!destAcc) {
        setError("Destination account invalid");
        return;
      }
      // Use destination account number as identifier for consistency with transfer logic
      setIdentifier(destAcc.accountNumber);

      // Show PIN modal
      setShowPinModal(true);
      return;
    }

    if (selectedMethod === "account" || selectedMethod === "phone" || selectedMethod === "upi") {
      if (!identifier || !amount) {
        setError("Please fill all required fields");
        return;
      }

      const cleanIdentifier = identifier.replace(/\s/g, '');

      // Find receiver in all users (Robust Lookup)
      const receiver = allUsers.find(u =>
        // 1. Check specific account number in 'accounts' array (Handles both Nested & Normalized)
        (u.accounts && u.accounts.some(a =>
          String(a.accountDetails?.accountNumber) === cleanIdentifier ||
          String(a.accountNumber) === cleanIdentifier
        )) ||
        // 2. Check legacy 'account' object
        (u.account && String(u.account.accountNumber) === cleanIdentifier) ||
        // 3. Check User Details (Mobile/UPI/Email)
        (u.user && (
          // Mobile: Flexible matching (Strip non-digits, check if stored number contains input)
          (() => {
            const inputDigits = cleanIdentifier.replace(/\D/g, '');
            const storedDigits = String(u.user.mobile).replace(/\D/g, '');
            // Match if exact match OR if stored number ends with input (handling +91 prefix)
            return inputDigits.length >= 10 && (storedDigits === inputDigits || storedDigits.endsWith(inputDigits));
          })() ||
          // UPI: Case insensitive
          String(u.user.upi).toLowerCase() === cleanIdentifier.toLowerCase() ||
          // Email: Case insensitive
          String(u.user.email).toLowerCase() === cleanIdentifier.toLowerCase()
        ))
      );

      if (!receiver) {
        setError("Receiver not found");
        return;
      }

      // Check balance
      const sourceAccount = state.accounts.find(acc => acc.id === selectedSourceAccount);
      if (!sourceAccount) {
        setError("Please select a valid source account");
        return;
      }

      if (sourceAccount.balance < parseFloat(amount)) {
        setError("Insufficient balance in selected account");
        return;
      }

      // Set receiver data
      setReceiverData({
        name: receiver.user?.name || 'Unknown',
        accountNumber: cleanIdentifier
      });

      // Show PIN modal
      setShowPinModal(true);
    } else {
      setError(`${selectedMethod.toUpperCase()} transfer feature coming soon!`);
    }
  };

  const transferMoney = (toAccountNumber, amount, description = "") => {
    try {
      setIsProcessing(true);
      setError("");

      const result = contextTransfer(selectedSourceAccount, toAccountNumber, parseFloat(amount), description);

      if (result.success) {
        setTransferSuccess(true);
        setIsProcessing(false);

        // Reset form
        setTimeout(() => {
          setAmount("");
          setIdentifier("");
          setRemarks("");
          setTransferSuccess(false);
        }, 1000);

        return { success: true };
      } else {
        setError(result.error || "Transfer failed");
        setIsProcessing(false);
        return false;
      }

    } catch (error) {
      console.error("Transfer error:", error);
      setError("An unexpected error occurred. Please try again.");
      setIsProcessing(false);
      return false;
    }
  };

  const handleRecentBeneficiary = (accountNumber, name) => {
    setIdentifier(accountNumber);
  };

  const handleQuickAmount = (quickAmount) => {
    setAmount(quickAmount.toString());
    if (error) setError("");
  };

  if (!state.user) {
    return <div className="loading-container">Loading Transfer...</div>;
  }

  // No longer rely on 'data' or 'balance' directly, use state.accounts
  // const { user, account, balance } = data; // REMOVED

  const categories = [
    { id: "transfer", label: "Transfer", icon: <FiActivity />, color: "#3b82f6" },
    { id: "wallet", label: "My Wallet", icon: <FiCreditCard />, color: "#8b5cf6" },
    { id: "recharge", label: "Recharge", icon: <FiSmartphone />, color: "#10b981" },
    { id: "bills", label: "Bills", icon: <FiFileText />, color: "#f59e0b" },
    { id: "loans", label: "Loans", icon: <FiDollarSign />, color: "#ef4444" },
    { id: "insurance", label: "Insurance", icon: <FiShield />, color: "#06b6d4" },
    { id: "mutual", label: "Mutual Funds", icon: <FiTrendingUp />, color: "#84cc16" },
    { id: "travel", label: "Travel", icon: <FiGlobe />, color: "#f97316" },
    { id: "payments", label: "Manage Payments", icon: <FiSettings />, color: "#ec4899" },
    { id: "cards", label: "Cards", icon: <FiGrid />, color: "#6366f1" }
  ];

  const categoryContent = {
    transfer: [
      {
        label: "Self Transfer",
        desc: "Transfer between own accounts",
        icon: <FiRefreshCw />,
        action: () => setSelectedMethod("self")
      },
      {
        label: "Transfer to Contact",
        desc: "Send via Phone Number",
        icon: <FiSmartphone />,
        action: () => setSelectedMethod("phone")
      },
      {
        label: "Bank Transfer",
        desc: "Send to any bank account",
        icon: <FiActivity />,
        action: () => setSelectedMethod("account")
      },
      {
        label: "UPI Payment",
        desc: "Pay via UPI ID or QR",
        icon: <FiHash />,
        action: () => setSelectedMethod("upi")
      },
      {
        label: "IMPS",
        desc: "Instant money transfer",
        icon: <FiDollarSign />,
        action: () => setSelectedMethod("account")
      },
      {
        label: "NEFT/RTGS",
        desc: "Scheduled transfers",
        icon: <FiFileText />,
        action: () => addToast("NEFT/RTGS feature coming soon!", "error")
      },
      {
        label: "Split Payment",
        desc: "Share bills with friends",
        icon: <FiUser />,
        action: () => addToast("Split payment feature coming soon!", "error")
      },
      {
        label: "International",
        desc: "Send money abroad",
        icon: <FiGlobe />,
        action: () => addToast("International transfer feature coming soon!", "error")
      }
    ],
    wallet: [
      {
        label: "View Balance",
        desc: "Check wallet balance",
        icon: <FiCreditCard />,
        action: () => addToast("Balance: ₹" + (state.accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0) || 0), "success")
      },
      {
        label: "Add Money",
        desc: "Load money to wallet",
        icon: <FiPlus />,
        action: () => addToast("Add money feature coming soon", "error")
      },
      {
        label: "Send to Bank",
        desc: "Transfer to bank account",
        icon: <FiShare2 />,
        action: () => addToast("Send to bank feature coming soon", "error")
      },
      {
        label: "Transaction History",
        desc: "View all transactions",
        icon: <FiFileText />,
        action: () => addToast("Transaction history feature coming soon", "error")
      },
      {
        label: "Set Limits",
        desc: "Daily spending limits",
        icon: <FiLock />,
        action: () => addToast("Set limits feature coming soon", "error")
      },
      {
        label: "Wallet Offers",
        desc: "Exclusive deals & cashback",
        icon: <FiGift />,
        action: () => addToast("Offers feature coming soon", "error")
      }
    ],
    recharge: [
      {
        label: "Mobile",
        desc: "Prepaid & Postpaid",
        icon: <FiSmartphone />,
        action: () => addToast("Mobile recharge feature coming soon", "error")
      },
      {
        label: "DTH",
        desc: "TV Recharge",
        icon: <FiMaximize />,
        action: () => addToast("DTH recharge feature coming soon", "error")
      },
      {
        label: "Electricity",
        desc: "Pay electricity bill",
        icon: <FiHome />,
        action: () => addToast("Electricity bill feature coming soon", "error")
      },
      {
        label: "Broadband",
        desc: "Internet bills",
        icon: <FiWifi />,
        action: () => addToast("Broadband bill feature coming soon", "error")
      },
      {
        label: "Water Bill",
        desc: "Municipal water charges",
        icon: <FiDroplet />,
        action: () => addToast("Water bill feature coming soon", "error")
      },
      {
        label: "Gas Cylinder",
        desc: "LPG booking & payment",
        icon: <FiPackage />,
        action: () => addToast("Gas booking feature coming soon", "error")
      }
    ],
    bills: [
      {
        label: "Credit Card",
        desc: "Pay credit card bills",
        icon: <FiCreditCard />,
        action: () => addToast("Credit card payment feature coming soon", "error")
      },
      {
        label: "Utility",
        desc: "Water, Gas & more",
        icon: <FiSettings />,
        action: () => addToast("Utility bills feature coming soon", "error")
      },
      {
        label: "Education",
        desc: "School & College fees",
        icon: <FiBookOpen />,
        action: () => addToast("Education fees feature coming soon", "error")
      },
      {
        label: "Subscription",
        desc: "OTT & other services",
        icon: <FiVideo />,
        action: () => addToast("Subscription payment feature coming soon", "error")
      },
      {
        label: "Society Maintenance",
        desc: "Apartment charges",
        icon: <FiHome />,
        action: () => addToast("Maintenance payment feature coming soon", "error")
      },
      {
        label: "Municipal Tax",
        desc: "Property tax payment",
        icon: <FiBriefcase />,
        action: () => addToast("Tax payment feature coming soon", "error")
      }
    ],
    loans: [
      {
        label: "Apply Now",
        desc: "Quick loan approval",
        icon: <FiDollarSign />,
        action: () => addToast("Apply for loan feature coming soon", "error")
      },
      {
        label: "EMI Payments",
        desc: "Pay loan installments",
        icon: <FiCalendar />,
        action: () => addToast("Pay EMI feature coming soon", "error")
      },
      {
        label: "Check Eligibility",
        desc: "Pre-approved offers",
        icon: <FiBarChart2 />,
        action: () => addToast("Check eligibility feature coming soon", "error")
      },
      {
        label: "Loan Statement",
        desc: "View loan details",
        icon: <FiFileText />,
        action: () => addToast("View statement feature coming soon", "error")
      },
      {
        label: "Foreclosure",
        desc: "Close loan early",
        icon: <FiCheckSquare />,
        action: () => addToast("Foreclosure option coming soon", "error")
      },
      {
        label: "Top-up Loan",
        desc: "Increase loan amount",
        icon: <FiTrendingUp />,
        action: () => addToast("Top-up loan feature coming soon", "error")
      }
    ],
    insurance: [
      {
        label: "Health Insurance",
        desc: "Medical coverage",
        icon: <FiHeart />,
        action: () => addToast("Health insurance feature coming soon", "error")
      },
      {
        label: "Motor Insurance",
        desc: "Car & Bike",
        icon: <FiTruck />,
        action: () => addToast("Vehicle insurance feature coming soon", "error")
      },
      {
        label: "Life Insurance",
        desc: "Term plans",
        icon: <FiUser />,
        action: () => addToast("Life insurance feature coming soon", "error")
      },
      {
        label: "Travel Insurance",
        desc: "International travel",
        icon: <FiGlobe />,
        action: () => addToast("Travel insurance feature coming soon", "error")
      },
      {
        label: "Home Insurance",
        desc: "Property protection",
        icon: <FiHome />,
        action: () => addToast("Home insurance feature coming soon", "error")
      },
      {
        label: "Renew Policy",
        desc: "Renew existing policy",
        icon: <FiRefreshCcw />,
        action: () => addToast("Renew insurance feature coming soon", "error")
      }
    ],
    mutual: [
      {
        label: "Invest Now",
        desc: "Start SIP or lumpsum",
        icon: <FiTrendingUp />,
        action: () => addToast("Invest now feature coming soon", "error")
      },
      {
        label: "Portfolio",
        desc: "View investments",
        icon: <FiPieChart />,
        action: () => addToast("View portfolio feature coming soon", "error")
      },
      {
        label: "Top Funds",
        desc: "Best performing funds",
        icon: <FiStar />,
        action: () => addToast("Top funds feature coming soon", "error")
      },
      {
        label: "Calculator",
        desc: "SIP & returns calculator",
        icon: <FiHelpCircle />,
        action: () => addToast("Calculator feature coming soon", "error")
      },
      {
        label: "Systematic Withdrawal",
        desc: "Regular income plan",
        icon: <FiDollarSign />,
        action: () => addToast("Withdrawal plan feature coming soon", "error")
      },
      {
        label: "Switch Funds",
        desc: "Change your investment",
        icon: <FiRefreshCcw />,
        action: () => addToast("Switch funds feature coming soon", "error")
      }
    ],
    travel: [
      {
        label: "Book Flights",
        desc: "Domestic & International",
        icon: <FiGlobe />,
        action: () => addToast("Book flights feature coming soon", "error")
      },
      {
        label: "Hotels",
        desc: "Resorts & Stays",
        icon: <FiHome />,
        action: () => addToast("Book hotels feature coming soon", "error")
      },
      {
        label: "Trains",
        desc: "IRCTC booking",
        icon: <FiTruck />,
        action: () => addToast("Book trains feature coming soon", "error")
      },
      {
        label: "Bus Tickets",
        desc: "Intercity travel",
        icon: <FiMap />,
        action: () => addToast("Book buses feature coming soon", "error")
      },
      {
        label: "Car Rental",
        desc: "Self-drive & chauffeur",
        icon: <FiTruck />,
        action: () => addToast("Rent a car feature coming soon", "error")
      },
      {
        label: "Travel Packages",
        desc: "Complete holiday plans",
        icon: <FiBriefcase />,
        action: () => addToast("Travel packages feature coming soon", "error")
      }
    ],
    payments: [
      {
        label: "AutoPay",
        desc: "Setup automatic payments",
        icon: <FiSettings />,
        action: () => addToast("Setup AutoPay feature coming soon", "error")
      },
      {
        label: "Payment History",
        desc: "Past transactions",
        icon: <FiFileText />,
        action: () => addToast("View history feature coming soon", "error")
      },
      {
        label: "Manage Limits",
        desc: "Set transaction limits",
        icon: <FiLock />,
        action: () => addToast("Manage limits feature coming soon", "error")
      },
      {
        label: "Beneficiaries",

        desc: "Saved contacts",
        icon: <FiUser />,
        action: () => addToast("Manage beneficiaries feature coming soon", "error")
      },
      {
        label: "Schedule Payment",
        desc: "Future dated payments",
        icon: <FiCalendar />,
        action: () => addToast("Schedule payment feature coming soon", "error")
      },
      {
        label: "Payment Reminders",
        desc: "Never miss a due date",
        icon: <FiBell />,
        action: () => addToast("Set reminders feature coming soon", "error")
      }
    ],
    cards: [
      {
        label: "Virtual Card",
        desc: "Generate digital card",
        icon: <FiCreditCard />,
        action: () => alert("Virtual card")
      },
      {
        label: "Block Card",
        desc: "Temporarily block",
        icon: <FiLock />,
        action: () => alert("Block card")
      },
      {
        label: "Set PIN",
        desc: "Change card PIN",
        icon: <FiShield />,
        action: () => alert("Set PIN")
      },
      {
        label: "Spend Analysis",
        desc: "Category-wise spending",
        icon: <FiBarChart2 />,
        action: () => alert("Spend analysis")
      },
      {
        label: "Request Upgrade",
        desc: "Higher credit limit",
        icon: <FiTrendingUp />,
        action: () => alert("Request upgrade")
      },
      {
        label: "Card Offers",
        desc: "Exclusive discounts",
        icon: <FiGift />,
        action: () => alert("Card offers")
      }
    ]
  };

  // Get recent beneficiaries from transactions
  const getRecentBeneficiaries = () => {
    if (!state.transactions || !allUsers.length) return [];

    const beneficiaries = [];
    const seenAccounts = new Set();

    state.transactions.forEach(txn => {
      if (txn.type === "Debit" && txn.toAccount && !seenAccounts.has(txn.toAccount)) {
        const beneficiary = allUsers.find(u =>
          // Check both new and old structure
          (u.accounts && u.accounts.some(a => a.accountNumber === txn.toAccount)) ||
          (u.account && u.account.accountNumber === txn.toAccount)
        );
        if (beneficiary) {
          // Find specific account bank name
          const benAccount = beneficiary.accounts?.find(a => a.accountNumber === txn.toAccount) || beneficiary.account;

          beneficiaries.push({
            name: beneficiary.user?.name || 'Unknown',
            accountNumber: txn.toAccount,
            bank: benAccount?.bankName || 'Unknown Bank'
          });
          seenAccounts.add(txn.toAccount);
        }
      }
    });

    return beneficiaries.slice(0, 3);
  };

  const recentBeneficiaries = getRecentBeneficiaries();

  return (
    <div className="transfer-container">
      {/* PIN Modal */}
      {showPinModal && (
        <div className="pin-modal-overlay">
          <div className="pin-modal-container">
            {/* Header */}
            <div className="pin-modal-header">
              <button className="modal-close-btn" onClick={() => setShowPinModal(false)}>
                <FiX />
              </button>
              <div className="modal-title">
                <FiShield className="shield-icon" />
                <span>Security PIN Required</span>
              </div>
            </div>

            {/* User Info */}
            <div className="user-info-section">
              <div className="user-avatar">
                {state.user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="user-details">
                <div className="user-name">{state.user?.name || 'User'}</div>
                <div className="user-account">
                  Account: {(state.accounts && state.accounts[0]) ? `XXXX${state.accounts[0].accountNumber.slice(-4)}` : 'XXXX0000'}
                </div>
              </div>
            </div>

            {/* Amount Display */}
            <div className="pin-amount-display">
              <div className="amount-label">Transfer Amount</div>
              <div className="amount-value">
                ₹ {parseFloat(amount).toLocaleString('en-IN')}
              </div>
              {receiverData && (
                <div className="receiver-info">
                  <FiUser className="receiver-icon" />
                  <span>
                    To: <strong>{receiverData.name}</strong>
                    {receiverData.accountNumber && ` (${receiverData.accountNumber.slice(-4)})`}
                  </span>
                </div>
              )}
            </div>

            {/* PIN Input */}
            <div className="pin-input-section">
              <div className="pin-input-label">
                <FiLock className="pin-icon" />
                Enter your 4-digit security PIN
              </div>

              <div className="pin-input-grid">
                {[0, 1, 2, 3].map((index) => (
                  <input
                    key={index}
                    ref={el => pinInputRefs.current[index] = el}
                    type="password"
                    maxLength="1"
                    value={pin[index]}
                    onChange={(e) => handlePinChange(index, e.target.value)}
                    onKeyDown={(e) => handlePinKeyDown(index, e)}
                    disabled={isPinProcessing}
                    className={pinError ? 'pin-input error' : 'pin-input'}
                    autoComplete="off"
                  />
                ))}
              </div>

              {pinError && (
                <div className="pin-error-message">
                  {pinError}
                </div>
              )}
            </div>

            {isPinProcessing && (
              <div className="processing-indicator">
                <div className="spinner"></div>
                <div className="processing-text">Verifying PIN...</div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pin-action-buttons">
              <button
                className="cancel-btn"
                onClick={() => setShowPinModal(false)}
                disabled={isPinProcessing}
              >
                Cancel
              </button>
              <button
                className="submit-btn"
                onClick={handlePinSubmit}
                disabled={isPinProcessing || pin.join('').length !== 4}
              >
                Confirm Payment
              </button>
            </div>

            {/* Security Note */}
            <div className="security-note">
              <FiShield />
              <span>Your transaction is secured with bank-level encryption</span>
            </div>
          </div>
        </div>
      )}

      <header className="transfer-header">
        <div className="header-left">
          <h2 className="transfer-title">Payments Hub</h2>
          <p className="transfer-subtitle">All your financial needs in one place</p>
        </div>

        <div className="dash-header-right">
          <button className="icon-btn notification-btn">
            <FiBell />
            <span className="notification-badge">3</span>
          </button>
          <div className="user-chip">
            <div className="avatar">
              {state.user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="user-info">
              <span className="user-name">{state.user?.name || 'User'}</span>
              <span className="user-role">{(state.accounts && state.accounts[0]) ? state.accounts[0].accountType : 'Banking'} Account</span>
            </div>
          </div>
        </div>
      </header>

      <div className="main-layout">
        <div className="categories-sidebar">
          <div className="sidebar-header">
            <h3>Services</h3>
          </div>
          <div className="categories-list">
            {categories.map((category) => (
              <div
                key={category.id}
                className={`category-item ${activeCategory === category.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(category.id)}
              >
                <div
                  className="category-icon"
                  style={{ backgroundColor: `${category.color}15`, color: category.color }}
                >
                  {category.icon}
                </div>
                <span className="category-label">{category.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="main-content">
          <div className="category-content">
            <div className="content-header">
              <h3>{categories.find(c => c.id === activeCategory)?.label}</h3>
              <div className="content-actions">
                <button className="transfer-action-btn btn-secondary">
                  <FiShare2 /> Share
                </button>
                <button className="transfer-action-btn btn-primary">
                  <FiPlus /> Add New
                </button>
              </div>
            </div>

            <div className="quick-actions-grid">
              {categoryContent[activeCategory]?.map((action, index) => (
                <div key={index} className="quick-action-card" onClick={action.action}>
                  <div className="action-icon">{action.icon}</div>
                  <div className="action-details">
                    <h4>{action.label}</h4>
                    <p>{action.desc}</p>
                  </div>
                  <button className="action-arrow">→</button>
                </div>
              ))}
            </div>

            {/* Transfer Form (Only shown for transfer category) */}
            {activeCategory === "transfer" && (
              <div className="transfer-form-section">
                <div className="form-header">
                  <h4>Quick Transfer</h4>
                  <div className="transfer-tabs">
                    <div
                      className={`transfer-tab ${activeTab === "own" ? "active" : ""}`}
                      onClick={() => setActiveTab("own")}
                    >
                      Own account
                    </div>
                    <div
                      className={`transfer-tab ${activeTab === "other" ? "active" : ""}`}
                      onClick={() => setActiveTab("other")}
                    >
                      Other account
                    </div>
                  </div>
                </div>

                {transferSuccess && (
                  <div className="success-message">
                    ✅ Transfer Successful! Amount has been transferred.
                  </div>
                )}

                {error && (
                  <div className="error-message">
                    <FiAlertCircle /> {error}
                  </div>
                )}

                <div className="upi-options-grid">
                  <div
                    className={`upi-option ${selectedMethod === "phone" ? "active" : ""}`}
                    onClick={() => setSelectedMethod("phone")}
                  >
                    <FiSmartphone />
                    <span>Phone</span>
                  </div>
                  <div
                    className={`upi-option ${selectedMethod === "upi" ? "active" : ""}`}
                    onClick={() => setSelectedMethod("upi")}
                  >
                    <FiHash />
                    <span>UPI ID</span>
                  </div>
                  <div
                    className={`upi-option ${selectedMethod === "account" ? "active" : ""}`}
                    onClick={() => setSelectedMethod("account")}
                  >
                    <FiCreditCard />
                    <span>Account</span>
                  </div>
                  <div
                    className={`upi-option ${selectedMethod === "qr" ? "active" : ""}`}
                    onClick={() => setSelectedMethod("qr")}
                  >
                    <FiMaximize />
                    <span>QR</span>
                  </div>
                </div>

                {selectedMethod === "self" && (
                  <div className="payment-form" style={{ maxWidth: '500px', margin: '0 auto' }}>

                    {/* From Account */}
                    <AccountCard
                      type="source"
                      label="Transfer From"
                      accountId={selectedSourceAccount}
                      onClick={() => {/* Logic to open source selector - reusing existing dropdowns for now or implementing modal later if requested */ }}
                    />

                    {/* Swap Button */}
                    <div style={{ display: 'flex', justifyContent: 'center', margin: '-1.5rem 0', position: 'relative', zIndex: 10 }}>
                      <button
                        onClick={handleSwap}
                        style={{
                          background: '#3b82f6', color: 'white', border: 'none',
                          borderRadius: '50%', width: '40px', height: '40px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)', cursor: 'pointer'
                        }}
                      >
                        <FiRepeat size={20} />
                      </button>
                    </div>

                    {/* To Account */}
                    <AccountCard
                      type="dest"
                      label="Transfer To"
                      accountId={destinationAccount}
                      onClick={() => {/* Logic to open dest selector */ }}
                    />

                    {/* Inline Selectors (Hidden or integrated) - For now keeping visible selectors below cards to actually allow selection until Modal is built, or replacing cards WITH functional selectors styled as cards */}

                    <div className="form-group" style={{ marginTop: '1.5rem' }}>
                      <label>Select Accounts</label>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <select
                          value={selectedSourceAccount}
                          onChange={(e) => {
                            setSelectedSourceAccount(e.target.value);
                            if (e.target.value === destinationAccount) setDestinationAccount("");
                          }}
                          className="custom-select"
                          style={{ flex: 1 }}
                        >
                          <option value="">Source</option>
                          {state.accounts.map(acc => (
                            <option key={acc.id} value={acc.id}>
                              {acc.bankName} - {acc.accountNumber.slice(-4)}
                            </option>
                          ))}
                        </select>

                        <select
                          value={destinationAccount}
                          onChange={(e) => setDestinationAccount(e.target.value)}
                          className="custom-select"
                          style={{ flex: 1 }}
                        >
                          <option value="">Destination</option>
                          {state.accounts
                            .filter(acc => acc.id !== selectedSourceAccount)
                            .map(acc => (
                              <option key={acc.id} value={acc.id}>
                                {acc.bankName} - {acc.accountNumber.slice(-4)}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Amount</label>
                      <div className="input-with-icon">
                        <span className="input-icon">₹</span>
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0"
                          min="1"
                          className="amount-input"
                        />
                      </div>
                    </div>



                    {error && <div className="error-message">{error}</div>}

                    <button
                      className="btn-primary proceed-btn"
                      onClick={handleProceedToPay}
                      disabled={!amount || !selectedSourceAccount || !destinationAccount}
                    >
                      Proceed to Transfer
                    </button>
                  </div>
                )}

                {selectedMethod !== "self" && (
                  <div className="transfer-form">
                    {/* Source Account Selection */}
                    <div className="form-group">
                      <label>From Account <span className="required">*</span></label>
                      <div className="account-select-wrapper">
                        <select
                          className="form-select"
                          value={selectedSourceAccount}
                          onChange={(e) => setSelectedSourceAccount(e.target.value)}
                        >
                          {state.accounts.map(acc => (
                            <option key={acc.id} value={acc.id}>
                              {acc.bankName} - {acc.accountNumber} (₹{acc.balance.toLocaleString('en-IN')})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {selectedMethod === "account" && recentBeneficiaries.length > 0 && (
                      <div className="recent-beneficiaries">
                        <h5>Recent Beneficiaries</h5>
                        <div className="beneficiaries-list">
                          {recentBeneficiaries.map((beneficiary, index) => (
                            <div
                              key={index}
                              className="beneficiary-chip"
                              onClick={() => handleRecentBeneficiary(beneficiary.accountNumber, beneficiary.name)}
                            >
                              <div className="beneficiary-avatar">
                                {beneficiary.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="beneficiary-info">
                                <span className="beneficiary-name">{beneficiary.name}</span>
                                <span className="beneficiary-details">
                                  {beneficiary.accountNumber} • {beneficiary.bank}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="form-group">
                      <label>
                        {selectedMethod === "account" ? "Account Number" :
                          selectedMethod === "upi" ? "UPI ID" :
                            selectedMethod === "phone" ? "Phone Number" : "Scan QR Code"}
                        <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder={
                          selectedMethod === "account" ? "Enter account number" :
                            selectedMethod === "upi" ? "username@bank" :
                              selectedMethod === "phone" ? "Enter phone number" :
                                "Click to scan QR"
                        }
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        disabled={selectedMethod === "qr"}
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Amount <span className="required">*</span></label>
                        <div className="amount-input-group">
                          <span className="currency-prefix">₹</span>
                          <input
                            type="number"
                            className="form-input"
                            placeholder="0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            min="1"
                            step="0.01"
                          />
                        </div>
                        <div className="quick-amounts">
                          <button className="quick-amount-btn" onClick={() => handleQuickAmount("500")}>₹500</button>
                          <button className="quick-amount-btn" onClick={() => handleQuickAmount("1000")}>₹1,000</button>
                          <button className="quick-amount-btn" onClick={() => handleQuickAmount("5000")}>₹5,000</button>
                          <button className="quick-amount-btn" onClick={() => handleQuickAmount("10000")}>₹10,000</button>
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Remarks (Optional)</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g., Rent, Shopping, Payment"
                          value={remarks}
                          onChange={(e) => setRemarks(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="balance-check">
                      {state.accounts.find(a => a.id === selectedSourceAccount) && (
                        <>
                          <span>Available Balance: ₹ {state.accounts.find(a => a.id === selectedSourceAccount).balance.toLocaleString("en-IN") || "0"}</span>
                          {amount && parseFloat(amount) > 0 && (
                            <span className="balance-after">
                              Balance after transfer: ₹ {(state.accounts.find(a => a.id === selectedSourceAccount).balance - parseFloat(amount)).toLocaleString("en-IN")}
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    <div className="form-actions">
                      <button
                        className="btn-secondary"
                        onClick={() => {
                          setAmount("");
                          setIdentifier("");
                          setRemarks("");
                          setError("");
                        }}
                      >
                        Clear
                      </button>
                      <button
                        className={`continue-btn ${isProcessing ? 'processing' : ''}`}
                        onClick={handleProceedToPay}
                        disabled={isProcessing || !amount || !identifier}
                      >
                        {isProcessing ? (
                          <>
                            <div className="spinner"></div>
                            Processing...
                          </>
                        ) : (
                          'Proceed to Pay'
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
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
}

export default Transfer;