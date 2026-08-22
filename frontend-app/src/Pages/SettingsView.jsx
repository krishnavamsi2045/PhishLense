import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiSliders,
  FiEye,
  FiBell,
  FiShield,
  FiServer,
  FiDatabase,
  FiCheck,
} from "react-icons/fi";
import { API_BASE_URL } from "../services/api";

export default function SettingsView() {
  const [hudGlow, setHudGlow] = useState(() => {
    return localStorage.getItem("phish_hud_glow") !== "false";
  });
  const [particles3D, setParticles3D] = useState(() => {
    return localStorage.getItem("phish_particles_3d") !== "false";
  });
  const [soundAlerts, setSoundAlerts] = useState(() => {
    return localStorage.getItem("phish_sound_alerts") === "true";
  });
  const [threatThreshold, setThreatThreshold] = useState(() => {
    return localStorage.getItem("phish_threat_threshold") || "60";
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem("phish_hud_glow", String(hudGlow));
    localStorage.setItem("phish_particles_3d", String(particles3D));
    localStorage.setItem("phish_sound_alerts", String(soundAlerts));
    localStorage.setItem("phish_threat_threshold", String(threatThreshold));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <motion.div
      className="settings-workspace"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
    >
      <div className="workspace-header">
        <div className="workspace-title-group">
          <div className="header-icon-wrap">
            <FiSliders />
          </div>
          <div>
            <h2>Platform & Interface Settings</h2>
            <p>Configure command center HUD visuals, alert thresholds, 3D performance, and API preferences.</p>
          </div>
        </div>

        <button className="save-settings-btn" onClick={handleSave}>
          {saved ? <FiCheck /> : <FiSliders />}
          <span>{saved ? "Settings Saved" : "Save Preferences"}</span>
        </button>
      </div>

      <div className="settings-sections-grid">
        {/* Visual & 3D Environment */}
        <div className="settings-card">
          <div className="settings-card-header">
            <FiEye className="card-icon" />
            <div>
              <h3>Visual HUD & 3D Environment</h3>
              <p>Customize spatial rendering and glassmorphic glow</p>
            </div>
          </div>
          <div className="settings-controls-list">
            <div className="setting-row">
              <div>
                <span className="setting-title">Holographic HUD Glow</span>
                <p className="setting-desc">Enable neon cyan edge lighting and glass reflections</p>
              </div>
              <input
                type="checkbox"
                checked={hudGlow}
                onChange={(e) => setHudGlow(e.target.checked)}
                className="cyber-toggle"
              />
            </div>
            <div className="setting-row">
              <div>
                <span className="setting-title">3D Threat Particles & Globe</span>
                <p className="setting-desc">Render GPU-accelerated spatial attack arcs</p>
              </div>
              <input
                type="checkbox"
                checked={particles3D}
                onChange={(e) => setParticles3D(e.target.checked)}
                className="cyber-toggle"
              />
            </div>
          </div>
        </div>

        {/* Threat Alert Thresholds */}
        <div className="settings-card">
          <div className="settings-card-header">
            <FiBell className="card-icon" />
            <div>
              <h3>Threat Alert Thresholds</h3>
              <p>Configure automated SOC escalation triggers</p>
            </div>
          </div>
          <div className="settings-controls-list">
            <div className="setting-row">
              <div>
                <span className="setting-title">Phishing Alert Cutoff Score</span>
                <p className="setting-desc">Risk score threshold (0-100) to flag as critical threat</p>
              </div>
              <select
                value={threatThreshold}
                onChange={(e) => setThreatThreshold(e.target.value)}
                className="cyber-select"
              >
                <option value="50">Score 50+ (Aggressive)</option>
                <option value="60">Score 60+ (Standard)</option>
                <option value="75">Score 75+ (High Confidence)</option>
              </select>
            </div>
            <div className="setting-row">
              <div>
                <span className="setting-title">Audio Threat Telemetry</span>
                <p className="setting-desc">Play subtle futuristic chime on threat detection</p>
              </div>
              <input
                type="checkbox"
                checked={soundAlerts}
                onChange={(e) => setSoundAlerts(e.target.checked)}
                className="cyber-toggle"
              />
            </div>
          </div>
        </div>

        {/* Backend & API Configuration */}
        <div className="settings-card">
          <div className="settings-card-header">
            <FiServer className="card-icon" />
            <div>
              <h3>Backend API Integration</h3>
              <p>Connected FastAPI instance configuration</p>
            </div>
          </div>
          <div className="settings-controls-list">
            <div className="setting-row">
              <div>
                <span className="setting-title">Active Backend Host</span>
                <p className="setting-desc">Local uvicorn endpoint for ML queries</p>
              </div>
              <code className="api-url-badge">{API_BASE_URL}</code>
            </div>
            <div className="setting-row">
              <div>
                <span className="setting-title">ML Model Type</span>
                <p className="setting-desc">Trained Random Forest (200 estimators)</p>
              </div>
              <span className="engine-active-tag">Active & Loaded</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
