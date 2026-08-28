"""
Unit Tests for URL Validation and Normalization
Coverage: 22 tests covering RFC 3986 compliance, edge cases, sanitation, and malformed inputs.
"""

import pytest
from backend.analyzer.ml.dataset_pipeline import is_valid_url, normalize_url


def test_valid_https_url():
    assert is_valid_url("https://example.com/test") is True


def test_valid_http_url():
    assert is_valid_url("http://example.org") is True


def test_valid_url_with_query_and_fragment():
    assert is_valid_url("https://example.com/page?id=123#section") is True


def test_empty_string_invalid():
    assert is_valid_url("") is False


def test_none_url_invalid():
    assert is_valid_url(None) is False


def test_non_string_invalid():
    assert is_valid_url(12345) is False


def test_whitespace_inside_url_invalid():
    assert is_valid_url("https://example .com/login") is False


def test_newline_inside_url_invalid():
    assert is_valid_url("https://example.com/\nlogin") is False


def test_carriage_return_invalid():
    assert is_valid_url("https://example.com/\rlogin") is False


def test_overly_short_url_invalid():
    assert is_valid_url("a") is False


def test_overly_long_url_invalid():
    long_url = "https://example.com/" + ("x" * 2500)
    assert is_valid_url(long_url) is False


def test_url_without_scheme_auto_handled():
    # is_valid_url prepends http:// if missing
    assert is_valid_url("example.com/login") is True


def test_ip_url_valid():
    assert is_valid_url("http://192.168.1.1:8080/admin") is True


def test_punycode_url_valid():
    assert is_valid_url("http://xn--googl-pra.com/auth") is True


def test_normalize_url_scheme_lowercase():
    normalized = normalize_url("HTTPS://Example.Com/Login")
    assert normalized.startswith("https://example.com")


def test_normalize_url_default_path():
    normalized = normalize_url("https://example.com")
    assert normalized == "https://example.com/"


def test_normalize_url_strip_default_http_port_80():
    normalized = normalize_url("http://example.com:80/path")
    assert ":80" not in normalized


def test_normalize_url_strip_default_https_port_443():
    normalized = normalize_url("https://example.com:443/path")
    assert ":443" not in normalized


def test_normalize_url_preserve_custom_port():
    normalized = normalize_url("http://example.com:8080/path")
    assert ":8080" in normalized


def test_normalize_url_preserves_query_string():
    normalized = normalize_url("https://example.com/search?q=test&lang=en")
    assert "q=test&lang=en" in normalized


def test_normalize_url_handles_trailing_spaces():
    normalized = normalize_url("  https://example.com/path   ")
    assert normalized == "https://example.com/path"


def test_normalize_url_missing_scheme():
    normalized = normalize_url("example.com/index.html")
    assert normalized.startswith("http://example.com")
