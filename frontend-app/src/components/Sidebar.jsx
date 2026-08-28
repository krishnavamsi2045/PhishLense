import React from "react";
import {
  FiShield,
  FiActivity,
  FiSearch,
  FiGlobe,
  FiFileText,
  FiSliders,
  FiKey,
  FiCpu,
  FiChevronLeft,
  FiChevronRight,
  FiRadio,
  FiBarChart2,
  FiLogOut,
} from "react-icons/fi";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: FiActivity, badge: "LIVE" },
  { id: "scan", label: "URL Scanner", icon: FiSearch, badge: "AI" },
  { id: "threat-intel", label: "Threat Intelligence", icon: FiGlobe },
  { id: "live-feed", label: "Live Threat Feed", icon: FiRadio, pulse: true },
  { id: "analytics", label: "Analytics & Trends", icon: FiBarChart2 },
  { id: "reports", label: "Investigation Reports", icon: FiFileText },
  { id: "admin-ml", label: "ML Model Center", icon: FiCpu, badge: "65k" },
  { id: "domain-analysis", label: "Domain & SSL Guard", icon: FiShield },
  { id: "api-keys", label: "API Keys", icon: FiKey },
  { id: "settings", label: "Settings", icon: FiSliders },
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
  return (
    <aside
      className={`sidebar-shell ${collapsed ? "collapsed" : ""}`}
      aria-label="Navigation Sidebar"
    >
      {/* Brand Header */}
      <div className="sidebar-header">
        <button
          className="brand-logo"
          onClick={() => setActiveView("dashboard")}
          title="PhishLense AI Intelligence"
        >
          <div className="logo-shield">
            <FiShield />
          </div>
          {!collapsed && (
            <div className="brand-text">
              <span className="brand-name">PHISHLENSE</span>
              <span className="brand-tag">AI CYBER DEFENSE</span>
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

      {/* Single Unified Navigation Menu */}
      <div className="sidebar-scroll-container">
        <nav className="nav-menu">
          {navItems.map((item) => {
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

      {/* Footer Operator Badge & Logout */}
      <div className="sidebar-footer">
        <div className="operator-card">
          <div className="operator-avatar">
            <span>{user?.full_name?.charAt(0) || "P"}</span>
          </div>
          {!collapsed && (
            <div className="operator-info">
              <span className="operator-name">{user?.full_name || "PhishLense Analyst"}</span>
              <span className="operator-role">{user?.email || "phishlense@analyst.com"}</span>
            </div>
          )}
        </div>

        <button
          className="logout-action-btn"
          onClick={onLogout}
          title="Sign Out"
        >
          <FiLogOut />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
