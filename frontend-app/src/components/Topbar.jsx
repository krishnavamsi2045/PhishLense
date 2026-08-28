import React, { useState } from "react";
import {
  FiSearch,
  FiBell,
  FiShield,
  FiCheckCircle,
  FiMenu,
  FiLogOut,
  FiUser,
  FiSliders,
} from "react-icons/fi";

export default function Topbar({
  activeView,
  setActiveView,
  onOpenCommandPalette,
  stats,
  notifications = [],
  onClearNotifications,
  mobileMenuOpen,
  setMobileMenuOpen,
  user,
  onLogout,
  onOpenAuth,
}) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const totalThreats = (stats?.phishing || 0) + (stats?.suspicious || 0);
  const threatLevel =
    stats?.phishing > 0 ? "ELEVATED" : totalThreats > 0 ? "MONITORING" : "SECURE";

  const displayName = user?.full_name || "PhishLense Analyst";
  const displayEmail = user?.email || "phishlense@analyst.com";

  return (
    <header className="topbar-shell">
      {/* Left Area: Mobile Menu Toggle & Search Bar */}
      <div className="topbar-left">
        <button
          className="mobile-nav-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Mobile Menu"
        >
          <FiMenu />
        </button>

        <div className="command-search-bar" onClick={onOpenCommandPalette}>
          <FiSearch className="search-icon" />
          <span className="search-placeholder">
            Search threats, domains, IoCs...
          </span>
          <kbd className="cmd-badge">
            <span>Ctrl</span>K
          </kbd>
        </div>

        {/* Threat Level Badge */}
        <div className={`defense-status-pill ${threatLevel.toLowerCase()}`}>
          <span className="pulse-dot" />
          <span className="status-label">DEFENSE LEVEL: {threatLevel}</span>
        </div>
      </div>

      {/* Right Area: Notifications & Clean User Profile */}
      <div className="topbar-right">
        {/* Notifications Dropdown */}
        <div className="notif-wrapper">
          <button
            className="notif-bell-btn"
            onClick={() => setNotifOpen(!notifOpen)}
            title="Investigation Alerts"
          >
            <FiBell />
            {notifications.length > 0 && (
              <span className="notif-count-badge">{notifications.length}</span>
            )}
          </button>

          {notifOpen && (
            <div className="notif-dropdown-card glass-panel">
              <div className="notif-header">
                <span className="notif-title">Security Incident Alerts</span>
                {notifications.length > 0 && (
                  <button
                    className="notif-clear-btn"
                    onClick={onClearNotifications}
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="notif-list">
                {notifications.length === 0 ? (
                  <div className="notif-empty">
                    <FiCheckCircle className="empty-icon" />
                    <span>Zero unacknowledged security alerts</span>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className={`notif-item ${n.type || "info"}`}>
                      <div className="notif-item-header">
                        <span className="item-title">{n.title}</span>
                        <span className="item-time">{n.time}</span>
                      </div>
                      <p className="item-msg">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Identity Profile Pill / Dropdown */}
        <div className="user-profile-menu-wrap">
          {user ? (
            <button
              className="user-identity-pill"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            >
              <div className="avatar-chip">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="identity-text">
                <span className="user-name-title">{displayName}</span>
                <span className="user-email-subtitle">{displayEmail}</span>
              </div>
            </button>
          ) : (
            <button className="topbar-login-btn" onClick={onOpenAuth}>
              <FiUser />
              <span>Authenticate</span>
            </button>
          )}

          {profileDropdownOpen && user && (
            <div className="profile-dropdown glass-panel">
              <div className="profile-drop-header">
                <div className="avatar-large">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="drop-user-details">
                  <strong className="drop-user-name">{displayName}</strong>
                  <span className="drop-user-email">{displayEmail}</span>
                  <span className="role-tag analyst">Authenticated Analyst</span>
                </div>
              </div>

              <div className="profile-drop-actions">
                <button
                  className="drop-act-item"
                  onClick={() => {
                    setActiveView("settings");
                    setProfileDropdownOpen(false);
                  }}
                >
                  <FiSliders />
                  <span>Profile & Settings</span>
                </button>
                <button
                  className="drop-act-item danger"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onLogout();
                  }}
                >
                  <FiLogOut />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
