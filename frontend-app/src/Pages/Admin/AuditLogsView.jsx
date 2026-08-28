import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiFileText,
  FiSearch,
  FiRefreshCw,
  FiShield,
  FiCheckCircle,
  FiAlertTriangle,
  FiXCircle,
  FiClock,
  FiTerminal,
  FiGlobe,
} from "react-icons/fi";
import { getAdminAuditLogs } from "../../services/api";

export default function AuditLogsView() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await getAdminAuditLogs(100);
      if (Array.isArray(data)) {
        setLogs(data);
      }
    } catch (err) {
      console.warn("Failed to load audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((l) => {
    const textMatch =
      (l.user_email || "").toLowerCase().includes(search.toLowerCase()) ||
      (l.action || "").toLowerCase().includes(search.toLowerCase()) ||
      (l.resource || "").toLowerCase().includes(search.toLowerCase()) ||
      (l.ip_address || "").toLowerCase().includes(search.toLowerCase());

    const filterMatch =
      actionFilter === "ALL" ||
      l.action?.toUpperCase().includes(actionFilter.toUpperCase());

    return textMatch && filterMatch;
  });

  return (
    <div className="admin-view-root">
      {/* Header */}
      <div className="view-header-bar">
        <div>
          <div className="view-badge admin">
            <FiFileText />
            <span>COMPLIANCE & TRACEABILITY AUDIT</span>
          </div>
          <h1 className="view-title">SOC Security Audit Logs</h1>
          <p className="view-subtitle">
            Immutable session events, authentication logs, permission changes, and URL dispatch records.
          </p>
        </div>

        <button className="cyber-action-btn" onClick={fetchLogs}>
          <FiRefreshCw className={loading ? "spin" : ""} />
          <span>Sync Audit Stream</span>
        </button>
      </div>

      {/* Filter Controls */}
      <div className="table-controls-bar glass-panel">
        <div className="table-search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search by operator email, action type, IP address, or IoC..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-pill-group">
          {["ALL", "AUTH", "SCAN", "MODEL", "USER"].map((f) => (
            <button
              key={f}
              className={`filter-pill-btn ${actionFilter === f ? "active" : ""}`}
              onClick={() => setActionFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="enterprise-table-shell glass-panel">
        <table className="enterprise-table">
          <thead>
            <tr>
              <th>EVENT ID</th>
              <th>TIMESTAMP (UTC)</th>
              <th>OPERATOR</th>
              <th>SECURITY ACTION</th>
              <th>RESOURCE TARGET</th>
              <th>CLIENT IP</th>
              <th>STATUS</th>
              <th>DETAILS</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => {
              const isSuccess = log.status === "SUCCESS";
              const isFailed = log.status === "FAILED" || log.status === "BLOCKED";

              return (
                <tr key={log.id}>
                  <td>
                    <span className="id-tag">#{log.id}</span>
                  </td>
                  <td>
                    <span className="time-label">{log.created_at || "Just now"}</span>
                  </td>
                  <td>
                    <strong className="user-email">{log.user_email}</strong>
                  </td>
                  <td>
                    <span className="action-tag">{log.action}</span>
                  </td>
                  <td>
                    <code className="resource-code">{log.resource || "N/A"}</code>
                  </td>
                  <td>
                    <span className="ip-label">{log.ip_address}</span>
                  </td>
                  <td>
                    <span
                      className={`status-pill ${
                        isSuccess ? "active" : isFailed ? "inactive" : "warning"
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td>
                    <span className="details-cell">{log.details || "-"}</span>
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
