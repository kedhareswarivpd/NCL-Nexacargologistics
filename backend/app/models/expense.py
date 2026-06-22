"""
Expense model — finance expenses feeding profit-loss reports (/finance/expenses).
"""

from sqlalchemy import Column, String, Float, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base
from app.models.base import pk_column, created_column


class Expense(Base):
    __tablename__ = "expenses"

    id = pk_column()
    category = Column(String(120), nullable=False)
    amount = Column(Float, nullable=False, default=0)
    currency = Column(String(10), nullable=False, default="USD")
    branch_id = Column(UUID(as_uuid=True), ForeignKey("branches.id"), nullable=True)
    note = Column(Text, nullable=True)
    incurred_at = Column(String(40), nullable=True)
    created_at = created_column()
