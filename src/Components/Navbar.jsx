import React, { useState, useEffect } from "react";
import "../styles/Navbar.css";
import {
  FiHome,
  FiRepeat,
  FiFileText,
  FiCreditCard,
  FiTrendingUp,
  FiSettings,
  FiLogOut,
  FiBell,
  FiUser,
  FiMenu,
  FiX
} from "react-icons/fi";

function Navbar({ onChangePage, onLogout, activePage = "home" }) {
  const [userData, setUserData] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [notifications, setNotifications] = useState(3);

  useEffect(() => {
    const storedUser = localStorage.getItem('epic_logged_user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserData(user);
    }
  }, []);

  const navItems = [
    { id: "home", label: "Dashboard", icon: <FiHome /> },
    { id: "transfer", label: "Transfer", icon: <FiRepeat /> },
    { id: "transactions", label: "Transactions", icon: <FiFileText /> },
    { id: "accounts", label: "Accounts & Cards", icon: <FiCreditCard /> },
    { id: "investments", label: "Investments", icon: <FiTrendingUp /> }
  ];

  const handleNavClick = (pageId) => {
    onChangePage(pageId);
    setShowMobileMenu(false);
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <>
      <nav className="top-navbar">
        <div className="navbar-container">
          {/* Left: Logo */}
          <div className="navbar-logo">
            <div className="logo-icon">
              <span className="logo-symbol">E</span>
            </div>
            <span className="logo-text">Epic-Banking</span>
          </div>

          {/* Center: Navigation Items */}
          <div className={`navbar-nav ${showMobileMenu ? 'mobile-active' : ''}`}>
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Right: User Actions */}
          <div className="navbar-actions">
            <button className="action-btn notification-btn" title="Notifications">
              <FiBell />
              {notifications > 0 && <span className="notification-badge">{notifications}</span>}
            </button>

            <button
              className="action-btn settings-btn"
              onClick={() => handleNavClick("settings")}
              title="Settings"
            >
              <FiSettings />
            </button>

            <div className="profile-section">
              <button
                className="profile-btn"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <div className="profile-avatar">
                  {userData?.user?.name ? getInitials(userData.user.name) : <FiUser />}
                </div>
                <div className="profile-info">
                  <span className="profile-name">{userData?.user?.name || 'User'}</span>
                  <span className="profile-role">Account Holder</span>
                </div>
              </button>

              {showProfileMenu && (
                <div className="profile-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-avatar">
                      {userData?.user?.name ? getInitials(userData.user.name) : <FiUser />}
                    </div>
                    <div className="dropdown-info">
                      <span className="dropdown-name">{userData?.user?.name || 'User'}</span>
                      <span className="dropdown-email">{userData?.user?.email || 'user@epic.com'}</span>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item" onClick={() => handleNavClick("settings")}>
                    <FiSettings />
                    <span>Settings</span>
                  </button>
                  <button className="dropdown-item logout-item" onClick={onLogout}>
                    <FiLogOut />
                    <span>Log out</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="mobile-menu-toggle"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>

        {/* Mobile Overlay */}
        {showMobileMenu && (
          <div
            className="mobile-overlay"
            onClick={() => setShowMobileMenu(false)}
          ></div>
        )}
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="bottom-navbar">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`bottom-nav-item ${activePage === item.id ? "active" : ""}`}
            onClick={() => handleNavClick(item.id)}
          >
            <span className="bottom-nav-icon">{item.icon}</span>
            <span className="bottom-nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}

export default Navbar;