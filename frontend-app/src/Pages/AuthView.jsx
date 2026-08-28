import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FiShield,
  FiLock,
  FiMail,
  FiUser,
  FiArrowRight,
  FiCheckCircle,
  FiAlertTriangle,
  FiKey,
  FiCpu,
  FiZap,
} from "react-icons/fi";
import { loginApi, registerApi } from "../services/api";

export default function AuthView({ onAuthSuccess, onClose }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [organization, setOrganization] = useState("Enterprise SOC");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let data;
      if (isRegister) {
        data = await registerApi(fullName, email, password, organization);
      } else {
        data = await loginApi(email, password);
      }

      localStorage.setItem("phishlense_token", data.access_token);
      localStorage.setItem("phishlense_user", JSON.stringify(data.user));
      onAuthSuccess(data.user);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Authentication failed. Please check credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError("");
    setLoading(true);
    try {
      const data = await loginApi(demoEmail, demoPassword);
      localStorage.setItem("phishlense_token", data.access_token);
      localStorage.setItem("phishlense_user", JSON.stringify(data.user));
      onAuthSuccess(data.user);
    } catch (err) {
      setError("Quick login failed: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay-backdrop">
      <motion.div
        className="auth-modal-card glass-panel"
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ duration: 0.25 }}
      >
        {/* Brand Header */}
        <div className="auth-header">
          <div className="auth-logo-badge">
            <FiShield className="icon-shield" />
          </div>
          <h2 className="auth-title">
            PhishLense <span className="text-crimson">Enterprise</span>
          </h2>
          <p className="auth-subtitle">
            {isRegister
              ? "Register a new SOC analyst or administrator account"
              : "Zero-Trust SOC Command & Threat Intelligence Gateway"}
          </p>
        </div>

        {error && (
          <motion.div
            className="auth-error-banner"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <FiAlertTriangle />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {isRegister && (
            <>
              <div className="auth-input-group">
                <label>Full Name</label>
                <div className="auth-input-wrapper">
                  <FiUser className="input-icon" />
                  <input
                    type="text"
                    required
                    placeholder="e.g., Sarah Chen"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label>Organization / Department</label>
                <div className="auth-input-wrapper">
                  <FiShield className="input-icon" />
                  <input
                    type="text"
                    placeholder="e.g., Global Incident Response"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          <div className="auth-input-group">
            <label>Work Email</label>
            <div className="auth-input-wrapper">
              <FiMail className="input-icon" />
              <input
                type="email"
                required
                placeholder="analyst@phishlense.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="auth-input-group">
            <label>Security Key / Password</label>
            <div className="auth-input-wrapper">
              <FiLock className="input-icon" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-submit-btn glow-button"
          >
            {loading ? (
              <span>Authenticating Gateway...</span>
            ) : (
              <>
                <span>{isRegister ? "Create Account" : "Authenticate Session"}</span>
                <FiArrowRight />
              </>
            )}
          </button>
        </form>

        {/* Demo 1-Click Fast Logins */}
        <div className="auth-quick-access">
          <div className="quick-access-label">
            <span>⚡ DEMO 1-CLICK QUICK ACCESS</span>
          </div>
          <div className="quick-access-buttons">
            <button
              type="button"
              className="quick-btn admin"
              onClick={() => handleQuickLogin("admin@phishlense.io", "Admin@12345")}
            >
              <FiKey />
              <div>
                <strong>SOC Commander (Admin)</strong>
                <small>Full Portal + Globe + ML Center</small>
              </div>
            </button>

            <button
              type="button"
              className="quick-btn analyst"
              onClick={() => handleQuickLogin("analyst@phishlense.io", "Analyst@12345")}
            >
              <FiCpu />
              <div>
                <strong>Threat Analyst (User)</strong>
                <small>SOC Scanner + Reports + Intel</small>
              </div>
            </button>
          </div>
        </div>

        {/* Switch mode */}
        <div className="auth-footer">
          <button
            type="button"
            className="auth-toggle-link"
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
            }}
          >
            {isRegister
              ? "Already have credentials? Sign In"
              : "Need a new account? Register"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
