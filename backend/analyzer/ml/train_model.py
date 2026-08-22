# analyzer/ml/train_model.py

from pathlib import Path

import joblib
import pandas as pd

from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.append(str(ROOT))

from analyzer.features.url_features import extract_url_features


def train_model():

    project_root = Path(__file__).resolve().parents[2]

    dataset_path = (
        project_root
        / "data"
        / "datasets"
        / "phishing_urls.csv"
    )

    model_dir = (
        project_root
        / "data"
        / "models"
    )

    model_dir.mkdir(
        parents=True,
        exist_ok=True,
    )

    print(f"Loading dataset: {dataset_path}")

    df = pd.read_csv(dataset_path)

    # -----------------------------
    # Detect URL Column
    # -----------------------------

    url_column = None

    possible_columns = [
        "url",
        "URL",
        "link",
        "Link",
        "domain",
        "Domain",
    ]

    for column in possible_columns:
        if column in df.columns:
            url_column = column
            break

    if url_column is None:
        raise ValueError(
            f"URL column not found.\n"
            f"Available columns: {list(df.columns)}"
        )

    # -----------------------------
    # Detect Label Column
    # -----------------------------

    label_column = None

    possible_labels = [
        "label",
        "Label",
        "class",
        "Class",
        "target",
        "Target",
    ]

    for column in possible_labels:
        if column in df.columns:
            label_column = column
            break

    if label_column is None:
        raise ValueError(
            f"Label column not found.\n"
            f"Available columns: {list(df.columns)}"
        )

    # -----------------------------
    # Feature Extraction
    # -----------------------------

    feature_rows = []

    for url in df[url_column]:

        try:

            features = extract_url_features(
                str(url)
            )

            # Remove text fields
            features.pop(
                "hostname",
                None,
            )

            features.pop(
                "suspicious_keywords",
                None,
            )

            feature_rows.append(
                features
            )

        except Exception as error:

            print(
                f"Skipping URL: {url}"
            )

            print(error)

    X = pd.DataFrame(
        feature_rows
    )

    y = df[label_column]

    print("\nFeatures:")
    print(list(X.columns))

    # -----------------------------
    # Train/Test Split
    # -----------------------------

    X_train, X_test, y_train, y_test = (
        train_test_split(
            X,
            y,
            test_size=0.2,
            random_state=42,
            stratify=y,
        )
    )

    # -----------------------------
    # Train Model
    # -----------------------------

    model = RandomForestClassifier(
        n_estimators=200,
        random_state=42,
    )

    model.fit(
        X_train,
        y_train,
    )

    # -----------------------------
    # Evaluate
    # -----------------------------

    predictions = model.predict(
        X_test
    )

    accuracy = accuracy_score(
        y_test,
        predictions,
    )

    print(
        f"\nAccuracy: {accuracy * 100:.2f}%"
    )

    # -----------------------------
    # Save Model
    # -----------------------------

    model_path = (
        model_dir
        / "phishing_model.pkl"
    )

    columns_path = (
        model_dir
        / "feature_columns.pkl"
    )

    joblib.dump(
        model,
        model_path,
    )

    joblib.dump(
        list(X.columns),
        columns_path,
    )

    print(
        f"\nModel saved to: {model_path}"
    )

    print(
        f"Columns saved to: {columns_path}"
    )


if __name__ == "__main__":
    train_model()