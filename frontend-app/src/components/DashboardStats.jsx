import { useEffect, useState } from "react";

const apiBase =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

export default function DashboardStats() {
  const [stats, setStats] = useState({
    total_scans: 0,
    phishing: 0,
    suspicious: 0,
    safe: 0,
  });

  useEffect(() => {
    fetch(`${apiBase}/stats`)
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(console.error);
  }, []);

  return (
    <section className="stats-grid">
      <div className="stat-card">
        <h3>Total Scans</h3>
        <span>{stats.total_scans}</span>
      </div>

      <div className="stat-card">
        <h3>Phishing</h3>
        <span>{stats.phishing}</span>
      </div>

      <div className="stat-card">
        <h3>Suspicious</h3>
        <span>{stats.suspicious}</span>
      </div>

      <div className="stat-card">
        <h3>Safe</h3>
        <span>{stats.safe}</span>
      </div>
    </section>
  );
}