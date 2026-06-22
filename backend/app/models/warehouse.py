"""
Warehouse models — warehouses, inventory, inbound/outbound tasks.
"""

from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base
from app.models.base import pk_column, created_column, updated_column


class Warehouse(Base):
    __tablename__ = "warehouses"

    id = pk_column()
    name = Column(String(255), nullable=False)
    code = Column(String(40), unique=True, nullable=True)
    location = Column(String(500), nullable=True)
    manager_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=True)
    capacity = Column(Integer, nullable=True)
    used_capacity = Column(Integer, nullable=True, default=0)
    created_at = created_column()


class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id = pk_column()
    warehouse_id = Column(UUID(as_uuid=True), ForeignKey("warehouses.id"), nullable=False, index=True)
    sku = Column(String(100), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=True)
    zone = Column(String(50), nullable=True)
    qty = Column(Integer, default=0)
    reorder_at = Column(Integer, nullable=True)
    status = Column(String(50), default="OK")  # OK|Low|Out
    shipment_id = Column(UUID(as_uuid=True), ForeignKey("shipments.id"), nullable=True)
    created_at = created_column()
    updated_at = updated_column()


class WarehouseTask(Base):
    __tablename__ = "warehouse_tasks"

    id = pk_column()
    warehouse_id = Column(UUID(as_uuid=True), ForeignKey("warehouses.id"), nullable=True, index=True)
    task_type = Column(String(30), nullable=False, default="inbound")  # inbound|outbound|putaway|pick|count
    shipment_id = Column(UUID(as_uuid=True), ForeignKey("shipments.id"), nullable=True)
    reference = Column(String(80), nullable=True)
    description = Column(String(500), nullable=True)
    status = Column(String(30), nullable=False, default="Pending")  # Pending|In Progress|Done
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=True)
    created_at = created_column()
    updated_at = updated_column()
