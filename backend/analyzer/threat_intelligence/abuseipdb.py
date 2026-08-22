import requests
import os

API_KEY = os.getenv(
    "ABUSEIPDB_API_KEY"
)


def check_ip(ip):

    if not API_KEY:

        return {
            "available": False
        }

    try:

        response = requests.get(
            "https://api.abuseipdb.com/api/v2/check",
            headers={
                "Key": API_KEY,
                "Accept": "application/json",
            },
            params={
                "ipAddress": ip
            },
            timeout=10,
        )

        data = response.json()

        return {

            "available": True,

            "abuse_score":
                data["data"][
                    "abuseConfidenceScore"
                ],
        }

    except Exception:

        return {
            "available": False
        }