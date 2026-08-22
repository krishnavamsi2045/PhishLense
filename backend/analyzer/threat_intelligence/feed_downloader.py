import os
from pathlib import Path

import requests


PROJECT_ROOT = Path(__file__).resolve().parents[2]

RAW_FEED_DIR = (
    PROJECT_ROOT
    / "data"
    / "threat_intelligence"
    / "raw"
)


PHISHTANK_URL = (
    "https://data.phishtank.com/data/online-valid.json"
)


def download_phishtank_feed() -> dict:
    """
    Download the current PhishTank JSON feed.

    The application key is optional for limited/manual use.
    For automated downloads, use a registered
    PhishTank application key.
    """

    app_key = os.getenv("PHISHTANK_API_KEY")

    if app_key:
        url = (
            f"https://data.phishtank.com/data/"
            f"{app_key}/online-valid.json"
        )
    else:
        url = PHISHTANK_URL

    headers = {
        "User-Agent": "PhishLense/1.0"
    }

    RAW_FEED_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    output_file = RAW_FEED_DIR / "phishtank.json"

    response = requests.get(
        url,
        headers=headers,
        timeout=30,
    )

    if response.status_code == 429:
        return {
            "source": "PhishTank",
            "status": "rate_limited",
            "message": (
                "PhishTank rate limit reached. "
                "Use a registered application key "
                "for automated downloads."
            ),
        }

    response.raise_for_status()

    output_file.write_bytes(response.content)

    return {
        "source": "PhishTank",
        "status": "success",
        "file": str(output_file),
        "bytes": len(response.content),
    }