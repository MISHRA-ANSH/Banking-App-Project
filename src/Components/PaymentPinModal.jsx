import React, { useState, useEffect, useRef } from 'react';
import { FiLock, FiX, FiCheck, FiCreditCard, FiUser, FiShield } from 'react-icons/fi';
import '../styles/PaymentPinModal.css';

const PaymentPinModal = ({ 
  isOpen, 
  onClose, 
  amount, 
  receiverName, 
  receiverAccount,
  onPaymentSuccess,
  userData 
}) => {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, success, failed
  const inputRefs = useRef([]);

  useEffect(() => {
    if (isOpen) {
      setPin(['', '', '', '']);
      setError('');
      setPaymentStatus('idle');
      setIsProcessing(false);
      
      // Focus first input when modal opens
      setTimeout(() => {
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }, 100);
    }
  }, [isOpen]);

  const handlePinChange = (index, value) => {
    if (value.length > 1) {
      value = value.slice(-1); // Take only last character
    }
    
    if (!/^\d*$/.test(value)) return; // Only allow numbers
    
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError('');

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1].focus();
    }

    // Auto-submit when all digits entered
    if (index === 3 && value) {
      setTimeout(() => {
        handleSubmit();
      }, 300);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      // Move to previous input on backspace
      inputRefs.current[index - 1].focus();
      const newPin = [...pin];
      newPin[index - 1] = '';
      setPin(newPin);
    }
  };

  const verifyUserPin = (enteredPin) => {
    try {
      // Get logged in user from localStorage
      const loggedUser = JSON.parse(localStorage.getItem("epic_logged_user"));
      
      if (!loggedUser || !loggedUser.user) {
        return false;
      }

      // Check if entered PIN matches user's PIN
      // Assuming user object has 'pin' or 'password' field
      const userPin = loggedUser.user.pin || loggedUser.user.password;
      
      if (!userPin) {
        // If no PIN in user data, check all users
        const allUsers = JSON.parse(localStorage.getItem("epic_all_users") || "[]");
        const currentUser = allUsers.find(u => u.user?.crn === loggedUser.user?.crn);
        
        if (currentUser && currentUser.user?.pin) {
          return enteredPin === currentUser.user.pin;
        }
        return false;
      }

      return enteredPin === userPin;
      
    } catch (error) {
      console.error("PIN verification error:", error);
      return false;
    }
  };

  const handleSubmit = async () => {
    const enteredPin = pin.join('');
    
    if (enteredPin.length !== 4) {
      setError('Please enter 4-digit PIN');
      return;
    }

    setIsProcessing(true);
    setError('');

    // Verify PIN against user's actual PIN from localStorage
    const isPinValid = verifyUserPin(enteredPin);

    // Simulate API call delay
    setTimeout(() => {
      setIsProcessing(false);
      
      if (isPinValid) {
        setPaymentStatus('success');
        
        // Call success callback after 2 seconds
        setTimeout(() => {
          onPaymentSuccess();
          onClose();
        }, 2000);
      } else {
        setPaymentStatus('failed');
        setError('Invalid PIN. Please try again.');
        setPin(['', '', '', '']);
        
        // Reset after 2 seconds
        setTimeout(() => {
          setPaymentStatus('idle');
          if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
          }
        }, 2000);
      }
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="pin-modal-overlay">
      <div className="pin-modal-container">
        {/* Header */}
        <div className="pin-modal-header">
          <button className="modal-close-btn" onClick={onClose}>
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
            {userData?.user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="user-details">
            <div className="user-name">{userData?.user?.name || 'User'}</div>
            <div className="user-account">
              Account: {userData?.account?.accountNumber ? 
                `XXXX${userData.account.accountNumber.slice(-4)}` : 'XXXX0000'}
            </div>
          </div>
        </div>

        {/* Amount Display */}
        <div className="pin-amount-display">
          <div className="amount-label">Transfer Amount</div>
          <div className="amount-value">
            ₹ {parseFloat(amount).toLocaleString('en-IN')}
          </div>
          {receiverName && (
            <div className="receiver-info">
              <FiUser className="receiver-icon" />
              <span>
                To: <strong>{receiverName}</strong> 
                {receiverAccount && ` (${receiverAccount.slice(-4)})`}
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
                ref={el => inputRefs.current[index] = el}
                type="password"
                maxLength="1"
                value={pin[index]}
                onChange={(e) => handlePinChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={isProcessing || paymentStatus === 'success'}
                className={error ? 'pin-input error' : 'pin-input'}
                autoComplete="off"
              />
            ))}
          </div>

          {error && (
            <div className="pin-error-message">
              {error}
            </div>
          )}
        </div>

        {/* Processing State */}
        {isProcessing && (
          <div className="processing-indicator">
            <div className="spinner"></div>
            <div className="processing-text">Verifying PIN...</div>
          </div>
        )}

        {/* Success State */}
        {paymentStatus === 'success' && (
          <div className="success-state">
            <div className="success-icon">✓</div>
            <div className="success-message">
              Payment Successful!
            </div>
            <div className="success-details">
              ₹{parseFloat(amount).toLocaleString('en-IN')} transferred to {receiverName}
            </div>
          </div>
        )}

        {/* Failed State */}
        {paymentStatus === 'failed' && (
          <div className="failed-state">
            <div className="failed-icon">✗</div>
            <div className="failed-message">
              Payment Failed
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pin-action-buttons">
          {paymentStatus === 'idle' && !isProcessing && (
            <>
              <button 
                className="cancel-btn" 
                onClick={onClose}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button 
                className="submit-btn" 
                onClick={handleSubmit}
                disabled={isProcessing || pin.join('').length !== 4}
              >
                Confirm Payment
              </button>
            </>
          )}
        </div>

        {/* Security Note */}
        <div className="security-note">
          <FiShield />
          <span>Your transaction is secured with bank-level encryption</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentPinModal;