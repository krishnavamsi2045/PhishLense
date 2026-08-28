import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" &&
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1"
    ? "https://phishlense.onrender.com"
    : "http://127.0.0.1:8000");

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Automatic JWT Bearer token injection
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("phishlense_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ----------------------------------------------------
// Health & Telemetry
// ----------------------------------------------------
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

// ----------------------------------------------------
// Authentication API
// ----------------------------------------------------
export const loginApi = async (email, password) => {
  const res = await apiClient.post("/auth/login", { email, password });
  return res.data;
};

export const adminLoginApi = async (email, password) => {
  const res = await apiClient.post("/auth/admin/login", { email, password });
  return res.data;
};

export const registerApi = async (fullName, email, password, organization = "Enterprise SOC") => {
  const res = await apiClient.post("/auth/register", {
    full_name: fullName,
    email,
    password,
    organization,
  });
  return res.data;
};

export const getMeApi = async () => {
  const res = await apiClient.get("/auth/me");
  return res.data;
};

export const logoutApi = async () => {
  try {
    await apiClient.post("/auth/logout");
  } catch (e) {
    // Ignore error
  }
  localStorage.removeItem("phishlense_token");
  localStorage.removeItem("phishlense_user");
};

export const changePasswordApi = async (oldPassword, newPassword) => {
  const res = await apiClient.post("/auth/change-password", {
    old_password: oldPassword,
    new_password: newPassword,
  });
  return res.data;
};

// ----------------------------------------------------
// Core Threat Scanning & History
// ----------------------------------------------------
export const analyzeUrl = async (url) => {
  const cleanUrl = url.trim();
  const res = await apiClient.post("/analyze", { url: cleanUrl });
  return res.data;
};

export const bulkAnalyzeUrls = async (urls) => {
  const res = await apiClient.post("/analyze/bulk", { urls });
  return res.data;
};

export const getHistory = async (limit = 100, verdict = null) => {
  const params = { limit };
  if (verdict) params.verdict = verdict;
  const res = await apiClient.get("/history", { params });
  return res.data;
};

export const clearHistory = async () => {
  const res = await apiClient.delete("/history");
  return res.data;
};

export const getScan = async (scanId) => {
  const res = await apiClient.get(`/scan/${scanId}`);
  return res.data;
};

export const getStats = async () => {
  const res = await apiClient.get("/stats");
  return res.data;
};

export const getAnalytics = async () => {
  const res = await apiClient.get("/analytics");
  return res.data;
};

export const getDashboard = async () => {
  const [stats, analytics] = await Promise.all([getStats(), getAnalytics()]);
  return { stats, analytics };
};

// ----------------------------------------------------
// Admin Operations API
// ----------------------------------------------------
export const getAdminOverview = async () => {
  const res = await apiClient.get("/admin/overview");
  return res.data;
};

export const getAdminUsers = async () => {
  const res = await apiClient.get("/auth/users");
  return res.data;
};

export const updateAdminUser = async (userId, updates) => {
  const res = await apiClient.patch(`/auth/users/${userId}`, updates);
  return res.data;
};

export const deleteAdminUser = async (userId) => {
  const res = await apiClient.delete(`/auth/users/${userId}`);
  return res.data;
};

export const getAdminAuditLogs = async (limit = 50) => {
  const res = await apiClient.get("/admin/audit-logs", { params: { limit } });
  return res.data;
};

export const getAdminSystemHealth = async () => {
  const res = await apiClient.get("/admin/system-health");
  return res.data;
};

export const getAdminMlMetrics = async () => {
  const res = await apiClient.get("/admin/ml-metrics");
  return res.data;
};

export const retrainModelApi = async () => {
  const res = await apiClient.post("/admin/retrain");
  return res.data;
};

export const getAdminThreatMap = async () => {
  const res = await apiClient.get("/admin/threat-map");
  return res.data;
};

// ----------------------------------------------------
// API Keys & Developer Tools
// ----------------------------------------------------
export const getApiKeys = async () => {
  const res = await apiClient.get("/api-keys");
  return res.data;
};

export const createApiKey = async (name) => {
  const res = await apiClient.post("/api-keys", { name });
  return res.data;
};
