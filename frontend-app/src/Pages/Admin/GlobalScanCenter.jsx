import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiShield,
  FiSearch,
  FiFilter,
  FiDownload,
  FiRefreshCw,
  FiAlertTriangle,
  FiCheckCircle,
  FiActivity,
  FiSliders,
} from "react-icons/fi";
import { getHistory } from "../../services/api";

export default function GlobalScanCenter({ onInspectScan }) {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [verdictFilter, setVerdictFilter] = useState("ALL");
  const [minRisk, setMinRisk] = useState(0);

  const fetchScans = async () => {
    try {
      setLoading(true);
      const data = await getHistory(200);
      if (Array.isArray(data)) {
        setScans(data);
      }
    } catch (err) {
      console.warn("Failed to load global scan center:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScans();
  }, []);

  const filteredScans = scans.filter((s) => {
    const matchesSearch = (s.url || "").toLowerCase().includes(search.toLowerCase());
    const matchesVerdict =
      verdictFilter === "ALL" ||
      s.verdict?.toUpperCase() === verdictFilter.toUpperCase();
    const matchesRisk = (s.risk_score || 0) >= minRisk;
    return matchesSearch && matchesVerdict && matchesRisk;
  });

  const exportCSV = () => {
    const headers = ["ID", "URL", "Verdict", "Risk Score", "Threat Level", "Created At"];
    const rows = filteredScans.map((s) => [
      s.id,
      `"${(s.url || "").replace(/"/g, '""')}"`,
      s.verdict,
      s.risk_score,
      s.threat_level || "LOW",
      `"${s.created_at || ""}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encoded = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encoded);
    link.setAttribute("download", `phishlense_global_scans_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="admin-view-root">
      {/* Header */}
      <div className="view-header-bar">
        <div>
          <div className="view-badge admin">
            <FiActivity />
            <span>GLOBAL THREAT REPOSITORY</span>
          </div>
          <h1 className="view-title">Global Scan Center</h1>
          <p className="view-subtitle">
            Multi-tenant URL inspection logs, heuristic breakdown, and threat categorization.
          </p>
        </div>

        <div className="header-actions">
          <button className="cyber-action-btn secondary" onClick={exportCSV}>
            <FiDownload />
            <span>Export CSV</span>
          </button>
          <button className="cyber-action-btn" onClick={fetchScans}>
            <FiRefreshCw className={loading ? "spin" : ""} />
            <span>Sync Records</span>
          </button>
        </div>
      </div>

      {/* Advanced Control Filters */}
      <div className="table-controls-bar glass-panel scan-center-filters">
        <div className="table-search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Filter by target URL or host domain..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-pill-group">
          {["ALL", "PHISHING", "SUSPICIOUS", "SAFE"].map((v) => (
            <button
              key={v}
              className={`filter-pill-btn ${verdictFilter === v ? "active" : ""}`}
              onClick={() => setVerdictFilter(v)}
            >
              {v}
            </button>
          ))}
        </div>

        <div className="risk-slider-wrap">
          <FiSliders />
          <span>Min Risk: {minRisk}</span>
          <input
            type="range"
            min="0"
            max="95"
            step="5"
            value={minRisk}
            onChange={(e) => setMinRisk(Number(e.target.value))}
          />
        </div>
      </div>

      {/* Table */}
      <div className="enterprise-table-shell glass-panel">
        <table className="enterprise-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>TARGET URL</th>
              <th>VERDICT</th>
              <th>RISK SCORE</th>
              <th>CONFIDENCE</th>
              <th>SCAN TYPE</th>
              <th>LOGGED AT</th>
            </tr>
          </thead>
          <tbody>
            {filteredScans.map((scan) => {
              const score = scan.risk_score || 0;
              const verdict = (scan.verdict || "SAFE").toUpperCase();
              const isDanger = verdict.includes("PHISH") || score >= 60;
              const isWarning = verdict.includes("SUSP") || (score >= 30 && score < 60);

              return (
                <tr
                  key={scan.id}
                  className="clickable-row"
                  onClick={() => onInspectScan && onInspectScan(scan)}
                >
                  <td>
                    <span className="id-tag">#{scan.id}</span>
                  </td>
                  <td>
                    <span className="url-cell" title={scan.url}>
                      {scan.url}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`verdict-pill ${
                        isDanger ? "phish" : isWarning ? "susp" : "safe"
                      }`}
                    >
                      {verdict}
                    </span>
                  </td>
                  <td>
                    <div className="score-meter-cell">
                      <div className="score-bar-bg">
                        <div
                          className={`score-bar-fill ${
                            isDanger ? "danger" : isWarning ? "warning" : "safe"
                          }`}
                          style={{ width: `${Math.min(100, score)}%` }}
                        />
                      </div>
                      <span className="score-val">{score}/100</span>
                    </div>
                  </td>
                  <td>
                    <span className="confidence-label">{scan.confidence || 95}%</span>
                  </td>
                  <td>
                    <span className="type-badge">{scan.scan_type || "MANUAL"}</span>
                  </td>
                  <td>
                    <span className="time-label">{scan.created_at || "Just now"}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
