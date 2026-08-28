import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiShield,
  FiUser,
  FiMail,
  FiLock,
  FiArrowRight,
  FiAlertTriangle,
  FiCheckCircle,
  FiCheck,
} from "react-icons/fi";
import { registerApi } from "../services/api";

export default function RegisterView() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("Enterprise SOC");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError("Please fill out all required fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);

    try {
      await registerApi(
        fullName.trim(),
        email.trim(),
        password,
        organization.trim() || "Enterprise SOC"
      );

      setSuccessMessage("Registration successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Registration failed. An account with this email may already exist."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-fullscreen-container">
      <motion.div
        className="auth-clean-card glass-panel"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {/* Brand Header */}
        <div className="auth-card-header">
          <div className="auth-brand-badge">
            <FiShield />
          </div>
          <h1 className="auth-main-title">Create SOC Account</h1>
          <p className="auth-sub-title">Register as a threat analyst on PhishLense</p>
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

        {successMessage && (
          <motion.div
            className="auth-success-banner"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <FiCheckCircle />
            <span>{successMessage}</span>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form-clean">
          <div className="auth-field-group">
            <label>Full Name</label>
            <div className="auth-input-box">
              <FiUser className="field-icon" />
              <input
                type="text"
                required
                placeholder="e.g., Sarah Chen"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          </div>

          <div className="auth-field-group">
            <label>Work Email</label>
            <div className="auth-input-box">
              <FiMail className="field-icon" />
              <input
                type="email"
                required
                placeholder="sarah.chen@enterprise.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="auth-field-group">
            <label>Department / Organization</label>
            <div className="auth-input-box">
              <FiShield className="field-icon" />
              <input
                type="text"
                placeholder="Global Cyber Operations"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
              />
            </div>
          </div>

          <div className="auth-field-group">
            <label>Password (Min. 8 characters)</label>
            <div className="auth-input-box">
              <FiLock className="field-icon" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="auth-field-group">
            <label>Confirm Password</label>
            <div className="auth-input-box">
              <FiLock className="field-icon" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-btn-primary glow-button"
          >
            {loading ? (
              <span>Creating Account...</span>
            ) : (
              <>
                <span>Complete Registration</span>
                <FiArrowRight />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="auth-card-footer">
          <p className="register-prompt">
            Already have an account?{" "}
            <Link to="/login" className="auth-action-link">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
