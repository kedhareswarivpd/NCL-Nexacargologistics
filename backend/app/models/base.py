import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime
from sqlalchemy.dialects.postgresql import UUID


def pk_column():
    return Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)


def created_column():
    return Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


def updated_column():
    return Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
