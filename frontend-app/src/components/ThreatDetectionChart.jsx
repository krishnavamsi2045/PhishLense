import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FiTrendingUp } from "react-icons/fi";

export default function ThreatDetectionChart({ recentScans = [] }) {
  // Build time-series or sequence data from scan history
  const data =
    recentScans.length > 0
      ? [...recentScans]
          .reverse()
          .slice(-12)
          .map((scan, idx) => ({
            id: `#${scan.id}`,
            score: scan.risk_score || 0,
            verdict: scan.verdict,
            safeThreshold: 30,
            phishingThreshold: 75,
          }))
      : [];

  const hasData = data.length > 0;

  return (
    <div className="analytics-card-shell">
      <div className="analytics-card-header">
        <div className="card-title-group">
          <FiTrendingUp className="card-icon" />
          <div>
            <h3>Risk Trajectory & Threat Curve</h3>
            <p className="card-subtitle">Sequence of analyzed URL risk levels (0-100)</p>
          </div>
        </div>
        <span className="live-indicator-pill">
          <span className="live-dot" /> Telemetry Curve
        </span>
      </div>

      <div className="chart-wrapper">
        {!hasData ? (
          <div className="chart-empty-state">
            <div className="empty-wave-line" />
            <p>No risk trajectory points recorded.</p>
            <small>Submit URLs to view dynamic risk progression curves.</small>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart
              data={data}
              margin={{ top: 10, right: 20, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#00e5ff" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="phishAlert" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff3b5c" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#ff3b5c" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 229, 255, 0.08)" />
              <XAxis
                dataKey="id"
                stroke="#4d6680"
                fontSize={11}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                stroke="#4d6680"
                fontSize={11}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(5, 11, 24, 0.95)",
                  borderColor: "rgba(0, 229, 255, 0.3)",
                  borderRadius: 8,
                  boxShadow: "0 0 15px rgba(0, 229, 255, 0.2)",
                  color: "#e2f1f8",
                  fontSize: 12,
                }}
                formatter={(val, name) => [`${val} / 100`, "Risk Score"]}
                labelFormatter={(label) => `Scan: ${label}`}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#00e5ff"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#scoreGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
