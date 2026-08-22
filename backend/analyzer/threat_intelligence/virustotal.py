import os
import base64
import requests

from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("VT_API_KEY")

BASE_URL = "https://www.virustotal.com/api/v3"


def submit_url(url: str):
    """
    Submit URL to VirusTotal for scanning.
    """

    if not API_KEY:
        return {
            "submitted": False,
            "error": "VirusTotal API key not configured"
        }

    try:

        response = requests.post(
            f"{BASE_URL}/urls",
            headers={
                "x-apikey": API_KEY
            },
            data={
                "url": url
            },
            timeout=20
        )

        if response.status_code in [200, 202]:

            analysis_id = (
                response.json()
                .get("data", {})
                .get("id")
            )

            return {
                "submitted": True,
                "analysis_id": analysis_id
            }

        return {
            "submitted": False,
            "status_code": response.status_code,
            "error": response.text
        }

    except Exception as error:

        return {
            "submitted": False,
            "error": str(error)
        }


def scan_url(url: str):
    """
    Scan URL using VirusTotal.

    Returns:
    - malicious count
    - suspicious count
    - harmless count
    - undetected count
    - reputation
    - community votes
    - threat level
    - confidence score
    """

    if not API_KEY:

        return {
            "available": False,
            "error": "VirusTotal API key not configured"
        }

    try:

        url_id = (
            base64.urlsafe_b64encode(
                url.encode()
            )
            .decode()
            .strip("=")
        )

        headers = {
            "x-apikey": API_KEY
        }

        response = requests.get(
            f"{BASE_URL}/urls/{url_id}",
            headers=headers,
            timeout=20
        )

        # ----------------------------------
        # URL NOT FOUND
        # ----------------------------------

        if response.status_code == 404:

            submission = submit_url(url)

            return {
                "available": True,
                "submitted_for_scan": submission.get(
                    "submitted",
                    False
                ),
                "message": "URL not found in VirusTotal database",
                "malicious": 0,
                "suspicious": 0,
                "harmless": 0,
                "undetected": 0,
                "engines_checked": 0,
                "threat_level": "UNKNOWN"
            }

        # ----------------------------------
        # API ERROR
        # ----------------------------------

        if response.status_code != 200:

            return {
                "available": False,
                "status_code": response.status_code,
                "error": response.text
            }

        # ----------------------------------
        # PARSE RESPONSE
        # ----------------------------------

        data = response.json()

        attributes = (
            data["data"]["attributes"]
        )

        stats = (
            attributes["last_analysis_stats"]
        )

        votes = attributes.get(
            "total_votes",
            {}
        )

        reputation = attributes.get(
            "reputation",
            0
        )

        timestamp = attributes.get(
            "last_analysis_date"
        )

        if timestamp:

            last_analysis_date = (
                datetime.utcfromtimestamp(
                    timestamp
                ).strftime(
                    "%Y-%m-%d %H:%M:%S UTC"
                )
            )

        else:

            last_analysis_date = None

        malicious = stats.get(
            "malicious",
            0
        )

        suspicious = stats.get(
            "suspicious",
            0
        )

        harmless = stats.get(
            "harmless",
            0
        )

        undetected = stats.get(
            "undetected",
            0
        )

        total_engines = (
            malicious +
            suspicious +
            harmless +
            undetected
        )

        detection_ratio = (
            f"{malicious}/{total_engines}"
            if total_engines > 0
            else "0/0"
        )

        confidence_score = 0

        if total_engines > 0:

            confidence_score = round(
                (
                    malicious +
                    suspicious
                )
                / total_engines
                * 100,
                2,
            )

        # ----------------------------------
        # THREAT LEVEL
        # ----------------------------------

        if malicious >= 15:

            threat_level = "CRITICAL"

        elif malicious >= 8:

            threat_level = "HIGH"

        elif malicious >= 3:

            threat_level = "MEDIUM"

        elif malicious >= 1:

            threat_level = "LOW"

        elif suspicious > 0:

            threat_level = "SUSPICIOUS"

        else:

            threat_level = "NONE"

        # ----------------------------------
        # RETURN
        # ----------------------------------

        return {

            "available": True,

            "reputation":
                reputation,

            "threat_level":
                threat_level,

            "confidence_score":
                confidence_score,

            "detection_ratio":
                detection_ratio,

            "last_analysis_date":
                last_analysis_date,

            "community_votes": {

                "harmless":
                    votes.get(
                        "harmless",
                        0
                    ),

                "malicious":
                    votes.get(
                        "malicious",
                        0
                    ),
            },

            "malicious":
                malicious,

            "suspicious":
                suspicious,

            "harmless":
                harmless,

            "undetected":
                undetected,

            "engines_checked":
                total_engines,
        }

    except requests.Timeout:

        return {
            "available": False,
            "error": "VirusTotal timeout"
        }

    except requests.ConnectionError:

        return {
            "available": False,
            "error": "Connection error"
        }

    except Exception as error:

        return {
            "available": False,
            "error": str(error)
        }