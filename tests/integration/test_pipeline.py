"""
End-to-End Pipeline Integration Tests
Coverage: 12 tests validating the entire lifecycle from raw URL input to multi-tier classification and storage.
"""

import pytest
from unittest.mock import patch
from api.main import app
from fastapi.testclient import TestClient
from database.db import SessionLocal
from database.models import Scan

client = TestClient(app)


@pytest.fixture(autouse=True)
def mock_external_network_calls():
    """Mock slow external WHOIS, SSL, and VirusTotal network calls for fast, deterministic pipeline testing."""
    with patch("backend.analyzer.url_analyzer.scan_url", return_value={"available": False}), \
         patch("backend.analyzer.url_analyzer.check_openphish", return_value=False), \
         patch("backend.analyzer.url_analyzer.get_domain_age", return_value=365), \
         patch("backend.analyzer.url_analyzer.check_ssl", return_value={"valid": True, "days_left": 100}):
        yield


def test_full_pipeline_clean_url():
    target_url = "https://wikipedia.org/wiki/Phishing"
    response = client.post("/analyze", json={"url": target_url})
    assert response.status_code == 200
    data = response.json()

    assert data["url"] == target_url
    assert data["final_verdict"] == "SAFE"
    assert data["risk_score"] < 25
    assert "scan_id" in data

    # Verify database persistence
    db = SessionLocal()
    try:
        record = db.query(Scan).filter(Scan.id == data["scan_id"]).first()
        assert record is not None
        assert record.url == target_url
        assert record.verdict == "SAFE"
    finally:
        db.close()


def test_full_pipeline_phishing_url():
    with patch("backend.analyzer.url_analyzer.check_openphish", return_value=True), \
         patch("backend.analyzer.url_analyzer.get_domain_age", return_value=2), \
         patch("backend.analyzer.url_analyzer.check_ssl", return_value={"valid": False, "days_left": 0}):
        target_url = "http://192.168.1.1/paypal-login/verification.php"
        response = client.post("/analyze", json={"url": target_url})
        assert response.status_code == 200
        data = response.json()

        assert data["final_verdict"] == "PHISHING"
        assert data["risk_score"] >= 60
        assert len(data["reasons"]) >= 2
        assert "scan_id" in data


def test_full_pipeline_suspicious_url():
    with patch("backend.analyzer.url_analyzer.get_domain_age", return_value=15):
        target_url = "http://account-portal-security-check.xyz"
        response = client.post("/analyze", json={"url": target_url})
        assert response.status_code == 200
        data = response.json()

        assert data["final_verdict"] in ["SUSPICIOUS", "PHISHING"]
        assert data["risk_score"] >= 25


def test_pipeline_punycode_end_to_end():
    target_url = "http://xn--googl-pra.com/security/login"
    response = client.post("/analyze", json={"url": target_url})
    assert response.status_code == 200
    data = response.json()
    assert "features" in data
    assert data["features"]["has_punycode"] == 1


def test_pipeline_ip_address_end_to_end():
    target_url = "http://10.0.0.1/admin/login"
    response = client.post("/analyze", json={"url": target_url})
    assert response.status_code == 200
    data = response.json()
    assert data["features"]["has_ip"] == 1


def test_pipeline_nonstandard_port_end_to_end():
    target_url = "http://legit-looking.org:9090/auth"
    response = client.post("/analyze", json={"url": target_url})
    assert response.status_code == 200
    data = response.json()
    assert data["features"]["has_nonstandard_port"] == 1


def test_pipeline_keyword_detection_end_to_end():
    target_url = "https://example.com/bank/login/verify"
    response = client.post("/analyze", json={"url": target_url})
    assert response.status_code == 200
    data = response.json()
    assert data["features"]["suspicious_keyword_count"] >= 3


def test_pipeline_stats_update_after_scan():
    initial_stats = client.get("/stats").json()
    client.post("/analyze", json={"url": "https://stats-check.org"})
    updated_stats = client.get("/stats").json()
    assert updated_stats["total_scans"] == initial_stats["total_scans"] + 1


def test_pipeline_history_contains_new_scan():
    target_url = "https://unique-history-verify-url.com"
    client.post("/analyze", json={"url": target_url})
    history = client.get("/history").json()
    assert any(h["url"] == target_url for h in history)


def test_pipeline_handles_trailing_slash():
    resp1 = client.post("/analyze", json={"url": "https://example.com"})
    resp2 = client.post("/analyze", json={"url": "https://example.com/"})
    assert resp1.status_code == 200
    assert resp2.status_code == 200


def test_pipeline_handles_special_query_characters():
    resp = client.post("/analyze", json={"url": "https://example.com/path?token=abc%20123&flag=true"})
    assert resp.status_code == 200
    assert "risk_score" in resp.json()


def test_pipeline_reasons_are_descriptive():
    with patch("backend.analyzer.url_analyzer.check_openphish", return_value=True):
        resp = client.post("/analyze", json={"url": "http://192.168.1.1:8080/paypal-verify"})
        data = resp.json()
        assert len(data["reasons"]) > 0
        assert all(isinstance(r, str) for r in data["reasons"])
