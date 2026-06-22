"""
Insurance API — cargo insurance requests & policies (Insurance Workflow).
Customers request coverage; finance/admin approve and price.
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_finance_user
from app.middleware.auth import get_current_user
from app.models.profile import Profile, UserRole
from app.models.insurance import InsurancePolicy
from app.schemas.payloads import InsuranceCreate, InsuranceUpdate
from app.services import crud
from app.utils.helpers import generate_ref, serialize

router = APIRouter(prefix="/insurance", tags=["insurance"])


def _is_staff(role: str) -> bool:
    return role in (UserRole.ADMIN, UserRole.FINANCE)


@router.get("/policies")
async def list_policies(
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    query = select(InsurancePolicy)
    if not _is_staff(current_user.role):
        query = query.where(InsurancePolicy.customer_id == current_user.id)
    query = query.order_by(InsurancePolicy.created_at.desc())
    result = await db.execute(query)
    return [serialize(p) for p in result.scalars().all()]


@router.post("/policies", status_code=status.HTTP_201_CREATED)
async def request_policy(
    payload: InsuranceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    data = payload.model_dump(exclude_unset=True)
    if data.get("shipment_id"):
        data["shipment_id"] = uuid.UUID(data["shipment_id"])
    data["policy_ref"] = generate_ref("INS")
    data["customer_id"] = current_user.id
    data["status"] = "requested"
    # Auto-estimate premium at 1.5% of declared coverage if provided.
    if data.get("coverage_amount"):
        data["premium"] = round(float(data["coverage_amount"]) * 0.015, 2)
    return serialize(await crud.create_item(db, InsurancePolicy, data))


@router.patch("/policies/{policy_id}")
@router.put("/policies/{policy_id}")
async def update_policy(
    policy_id: str,
    payload: InsuranceUpdate,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(get_finance_user),
):
    policy = await crud.get_item(db, InsurancePolicy, policy_id)
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    return serialize(await crud.update_item(db, policy, payload.model_dump(exclude_unset=True)))
