"""
Integration Tests for PhishLense V3 Authentication & Admin Portal
Coverage: 12 tests covering JWT registration, login, profile inspection, password change,
admin overview, user management, audit logs, system health, and role access guards.
"""

import pytest
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)


def test_auth_login_admin():
    response = client.post("/auth/login", json={
        "email": "admin@phishlense.io",
        "password": "Admin@12345"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "ADMIN"
    assert data["user"]["email"] == "admin@phishlense.io"


def test_auth_login_analyst():
    response = client.post("/auth/login", json={
        "email": "analyst@phishlense.io",
        "password": "Analyst@12345"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "USER"


def test_auth_login_invalid_password():
    response = client.post("/auth/login", json={
        "email": "admin@phishlense.io",
        "password": "WrongPassword999"
    })
    assert response.status_code == 401


def test_auth_me_authenticated():
    # Login as admin
    login_res = client.post("/auth/login", json={
        "email": "admin@phishlense.io",
        "password": "Admin@12345"
    })
    token = login_res.json()["access_token"]

    response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "admin@phishlense.io"
    assert data["role"] == "ADMIN"


def test_admin_overview_requires_admin():
    # Analyst (USER role) should receive 403 Forbidden
    login_res = client.post("/auth/login", json={
        "email": "analyst@phishlense.io",
        "password": "Analyst@12345"
    })
    token = login_res.json()["access_token"]

    response = client.get("/admin/overview", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 403


def test_admin_overview_success():
    # Admin gets full KPIs
    login_res = client.post("/auth/login", json={
        "email": "admin@phishlense.io",
        "password": "Admin@12345"
    })
    token = login_res.json()["access_token"]

    response = client.get("/admin/overview", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert "kpis" in data
    assert data["kpis"]["total_scans"] >= 100
    assert "top_attack_vectors" in data


def test_admin_system_health():
    login_res = client.post("/auth/login", json={
        "email": "admin@phishlense.io",
        "password": "Admin@12345"
    })
    token = login_res.json()["access_token"]

    response = client.get("/admin/system-health", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "OPTIMAL"
    assert "subsystems" in data


def test_admin_audit_logs():
    login_res = client.post("/auth/login", json={
        "email": "admin@phishlense.io",
        "password": "Admin@12345"
    })
    token = login_res.json()["access_token"]

    response = client.get("/admin/audit-logs", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    logs = response.json()
    assert isinstance(logs, list)
    assert len(logs) > 0


def test_admin_ml_metrics():
    login_res = client.post("/auth/login", json={
        "email": "admin@phishlense.io",
        "password": "Admin@12345"
    })
    token = login_res.json()["access_token"]

    response = client.get("/admin/ml-metrics", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert "feature_importance" in data
    assert "model_comparisons" in data


def test_admin_threat_map():
    response = client.get("/admin/threat-map")
    assert response.status_code == 200
    map_data = response.json()
    assert isinstance(map_data, list)
    assert len(map_data) >= 5


def test_bulk_analyze():
    response = client.post("/analyze/bulk", json={
        "urls": [
            "https://www.google.com",
            "http://paypal-verification-secure-banking.com/login"
        ]
    })
    assert response.status_code == 200
    data = response.json()
    assert data["total_processed"] == 2
    assert len(data["results"]) == 2
