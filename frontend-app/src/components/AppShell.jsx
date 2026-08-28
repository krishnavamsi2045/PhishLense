import React, { useState, useEffect, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import CommandPalette from "./CommandPalette";
import ScanModal from "./ScanModal";
import BootSequence from "./BootSequence";
import Terminal from "./Terminal";
import ScrollSequenceBackground from "./ScrollSequenceBackground";

// User Views
import DashboardView from "../Pages/DashboardView";
import ScanView from "../Pages/ScanView";
import ThreatIntelView from "../Pages/ThreatIntelView";
import LiveFeedView from "../Pages/LiveFeedView";
import AnalyticsView from "../Pages/AnalyticsView";
import ReportsView from "../Pages/ReportsView";
import DomainAnalysisView from "../Pages/DomainAnalysisView";
import SettingsView from "../Pages/SettingsView";
import ApiKeysView from "../Pages/ApiKeysView";
import DocumentationView from "../Pages/DocumentationView";

// Admin Views
import AdminOverview from "../Pages/Admin/AdminOverview";
import UserManagementView from "../Pages/Admin/UserManagementView";
import GlobalScanCenter from "../Pages/Admin/GlobalScanCenter";
import ThreatFeedMonitor from "../Pages/Admin/ThreatFeedMonitor";
import MLModelCenter from "../Pages/Admin/MLModelCenter";
import DatasetCenter from "../Pages/Admin/DatasetCenter";
import AuditLogsView from "../Pages/Admin/AuditLogsView";
import SystemHealthView from "../Pages/Admin/SystemHealthView";

import { useDashboard } from "../hooks/useDashboard";
import { useHistory } from "../hooks/useHistory";
import { useSceneDirector } from "../scenes/scene-director/useSceneDirector";

export default function AppShell({ user, defaultPortal = "user", onLogout }) {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("dashboard");
  const [bootDone, setBootDone] = useState(true);
  const [selectedScan, setSelectedScan] = useState(null);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [prefilledScanUrl, setPrefilledScanUrl] = useState("");
  const [collapsedSidebar, setCollapsedSidebar] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { stats, analytics, backendOnline, refresh: refreshDashboard } = useDashboard(10000);
  const { scans: recentScans, refresh: refreshHistory, clearAllHistory } = useHistory(10000);
  const { setDirectiveForView, setLastVerdict } = useSceneDirector();

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "info",
      title: "Sentinel Defense Core Armed",
      message: "Python heuristic engine and Threat Intelligence telemetry online.",
      time: "Startup",
    },
  ]);

  // Sync active view to 3D Scene Director
  useEffect(() => {
    setDirectiveForView(activeView);
  }, [activeView, setDirectiveForView]);

  // Keyboard shortcut for Command Palette (Ctrl+K) and Terminal (Backtick `)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
      }
      if (e.key === "`" && !e.target.matches("input, textarea")) {
        e.preventDefault();
        setTerminalOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleScanCompleted = (scanResult) => {
    refreshDashboard();
    refreshHistory();
    const verdict = scanResult?.final_verdict || "ANALYZED";
    const riskScore = scanResult?.risk_score || 0;
    const isThreat = verdict.includes("PHISH") || verdict.includes("MALICIOUS");

    setLastVerdict(verdict, riskScore);

    setNotifications((prev) => [
      {
        id: Date.now(),
        type: isThreat ? "threat" : "info",
        title: isThreat ? `Threat Intercepted: ${verdict}` : `URL Verified: ${verdict}`,
        message: `Target ${scanResult.url} evaluated with risk score ${riskScore}/100.`,
        time: "Just now",
      },
      ...prev.slice(0, 15),
    ]);
  };

  const handleClearHistory = async () => {
    await clearAllHistory();
    refreshDashboard();
    setNotifications((prev) => [
      {
        id: Date.now(),
        type: "info",
        title: "Scan History Cleared",
        message: "Historical scan records purged from database.",
        time: "Just now",
      },
      ...prev,
    ]);
  };

  const handleUserLogout = () => {
    if (onLogout) {
      onLogout();
    }
    navigate(user?.role === "ADMIN" ? "/admin/login" : "/login");
  };

  return (
    <div className="spa-app-root">
      {/* High-Clarity Scrolling Animation Background */}
      <ScrollSequenceBackground overlayOpacity={0.4} opacity={1.0} />

      {/* Main Persistent Dashboard Shell */}
      <div className={`app-layout ${collapsedSidebar ? "sidebar-collapsed" : ""}`}>
        {/* Floating Glass Sidebar */}
        <Sidebar
          activeView={activeView}
          setActiveView={(view) => {
            setActiveView(view);
            setMobileMenuOpen(false);
          }}
          backendOnline={backendOnline}
          collapsed={collapsedSidebar}
          setCollapsed={setCollapsedSidebar}
          user={user}
          onLogout={handleUserLogout}
        />

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            className="mobile-nav-backdrop"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="mobile-nav-drawer"
              onClick={(e) => e.stopPropagation()}
            >
              <Sidebar
                activeView={activeView}
                setActiveView={(view) => {
                  setActiveView(view);
                  setMobileMenuOpen(false);
                }}
                backendOnline={backendOnline}
                collapsed={false}
                setCollapsed={() => setMobileMenuOpen(false)}
                user={user}
                onLogout={handleUserLogout}
              />
            </div>
          </div>
        )}

        {/* Main Content Workspace */}
        <div className="main-content-column">
          {/* Topbar */}
          <Topbar
            activeView={activeView}
            setActiveView={setActiveView}
            onOpenCommandPalette={() => setCmdOpen(true)}
            onOpenTerminal={() => setTerminalOpen(true)}
            stats={stats}
            notifications={notifications}
            onClearNotifications={() => setNotifications([])}
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
            user={user}
            onLogout={handleUserLogout}
          />

          {/* Dynamic Central Content Viewport */}
          <main className="central-viewport-area">
            <AnimatePresence mode="wait">
              {/* User SOC Views */}
              {activeView === "dashboard" && (
                <DashboardView
                  key="dashboard"
                  stats={stats}
                  analytics={analytics}
                  recentScans={recentScans}
                  onSelectScan={(scan) => setSelectedScan(scan)}
                  onClearHistory={handleClearHistory}
                  backendOnline={backendOnline}
                />
              )}

              {activeView === "scan" && (
                <ScanView
                  key="scan"
                  onScanComplete={handleScanCompleted}
                  prefilledUrl={prefilledScanUrl}
                />
              )}

              {activeView === "threat-intel" && (
                <ThreatIntelView
                  key="threat-intel"
                  onInspectIndicator={(target) => {
                    setPrefilledScanUrl(target);
                    setActiveView("scan");
                  }}
                />
              )}

              {activeView === "live-feed" && (
                <LiveFeedView
                  key="live-feed"
                  recentScans={recentScans}
                  onSelectScan={(scan) => setSelectedScan(scan)}
                  onOpenScanner={() => setActiveView("scan")}
                />
              )}

              {activeView === "analytics" && (
                <AnalyticsView
                  key="analytics"
                  stats={stats}
                  analytics={analytics}
                />
              )}

              {activeView === "reports" && (
                <ReportsView
                  key="reports"
                  stats={stats}
                  analytics={analytics}
                  recentScans={recentScans}
                />
              )}

              {activeView === "domain-analysis" && (
                <DomainAnalysisView
                  key="domain-analysis"
                  initialTarget={prefilledScanUrl}
                />
              )}

              {activeView === "settings" && <SettingsView key="settings" user={user} />}

              {activeView === "api-keys" && <ApiKeysView key="api-keys" />}

              {activeView === "documentation" && (
                <DocumentationView key="documentation" />
              )}

              {/* Admin Command Center Views */}
              {activeView === "admin-overview" && (
                <AdminOverview key="admin-overview" />
              )}

              {activeView === "admin-users" && (
                <UserManagementView key="admin-users" />
              )}

              {activeView === "admin-scans" && (
                <GlobalScanCenter
                  key="admin-scans"
                  onInspectScan={(scan) => setSelectedScan(scan)}
                />
              )}

              {activeView === "admin-threat-feeds" && (
                <ThreatFeedMonitor key="admin-threat-feeds" />
              )}

              {activeView === "admin-ml" && (
                <MLModelCenter key="admin-ml" />
              )}

              {activeView === "admin-dataset" && (
                <DatasetCenter key="admin-dataset" />
              )}

              {activeView === "admin-audit" && (
                <AuditLogsView key="admin-audit" />
              )}

              {activeView === "admin-health" && (
                <SystemHealthView key="admin-health" />
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Global Command Palette Modal (Ctrl+K) */}
      <CommandPalette
        isOpen={cmdOpen}
        onClose={() => setCmdOpen(false)}
        setActiveView={setActiveView}
        onScanUrl={(url) => {
          setPrefilledScanUrl(url);
          setActiveView("scan");
        }}
      />

      {/* Interactive SOC Terminal Modal (`) */}
      <Terminal
        isOpen={terminalOpen}
        onClose={() => setTerminalOpen(false)}
        onScanUrl={(url) => {
          setPrefilledScanUrl(url);
          setActiveView("scan");
        }}
      />

      {/* Scan Report Dossier Modal */}
      <ScanModal
        scan={selectedScan}
        onClose={() => setSelectedScan(null)}
        onRescan={(url) => {
          setSelectedScan(null);
          setPrefilledScanUrl(url);
          setActiveView("scan");
        }}
      />
    </div>
  );
}
