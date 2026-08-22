import { useState, useEffect, useCallback } from "react";
import { getStats, getAnalytics, getDashboard, checkHealth } from "../services/api";

export function useDashboard(pollInterval = 10000) {
  const [stats, setStats] = useState({
    total_scans: 0,
    phishing: 0,
    suspicious: 0,
    safe: 0,
  });
  const [analytics, setAnalytics] = useState({
    labels: ["Phishing", "Suspicious", "Safe"],
    values: [0, 0, 0],
  });
  const [backendOnline, setBackendOnline] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      const health = await checkHealth();
      setBackendOnline(health.online);

      if (health.online) {
        const [statsRes, analyticsRes] = await Promise.allSettled([
          getStats(),
          getAnalytics(),
        ]);

        if (statsRes.status === "fulfilled" && statsRes.value) {
          setStats(statsRes.value);
        }
        if (analyticsRes.status === "fulfilled" && analyticsRes.value) {
          setAnalytics(analyticsRes.value);
        }
      }
    } catch (err) {
      console.warn("Dashboard polling error:", err);
      setBackendOnline(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const timer = setInterval(fetchDashboardData, pollInterval);
    return () => clearInterval(timer);
  }, [fetchDashboardData, pollInterval]);

  return { stats, analytics, backendOnline, loading, refresh: fetchDashboardData };
}
