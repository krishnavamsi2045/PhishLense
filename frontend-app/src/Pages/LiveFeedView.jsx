import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiRadio,
  FiSearch,
  FiFilter,
  FiEye,
  FiShield,
  FiAlertTriangle,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
} from "react-icons/fi";

export default function LiveFeedView({
  recentScans = [],
  onSelectScan,
  onOpenScanner,
}) {
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const filteredScans = recentScans.filter((s) => {
    const v = String(s.verdict || "").toUpperCase();
    let matchesFilter = true;
    if (filter === "PHISHING") {
      matchesFilter = v.includes("PHISH") || v.includes("MALICIOUS") || (s.risk_score >= 60);
    } else if (filter === "SUSPICIOUS") {
      matchesFilter = v.includes("SUSPICIOUS") || (s.risk_score >= 30 && s.risk_score < 60);
    } else if (filter === "SAFE") {
      matchesFilter = v.includes("SAFE") || (s.risk_score < 30);
    }

    const matchesSearch = s.url.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <motion.div
      className="live-feed-workspace"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
    >
      <div className="workspace-header">
        <div className="workspace-title-group">
          <div className="header-icon-wrap">
            <FiRadio className="spin-slow" />
          </div>
          <div>
            <h2>Live Detection Stream</h2>
            <p>Real-time telemetry of submitted URL scans and risk evaluations from the local database.</p>
          </div>
        </div>
        <div className="feed-pulse-badge">
          <span className="live-pulse-dot" />
          <span>STREAM ACTIVE</span>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="feed-controls-bar">
        <div className="filter-pills-group">
          {["ALL", "PHISHING", "SUSPICIOUS", "SAFE"].map((f) => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="feed-search-wrap">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Filter feed by URL..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="feed-search-input"
          />
        </div>
      </div>

      {/* Stream Cards List */}
      <div className="feed-stream-container">
        {filteredScans.length === 0 ? (
          <div className="feed-empty-box">
            <FiShield className="empty-icon" />
            <h3>No matching detections in feed</h3>
            <p>Scan a link in the AI Scanner to record real telemetry events into this stream.</p>
            <button className="open-scanner-cta" onClick={onOpenScanner}>
              Launch AI Scanner
            </button>
          </div>
        ) : (
          <div className="feed-cards-list">
            {filteredScans.map((scan) => {
              const score = scan.risk_score || 0;
              const verdict = scan.verdict || "SAFE";
              const upperVerdict = verdict.toUpperCase();
              const isDanger =
                upperVerdict.includes("PHISH") ||
                upperVerdict.includes("MALICIOUS") ||
                score >= 60;
              const isWarning =
                upperVerdict.includes("SUSPICIOUS") ||
                (score >= 30 && score < 60);

              return (
                <div
                  key={scan.id}
                  className={`feed-event-card ${
                    isDanger ? "danger" : isWarning ? "warning" : "safe"
                  }`}
                  onClick={() => onSelectScan(scan)}
                >
                  <div className="event-left">
                    <div
                      className={`event-verdict-icon ${
                        isDanger ? "danger" : isWarning ? "warning" : "safe"
                      }`}
                    >
                      {isDanger ? (
                        <FiAlertTriangle />
                      ) : isWarning ? (
                        <FiAlertCircle />
                      ) : (
                        <FiCheckCircle />
                      )}
                    </div>
                    <div className="event-details">
                      <div className="event-target-row">
                        <span className="event-url" title={scan.url}>
                          {scan.url}
                        </span>
                        <span className="event-id">#{scan.id}</span>
                      </div>
                      <div className="event-meta-row">
                        <span className={`event-verdict-text ${isDanger ? "danger" : isWarning ? "warning" : "safe"}`}>
                          {verdict}
                        </span>
                        <span className="event-time">
                          <FiClock style={{ marginRight: 4 }} />
                          {scan.created_at || "Recent"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="event-right">
                    <div className="event-score-display">
                      <span className="score-val">{score}</span>
                      <span className="score-label">RISK</span>
                    </div>
                    <button className="inspect-round-btn" title="Inspect dossier">
                      <FiEye />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
