import React, { useState, useEffect, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import CommandPalette from "./CommandPalette";
import ScanModal from "./ScanModal";
import BootSequence from "./BootSequence";
import Terminal from "./Terminal";
import Environment from "../scenes/Environment";
import CyberBackground from "./CyberBackground";
import ScrollSequenceBackground from "./ScrollSequenceBackground";

import DashboardView from "../Pages/DashboardView";
import ScanView from "../Pages/ScanView";
import ThreatIntelView from "../Pages/ThreatIntelView";
import LiveFeedView from "../Pages/LiveFeedView";
import ReportsView from "../Pages/ReportsView";
import DomainAnalysisView from "../Pages/DomainAnalysisView";
import SettingsView from "../Pages/SettingsView";
import ApiKeysView from "../Pages/ApiKeysView";
import DocumentationView from "../Pages/DocumentationView";

import { useDashboard } from "../hooks/useDashboard";
import { useHistory } from "../hooks/useHistory";
import { useSceneDirector } from "../scenes/scene-director/useSceneDirector";

export default function AppShell() {
  const [activeView, setActiveView] = useState("dashboard");
  const [bootDone, setBootDone] = useState(false);
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
      message: "Python heuristic engine and VirusTotal telemetry online.",
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

    // Update 3D Sentinel Core state
    setLastVerdict(verdict, riskScore);

    setNotifications((prev) => [
      {
        id: Date.now(),
        type: isThreat ? "threat" : "info",
        title: isThreat ? `Threat Flagged: ${verdict}` : `URL Verified: ${verdict}`,
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
        title: "Scan Database Cleared",
        message: "All historical scan records purged from SQLite.",
        time: "Just now",
      },
      ...prev,
    ]);
  };

  const handleQuickScan = (url) => {
    setPrefilledScanUrl(url);
    setActiveView("scan");
  };

  return (
    <div className="spa-app-root">
      {/* Initial Boot Sequence (Skippable) */}
      <AnimatePresence>
        {!bootDone && <BootSequence onComplete={() => setBootDone(true)} />}
      </AnimatePresence>

      {/* Clean High-Clarity Butter Smooth Scrolling Animation Background */}
      <ScrollSequenceBackground overlayOpacity={0.35} opacity={1.0} />

      {/* Main Persistent Dashboard Shell */}
      <div className={`app-layout ${collapsedSidebar ? "sidebar-collapsed" : ""}`}>
        {/* Persistent Floating Glass Sidebar */}
        <Sidebar
          activeView={activeView}
          setActiveView={(view) => {
            setActiveView(view);
            setMobileMenuOpen(false);
          }}
          backendOnline={backendOnline}
          collapsed={collapsedSidebar}
          setCollapsed={setCollapsedSidebar}
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
              />
            </div>
          </div>
        )}

        {/* Main Content Workspace */}
        <div className="main-content-column">
          {/* Persistent Topbar */}
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
          />

          {/* Dynamic Central Content Area */}
          <main className="central-viewport-area">
            <AnimatePresence mode="wait">
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

              {activeView === "settings" && <SettingsView key="settings" />}

              {activeView === "api-keys" && <ApiKeysView key="api-keys" />}

              {activeView === "documentation" && (
                <DocumentationView key="documentation" />
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Global Command Palette Modal (Ctrl+K / Cmd+K) */}
      <CommandPalette
        isOpen={cmdOpen}
        onClose={() => setCmdOpen(false)}
        onSelectView={(view) => setActiveView(view)}
        onQuickScan={handleQuickScan}
      />

      {/* Interactive Cyber Terminal (Toggled via Topbar / ` Hotkey) */}
      <Terminal
        isOpen={terminalOpen}
        onClose={() => setTerminalOpen(false)}
        onScanTriggered={handleScanCompleted}
      />

      {/* Detail Scan Dossier Modal */}
      <ScanModal
        scan={selectedScan}
        onClose={() => setSelectedScan(null)}
        onRescan={(target) => {
          setPrefilledScanUrl(target);
          setActiveView("scan");
        }}
      />
    </div>
  );
}
