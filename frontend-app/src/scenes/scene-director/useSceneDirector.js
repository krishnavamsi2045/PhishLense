import { create } from "zustand";

const VIEW_DIRECTIVES = {
  dashboard: {
    cameraPos: [0, 0, 6.0],
    cameraTarget: [0, 0, 0],
    lightMood: "neutral", // cyan/purple
    lightIntensity: 1.2,
    latticeActive: true,
    gridDensity: 1.0,
    coreFocus: true,
    tunnelOpen: false,
  },
  scan: {
    cameraPos: [0, -0.15, 4.8],
    cameraTarget: [0, 0, 0],
    lightMood: "focused", // spotlight
    lightIntensity: 1.5,
    latticeActive: false,
    gridDensity: 1.2,
    coreFocus: true,
    tunnelOpen: true,
  },
  "threat-intel": {
    cameraPos: [0, 0.4, 7.6],
    cameraTarget: [0, 0, 0],
    lightMood: "expansive",
    lightIntensity: 1.3,
    latticeActive: true,
    gridDensity: 1.4,
    coreFocus: true,
    tunnelOpen: false,
  },
  "live-feed": {
    cameraPos: [-0.6, 0, 6.0],
    cameraTarget: [0.2, 0, 0],
    lightMood: "stream",
    lightIntensity: 1.0,
    latticeActive: true,
    gridDensity: 1.0,
    coreFocus: false,
    tunnelOpen: false,
  },
  reports: {
    cameraPos: [0.6, 0, 6.0],
    cameraTarget: [-0.2, 0, 0],
    lightMood: "analytics",
    lightIntensity: 1.1,
    latticeActive: false,
    gridDensity: 0.9,
    coreFocus: false,
    tunnelOpen: false,
  },
  "domain-analysis": {
    cameraPos: [0, 0, 4.2],
    cameraTarget: [0, 0, 0],
    lightMood: "inspect",
    lightIntensity: 1.4,
    latticeActive: false,
    gridDensity: 1.1,
    coreFocus: true,
    tunnelOpen: false,
  },
  settings: {
    cameraPos: [0, -0.4, 6.6],
    cameraTarget: [0, 0, 0],
    lightMood: "dimmed",
    lightIntensity: 0.8,
    latticeActive: false,
    gridDensity: 0.7,
    coreFocus: false,
    tunnelOpen: false,
  },
  "api-keys": {
    cameraPos: [0, 0, 6.2],
    cameraTarget: [0, 0, 0],
    lightMood: "terminal",
    lightIntensity: 1.0,
    latticeActive: false,
    gridDensity: 0.8,
    coreFocus: false,
    tunnelOpen: false,
  },
  documentation: {
    cameraPos: [0, 0, 6.4],
    cameraTarget: [0, 0, 0],
    lightMood: "neutral",
    lightIntensity: 1.0,
    latticeActive: false,
    gridDensity: 0.8,
    coreFocus: false,
    tunnelOpen: false,
  },
};

export const useSceneDirector = create((set, get) => ({
  activeView: "dashboard",
  currentDirective: VIEW_DIRECTIVES.dashboard,
  lastVerdict: "SAFE",
  avgRisk: 12,
  isScanning: false,

  setDirectiveForView: (viewName) => {
    const directive = VIEW_DIRECTIVES[viewName] || VIEW_DIRECTIVES.dashboard;
    set({
      activeView: viewName,
      currentDirective: directive,
    });
  },

  setLastVerdict: (verdict, riskScore) => {
    set({
      lastVerdict: verdict,
      avgRisk: riskScore,
    });
  },

  setIsScanning: (scanning) => {
    set({ isScanning: scanning });
  },
}));
