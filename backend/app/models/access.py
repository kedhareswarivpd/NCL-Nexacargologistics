"""
Role model — admin role management (/admin/roles).
"""

from sqlalchemy import Column, String, Boolean, Text

from app.core.database import Base
from app.models.base import pk_column, created_column


class Role(Base):
    __tablename__ = "roles"

    id = pk_column()
    key = Column(String(50), unique=True, nullable=False, index=True)
    label = Column(String(120), nullable=False)
    description = Column(Text, nullable=True)
    is_system = Column(Boolean, nullable=False, default=False)
    created_at = created_column()
