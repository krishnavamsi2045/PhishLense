from dotenv import load_dotenv

load_dotenv()

from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.analyzer.url_analyzer import analyze_url
from database.db import engine, SessionLocal, Base
from database.models import Scan


# ------------------------------------
# Create Database Tables
# ------------------------------------
Base.metadata.create_all(bind=engine)


# ------------------------------------
# FastAPI App
# ------------------------------------
app = FastAPI(
    title="PhishLense API",
    version="1.0.0",
    description="AI Powered Phishing Detection System"
)


# ------------------------------------
# CORS
# ------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ------------------------------------
# Request Models
# ------------------------------------
class URLRequest(BaseModel):
    url: str


# ------------------------------------
# Root Endpoint
# ------------------------------------
@app.get("/")
def root():
    return {
        "message": "PhishLense API Running",
        "version": "1.0.0"
    }


# ------------------------------------
# Health Check
# ------------------------------------
@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


# ------------------------------------
# Analyze URL & Persist Scan
# ------------------------------------
@app.post("/analyze")
def analyze(request: URLRequest):
    result = analyze_url(request.url)

    # Normalize verdict for consistent storage & statistics
    raw_verdict = str(result.get("final_verdict", "UNKNOWN")).upper()
    if raw_verdict in ["MALICIOUS", "HIGH_RISK", "CRITICAL"]:
        normalized_verdict = "PHISHING"
    elif raw_verdict in ["SUSPICIOUS", "MEDIUM_RISK"]:
        normalized_verdict = "SUSPICIOUS"
    elif raw_verdict in ["SAFE", "CLEAN", "LOW_RISK"]:
        normalized_verdict = "SAFE"
    else:
        normalized_verdict = raw_verdict

    result["final_verdict"] = normalized_verdict
    risk_score = int(result.get("risk_score", 0))

    db = SessionLocal()
    try:
        scan = Scan(
            url=request.url,
            verdict=normalized_verdict,
            risk_score=risk_score,
            created_at=datetime.utcnow()
        )

        db.add(scan)
        db.commit()
        db.refresh(scan)

        result["scan_id"] = scan.id
        return result
    finally:
        db.close()


# ------------------------------------
# Scan History
# ------------------------------------
@app.get("/history")
def history():
    db = SessionLocal()
    try:
        scans = (
            db.query(Scan)
            .order_by(Scan.id.desc())
            .limit(100)
            .all()
        )

        return [
            {
                "id": scan.id,
                "url": scan.url,
                "verdict": scan.verdict,
                "risk_score": scan.risk_score,
                "created_at": (
                    scan.created_at.strftime("%Y-%m-%d %H:%M:%S UTC")
                    if scan.created_at
                    else None
                )
            }
            for scan in scans
        ]
    finally:
        db.close()


# ------------------------------------
# Get Single Scan
# ------------------------------------
@app.get("/scan/{scan_id}")
def get_scan(scan_id: int):
    db = SessionLocal()
    try:
        scan = (
            db.query(Scan)
            .filter(Scan.id == scan_id)
            .first()
        )

        if not scan:
            return {"error": "Scan not found"}

        return {
            "id": scan.id,
            "url": scan.url,
            "verdict": scan.verdict,
            "risk_score": scan.risk_score,
            "created_at": (
                scan.created_at.strftime("%Y-%m-%d %H:%M:%S UTC")
                if scan.created_at
                else None
            )
        }
    finally:
        db.close()


# ------------------------------------
# Clear History
# ------------------------------------
@app.delete("/history")
def clear_history():
    db = SessionLocal()
    try:
        deleted = db.query(Scan).delete()
        db.commit()

        return {
            "message": "History cleared successfully",
            "deleted_records": deleted
        }
    finally:
        db.close()


# ------------------------------------
# Statistics
# ------------------------------------
@app.get("/stats")
def stats():
    db = SessionLocal()
    try:
        total = db.query(Scan).count()

        phishing = (
            db.query(Scan)
            .filter(Scan.verdict.in_(["PHISHING", "MALICIOUS", "HIGH_RISK"]))
            .count()
        )

        suspicious = (
            db.query(Scan)
            .filter(Scan.verdict.in_(["SUSPICIOUS", "MEDIUM_RISK"]))
            .count()
        )

        safe = (
            db.query(Scan)
            .filter(Scan.verdict.in_(["SAFE", "CLEAN", "LOW_RISK"]))
            .count()
        )

        return {
            "total_scans": total,
            "phishing": phishing,
            "suspicious": suspicious,
            "safe": safe
        }
    finally:
        db.close()


# ------------------------------------
# Analytics
# ------------------------------------
@app.get("/analytics")
def analytics():
    db = SessionLocal()
    try:
        phishing = (
            db.query(Scan)
            .filter(Scan.verdict.in_(["PHISHING", "MALICIOUS", "HIGH_RISK"]))
            .count()
        )

        suspicious = (
            db.query(Scan)
            .filter(Scan.verdict.in_(["SUSPICIOUS", "MEDIUM_RISK"]))
            .count()
        )

        safe = (
            db.query(Scan)
            .filter(Scan.verdict.in_(["SAFE", "CLEAN", "LOW_RISK"]))
            .count()
        )

        return {
            "labels": [
                "Phishing",
                "Suspicious",
                "Safe"
            ],
            "values": [
                phishing,
                suspicious,
                safe
            ]
        }
    finally:
        db.close()


# ------------------------------------
# Dashboard API
# ------------------------------------
@app.get("/dashboard")
def dashboard():
    db = SessionLocal()
    try:
        total = db.query(Scan).count()

        phishing = (
            db.query(Scan)
            .filter(Scan.verdict.in_(["PHISHING", "MALICIOUS", "HIGH_RISK"]))
            .count()
        )

        suspicious = (
            db.query(Scan)
            .filter(Scan.verdict.in_(["SUSPICIOUS", "MEDIUM_RISK"]))
            .count()
        )

        safe = (
            db.query(Scan)
            .filter(Scan.verdict.in_(["SAFE", "CLEAN", "LOW_RISK"]))
            .count()
        )

        recent_scans = (
            db.query(Scan)
            .order_by(Scan.id.desc())
            .limit(10)
            .all()
        )

        return {
            "summary": {
                "total_scans": total,
                "phishing": phishing,
                "suspicious": suspicious,
                "safe": safe
            },
            "recent_scans": [
                {
                    "id": scan.id,
                    "url": scan.url,
                    "verdict": scan.verdict,
                    "risk_score": scan.risk_score,
                    "created_at": (
                        scan.created_at.strftime("%Y-%m-%d %H:%M:%S UTC")
                        if scan.created_at
                        else None
                    )
                }
                for scan in recent_scans
            ]
        }
    finally:
        db.close()