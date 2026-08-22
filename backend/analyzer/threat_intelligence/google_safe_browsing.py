import requests
import os


API_KEY = os.getenv(
    "GOOGLE_SAFE_BROWSING_KEY"
)


def check_google_safe_browsing(url):

    if not API_KEY:
        return False

    endpoint = (
        "https://safebrowsing.googleapis.com"
        "/v4/threatMatches:find"
    )

    payload = {
        "client": {
            "clientId": "PhishLense",
            "clientVersion": "2.0"
        },
        "threatInfo": {
            "threatTypes": [
                "MALWARE",
                "SOCIAL_ENGINEERING"
            ],
            "platformTypes": [
                "ANY_PLATFORM"
            ],
            "threatEntryTypes": [
                "URL"
            ],
            "threatEntries": [
                {"url": url}
            ]
        }
    }

    r = requests.post(
        f"{endpoint}?key={API_KEY}",
        json=payload,
        timeout=10,
    )

    data = r.json()

    return bool(
        data.get("matches")
    )