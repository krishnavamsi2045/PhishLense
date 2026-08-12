from analyzer.features.url_features import extract_url_features
from analyzer.heuristics.heuristic_engine import calculate_risk_score
from analyzer.threat_intelligence.threat_intel_engine import (
    check_threat_intelligence,
)


def analyze_url(url: str) -> dict:
    """
    Run the complete PhishLense URL analysis pipeline.

    1. Extract URL features.
    2. Check threat intelligence.
    3. Calculate combined heuristic + threat-intelligence risk.
    4. Return the complete analysis.
    """

    # Step 1: Feature extraction
    features = extract_url_features(url)

    # Step 2: Threat intelligence lookup
    threat_intelligence = check_threat_intelligence(url)

    # Step 3: Combined risk analysis
    risk_analysis = calculate_risk_score(
        features,
        threat_intelligence,
    )

    return {
        "url": url,
        "risk_score": risk_analysis["risk_score"],
        "verdict": risk_analysis["verdict"],
        "reasons": risk_analysis["reasons"],
        "features": features,
        "threat_intelligence": threat_intelligence,
    }