import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUsers,
  FiSearch,
  FiShield,
  FiCheckCircle,
  FiXCircle,
  FiEdit2,
  FiTrash2,
  FiUserPlus,
  FiRefreshCw,
  FiMail,
  FiClock,
  FiActivity,
  FiX,
  FiCheck,
} from "react-icons/fi";
import { getAdminUsers, updateAdminUser, deleteAdminUser } from "../../services/api";

export default function UserManagementView() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAdminUsers();
      if (Array.isArray(data)) {
        setUsers(data);
      }
    } catch (err) {
      console.warn("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user) => {
    try {
      await updateAdminUser(user.id, { is_active: !user.is_active });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, is_active: !u.is_active } : u
        )
      );
      setStatusMessage(`User ${user.email} status updated.`);
      setTimeout(() => setStatusMessage(""), 3000);
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to update user status");
    }
  };

  const handleToggleRole = async (user) => {
    const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";
    try {
      await updateAdminUser(user.id, { role: newRole });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, role: newRole } : u
        )
      );
      setStatusMessage(`User ${user.email} promoted/demoted to ${newRole}.`);
      setTimeout(() => setStatusMessage(""), 3000);
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to change user role");
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to permanently delete this user?")) {
      return;
    }
    try {
      await deleteAdminUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setSelectedUser(null);
      setStatusMessage("User account purged successfully.");
      setTimeout(() => setStatusMessage(""), 3000);
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to delete user");
    }
  };

  const filteredUsers = users.filter((u) =>
    (u.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.organization || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-view-root">
      {/* View Header */}
      <div className="view-header-bar">
        <div>
          <div className="view-badge admin">
            <FiUsers />
            <span>ACCESS CONTROL & RBAC</span>
          </div>
          <h1 className="view-title">User & Role Management</h1>
          <p className="view-subtitle">
            Manage SOC analyst accounts, permission tiers, organizations, and active sessions.
          </p>
        </div>

        <button className="cyber-action-btn" onClick={fetchUsers}>
          <FiRefreshCw className={loading ? "spin" : ""} />
          <span>Refresh Directory</span>
        </button>
      </div>

      {statusMessage && (
        <motion.div
          className="admin-alert-banner"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <FiCheckCircle />
          <span>{statusMessage}</span>
        </motion.div>
      )}

      {/* Filter and Search Bar */}
      <div className="table-controls-bar glass-panel">
        <div className="table-search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search by name, work email, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="table-counter">
          <strong>{filteredUsers.length}</strong> Operators Registered
        </div>
      </div>

      {/* Users Table */}
      <div className="enterprise-table-shell glass-panel">
        <table className="enterprise-table">
          <thead>
            <tr>
              <th>OPERATOR</th>
              <th>ORGANIZATION</th>
              <th>ROLE / TIER</th>
              <th>STATUS</th>
              <th>TOTAL SCANS</th>
              <th>LAST LOGIN</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="user-cell-meta">
                    <div className={`user-avatar ${u.role.toLowerCase()}`}>
                      {u.full_name ? u.full_name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div>
                      <strong className="user-name">{u.full_name}</strong>
                      <span className="user-email">{u.email}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="org-label">{u.organization || "Enterprise SOC"}</span>
                </td>
                <td>
                  <span className={`role-badge ${u.role.toLowerCase()}`}>
                    {u.role === "ADMIN" ? "SOC Commander (Admin)" : "Analyst (User)"}
                  </span>
                </td>
                <td>
                  <span className={`status-pill ${u.is_active ? "active" : "inactive"}`}>
                    {u.is_active ? "Active" : "Deactivated"}
                  </span>
                </td>
                <td>
                  <strong className="scan-counter">{u.scans_count || 0}</strong>
                </td>
                <td>
                  <span className="time-label">{u.last_login || "Never"}</span>
                </td>
                <td>
                  <div className="action-buttons-group">
                    <button
                      className="table-act-btn inspect"
                      title="Inspect Profile"
                      onClick={() => setSelectedUser(u)}
                    >
                      <FiActivity />
                    </button>
                    <button
                      className="table-act-btn role"
                      title="Toggle Admin/User Role"
                      onClick={() => handleToggleRole(u)}
                    >
                      <FiShield />
                    </button>
                    <button
                      className={`table-act-btn ${u.is_active ? "deactivate" : "activate"}`}
                      title={u.is_active ? "Deactivate Account" : "Activate Account"}
                      onClick={() => handleToggleStatus(u)}
                    >
                      {u.is_active ? <FiXCircle /> : <FiCheckCircle />}
                    </button>
                    <button
                      className="table-act-btn delete"
                      title="Delete User"
                      onClick={() => handleDelete(u.id)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Profile Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="modal-backdrop" onClick={() => setSelectedUser(null)}>
            <motion.div
              className="user-profile-modal glass-panel"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
            >
              <div className="modal-header">
                <div className="modal-title-wrap">
                  <FiUsers className="icon-badge" />
                  <div>
                    <h3>Operator Dossier</h3>
                    <p>Security clearance and activity profile</p>
                  </div>
                </div>
                <button className="modal-close-btn" onClick={() => setSelectedUser(null)}>
                  <FiX />
                </button>
              </div>

              <div className="profile-body">
                <div className="profile-header-card">
                  <div className="large-avatar">{selectedUser.full_name?.charAt(0)}</div>
                  <div>
                    <h2>{selectedUser.full_name}</h2>
                    <span className="email-sub">{selectedUser.email}</span>
                    <div className="badges-row">
                      <span className={`role-badge ${selectedUser.role.toLowerCase()}`}>
                        {selectedUser.role}
                      </span>
                      <span className="org-tag">{selectedUser.organization}</span>
                    </div>
                  </div>
                </div>

                <div className="profile-grid-stats">
                  <div className="stat-box">
                    <span>ACCOUNT ID</span>
                    <strong>#{selectedUser.id}</strong>
                  </div>
                  <div className="stat-box">
                    <span>SCANS DISPATCHED</span>
                    <strong>{selectedUser.scans_count || 0} URLs</strong>
                  </div>
                  <div className="stat-box">
                    <span>SECURITY STATUS</span>
                    <strong className={selectedUser.is_active ? "text-cyan" : "text-crimson"}>
                      {selectedUser.is_active ? "CLEAR / ACTIVE" : "SUSPENDED"}
                    </strong>
                  </div>
                  <div className="stat-box">
                    <span>REGISTERED ON</span>
                    <strong>{selectedUser.created_at || "N/A"}</strong>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
