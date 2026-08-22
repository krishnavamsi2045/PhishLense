import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { FiPieChart } from "react-icons/fi";

const COLORS = {
  Phishing: "#ff3b5c",
  Suspicious: "#ffb020",
  Safe: "#00e5ff",
};

export default function ThreatBreakdown({ analyticsData }) {
  const labels = analyticsData?.labels || ["Phishing", "Suspicious", "Safe"];
  const values = analyticsData?.values || [0, 0, 0];

  const total = values.reduce((sum, v) => sum + v, 0);

  const data = labels.map((label, idx) => ({
    name: label,
    value: values[idx] || 0,
    color: COLORS[label] || "#7c3aed",
    percentage: total > 0 ? Math.round(((values[idx] || 0) / total) * 100) : 0,
  }));

  const isEmpty = total === 0;

  return (
    <div className="analytics-card-shell">
      <div className="analytics-card-header">
        <div className="card-title-group">
          <FiPieChart className="card-icon" />
          <div>
            <h3>Threat Breakdown</h3>
            <p className="card-subtitle">Distribution by classification verdict</p>
          </div>
        </div>
        <span className="sample-count-badge">{total} Total Scans</span>
      </div>

      <div className="pie-chart-container">
        {isEmpty ? (
          <div className="chart-empty-state">
            <div className="empty-donut-ring" />
            <p>No scan data available yet.</p>
            <small>Analyze URLs to populate real-time threat breakdown.</small>
          </div>
        ) : (
          <div className="donut-chart-layout">
            <div className="donut-wrapper">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={88}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(5, 11, 24, 0.95)",
                      borderColor: "rgba(0, 229, 255, 0.3)",
                      borderRadius: 8,
                      boxShadow: "0 0 15px rgba(0, 229, 255, 0.2)",
                      color: "#e2f1f8",
                      fontSize: 12,
                    }}
                    itemStyle={{ color: "#e2f1f8" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-center-stat">
                <span className="donut-center-val">{total}</span>
                <span className="donut-center-lbl">VERDICTS</span>
              </div>
            </div>

            <div className="breakdown-legend">
              {data.map((item) => (
                <div key={item.name} className="legend-row">
                  <div className="legend-left">
                    <span
                      className="legend-bullet"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="legend-name">{item.name}</span>
                  </div>
                  <div className="legend-right">
                    <span className="legend-count">{item.value}</span>
                    <span className="legend-pct">({item.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
