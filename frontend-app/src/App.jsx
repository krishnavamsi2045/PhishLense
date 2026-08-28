import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import AppShell from "./components/AppShell";
import LoginView from "./Pages/LoginView";
import RegisterView from "./Pages/RegisterView";
import AdminLoginView from "./Pages/AdminLoginView";
import "./App.css";

function getStoredUser() {
  try {
    const raw = localStorage.getItem("phishlense_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function ProtectedUserRoute({ user, children }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function ProtectedAdminRoute({ user, children }) {
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }
  if (user.role !== "ADMIN") {
    return <Navigate to="/app" replace />;
  }
  return children;
}

function RootRedirect({ user }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role === "ADMIN") {
    return <Navigate to="/admin" replace />;
  }
  return <Navigate to="/app" replace />;
}

export default function App() {
  const [user, setUser] = useState(getStoredUser);

  useEffect(() => {
    const handleStorage = () => {
      setUser(getStoredUser());
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleLoginSuccess = (authUser) => {
    setUser(authUser);
  };

  const handleLogout = () => {
    localStorage.removeItem("phishlense_token");
    localStorage.removeItem("phishlense_user");
    setUser(null);
  };

  return (
    <Router>
      <Routes>
        {/* Root Redirect based on Auth State */}
        <Route path="/" element={<RootRedirect user={user} />} />

        {/* User Authentication Entry Points */}
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to={user.role === "ADMIN" ? "/admin" : "/app"} replace />
            ) : (
              <LoginView onLoginSuccess={handleLoginSuccess} />
            )
          }
        />
        <Route
          path="/register"
          element={
            user ? (
              <Navigate to={user.role === "ADMIN" ? "/admin" : "/app"} replace />
            ) : (
              <RegisterView />
            )
          }
        />

        {/* Admin Authentication Entry Point (Zero Public Register) */}
        <Route
          path="/admin/login"
          element={
            user && user.role === "ADMIN" ? (
              <Navigate to="/admin" replace />
            ) : (
              <AdminLoginView onLoginSuccess={handleLoginSuccess} />
            )
          }
        />

        {/* User SOC Workspace */}
        <Route
          path="/app/*"
          element={
            <ProtectedUserRoute user={user}>
              <AppShell
                user={user}
                defaultPortal="user"
                onLogout={handleLogout}
              />
            </ProtectedUserRoute>
          }
        />

        {/* Admin Command Center */}
        <Route
          path="/admin/*"
          element={
            <ProtectedAdminRoute user={user}>
              <AppShell
                user={user}
                defaultPortal="admin"
                onLogout={handleLogout}
              />
            </ProtectedAdminRoute>
          }
        />

        {/* Fallback Catch-All Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
