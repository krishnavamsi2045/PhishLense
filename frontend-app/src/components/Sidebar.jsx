import React from "react";
import {
  FiShield,
  FiActivity,
  FiSearch,
  FiGlobe,
  FiFileText,
  FiSliders,
  FiKey,
  FiBookOpen,
  FiCpu,
  FiChevronLeft,
  FiChevronRight,
  FiRadio,
  FiServer,
  FiUsers,
  FiDatabase,
  FiLayers,
  FiBarChart2,
  FiLogOut,
  FiLock,
  FiUserCheck,
} from "react-icons/fi";

const userNavItems = [
  { id: "dashboard", label: "Dashboard", icon: FiActivity, badge: "SOC" },
  { id: "scan", label: "URL Scanner", icon: FiSearch, badge: "AI" },
  { id: "threat-intel", label: "Threat Intelligence", icon: FiGlobe },
  { id: "live-feed", label: "Live Threat Feed", icon: FiRadio, pulse: true },
  { id: "analytics", label: "Analytics & Trends", icon: FiBarChart2 },
  { id: "reports", label: "Investigation Reports", icon: FiFileText },
  { id: "domain-analysis", label: "Domain & SSL Guard", icon: FiCpu },
  { id: "settings", label: "Profile & Settings", icon: FiSliders },
  { id: "api-keys", label: "API Keys", icon: FiKey },
  { id: "documentation", label: "API Documentation", icon: FiBookOpen },
];

const adminNavItems = [
  { id: "admin-overview", label: "Security Overview", icon: FiShield, badge: "CORE" },
  { id: "admin-users", label: "User Management", icon: FiUsers },
  { id: "admin-scans", label: "Global Scan Center", icon: FiActivity },
  { id: "admin-threat-feeds", label: "Threat Feed Monitor", icon: FiRadio },
  { id: "admin-ml", label: "ML Model Center", icon: FiCpu, badge: "65k" },
  { id: "admin-dataset", label: "Dataset Explorer", icon: FiDatabase },
  { id: "admin-audit", label: "SOC Audit Logs", icon: FiFileText },
  { id: "admin-health", label: "System Health", icon: FiServer },
];

export default function Sidebar({
  activeView,
  setActiveView,
  backendOnline,
  collapsed,
  setCollapsed,
  user,
  onLogout,
}) {
  const isAdmin = user?.role === "ADMIN";

  return (
    <aside
      className={`sidebar-shell ${collapsed ? "collapsed" : ""}`}
      aria-label="Navigation Sidebar"
    >
      {/* Brand Header */}
      <div className="sidebar-header">
        <button
          className="brand-logo"
          onClick={() => setActiveView(isAdmin ? "admin-overview" : "dashboard")}
          title="PhishLense AI Intelligence"
        >
          <div className="logo-shield">
            <FiShield />
          </div>
          {!collapsed && (
            <div className="brand-text">
              <span className="brand-name">PHISHLENSE</span>
              <span className="brand-tag">V3 ENTERPRISE SOC</span>
            </div>
          )}
        </button>

        <button
          className="collapse-toggle-btn"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>
      </div>

      {/* Navigation Links Scroll Container */}
      <div className="sidebar-scroll-container">
        {/* Admin Navigation Section */}
        {isAdmin && (
          <div className="nav-group">
            {!collapsed && (
              <div className="nav-group-title">
                <span>ADMIN COMMAND PORTAL</span>
              </div>
            )}
            <nav className="nav-menu">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    className={`nav-item ${isActive ? "active admin" : ""}`}
                    onClick={() => setActiveView(item.id)}
                    title={collapsed ? item.label : ""}
                  >
                    <div className="nav-icon-wrap">
                      <Icon className="nav-icon" />
                    </div>
                    {!collapsed && (
                      <>
                        <span className="nav-label">{item.label}</span>
                        {item.badge && (
                          <span className="nav-badge admin-badge">{item.badge}</span>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        )}

        {/* User / Analyst Navigation Section */}
        <div className="nav-group">
          {!collapsed && (
            <div className="nav-group-title">
              <span>{isAdmin ? "SOC ANALYST WORKSPACE" : "ANALYST WORKSPACE"}</span>
            </div>
          )}
          <nav className="nav-menu">
            {userNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  className={`nav-item ${isActive ? "active" : ""}`}
                  onClick={() => setActiveView(item.id)}
                  title={collapsed ? item.label : ""}
                >
                  <div className="nav-icon-wrap">
                    <Icon className="nav-icon" />
                    {item.pulse && <span className="icon-pulse-dot" />}
                  </div>
                  {!collapsed && (
                    <>
                      <span className="nav-label">{item.label}</span>
                      {item.badge && <span className="nav-badge">{item.badge}</span>}
                    </>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Operator User Card Footer */}
      <div className="sidebar-footer">
        {!collapsed && user && (
          <div className="operator-profile-card">
            <div className={`operator-avatar ${isAdmin ? "admin" : "analyst"}`}>
              {user.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="operator-meta">
              <span className="op-name">{user.full_name}</span>
              <span className={`op-role ${isAdmin ? "admin" : "analyst"}`}>
                {isAdmin ? "SOC COMMANDER" : "SOC ANALYST"}
              </span>
            </div>
            <button
              className="op-logout-btn"
              title="End Secure Session"
              onClick={onLogout}
            >
              <FiLogOut />
            </button>
          </div>
        )}

        <div className="system-status-indicator">
          <div className={`status-dot ${backendOnline ? "online" : "offline"}`} />
          {!collapsed && (
            <div className="status-text">
              <span className="status-title">
                {backendOnline ? "FASTAPI ENGINE ARMED" : "GATEWAY OFFLINE"}
              </span>
              <span className="status-sub">
                {backendOnline ? "PORT 8000 • RFC 3986" : "RECONNECTING..."}
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
