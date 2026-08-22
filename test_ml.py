from backend.analyzer.features.url_features import (
    extract_url_features
)

from backend.analyzer.ml.predictor import (
    predict
)

url = "http://paypal-security-login.com"

features = extract_url_features(url)

result = predict(features)

print(result)