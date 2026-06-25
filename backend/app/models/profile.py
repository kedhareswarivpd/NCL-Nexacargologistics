from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base
from app.models.base import created_column, updated_column


class UserRole:
    ADMIN = "admin"
    CUSTOMER = "customer"
    FINANCE = "finance"
    LOGISTICS = "logistics"
    WAREHOUSE = "warehouse"
    DRIVER = "driver"
    SUPPORT = "support"
    CUSTOMS = "customs"

    ALL = {ADMIN, CUSTOMER, FINANCE, LOGISTICS, WAREHOUSE, DRIVER, SUPPORT, CUSTOMS}
    STAFF = ALL - {CUSTOMER}


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(UUID(as_uuid=True), primary_key=True)
    email = Column(String(255), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=True)
    role = Column(String(50), nullable=False, default=UserRole.CUSTOMER, index=True)
    company = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    department = Column(String(100), nullable=True)
    branch_id = Column(UUID(as_uuid=True), ForeignKey("branches.id"), nullable=True)
    status = Column(String(50), nullable=False, default="active")
    created_at = created_column()
    updated_at = updated_column()
