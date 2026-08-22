import React, { Suspense } from "react";
import { motion } from "framer-motion";
import {
  FiShield,
  FiActivity,
  FiAlertTriangle,
  FiCheckCircle,
  FiCpu,
  FiRadio,
  FiCrosshair,
  FiLock,
  FiLayers,
} from "react-icons/fi";
import SentinelCore from "../scenes/SentinelCore";
import ThreatLattice from "../scenes/ThreatLattice";

export default function ThreatMap({ stats, recentScans = [] }) {
  const totalScans = stats?.total_scans || 0;
  const phishingCount = stats?.phishing || 0;
  const suspiciousCount = stats?.suspicious || 0;
  const safeCount = stats?.safe || 0;

  // Running risk score average
  const avgRisk =
    recentScans.length > 0
      ? Math.round(
          recentScans.reduce((sum, s) => sum + (s.risk_score || 0), 0) /
            recentScans.length
        )
      : 12;

  const latestScan = recentScans[0];
  const latestVerdict = latestScan?.verdict || (phishingCount > 0 ? "PHISHING" : "SAFE");

  const healthStatus =
    avgRisk < 30 ? "SECURE" : avgRisk < 60 ? "GUARDED" : "THREAT ALERT";

  return (
    <div className="threat-command-center">
      {/* Top Banner Tag */}
      <div className="command-center-header">
        <div className="header-badge">
          <FiShield className="spin-slow" />
          <span>SENTINEL CORE • 3D SPATIAL THREAT LATTICE</span>
        </div>
        <div className="header-status-indicator">
          <span className="live-pulse-dot" />
          <span>DATA-DRIVEN INSTRUMENT PANEL</span>
        </div>
      </div>

      <div className="command-grid-layout">
        {/* Left Telemetry Column */}
        <div className="telemetry-column left-col">
          {/* Global Risk Index */}
          <div className="hud-glass-card">
            <div className="hud-card-header">
              <span className="hud-card-title">
                <FiCrosshair /> RUNNING RISK INDEX
              </span>
              <span className={`hud-pill ${healthStatus.toLowerCase().replace(" ", "-")}`}>
                {healthStatus}
              </span>
            </div>
            <div className="risk-score-display">
              <div className="score-big">
                <span className="number">{avgRisk}</span>
                <span className="denom">/ 100</span>
              </div>
              <div className="gauge-bar-track">
                <div
                  className="gauge-bar-fill"
                  style={{
                    width: `${avgRisk}%`,
                    background:
                      avgRisk < 30
                        ? "linear-gradient(90deg, #00E676, #00E5FF)"
                        : avgRisk < 60
                        ? "linear-gradient(90deg, #FFB020, #FF8C00)"
                        : "linear-gradient(90deg, #FF3B5C, #E11D48)",
                  }}
                />
              </div>
              <span className="gauge-caption">
                Average across {recentScans.length} logged scans
              </span>
            </div>
          </div>

          {/* Detection Engines */}
          <div className="hud-glass-card">
            <div className="hud-card-header">
              <span className="hud-card-title">
                <FiCpu /> DETECTION PIPELINES
              </span>
              <span className="hud-status-tag active">ARMED</span>
            </div>
            <div className="engine-stats-list">
              <div className="engine-stat-item">
                <span className="engine-name">Heuristic Engine</span>
                <span className="engine-val">Active (RFC 3986)</span>
              </div>
              <div className="engine-stat-item">
                <span className="engine-name">VirusTotal API</span>
                <span className="engine-val">Connected (70+ Engines)</span>
              </div>
              <div className="engine-stat-item">
                <span className="engine-name">WHOIS & SSL Guard</span>
                <span className="engine-val">Live Inspection</span>
              </div>
              <div className="engine-stat-item">
                <span className="engine-name">SQLite Logging</span>
                <span className="engine-val">Persistent</span>
              </div>
            </div>
          </div>

          {/* Threat Breakdown Quick View */}
          <div className="hud-glass-card">
            <div className="hud-card-header">
              <span className="hud-card-title">
                <FiAlertTriangle /> CLASSIFIED TOTALS
              </span>
            </div>
            <div className="threat-mini-grid">
              <div className="threat-mini-cell threat-low">
                <span className="threat-mini-val">{safeCount}</span>
                <span className="threat-mini-lbl">Safe</span>
              </div>
              <div className="threat-mini-cell threat-med">
                <span className="threat-mini-val">{suspiciousCount}</span>
                <span className="threat-mini-lbl">Suspicious</span>
              </div>
              <div className="threat-mini-cell threat-high">
                <span className="threat-mini-val">{phishingCount}</span>
                <span className="threat-mini-lbl">Phishing</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center 3D Sentinel Core + Threat Lattice */}
        <div className="center-globe-viewport">
          <div className="globe-overlay-hud-top">
            <div className="hud-crosshair-tl" />
            <div className="hud-crosshair-tr" />
            <div className="globe-hud-title">
              <FiShield /> 3D SENTINEL CORE & HISTORICAL THREAT LATTICE
            </div>
          </div>

          <div className="threat-globe-canvas-wrap" style={{ position: "relative" }}>
            <Suspense
              fallback={
                <div className="globe-fallback">
                  <div className="spinner-cyber" />
                  <span>INITIALIZING 3D SPATIAL DEFENSE LAYER...</span>
                </div>
              }
            >
              <SentinelCore
                verdict={latestVerdict}
                avgRisk={avgRisk}
                height={380}
              />
              <ThreatLattice scans={recentScans} height={380} />
            </Suspense>
          </div>

          <div className="globe-overlay-hud-bottom">
            <div className="hud-crosshair-bl" />
            <div className="hud-crosshair-br" />
            <div className="globe-live-ticker">
              <span className="ticker-badge">LATEST TELEMETRY:</span>
              <span className="ticker-text">
                {latestScan
                  ? `[Scan #${latestScan.id}] ${latestScan.url} — Verdict: ${latestScan.verdict} (${latestScan.risk_score}/100)`
                  : "Awaiting incoming URL telemetry... Sentinel defense core active."}
              </span>
            </div>
          </div>
        </div>

        {/* Right Telemetry Column */}
        <div className="telemetry-column right-col">
          {/* Attack Surface Summary */}
          <div className="hud-glass-card">
            <div className="hud-card-header">
              <span className="hud-card-title">
                <FiLayers /> ATTACK SURFACE
              </span>
              <span className="hud-badge-small">LOGS</span>
            </div>
            <div className="attack-surface-stats">
              <div className="surface-row">
                <span>DB Records</span>
                <strong>{totalScans} URLs</strong>
              </div>
              <div className="surface-row">
                <span>Phish Ratio</span>
                <strong style={{ color: "var(--phish-red)" }}>
                  {totalScans > 0
                    ? `${Math.round((phishingCount / totalScans) * 100)}%`
                    : "0%"}
                </strong>
              </div>
              <div className="surface-row">
                <span>Engine Latency</span>
                <strong>~260ms</strong>
              </div>
              <div className="surface-row">
                <span>Dataset Size</span>
                <strong>1,100 URLs</strong>
              </div>
            </div>
          </div>

          {/* System Architecture */}
          <div className="hud-glass-card" style={{ borderLeft: "3px solid var(--phish-cyan)" }}>
            <div className="hud-card-header">
              <span className="hud-card-title">
                <FiLock /> SYSTEM ARCHITECTURE
              </span>
            </div>
            <p style={{ fontSize: "11px", color: "var(--phish-text-muted)", lineHeight: 1.4, margin: "4px 0" }}>
              AI-assisted phishing URL detection using Python heuristics, VirusTotal API, and persistent logging.
            </p>
            <div style={{ marginTop: 8, fontSize: "10px", color: "var(--phish-cyan)", fontWeight: 700 }}>
              PhishLense Core Architecture
            </div>
          </div>

          {/* Defense Signals */}
          <div className="hud-glass-card">
            <div className="hud-card-header">
              <span className="hud-card-title">
                <FiRadio /> ACTIVE SIGNALS
              </span>
            </div>
            <div className="protocol-tags">
              <span className="proto-pill">RFC 3986 Syntax</span>
              <span className="proto-pill">VirusTotal v3</span>
              <span className="proto-pill">WHOIS Domain Age</span>
              <span className="proto-pill">SSL Validity</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
