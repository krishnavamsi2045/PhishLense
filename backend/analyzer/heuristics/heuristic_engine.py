# analyzer/heuristics/heuristic_engine.py

BRANDS = {
    "paypal",
    "google",
    "microsoft",
    "amazon",
    "apple",
    "facebook",
    "instagram",
    "netflix",
    "bank",
}

TRUSTED_DOMAINS = {
    "google.com",
    "paypal.com",
    "microsoft.com",
    "amazon.com",
    "apple.com",
    "facebook.com",
    "instagram.com",
    "netflix.com",
}

SHORTENERS = {
    "bit.ly",
    "tinyurl.com",
    "t.co",
    "goo.gl",
    "rb.gy",
}


def calculate_risk_score(
    features: dict,
    threat_intelligence: dict | None = None,
) -> dict:

    score = 0
    reasons = []

    hostname = features.get(
        "hostname",
        "",
    ).lower()

    # --------------------------------
    # HTTPS
    # --------------------------------

    if features.get("has_https") == 0:

        score += 20

        reasons.append(
            "URL does not use HTTPS"
        )

    # --------------------------------
    # IP Address
    # --------------------------------

    if features.get("has_ip") == 1:

        score += 30

        reasons.append(
            "URL uses an IP address instead of a domain"
        )

    # --------------------------------
    # Suspicious Keywords
    # --------------------------------

    keyword_count = features.get(
        "suspicious_keyword_count",
        0,
    )

    if keyword_count > 0:

        keyword_score = min(
            keyword_count * 12,
            36,
        )

        score += keyword_score

        reasons.append(
            f"Contains {keyword_count} suspicious keyword(s)"
        )

    # --------------------------------
    # Brand Impersonation (FIXED)
    # --------------------------------

    for brand in BRANDS:

        if brand in hostname:

            legitimate = (
                hostname == f"{brand}.com"
                or hostname.endswith(
                    f".{brand}.com"
                )
                or hostname in TRUSTED_DOMAINS
            )

            if not legitimate:

                score += 20

                reasons.append(
                    f"Possible impersonation of {brand}"
                )

                break

    # --------------------------------
    # URL Shortener
    # --------------------------------

    if hostname in SHORTENERS:

        score += 15

        reasons.append(
            "URL uses a URL shortening service"
        )

    # --------------------------------
    # @ Symbol
    # --------------------------------

    if features.get(
        "has_at_symbol"
    ) == 1:

        score += 20

        reasons.append(
            "URL contains @ symbol"
        )

    # --------------------------------
    # Long URL
    # --------------------------------

    if features.get(
        "url_length",
        0,
    ) > 100:

        score += 10

        reasons.append(
            "URL is unusually long"
        )

    # --------------------------------
    # Multiple Subdomains
    # --------------------------------

    if features.get(
        "subdomain_count",
        0,
    ) >= 3:

        score += 10

        reasons.append(
            "URL contains many subdomains"
        )

    # --------------------------------
    # Encoded Characters
    # --------------------------------

    if features.get(
        "encoded_character_count",
        0,
    ) >= 3:

        score += 5

        reasons.append(
            "URL contains encoded characters"
        )

    # --------------------------------
    # Special Characters
    # --------------------------------

    if features.get(
        "special_character_count",
        0,
    ) >= 8:

        score += 5

        reasons.append(
            "URL contains many special characters"
        )

    # --------------------------------
    # Punycode
    # --------------------------------

    if features.get(
        "has_punycode"
    ) == 1:

        score += 15

        reasons.append(
            "Domain uses punycode"
        )

    # --------------------------------
    # Non-standard Port
    # --------------------------------

    if features.get(
        "has_nonstandard_port"
    ) == 1:

        score += 10

        reasons.append(
            "URL uses a non-standard port"
        )

    # --------------------------------
    # Deep Path
    # --------------------------------

    if features.get(
        "path_depth",
        0,
    ) >= 5:

        score += 5

        reasons.append(
            "URL has a deep path structure"
        )

    # --------------------------------
    # Hyphens
    # --------------------------------

    if features.get(
        "hyphen_count",
        0,
    ) >= 2:

        score += 15

        reasons.append(
            "Domain contains multiple hyphens"
        )

    # --------------------------------
    # Suspicious TLD
    # --------------------------------

    if features.get(
        "suspicious_tld",
        0,
    ) == 1:

        score += 15

        reasons.append(
            "Domain uses a suspicious top-level domain (TLD)"
        )

    # --------------------------------
    # Threat Intelligence
    # --------------------------------

    if threat_intelligence:

        if threat_intelligence.get(
            "url_match"
        ):

            score += 50

            reasons.append(
                "Exact URL found in threat intelligence database"
            )

        if threat_intelligence.get(
            "domain_match"
        ):

            score += 20

            reasons.append(
                "Domain found in threat intelligence database"
            )

        if threat_intelligence.get(
            "ip_match"
        ):

            score += 20

            reasons.append(
                "IP found in threat intelligence database"
            )

    # --------------------------------
    # Final Score
    # --------------------------------

    score = min(score, 100)

    if score >= 60:
        verdict = "PHISHING"
    elif score >= 20:
        verdict = "SUSPICIOUS"
    else:
        verdict = "SAFE"

    return {
        "risk_score": score,
        "verdict": verdict,
        "reasons": reasons,
    }