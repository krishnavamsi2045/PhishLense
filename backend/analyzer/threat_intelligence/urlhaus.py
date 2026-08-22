import requests


def check_urlhaus(url):

    try:

        response = requests.post(
            "https://urlhaus-api.abuse.ch/v1/url/",
            data={
                "url": url
            },
            timeout=15,
        )

        data = response.json()

        if (
            data.get("query_status")
            == "ok"
        ):

            return {

                "found": True,

                "threat":
                    data.get(
                        "threat",
                        "",
                    ),

                "url_status":
                    data.get(
                        "url_status",
                        "",
                    ),
            }

    except Exception:
        pass

    return {
        "found": False
    }