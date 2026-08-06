"""
Customers API — admin/staff management of customer accounts (profiles with
role='customer'), plus their shipments and invoices.
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.profile import Profile, UserRole
from app.models.shipment import Shipment
from app.models.finance import Invoice
from app.schemas.payloads import CustomerCreate, CustomerUpdate
from app.services import crud, supabase_admin
from app.utils.constants import EMAIL_EXISTS
from app.utils.helpers import serialize

router = APIRouter(prefix="/customers", tags=["customers"])

# Staff who may manage customer records.
staff_guard = require_roles(UserRole.LOGISTICS, UserRole.FINANCE, UserRole.SUPPORT)


async def _get_customer(db: AsyncSession, customer_id: str) -> Profile:
    cust = await crud.get_item(db, Profile, customer_id)
    if not cust or cust.role != UserRole.CUSTOMER:
        raise HTTPException(status_code=404, detail="Customer not found")  # NOSONAR
    return cust


@router.get("")
async def list_customers(
    q: str | None = None,
    skip: int = 0,
    limit: int = 200,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(staff_guard),
):
    query = select(Profile).where(Profile.role == UserRole.CUSTOMER)
    if q:
        like = f"%{q.lower()}%"
        query = query.where(Profile.email.ilike(like) | Profile.name.ilike(like))
    query = query.order_by(Profile.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return [serialize(c) for c in result.scalars().all()]


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_customer(
    payload: CustomerCreate,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(staff_guard),
):
    email = payload.email.lower().strip()
    existing = await db.execute(select(Profile).where(Profile.email == email))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(status_code=409, detail=EMAIL_EXISTS)  # NOSONAR

    # Provision a Supabase auth user when configured. The on_auth_user_created
    # DB trigger auto-inserts the matching profiles row (id, email, name, role,
    # company, phone from the user metadata).
    try:
        auth_id = await supabase_admin.create_auth_user(
            email,
            payload.password,
            metadata={
                "name": payload.name,
                "role": UserRole.CUSTOMER,
                "company": payload.company,
                "phone": payload.phone,
            },
        )
    except RuntimeError as exc:
        if "already been registered" in str(exc):
            raise HTTPException(status_code=409, detail=EMAIL_EXISTS)  # NOSONAR
        raise HTTPException(status_code=502, detail=str(exc))  # NOSONAR

    if not auth_id:
        # Supabase not configured — backend-only profile with a fresh id.
        customer = Profile(
            id=uuid.uuid4(),
            email=email,
            name=payload.name.strip(),
            role=UserRole.CUSTOMER,
            company=payload.company,
            phone=payload.phone,
        )
        db.add(customer)
        try:
            await db.flush()
        except IntegrityError:
            raise HTTPException(status_code=409, detail=EMAIL_EXISTS)  # NOSONAR
        await db.refresh(customer)
        return serialize(customer)

    customer = (
        await db.execute(select(Profile).where(Profile.id == uuid.UUID(auth_id)))
    ).scalar_one_or_none()

    if customer is None:
        # No on_auth_user_created trigger in this environment — create the
        # profile ourselves instead of relying on the trigger.
        customer = Profile(
            id=uuid.UUID(auth_id),
            email=email,
            name=payload.name.strip(),
            role=UserRole.CUSTOMER,
            company=payload.company,
            phone=payload.phone,
        )
        db.add(customer)
        try:
            await db.flush()
        except IntegrityError:
            raise HTTPException(status_code=409, detail=EMAIL_EXISTS)  # NOSONAR
    else:
        # Trigger created the row; apply fields it left unset.
        changed = False
        if payload.company and customer.company != payload.company:
            customer.company = payload.company
            changed = True
        if payload.phone and customer.phone != payload.phone:
            customer.phone = payload.phone
            changed = True
        if changed:
            await db.flush()

    await db.refresh(customer)
    return serialize(customer)


@router.get("/{customer_id}")
async def get_customer(
    customer_id: str,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(staff_guard),
):
    return serialize(await _get_customer(db, customer_id))


@router.put("/{customer_id}")
@router.patch("/{customer_id}")
async def update_customer(
    customer_id: str,
    payload: CustomerUpdate,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(staff_guard),
):
    cust = await _get_customer(db, customer_id)
    updated = await crud.update_item(db, cust, payload.model_dump(exclude_unset=True))
    return serialize(updated)


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_customer(
    customer_id: str,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(require_roles(UserRole.ADMIN)),
):
    cust = await _get_customer(db, customer_id)
    await crud.delete_item(db, cust)
    return None


@router.get("/{customer_id}/shipments")
async def customer_shipments(
    customer_id: str,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(staff_guard),
):
    await _get_customer(db, customer_id)
    result = await db.execute(
        select(Shipment).where(Shipment.customer_id == uuid.UUID(customer_id))
        .order_by(Shipment.created_at.desc())
    )
    return [serialize(s) for s in result.scalars().all()]


@router.get("/{customer_id}/invoices")
async def customer_invoices(
    customer_id: str,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(staff_guard),
):
    await _get_customer(db, customer_id)
    result = await db.execute(
        select(Invoice).where(Invoice.customer_id == uuid.UUID(customer_id))
        .order_by(Invoice.created_at.desc())
    )
    return [serialize(i) for i in result.scalars().all()]
