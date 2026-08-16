from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from analyzer.url_analyzer import analyze_url

app = FastAPI(
    title="PhishLense API",
    description="Phishing URL detection and security analysis API",
    version="1.0.0",
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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