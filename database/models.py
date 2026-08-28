from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from database.db import Base


def utc_now():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(30), default="USER", nullable=False)  # "ADMIN" or "USER"
    organization = Column(String(150), default="Enterprise SOC")
    profile_image = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)
    last_login = Column(DateTime, nullable=True)

    # Relationships
    scans = relationship("Scan", back_populates="user", cascade="all, delete-orphan")
    api_keys = relationship("ApiKey", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user", cascade="all, delete-orphan")


class Scan(Base):
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    url = Column(String(2048), nullable=False)
    verdict = Column(String(50), nullable=False)  # SAFE, SUSPICIOUS, PHISHING
    risk_score = Column(Integer, nullable=False)  # 0 - 100
    threat_level = Column(String(30), default="LOW")  # MINIMAL, LOW, MEDIUM, HIGH, CRITICAL
    confidence = Column(Float, default=95.0)
    domain_age_days = Column(Integer, default=0)
    ssl_valid = Column(Boolean, default=True)
    scan_type = Column(String(30), default="MANUAL")  # MANUAL, BULK, API, AUTOMATED
    raw_analysis_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="scans")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    user_email = Column(String(255), nullable=True)
    action = Column(String(100), nullable=False)  # AUTH_LOGIN, URL_SCAN, USER_UPDATE, ROLE_CHANGE, etc.
    resource = Column(String(255), nullable=True)
    ip_address = Column(String(60), default="127.0.0.1")
    user_agent = Column(String(255), nullable=True)
    status = Column(String(30), default="SUCCESS")  # SUCCESS, FAILED, BLOCKED, WARNING
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="audit_logs")


class ApiKey(Base):
    __tablename__ = "api_keys"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    key_prefix = Column(String(16), nullable=False)  # e.g., "pl_live_9a8f..."
    hashed_key = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    requests_count = Column(Integer, default=0)
    last_used_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="api_keys")


class SystemMetric(Base):
    __tablename__ = "system_metrics"

    id = Column(Integer, primary_key=True, index=True)
    cpu_percent = Column(Float, default=18.5)
    memory_percent = Column(Float, default=34.2)
    active_connections = Column(Integer, default=12)
    api_latency_ms = Column(Float, default=45.0)
    scans_today = Column(Integer, default=0)
    health_score = Column(Integer, default=98)
    recorded_at = Column(DateTime, default=utc_now)