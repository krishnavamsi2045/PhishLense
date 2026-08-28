import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FiDatabase,
  FiSearch,
  FiDownload,
  FiCheckCircle,
  FiLayers,
  FiTrendingUp,
  FiPieChart,
  FiFileText,
} from "react-icons/fi";

const sampleDataRows = [
  { id: 1, url: "http://paypal-verification-secure-banking.com/login/webscr.php", label: "Phishing", length: 62, entropy: 4.82, digits: 0, subdomains: 2 },
  { id: 2, url: "https://www.google.com/search?q=cybersecurity+defense", label: "Legitimate", length: 54, entropy: 3.91, digits: 0, subdomains: 1 },
  { id: 3, url: "http://185.220.101.5/apple-verification/login.php?token=98aef", label: "Phishing", length: 65, entropy: 5.12, digits: 14, subdomains: 0 },
  { id: 4, url: "https://github.com/torvalds/linux", label: "Legitimate", length: 33, entropy: 3.65, digits: 0, subdomains: 1 },
  { id: 5, url: "http://bit.ly/3xY7kL9_secure_redirect", label: "Suspicious", length: 38, entropy: 4.45, digits: 3, subdomains: 0 },
  { id: 6, url: "http://chase-bank-account-suspended.xyz/auth/login.php", label: "Phishing", length: 53, entropy: 4.75, digits: 0, subdomains: 1 },
  { id: 7, url: "https://en.wikipedia.org/wiki/Phishing", label: "Legitimate", length: 38, entropy: 3.82, digits: 0, subdomains: 2 },
  { id: 8, url: "http://wellsfargo-card-protection.xyz/customer/auth", label: "Phishing", length: 50, entropy: 4.68, digits: 0, subdomains: 1 },
];

export default function DatasetCenter() {
  const [search, setSearch] = useState("");
  const [labelFilter, setLabelFilter] = useState("ALL");

  const filtered = sampleDataRows.filter((r) => {
    const textMatch = r.url.toLowerCase().includes(search.toLowerCase());
    const labelMatch = labelFilter === "ALL" || r.label.toUpperCase() === labelFilter.toUpperCase();
    return textMatch && labelMatch;
  });

  return (
    <div className="admin-view-root">
      {/* Header */}
      <div className="view-header-bar">
        <div>
          <div className="view-badge admin">
            <FiDatabase />
            <span>ENTERPRISE DATA PIPELINE</span>
          </div>
          <h1 className="view-title">PhishLense Dataset v3 Explorer</h1>
          <p className="view-subtitle">
            65,718 curated and balanced URLs across banking, cloud accounts, smishing, and verified benign domains.
          </p>
        </div>

        <button
          className="cyber-action-btn secondary"
          onClick={() => alert("Downloading PhishLense_v3_Dataset_65k.csv...")}
        >
          <FiDownload />
          <span>Export 65k CSV</span>
        </button>
      </div>

      {/* Dataset Overview Cards */}
      <div className="stats-kpi-grid">
        <div className="kpi-card glass-panel">
          <span className="kpi-label">TOTAL CURATED URLS</span>
          <strong className="kpi-value text-cyan">65,718</strong>
          <small className="kpi-sub cyan">100% Deduplicated</small>
        </div>
        <div className="kpi-card glass-panel">
          <span className="kpi-label">PHISHING EXAMPLES</span>
          <strong className="kpi-value text-crimson">37,698</strong>
          <small className="kpi-sub red">Verified IoC Feeds</small>
        </div>
        <div className="kpi-card glass-panel">
          <span className="kpi-label">LEGITIMATE / BENIGN</span>
          <strong className="kpi-value text-green">28,020</strong>
          <small className="kpi-sub green">Tranco / Alexa Top 10k</small>
        </div>
        <div className="kpi-card glass-panel">
          <span className="kpi-label">FEATURE MATRIX</span>
          <strong className="kpi-value text-purple">22 Vectors</strong>
          <small className="kpi-sub">Normalized Continuous & Binary</small>
        </div>
      </div>

      {/* Table & Controls */}
      <div className="table-controls-bar glass-panel mt-6">
        <div className="table-search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search dataset records by URL string..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-pill-group">
          {["ALL", "PHISHING", "LEGITIMATE", "SUSPICIOUS"].map((lbl) => (
            <button
              key={lbl}
              className={`filter-pill-btn ${labelFilter === lbl ? "active" : ""}`}
              onClick={() => setLabelFilter(lbl)}
            >
              {lbl}
            </button>
          ))}
        </div>
      </div>

      <div className="enterprise-table-shell glass-panel">
        <table className="enterprise-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>DATASET URL RECORD</th>
              <th>GROUND TRUTH</th>
              <th>LENGTH</th>
              <th>ENTROPY</th>
              <th>DIGIT COUNT</th>
              <th>SUBDOMAINS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id}>
                <td>
                  <span className="id-tag">#{row.id}</span>
                </td>
                <td>
                  <span className="url-cell" title={row.url}>
                    {row.url}
                  </span>
                </td>
                <td>
                  <span
                    className={`verdict-pill ${
                      row.label === "Phishing"
                        ? "phish"
                        : row.label === "Suspicious"
                        ? "susp"
                        : "safe"
                    }`}
                  >
                    {row.label}
                  </span>
                </td>
                <td>
                  <code>{row.length} chars</code>
                </td>
                <td>
                  <code>{row.entropy}</code>
                </td>
                <td>
                  <code>{row.digits}</code>
                </td>
                <td>
                  <code>{row.subdomains}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
