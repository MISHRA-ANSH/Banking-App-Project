import React, { useState, useEffect } from 'react';
import '../styles/SettingsPage.css';
import {
  FiUser,
  FiLock,
  FiBell,
  FiCreditCard,
  FiMail,
  FiPhone,
  FiMapPin,
  FiGlobe,
  FiEye,
  FiEyeOff,
  FiSave,
  FiEdit2,
  FiCheck,
  FiX,
  FiShield,
  FiKey,
  FiDatabase,
  FiDownload,
  FiTrash2,
  FiUpload,
  FiLogOut,
  FiMoon,
  FiSun,
  FiWifi,
  FiMessageSquare,
  FiCalendar,
  FiHelpCircle,
  FiSmartphone
} from 'react-icons/fi';

const SettingsPage = ({ onBack }) => {
  const [userData, setUserData] = useState({
    firstName: 'Nicola',
    lastName: 'Rich',
    email: 'email@gmail.com',
    phone: '+000 111 222 333',
    street: 'Sesame Street 000',
    zipCode: '1234',
    city: 'NYC',
    country: 'United States'
  });

  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [editField, setEditField] = useState(null);
  const [tempData, setTempData] = useState({});
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    biometricLogin: true,
    autoLogout: true,
    sessionTimeout: 30,
    loginAlerts: true
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    transactionAlerts: true,
    marketingEmails: false,
    securityAlerts: true
  });
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    // Load user data from localStorage
    const storedUser = localStorage.getItem('epic_logged_user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.user) {
        setUserData({
          firstName: user.user.name?.split(' ')[0] || 'Nicola',
          lastName: user.user.name?.split(' ')[1] || 'Rich',
          email: user.user.email || 'email@gmail.com',
          phone: user.user.phone || '+000 111 222 333',
          street: user.user.address?.street || 'Sesame Street 000',
          zipCode: user.user.address?.zipCode || '1234',
          city: user.user.address?.city || 'NYC',
          country: user.user.address?.country || 'United States'
        });
      }
    }
  }, []);

  const handleEditClick = (field) => {
    setIsEditing(true);
    setEditField(field);
    setTempData({ [field]: userData[field] });
  };

  const handleSave = () => {
    if (tempData[editField] !== undefined) {
      setUserData(prev => ({
        ...prev,
        [editField]: tempData[editField]
      }));
      
      // Update localStorage
      const storedUser = localStorage.getItem('epic_logged_user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        const updatedUser = {
          ...user,
          user: {
            ...user.user,
            name: `${editField === 'firstName' ? tempData[editField] : userData.firstName} ${editField === 'lastName' ? tempData[editField] : userData.lastName}`,
            email: editField === 'email' ? tempData[editField] : userData.email,
            phone: editField === 'phone' ? tempData[editField] : userData.phone,
            address: {
              street: editField === 'street' ? tempData[editField] : userData.street,
              zipCode: editField === 'zipCode' ? tempData[editField] : userData.zipCode,
              city: editField === 'city' ? tempData[editField] : userData.city,
              country: editField === 'country' ? tempData[editField] : userData.country
            }
          }
        };
        localStorage.setItem('epic_logged_user', JSON.stringify(updatedUser));
      }
    }
    setIsEditing(false);
    setEditField(null);
    setTempData({});
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditField(null);
    setTempData({});
  };

  const handleInputChange = (e) => {
    setTempData({ [editField]: e.target.value });
  };

  const handleSecurityToggle = (setting) => {
    setSecuritySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleNotificationToggle = (setting) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user_data_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      localStorage.removeItem('epic_logged_user');
      window.location.href = '/';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('epic_logged_user');
    window.location.href = '/';
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: <FiUser /> },
    { id: 'security', label: 'Password & Security', icon: <FiLock /> },
    { id: 'notifications', label: 'Notifications', icon: <FiBell /> },
    { id: 'preferences', label: 'Preferences', icon: <FiGlobe /> },
    { id: 'data', label: 'Data Management', icon: <FiDatabase /> },
    { id: 'billing', label: 'Billing & Plans', icon: <FiCreditCard /> }
  ];

  const renderPersonalInfo = () => (
    <div className="settings-section">
      <div className="settings-section-header">
        <h3>Personal Information</h3>
        <button className="settings-edit-all-btn" onClick={() => setIsEditing(true)}>
          <FiEdit2 /> Edit All
        </button>
      </div>

      <div className="settings-info-grid">
        <InfoField
          label="First Name"
          value={isEditing && editField === 'firstName' ? tempData.firstName || '' : userData.firstName}
          editing={isEditing && editField === 'firstName'}
          onEdit={() => handleEditClick('firstName')}
          onSave={handleSave}
          onCancel={handleCancel}
          onChange={handleInputChange}
          icon={<FiUser />}
        />
        
        <InfoField
          label="Last Name"
          value={isEditing && editField === 'lastName' ? tempData.lastName || '' : userData.lastName}
          editing={isEditing && editField === 'lastName'}
          onEdit={() => handleEditClick('lastName')}
          onSave={handleSave}
          onCancel={handleCancel}
          onChange={handleInputChange}
          icon={<FiUser />}
        />
        
        <InfoField
          label="Email Address"
          value={isEditing && editField === 'email' ? tempData.email || '' : userData.email}
          editing={isEditing && editField === 'email'}
          onEdit={() => handleEditClick('email')}
          onSave={handleSave}
          onCancel={handleCancel}
          onChange={handleInputChange}
          type="email"
          icon={<FiMail />}
        />
        
        <InfoField
          label="Phone Number"
          value={isEditing && editField === 'phone' ? tempData.phone || '' : userData.phone}
          editing={isEditing && editField === 'phone'}
          onEdit={() => handleEditClick('phone')}
          onSave={handleSave}
          onCancel={handleCancel}
          onChange={handleInputChange}
          type="tel"
          icon={<FiPhone />}
        />
        
        <div className="settings-full-width">
          <InfoField
            label="Street Address"
            value={isEditing && editField === 'street' ? tempData.street || '' : userData.street}
            editing={isEditing && editField === 'street'}
            onEdit={() => handleEditClick('street')}
            onSave={handleSave}
            onCancel={handleCancel}
            onChange={handleInputChange}
            icon={<FiMapPin />}
          />
        </div>
        
        <InfoField
          label="ZIP Code"
          value={isEditing && editField === 'zipCode' ? tempData.zipCode || '' : userData.zipCode}
          editing={isEditing && editField === 'zipCode'}
          onEdit={() => handleEditClick('zipCode')}
          onSave={handleSave}
          onCancel={handleCancel}
          onChange={handleInputChange}
          icon={<FiMapPin />}
        />
        
        <InfoField
          label="City"
          value={isEditing && editField === 'city' ? tempData.city || '' : userData.city}
          editing={isEditing && editField === 'city'}
          onEdit={() => handleEditClick('city')}
          onSave={handleSave}
          onCancel={handleCancel}
          onChange={handleInputChange}
          icon={<FiMapPin />}
        />
        
        <InfoField
          label="Country"
          value={isEditing && editField === 'country' ? tempData.country || '' : userData.country}
          editing={isEditing && editField === 'country'}
          onEdit={() => handleEditClick('country')}
          onSave={handleSave}
          onCancel={handleCancel}
          onChange={handleInputChange}
          icon={<FiGlobe />}
        />
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="settings-section">
      <div className="settings-section-header">
        <h3>Password & Security</h3>
      </div>

      <div className="settings-security-grid">
        <div className="settings-security-card">
          <div className="settings-security-header">
            <FiLock className="settings-security-icon" />
            <div>
              <h4>Change Password</h4>
              <p>Update your account password</p>
            </div>
          </div>
          <button className="settings-btn-primary">Change Password</button>
        </div>

        <div className="settings-security-card">
          <div className="settings-security-header">
            <FiShield className="settings-security-icon" />
            <div>
              <h4>Two-Factor Authentication</h4>
              <p>Add an extra layer of security</p>
            </div>
          </div>
          <ToggleSwitch
            checked={securitySettings.twoFactorAuth}
            onChange={() => handleSecurityToggle('twoFactorAuth')}
          />
        </div>

        <div className="settings-security-card">
          <div className="settings-security-header">
            <FiKey className="settings-security-icon" />
            <div>
              <h4>Biometric Login</h4>
              <p>Use fingerprint or face ID</p>
            </div>
          </div>
          <ToggleSwitch
            checked={securitySettings.biometricLogin}
            onChange={() => handleSecurityToggle('biometricLogin')}
          />
        </div>

        <div className="settings-security-card">
          <div className="settings-security-header">
            <FiBell className="settings-security-icon" />
            <div>
              <h4>Login Alerts</h4>
              <p>Get notified of new logins</p>
            </div>
          </div>
          <ToggleSwitch
            checked={securitySettings.loginAlerts}
            onChange={() => handleSecurityToggle('loginAlerts')}
          />
        </div>

        <div className="settings-security-card">
          <div className="settings-security-header">
            <FiCalendar className="settings-security-icon" />
            <div>
              <h4>Auto Logout</h4>
              <p>Logout after inactivity</p>
            </div>
          </div>
          <ToggleSwitch
            checked={securitySettings.autoLogout}
            onChange={() => handleSecurityToggle('autoLogout')}
          />
        </div>

        <div className="settings-security-card">
          <div className="settings-security-header">
            <FiMessageSquare className="settings-security-icon" />
            <div>
              <h4>Session Timeout</h4>
              <p>{securitySettings.sessionTimeout} minutes</p>
            </div>
          </div>
          <select 
            value={securitySettings.sessionTimeout}
            onChange={(e) => setSecuritySettings(prev => ({...prev, sessionTimeout: e.target.value}))}
            className="settings-timeout-select"
          >
            <option value="5">5 minutes</option>
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="60">60 minutes</option>
          </select>
        </div>
      </div>

      <div className="settings-session-history">
        <h4>Active Sessions</h4>
        <div className="settings-session-list">
          <div className="settings-session-item">
            <div className="settings-session-info">
              <div className="settings-session-device">
                <FiSmartphone />
                <span>iPhone 13 • iOS 16</span>
              </div>
              <div className="settings-session-details">
                <span>New York, USA</span>
                <span className="settings-session-time">Now</span>
              </div>
            </div>
            <button className="settings-btn-danger">Logout</button>
          </div>
          <div className="settings-session-item">
            <div className="settings-session-info">
              <div className="settings-session-device">
                <FiDatabase />
                <span>Chrome • Windows 11</span>
              </div>
              <div className="settings-session-details">
                <span>London, UK</span>
                <span className="settings-session-time">2 hours ago</span>
              </div>
            </div>
            <button className="settings-btn-danger">Logout</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="settings-section">
      <div className="settings-section-header">
        <h3>Notification Preferences</h3>
      </div>

      <div className="settings-notification-grid">
        <NotificationToggle
          icon={<FiMail />}
          title="Email Notifications"
          description="Receive important updates via email"
          checked={notificationSettings.emailNotifications}
          onChange={() => handleNotificationToggle('emailNotifications')}
        />
        
        <NotificationToggle
          icon={<FiPhone />}
          title="SMS Notifications"
          description="Get SMS alerts for transactions"
          checked={notificationSettings.smsNotifications}
          onChange={() => handleNotificationToggle('smsNotifications')}
        />
        
        <NotificationToggle
          icon={<FiBell />}
          title="Push Notifications"
          description="App notifications on your device"
          checked={notificationSettings.pushNotifications}
          onChange={() => handleNotificationToggle('pushNotifications')}
        />
        
        <NotificationToggle
          icon={<FiCreditCard />}
          title="Transaction Alerts"
          description="Alerts for all money movements"
          checked={notificationSettings.transactionAlerts}
          onChange={() => handleNotificationToggle('transactionAlerts')}
        />
        
        <NotificationToggle
          icon={<FiMessageSquare />}
          title="Marketing Emails"
          description="Promotions and offers"
          checked={notificationSettings.marketingEmails}
          onChange={() => handleNotificationToggle('marketingEmails')}
        />
        
        <NotificationToggle
          icon={<FiShield />}
          title="Security Alerts"
          description="Important security notifications"
          checked={notificationSettings.securityAlerts}
          onChange={() => handleNotificationToggle('securityAlerts')}
        />
      </div>
    </div>
  );

  const renderPreferences = () => (
    <div className="settings-section">
      <div className="settings-section-header">
        <h3>App Preferences</h3>
      </div>

      <div className="settings-preference-grid">
        <div className="settings-preference-card">
          <div className="settings-preference-header">
            <FiMoon className="settings-preference-icon" />
            <div>
              <h4>Theme</h4>
              <p>Choose app appearance</p>
            </div>
          </div>
          <div className="settings-theme-options">
            <button 
              className={`settings-theme-option ${theme === 'light' ? 'active' : ''}`}
              onClick={() => setTheme('light')}
            >
              <FiSun /> Light
            </button>
            <button 
              className={`settings-theme-option ${theme === 'dark' ? 'active' : ''}`}
              onClick={() => setTheme('dark')}
            >
              <FiMoon /> Dark
            </button>
            <button 
              className={`settings-theme-option ${theme === 'auto' ? 'active' : ''}`}
              onClick={() => setTheme('auto')}
            >
              <FiWifi /> Auto
            </button>
          </div>
        </div>

        <div className="settings-preference-card">
          <div className="settings-preference-header">
            <FiGlobe className="settings-preference-icon" />
            <div>
              <h4>Language</h4>
              <p>App language preference</p>
            </div>
          </div>
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="settings-language-select"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="hi">हिन्दी</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderDataManagement = () => (
    <div className="settings-section">
      <div className="settings-section-header">
        <h3>Data Management</h3>
      </div>

      <div className="settings-data-grid">
        <div className="settings-data-card">
          <div className="settings-data-header">
            <FiDownload className="settings-data-icon" />
            <div>
              <h4>Export Data</h4>
              <p>Download your personal data</p>
            </div>
          </div>
          <button className="settings-btn-primary" onClick={handleExportData}>
            <FiDownload /> Export
          </button>
        </div>

        <div className="settings-data-card">
          <div className="settings-data-header">
            <FiUpload className="settings-data-icon" />
            <div>
              <h4>Import Data</h4>
              <p>Upload your data from file</p>
            </div>
          </div>
          <button className="settings-btn-secondary">
            <FiUpload /> Import
          </button>
        </div>

        <div className="settings-data-card danger">
          <div className="settings-data-header">
            <FiTrash2 className="settings-data-icon" />
            <div>
              <h4>Delete Account</h4>
              <p>Permanently delete your account</p>
            </div>
          </div>
          <button className="settings-btn-danger" onClick={handleDeleteAccount}>
            <FiTrash2 /> Delete Account
          </button>
        </div>
      </div>

      <div className="settings-storage-info">
        <h4>Storage Usage</h4>
        <div className="settings-storage-bar">
          <div className="settings-storage-progress" style={{ width: '65%' }}></div>
        </div>
        <div className="settings-storage-details">
          <span>6.5 GB of 10 GB used</span>
          <button className="settings-btn-secondary settings-btn-sm">Manage Storage</button>
        </div>
      </div>
    </div>
  );

  const renderBilling = () => (
    <div className="settings-section">
      <div className="settings-section-header">
        <h3>Billing & Plans</h3>
      </div>

      <div className="settings-plans-grid">
        <div className="settings-plan-card">
          <div className="settings-plan-header">
            <h4>Basic Plan</h4>
            <div className="settings-plan-price">
              <span className="settings-price">$0</span>
              <span className="settings-period">/month</span>
            </div>
          </div>
          <ul className="settings-plan-features">
            <li>✓ Basic Transactions</li>
            <li>✓ 2 Bank Accounts</li>
            <li>✓ Email Support</li>
            <li>✗ Advanced Analytics</li>
            <li>✗ Priority Support</li>
          </ul>
          <button className="settings-btn-secondary">Current Plan</button>
        </div>

        <div className="settings-plan-card featured">
          <div className="settings-plan-badge">Recommended</div>
          <div className="settings-plan-header">
            <h4>Pro Plan</h4>
            <div className="settings-plan-price">
              <span className="settings-price">$9.99</span>
              <span className="settings-period">/month</span>
            </div>
          </div>
          <ul className="settings-plan-features">
            <li>✓ Unlimited Transactions</li>
            <li>✓ 10 Bank Accounts</li>
            <li>✓ Priority Support</li>
            <li>✓ Advanced Analytics</li>
            <li>✓ Custom Categories</li>
          </ul>
          <button className="settings-btn-primary">Upgrade Now</button>
        </div>

        <div className="settings-plan-card">
          <div className="settings-plan-header">
            <h4>Business Plan</h4>
            <div className="settings-plan-price">
              <span className="settings-price">$29.99</span>
              <span className="settings-period">/month</span>
            </div>
          </div>
          <ul className="settings-plan-features">
            <li>✓ Everything in Pro</li>
            <li>✓ Team Management</li>
            <li>✓ API Access</li>
            <li>✓ Dedicated Manager</li>
            <li>✓ Custom Solutions</li>
          </ul>
          <button className="settings-btn-secondary">Contact Sales</button>
        </div>
      </div>

      <div className="settings-billing-history">
        <h4>Billing History</h4>
        <div className="settings-invoice-list">
          <div className="settings-invoice-item">
            <div className="settings-invoice-info">
              <span className="settings-invoice-date">Jan 15, 2024</span>
              <span className="settings-invoice-desc">Pro Plan Subscription</span>
            </div>
            <div className="settings-invoice-amount">$9.99</div>
            <button className="settings-btn-secondary settings-btn-sm">Download</button>
          </div>
          <div className="settings-invoice-item">
            <div className="settings-invoice-info">
              <span className="settings-invoice-date">Dec 15, 2023</span>
              <span className="settings-invoice-desc">Pro Plan Subscription</span>
            </div>
            <div className="settings-invoice-amount">$9.99</div>
            <button className="settings-btn-secondary settings-btn-sm">Download</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="settings-container">
      <div className="settings-wrapper">
        <div className="settings-header">
          <div className="settings-header-left">
            <h1 className="settings-title">Account Settings</h1>
            <p className="settings-subtitle">Manage your account preferences and security</p>
          </div>
          <button className="settings-back-button" onClick={onBack}>
            ← Back to Dashboard
          </button>
        </div>

        <div className="settings-layout">
          <div className="settings-sidebar">
            <div className="settings-sidebar-header">
              <div className="settings-user-profile">
                <div className="settings-user-avatar">
                  {userData.firstName?.charAt(0)}{userData.lastName?.charAt(0)}
                </div>
                <div className="settings-user-details">
                  <h3>{userData.firstName} {userData.lastName}</h3>
                  <p>{userData.email}</p>
                </div>
              </div>
            </div>
            
            <nav className="settings-nav">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`settings-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="settings-nav-icon">{tab.icon}</span>
                  <span className="settings-nav-label">{tab.label}</span>
                </button>
              ))}
            </nav>

            <div className="settings-sidebar-footer">
              <button className="settings-logout-btn" onClick={handleLogout}>
                <FiLogOut /> Logout
              </button>
              <div className="settings-help-section">
                <button className="settings-help-btn">
                  <FiHelpCircle /> Help & Support
                </button>
              </div>
            </div>
          </div>

          <div className="settings-main-content">
            {activeTab === 'personal' && renderPersonalInfo()}
            {activeTab === 'security' && renderSecurity()}
            {activeTab === 'notifications' && renderNotifications()}
            {activeTab === 'preferences' && renderPreferences()}
            {activeTab === 'data' && renderDataManagement()}
            {activeTab === 'billing' && renderBilling()}
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub Components
const InfoField = ({ label, value, editing, onEdit, onSave, onCancel, onChange, type = 'text', icon }) => (
  <div className="settings-info-field">
    <label>{label}</label>
    {editing ? (
      <div className="settings-edit-mode">
        <div className="settings-input-with-icon">
          {icon}
          <input
            type={type}
            value={value}
            onChange={onChange}
            className="settings-edit-input"
            autoFocus
          />
        </div>
        <div className="settings-edit-actions">
          <button className="settings-save-btn" onClick={onSave}>
            <FiCheck />
          </button>
          <button className="settings-cancel-btn" onClick={onCancel}>
            <FiX />
          </button>
        </div>
      </div>
    ) : (
      <div className="settings-view-mode">
        <div className="settings-value-with-icon">
          {icon}
          <span>{value}</span>
        </div>
        <button className="settings-edit-btn" onClick={onEdit}>
          <FiEdit2 />
        </button>
      </div>
    )}
  </div>
);

const ToggleSwitch = ({ checked, onChange }) => (
  <label className="settings-toggle-switch">
    <input type="checkbox" checked={checked} onChange={onChange} />
    <span className="settings-slider"></span>
  </label>
);

const NotificationToggle = ({ icon, title, description, checked, onChange }) => (
  <div className="settings-notification-item">
    <div className="settings-notification-icon">{icon}</div>
    <div className="settings-notification-content">
      <h4>{title}</h4>
      <p>{description}</p>
    </div>
    <ToggleSwitch checked={checked} onChange={onChange} />
  </div>
);

export default SettingsPage;