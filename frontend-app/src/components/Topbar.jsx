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
}) {
  const [currentTime, setCurrentTime] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);

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

  const totalThreats = (stats?.phishing || 0) + (stats?.suspicious || 0);
  const threatLevel =
    stats?.phishing > 0 ? "ELEVATED" : totalThreats > 0 ? "MONITORING" : "SECURE";

  return (
    <header className="topbar-shell">
      {/* Left Area: Mobile Menu Toggle & Breadcrumbs */}
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
            <span>Ctrl</span> <span>K</span>
          </kbd>
        </div>
      </div>

      {/* Right Area: System Status, Live UTC, Quick Scan, Notifications, Profile */}
      <div className="topbar-right">
        {/* Threat State Pill */}
        <div className={`threat-status-pill ${threatLevel.toLowerCase()}`}>
          <span className="pulse-indicator" />
          <span className="threat-status-text">
            {threatLevel === "ELEVATED"
              ? "DEFENSE LEVEL: ELEVATED"
              : threatLevel === "MONITORING"
              ? "DEFENSE LEVEL: GUARDED"
              : "DEFENSE LEVEL: SECURE"}
          </span>
        </div>

        {/* Live UTC Clock */}
        <div className="utc-clock">
          <FiActivity className="clock-icon" />
          <span>{currentTime || "00:00:00 UTC"}</span>
        </div>

        {/* Quick Scan Action */}
        <button
          className="quick-scan-btn"
          onClick={() => setActiveView("scan")}
          title="Open AI URL Scanner"
        >
          <FiShield className="btn-icon" />
          <span>Scan URL</span>
        </button>

        {/* Terminal Button */}
        <button
          className="quick-scan-btn"
          style={{ background: "rgba(0, 229, 255, 0.12)", borderColor: "var(--phish-cyan)" }}
          onClick={onOpenTerminal}
          title="Open SOC Cyber Terminal"
        >
          <FiTerminal className="btn-icon" />
          <span>Terminal</span>
        </button>

        {/* Notifications */}
        <div className="notif-wrapper">
          <button
            className="notif-bell-btn"
            onClick={() => setNotifOpen(!notifOpen)}
            aria-label="View notifications"
            title="System notifications"
          >
            <FiBell />
            {notifications.length > 0 && (
              <span className="notif-counter">{notifications.length}</span>
            )}
          </button>

          {notifOpen && (
            <div className="notif-dropdown">
              <div className="notif-header">
                <span>SOC Notifications ({notifications.length})</span>
                {notifications.length > 0 && (
                  <button
                    className="notif-clear-btn"
                    onClick={() => {
                      onClearNotifications();
                      setNotifOpen(false);
                    }}
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="notif-list">
                {notifications.length === 0 ? (
                  <div className="notif-empty">
                    <FiCheckCircle style={{ fontSize: 24, color: "var(--phish-cyan)", marginBottom: 8 }} />
                    <p>All threat telemetry normal. No pending alerts.</p>
                  </div>
                ) : (
                  notifications.map((n, idx) => (
                    <div key={idx} className={`notif-card ${n.type || "info"}`}>
                      <div className="notif-title">
                        {n.type === "threat" ? (
                          <FiAlertTriangle style={{ color: "var(--phish-red)" }} />
                        ) : (
                          <FiTerminal style={{ color: "var(--phish-cyan)" }} />
                        )}
                        <span>{n.title}</span>
                      </div>
                      <p className="notif-desc">{n.message}</p>
                      <span className="notif-time">{n.time || "Just now"}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Analyst Profile */}
        <div className="analyst-badge" title="Security Operations Center — Analyst L3">
          <div className="analyst-avatar">SOC</div>
          <div className="analyst-info">
            <span className="analyst-role">Analyst L3</span>
            <span className="analyst-id">SEC-9082</span>
          </div>
        </div>
      </div>
    </header>
  );
}
