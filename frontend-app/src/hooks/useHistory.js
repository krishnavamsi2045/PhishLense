import { useState, useEffect, useCallback } from "react";
import { getHistory, clearHistory as apiClearHistory } from "../services/api";

export function useHistory(pollInterval = 10000) {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    try {
      const data = await getHistory();
      if (Array.isArray(data)) {
        setScans(data);
      }
    } catch (err) {
      console.warn("History polling error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearAllHistory = async () => {
    try {
      await apiClearHistory();
      setScans([]);
      return true;
    } catch (err) {
      console.error("Clear history error:", err);
      return false;
    }
  };

  const exportCSV = () => {
    try {
      const headers = ["ID", "URL", "Verdict", "Risk Score", "Created At"];
      const rows = scans.map((s) => [
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
        `phishlense_history_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return true;
    } catch (err) {
      console.error("CSV export failed:", err);
      return false;
    }
  };

  useEffect(() => {
    fetchHistory();
    const timer = setInterval(fetchHistory, pollInterval);
    return () => clearInterval(timer);
  }, [fetchHistory, pollInterval]);

  return { scans, loading, refresh: fetchHistory, clearAllHistory, exportCSV };
}
