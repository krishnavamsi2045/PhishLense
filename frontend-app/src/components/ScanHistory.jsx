import { useEffect, useState } from "react";

const apiBase =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

export default function ScanHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetch(`${apiBase}/history`)
      .then((res) => res.json())
      .then((data) => setHistory(data))
      .catch(console.error);
  }, []);

  return (
    <div className="history-table">
      <h2>Recent Scans</h2>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>URL</th>
            <th>Verdict</th>
            <th>Risk</th>
          </tr>
        </thead>

        <tbody>
          {history.map((scan) => (
            <tr key={scan.id}>
              <td>{scan.id}</td>
              <td>{scan.url}</td>
              <td>{scan.verdict}</td>
              <td>{scan.risk_score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}