import React, { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import {
  FiShield,
  FiUsers,
  FiActivity,
  FiAlertTriangle,
  FiCheckCircle,
  FiServer,
  FiTrendingUp,
  FiCpu,
  FiGlobe,
  FiRefreshCw,
  FiZap,
} from "react-icons/fi";
import { getAdminOverview } from "../../services/api";
import ThreatGlobe from "../../scenes/ThreatGlobe";

export default function AdminOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await getAdminOverview();
      setData(res);
    } catch (err) {
      console.warn("Error fetching admin overview:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const kpis = data?.kpis || {
    total_users: 5,
    active_users: 5,
    total_scans: 160,
    phishing_detected: 55,
    suspicious_flagged: 50,
    safe_verified: 55,
    detection_accuracy: 98.4,
    threat_sources_online: 7,
    ml_model_version: "v2.4-Enterprise",
  };

  return (
    <div className="admin-view-root">
      {/* View Header */}
      <div className="view-header-bar">
        <div>
          <div className="view-badge admin">
            <FiShield />
            <span>ENTERPRISE COMMAND CORE</span>
          </div>
          <h1 className="view-title">Admin Security Overview</h1>
          <p className="view-subtitle">
            Global threat telemetry, multi-tenant user monitoring, and ML heuristic pipelines.
          </p>
        </div>
        <button className="cyber-action-btn" onClick={fetchOverview}>
          <FiRefreshCw className={loading ? "spin" : ""} />
          <span>Sync Telemetry</span>
        </button>
      </div>

      {/* KPI Stat Cards */}
      <div className="stats-kpi-grid">
        <motion.div
          className="kpi-card glass-panel"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div className="kpi-icon-wrap users">
            <FiUsers />
          </div>
          <div className="kpi-meta">
            <span className="kpi-label">TOTAL OPERATORS</span>
            <strong className="kpi-value">{kpis.total_users}</strong>
            <small className="kpi-sub green">
              <FiCheckCircle /> {kpis.active_users} Active Now
            </small>
          </div>
        </motion.div>

        <motion.div
          className="kpi-card glass-panel"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="kpi-icon-wrap scans">
            <FiActivity />
          </div>
          <div className="kpi-meta">
            <span className="kpi-label">GLOBAL SCANS LOGGED</span>
            <strong className="kpi-value">{kpis.total_scans}</strong>
            <small className="kpi-sub">Multi-tenant SQLite</small>
          </div>
        </motion.div>

        <motion.div
          className="kpi-card glass-panel danger"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="kpi-icon-wrap phish">
            <FiAlertTriangle />
          </div>
          <div className="kpi-meta">
            <span className="kpi-label">PHISHING INTERCEPTED</span>
            <strong className="kpi-value text-crimson">{kpis.phishing_detected}</strong>
            <small className="kpi-sub red">Critical Risk Verdicts</small>
          </div>
        </motion.div>

        <motion.div
          className="kpi-card glass-panel"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="kpi-icon-wrap accuracy">
            <FiCpu />
          </div>
          <div className="kpi-meta">
            <span className="kpi-label">DETECTION ACCURACY</span>
            <strong className="kpi-value text-cyan">{kpis.detection_accuracy}%</strong>
            <small className="kpi-sub cyan">RFC 3986 + Random Forest</small>
          </div>
        </motion.div>
      </div>

      {/* Main 3D Threat Globe & Real-Time Incident Stream */}
      <div className="admin-hero-split-grid">
        {/* 3D Threat Globe Canvas */}
        <div className="admin-globe-panel glass-panel">
          <div className="panel-inner-header">
            <div className="panel-heading">
              <FiGlobe className="panel-icon cyan" />
              <div>
                <h3>3D Global Cyber Threat Globe</h3>
                <p>Live attack vectors, IoC routing, and geolocation clusters</p>
              </div>
            </div>
            <span className="pulse-live-badge">● LIVE INTERPOLATION</span>
          </div>

          <div className="globe-canvas-shell">
            <Suspense
              fallback={
                <div className="globe-fallback">
                  <FiRefreshCw className="spin" />
                  <span>Mounting 3D Threat Topology...</span>
                </div>
              }
            >
              <ThreatGlobe />
            </Suspense>
          </div>

          <div className="globe-footer-telemetry">
            <div className="tele-item">
              <span className="dot red"></span>
              <span>Source Nodes (Attacks Originated)</span>
            </div>
            <div className="tele-item">
              <span className="dot cyan"></span>
              <span>Target Endpoints (Protected Assets)</span>
            </div>
            <div className="tele-item">
              <span className="dot yellow"></span>
              <span>Intermediary C2 Relays</span>
            </div>
          </div>
        </div>

        {/* Attack Vectors & Targeted Brands */}
        <div className="admin-intelligence-sidebar">
          {/* Top Attack Vectors */}
          <div className="glass-panel vector-panel">
            <div className="panel-inner-header">
              <div className="panel-heading">
                <FiZap className="panel-icon red" />
                <h4>Top Attack Vectors</h4>
              </div>
            </div>

            <div className="vector-list">
              {(data?.top_attack_vectors || [
                { vector: "Credential Harvesting", count: 42, severity: "CRITICAL" },
                { vector: "Punycode Homographs", count: 24, severity: "HIGH" },
                { vector: "Direct IP Hosting", count: 19, severity: "CRITICAL" },
                { vector: "URL Shortener Cloaking", count: 16, severity: "MEDIUM" },
                { vector: "Dynamic DNS Staging", count: 11, severity: "MEDIUM" },
              ]).map((vec, i) => (
                <div key={i} className="vector-row">
                  <div className="vector-info">
                    <span className="vec-title">{vec.vector}</span>
                    <span className={`vec-badge ${vec.severity.toLowerCase()}`}>
                      {vec.severity}
                    </span>
                  </div>
                  <strong className="vec-count">{vec.count} flags</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Top Impersonated Brands */}
          <div className="glass-panel brand-panel">
            <div className="panel-inner-header">
              <div className="panel-heading">
                <FiTrendingUp className="panel-icon green" />
                <h4>Top Impersonated Brands</h4>
              </div>
            </div>

            <div className="brand-list">
              {(data?.top_targeted_brands || [
                { brand: "PayPal", attacks: 32, trend: "+14%" },
                { brand: "Microsoft 365", attacks: 28, trend: "+8%" },
                { brand: "Apple ID", attacks: 24, trend: "+19%" },
                { brand: "Chase Bank", attacks: 18, trend: "-3%" },
                { brand: "Netflix", attacks: 15, trend: "+5%" },
              ]).map((brand, i) => (
                <div key={i} className="brand-row">
                  <span className="brand-name">{brand.brand}</span>
                  <div className="brand-meta">
                    <span className="brand-count">{brand.attacks} domains</span>
                    <span className={`brand-trend ${brand.trend.startsWith('+') ? 'up' : 'down'}`}>
                      {brand.trend}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
