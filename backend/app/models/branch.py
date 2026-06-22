"""
Branch model — admin "Branch Management".
"""

from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base
from app.models.base import pk_column, created_column


class Branch(Base):
    __tablename__ = "branches"

    id = pk_column()
    name = Column(String(255), nullable=False)
    code = Column(String(50), unique=True, nullable=False)
    city = Column(String(120), nullable=True)
    country = Column(String(120), nullable=True)
    address = Column(String(500), nullable=True)
    manager_id = Column(UUID(as_uuid=True), nullable=True)
    status = Column(String(50), nullable=False, default="active")
    created_at = created_column()
