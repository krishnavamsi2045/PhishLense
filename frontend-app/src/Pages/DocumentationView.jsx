import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FiBookOpen,
  FiTerminal,
  FiCode,
  FiCheckCircle,
  FiServer,
  FiChevronDown,
  FiChevronRight,
  FiCopy,
  FiCheck,
} from "react-icons/fi";
import { API_BASE_URL } from "../services/api";

const endpoints = [
  {
    method: "POST",
    path: "/analyze",
    title: "Analyze URL",
    desc: "Executes ML prediction, heuristic rules, domain age, and SSL checks on the submitted URL. Saves scan record to database.",
    requestBody: JSON.stringify({ url: "https://paypal-security-login.com" }, null, 2),
    responseBody: JSON.stringify(
      {
        url: "https://paypal-security-login.com",
        final_verdict: "PHISHING",
        risk_score: 85,
        severity: "HIGH",
        confidence: 94,
        recommendation: "Do NOT visit this URL.",
        heuristic_verdict: "PHISHING",
        ml_prediction: { prediction: "Phishing", confidence: 92.4 },
        domain_age_days: 4,
        ssl: { valid: false, days_left: 0 },
        reasons: ["Domain registered within last 7 days", "High-risk keyword pattern match"],
        detection_sources: ["Heuristic Engine", "Machine Learning"],
        scan_id: 42,
      },
      null,
      2
    ),
  },
  {
    method: "GET",
    path: "/stats",
    title: "Get Aggregate Statistics",
    desc: "Returns total scans count, phishing threats count, suspicious count, and safe URLs count.",
    requestBody: null,
    responseBody: JSON.stringify(
      {
        total_scans: 14,
        phishing: 6,
        suspicious: 3,
        safe: 5,
      },
      null,
      2
    ),
  },
  {
    method: "GET",
    path: "/analytics",
    title: "Get Classification Analytics",
    desc: "Returns labels and values arrays for chart rendering.",
    requestBody: null,
    responseBody: JSON.stringify(
      {
        labels: ["Phishing", "Suspicious", "Safe"],
        values: [6, 3, 5],
      },
      null,
      2
    ),
  },
  {
    method: "GET",
    path: "/dashboard",
    title: "Get Dashboard Summary",
    desc: "Returns consolidated summary metrics and the 10 most recent scans.",
    requestBody: null,
    responseBody: JSON.stringify(
      {
        summary: { total_scans: 14, phishing: 6, suspicious: 3, safe: 5 },
        recent_scans: [
          { id: 42, url: "https://paypal-security-login.com", verdict: "PHISHING", risk_score: 85, created_at: "2026-08-20 14:22:01" },
        ],
      },
      null,
      2
    ),
  },
  {
    method: "GET",
    path: "/history",
    title: "Get Scan History",
    desc: "Returns up to 100 historical scan records from SQLite.",
    requestBody: null,
    responseBody: JSON.stringify(
      [
        { id: 42, url: "https://paypal-security-login.com", verdict: "PHISHING", risk_score: 85, created_at: "2026-08-20 14:22:01" },
      ],
      null,
      2
    ),
  },
  {
    method: "GET",
    path: "/scan/{scan_id}",
    title: "Get Single Scan Details",
    desc: "Returns details of a single scan by ID.",
    requestBody: null,
    responseBody: JSON.stringify(
      { id: 42, url: "https://paypal-security-login.com", verdict: "PHISHING", risk_score: 85, created_at: "2026-08-20 14:22:01" },
      null,
      2
    ),
  },
  {
    method: "DELETE",
    path: "/history",
    title: "Clear Scan History",
    desc: "Deletes all scan records from the database.",
    requestBody: null,
    responseBody: JSON.stringify({ message: "History cleared successfully", deleted_records: 14 }, null, 2),
  },
  {
    method: "GET",
    path: "/health",
    title: "Health Check",
    desc: "Returns health status of the API server.",
    requestBody: null,
    responseBody: JSON.stringify({ status: "healthy" }, null, 2),
  },
];

export default function DocumentationView() {
  const [expandedIdx, setExpandedIdx] = useState(0);
  const [copiedIdx, setCopiedIdx] = useState(null);

  const copyEndpoint = (endpoint, idx) => {
    navigator.clipboard.writeText(`${API_BASE_URL}${endpoint.path}`);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <motion.div
      className="docs-workspace"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
    >
      <div className="workspace-header">
        <div className="workspace-title-group">
          <div className="header-icon-wrap">
            <FiBookOpen />
          </div>
          <div>
            <h2>API Documentation & Reference</h2>
            <p>Interactive REST endpoint specifications, request payloads, and response schemas.</p>
          </div>
        </div>
        <div className="docs-badge">
          <span>Base: {API_BASE_URL}</span>
        </div>
      </div>

      <div className="endpoints-accordion-list">
        {endpoints.map((ep, idx) => {
          const isExpanded = expandedIdx === idx;
          return (
            <div key={idx} className={`endpoint-card ${isExpanded ? "open" : ""}`}>
              <div
                className="endpoint-summary-bar"
                onClick={() => setExpandedIdx(isExpanded ? -1 : idx)}
              >
                <div className="endpoint-meta">
                  <span className={`method-pill ${ep.method.toLowerCase()}`}>
                    {ep.method}
                  </span>
                  <span className="endpoint-path font-mono">{ep.path}</span>
                  <span className="endpoint-name">{ep.title}</span>
                </div>
                <div className="endpoint-right">
                  <button
                    className="copy-url-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyEndpoint(ep, idx);
                    }}
                    title="Copy full URL"
                  >
                    {copiedIdx === idx ? <FiCheck /> : <FiCopy />}
                  </button>
                  <span className="accordion-chevron">
                    {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
                  </span>
                </div>
              </div>

              {isExpanded && (
                <div className="endpoint-body">
                  <p className="endpoint-desc">{ep.desc}</p>

                  {ep.requestBody && (
                    <div className="payload-box">
                      <span className="payload-title">Request Body (JSON)</span>
                      <pre className="payload-code font-mono">
                        <code>{ep.requestBody}</code>
                      </pre>
                    </div>
                  )}

                  <div className="payload-box">
                    <span className="payload-title">Response Schema (200 OK)</span>
                    <pre className="payload-code font-mono">
                      <code>{ep.responseBody}</code>
                    </pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
