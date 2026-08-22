import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiKey,
  FiCopy,
  FiCheck,
  FiCode,
  FiTerminal,
  FiLock,
  FiServer,
  FiPlus,
  FiTrash2,
  FiRefreshCw,
  FiShield,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import { API_BASE_URL } from "../services/api";

const generateRandomKey = (prefix = "phish_live_") => {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let key = prefix;
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
};

export default function ApiKeysView() {
  const [keys, setKeys] = useState(() => {
    const saved = localStorage.getItem("phish_api_keys");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback default
      }
    }
    return [
      {
        id: "key-1",
        name: "Primary Production Key",
        key: "phish_live_8f93e0b2a7d14c99a38f6b025e1178c4",
        created: "2026-08-20",
        lastUsed: "Active",
        status: "ACTIVE",
      },
    ];
  });

  const [vtKey, setVtKey] = useState(() => {
    return localStorage.getItem("phish_vt_api_key") || "";
  });
  const [vtSaved, setVtSaved] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [copiedPy, setCopiedPy] = useState(false);

  useEffect(() => {
    localStorage.setItem("phish_api_keys", JSON.stringify(keys));
  }, [keys]);

  const handleCreateKey = (e) => {
    e.preventDefault();
    const newKey = {
      id: `key-${Date.now()}`,
      name: keyName.trim() || `API Key ${keys.length + 1}`,
      key: generateRandomKey("phish_live_"),
      created: new Date().toISOString().slice(0, 10),
      lastUsed: "Just now",
      status: "ACTIVE",
    };
    setKeys([newKey, ...keys]);
    setKeyName("");
    setShowCreateModal(false);
  };

  const handleDeleteKey = (id) => {
    setKeys(keys.filter((k) => k.id !== id));
  };

  const handleCopyKey = (keyString, id) => {
    navigator.clipboard.writeText(keyString);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveVtKey = () => {
    localStorage.setItem("phish_vt_api_key", vtKey.trim());
    setVtSaved(true);
    setTimeout(() => setVtSaved(false), 2000);
  };

  const activeKeyStr = keys[0]?.key || "phish_live_your_api_key_here";

  const curlSnippet = `curl -X POST "${API_BASE_URL}/analyze" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${activeKeyStr}" \\
  -d '{"url": "https://paypal-security-login.com"}'`;

  const pythonSnippet = `import requests

API_URL = "${API_BASE_URL}/analyze"
headers = {
    "Content-Type": "application/json",
    "X-API-Key": "${activeKeyStr}"
}
payload = {"url": "https://paypal-security-login.com"}

response = requests.post(API_URL, headers=headers, json=payload)
data = response.json()

print("Verdict:", data.get("final_verdict"))
print("Risk Score:", data.get("risk_score"))`;

  const copyCode = (snippet, type) => {
    navigator.clipboard.writeText(snippet);
    if (type === "curl") {
      setCopiedCurl(true);
      setTimeout(() => setCopiedCurl(false), 2000);
    } else {
      setCopiedPy(true);
      setTimeout(() => setCopiedPy(false), 2000);
    }
  };

  return (
    <motion.div
      className="api-keys-workspace"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="workspace-header">
        <div className="workspace-title-group">
          <div className="header-icon-wrap">
            <FiKey />
          </div>
          <div>
            <h2>API Key Management & External Feeds</h2>
            <p>Generate, rotate, and manage programmatic API credentials and external threat intelligence keys.</p>
          </div>
        </div>

        <button
          className="submit-scan-btn"
          style={{ padding: "10px 18px", fontSize: "12px" }}
          onClick={() => setShowCreateModal(true)}
        >
          <FiPlus /> Create New API Key
        </button>
      </div>

      {/* API Keys Table */}
      <div className="table-card-shell">
        <div className="table-header-row">
          <div className="table-title-group">
            <FiShield className="table-title-icon" />
            <div>
              <h3>Active PhishLense API Keys</h3>
              <p className="table-subtitle">Use these keys in your HTTP headers (<code>X-API-Key</code> or <code>Authorization: Bearer</code>)</p>
            </div>
          </div>
          <span className="sample-count-badge">{keys.length} Active Credentials</span>
        </div>

        <div className="table-responsive-container">
          <table className="cyber-table">
            <thead>
              <tr>
                <th>KEY NAME / IDENTIFIER</th>
                <th>SECRET TOKEN (API KEY)</th>
                <th>CREATED</th>
                <th>STATUS</th>
                <th style={{ textAlign: "right" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => (
                <tr key={k.id} className="table-row-hover">
                  <td>
                    <strong style={{ color: "#ffffff", fontSize: "13px" }}>{k.name}</strong>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <code className="api-url-badge font-mono" style={{ fontSize: "11px" }}>
                        {k.key.slice(0, 14)}••••••••••••••••{k.key.slice(-4)}
                      </code>
                    </div>
                  </td>
                  <td className="cell-time">{k.created}</td>
                  <td>
                    <span className="verdict-badge safe">
                      <FiCheckCircle className="badge-icon" /> {k.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "8px" }}>
                      <button
                        className="inspect-action-btn"
                        onClick={() => handleCopyKey(k.key, k.id)}
                        title="Copy full key token"
                      >
                        {copiedId === k.id ? <FiCheck color="#00e5ff" /> : <FiCopy />}
                        {copiedId === k.id ? "Copied" : "Copy Token"}
                      </button>
                      <button
                        className="clear-history-btn"
                        style={{ padding: "5px 8px" }}
                        onClick={() => handleDeleteKey(k.id)}
                        title="Revoke and delete key"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* External Intelligence API Key Integration (VirusTotal) */}
      <div className="settings-card">
        <div className="settings-card-header">
          <FiServer className="card-icon" />
          <div>
            <h3>External Threat Intelligence Key (VirusTotal)</h3>
            <p>Configure your VirusTotal API key to enrich live URL scans with 70+ antivirus engine queries.</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "280px" }}>
            <input
              type="password"
              placeholder="Paste VirusTotal API key (e.g. 64-character hex key)"
              value={vtKey}
              onChange={(e) => setVtKey(e.target.value)}
              className="url-text-field"
              style={{
                width: "100%",
                background: "rgba(2, 6, 16, 0.8)",
                border: "1px solid var(--phish-border)",
                borderRadius: "8px",
                padding: "10px 14px",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
              }}
            />
          </div>
          <button
            className="save-settings-btn"
            onClick={handleSaveVtKey}
          >
            {vtSaved ? <FiCheck /> : <FiLock />}
            <span>{vtSaved ? "VirusTotal Key Saved" : "Save VT Key"}</span>
          </button>
        </div>
        <small style={{ display: "block", marginTop: "8px", color: "var(--phish-text-dim)", fontSize: "11px" }}>
          Tip: You can also set this in your root <code>.env</code> file as <code>VT_API_KEY=your_key_here</code>.
        </small>
      </div>

      {/* Code Snippets with Live Generated Key */}
      <div className="code-snippets-grid">
        {/* cURL Example */}
        <div className="code-snippet-card">
          <div className="snippet-header">
            <div className="snippet-title">
              <FiTerminal />
              <span>cURL Request with Active Token</span>
            </div>
            <button
              className="copy-snippet-btn"
              onClick={() => copyCode(curlSnippet, "curl")}
            >
              {copiedCurl ? <FiCheck /> : <FiCopy />}
              <span>{copiedCurl ? "Copied" : "Copy"}</span>
            </button>
          </div>
          <pre className="code-block font-mono">
            <code>{curlSnippet}</code>
          </pre>
        </div>

        {/* Python Example */}
        <div className="code-snippet-card">
          <div className="snippet-header">
            <div className="snippet-title">
              <FiCode />
              <span>Python SDK Integration</span>
            </div>
            <button
              className="copy-snippet-btn"
              onClick={() => copyCode(pythonSnippet, "py")}
            >
              {copiedPy ? <FiCheck /> : <FiCopy />}
              <span>{copiedPy ? "Copied" : "Copy"}</span>
            </button>
          </div>
          <pre className="code-block font-mono">
            <code>{pythonSnippet}</code>
          </pre>
        </div>
      </div>

      {/* Create Key Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
            <motion.div
              className="scan-modal-shell"
              style={{ maxWidth: "480px" }}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="modal-header">
                <div className="modal-title-wrap">
                  <div className="modal-badge safe">
                    <FiKey />
                    <span>CREATE API CREDENTIAL</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleCreateKey}>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "11px", color: "var(--phish-cyan)", marginBottom: "6px", fontWeight: 700 }}>
                    KEY IDENTIFIER / APPLICATION NAME
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SIEM Ingestion Gateway, Mail Filter Bot"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    style={{
                      width: "100%",
                      background: "rgba(2, 6, 16, 0.8)",
                      border: "1px solid var(--phish-border)",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      color: "white",
                      fontSize: "13px",
                      outline: "none",
                    }}
                    autoFocus
                  />
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="modal-done-btn"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="modal-rescan-btn"
                  >
                    <FiKey /> Generate Token
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
