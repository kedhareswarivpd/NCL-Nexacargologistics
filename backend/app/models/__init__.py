"""
Models package — import all models so SQLAlchemy metadata is fully populated.
"""

from app.models.profile import Profile, UserRole, Role
from app.models.branch import Branch
from app.models.shipment import (
    Quote,
    Shipment,
    ShipmentStatus,
    ShipmentStatusHistory,
    Document,
    TransportMode,
)
from app.models.logistics import Container, Route, Vehicle, Delivery
from app.models.warehouse import Warehouse, InventoryItem, WarehouseTask
from app.models.finance import Invoice, InvoiceStatus, Payment, Expense
from app.models.customs import CustomsEntry
from app.models.insurance import InsurancePolicy
from app.models.support import SupportTicket, TicketMessage
from app.models.notification import Notification, AuditLog

__all__ = [
    "Profile",
    "UserRole",
    "Role",
    "Branch",
    "Quote",
    "Shipment",
    "ShipmentStatus",
    "ShipmentStatusHistory",
    "Document",
    "TransportMode",
    "Container",
    "Route",
    "Vehicle",
    "Delivery",
    "Warehouse",
    "InventoryItem",
    "WarehouseTask",
    "Invoice",
    "InvoiceStatus",
    "Payment",
    "Expense",
    "CustomsEntry",
    "InsurancePolicy",
    "SupportTicket",
    "TicketMessage",
    "Notification",
    "AuditLog",
]
