import React from "react";
import {
  FiRss,
  FiCheckCircle,
  FiGlobe,
  FiShield,
  FiZap,
  FiExternalLink,
  FiRefreshCw,
} from "react-icons/fi";

const threatFeeds = [
  {
    name: "VirusTotal Enterprise v3",
    type: "Multi-Engine Antivirus Aggregator",
    status: "OPERATIONAL",
    iocs_synced: 1420,
    engines: "70+ AV Engines",
    latency: "180ms",
    endpoint: "https://www.virustotal.com/api/v3",
  },
  {
    name: "OpenPhish Global Feed",
    type: "Zero-Hour Phishing IoC Stream",
    status: "OPERATIONAL",
    iocs_synced: 890,
    engines: "Continuous Autonomous Crawler",
    latency: "45ms",
    endpoint: "https://openphish.com/feed.txt",
  },
  {
    name: "Google Safe Browsing v4",
    type: "Reputation Intelligence Lookup",
    status: "CONNECTED",
    iocs_synced: 3200,
    engines: "Chromium Safe Browsing API",
    latency: "110ms",
    endpoint: "https://safebrowsing.googleapis.com/v4",
  },
  {
    name: "URLHaus Malware Database",
    type: "Malicious Distribution Nodes",
    status: "OPERATIONAL",
    iocs_synced: 640,
    engines: "Abuse.ch Community Telemetry",
    latency: "60ms",
    endpoint: "https://urlhaus-api.abuse.ch/v1",
  },
  {
    name: "PhishTank Threat Exchange",
    type: "Crowd-Sourced Phishing Registry",
    status: "SYNCED",
    iocs_synced: 1100,
    engines: "OpenDNS / Cisco Talos",
    latency: "85ms",
    endpoint: "https://data.phishtank.com/data/online-valid.json",
  },
  {
    name: "ICANN / RDAP WHOIS Registry",
    type: "Domain Age & Registrar Verification",
    status: "HEALTHY",
    iocs_synced: 15400,
    engines: "IANA RDAP Tier-1 Roots",
    latency: "95ms",
    endpoint: "https://rdap.org",
  },
];

export default function ThreatFeedMonitor() {
  return (
    <div className="admin-view-root">
      {/* Header */}
      <div className="view-header-bar">
        <div>
          <div className="view-badge admin">
            <FiRss />
            <span>GLOBAL THREAT INTELLIGENCE SYNDICATION</span>
          </div>
          <h1 className="view-title">Threat Feed & IoC Syndication Monitor</h1>
          <p className="view-subtitle">
            Real-time synchronization status with tier-1 cybersecurity intelligence providers.
          </p>
        </div>
      </div>

      {/* Grid of Feed Cards */}
      <div className="threat-feed-grid mt-6">
        {threatFeeds.map((feed, i) => (
          <div key={i} className="glass-panel feed-card">
            <div className="feed-header">
              <div className="feed-title-wrap">
                <FiGlobe className="panel-icon cyan" />
                <div>
                  <h3>{feed.name}</h3>
                  <small>{feed.type}</small>
                </div>
              </div>
              <span className="status-pill active">
                <FiCheckCircle /> {feed.status}
              </span>
            </div>

            <div className="feed-stats-grid">
              <div className="stat-item">
                <span>IOCs SYNCED</span>
                <strong>{feed.iocs_synced.toLocaleString()}</strong>
              </div>
              <div className="stat-item">
                <span>FEED LATENCY</span>
                <code>{feed.latency}</code>
              </div>
            </div>

            <div className="feed-footer">
              <span className="feed-engine">{feed.engines}</span>
              <a
                href={feed.endpoint}
                target="_blank"
                rel="noreferrer"
                className="feed-link"
              >
                Endpoint <FiExternalLink />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
