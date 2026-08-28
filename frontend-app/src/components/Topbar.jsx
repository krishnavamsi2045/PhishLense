import React, { useState, useEffect } from "react";
import {
  FiSearch,
  FiBell,
  FiShield,
  FiActivity,
  FiTerminal,
  FiX,
  FiCheckCircle,
  FiAlertTriangle,
  FiMenu,
  FiLogOut,
  FiUser,
  FiCpu,
  FiZap,
} from "react-icons/fi";

export default function Topbar({
  activeView,
  setActiveView,
  onOpenCommandPalette,
  onOpenTerminal,
  stats,
  notifications = [],
  onClearNotifications,
  mobileMenuOpen,
  setMobileMenuOpen,
  user,
  onLogout,
  onOpenAuth,
}) {
  const [currentTime, setCurrentTime] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const utcString = now.toUTCString().split(" ")[4] + " UTC";
      setCurrentTime(utcString);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const isAdmin = user?.role === "ADMIN";
  const totalThreats = (stats?.phishing || 0) + (stats?.suspicious || 0);
  const threatLevel =
    stats?.phishing > 0 ? "ELEVATED" : totalThreats > 0 ? "MONITORING" : "SECURE";

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
            Search threats, domains, IPs...
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

      {/* Right Area: Time, Fast Scan, Notifications, Profile */}
      <div className="topbar-right">
        {/* UTC Clock */}
        <div className="utc-clock-badge">
          <FiActivity className="clock-icon" />
          <span>{currentTime || "12:00:00 UTC"}</span>
        </div>

        {/* Scan URL Primary Action */}
        <button
          className="topbar-scan-btn glow-button"
          onClick={() => setActiveView("scan")}
        >
          <FiShield className="btn-icon" />
          <span>Scan URL</span>
        </button>

        {/* Interactive Terminal Quick Launch */}
        <button
          className="topbar-terminal-btn"
          onClick={onOpenTerminal}
          title="Open Threat Terminal (`)"
        >
          <FiTerminal />
          <span>Terminal</span>
        </button>

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
                <span className="notif-title">SOC Incident Alerts</span>
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
              className={`user-identity-pill ${isAdmin ? "admin" : "analyst"}`}
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            >
              <div className="avatar-chip">
                {user.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="identity-text">
                <strong className="user-title">{user.full_name}</strong>
                <span className="user-clearance">
                  {isAdmin ? "COMMANDER (ADMIN)" : "ANALYST (USER)"}
                </span>
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
                <strong>{user.full_name}</strong>
                <span>{user.email}</span>
                <span className={`role-tag ${isAdmin ? "admin" : "analyst"}`}>
                  {user.role} Clearances
                </span>
              </div>

              <div className="profile-drop-actions">
                {isAdmin && (
                  <button
                    className="drop-act-item"
                    onClick={() => {
                      setActiveView("admin-overview");
                      setProfileDropdownOpen(false);
                    }}
                  >
                    <FiShield />
                    <span>Admin Command Center</span>
                  </button>
                )}

                <button
                  className="drop-act-item"
                  onClick={() => {
                    setActiveView("dashboard");
                    setProfileDropdownOpen(false);
                  }}
                >
                  <FiActivity />
                  <span>SOC Analyst Workspace</span>
                </button>

                <button
                  className="drop-act-item"
                  onClick={() => {
                    setActiveView("settings");
                    setProfileDropdownOpen(false);
                  }}
                >
                  <FiUser />
                  <span>Profile & Security</span>
                </button>

                <div className="divider" />

                <button
                  className="drop-act-item logout"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onLogout();
                  }}
                >
                  <FiLogOut />
                  <span>End Session (Logout)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
