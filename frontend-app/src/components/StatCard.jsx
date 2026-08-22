import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function StatCard({
  icon: Icon,
  label,
  value = 0,
  variant = "cyan",
  subtitle = "Telemetry Data",
  trend,
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const target = Number(value) || 0;
    if (target === 0) {
      setDisplayValue(0);
      return;
    }

    let start = 0;
    const duration = 1000;
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = target / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setDisplayValue(target);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.div
      className={`stat-card-shell variant-${variant}`}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <div className="stat-card-glow" />
      
      <div className="stat-header">
        <span className="stat-label">{label}</span>
        <div className={`stat-icon-badge variant-${variant}`}>
          <Icon />
        </div>
      </div>

      <div className="stat-body">
        <div className="stat-value-row">
          <span className="stat-number">{displayValue.toLocaleString()}</span>
          {trend && (
            <span className={`stat-trend ${trend.positive ? "up" : "down"}`}>
              {trend.text}
            </span>
          )}
        </div>
        <span className="stat-subtitle">{subtitle}</span>
      </div>

      <div className="stat-bottom-line" />
    </motion.div>
  );
}
