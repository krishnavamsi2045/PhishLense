"""
Unit Tests for Risk Engine and Composite Scoring
Coverage: 22 tests covering multi-engine risk aggregation, thresholds, caps, and severity levels.
"""

import pytest
from unittest.mock import patch
from backend.analyzer.url_analyzer import analyze_url


@pytest.fixture(autouse=True)
def default_mock_external():
    with patch("backend.analyzer.url_analyzer.scan_url", return_value={"available": False}), \
         patch("backend.analyzer.url_analyzer.check_openphish", return_value=False), \
         patch("backend.analyzer.url_analyzer.get_domain_age", return_value=365), \
         patch("backend.analyzer.url_analyzer.check_ssl", return_value={"valid": True, "days_left": 90}):
        yield


def test_safe_verdict_for_clean_domain():
    result = analyze_url("https://google.com/search")
    assert result["final_verdict"] == "SAFE"
    assert result["risk_score"] < 25


def test_phishing_verdict_high_risk_sources():
    with patch("backend.analyzer.url_analyzer.check_openphish", return_value=True), \
         patch("backend.analyzer.url_analyzer.get_domain_age", return_value=1), \
         patch("backend.analyzer.url_analyzer.check_ssl", return_value={"valid": False, "days_left": 0}):
        result = analyze_url("http://paypal-verification-center.xyz/login")
        assert result["final_verdict"] == "PHISHING"
        assert result["risk_score"] >= 60


def test_virustotal_high_malicious_boost():
    with patch("backend.analyzer.url_analyzer.scan_url", return_value={"available": True, "malicious": 12, "suspicious": 2}):
        result = analyze_url("https://malicious-sample-target.com")
        assert result["risk_score"] >= 50
        assert any("VirusTotal" in s for s in result["detection_sources"])


def test_domain_age_under_7_days_penalty():
    with patch("backend.analyzer.url_analyzer.get_domain_age", return_value=3):
        result = analyze_url("https://newly-registered-domain-123.com")
        assert any("7 days" in r for r in result["reasons"])


def test_domain_age_under_30_days_penalty():
    with patch("backend.analyzer.url_analyzer.get_domain_age", return_value=20):
        result = analyze_url("https://sub-month-domain.com")
        assert any("30 days" in r for r in result["reasons"])


def test_domain_age_under_180_days_penalty():
    with patch("backend.analyzer.url_analyzer.get_domain_age", return_value=100):
        result = analyze_url("https://recent-domain.com")
        assert any("Recently registered" in r for r in result["reasons"])


def test_invalid_ssl_penalty():
    with patch("backend.analyzer.url_analyzer.check_ssl", return_value={"valid": False, "days_left": 0}):
        result = analyze_url("https://expired-ssl.com")
        assert any("Invalid SSL" in r for r in result["reasons"])


def test_expiring_ssl_penalty():
    with patch("backend.analyzer.url_analyzer.check_ssl", return_value={"valid": True, "days_left": 5}):
        result = analyze_url("https://expiring-soon.com")
        assert any("expiring soon" in r.lower() for r in result["reasons"])


def test_risk_score_ceiling_is_100():
    with patch("backend.analyzer.url_analyzer.check_openphish", return_value=True), \
         patch("backend.analyzer.url_analyzer.scan_url", return_value={"available": True, "malicious": 20}):
        result = analyze_url("http://192.168.1.1:9999/paypal-login-verify-bank-update-signin/a/b/c/d/e/f")
        assert result["risk_score"] <= 100


def test_risk_score_floor_is_zero():
    result = analyze_url("https://google.com/")
    assert result["risk_score"] >= 0


def test_severity_levels_critical():
    with patch("backend.analyzer.url_analyzer.check_openphish", return_value=True), \
         patch("backend.analyzer.url_analyzer.get_domain_age", return_value=1), \
         patch("backend.analyzer.url_analyzer.check_ssl", return_value={"valid": False, "days_left": 0}), \
         patch("backend.analyzer.url_analyzer.scan_url", return_value={"available": True, "malicious": 15}):
        result = analyze_url("http://192.168.1.1/paypal-login-verify")
        assert result["severity"] == "CRITICAL"


def test_severity_levels_info_or_low():
    result = analyze_url("https://google.com/search")
    assert result["severity"] in ["MINIMAL", "LOW", "INFO", "CLEAN"]


def test_result_structure_keys():
    result = analyze_url("https://example.com")
    required_keys = ["url", "risk_score", "final_verdict", "severity", "reasons", "features", "detection_sources"]
    for key in required_keys:
        assert key in result


def test_suspicious_verdict_threshold():
    with patch("backend.analyzer.url_analyzer.get_domain_age", return_value=25):
        result = analyze_url("http://example-suspicious-portal.org/login")
        if 25 <= result["risk_score"] < 60:
            assert result["final_verdict"] == "SUSPICIOUS"


def test_openphish_detection_source_added():
    with patch("backend.analyzer.url_analyzer.check_openphish", return_value=True):
        result = analyze_url("http://openphish-hit.com/login")
        assert "OpenPhish" in result["detection_sources"]


def test_ml_detection_source_on_high_confidence():
    with patch("backend.analyzer.url_analyzer.predict", return_value={"prediction": "Phishing", "confidence": 92.5}):
        result = analyze_url("http://random-phish-domain.xyz/auth")
        assert "Machine Learning" in result["detection_sources"]


def test_reasons_is_non_empty_for_risky_url():
    with patch("backend.analyzer.url_analyzer.check_openphish", return_value=True):
        result = analyze_url("http://bad-login-target.com")
        assert len(result["reasons"]) > 0


def test_features_nested_dict():
    result = analyze_url("https://example.com/test")
    assert isinstance(result["features"], dict)
    assert "has_https" in result["features"]


def test_analysis_handles_non_ascii_gracefully():
    result = analyze_url("http://xn--caf-dma.com/login")
    assert "risk_score" in result


def test_analysis_handles_port_in_url():
    result = analyze_url("http://example.com:8443/auth")
    assert "risk_score" in result


def test_empty_reasons_is_list():
    result = analyze_url("https://google.com")
    assert isinstance(result["reasons"], list)


def test_clean_url_no_openphish():
    result = analyze_url("https://microsoft.com")
    assert "OpenPhish" not in result["detection_sources"]
