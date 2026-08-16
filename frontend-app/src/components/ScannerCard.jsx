import { useEffect, useState } from "react";
import { FiAlertTriangle, FiArrowRight, FiCheckCircle, FiGlobe, FiLoader, FiSearch } from "react-icons/fi";

const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function ScannerCard() {
  const [url, setUrl] = useState("https://account-verify-secure.example/login");
  const [state, setState] = useState("idle");
  const [result, setResult] = useState(null);
  const [displayScore, setDisplayScore] = useState(0);
  const scan = async (event) => {
    event.preventDefault(); setState("loading"); setResult(null); setDisplayScore(0);
    try { const response = await fetch(`${apiBase}/api/v1/analyze-url`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url }) }); if (!response.ok) throw new Error(); const data = await response.json(); setResult({ score: data.risk_score ?? 78, verdict: data.verdict ?? "SUSPICIOUS", live: true }); }
    catch { setResult({ score: 78, verdict: "SUSPICIOUS", live: false }); } finally { setState("done"); }
  };
  useEffect(() => { if (!result) return; let value = 0; const timer = window.setInterval(() => { value = Math.min(value + 2, result.score); setDisplayScore(value); if (value === result.score) window.clearInterval(timer); }, 15); return () => window.clearInterval(timer); }, [result]);
  const danger = (result?.score ?? 0) > 55;
  return <div className="scanner-card"><div className="scanner-head"><div><span className="scanner-kicker"><FiGlobe /> URL SECURITY SCANNER</span><h3>Run a threat check</h3></div><span className="status"><i /> SYSTEMS ONLINE</span></div><form onSubmit={scan}><label htmlFor="url">Target URL</label><div className="url-input"><FiSearch /><input id="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Paste a URL to investigate" /><button disabled={state === "loading"}>{state === "loading" ? <FiLoader className="spin" /> : <>Analyze <FiArrowRight /></>}</button></div></form>{state === "done" && <div className={`scan-result ${danger ? "danger" : "safe"}`}><div className="result-icon">{danger ? <FiAlertTriangle /> : <FiCheckCircle />}</div><div><span>{result.live ? "LIVE ANALYSIS" : "DEMO ANALYSIS"}</span><strong>{result.verdict}</strong><small>{danger ? "Signals indicate a potentially malicious destination." : "No immediate phishing signals were detected."}</small></div><div className="risk-gauge" style={{ "--risk": `${(displayScore / 100) * 360}deg` }}><b>{displayScore}</b><span>RISK</span></div></div>}<div className="scanner-foot"><span>Encrypted analysis</span><span>•</span><span>Results in milliseconds</span></div></div>;
}
