import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiCpu,
  FiGlobe,
  FiClock,
  FiLayers,
  FiCheckCircle,
  FiActivity,
  FiShield,
} from "react-icons/fi";

const inspectionStages = [
  {
    id: "heuristic",
    name: "Heuristic Syntax Engine",
    desc: "Extracting 14D RFC 3986 lexical signals, punycode & homoglyphs",
    icon: FiCpu,
    color: "#00E5FF",
  },
  {
    id: "virustotal",
    name: "VirusTotal Feed Correlator",
    desc: "Querying 70+ antivirus engines and malicious reputation lists",
    icon: FiGlobe,
    color: "#7C3AED",
  },
  {
    id: "whois",
    name: "WHOIS & Certificate Age Guard",
    desc: "Auditing domain registration age, issuer & SSL validity",
    icon: FiClock,
    color: "#00E676",
  },
  {
    id: "fusion",
    name: "Composite Verdict Fusion",
    desc: "Calibrating Random Forest weights and risk index",
    icon: FiLayers,
    color: "#FFB020",
  },
];

export default function ScanBeam({ isScanning, onComplete, targetUrl = "" }) {
  const [currentStageIdx, setCurrentStageIdx] = useState(0);

  useEffect(() => {
    if (!isScanning) {
      setCurrentStageIdx(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStageIdx((prev) => {
        if (prev < inspectionStages.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 450);

    return () => clearInterval(interval);
  }, [isScanning]);

  if (!isScanning) return null;

  return (
    <div className="scan-beam-container">
      {/* Target Packet Traveling */}
      <div className="packet-header">
        <div className="packet-target">
          <FiShield className="packet-shield-icon" />
          <span className="packet-label font-mono">
            INSPECTING: <strong>{targetUrl || "Target Destination"}</strong>
          </span>
        </div>
        <span className="packet-step-badge">
          STAGE {currentStageIdx + 1} OF 4
        </span>
      </div>

      {/* 4 Inspection Rings Pipeline */}
      <div className="inspection-rings-grid">
        {inspectionStages.map((stage, idx) => {
          const Icon = stage.icon;
          const isPassed = idx < currentStageIdx;
          const isCurrent = idx === currentStageIdx;
          const isPending = idx > currentStageIdx;

          return (
            <motion.div
              key={stage.id}
              className={`inspection-stage-card ${
                isCurrent ? "current" : isPassed ? "passed" : "pending"
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 14 }}
            >
              <div className="stage-top-row">
                <div
                  className="stage-ring-indicator"
                  style={{
                    borderColor: isCurrent || isPassed ? stage.color : "rgba(255,255,255,0.1)",
                    boxShadow: isCurrent ? `0 0 16px ${stage.color}` : "none",
                  }}
                >
                  {isPassed ? (
                    <FiCheckCircle style={{ color: "#00E676" }} />
                  ) : (
                    <Icon style={{ color: isCurrent ? stage.color : "#7E9BB6" }} />
                  )}
                </div>
                <span className="stage-number">RING 0{idx + 1}</span>
              </div>

              <strong className="stage-title">{stage.name}</strong>
              <p className="stage-desc">{stage.desc}</p>

              {isCurrent && (
                <div className="stage-scanner-bar">
                  <motion.div
                    className="stage-scanner-fill"
                    style={{ backgroundColor: stage.color }}
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.45 }}
                  />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
