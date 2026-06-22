"""
Analytics API — aggregate dashboards across the platform. Read-only; computed
on demand from existing tables. Staff/admin only.
"""

from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.profile import Profile, UserRole
from app.models.shipment import Shipment
from app.models.finance import Invoice, InvoiceStatus
from app.models.logistics import Delivery
from app.models.support import SupportTicket
from app.services import crud

router = APIRouter(prefix="/analytics", tags=["analytics"])

# Any staff role may view analytics (admin always allowed via require_roles).
staff_guard = require_roles(
    UserRole.LOGISTICS, UserRole.FINANCE, UserRole.WAREHOUSE,
    UserRole.CUSTOMS, UserRole.SUPPORT,
)


async def _group_count(db: AsyncSession, column) -> dict:
    rows = (await db.execute(select(column, func.count()).group_by(column))).all()
    return {str(k): int(v) for k, v in rows}


@router.get("/dashboard")
async def dashboard(db: AsyncSession = Depends(get_db), _: Profile = Depends(staff_guard)):
    revenue = float((await db.execute(
        select(func.coalesce(func.sum(Invoice.total), 0)).where(Invoice.status == InvoiceStatus.PAID)
    )).scalar() or 0)
    return {
        "total_shipments": await crud.count(db, Shipment),
        "total_customers": await crud.count(db, Profile, {"role": UserRole.CUSTOMER}),
        "total_drivers": await crud.count(db, Profile, {"role": UserRole.DRIVER}),
        "open_tickets": await crud.count(db, SupportTicket, {"status": "open"}),
        "total_revenue": revenue,
        "shipments_by_status": await _group_count(db, Shipment.status),
    }


@router.get("/shipments")
async def shipments_analytics(db: AsyncSession = Depends(get_db), _: Profile = Depends(staff_guard)):
    return {
        "total": await crud.count(db, Shipment),
        "by_status": await _group_count(db, Shipment.status),
        "by_mode": await _group_count(db, Shipment.mode),
    }


@router.get("/customers")
async def customers_analytics(db: AsyncSession = Depends(get_db), _: Profile = Depends(staff_guard)):
    # Top customers by number of shipments.
    rows = (await db.execute(
        select(Shipment.customer_id, func.count())
        .group_by(Shipment.customer_id)
        .order_by(func.count().desc())
        .limit(10)
    )).all()
    return {
        "total_customers": await crud.count(db, Profile, {"role": UserRole.CUSTOMER}),
        "top_by_shipments": [{"customer_id": str(c) if c else None, "shipments": int(n)} for c, n in rows],
    }


@router.get("/drivers")
async def drivers_analytics(db: AsyncSession = Depends(get_db), _: Profile = Depends(staff_guard)):
    return {
        "total_drivers": await crud.count(db, Profile, {"role": UserRole.DRIVER}),
        "by_availability": await _group_count(db, Profile.status),
        "deliveries_by_status": await _group_count(db, Delivery.status),
    }


@router.get("/revenue")
async def revenue_analytics(db: AsyncSession = Depends(get_db), _: Profile = Depends(staff_guard)):
    paid = float((await db.execute(
        select(func.coalesce(func.sum(Invoice.total), 0)).where(Invoice.status == InvoiceStatus.PAID)
    )).scalar() or 0)
    outstanding = float((await db.execute(
        select(func.coalesce(func.sum(Invoice.total), 0)).where(Invoice.status != InvoiceStatus.PAID)
    )).scalar() or 0)
    return {
        "paid": paid,
        "outstanding": outstanding,
        "invoices_by_status": await _group_count(db, Invoice.status),
    }


@router.get("/performance")
async def performance_analytics(db: AsyncSession = Depends(get_db), _: Profile = Depends(staff_guard)):
    delivered = await crud.count(db, Shipment, {"status": "Delivered"})
    total = await crud.count(db, Shipment)
    return {
        "delivered": delivered,
        "total_shipments": total,
        "delivery_rate_pct": round(delivered / total * 100, 2) if total else 0.0,
        "deliveries_by_status": await _group_count(db, Delivery.status),
        "tickets_by_status": await _group_count(db, SupportTicket.status),
    }
