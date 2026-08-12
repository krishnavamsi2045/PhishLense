def calculate_risk_score(
    features: dict,
    threat_intelligence: dict | None = None,
) -> dict:
    """
    Calculate a transparent phishing risk score.

    Combines:
    1. URL heuristic features
    2. Local threat-intelligence matches

    Score range: 0-100.
    """

    score = 0
    reasons = []

    # -----------------------------
    # HEURISTIC ANALYSIS
    # -----------------------------

    # HTTPS
    if features.get("has_https") == 0:
        score += 20
        reasons.append("URL does not use HTTPS")

    # IP address
    if features.get("has_ip") == 1:
        score += 30
        reasons.append("URL uses an IP address instead of a domain")

    # Suspicious keywords
    keyword_count = features.get("suspicious_keyword_count", 0)

    if keyword_count > 0:
        keyword_score = min(keyword_count * 8, 24)
        score += keyword_score
        reasons.append(
            f"Contains {keyword_count} suspicious keyword(s)"
        )

    # @ symbol
    if features.get("has_at_symbol") == 1:
        score += 20
        reasons.append("URL contains @ symbol")

    # Long URL
    if features.get("url_length", 0) > 100:
        score += 10
        reasons.append("URL is unusually long")

    # Excessive subdomains
    if features.get("subdomain_count", 0) >= 3:
        score += 10
        reasons.append("URL contains multiple subdomains")

    # URL encoding
    if features.get("encoded_character_count", 0) >= 3:
        score += 5
        reasons.append("URL contains encoded characters")

    # Excessive special characters
    if features.get("special_character_count", 0) >= 8:
        score += 5
        reasons.append("URL contains many special characters")

    # Punycode
    if features.get("has_punycode") == 1:
        score += 15
        reasons.append(
            "Domain uses punycode/internationalized hostname encoding"
        )

    # Non-standard port
    if features.get("has_nonstandard_port") == 1:
        score += 10
        reasons.append("URL uses a non-standard port")

    # Deep URL path
    if features.get("path_depth", 0) >= 5:
        score += 5
        reasons.append("URL has a deep path structure")

    # Multiple domain hyphens
    if features.get("hyphen_count", 0) >= 3:
        score += 5
        reasons.append("Domain contains multiple hyphens")

    # -----------------------------
    # THREAT INTELLIGENCE
    # -----------------------------

    if threat_intelligence:
        if threat_intelligence.get("url_match"):
            score += 50
            reasons.append(
                "Exact URL found in threat-intelligence database"
            )

        elif threat_intelligence.get("domain_match"):
            score += 40
            reasons.append(
                "Domain found in threat-intelligence database"
            )

        elif threat_intelligence.get("ip_match"):
            score += 40
            reasons.append(
                "IP address found in threat-intelligence database"
            )

    # Keep score between 0 and 100
    score = min(score, 100)

    # -----------------------------
    # CLASSIFICATION
    # -----------------------------

    if score >= 70:
        verdict = "PHISHING"
    elif score >= 30:
        verdict = "SUSPICIOUS"
    else:
        verdict = "SAFE"

    return {
        "risk_score": score,
        "verdict": verdict,
        "reasons": reasons,
    }