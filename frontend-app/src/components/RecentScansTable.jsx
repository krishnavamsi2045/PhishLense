import React, { useState } from "react";
import {
  FiClock,
  FiExternalLink,
  FiEye,
  FiTrash2,
  FiShield,
  FiAlertTriangle,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";

export default function RecentScansTable({
  scans = [],
  onSelectScan,
  onClearHistory,
}) {
  const [confirmClear, setConfirmClear] = useState(false);

  const getVerdictBadge = (verdict = "") => {
    const v = String(verdict).toUpperCase();
    if (v.includes("PHISH") || v.includes("MALICIOUS") || v.includes("HIGH_RISK")) {
      return (
        <span className="verdict-badge phishing">
          <FiAlertTriangle className="badge-icon" />
          {v}
        </span>
      );
    }
    if (v.includes("SUSPICIOUS") || v.includes("MEDIUM") || v.includes("LOW")) {
      return (
        <span className="verdict-badge suspicious">
          <FiAlertCircle className="badge-icon" />
          {v}
        </span>
      );
    }
    return (
      <span className="verdict-badge safe">
        <FiCheckCircle className="badge-icon" />
        {v || "SAFE"}
      </span>
    );
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "Recent";
    try {
      const date = new Date(timeStr);
      if (isNaN(date.getTime())) return timeStr;
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch {
      return timeStr;
    }
  };

  return (
    <div className="table-card-shell">
      <div className="table-header-row">
        <div className="table-title-group">
          <FiClock className="table-title-icon" />
          <div>
            <h3>Recent URL Investigations</h3>
            <p className="table-subtitle">Logged detections from local SQLite database</p>
          </div>
        </div>

        <div className="table-actions">
          {scans.length > 0 && (
            <>
              {confirmClear ? (
                <div className="confirm-group">
                  <span className="confirm-text">Clear database?</span>
                  <button
                    className="confirm-btn yes"
                    onClick={() => {
                      onClearHistory();
                      setConfirmClear(false);
                    }}
                  >
                    Confirm
                  </button>
                  <button
                    className="confirm-btn no"
                    onClick={() => setConfirmClear(false)}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  className="clear-history-btn"
                  onClick={() => setConfirmClear(true)}
                  title="Purge scan logs"
                >
                  <FiTrash2 /> Clear Logs
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="table-responsive-container">
        {scans.length === 0 ? (
          <div className="table-empty-state">
            <FiShield className="empty-icon" />
            <h4>No scans recorded yet</h4>
            <p>Paste a URL in the AI Scanner to record your first real threat intelligence investigation.</p>
          </div>
        ) : (
          <table className="cyber-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>ANALYZED URL / TARGET</th>
                <th>VERDICT</th>
                <th>RISK SCORE</th>
                <th>TIME</th>
                <th style={{ textAlign: "right" }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {scans.map((scan) => {
                const score = scan.risk_score || 0;
                return (
                  <tr key={scan.id} className="table-row-hover">
                    <td className="cell-id">#{scan.id}</td>
                    <td className="cell-url">
                      <div className="url-cell-content" title={scan.url}>
                        <span className="url-truncate">{scan.url}</span>
                      </div>
                    </td>
                    <td>{getVerdictBadge(scan.verdict)}</td>
                    <td>
                      <div className="risk-meter-cell">
                        <span
                          className={`risk-val ${
                            score >= 70
                              ? "red"
                              : score >= 35
                              ? "amber"
                              : "green"
                          }`}
                        >
                          {score}
                        </span>
                        <div className="risk-mini-bar">
                          <div
                            className="risk-mini-fill"
                            style={{
                              width: `${Math.min(100, Math.max(5, score))}%`,
                              backgroundColor:
                                score >= 70
                                  ? "#ff3b5c"
                                  : score >= 35
                                  ? "#ffb020"
                                  : "#00e676",
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="cell-time">{formatTime(scan.created_at)}</td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="inspect-action-btn"
                        onClick={() => onSelectScan(scan)}
                        title="View complete evidence & telemetry"
                      >
                        <FiEye /> Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
