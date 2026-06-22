"""
DriverTask model — the driver task board (/tasks, /drivers/{id}/tasks).
"""

from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base
from app.models.base import pk_column, created_column, updated_column


class DriverTask(Base):
    __tablename__ = "driver_tasks"

    id = pk_column()
    driver_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=True, index=True)
    shipment_id = Column(UUID(as_uuid=True), ForeignKey("shipments.id"), nullable=True)
    description = Column(Text, nullable=False)
    priority = Column(String(20), nullable=False, default="Medium")   # High|Medium|Low
    status = Column(String(20), nullable=False, default="Pending")     # Pending|In Progress|Completed
    due = Column(String(60), nullable=True)
    created_at = created_column()
    updated_at = updated_column()
