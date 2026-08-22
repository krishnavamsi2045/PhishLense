import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/**
 * Health check endpoint
 */
export const checkHealth = async () => {
  try {
    const res = await apiClient.get("/health");
    return { online: true, data: res.data };
  } catch (err) {
    try {
      const rootRes = await apiClient.get("/");
      return { online: true, data: rootRes.data };
    } catch (rootErr) {
      return { online: false, error: rootErr.message };
    }
  }
};

/**
 * Analyze a single URL with real-time heuristic, ML, WHOIS, SSL, and Threat Intel
 */
export const analyzeUrl = async (url) => {
  const cleanUrl = url.trim();
  const res = await apiClient.post("/analyze", { url: cleanUrl });
  return res.data;
};

/**
 * Fetch scan history list
 */
export const getHistory = async () => {
  const res = await apiClient.get("/history");
  return res.data;
};

/**
 * Clear all scan history
 */
export const clearHistory = async () => {
  const res = await apiClient.delete("/history");
  return res.data;
};

/**
 * Get details for a specific scan by ID
 */
export const getScan = async (scanId) => {
  const res = await apiClient.get(`/scan/${scanId}`);
  return res.data;
};

/**
 * Get aggregate statistics
 */
export const getStats = async () => {
  const res = await apiClient.get("/stats");
  return res.data;
};

/**
 * Get analytics breakdown for charts
 */
export const getAnalytics = async () => {
  const res = await apiClient.get("/analytics");
  return res.data;
};

/**
 * Get dashboard consolidated data
 */
export const getDashboard = async () => {
  const res = await apiClient.get("/dashboard");
  return res.data;
};

export default apiClient;
