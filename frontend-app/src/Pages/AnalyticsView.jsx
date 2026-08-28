import React from "react";
import { motion } from "framer-motion";
import {
  FiBarChart2,
  FiTrendingUp,
  FiPieChart,
  FiShield,
  FiActivity,
  FiRefreshCw,
} from "react-icons/fi";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const weeklyData = [
  { day: "Mon", total: 28, phishing: 12, safe: 14 },
  { day: "Tue", total: 34, phishing: 16, safe: 15 },
  { day: "Wed", total: 45, phishing: 21, safe: 20 },
  { day: "Thu", total: 38, phishing: 18, safe: 17 },
  { day: "Fri", total: 52, phishing: 26, safe: 21 },
  { day: "Sat", total: 22, phishing: 9, safe: 12 },
  { day: "Sun", total: 19, phishing: 7, safe: 11 },
];

const categoryData = [
  { name: "Financial / Banking", value: 34, color: "#ff3b5c" },
  { name: "Tech / Cloud Accounts", value: 26, color: "#9d4edd" },
  { name: "Social Media Impersonation", value: 16, color: "#00f0ff" },
  { name: "Smishing & Logistics", value: 13, color: "#ffd166" },
  { name: "Crypto Drainers", value: 11, color: "#06d6a0" },
];

export default function AnalyticsView({ stats, analytics }) {
  return (
    <div className="admin-view-root">
      {/* Header */}
      <div className="view-header-bar">
        <div>
          <div className="view-badge">
            <FiBarChart2 />
            <span>THREAT TELEMETRY ANALYTICS</span>
          </div>
          <h1 className="view-title">SOC Analytics & Threat Trends</h1>
          <p className="view-subtitle">
            Longitudinal phishing patterns, threat category distributions, and daily interception volumes.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats-kpi-grid">
        <div className="kpi-card glass-panel">
          <span className="kpi-label">7-DAY SCANS VOLUME</span>
          <strong className="kpi-value text-cyan">238 URLs</strong>
          <small className="kpi-sub cyan">+18% vs previous week</small>
        </div>
        <div className="kpi-card glass-panel danger">
          <span className="kpi-label">PEAK ATTACK DAY</span>
          <strong className="kpi-value text-crimson">Friday (26 Phish)</strong>
          <small className="kpi-sub red">Weekend staging spikes</small>
        </div>
        <div className="kpi-card glass-panel">
          <span className="kpi-label">PRIMARY TARGET SECTOR</span>
          <strong className="kpi-value text-purple">Banking (34%)</strong>
          <small className="kpi-sub">Credential Harvest Scams</small>
        </div>
        <div className="kpi-card glass-panel">
          <span className="kpi-label">AVG RISK INTERCEPTION</span>
          <strong className="kpi-value text-yellow">94.2 / 100</strong>
          <small className="kpi-sub">High-Confidence Mitigations</small>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="analytics-charts-split-grid mt-6">
        {/* Weekly Area Trend Chart */}
        <div className="glass-panel chart-panel">
          <div className="panel-inner-header">
            <div className="panel-heading">
              <FiTrendingUp className="panel-icon cyan" />
              <div>
                <h3>Weekly Scan & Phishing Ingestion</h3>
                <p>Daily volume of inspected links vs identified malicious nodes</p>
              </div>
            </div>
          </div>

          <div className="chart-canvas-container" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00f0ff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPhish" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff3b5c" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#ff3b5c" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#8892b0" />
                <YAxis stroke="#8892b0" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0d1117",
                    borderColor: "rgba(255,59,92,0.3)",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#00f0ff"
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                  name="Total Scans"
                />
                <Area
                  type="monotone"
                  dataKey="phishing"
                  stroke="#ff3b5c"
                  fillOpacity={1}
                  fill="url(#colorPhish)"
                  name="Phishing Threats"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Donut */}
        <div className="glass-panel chart-panel">
          <div className="panel-inner-header">
            <div className="panel-heading">
              <FiPieChart className="panel-icon red" />
              <div>
                <h3>Threat Category Distribution</h3>
                <p>Targeted business verticals and campaign types</p>
              </div>
            </div>
          </div>

          <div className="donut-chart-wrap" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0d1117",
                    borderColor: "rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="donut-legend-grid">
            {categoryData.map((c, i) => (
              <div key={i} className="legend-item">
                <span className="dot" style={{ backgroundColor: c.color }} />
                <span className="legend-name">{c.name}</span>
                <span className="legend-val">{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
