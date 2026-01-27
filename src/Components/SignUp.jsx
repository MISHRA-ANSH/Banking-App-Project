import "../styles/auth.css";
import { FiUser, FiLock, FiCreditCard, FiHash, FiDollarSign } from "react-icons/fi";
import { useState } from "react";

function SignUp({ onLogin }) {
    const [formData, setFormData] = useState({
        name: "",
        crn: "",
        password: "",
        confirmPassword: "",
        mpin: "",
        initialBalance: ""
    });
    const [step, setStep] = useState(1);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError("");
    };

    const handleNext = (e) => {
        e.preventDefault();
        setError("");

        if (step === 1) {
            if (!formData.name || !formData.crn || !formData.password || !formData.confirmPassword) {
                setError("Please fill in all fields");
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                setError("Passwords do not match");
                return;
            }
            setStep(2);
        }
    };

    const handleBack = () => {
        setError("");
        setStep(1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!formData.mpin) {
            setError("Please set your MPIN");
            setLoading(false);
            return;
        }

        if (formData.mpin.length !== 4 || isNaN(formData.mpin)) {
            setError("MPIN must be a 4-digit number");
            setLoading(false);
            return;
        }

        try {
            const usersJSON = localStorage.getItem("epic_all_users") || "[]";
            let users = JSON.parse(usersJSON);

            const exists = users.some(u => u.user?.crn === formData.crn);
            if (exists) {
                setError("User with this CRN already exists");
                setLoading(false);
                setStep(1); 
                return;
            }

            // Create new user object
            const newUser = {
                user: {
                    name: formData.name,
                    crn: formData.crn,
                    password: formData.password,
                    pin: formData.mpin,
                    email: `${formData.crn}@example.com`, // Placeholder
                    mobile: "1234567890" // Placeholder
                },
                accounts: [
                    {
                        id: `ACC${Date.now()}`,
                        accountNumber: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
                        accountType: "Savings",
                        bankName: "Epic Bank",
                        balance: {
                            currency: "INR",
                            available: parseFloat(formData.initialBalance) || 0
                        },
                        mpin: formData.mpin,
                        transactions: [],
                        status: "active"
                    }
                ],
                transactions: []
            };

            // Save to localStorage
            users.push(newUser);
            localStorage.setItem("epic_all_users", JSON.stringify(users));

            // Success
            alert("Account created successfully! Please login.");
            if (onLogin) onLogin();

        } catch (err) {
            console.error("Signup error:", err);
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
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
                        <p>{step === 1 ? "Step 1: Personal Details" : "Step 2: Account Security"}</p>
                    </div>

                    <form onSubmit={step === 1 ? handleNext : handleSubmit}>
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
                            </>
                        )}

                        {step === 2 && (
                            <>
                                <div className="form-group">
                                    <label>Set 4-Digit MPIN</label>
                                    <div className="input-group">
                                        <FiCreditCard className="input-icon" />
                                        <input
                                            type="text"
                                            name="mpin"
                                            placeholder="0000"
                                            maxLength="4"
                                            value={formData.mpin}
                                            onChange={handleChange}
                                            autoFocus
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
                            {step === 2 && (
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
                                {loading ? "Creating..." : (step === 1 ? "Next" : "Sign Up")}
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
