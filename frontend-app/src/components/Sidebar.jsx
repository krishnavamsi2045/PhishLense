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
} from "react-icons/fi";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: FiActivity, badge: "SOC" },
  { id: "scan", label: "Scan URL", icon: FiSearch, badge: "AI" },
  { id: "threat-intel", label: "Threat Intelligence", icon: FiGlobe },
  { id: "live-feed", label: "Live Feed", icon: FiRadio, pulse: true },
  { id: "reports", label: "Reports", icon: FiFileText },
  { id: "domain-analysis", label: "Domain Analysis", icon: FiCpu },
  { id: "settings", label: "Settings", icon: FiSliders },
  { id: "api-keys", label: "API Keys", icon: FiKey },
  { id: "documentation", label: "Documentation", icon: FiBookOpen },
];

export default function Sidebar({
  activeView,
  setActiveView,
  backendOnline,
  collapsed,
  setCollapsed,
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
              <span className="brand-tag">AI SECURITY COMMAND</span>
            </div>
          )}
        </button>

        <button
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label="Toggle Sidebar Collapse"
        >
          {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="sidebar-nav">
        {!collapsed && <div className="nav-section-title">CORE COMMAND</div>}
        {navItems.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`nav-item ${isActive ? "active" : ""}`}
              title={collapsed ? item.label : undefined}
            >
              <span className="nav-icon">
                <Icon />
              </span>
              {!collapsed && (
                <>
                  <span className="nav-label">{item.label}</span>
                  {item.badge && <span className="nav-badge">{item.badge}</span>}
                  {item.pulse && <span className="live-dot" />}
                </>
              )}
            </button>
          );
        })}

        {!collapsed && <div className="nav-section-title">INTELLIGENCE & OPS</div>}
        {navItems.slice(4, 6).map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`nav-item ${isActive ? "active" : ""}`}
              title={collapsed ? item.label : undefined}
            >
              <span className="nav-icon">
                <Icon />
              </span>
              {!collapsed && (
                <>
                  <span className="nav-label">{item.label}</span>
                  {item.badge && <span className="nav-badge">{item.badge}</span>}
                </>
              )}
            </button>
          );
        })}

        {!collapsed && <div className="nav-section-title">CONFIGURATION</div>}
        {navItems.slice(6).map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`nav-item ${isActive ? "active" : ""}`}
              title={collapsed ? item.label : undefined}
            >
              <span className="nav-icon">
                <Icon />
              </span>
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

      {/* Bottom Status Panel */}
      <div className="sidebar-footer">
        {!collapsed ? (
          <div className="system-status-box">
            <div className="status-row">
              <div className="status-indicator">
                <span
                  className={`status-dot ${
                    backendOnline ? "online" : "offline"
                  }`}
                />
                <span className="status-label">
                  {backendOnline ? "API Online" : "API Offline"}
                </span>
              </div>
              <span className="port-tag">8000</span>
            </div>
            <div className="system-subtext">
              <FiServer style={{ marginRight: 4 }} />
              Python Heuristics & VT API
            </div>
            <div className="version-tag">PhishLense v2.4.0 • Enterprise</div>
          </div>
        ) : (
          <div className="collapsed-status">
            <span
              className={`status-dot ${backendOnline ? "online" : "offline"}`}
              title={backendOnline ? "API Online (8000)" : "API Offline"}
            />
          </div>
        )}
      </div>
    </aside>
  );
}
