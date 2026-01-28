import "../styles/auth.css";
import { FiUser, FiLock, FiCreditCard, FiHash, FiDollarSign, FiSmartphone, FiMail, FiBriefcase, FiKey, FiCheckCircle, FiAlertCircle, FiX } from "react-icons/fi";
import { useState, useEffect } from "react";

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

function SignUp({ onLogin }) {
    const [formData, setFormData] = useState({
        name: "",
        mobile: "",
        email: "",
        crn: "",
        password: "",
        confirmPassword: "",
        mpin: "", // App PIN
        bankName: "Epic Bank",
        accountType: "Savings",
        initialBalance: "",
        transactionPin: "" // Account PIN
    });
    const [step, setStep] = useState(1);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Toast State
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError("");
    };

    const handleNext = (e) => {
        e.preventDefault();
        setError("");

        if (step === 1) {
            if (!formData.name || !formData.mobile || !formData.email || !formData.crn) {
                setError("Please fill in all personal details");
                return;
            }
            // Basic email validation
            if (!/\S+@\S+\.\S+/.test(formData.email)) {
                setError("Please enter a valid email");
                return;
            }
            setStep(2);
        } else if (step === 2) {
            if (!formData.password || !formData.confirmPassword || !formData.mpin) {
                setError("Please fill in all security fields");
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                setError("Passwords do not match");
                return;
            }
            if (formData.mpin.length !== 4 || isNaN(formData.mpin)) {
                setError("App MPIN must be a 4-digit number");
                return;
            }
            setStep(3);
        }
    };

    const handleBack = () => {
        setError("");
        setStep(prev => prev - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Final Validation (Step 3)
        if (!formData.transactionPin) {
            setError("Please set your Transaction MPIN");
            setLoading(false);
            return;
        }

        if (formData.transactionPin.length !== 4 || isNaN(formData.transactionPin)) {
            setError("Transaction PIN must be a 4-digit number");
            setLoading(false);
            return;
        }

        try {
            const usersJSON = localStorage.getItem("epic_all_users") || "[]";
            let users = JSON.parse(usersJSON);

            const cleanCRN = formData.crn.trim();
            const exists = users.some(u => u.user?.crn === cleanCRN);
            if (exists) {
                setError("User with this CRN already exists");
                setLoading(false);
                setStep(1);
                return;
            }

            const newUser = {
                user: {
                    name: formData.name.trim(),
                    customerId: `CUST${Math.floor(100000 + Math.random() * 900000)}`,
                    crn: cleanCRN,
                    mobile: formData.mobile.replace(/\s/g, ''),
                    email: formData.email.trim().toLowerCase(),
                    password: formData.password,
                    upi: `${formData.name.trim().toLowerCase().replace(/\s/g, '')}@okepic`,

                    mpin: formData.mpin
                },
                accounts: [
                    {
                        accountDetails: {
                            bankName: formData.bankName,
                            accountType: formData.accountType,
                            accountNumber: Math.floor(100000000000 + Math.random() * 900000000000).toString(), // 12 digits
                            mpin: formData.transactionPin
                        },
                        balance: {
                            available: parseFloat(formData.initialBalance) || 0,
                            ledger: parseFloat(formData.initialBalance) || 0,
                            currency: "INR",
                            lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16)
                        },
                        transactions: []
                    }
                ]
            };

            // Save to localStorage
            users.push(newUser);
            localStorage.setItem("epic_all_users", JSON.stringify(users));

            // Success
            addToast('Account created successfully!', 'success');
            setTimeout(() => {
                if (onLogin) onLogin();
            }, 2000);


        } catch (err) {
            console.error("Signup error:", err);
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const getStepTitle = () => {
        switch (step) {
            case 1: return "Step 1: Personal Details";
            case 2: return "Step 2: App Security";
            case 3: return "Step 3: Account Setup";
            default: return "";
        }
    };

    return (
        <div className="auth-container">
            {/* Toast Container */}
            <div className="toast-container">
                {toasts.map(toast => (
                    <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
                ))}
            </div>
            <div className="auth-content">
                <div className="auth-left">
                    <div className="auth-brand">
                        <div className="brand-logo">E</div>
                        <h1>Epic-Banking</h1>
                    </div>
                    <h2>Join the Future<br />of Banking.</h2>
                    <p>
                        Create an account in minutes and experience
                        seamless financial management.
                    </p>
                    <div className="auth-features">
                        <span>✓ No Hidden Fees</span>
                        <span>✓ 24/7 Support</span>
                        <span>✓ Secure</span>
                    </div>
                </div>

                <div className="auth-right">
                    <div className="login-header">
                        <h3>Create Account</h3>
                        <p>{getStepTitle()}</p>
                    </div>

                    <form onSubmit={step === 3 ? handleSubmit : handleNext}>
                        {step === 1 && (
                            <>
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <div className="input-group">
                                        <FiUser className="input-icon" />
                                        <input
                                            type="text"
                                            name="name"
                                            placeholder="John Doe"
                                            value={formData.name}
                                            onChange={handleChange}
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Mobile Number</label>
                                    <div className="input-group">
                                        <FiSmartphone className="input-icon" />
                                        <input
                                            type="text"
                                            name="mobile"
                                            placeholder="+91-9876543210"
                                            value={formData.mobile}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Email Address</label>
                                    <div className="input-group">
                                        <FiMail className="input-icon" />
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="john@example.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Choose a CRN (User ID)</label>
                                    <div className="input-group">
                                        <FiHash className="input-icon" />
                                        <input
                                            type="text"
                                            name="crn"
                                            placeholder="e.g. user123"
                                            value={formData.crn}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {step === 2 && (
                            <>
                                <div className="form-group">
                                    <label>Password</label>
                                    <div className="input-group">
                                        <FiLock className="input-icon" />
                                        <input
                                            type="password"
                                            name="password"
                                            placeholder="Create a password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Confirm Password</label>
                                    <div className="input-group">
                                        <FiLock className="input-icon" />
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            placeholder="Confirm password"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Set 4-Digit App MPIN</label>
                                    <div className="input-group">
                                        <FiCreditCard className="input-icon" />
                                        <input
                                            type="text"
                                            name="mpin"
                                            placeholder="0000"
                                            maxLength="4"
                                            value={formData.mpin}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {step === 3 && (
                            <>
                                <div className="form-group">
                                    <label>Bank Name</label>
                                    <div className="input-group">
                                        <FiBriefcase className="input-icon" />
                                        <input
                                            type="text"
                                            name="bankName"
                                            placeholder="e.g. Epic Bank"
                                            value={formData.bankName}
                                            onChange={handleChange}
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Account Type</label>
                                    <div className="input-group">
                                        <FiBriefcase className="input-icon" />
                                        <select
                                            name="accountType"
                                            value={formData.accountType}
                                            onChange={handleChange}
                                            style={{
                                                width: '100%',
                                                padding: '14px 16px 14px 60px',
                                                borderRadius: '12px',
                                                border: '2px solid #e2e8f0',
                                                background: '#ffffff',
                                                color: '#1e293b',
                                                fontSize: '15px',
                                                fontWeight: '500',
                                                appearance: 'none'
                                            }}
                                        >
                                            <option value="Savings">Savings</option>
                                            <option value="Current">Current</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Set 4-Digit Transaction PIN</label>
                                    <div className="input-group">
                                        <FiKey className="input-icon" />
                                        <input
                                            type="text"
                                            name="transactionPin"
                                            placeholder="0000"
                                            maxLength="4"
                                            value={formData.transactionPin}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Initial Deposit (Optional)</label>
                                    <div className="input-group">
                                        <FiDollarSign className="input-icon" />
                                        <input
                                            type="number"
                                            name="initialBalance"
                                            placeholder="0.00"
                                            value={formData.initialBalance}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {error && <div className="error-message">{error}</div>}

                        <div style={{ display: 'flex', gap: '10px' }}>
                            {step > 1 && (
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="auth-btn"
                                    style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)' }}
                                >
                                    Back
                                </button>
                            )}
                            <button type="submit" disabled={loading} className="auth-btn">
                                {loading ? "Creating..." : (step === 3 ? "Sign Up" : "Next")}
                            </button>
                        </div>

                        <p className="forgot-pass" onClick={onLogin}>
                            Already have an account? <b>Log In</b>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default SignUp;
