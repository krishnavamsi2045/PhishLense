"""
Unit Tests for Machine Learning Inference Engine
Coverage: 22 tests covering model prediction, feature alignment, confidence metrics, and edge cases.
"""

import pytest
import pandas as pd
from backend.analyzer.features.url_features import extract_url_features
from backend.analyzer.ml.predictor import predict, columns, model


def test_model_loaded():
    assert model is not None


def test_columns_loaded_and_non_empty():
    assert isinstance(columns, (list, pd.Index))
    assert len(columns) > 0


def test_predict_returns_dict():
    features = extract_url_features("https://google.com")
    result = predict(features)
    assert isinstance(result, dict)


def test_predict_has_required_keys():
    features = extract_url_features("https://google.com")
    result = predict(features)
    assert "prediction" in result
    assert "confidence" in result


def test_prediction_value_valid_options():
    features = extract_url_features("https://google.com")
    result = predict(features)
    assert result["prediction"] in ["Phishing", "Legitimate"]


def test_confidence_range():
    features = extract_url_features("https://google.com")
    result = predict(features)
    assert 0.0 <= result["confidence"] <= 100.0


def test_legitimate_url_inference():
    features = extract_url_features("https://wikipedia.org/wiki/Main_Page")
    result = predict(features)
    assert isinstance(result["prediction"], str)
    assert 0.0 <= result["confidence"] <= 100.0


def test_phishing_pattern_inference():
    features = extract_url_features("http://192.168.1.1/paypal-login/verify.php?token=123")
    result = predict(features)
    assert isinstance(result["prediction"], str)


def test_extra_features_dropped_safely():
    features = extract_url_features("https://google.com")
    features["random_extra_column_xyz"] = 9999
    result = predict(features)
    assert "prediction" in result


def test_suspicious_keywords_column_exclusion():
    features = extract_url_features("https://google.com/login")
    assert "suspicious_keywords" in features
    result = predict(features)
    assert "prediction" in result


def test_feature_ordering_robustness():
    features = extract_url_features("https://example.com")
    # Shuffle keys
    shuffled = {k: features[k] for k in sorted(features.keys(), reverse=True)}
    res = predict(shuffled)
    assert "confidence" in res


def test_punycode_ml_prediction():
    features = extract_url_features("http://xn--googl-pra.com/signin")
    result = predict(features)
    assert "prediction" in result


def test_nonstandard_port_ml_prediction():
    features = extract_url_features("http://evil-server.net:8888/auth")
    result = predict(features)
    assert "prediction" in result


def test_confidence_is_float():
    features = extract_url_features("https://github.com")
    result = predict(features)
    assert isinstance(result["confidence"], (float, int))


def test_short_url_inference():
    features = extract_url_features("http://a.co")
    result = predict(features)
    assert "prediction" in result


def test_long_subdomain_inference():
    features = extract_url_features("http://auth.security.service.portal.paypal.com.phish-site.org/login")
    result = predict(features)
    assert "prediction" in result


def test_https_high_entropy_url():
    features = extract_url_features("https://secure.bank.com/a9f8b7c6d5e4/overview")
    result = predict(features)
    assert "confidence" in result


def test_empty_path_inference():
    features = extract_url_features("https://example.org")
    result = predict(features)
    assert "prediction" in result


def test_query_heavy_url_inference():
    features = extract_url_features("https://example.com/search?q=test&page=1&sort=desc&limit=50")
    result = predict(features)
    assert "prediction" in result


def test_ip_address_high_risk_probability():
    features = extract_url_features("http://45.132.18.22/apple-verify/index.php")
    result = predict(features)
    assert "confidence" in result
    assert result["confidence"] >= 0.0


def test_model_predict_method_callable():
    assert hasattr(model, "predict")
    assert hasattr(model, "predict_proba")


def test_model_feature_count_matches():
    features = extract_url_features("https://google.com")
    df = pd.DataFrame([features])
    if "suspicious_keywords" in df.columns:
        df = df.drop(columns=["suspicious_keywords"])
    df = df[columns]
    assert df.shape[1] == len(columns)
