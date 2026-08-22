import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FiGlobe,
  FiShield,
  FiSearch,
  FiAlertTriangle,
  FiDatabase,
  FiActivity,
  FiServer,
  FiCheckCircle,
  FiExternalLink,
} from "react-icons/fi";

const sampleIntelFeeds = [
  { name: "OpenPhish Global Community Feed", status: "CONNECTED", type: "Active Phishing URLs", hits: "Real-time" },
  { name: "VirusTotal Engine Multi-Scanner", status: "CONNECTED", type: "Antivirus Engine Query", hits: "API v3" },
  { name: "PhishLense Heuristic Signatures", status: "ACTIVE", type: "Zero-day Syntax & Homoglyphs", hits: "Local Index" },
  { name: "WHOIS & DNS Age Intelligence", status: "ACTIVE", type: "Domain Registration Auditing", hits: "Direct Port 43" },
];

const sampleThreatIndicators = [
  { pattern: "paypal-security-login.com", category: "Credential Harvesting", severity: "HIGH", engine: "OpenPhish" },
  { pattern: "192.168.1.100/appleid-recovery", category: "Direct IP Hosted Phishing", severity: "CRITICAL", engine: "Heuristics" },
  { pattern: "update-banking-details.xyz", category: "Financial Impersonation", severity: "HIGH", engine: "PhishLense AI" },
  { pattern: "chase-security-alerts.top", category: "Brand Deception", severity: "HIGH", engine: "VirusTotal" },
  { pattern: "netflix-billing-center.work", category: "Subscription Fraud", severity: "MEDIUM", engine: "Heuristics" },
];

export default function ThreatIntelView({ onInspectIndicator }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredIndicators = sampleThreatIndicators.filter((item) =>
    item.pattern.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.engine.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      className="threat-intel-workspace"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
    >
      <div className="workspace-header">
        <div className="workspace-title-group">
          <div className="header-icon-wrap">
            <FiGlobe />
          </div>
          <div>
            <h2>Threat Intelligence Repository</h2>
            <p>Internal and correlated external threat indicators, adversary patterns, and detection feeds.</p>
          </div>
        </div>
        <div className="threat-feed-badge">
          <span className="live-pulse-dot" />
          <span>4 ACTIVE FEEDS SYNCED</span>
        </div>
      </div>

      {/* Intelligence Feeds Grid */}
      <div className="intel-feeds-grid">
        {sampleIntelFeeds.map((feed, i) => (
          <div key={i} className="intel-feed-card">
            <div className="feed-card-header">
              <span className="feed-name">{feed.name}</span>
              <span className="feed-status-tag">{feed.status}</span>
            </div>
            <span className="feed-type">{feed.type}</span>
            <div className="feed-footer">
              <span>Feed Integration:</span>
              <strong>{feed.hits}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* Indicators Search & Table */}
      <div className="intel-table-card">
        <div className="intel-search-header">
          <div className="search-bar-wrap">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search threat indicators, domains, adversary patterns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="intel-search-input"
            />
          </div>
          <span className="indicator-count-badge">
            {filteredIndicators.length} Known Signatures
          </span>
        </div>

        <div className="table-responsive-container">
          <table className="cyber-table">
            <thead>
              <tr>
                <th>INDICATOR PATTERN</th>
                <th>CATEGORY / TTP</th>
                <th>SEVERITY</th>
                <th>DETECTION SOURCE</th>
                <th style={{ textAlign: "right" }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredIndicators.map((ind, idx) => (
                <tr key={idx} className="table-row-hover">
                  <td className="cell-url">
                    <span className="url-truncate font-mono">{ind.pattern}</span>
                  </td>
                  <td>{ind.category}</td>
                  <td>
                    <span
                      className={`verdict-badge ${
                        ind.severity === "CRITICAL" || ind.severity === "HIGH"
                          ? "phishing"
                          : "suspicious"
                      }`}
                    >
                      {ind.severity}
                    </span>
                  </td>
                  <td>
                    <span className="engine-tag">{ind.engine}</span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      className="inspect-action-btn"
                      onClick={() => onInspectIndicator(ind.pattern)}
                      title="Analyze this pattern in workspace"
                    >
                      Analyze Target
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
