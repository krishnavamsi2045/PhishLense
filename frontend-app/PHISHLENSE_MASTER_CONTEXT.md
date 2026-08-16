# PhishLense

## Project Overview
PhishLense is an AI-powered phishing detection platform designed to analyze URLs and identify phishing threats using feature extraction, heuristic analysis, and threat intelligence.

---

## Tech Stack

### Frontend
- React
- Vite
- Three.js
- React Three Fiber
- Drei
- GSAP
- Framer Motion
- React Icons

### Backend
- FastAPI
- Python

---

## Backend Status

Completed:
- URL Feature Extraction
- Heuristic Engine
- Threat Intelligence Engine
- URL Analyzer
- FastAPI REST API

Endpoint:

POST /api/v1/analyze-url

Example Request:

{
  "url": "http://evil-example.test/login"
}

Example Response:

{
  "risk_score": 78,
  "verdict": "PHISHING"
}

---

## Frontend Status

Created:
- React + Vite Project
- HeroScene.jsx
- Shield3D.jsx
- ScannerCard.jsx
- App.jsx

Installed Packages:

npm install three
npm install @react-three/fiber
npm install @react-three/drei
npm install @react-three/postprocessing
npm install gsap
npm install framer-motion
npm install react-icons

---

## Current Structure

src/
├── scenes/
│   └── HeroScene.jsx
│
├── components/
│   ├── Shield3D.jsx
│   ├── ScannerCard.jsx
│   ├── CyberBackground.jsx
│
├── App.jsx
├── App.css
└── main.jsx

---

## Current App.jsx

import HeroScene from "./scenes/HeroScene";
import "./App.css";

function App() {
  return (
    <div className="app">
      <HeroScene />
    </div>
  );
}

export default App;

---

## Vision

Create a premium enterprise-grade cybersecurity SaaS website.

Inspired by:
- CrowdStrike
- Darktrace
- Palo Alto Networks
- SentinelOne
- Cloudflare

---

## Required Features

- Premium 3D Shield
- 2000+ Animated Particles
- Bloom Effects
- Cyber Grid Floor
- Mouse Parallax
- Floating Holograms
- GSAP Intro Animation
- Glassmorphism Scanner Card
- Threat Analysis Dashboard
- FastAPI Integration
- Responsive Design

---

## Goal

Build a world-class cybersecurity landing page and phishing detection platform with production-quality code.
