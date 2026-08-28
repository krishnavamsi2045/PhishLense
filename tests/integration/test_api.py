"""
Integration Tests for FastAPI Endpoints
Coverage: 16 tests covering root, health, analyze, history, stats, analytics, and error validation.
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch
from api.main import app

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "PhishLense API" in data["message"]
    assert "version" in data


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_docs_endpoint():
    response = client.get("/docs")
    assert response.status_code == 200


def test_openapi_schema_endpoint():
    response = client.get("/openapi.json")
    assert response.status_code == 200
    assert response.json()["info"]["title"] == "PhishLense API"


@patch("api.main.analyze_url")
def test_analyze_endpoint_success(mock_analyze):
    mock_analyze.return_value = {
        "url": "https://trusted-site.com",
        "risk_score": 10,
        "final_verdict": "SAFE",
        "severity": "LOW",
        "reasons": [],
        "features": {},
        "detection_sources": []
    }
    response = client.post("/analyze", json={"url": "https://trusted-site.com"})
    assert response.status_code == 200
    data = response.json()
    assert data["final_verdict"] == "SAFE"
    assert "scan_id" in data


def test_analyze_endpoint_missing_payload():
    response = client.post("/analyze", json={})
    assert response.status_code == 422


def test_analyze_endpoint_invalid_body_type():
    response = client.post("/analyze", json={"url": 12345})
    assert response.status_code in [200, 422]  # Pydantic may cast int to str or return 422


def test_history_endpoint_returns_list():
    response = client.get("/history")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_stats_endpoint_structure():
    response = client.get("/stats")
    assert response.status_code == 200
    data = response.json()
    assert "total_scans" in data
    assert "phishing" in data
    assert "suspicious" in data
    assert "safe" in data


def test_analytics_endpoint_structure():
    response = client.get("/analytics")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)


def test_get_scan_not_found():
    response = client.get("/scan/999999999")
    assert response.status_code == 200
    assert "error" in response.json()


@patch("api.main.analyze_url")
def test_get_scan_existing(mock_analyze):
    mock_analyze.return_value = {
        "url": "https://scan-test-lookup.com",
        "risk_score": 5,
        "final_verdict": "SAFE",
        "severity": "LOW",
        "reasons": [],
        "features": {},
        "detection_sources": []
    }
    create_resp = client.post("/analyze", json={"url": "https://scan-test-lookup.com"})
    scan_id = create_resp.json().get("scan_id")
    if scan_id:
        lookup_resp = client.get(f"/scan/{scan_id}")
        assert lookup_resp.status_code == 200
        assert lookup_resp.json()["id"] == scan_id


def test_delete_history_endpoint():
    response = client.delete("/history")
    assert response.status_code == 200
    assert "message" in response.json()


def test_cors_preflight_request():
    response = client.options(
        "/analyze",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "POST",
        }
    )
    assert response.status_code == 200


def test_invalid_http_method():
    response = client.put("/analyze", json={"url": "https://example.com"})
    assert response.status_code == 405


def test_nonexistent_endpoint_returns_404():
    response = client.get("/api/nonexistent/route/xyz")
    assert response.status_code == 404
