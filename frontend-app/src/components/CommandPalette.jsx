import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSearch,
  FiActivity,
  FiShield,
  FiGlobe,
  FiFileText,
  FiCpu,
  FiSliders,
  FiKey,
  FiBookOpen,
  FiTrash2,
  FiArrowRight,
  FiX,
  FiRadio,
} from "react-icons/fi";

const actions = [
  { id: "dashboard", label: "Open SOC Dashboard", category: "Navigation", icon: FiActivity, view: "dashboard" },
  { id: "scan", label: "Launch AI URL Scanner", category: "Actions", icon: FiShield, view: "scan" },
  { id: "threat-intel", label: "Threat Intelligence Workspace", category: "Navigation", icon: FiGlobe, view: "threat-intel" },
  { id: "live-feed", label: "Live Detection History Feed", category: "Navigation", icon: FiRadio, view: "live-feed" },
  { id: "reports", label: "Analytics & Export Reports", category: "Navigation", icon: FiFileText, view: "reports" },
  { id: "domain-analysis", label: "Domain Infrastructure Analysis", category: "Navigation", icon: FiCpu, view: "domain-analysis" },
  { id: "settings", label: "Security & Interface Settings", category: "Settings", icon: FiSliders, view: "settings" },
  { id: "api-keys", label: "API Keys & Integrations", category: "Developer", icon: FiKey, view: "api-keys" },
  { id: "documentation", label: "API Documentation & Endpoints", category: "Developer", icon: FiBookOpen, view: "documentation" },
];

export default function CommandPalette({
  isOpen,
  onClose,
  onSelectView,
  onQuickScan,
}) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const filteredActions = actions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase()) ||
    a.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredActions.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredActions.length) % Math.max(1, filteredActions.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredActions[selectedIndex]) {
        handleSelect(filteredActions[selectedIndex]);
      } else if (query.trim().startsWith("http://") || query.trim().startsWith("https://") || query.trim().includes(".")) {
        onQuickScan(query.trim());
        onClose();
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  const handleSelect = (action) => {
    if (action.view) {
      onSelectView(action.view);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="cmd-palette-backdrop" onClick={onClose}>
        <motion.div
          className="cmd-palette-modal"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {/* Search Header */}
          <div className="cmd-palette-header">
            <FiSearch className="cmd-search-icon" />
            <input
              ref={inputRef}
              type="text"
              className="cmd-input"
              placeholder="Type a command or paste a URL to scan..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
            />
            <button className="cmd-close-btn" onClick={onClose}>
              <FiX />
            </button>
          </div>

          {/* Quick URL scan prompt if user enters URL */}
          {query.trim().length > 3 && (query.includes(".") || query.startsWith("http")) && (
            <div
              className="cmd-quick-scan-hint"
              onClick={() => {
                onQuickScan(query.trim());
                onClose();
              }}
            >
              <FiShield style={{ color: "var(--phish-cyan)" }} />
              <span>
                Scan URL directly: <strong>{query.trim()}</strong>
              </span>
              <FiArrowRight />
            </div>
          )}

          {/* Results List */}
          <div className="cmd-results-list">
            {filteredActions.length === 0 && !query.includes(".") ? (
              <div className="cmd-empty">No commands match &quot;{query}&quot;</div>
            ) : (
              filteredActions.map((action, idx) => {
                const Icon = action.icon;
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={action.id}
                    className={`cmd-item ${isSelected ? "selected" : ""}`}
                    onClick={() => handleSelect(action)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <div className="cmd-item-left">
                      <span className="cmd-item-icon">
                        <Icon />
                      </span>
                      <span className="cmd-item-label">{action.label}</span>
                    </div>
                    <span className="cmd-item-cat">{action.category}</span>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Shortcuts */}
          <div className="cmd-palette-footer">
            <span>
              <kbd>↑</kbd> <kbd>↓</kbd> to navigate
            </span>
            <span>
              <kbd>↵</kbd> to select
            </span>
            <span>
              <kbd>esc</kbd> to close
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
