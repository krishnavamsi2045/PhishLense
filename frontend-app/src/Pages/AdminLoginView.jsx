import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiShield,
  FiLock,
  FiMail,
  FiArrowRight,
  FiAlertTriangle,
  FiKey,
  FiCpu,
} from "react-icons/fi";
import { adminLoginApi } from "../services/api";

export default function AdminLoginView({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your administrator email and security key.");
      return;
    }

    setLoading(true);

    try {
      const data = await adminLoginApi(email.trim(), password);

      if (data.user.role !== "ADMIN") {
        setError("Access Denied. Account does not have administrator privileges.");
        return;
      }

      localStorage.setItem("phishlense_token", data.access_token);
      localStorage.setItem("phishlense_user", JSON.stringify(data.user));

      if (onLoginSuccess) {
        onLoginSuccess(data.user);
      }

      navigate("/admin");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Administrator verification failed. Invalid credentials or insufficient clearance."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-fullscreen-container admin-theme">
      <motion.div
        className="auth-clean-card glass-panel admin-card"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {/* Brand Header */}
        <div className="auth-card-header">
          <div className="auth-brand-badge admin-badge-glow">
            <FiKey />
          </div>
          <h1 className="auth-main-title">SOC Command Center</h1>
          <p className="auth-sub-title text-crimson">
            RESTRICTED ACCESS • AUTHORIZED ADMINISTRATORS ONLY
          </p>
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

        {/* Admin Login Form */}
        <form onSubmit={handleSubmit} className="auth-form-clean">
          <div className="auth-field-group">
            <label>Administrator Email</label>
            <div className="auth-input-box admin-focus">
              <FiMail className="field-icon text-crimson" />
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="admin@phishlense.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="auth-field-group">
            <label>Master Security Key</label>
            <div className="auth-input-box admin-focus">
              <FiLock className="field-icon text-crimson" />
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

          <button
            type="submit"
            disabled={loading}
            className="auth-btn-primary admin-btn-glow"
          >
            {loading ? (
              <span>Verifying Admin Clearance...</span>
            ) : (
              <>
                <span>Access Command Center</span>
                <FiArrowRight />
              </>
            )}
          </button>
        </form>

        {/* Link back to User Login (No Admin Register Link) */}
        <div className="auth-card-footer">
          <div className="admin-gateway-link-wrap">
            <Link to="/login" className="admin-portal-link">
              ← Return to Standard User Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
