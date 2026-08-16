import json
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parent

URL_FILE = (
    PROJECT_ROOT
    / "data"
    / "threat_intelligence"
    / "malicious_urls.json"
)

BACKUP_FILE = (
    PROJECT_ROOT
    / "data"
    / "threat_intelligence"
    / "malicious_urls.backup.json"
)


def clean_url(value: str) -> str:
    """Convert Markdown-style URL into a plain URL."""

    value = value.strip()

    if value.startswith("[") and "](" in value and value.endswith(")"):
        parts = value.split("](", 1)

        if len(parts) == 2:
            value = parts[1]

            if value.endswith(")"):
                value = value[:-1]

    return value.strip()


def repair_urls():
    """Repair the local malicious URL database."""

    if not URL_FILE.exists():
        print("ERROR: malicious_urls.json not found.")
        return

    # Load existing data
    with open(
        URL_FILE,
        "r",
        encoding="utf-8",
    ) as file:
        urls = json.load(file)

    # Create backup
    with open(
        BACKUP_FILE,
        "w",
        encoding="utf-8",
    ) as file:
        json.dump(
            urls,
            file,
            indent=2,
        )

    cleaned_urls = []

    for url in urls:
        cleaned_url = clean_url(url)

        if cleaned_url not in cleaned_urls:
            cleaned_urls.append(cleaned_url)

    # Save cleaned data
    with open(
        URL_FILE,
        "w",
        encoding="utf-8",
    ) as file:
        json.dump(
            cleaned_urls,
            file,
            indent=2,
        )

    print("Original URLs:", len(urls))
    print("Cleaned URLs:", len(cleaned_urls))
    print("Backup created:", BACKUP_FILE)


if __name__ == "__main__":
    repair_urls()