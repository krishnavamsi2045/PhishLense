from datetime import datetime, timezone
from urllib.parse import urlparse


def normalize_url(url: str) -> str:
    """Normalize a URL for consistent threat-intelligence matching."""

    return url.strip().rstrip("/").lower()


def normalize_domain(domain: str) -> str:
    """Normalize a domain name."""

    return domain.strip().lower().rstrip(".")


def normalize_ip(ip: str) -> str:
    """Normalize an IP address."""

    return ip.strip()


def create_threat_record(
    source: str,
    indicator_type: str,
    indicator: str,
    confidence: str = "unknown",
) -> dict:
    """
    Convert a threat-intelligence indicator into
    PhishLense's standard internal format.
    """

    indicator_type = indicator_type.lower()

    if indicator_type == "url":
        normalized_indicator = normalize_url(indicator)

    elif indicator_type == "domain":
        normalized_indicator = normalize_domain(indicator)

    elif indicator_type == "ip":
        normalized_indicator = normalize_ip(indicator)

    else:
        raise ValueError(
            f"Unsupported indicator type: {indicator_type}"
        )

    return {
        "source": source,
        "indicator_type": indicator_type,
        "indicator": normalized_indicator,
        "confidence": confidence,
        "first_seen": None,
        "last_seen": datetime.now(timezone.utc).isoformat(),
    }