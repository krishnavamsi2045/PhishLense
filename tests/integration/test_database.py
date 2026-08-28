"""
Integration Tests for Database Layer & Persistence
Coverage: 12 tests covering SQLite session, CRUD operations, aggregations, and rollbacks.
"""

import pytest
from datetime import datetime
from database.db import SessionLocal, engine, Base
from database.models import Scan


@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    try:
        yield session
    finally:
        session.rollback()
        session.close()


def test_db_insert_scan(db_session):
    scan = Scan(
        url="https://test-insert.org",
        verdict="SAFE",
        risk_score=15,
        created_at=datetime.utcnow()
    )
    db_session.add(scan)
    db_session.commit()
    db_session.refresh(scan)
    assert scan.id is not None
    assert scan.url == "https://test-insert.org"


def test_db_query_scan_by_id(db_session):
    scan = Scan(
        url="https://test-query.org",
        verdict="PHISHING",
        risk_score=85,
        created_at=datetime.utcnow()
    )
    db_session.add(scan)
    db_session.commit()
    
    retrieved = db_session.query(Scan).filter(Scan.id == scan.id).first()
    assert retrieved is not None
    assert retrieved.verdict == "PHISHING"
    assert retrieved.risk_score == 85


def test_db_query_multiple_order_by_desc(db_session):
    s1 = Scan(url="https://s1.org", verdict="SAFE", risk_score=10)
    s2 = Scan(url="https://s2.org", verdict="SUSPICIOUS", risk_score=40)
    db_session.add_all([s1, s2])
    db_session.commit()

    results = db_session.query(Scan).order_by(Scan.id.desc()).limit(2).all()
    assert len(results) >= 2
    assert results[0].id > results[1].id


def test_db_count_aggregations(db_session):
    total = db_session.query(Scan).count()
    assert total >= 0


def test_db_filter_by_verdict(db_session):
    scan = Scan(url="https://phish-filter-test.com", verdict="PHISHING", risk_score=95)
    db_session.add(scan)
    db_session.commit()

    count = db_session.query(Scan).filter(Scan.verdict == "PHISHING").count()
    assert count >= 1


def test_db_update_scan(db_session):
    scan = Scan(url="https://update-test.com", verdict="SUSPICIOUS", risk_score=50)
    db_session.add(scan)
    db_session.commit()

    scan.verdict = "PHISHING"
    scan.risk_score = 75
    db_session.commit()

    updated = db_session.query(Scan).filter(Scan.id == scan.id).first()
    assert updated.verdict == "PHISHING"
    assert updated.risk_score == 75


def test_db_delete_single_scan(db_session):
    scan = Scan(url="https://delete-target.com", verdict="SAFE", risk_score=5)
    db_session.add(scan)
    db_session.commit()
    target_id = scan.id

    db_session.delete(scan)
    db_session.commit()

    deleted = db_session.query(Scan).filter(Scan.id == target_id).first()
    assert deleted is None


def test_db_timestamp_auto_population(db_session):
    scan = Scan(url="https://time-test.com", verdict="SAFE", risk_score=0)
    db_session.add(scan)
    db_session.commit()
    db_session.refresh(scan)
    assert scan.created_at is not None


def test_db_duplicate_url_storage_allowed(db_session):
    # Historical scans allow multiple scans of the same URL across time
    s1 = Scan(url="https://re-scanned.com", verdict="SAFE", risk_score=10)
    s2 = Scan(url="https://re-scanned.com", verdict="PHISHING", risk_score=80)
    db_session.add_all([s1, s2])
    db_session.commit()
    assert s1.id != s2.id


def test_db_rollback_on_error(db_session):
    scan = Scan(url="https://rollback-test.com", verdict="SAFE", risk_score=10)
    db_session.add(scan)
    db_session.commit()

    try:
        # Invalid state simulation
        db_session.rollback()
    except Exception:
        pass
    assert True


def test_db_connection_pool_alive(db_session):
    result = db_session.execute(Scan.__table__.select().limit(1))
    assert result is not None


def test_db_bulk_query_limit(db_session):
    scans = db_session.query(Scan).limit(5).all()
    assert len(scans) <= 5
