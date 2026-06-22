"""
Admin API — branch management, system analytics, audit logs (Admin Dashboard).
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_admin_user
from app.models.profile import Profile, UserRole
from app.models.branch import Branch
from app.models.shipment import Shipment
from app.models.finance import Invoice, InvoiceStatus
from app.models.support import SupportTicket
from app.models.notification import AuditLog
from app.models.access import Role
from app.schemas.payloads import BranchCreate, BranchUpdate, RoleCreate, RoleUpdate
from app.services import crud
from app.utils.helpers import serialize

router = APIRouter(prefix="/admin", tags=["admin"])


# ----------------------------- Branches -----------------------------
@router.get("/branches")
async def list_branches(db: AsyncSession = Depends(get_db), _: Profile = Depends(get_admin_user)):
    return [serialize(b) for b in await crud.list_items(db, Branch, limit=200)]


@router.post("/branches", status_code=status.HTTP_201_CREATED)
async def create_branch(payload: BranchCreate, db: AsyncSession = Depends(get_db), _: Profile = Depends(get_admin_user)):
    data = payload.model_dump(exclude_unset=True)
    if data.get("manager_id"):
        data["manager_id"] = uuid.UUID(data["manager_id"])
    return serialize(await crud.create_item(db, Branch, data))


@router.patch("/branches/{branch_id}")
@router.put("/branches/{branch_id}")
async def update_branch(branch_id: str, payload: BranchUpdate, db: AsyncSession = Depends(get_db), _: Profile = Depends(get_admin_user)):
    branch = await crud.get_item(db, Branch, branch_id)
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")
    data = payload.model_dump(exclude_unset=True)
    if data.get("manager_id"):
        data["manager_id"] = uuid.UUID(data["manager_id"])
    return serialize(await crud.update_item(db, branch, data))


@router.delete("/branches/{branch_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_branch(branch_id: str, db: AsyncSession = Depends(get_db), _: Profile = Depends(get_admin_user)):
    branch = await crud.get_item(db, Branch, branch_id)
    if branch:
        await crud.delete_item(db, branch)
    return None


# ----------------------------- Analytics -----------------------------
@router.get("/analytics")
async def analytics(db: AsyncSession = Depends(get_db), _: Profile = Depends(get_admin_user)):
    return {
        "users": await crud.count(db, Profile),
        "customers": await crud.count(db, Profile, {"role": UserRole.CUSTOMER}),
        "shipments": await crud.count(db, Shipment),
        "shipments_in_transit": await crud.count(db, Shipment, {"status": "In Transit"}),
        "shipments_delivered": await crud.count(db, Shipment, {"status": "Delivered"}),
        "invoices": await crud.count(db, Invoice),
        "invoices_paid": await crud.count(db, Invoice, {"status": InvoiceStatus.PAID}),
        "open_tickets": await crud.count(db, SupportTicket, {"status": "open"}),
        "branches": await crud.count(db, Branch),
    }


# ----------------------------- Audit logs -----------------------------
@router.get("/audit-logs")
async def audit_logs(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(get_admin_user),
):
    return [serialize(a) for a in await crud.list_items(db, AuditLog, skip=skip, limit=limit)]


# ----------------------------- Dashboard -----------------------------
@router.get("/dashboard")
async def dashboard(db: AsyncSession = Depends(get_db), _: Profile = Depends(get_admin_user)):
    """High-level operational snapshot for the Super Admin dashboard."""
    revenue = float((await db.execute(
        select(func.coalesce(func.sum(Invoice.total), 0)).where(Invoice.status == InvoiceStatus.PAID)
    )).scalar() or 0)
    return {
        "users": await crud.count(db, Profile),
        "customers": await crud.count(db, Profile, {"role": UserRole.CUSTOMER}),
        "drivers": await crud.count(db, Profile, {"role": UserRole.DRIVER}),
        "branches": await crud.count(db, Branch),
        "shipments": await crud.count(db, Shipment),
        "shipments_in_transit": await crud.count(db, Shipment, {"status": "In Transit"}),
        "shipments_delivered": await crud.count(db, Shipment, {"status": "Delivered"}),
        "invoices": await crud.count(db, Invoice),
        "revenue": revenue,
        "open_tickets": await crud.count(db, SupportTicket, {"status": "open"}),
        "roles": await crud.count(db, Role),
    }


# ----------------------------- Users (admin view) -----------------------------
@router.get("/users")
async def admin_users(
    role: str | None = None,
    skip: int = 0,
    limit: int = 200,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(get_admin_user),
):
    """List all users (admin). Mirrors GET /users for the admin dashboard."""
    query = select(Profile)
    if role:
        query = query.where(Profile.role == role)
    query = query.order_by(Profile.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return [serialize(u) for u in result.scalars().all()]


# ----------------------------- Roles -----------------------------
@router.get("/roles")
async def list_roles(db: AsyncSession = Depends(get_db), _: Profile = Depends(get_admin_user)):
    return [serialize(r) for r in await crud.list_items(db, Role, limit=100, order_desc=False)]


@router.post("/roles", status_code=status.HTTP_201_CREATED)
async def create_role(payload: RoleCreate, db: AsyncSession = Depends(get_db), _: Profile = Depends(get_admin_user)):
    key = payload.key.lower().strip()
    if await crud.get_by(db, Role, key=key):
        raise HTTPException(status_code=409, detail="A role with this key already exists")
    return serialize(await crud.create_item(db, Role, {
        "key": key, "label": payload.label, "description": payload.description, "is_system": False,
    }))


@router.put("/roles/{role_id}")
@router.patch("/roles/{role_id}")
async def update_role(
    role_id: str,
    payload: RoleUpdate,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(get_admin_user),
):
    role = await crud.get_item(db, Role, role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return serialize(await crud.update_item(db, role, payload.model_dump(exclude_unset=True)))


@router.delete("/roles/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_role(
    role_id: str,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(get_admin_user),
):
    role = await crud.get_item(db, Role, role_id)
    if not role:
        return None
    if role.is_system:
        raise HTTPException(status_code=400, detail="System roles cannot be deleted")
    await crud.delete_item(db, role)
    return None
