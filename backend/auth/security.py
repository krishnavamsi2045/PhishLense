"""
PhishLense Enterprise Authentication & Security Handler
Provides robust password hashing (bcrypt + SHA256 fallback) and secure token generation.
"""

import os
import hashlib
import hmac
import secrets
from typing import Optional

# Optional bcrypt support with secure fallback
try:
    import bcrypt
    HAS_BCRYPT = True
except ImportError:
    HAS_BCRYPT = False


def generate_salt() -> str:
    """Generates a cryptographically secure 16-byte random salt."""
    return secrets.token_hex(16)


def hash_password(password: str) -> str:
    """Hashes a password securely using bcrypt or PBKDF2-HMAC-SHA256."""
    if HAS_BCRYPT:
        salt = bcrypt.gensalt(rounds=12)
        hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
        return hashed.decode("utf-8")
    else:
        # High-security PBKDF2-HMAC-SHA256 with 100,000 iterations
        salt = generate_salt()
        pwd_hash = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            salt.encode("utf-8"),
            100000
        ).hex()
        return f"pbkdf2_sha256${salt}${pwd_hash}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against stored hash."""
    if not hashed_password or not plain_password:
        return False

    try:
        if hashed_password.startswith("$2b$") or hashed_password.startswith("$2a$"):
            if HAS_BCRYPT:
                return bcrypt.checkpw(
                    plain_password.encode("utf-8"),
                    hashed_password.encode("utf-8")
                )
            return False

        if hashed_password.startswith("pbkdf2_sha256$"):
            parts = hashed_password.split("$")
            if len(parts) == 3:
                _, salt, expected_hash = parts
                calculated_hash = hashlib.pbkdf2_hmac(
                    "sha256",
                    plain_password.encode("utf-8"),
                    salt.encode("utf-8"),
                    100000
                ).hex()
                return hmac.compare_digest(expected_hash, calculated_hash)

        # Fallback simple SHA256 comparison for legacy migration
        if len(hashed_password) == 64:
            calc = hashlib.sha256(plain_password.encode("utf-8")).hexdigest()
            return hmac.compare_digest(hashed_password, calc)

        return False
    except Exception:
        return False
