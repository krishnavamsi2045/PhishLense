from fastapi import FastAPI
from pydantic import BaseModel

from analyzer.url_analyzer import analyze_url


app = FastAPI(
    title="PhishLense API",
    description="Phishing URL detection and security analysis API",
    version="1.0.0",
)


class URLRequest(BaseModel):
    url: str


@app.get("/")
def root():
    return {
        "project": "PhishLense",
        "status": "online",
        "message": "PhishLense API is running",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.post("/api/v1/analyze-url")
def analyze_url_endpoint(request: URLRequest):
    return analyze_url(request.url)