import json
from pathlib import Path

from analyzer.threat_intelligence.feed_normalizer import (
    create_threat_record,
)


PROJECT_ROOT = Path(__file__).resolve().parents[2]

THREAT_INTEL_DIR = PROJECT_ROOT / "data" / "threat_intelligence"


FILE_MAP = {
    "url": "malicious_urls.json",
    "domain": "malicious_domains.json",
    "ip": "malicious_ips.json",
}


def load_indicators(indicator_type: str) -> list:
    """Load existing indicators from the local threat-intelligence store."""

    if indicator_type not in FILE_MAP:
        raise ValueError(
            f"Unsupported indicator type: {indicator_type}"
        )

    file_path = THREAT_INTEL_DIR / FILE_MAP[indicator_type]

    if not file_path.exists():
        return []

    with open(file_path, "r", encoding="utf-8") as file:
        return json.load(file)


def save_indicators(indicator_type: str, indicators: list) -> None:
    """Save indicators to the local threat-intelligence store."""

    if indicator_type not in FILE_MAP:
        raise ValueError(
            f"Unsupported indicator type: {indicator_type}"
        )

    THREAT_INTEL_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    file_path = THREAT_INTEL_DIR / FILE_MAP[indicator_type]

    with open(file_path, "w", encoding="utf-8") as file:
        json.dump(
            indicators,
            file,
            indent=2,
        )


def add_indicator(
    source: str,
    indicator_type: str,
    indicator: str,
    confidence: str = "unknown",
) -> dict:
    """
    Normalize and add a threat indicator to the local store.

    Duplicate indicators are not added again.
    """

    record = create_threat_record(
        source=source,
        indicator_type=indicator_type,
        indicator=indicator,
        confidence=confidence,
    )

    indicators = load_indicators(indicator_type)

    existing_indicators = {
        item.lower()
        for item in indicators
    }

    normalized_indicator = record["indicator"]

    if normalized_indicator.lower() in existing_indicators:
        return {
            "added": False,
            "reason": "Indicator already exists",
            "record": record,
        }

    indicators.append(normalized_indicator)

    save_indicators(
        indicator_type,
        indicators,
    )

    return {
        "added": True,
        "reason": "Indicator added",
        "record": record,
    }