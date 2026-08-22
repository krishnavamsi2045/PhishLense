import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiShield, FiCpu, FiGlobe, FiCheck } from "react-icons/fi";

export default function BootSequence({ onComplete }) {
  const [step, setStep] = useState(0);

  const steps = [
    { text: "INITIALIZING PHISHLENSE SECURITY CORE...", icon: FiShield },
    { text: "Loading threat intelligence & heuristic engines...", icon: FiGlobe },
    { text: "Connecting to FastAPI backend telemetry (8000)...", icon: FiCpu },
    { text: "Arming 3D spatial defense shield & neural layer...", icon: FiCheck },
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => setStep(1), 350);
    const timer2 = setTimeout(() => setStep(2), 700);
    const timer3 = setTimeout(() => setStep(3), 1050);
    const timer4 = setTimeout(() => onComplete(), 1400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  return (
    <motion.div
      className="boot-sequence-overlay"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="boot-box">
        <div className="boot-logo">
          <div className="boot-shield-pulse">
            <FiShield />
          </div>
          <h1>PHISHLENSE</h1>
          <span className="boot-sub">AI SECURITY COMMAND • INITIALIZATION</span>
        </div>

        <div className="boot-progress-bar">
          <div
            className="boot-progress-fill"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>

        <div className="boot-log-list">
          {steps.slice(0, step + 1).map((s, idx) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={idx}
                className="boot-log-item"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Icon className="boot-log-icon" />
                <span>{s.text}</span>
              </motion.div>
            );
          })}
        </div>

        <button className="boot-skip-btn" onClick={onComplete}>
          Skip Sequence &rarr;
        </button>
      </div>
    </motion.div>
  );
}
