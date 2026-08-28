from urllib.parse import urlparse
import ipaddress
import re
import math
from collections import Counter


SUSPICIOUS_KEYWORDS = {
    "login",
    "signin",
    "verify",
    "verification",
    "account",
    "secure",
    "update",
    "password",
    "bank",
    "confirm",
    "banking",
    "authenticate",
    "wallet",
    "service",
    "portal",
}

SUSPICIOUS_TLDS = {
    ".xyz",
    ".top",
    ".tk",
    ".ml",
    ".ga",
    ".cf",
    ".gq",
    ".work",
    ".icu",
    ".buzz",
    ".club",
    ".surf",
    ".cam",
    ".rest",
    ".fit",
    ".cfd",
    ".sbs",
}


def calculate_entropy(text: str) -> float:
    """Calculate Shannon entropy for a given text string."""
    if not text:
        return 0.0
    entropy = 0.0
    length = len(text)
    for count in Counter(text).values():
        p = count / length
        entropy -= p * math.log2(p)
    return round(entropy, 4)


def extract_url_features(url: str) -> dict:
    """
    Extract security-related features from a URL.

    These features are used consistently across:
    - Heuristic Engine
    - Machine Learning Model (Training & Production Inference)
    - Threat Intelligence Engine
    """
    url_str = str(url).strip()
    parsed = urlparse(url_str)

    hostname = parsed.hostname or ""

    # --------------------------------
    # Detect IP Address
    # --------------------------------
    has_ip = 0
    try:
        ipaddress.ip_address(hostname)
        has_ip = 1
    except ValueError:
        pass

    # --------------------------------
    # Suspicious Keywords
    # --------------------------------
    lower_url = url_str.lower()
    keyword_matches = [
        keyword
        for keyword in SUSPICIOUS_KEYWORDS
        if keyword in lower_url
    ]

    # --------------------------------
    # Digit & Special Character Counts & Ratios
    # --------------------------------
    total_len = max(len(url_str), 1)
    digit_count = sum(character.isdigit() for character in url_str)
    special_character_count = sum(character in "@?=&%_-" for character in url_str)
    digit_ratio = round(digit_count / total_len, 4)
    special_character_ratio = round(special_character_count / total_len, 4)

    # --------------------------------
    # URL Encoded Characters
    # --------------------------------
    encoded_character_count = len(
        re.findall(r"%[0-9a-fA-F]{2}", url_str)
    )

    # --------------------------------
    # Subdomain Count & Entropy
    # --------------------------------
    if has_ip:
        subdomain_count = 0
        subdomain_entropy = 0.0
    else:
        domain_parts = hostname.split(".") if hostname else []
        subdomain_count = max(len(domain_parts) - 2, 0)
        subdomains_str = ".".join(domain_parts[:-2]) if subdomain_count > 0 else ""
        subdomain_entropy = calculate_entropy(subdomains_str)

    # --------------------------------
    # Punycode Detection
    # --------------------------------
    hostname_lower = hostname.lower()
    has_punycode = int("xn--" in hostname_lower)

    # --------------------------------
    # Suspicious TLD Detection
    # --------------------------------
    suspicious_tld = int(any(hostname_lower.endswith(tld) for tld in SUSPICIOUS_TLDS))

    # --------------------------------
    # Hyphen Count (Domain Only)
    # --------------------------------
    hyphen_count = hostname.count("-")

    # --------------------------------
    # Non-standard Port
    # --------------------------------
    has_nonstandard_port = 0
    try:
        if parsed.port is not None and parsed.port not in {80, 443}:
            has_nonstandard_port = 1
    except ValueError:
        has_nonstandard_port = 1

    # --------------------------------
    # Path Depth
    # --------------------------------
    path_segments = [segment for segment in parsed.path.split("/") if segment]
    path_depth = len(path_segments)

    # --------------------------------
    # Entropy Analysis
    # --------------------------------
    hostname_entropy = calculate_entropy(hostname)

    # --------------------------------
    # Return Unified Feature Vector
    # --------------------------------
    return {
        # Raw URL Info (metadata)
        "hostname": hostname,

        # Length Features
        "url_length": len(url_str),
        "domain_length": len(hostname),
        "path_length": len(parsed.path),
        "query_length": len(parsed.query),

        # Security Features
        "has_https": int(parsed.scheme.lower() == "https"),
        "has_ip": has_ip,
        "has_at_symbol": int("@" in url_str),

        # Structure Features
        "dot_count": url_str.count("."),
        "hyphen_count": hyphen_count,
        "digit_count": digit_count,
        "subdomain_count": subdomain_count,
        "path_depth": path_depth,

        # Advanced Statistical & Pattern Features
        "has_punycode": has_punycode,
        "has_nonstandard_port": has_nonstandard_port,
        "special_character_count": special_character_count,
        "encoded_character_count": encoded_character_count,
        "hostname_entropy": hostname_entropy,
        "digit_ratio": digit_ratio,
        "special_character_ratio": special_character_ratio,
        "suspicious_tld": suspicious_tld,
        "subdomain_entropy": subdomain_entropy,

        # Keyword Analysis
        "suspicious_keyword_count": len(keyword_matches),
        "suspicious_keywords": keyword_matches,
    }