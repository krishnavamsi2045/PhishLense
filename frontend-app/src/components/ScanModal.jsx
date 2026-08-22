import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiX,
  FiShield,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiCopy,
  FiCheck,
  FiCpu,
  FiGlobe,
  FiLock,
  FiExternalLink,
  FiServer,
  FiFileText,
} from "react-icons/fi";

export default function ScanModal({ scan, onClose, onRescan }) {
  const [copied, setCopied] = useState(false);

  if (!scan) return null;

  const score = scan.risk_score || 0;
  const verdict = scan.verdict || "UNKNOWN";
  const upperVerdict = verdict.toUpperCase();
  const isDanger =
    upperVerdict.includes("PHISH") ||
    upperVerdict.includes("MALICIOUS") ||
    score >= 60;
  const isWarning =
    upperVerdict.includes("SUSPICIOUS") ||
    upperVerdict.includes("MEDIUM") ||
    (score >= 30 && score < 60);

  const copyReport = () => {
    const text = `[PhishLense Investigation Report]\nID: #${scan.id}\nTarget: ${scan.url}\nVerdict: ${verdict}\nRisk Score: ${score}/100\nTimestamp: ${scan.created_at || "N/A"}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="modal-backdrop" onClick={onClose}>
        <motion.div
          className="scan-modal-shell"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
        >
          {/* Modal Header */}
          <div className="modal-header">
            <div className="modal-title-wrap">
              <div
                className={`modal-badge ${
                  isDanger ? "danger" : isWarning ? "warning" : "safe"
                }`}
              >
                {isDanger ? (
                  <FiAlertTriangle />
                ) : isWarning ? (
                  <FiAlertTriangle />
                ) : (
                  <FiCheckCircle />
                )}
                <span>EVIDENCE DOSSIER #{scan.id}</span>
              </div>
              <span className="modal-timestamp">
                <FiClock style={{ marginRight: 4 }} />
                {scan.created_at || "Recent"}
              </span>
            </div>

            <div className="modal-actions">
              <button
                className="modal-copy-btn"
                onClick={copyReport}
                title="Copy Analyst Report"
              >
                {copied ? <FiCheck /> : <FiCopy />}
                {copied ? "Copied" : "Copy Dossier"}
              </button>
              <button className="modal-close-btn" onClick={onClose}>
                <FiX />
              </button>
            </div>
          </div>

          {/* Modal Target URL */}
          <div className="modal-target-box">
            <label>ANALYZED TARGET URL</label>
            <div className="target-url-line">
              <FiGlobe className="target-icon" />
              <span className="target-url-text">{scan.url}</span>
            </div>
          </div>

          {/* Risk Score and Verdict Breakdown */}
          <div className="modal-verdict-grid">
            <div className="verdict-score-box">
              <div
                className="score-gauge-ring"
                style={{
                  background: `conic-gradient(${
                    isDanger ? "#ff3b5c" : isWarning ? "#ffb020" : "#00e676"
                  } ${(score / 100) * 360}deg, rgba(255,255,255,0.06) 0deg)`,
                }}
              >
                <div className="score-inner">
                  <strong>{score}</strong>
                  <span>RISK / 100</span>
                </div>
              </div>

              <div className="verdict-meta">
                <span className="meta-label">FINAL CLASSIFICATION</span>
                <h3
                  className={`verdict-text ${
                    isDanger ? "danger" : isWarning ? "warning" : "safe"
                  }`}
                >
                  {verdict}
                </h3>
                <span className="meta-recommendation">
                  {isDanger
                    ? "Do NOT visit or interact with this destination."
                    : isWarning
                    ? "Proceed with caution. Verify sender authenticity."
                    : "Destination verified clean by heuristic and ML models."}
                </span>
              </div>
            </div>
          </div>

          {/* Telemetry Highlights */}
          <div className="modal-telemetry-section">
            <h4>
              <FiCpu /> Telemetry & Security Signals
            </h4>
            <div className="telemetry-tags-grid">
              <div className="telemetry-tag-item">
                <span className="tag-label">Engine Model</span>
                <span className="tag-val">Random Forest (v1.0)</span>
              </div>
              <div className="telemetry-tag-item">
                <span className="tag-label">Persistence</span>
                <span className="tag-val">SQLite Logged</span>
              </div>
              <div className="telemetry-tag-item">
                <span className="tag-label">Protocol</span>
                <span className="tag-val">
                  {scan.url?.startsWith("https://") ? "HTTPS Encrypted" : "HTTP Plaintext"}
                </span>
              </div>
              <div className="telemetry-tag-item">
                <span className="tag-label">Scan Context</span>
                <span className="tag-val">PhishLense Local Engine</span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="modal-footer">
            {onRescan && (
              <button
                className="modal-rescan-btn"
                onClick={() => {
                  onRescan(scan.url);
                  onClose();
                }}
              >
                <FiShield /> Run Deep Re-scan in Workspace
              </button>
            )}
            <button className="modal-done-btn" onClick={onClose}>
              Close Dossier
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
