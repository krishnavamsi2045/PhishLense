import React from "react";
import { motion } from "framer-motion";
import {
  FiShield,
  FiAlertTriangle,
  FiAlertCircle,
  FiCheckCircle,
  FiActivity,
  FiServer,
} from "react-icons/fi";
import StatCard from "../components/StatCard";
import ThreatMap from "../components/ThreatMap";
import ThreatDetectionChart from "../components/ThreatDetectionChart";
import ThreatBreakdown from "../components/ThreatBreakdown";
import RecentScansTable from "../components/RecentScansTable";
import AIEngineStatus from "../components/AIEngineStatus";

export default function DashboardView({
  stats,
  analytics,
  recentScans = [],
  onSelectScan,
  onClearHistory,
  backendOnline,
}) {
  const totalScans = stats?.total_scans || 0;
  const phishingCount = stats?.phishing || 0;
  const suspiciousCount = stats?.suspicious || 0;
  const safeCount = stats?.safe || 0;

  return (
    <motion.div
      className="dashboard-view-container"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
    >
      {/* Backend Offline Notice if needed */}
      {!backendOnline && (
        <div className="backend-offline-banner">
          <FiServer className="banner-icon" />
          <div className="banner-text">
            <strong>FastAPI Backend Offline (http://127.0.0.1:8000)</strong>
            <span>Start the API server with <code>uvicorn api.main:app --reload</code> to enable live database persistence and model evaluation.</span>
          </div>
        </div>
      )}

      {/* KPI Stats Row */}
      <div className="kpi-grid">
        <StatCard
          icon={FiActivity}
          label="Total URLs Scanned"
          value={totalScans}
          variant="cyan"
          subtitle="All-time processed links"
        />
        <StatCard
          icon={FiAlertTriangle}
          label="Phishing Threats"
          value={phishingCount}
          variant="red"
          subtitle={
            totalScans > 0
              ? `${Math.round((phishingCount / totalScans) * 100)}% of scanned links`
              : "High-confidence detections"
          }
        />
        <StatCard
          icon={FiAlertCircle}
          label="Suspicious URLs"
          value={suspiciousCount}
          variant="amber"
          subtitle="Heuristic & anomaly flags"
        />
        <StatCard
          icon={FiCheckCircle}
          label="Safe Destinations"
          value={safeCount}
          variant="green"
          subtitle="Clean verified infrastructure"
        />
      </div>

      {/* 3D Threat Map Centerpiece */}
      <ThreatMap stats={stats} recentScans={recentScans} />

      {/* Analytics Charts Row */}
      <div className="charts-grid-two-col">
        <ThreatDetectionChart recentScans={recentScans} />
        <ThreatBreakdown analyticsData={analytics} />
      </div>

      {/* AI Engine Status Row */}
      <AIEngineStatus
        activeThreat={phishingCount > 0 ? "high" : suspiciousCount > 0 ? "medium" : "low"}
      />

      {/* Recent Scans Table */}
      <RecentScansTable
        scans={recentScans}
        onSelectScan={onSelectScan}
        onClearHistory={onClearHistory}
      />
    </motion.div>
  );
}
