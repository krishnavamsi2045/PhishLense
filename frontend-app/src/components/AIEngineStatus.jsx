import React, { Suspense } from "react";
import {
  FiCpu,
  FiActivity,
  FiShield,
  FiCheckCircle,
  FiServer,
  FiLock,
  FiGlobe,
  FiDatabase,
} from "react-icons/fi";
import NeuralBrainCore from "../scenes/NeuralBrainCore";

export default function AIEngineStatus({ activeThreat = "low" }) {
  const engineNodes = [
    {
      name: "Random Forest Classifier",
      type: "Supervised ML",
      status: "ACTIVE",
      detail: "200 Estimators • Multi-feature vector analysis",
      icon: FiCpu,
    },
    {
      name: "Heuristic Syntax Engine",
      type: "Algorithmic Rules",
      status: "ACTIVE",
      detail: "Punycode, TLD reputation, deep subdomains, keywords",
      icon: FiShield,
    },
    {
      name: "Threat Intelligence Feeds",
      type: "External Correlator",
      status: "SYNCED",
      detail: "OpenPhish Database & VirusTotal Engine Queries",
      icon: FiGlobe,
    },
    {
      name: "Infrastructure Inspector",
      type: "WHOIS & SSL",
      status: "ONLINE",
      detail: "Domain registration age & SSL certificate expiry",
      icon: FiLock,
    },
  ];

  return (
    <div className="ai-engine-shell">
      <div className="ai-engine-header">
        <div className="ai-title-wrap">
          <FiActivity className="spin-slow" />
          <div>
            <h3>PhishLense AI Neural Defense Core</h3>
            <p>Multi-layered detection architecture & feature extraction pipelines</p>
          </div>
        </div>
        <span className="neural-state-badge">
          <span className="pulse-dot" /> SYNAPSE ARMED
        </span>
      </div>

      <div className="ai-engine-content-grid">
        {/* Left: 3D Holographic Brain / Neural Centerpiece */}
        <div className="ai-3d-brain-box">
          <div className="brain-overlay-title">
            <FiCpu /> NEURAL NETWORK TOPOLOGY
          </div>
          <Suspense
            fallback={
              <div className="brain-fallback">
                <div className="spinner-cyber" />
                <span>LOADING NEURAL TOPOLOGY...</span>
              </div>
            }
          >
            <NeuralBrainCore height={260} threatLevel={activeThreat} />
          </Suspense>
          <div className="brain-overlay-footer">
            <span>Weights: Tuned</span>
            <span>Feature Dimension: 14D</span>
          </div>
        </div>

        {/* Right: Engine Nodes List */}
        <div className="ai-engine-nodes-list">
          {engineNodes.map((node, i) => {
            const Icon = node.icon;
            return (
              <div key={i} className="engine-node-card">
                <div className="node-icon-box">
                  <Icon />
                </div>
                <div className="node-info">
                  <div className="node-name-row">
                    <span className="node-name">{node.name}</span>
                    <span className="node-status-pill">{node.status}</span>
                  </div>
                  <span className="node-type">{node.type}</span>
                  <p className="node-detail">{node.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
