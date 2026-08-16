import json
from pathlib import Path

from analyzer.threat_intelligence.feed_manager import add_indicator


PROJECT_ROOT = Path(__file__).resolve().parents[2]

RAW_FEED_DIR = (
    PROJECT_ROOT
    / "data"
    / "threat_intelligence"
    / "raw"
)


def import_phishtank_feed() -> dict:
    """
    Import phishing URLs from the downloaded PhishTank JSON feed.

    The importer:
    1. Reads the raw feed.
    2. Extracts phishing URLs.
    3. Adds them through the Feed Manager.
    4. Prevents duplicates.
    """

    feed_file = RAW_FEED_DIR / "phishtank.json"

    if not feed_file.exists():
        return {
            "source": "PhishTank",
            "status": "missing",
            "message": "PhishTank feed file was not found.",
            "imported": 0,
        }

    with open(feed_file, "r", encoding="utf-8") as file:
        data = json.load(file)

    imported = 0
    skipped = 0

    for entry in data:

        phishing_url = entry.get("url")

        if not phishing_url:
            skipped += 1
            continue

        result = add_indicator(
            source="PhishTank",
            indicator_type="url",
            indicator=phishing_url,
            confidence="high",
        )

        if result["added"]:
            imported += 1
        else:
            skipped += 1

    return {
        "source": "PhishTank",
        "status": "success",
        "imported": imported,
        "skipped": skipped,
        "total_records": len(data),
    }