import json
from pathlib import Path
from urllib.parse import urlparse

from backend.analyzer.threat_intelligence.virustotal import scan_url

from backend.analyzer.threat_intelligence.google_safe_browsing import (
    check_google_safe_browsing,
)

from backend.analyzer.threat_intelligence.openphish import (
    check_openphish,
)

PROJECT_ROOT = Path(__file__).resolve().parents[2]

THREAT_INTEL_DIR = (
    PROJECT_ROOT
    / "data"
    / "threat_intelligence"
)


def load_json_file(filename: str):

    file_path = THREAT_INTEL_DIR / filename

    if not file_path.exists():
        return []

    with open(
        file_path,
        "r",
        encoding="utf-8"
    ) as file:

        return json.load(file)


def check_local_feeds(url: str):

    parsed = urlparse(url)

    hostname = (
        parsed.hostname or ""
    ).lower()

    normalized_url = (
        url.rstrip("/")
        .lower()
    )

    malicious_domains = {
        domain.lower()
        for domain in load_json_file(
            "malicious_domains.json"
        )
    }

    malicious_ips = {
        ip.lower()
        for ip in load_json_file(
            "malicious_ips.json"
        )
    }

    malicious_urls = {
        item.rstrip("/")
        .lower()
        for item in load_json_file(
            "malicious_urls.json"
        )
    }

    return {
        "url_match":
            normalized_url
            in malicious_urls,

        "domain_match":
            hostname
            in malicious_domains,

        "ip_match":
            hostname
            in malicious_ips,
    }


def check_threat_intelligence(url: str):

    matches = []

    # --------------------------
    # LOCAL FEEDS
    # --------------------------

    local = check_local_feeds(url)

    if local["url_match"]:

        matches.append(
            "Local Threat Feed URL Match"
        )

    if local["domain_match"]:

        matches.append(
            "Local Threat Feed Domain Match"
        )

    if local["ip_match"]:

        matches.append(
            "Local Threat Feed IP Match"
        )

    # --------------------------
    # VIRUSTOTAL
    # --------------------------

    vt = scan_url(url)

    if (
        vt.get("available")
        and vt.get(
            "malicious",
            0
        ) > 0
    ):

        matches.append(
            f"VirusTotal ({vt['malicious']} engines)"
        )

    # --------------------------
    # GOOGLE SAFE BROWSING
    # --------------------------

    gsb = check_google_safe_browsing(url)

    if (gsb.get("matched") if isinstance(gsb, dict) else bool(gsb)):

        matches.append(
            "Google Safe Browsing"
        )

    # --------------------------
    # OPENPHISH
    # --------------------------

    op = check_openphish(url)

    if (op.get("matched") if isinstance(op, dict) else bool(op)):

        matches.append(
            "OpenPhish Feed"
        )

    return {

        "threat_intelligence_match":
            len(matches) > 0,

        "url_match":
            local["url_match"],

        "domain_match":
            local["domain_match"],

        "ip_match":
            local["ip_match"],

        "matches":
            matches,

        "virustotal":
            vt,

        "google_safe_browsing":
            gsb,

        "openphish":
            op,
    }