"""
Unit Tests for Heuristic Security Engine
Coverage: 32 tests covering rule logic, brand protection, scoring bounds, and threat compounding.
"""

import pytest
from backend.analyzer.features.url_features import extract_url_features
from backend.analyzer.heuristics.heuristic_engine import calculate_risk_score, BRANDS, TRUSTED_DOMAINS, SHORTENERS


def test_no_https_penalty():
    features = extract_url_features("http://example.com/test")
    res = calculate_risk_score(features)
    assert any("HTTPS" in r for r in res["reasons"])
    assert res["risk_score"] >= 20


def test_https_no_penalty():
    features = extract_url_features("https://example.com/test")
    res = calculate_risk_score(features)
    assert not any("HTTPS" in r for r in res["reasons"])


def test_ip_address_penalty():
    features = extract_url_features("http://192.168.1.100/login")
    res = calculate_risk_score(features)
    assert any("IP address" in r for r in res["reasons"])
    assert res["risk_score"] >= 30


def test_suspicious_keyword_scoring():
    features = extract_url_features("https://example.com/login/verify/bank")
    res = calculate_risk_score(features)
    assert any("keyword" in r for r in res["reasons"])
    assert res["risk_score"] >= 12


def test_multiple_suspicious_keywords_cap():
    features = extract_url_features("https://example.com/login/signin/verify/verification/account/secure/password")
    res = calculate_risk_score(features)
    assert any("keyword" in r for r in res["reasons"])
    assert res["risk_score"] <= 100


def test_brand_impersonation_paypal():
    features = extract_url_features("http://paypal-security-update.com/login")
    res = calculate_risk_score(features)
    assert any("impersonation" in r.lower() or "paypal" in r.lower() for r in res["reasons"])
    assert res["risk_score"] >= 40


def test_brand_impersonation_apple():
    features = extract_url_features("http://apple-id-recovery-center.xyz/auth")
    res = calculate_risk_score(features)
    assert any("apple" in r.lower() for r in res["reasons"])


def test_brand_impersonation_microsoft():
    features = extract_url_features("http://microsoft-online-portal.net/login")
    res = calculate_risk_score(features)
    assert any("microsoft" in r.lower() for r in res["reasons"])


def test_brand_impersonation_google():
    features = extract_url_features("http://google-drive-share-doc.com/view")
    res = calculate_risk_score(features)
    assert any("google" in r.lower() for r in res["reasons"])


def test_trusted_domain_paypal_no_brand_penalty():
    features = extract_url_features("https://www.paypal.com/signin")
    res = calculate_risk_score(features)
    assert not any("impersonation" in r.lower() for r in res["reasons"])


def test_trusted_domain_google_no_brand_penalty():
    features = extract_url_features("https://google.com/search")
    res = calculate_risk_score(features)
    assert not any("impersonation" in r.lower() for r in res["reasons"])


def test_trusted_domain_microsoft_no_brand_penalty():
    features = extract_url_features("https://microsoft.com/en-us")
    res = calculate_risk_score(features)
    assert not any("impersonation" in r.lower() for r in res["reasons"])


def test_shortener_penalty_bitly():
    features = extract_url_features("https://bit.ly/3xY7kL")
    res = calculate_risk_score(features)
    assert any("shortener" in r.lower() or "shortening" in r.lower() for r in res["reasons"])


def test_shortener_penalty_tinyurl():
    features = extract_url_features("https://tinyurl.com/abc1234")
    res = calculate_risk_score(features)
    assert any("shortener" in r.lower() or "shortening" in r.lower() for r in res["reasons"])


def test_at_symbol_heuristic():
    features = extract_url_features("http://legit.com@phishing-target.xyz/login")
    res = calculate_risk_score(features)
    assert any("@" in r for r in res["reasons"])
    assert res["risk_score"] >= 20


def test_long_url_penalty():
    long_path = "a" * 120
    features = extract_url_features(f"http://example.com/{long_path}")
    res = calculate_risk_score(features)
    assert any("length" in r.lower() or "long" in r.lower() for r in res["reasons"])


def test_excessive_subdomains_penalty():
    features = extract_url_features("http://sub1.sub2.sub3.sub4.example.com/test")
    res = calculate_risk_score(features)
    assert any("subdomain" in r.lower() for r in res["reasons"])


def test_punycode_heuristic_penalty():
    features = extract_url_features("http://xn--googl-pra.com/verify")
    res = calculate_risk_score(features)
    assert any("punycode" in r.lower() or "homograph" in r.lower() for r in res["reasons"])


def test_suspicious_tld_heuristic_penalty():
    features = extract_url_features("http://account-verification.xyz/login")
    res = calculate_risk_score(features)
    assert any("tld" in r.lower() or "suspicious" in r.lower() for r in res["reasons"])


def test_nonstandard_port_heuristic():
    features = extract_url_features("http://example.com:8088/portal")
    res = calculate_risk_score(features)
    assert any("port" in r.lower() for r in res["reasons"])


def test_deep_path_heuristic():
    features = extract_url_features("http://example.com/a/b/c/d/e/f/g/login.php")
    res = calculate_risk_score(features)
    assert any("path" in r.lower() or "deep" in r.lower() for r in res["reasons"])


def test_multiple_hyphens_heuristic():
    features = extract_url_features("http://secure-login-verify-account-portal.com/")
    res = calculate_risk_score(features)
    assert any("hyphen" in r.lower() for r in res["reasons"])


def test_threat_intel_exact_url_match():
    features = extract_url_features("http://badphish.com/login")
    ti = {"url_match": True, "details": "Found in OpenPhish"}
    res = calculate_risk_score(features, threat_intelligence=ti)
    assert res["risk_score"] >= 50
    assert any("threat intelligence" in r.lower() for r in res["reasons"])


def test_threat_intel_domain_match():
    features = extract_url_features("http://bad-domain-in-ti.com/some/path")
    ti = {"domain_match": True, "details": "Known phishing infrastructure"}
    res = calculate_risk_score(features, threat_intelligence=ti)
    assert res["risk_score"] >= 20


def test_threat_intel_clean():
    features = extract_url_features("https://trusted-site.com/")
    ti = {"url_match": False, "domain_match": False, "ip_match": False}
    res = calculate_risk_score(features, threat_intelligence=ti)
    assert not any("threat intelligence database" in r.lower() for r in res["reasons"])


def test_score_never_exceeds_100():
    features = extract_url_features("http://192.168.1.1:8888/paypal-login-verify-bank-update/a/b/c/d/e%20%21@xn--bad-4qa.xyz")
    ti = {"url_match": True, "domain_match": True, "ip_match": True}
    res = calculate_risk_score(features, threat_intelligence=ti)
    assert res["risk_score"] <= 100


def test_score_never_below_zero():
    features = extract_url_features("https://google.com/")
    res = calculate_risk_score(features)
    assert res["risk_score"] >= 0


def test_clean_safe_site_score_low():
    features = extract_url_features("https://google.com/search")
    res = calculate_risk_score(features)
    assert res["risk_score"] < 25


def test_reasons_is_list():
    features = extract_url_features("http://example.com")
    res = calculate_risk_score(features)
    assert isinstance(res["reasons"], list)


def test_score_is_integer():
    features = extract_url_features("https://example.com")
    res = calculate_risk_score(features)
    assert isinstance(res["risk_score"], (int, float))


def test_high_risk_compound_triggers_phishing_reasons():
    features = extract_url_features("http://paypal-verification-center.xyz:8080/login.php")
    res = calculate_risk_score(features)
    assert len(res["reasons"]) >= 3
    assert res["risk_score"] >= 60


def test_empty_feature_dict_graceful():
    res = calculate_risk_score({})
    assert "risk_score" in res
    assert isinstance(res["reasons"], list)
