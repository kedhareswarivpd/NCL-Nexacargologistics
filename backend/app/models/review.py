from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base
from app.models.base import pk_column, created_column


class Review(Base):
    __tablename__ = "reviews"

    id = pk_column()
    customer_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False, index=True)
    customer_name = Column(String(255), nullable=False)
    customer_company = Column(String(255), nullable=True)
    customer_role = Column(String(100), nullable=True)
    rating = Column(Integer, nullable=False)
    title = Column(String(255), nullable=True)
    comment = Column(Text, nullable=False)
    approved = Column(Boolean, nullable=False, default=False)
    created_at = created_column()
