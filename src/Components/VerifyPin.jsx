// import "../styles/VerifyPin.css";
// import { FiKey } from "react-icons/fi";

// function VerifyPin({ onNext }) {
//   return (
//     <div className="auth-container">
//       <div className="auth-left">
//         <h2>Epic is personal finance, made simple.</h2>
//         <p>Secure access using your PIN</p>
//       </div>

//       <div className="auth-right">
//         <h3>Verify your PIN</h3>
//         <p>Enter your 4-digit PIN</p>

//         <div className="pin-box">
//           <input maxLength="1" />
//           <input maxLength="1" />
//           <input maxLength="1" />
//           <input maxLength="1" />
//         </div>

//         <button>
//           <FiKey /> Verify
//         </button>
//       </div>
//     </div>
//   );
// }

// export default VerifyPin;



import "../styles/VerifyPin.css";
import { FiKey } from "react-icons/fi";
import { useState, useRef } from "react";

function VerifyPin({ onNext }) {
  const [pin, setPin] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const inputs = useRef([]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);
    setError("");

    if (value && index < 3) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").slice(0, 4);
    if (!/^\d+$/.test(paste)) return;

    const newPin = paste.split("").slice(0, 4);
    setPin(newPin);

    const lastIndex = newPin.length - 1;
    inputs.current[lastIndex]?.focus();
  };

  const handleVerify = () => {
    const enteredPin = pin.join("");

    if (enteredPin.length !== 4) {
      setError("Please enter 4-digit PIN");
      return;
    }

    // 🔥 get logged-in user from localStorage
    const storedUser = JSON.parse(
      localStorage.getItem("epic_logged_user")
    );

    if (!storedUser) {
      setError("Session expired. Please login again.");
      return;
    }

    // 🔥 compare MPIN
    if (storedUser.user.mpin !== enteredPin) {
      setError("Invalid PIN");
      return;
    }

    // ✅ PIN verified
    localStorage.setItem("epic_pin_verified", "true");

    if (onNext) onNext();
  };

  return (
    <div className="auth-container">
      <div className="auth-content">
        <div className="auth-left">
          <div className="auth-brand">
            <div className="brand-logo">E</div>
            <h1>Epic-Banking</h1>
          </div>
          <h2>Two-Step<br />Verification</h2>
          <p>For your security, please enter your 4-digit PIN to continue.</p>
        </div>

        <div className="auth-right">
          <div className="login-header">
            <h3>Verify Identity</h3>
            <p>Enter your 4-digit Security PIN</p>
          </div>

          <div className="pin-box">
            {pin.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputs.current[index] = el)}
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                type="password" // CHANGED TO PASSWORD
                inputMode="numeric"
                className="pin-input"
              />
            ))}
          </div>

          {error && <div className="error-message">{error}</div>}

          <button onClick={handleVerify} className="auth-btn">
            <FiKey /> Verify PIN
          </button>
        </div>
      </div>
    </div>
  );
}

export default VerifyPin;
