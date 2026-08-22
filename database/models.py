from datetime import datetime

from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import DateTime

from database.db import Base


class Scan(Base):

    __tablename__ = "scans"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    url = Column(
        String,
        nullable=False
    )

    verdict = Column(
        String,
        nullable=False
    )

    risk_score = Column(
        Integer,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )