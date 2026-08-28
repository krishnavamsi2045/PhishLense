"""
Unit Tests for URL Feature Extraction
Coverage: 32 tests covering structural, statistical, protocol, and lexical attributes.
"""

import pytest
from backend.analyzer.features.url_features import extract_url_features, calculate_entropy, SUSPICIOUS_KEYWORDS, SUSPICIOUS_TLDS


def test_https_detection_positive():
    f = extract_url_features("https://secure.bank.com/login")
    assert f["has_https"] == 1


def test_https_detection_negative():
    f = extract_url_features("http://insecure-site.org/auth")
    assert f["has_https"] == 0


def test_ip_hostname_ipv4():
    f = extract_url_features("http://192.168.1.1/admin")
    assert f["has_ip"] == 1
    assert f["subdomain_count"] == 0


def test_ip_hostname_public():
    f = extract_url_features("http://185.220.101.5/verify")
    assert f["has_ip"] == 1


def test_domain_hostname_not_ip():
    f = extract_url_features("https://legit-domain.com/index")
    assert f["has_ip"] == 0


def test_at_symbol_present():
    f = extract_url_features("http://google.com@phish-domain.com/login")
    assert f["has_at_symbol"] == 1


def test_at_symbol_absent():
    f = extract_url_features("https://google.com/search")
    assert f["has_at_symbol"] == 0


def test_url_length_calculation():
    url = "https://example.com/very/long/path/with/parameters?token=12345"
    f = extract_url_features(url)
    assert f["url_length"] == len(url)


def test_domain_length():
    f = extract_url_features("https://my-sample-subdomain.portal-auth.com/test")
    assert f["domain_length"] == len("my-sample-subdomain.portal-auth.com")


def test_path_length():
    f = extract_url_features("https://example.com/alpha/beta/gamma")
    assert f["path_length"] == len("/alpha/beta/gamma")


def test_query_length():
    f = extract_url_features("https://example.com/search?q=cybersecurity&filter=true")
    assert f["query_length"] == len("q=cybersecurity&filter=true")


def test_dot_count():
    f = extract_url_features("http://a.b.c.d.example.com/test.php")
    assert f["dot_count"] >= 5


def test_hyphen_count_in_hostname():
    f = extract_url_features("https://secure-login-portal-verify.com/login")
    assert f["hyphen_count"] == 3


def test_digit_count():
    f = extract_url_features("http://secure123456.com/auth789")
    assert f["digit_count"] == 9


def test_digit_ratio():
    f = extract_url_features("http://1234.com/1234")
    assert 0.0 < f["digit_ratio"] <= 1.0


def test_subdomain_count_single():
    f = extract_url_features("https://mail.google.com/")
    assert f["subdomain_count"] == 1


def test_subdomain_count_multiple():
    f = extract_url_features("https://dev.api.us-east.service.corp.com/")
    assert f["subdomain_count"] == 4


def test_subdomain_count_none():
    f = extract_url_features("https://google.com/")
    assert f["subdomain_count"] == 0


def test_path_depth_root():
    f = extract_url_features("https://example.com/")
    assert f["path_depth"] == 0


def test_path_depth_deep():
    f = extract_url_features("https://example.com/a/b/c/d/e/file.html")
    assert f["path_depth"] == 6


def test_punycode_detection_true():
    f = extract_url_features("http://xn--googl-pra.com/login")
    assert f["has_punycode"] == 1


def test_punycode_detection_false():
    f = extract_url_features("https://google.com/login")
    assert f["has_punycode"] == 0


def test_suspicious_tld_xyz():
    f = extract_url_features("http://security-update.xyz/login")
    assert f["suspicious_tld"] == 1


def test_suspicious_tld_top():
    f = extract_url_features("http://verify-account.top/auth")
    assert f["suspicious_tld"] == 1


def test_legitimate_tld():
    f = extract_url_features("https://stanford.edu/research")
    assert f["suspicious_tld"] == 0


def test_nonstandard_port_detection():
    f = extract_url_features("http://login-server.com:8080/auth")
    assert f["has_nonstandard_port"] == 1


def test_standard_http_port():
    f = extract_url_features("http://example.com:80/home")
    assert f["has_nonstandard_port"] == 0


def test_standard_https_port():
    f = extract_url_features("https://example.com:443/home")
    assert f["has_nonstandard_port"] == 0


def test_encoded_characters_count():
    f = extract_url_features("http://phish.com/view%20document%2Faccount%3Fid%3D1")
    assert f["encoded_character_count"] == 4


def test_suspicious_keywords_detection():
    f = extract_url_features("http://paypal-verification-secure-banking.com/login/update-password")
    assert f["suspicious_keyword_count"] >= 4
    assert "login" in f["suspicious_keywords"]
    assert "verification" in f["suspicious_keywords"] or "verify" in f["suspicious_keywords"]


def test_entropy_calculation_empty():
    assert calculate_entropy("") == 0.0


def test_entropy_random_string():
    low_entropy = calculate_entropy("aaaaaaa")
    high_entropy = calculate_entropy("a1b2c3d4e5f6g7")
    assert high_entropy > low_entropy
