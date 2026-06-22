"""
Profile model — mirrors a Supabase `auth.users` row with app-level fields.

For Supabase-authenticated users, `id` equals the Supabase auth user id and
`password_hash` is null. For users registered through the backend's own
`/api/auth/register`, `id` is a freshly-generated UUID and `password_hash`
holds a bcrypt hash. Both kinds of users coexist in this table.
"""

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
    # Staff roles (everything except plain customers) for admin-style listings.
    STAFF = ALL - {CUSTOMER}


class Profile(Base):
    __tablename__ = "profiles"

    # Matches auth.users.id. FK is enforced at the DB level via schema.sql.
    id = Column(UUID(as_uuid=True), primary_key=True)
    email = Column(String(255), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    # bcrypt hash, set only for users that authenticate via the backend's own
    # /auth/login. Null for Supabase-authenticated users. Never serialized.
    password_hash = Column(String(255), nullable=True)
    role = Column(String(50), nullable=False, default=UserRole.CUSTOMER, index=True)
    company = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    department = Column(String(100), nullable=True)
    branch_id = Column(UUID(as_uuid=True), ForeignKey("branches.id"), nullable=True)
    status = Column(String(50), nullable=False, default="active")
    created_at = created_column()
    updated_at = updated_column()
