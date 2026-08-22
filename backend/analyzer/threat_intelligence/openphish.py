import requests

OPENPHISH_FEED = (
    "https://openphish.com/feed.txt"
)

_cached_urls = set()


def load_feed():

    global _cached_urls

    try:

        response = requests.get(
            OPENPHISH_FEED,
            timeout=20,
        )

        if response.status_code == 200:

            _cached_urls = set(
                line.strip().lower()
                for line in response.text.splitlines()
                if line.strip()
            )

    except Exception as error:

        print(
            "OpenPhish Error:",
            error,
        )


def check_openphish(url: str):

    if not _cached_urls:
        load_feed()

    return (
        url.lower().strip("/")
        in {
            u.strip("/")
            for u in _cached_urls
        }
    )