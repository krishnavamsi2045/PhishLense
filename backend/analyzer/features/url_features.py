from urllib.parse import urlparse
import ipaddress
import re


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
}


def extract_url_features(url: str) -> dict:
    """
    Extract security-related features from a URL.

    These features are used by:
    - Heuristic Engine
    - Machine Learning Model
    - Threat Intelligence Engine
    """

    parsed = urlparse(url)

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

    lower_url = url.lower()

    keyword_matches = [
        keyword
        for keyword in SUSPICIOUS_KEYWORDS
        if keyword in lower_url
    ]

    # --------------------------------
    # Digit Count
    # --------------------------------

    digit_count = sum(
        character.isdigit()
        for character in url
    )

    # --------------------------------
    # Special Characters
    # --------------------------------

    special_character_count = sum(
        character in "@?=&%_-"
        for character in url
    )

    # --------------------------------
    # URL Encoded Characters
    # --------------------------------

    encoded_character_count = len(
        re.findall(
            r"%[0-9a-fA-F]{2}",
            url
        )
    )

    # --------------------------------
    # Subdomain Count
    # --------------------------------

    if has_ip:
        subdomain_count = 0
    else:
        domain_parts = (
            hostname.split(".")
            if hostname
            else []
        )

        subdomain_count = max(
            len(domain_parts) - 2,
            0
        )

    # --------------------------------
    # Punycode Detection
    # --------------------------------

    hostname_lower = hostname.lower()

    has_punycode = int(
        "xn--" in hostname_lower
    )

    # --------------------------------
    # Hyphen Count (Domain Only)
    # --------------------------------

    hyphen_count = hostname.count("-")

    # --------------------------------
    # Non-standard Port
    # --------------------------------

    has_nonstandard_port = 0

    try:

        if (
            parsed.port is not None
            and parsed.port not in {80, 443}
        ):
            has_nonstandard_port = 1

    except ValueError:
        has_nonstandard_port = 1

    # --------------------------------
    # Path Depth
    # --------------------------------

    path_segments = [
        segment
        for segment in parsed.path.split("/")
        if segment
    ]

    path_depth = len(path_segments)

    # --------------------------------
    # Return Features
    # --------------------------------

    return {

        # Raw URL Info
        "hostname": hostname,

        # Length Features
        "url_length": len(url),
        "domain_length": len(hostname),
        "path_length": len(parsed.path),
        "query_length": len(parsed.query),

        # Security Features
        "has_https": int(
            parsed.scheme.lower() == "https"
        ),
        "has_ip": has_ip,
        "has_at_symbol": int(
            "@" in url
        ),

        # Structure Features
        "dot_count": url.count("."),
        "hyphen_count": hyphen_count,
        "digit_count": digit_count,
        "subdomain_count": subdomain_count,
        "path_depth": path_depth,

        # Advanced Features
        "has_punycode": has_punycode,
        "has_nonstandard_port": has_nonstandard_port,
        "special_character_count": special_character_count,
        "encoded_character_count": encoded_character_count,

        # Keyword Analysis
        "suspicious_keyword_count": len(
            keyword_matches
        ),
        "suspicious_keywords": keyword_matches,
    }