import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FiFileText,
  FiDownload,
  FiPieChart,
  FiBarChart2,
  FiShield,
  FiCheckCircle,
  FiAlertTriangle,
  FiActivity,
  FiDatabase,
} from "react-icons/fi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function ReportsView({ stats, analytics, recentScans = [] }) {
  const [downloading, setDownloading] = useState(false);

  const totalScans = stats?.total_scans || 0;
  const phishingCount = stats?.phishing || 0;
  const suspiciousCount = stats?.suspicious || 0;
  const safeCount = stats?.safe || 0;

  // Calculate average risk score
  const avgRiskScore =
    recentScans.length > 0
      ? Math.round(
          recentScans.reduce((acc, s) => acc + (s.risk_score || 0), 0) /
            recentScans.length
        )
      : 0;

  const phishingRate =
    totalScans > 0 ? ((phishingCount / totalScans) * 100).toFixed(1) : "0.0";
  const safeRate =
    totalScans > 0 ? ((safeCount / totalScans) * 100).toFixed(1) : "0.0";

  // Score distribution breakdown data
  const scoreBuckets = [
    { range: "0 - 29 (Safe)", count: safeCount, fill: "#00e5ff" },
    { range: "30 - 59 (Suspicious)", count: suspiciousCount, fill: "#ffb020" },
    { range: "60 - 100 (Phishing)", count: phishingCount, fill: "#ff3b5c" },
  ];

  // Function to export real CSV report from scan history
  const handleExportCSV = () => {
    setDownloading(true);
    try {
      const headers = ["ID", "URL", "Verdict", "Risk Score", "Created At"];
      const rows = recentScans.map((s) => [
        s.id,
        `"${(s.url || "").replace(/"/g, '""')}"`,
        s.verdict || "UNKNOWN",
        s.risk_score || 0,
        `"${s.created_at || ""}"`,
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `phishlense_threat_report_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setTimeout(() => setDownloading(false), 600);
    }
  };

  return (
    <motion.div
      className="reports-workspace"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
    >
      <div className="workspace-header">
        <div className="workspace-title-group">
          <div className="header-icon-wrap">
            <FiFileText />
          </div>
          <div>
            <h2>Security Intelligence & Audit Reports</h2>
            <p>Exportable threat dossiers, historical risk distributions, and compliance summaries.</p>
          </div>
        </div>

        <div className="reports-top-actions">
          <button
            className="export-csv-btn"
            onClick={handleExportCSV}
            disabled={downloading || recentScans.length === 0}
            title={recentScans.length === 0 ? "No scan data to export" : "Export CSV Report"}
          >
            <FiDownload />
            <span>{downloading ? "Generating CSV..." : "Export CSV Report"}</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Highlights */}
      <div className="reports-kpi-grid">
        <div className="report-stat-card">
          <span className="report-stat-label">Total Logged Detections</span>
          <strong className="report-stat-value">{totalScans}</strong>
          <span className="report-stat-sub">From local database</span>
        </div>
        <div className="report-stat-card">
          <span className="report-stat-label">Phishing Detection Rate</span>
          <strong className="report-stat-value red">{phishingRate}%</strong>
          <span className="report-stat-sub">{phishingCount} confirmed threats</span>
        </div>
        <div className="report-stat-card">
          <span className="report-stat-label">Average Risk Rating</span>
          <strong className="report-stat-value amber">{avgRiskScore} / 100</strong>
          <span className="report-stat-sub">Composite heuristic index</span>
        </div>
        <div className="report-stat-card">
          <span className="report-stat-label">Verified Safe Ratio</span>
          <strong className="report-stat-value green">{safeRate}%</strong>
          <span className="report-stat-sub">{safeCount} clean destinations</span>
        </div>
      </div>

      {/* Score Range Distribution Chart */}
      <div className="analytics-card-shell">
        <div className="analytics-card-header">
          <div className="card-title-group">
            <FiBarChart2 className="card-icon" />
            <div>
              <h3>Risk Score Distribution Histogram</h3>
              <p className="card-subtitle">Volume of evaluated links partitioned by risk score tiers</p>
            </div>
          </div>
          <span className="sample-count-badge">Audit Ready</span>
        </div>

        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={scoreBuckets}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 229, 255, 0.08)" />
              <XAxis dataKey="range" stroke="#7e9bb6" fontSize={12} tickLine={false} />
              <YAxis allowDecimals={false} stroke="#7e9bb6" fontSize={12} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(5, 11, 24, 0.95)",
                  borderColor: "rgba(0, 229, 255, 0.3)",
                  borderRadius: 8,
                  color: "#e2f1f8",
                  fontSize: 12,
                }}
                formatter={(val) => [`${val} Scans`, "Count"]}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {scoreBuckets.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Dataset & Reference Section */}
      <div className="reports-dataset-card">
        <div className="dataset-card-left">
          <FiDatabase className="dataset-icon" />
          <div>
            <h4>Phishing Model Training & Benchmark Dataset</h4>
            <p>Access the curated <code>url_dataset.csv</code> benchmark dataset used for model calibration and heuristic evaluation.</p>
          </div>
        </div>
        <a
          href="/url_dataset.csv"
          download="url_dataset.csv"
          className="download-dataset-btn"
        >
          <FiDownload /> Download Dataset CSV
        </a>
      </div>
    </motion.div>
  );
}
