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
    Extract measurable security-related features from a URL.
    These features will later be used by the heuristic engine
    and machine-learning models.
    """

    parsed = urlparse(url)
    hostname = parsed.hostname or ""

    # Detect IP address
    has_ip = 0

    try:
        ipaddress.ip_address(hostname)
        has_ip = 1
    except ValueError:
        pass

    # Suspicious keywords
    lower_url = url.lower()

    keyword_matches = [
        keyword
        for keyword in SUSPICIOUS_KEYWORDS
        if keyword in lower_url
    ]

    # Count digits and special characters
    digit_count = sum(character.isdigit() for character in url)

    special_character_count = sum(
        character in "@?=&%_-"
        for character in url
    )

    # URL encoding
    encoded_character_count = len(
        re.findall(r"%[0-9a-fA-F]{2}", url)
    )

    # Domain/subdomain information
    if has_ip:
        subdomain_count = 0
    else:
        domain_parts = hostname.split(".") if hostname else []
        subdomain_count = max(len(domain_parts) - 2, 0)
    # Suspicious domain characteristics
    hostname_lower = hostname.lower()

    has_punycode = int("xn--" in hostname_lower)

    hyphen_count = hostname.count("-")

    # Detect explicit port numbers
    has_nonstandard_port = 0

    try:
        if parsed.port is not None and parsed.port not in {80, 443}:
            has_nonstandard_port = 1
    except ValueError:
        has_nonstandard_port = 1

    # Count path segments
    path_segments = [
        segment for segment in parsed.path.split("/")
        if segment
    ]

    path_depth = len(path_segments)

    return {
        "url_length": len(url),
        "domain_length": len(hostname),
        "path_length": len(parsed.path),
        "query_length": len(parsed.query),

        "has_https": int(parsed.scheme.lower() == "https"),
        "has_ip": has_ip,
        "has_at_symbol": int("@" in url),

        "dot_count": url.count("."),
        "hyphen_count": url.count("-"),
        "digit_count": digit_count,

        "subdomain_count": subdomain_count,
        
        "has_punycode": has_punycode,
        "has_nonstandard_port": has_nonstandard_port,
        "path_depth": path_depth,

        "special_character_count": special_character_count,
        "encoded_character_count": encoded_character_count,

        "suspicious_keyword_count": len(keyword_matches),
        "suspicious_keywords": keyword_matches,
    }