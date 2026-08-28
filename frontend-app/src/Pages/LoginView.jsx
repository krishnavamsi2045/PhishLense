import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiShield,
  FiLock,
  FiMail,
  FiArrowRight,
  FiAlertTriangle,
} from "react-icons/fi";
import { loginApi } from "../services/api";

export default function LoginView({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("Phishlense@analyst.com");
  const [password, setPassword] = useState("Phish@Lense");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const data = await loginApi(email.trim(), password);
      localStorage.setItem("phishlense_token", data.access_token);
      localStorage.setItem("phishlense_user", JSON.stringify(data.user));

      if (onLoginSuccess) {
        onLoginSuccess(data.user);
      }

      navigate("/app");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Authentication failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-fullscreen-container">
      <motion.div
        className="auth-clean-card glass-panel"
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Brand Header */}
        <div className="auth-card-header">
          <div className="auth-brand-badge">
            <FiShield />
          </div>
          <h1 className="auth-main-title">PhishLense</h1>
          <p className="auth-sub-title">AI Cybersecurity & Phishing Threat Intelligence</p>
        </div>

        {error && (
          <motion.div
            className="auth-error-banner"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <FiAlertTriangle />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Unified Login Form */}
        <form onSubmit={handleSubmit} className="auth-form-clean">
          <div className="auth-field-group">
            <label>Account Email</label>
            <div className="auth-input-box">
              <FiMail className="field-icon" />
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="Phishlense@analyst.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="auth-field-group">
            <div className="field-label-row">
              <label>Password</label>
              <span
                className="forgot-pass-link"
                onClick={() => alert("Please use the default credentials or contact your administrator.")}
              >
                Forgot?
              </span>
            </div>
            <div className="auth-input-box">
              <FiLock className="field-icon" />
              <input
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="auth-options-row">
            <label className="checkbox-wrap">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember session</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-btn-primary glow-button"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <FiArrowRight />
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="auth-card-footer">
          <p className="register-prompt">
            Don't have an account?{" "}
            <Link to="/register" className="auth-action-link">
              Create Account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
