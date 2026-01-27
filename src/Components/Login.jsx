import "../styles/auth.css";
import { FiUser, FiLock } from "react-icons/fi";
import { useState, useEffect } from "react";

function Login({ onNext, onSignUp }) {
  const [crn, setCrn] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Initialize data if not present
  useEffect(() => {
    const initializeData = async () => {
      try {
        const usersJSON = localStorage.getItem("epic_all_users");

        if (!usersJSON) {
          const res = await fetch("/dashboardData.json");
          if (!res.ok) throw new Error("Failed to load data");

          const data = await res.json();
          localStorage.setItem("epic_all_users", JSON.stringify(data));
          console.log("Initial data loaded successfully");
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };

    initializeData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!crn.trim() || !password.trim()) {
      setError("Please enter CRN and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // First check localStorage
      const usersJSON = localStorage.getItem("epic_all_users");
      if (!usersJSON) {
        setError("Data not available. Please refresh.");
        setLoading(false);
        return;
      }

      const data = JSON.parse(usersJSON);

      // Find user by CRN and password
      const matchedUser = data.find(
        (item) =>
          item.user.crn &&
          item.user.password &&
          item.user.crn.trim() === crn.trim() &&
          item.user.password.trim() === password.trim()
      );

      if (!matchedUser) {
        setError("Invalid CRN or password");
        setLoading(false);
        return;
      }

      // ✅ Save to localStorage
      localStorage.setItem("epic_logged_user", JSON.stringify(matchedUser));
      localStorage.setItem("epic_logged_in", "true");

      setLoading(false);

      if (onNext) onNext(matchedUser);

    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
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
          <h2>Banking made personal,<br />simple & secure.</h2>
          <p>
            Manage all your accounts, cards, savings,
            and investments in one unified platform.
          </p>
          <div className="auth-features">
            <span>✓ Secure</span>
            <span>✓ Fast</span>
            <span>✓ Reliable</span>
          </div>
        </div>

        <div className="auth-right">
          <div className="login-header">
            <h3>Welcome Back</h3>
            <p>Log in to access your dashboard</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>CRN Number</label>
              <div className="input-group">
                <FiUser className="input-icon" />
                <input
                  type="text"
                  placeholder="Enter your CRN"
                  value={crn}
                  onChange={(e) => {
                    setCrn(e.target.value);
                    if (error) setError("");
                  }}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-group">
                <FiLock className="input-icon" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                />
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" disabled={loading} className="auth-btn">
              {loading ? "Verifying..." : "Log In Securely"}
            </button>

            <p className="forgot-pass">Forgot Password?</p>

            <p className="forgot-pass" onClick={onSignUp} style={{ marginTop: '10px' }}>
              Don't have an account? <b>Sign Up</b>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;