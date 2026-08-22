import whois

from datetime import datetime
from urllib.parse import urlparse

from backend.analyzer.features.url_features import (
    extract_url_features,
)

from backend.analyzer.heuristics.heuristic_engine import (
    calculate_risk_score,
)

from backend.analyzer.threat_intelligence.threat_intel_engine import (
    check_threat_intelligence,
)

from backend.analyzer.threat_intelligence.virustotal import (
    scan_url,
)

from backend.analyzer.threat_intelligence.openphish import (
    check_openphish,
)

from backend.analyzer.threat_intelligence.ssl_checker import (
    check_ssl,
)

from backend.analyzer.ml.predictor import (
    predict,
)


# =====================================================
# DOMAIN AGE
# =====================================================

def get_domain_age(domain):

    try:

        w = whois.whois(domain)

        creation = w.creation_date

        if isinstance(creation, list):
            creation = creation[0]

        if creation:

            return (
                datetime.now(creation.tzinfo)
                - creation
            ).days

    except Exception as error:

        print("WHOIS Error:", error)

    return None


# =====================================================
# MAIN ANALYZER
# =====================================================

def analyze_url(url: str):

    parsed = urlparse(url)

    domain = parsed.hostname or ""

    risk_score = 0

    reasons = []

    detection_sources = []

    # =====================================================
    # FEATURE EXTRACTION
    # =====================================================

    features = extract_url_features(url)

    # =====================================================
    # LOCAL THREAT INTEL
    # =====================================================

    threat_intelligence = (
        check_threat_intelligence(url)
    )

    heuristic_result = (
        calculate_risk_score(
            features,
            threat_intelligence,
        )
    )

    risk_score += heuristic_result[
        "risk_score"
    ]

    reasons.extend(
        heuristic_result["reasons"]
    )

    if (
        threat_intelligence[
            "threat_intelligence_match"
        ]
    ):
        detection_sources.append(
            "Threat Intelligence Feed"
        )

    # =====================================================
    # DOMAIN AGE
    # =====================================================

    domain_age = get_domain_age(
        domain
    )

    if domain_age is not None:

        if domain_age < 7:

            risk_score += 40

            reasons.append(
                "Domain registered within last 7 days"
            )

        elif domain_age < 30:

            risk_score += 30

            reasons.append(
                "Domain registered less than 30 days ago"
            )

        elif domain_age < 180:

            risk_score += 15

            reasons.append(
                "Recently registered domain"
            )

    # =====================================================
    # SSL CHECK
    # =====================================================

    ssl_result = check_ssl(domain)

    if not ssl_result.get(
        "valid",
        False,
    ):

        risk_score += 20

        reasons.append(
            "Invalid SSL certificate"
        )

    else:

        days_left = ssl_result.get(
            "days_left",
            999,
        )

        if days_left < 15:

            risk_score += 10

            reasons.append(
                "SSL certificate expiring soon"
            )

    # =====================================================
    # OPENPHISH
    # =====================================================

    try:

        if check_openphish(url):

            risk_score += 50

            reasons.append(
                "URL found in OpenPhish database"
            )

            detection_sources.append(
                "OpenPhish"
            )

    except Exception as error:

        print(
            "OpenPhish Error:",
            error,
        )

    # =====================================================
    # VIRUSTOTAL
    # =====================================================

    virus_total = scan_url(url)

    if virus_total.get(
        "available"
    ):

        malicious = virus_total.get(
            "malicious",
            0,
        )

        suspicious = virus_total.get(
            "suspicious",
            0,
        )

        if malicious >= 10:

            risk_score += 50

        elif malicious >= 5:

            risk_score += 35

        elif malicious >= 1:

            risk_score += 20

        if suspicious > 0:

            risk_score += 10

        if malicious > 0:

            reasons.append(
                f"VirusTotal flagged by {malicious} engines"
            )

            detection_sources.append(
                "VirusTotal"
            )

    # =====================================================
    # MACHINE LEARNING
    # =====================================================

    ml_prediction = predict(
        features
    )

    ml_label = (
        ml_prediction[
            "prediction"
        ]
    )

    ml_confidence = (
        ml_prediction[
            "confidence"
        ]
    )

    if (
        ml_label == "Phishing"
        and ml_confidence >= 80
    ):

        risk_score += 25

        reasons.append(
            "ML model strongly predicts phishing"
        )

        detection_sources.append(
            "Machine Learning"
        )

    elif (
        ml_label == "Phishing"
        and ml_confidence >= 60
    ):

        risk_score += 15

        reasons.append(
            "ML model predicts phishing"
        )

        detection_sources.append(
            "Machine Learning"
        )

    # =====================================================
    # NORMALIZE SCORE
    # =====================================================

    risk_score = min(
        risk_score,
        100,
    )

    # =====================================================
    # FINAL VERDICT
    # =====================================================

    if risk_score >= 60:
        final_verdict = "PHISHING"
    elif risk_score >= 25:
        final_verdict = "SUSPICIOUS"
    else:
        final_verdict = "SAFE"

    # =====================================================
    # SEVERITY
    # =====================================================

    if risk_score >= 90:

        severity = (
            "CRITICAL"
        )

    elif risk_score >= 75:

        severity = (
            "HIGH"
        )

    elif risk_score >= 50:

        severity = (
            "MEDIUM"
        )

    elif risk_score >= 25:

        severity = (
            "LOW"
        )

    else:

        severity = (
            "MINIMAL"
        )

    # =====================================================
    # RECOMMENDATION ENGINE
    # =====================================================

    if risk_score >= 75:

        recommendation = (
            "Do NOT visit this URL."
        )

    elif risk_score >= 50:

        recommendation = (
            "Proceed with extreme caution."
        )

    elif risk_score >= 25:

        recommendation = (
            "Verify legitimacy before opening."
        )

    else:

        recommendation = (
            "URL appears safe."
        )

    # =====================================================
    # CONFIDENCE SCORE
    # =====================================================

    confidence = min(
        100,
        len(detection_sources) * 25
        + int(ml_confidence / 2),
    )

    # =====================================================
    # RESPONSE
    # =====================================================

    return {

        "url": url,

        "final_verdict":
            final_verdict,

        "severity":
            severity,

        "risk_score":
            risk_score,

        "confidence":
            confidence,

        "recommendation":
            recommendation,

        "heuristic_verdict":
            heuristic_result[
                "verdict"
            ],

        "ml_prediction":
            ml_prediction,

        "domain_age_days":
            domain_age,

        "virus_total":
            virus_total,

        "ssl":
            ssl_result,

        "reasons":
            reasons,

        "detection_sources":
            detection_sources,

        "features":
            features,

        "threat_intelligence":
            threat_intelligence,
    }