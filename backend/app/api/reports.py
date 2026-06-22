"""
Reports API — tabular operational/financial reports, plus a CSV download.

Reports are generated on demand (not persisted), so `/download/{report_id}`
treats `report_id` as the report *type* (shipment|customer|finance|driver|
delivery) and streams it as CSV.
"""

import csv
import io

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.middleware.auth import get_current_user
from app.models.profile import Profile, UserRole
from app.models.shipment import Shipment
from app.models.finance import Invoice, InvoiceStatus, Payment
from app.models.logistics import Delivery
from app.services import crud
from app.utils.helpers import serialize

router = APIRouter(prefix="/reports", tags=["reports"])

staff_guard = require_roles(
    UserRole.LOGISTICS, UserRole.FINANCE, UserRole.WAREHOUSE,
    UserRole.CUSTOMS, UserRole.SUPPORT,
)


@router.get("/shipment-report")
async def shipment_report(db: AsyncSession = Depends(get_db), _: Profile = Depends(staff_guard)):
    rows = await crud.list_items(db, Shipment, limit=1000)
    by_status = {str(k): int(v) for k, v in (await db.execute(
        select(Shipment.status, func.count()).group_by(Shipment.status)
    )).all()}
    return {"count": len(rows), "by_status": by_status, "rows": [serialize(s) for s in rows]}


@router.get("/customer-report")
async def customer_report(db: AsyncSession = Depends(get_db), _: Profile = Depends(staff_guard)):
    rows = await crud.list_items(db, Profile, filters={"role": UserRole.CUSTOMER}, limit=1000)
    return {"count": len(rows), "rows": [serialize(c) for c in rows]}


@router.get("/finance-report")
async def finance_report(db: AsyncSession = Depends(get_db), _: Profile = Depends(require_roles(UserRole.FINANCE))):
    paid = float((await db.execute(
        select(func.coalesce(func.sum(Invoice.total), 0)).where(Invoice.status == InvoiceStatus.PAID)
    )).scalar() or 0)
    invoices = await crud.list_items(db, Invoice, limit=1000)
    payments = await crud.list_items(db, Payment, limit=1000)
    return {
        "revenue": paid,
        "invoice_count": len(invoices),
        "payment_count": len(payments),
        "invoices": [serialize(i) for i in invoices],
    }


@router.get("/driver-report")
async def driver_report(db: AsyncSession = Depends(get_db), _: Profile = Depends(staff_guard)):
    rows = await crud.list_items(db, Profile, filters={"role": UserRole.DRIVER}, limit=1000)
    return {"count": len(rows), "rows": [serialize(d) for d in rows]}


@router.get("/delivery-report")
async def delivery_report(db: AsyncSession = Depends(get_db), _: Profile = Depends(staff_guard)):
    rows = await crud.list_items(db, Delivery, limit=1000)
    by_status = {str(k): int(v) for k, v in (await db.execute(
        select(Delivery.status, func.count()).group_by(Delivery.status)
    )).all()}
    return {"count": len(rows), "by_status": by_status, "rows": [serialize(d) for d in rows]}


_REPORT_MODELS = {
    "shipment": Shipment,
    "customer": (Profile, {"role": UserRole.CUSTOMER}),
    "finance": Invoice,
    "driver": (Profile, {"role": UserRole.DRIVER}),
    "delivery": Delivery,
}


@router.get("/download/{report_id}")
async def download_report(
    report_id: str,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(staff_guard),
):
    """Stream a report as CSV. `report_id` is the report type."""
    spec = _REPORT_MODELS.get(report_id)
    if spec is None:
        raise HTTPException(status_code=404, detail=f"Unknown report '{report_id}'. "
                            f"Valid: {', '.join(_REPORT_MODELS)}")
    model, filters = (spec, None) if not isinstance(spec, tuple) else spec
    rows = [serialize(r) for r in await crud.list_items(db, model, filters=filters, limit=5000)]

    buffer = io.StringIO()
    if rows:
        writer = csv.DictWriter(buffer, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)
    csv_text = buffer.getvalue()
    return Response(
        content=csv_text,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{report_id}-report.csv"'},
    )
