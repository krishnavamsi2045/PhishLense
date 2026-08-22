import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiTerminal,
  FiX,
  FiCornerDownLeft,
  FiShield,
  FiCpu,
  FiCheckCircle,
  FiAlertTriangle,
} from "react-icons/fi";
import { analyzeUrl, getHistory, getStats } from "../services/api";

export default function Terminal({ isOpen, onClose, onScanTriggered }) {
  const [history, setHistory] = useState([
    {
      type: "system",
      content:
        "PhishLense Cyber Shell v2.4.0 (Interactive SOC Terminal)\nType 'help' for available diagnostic commands.",
    },
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const scrollBottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const handleCommand = async (e) => {
    e.preventDefault();
    const cmd = inputVal.trim();
    if (!cmd) return;

    setInputVal("");
    setHistory((prev) => [...prev, { type: "input", content: cmd }]);
    setIsExecuting(true);

    const parts = cmd.split(" ");
    const mainCmd = parts[0].toLowerCase();
    const arg = parts.slice(1).join(" ");

    try {
      if (mainCmd === "help") {
        setHistory((prev) => [
          ...prev,
          {
            type: "output",
            content: `AVAILABLE COMMANDS:
  scan <url>    - Run full heuristic, ML & VirusTotal analysis on a URL
  stats         - Fetch real-time classified database totals
  history       - List recent scan records from SQLite
  clear         - Clear terminal output
  help          - Display this command manual
  exit          - Close interactive cyber shell`,
          },
        ]);
      } else if (mainCmd === "clear") {
        setHistory([]);
      } else if (mainCmd === "exit" || mainCmd === "quit") {
        onClose();
      } else if (mainCmd === "stats") {
        const stats = await getStats();
        setHistory((prev) => [
          ...prev,
          {
            type: "output",
            content: `TELEMETRY TOTALS:
  Total Scans Logged : ${stats.total_scans || 0}
  Phishing Detected  : ${stats.phishing || 0}
  Suspicious Flagged : ${stats.suspicious || 0}
  Safe Verified      : ${stats.safe || 0}`,
          },
        ]);
      } else if (mainCmd === "history") {
        const logs = await getHistory();
        if (!logs || logs.length === 0) {
          setHistory((prev) => [
            ...prev,
            { type: "output", content: "No scan records currently found in SQLite database." },
          ]);
        } else {
          const list = logs
            .slice(0, 8)
            .map(
              (s) =>
                `  [#${s.id}] ${s.verdict.padEnd(10)} (Score: ${String(s.risk_score).padStart(3)}) - ${s.url}`
            )
            .join("\n");
          setHistory((prev) => [
            ...prev,
            {
              type: "output",
              content: `RECENT SCANS (Showing top ${Math.min(logs.length, 8)}):\n${list}`,
            },
          ]);
        }
      } else if (mainCmd === "scan") {
        if (!arg) {
          setHistory((prev) => [
            ...prev,
            {
              type: "error",
              content: "Error: URL parameter required. Usage: scan <https://example.com>",
            },
          ]);
        } else {
          setHistory((prev) => [
            ...prev,
            {
              type: "info",
              content: `[+] Transmitting packet for: ${arg}\n[+] Querying Heuristics, WHOIS, and VirusTotal engines...`,
            },
          ]);

          const res = await analyzeUrl(arg);
          setHistory((prev) => [
            ...prev,
            {
              type: "output",
              content: `ANALYSIS RESULT:
  Target URL     : ${res.url}
  Final Verdict  : ${res.final_verdict}
  Risk Score     : ${res.risk_score} / 100
  VirusTotal     : ${res.virus_total?.threat_level || "Active"} (${res.virus_total?.malicious || 0} malicious engines)
  Recommendation : ${res.recommendation || "Evaluated."}`,
            },
          ]);

          if (onScanTriggered) {
            onScanTriggered(res);
          }
        }
      } else {
        setHistory((prev) => [
          ...prev,
          {
            type: "error",
            content: `phishlense: command not found: '${mainCmd}'. Type 'help' for available commands.`,
          },
        ]);
      }
    } catch (err) {
      setHistory((prev) => [
        ...prev,
        {
          type: "error",
          content: `Execution error: ${err.message || "Failed to contact backend."}`,
        },
      ]);
    } finally {
      setIsExecuting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="modal-backdrop" onClick={onClose}>
        <motion.div
          className="cyber-terminal-shell"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 120, damping: 14 }}
        >
          {/* Terminal Window Bar */}
          <div className="terminal-header-bar">
            <div className="terminal-dots">
              <span className="dot dot-red" onClick={onClose} />
              <span className="dot dot-amber" />
              <span className="dot dot-green" />
            </div>
            <div className="terminal-title">
              <FiTerminal />
              <span>PHISHLENSE_SOC_SHELL • tty1</span>
            </div>
            <button className="terminal-close-btn" onClick={onClose}>
              <FiX />
            </button>
          </div>

          {/* Terminal Body */}
          <div className="terminal-content-area font-mono">
            {history.map((item, idx) => (
              <div key={idx} className={`term-line term-${item.type}`}>
                {item.type === "input" ? (
                  <div className="term-input-row">
                    <span className="term-prompt">phishlense@soc:~$</span>
                    <span className="term-cmd-text">{item.content}</span>
                  </div>
                ) : (
                  <pre className="term-output-text">{item.content}</pre>
                )}
              </div>
            ))}

            {isExecuting && (
              <div className="term-line term-executing">
                <span className="term-prompt">... executing query ...</span>
              </div>
            )}
            <div ref={scrollBottomRef} />
          </div>

          {/* Terminal Command Input */}
          <form onSubmit={handleCommand} className="terminal-input-form">
            <span className="term-prompt font-mono">phishlense@soc:~$</span>
            <input
              ref={inputRef}
              type="text"
              className="term-input-field font-mono"
              placeholder="type command (e.g. 'scan https://paypal.com', 'stats', 'history', 'help')..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              disabled={isExecuting}
            />
            <button type="submit" className="term-submit-btn" disabled={!inputVal.trim()}>
              <FiCornerDownLeft />
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
