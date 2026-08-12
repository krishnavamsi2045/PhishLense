import json
from pathlib import Path
from urllib.parse import urlparse


# Project root:
# PhishLense/analyzer/threat_intelligence/
PROJECT_ROOT = Path(__file__).resolve().parents[2]

THREAT_INTEL_DIR = PROJECT_ROOT / "data" / "threat_intelligence"


def load_json_file(filename: str) -> list:
    """Load a threat-intelligence JSON dataset."""

    file_path = THREAT_INTEL_DIR / filename

    if not file_path.exists():
        return []

    with open(file_path, "r", encoding="utf-8") as file:
        return json.load(file)


def check_threat_intelligence(url: str) -> dict:
    """
    Check a URL against local threat-intelligence datasets.

    Checks:
    - Exact malicious URL
    - Malicious domain
    - Malicious IP
    """

    parsed = urlparse(url)

    hostname = (parsed.hostname or "").lower()

    normalized_url = url.rstrip("/").lower()

    malicious_domains = {
        domain.lower()
        for domain in load_json_file("malicious_domains.json")
    }

    malicious_ips = {
        ip.lower()
        for ip in load_json_file("malicious_ips.json")
    }

    malicious_urls = {
        item.rstrip("/").lower()
        for item in load_json_file("malicious_urls.json")
    }

    url_match = normalized_url in malicious_urls
    domain_match = hostname in malicious_domains
    ip_match = hostname in malicious_ips

    matches = []

    if url_match:
        matches.append("URL found in threat-intelligence database")

    if domain_match:
        matches.append("Domain found in threat-intelligence database")

    if ip_match:
        matches.append("IP address found in threat-intelligence database")

    return {
        "threat_intelligence_match": bool(matches),
        "url_match": url_match,
        "domain_match": domain_match,
        "ip_match": ip_match,
        "matches": matches,
    }