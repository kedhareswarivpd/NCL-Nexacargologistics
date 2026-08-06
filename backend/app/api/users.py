"""
Users API — admin management of profiles / staff (User Management, Access Control).
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_admin_user, require_roles
from app.middleware.auth import get_current_user
from app.models.profile import Profile, UserRole
from app.schemas.payloads import AdminProfileUpdate, ProfileUpdate, StaffCreate, StatusPatch
from app.services import crud
from app.services import supabase_admin
from app.utils.constants import EMAIL_EXISTS
from app.utils.helpers import serialize

router = APIRouter(prefix="/users", tags=["users"])

USER_NOT_FOUND = "User not found"


@router.get("/me")
async def get_my_profile(current_user: Profile = Depends(get_current_user)):
    return serialize(current_user)


@router.put("/me")
@router.patch("/me")
async def update_my_profile(
    payload: ProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    updated = await crud.update_item(db, current_user, payload.model_dump(exclude_unset=True))
    return serialize(updated)


@router.get("")
async def list_users(
    role: str | None = None,
    staff_only: bool = False,
    skip: int = 0,
    limit: int = 200,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(require_roles(*UserRole.STAFF)),
):
    query = select(Profile)
    if role:
        query = query.where(Profile.role == role)
    elif staff_only:
        query = query.where(Profile.role != UserRole.CUSTOMER)
    query = query.order_by(Profile.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return [serialize(u) for u in result.scalars().all()]


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_staff(
    payload: StaffCreate,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(get_admin_user),
):
    if payload.role not in UserRole.ALL:
        raise HTTPException(status_code=400, detail=f"Invalid role '{payload.role}'")  # NOSONAR

    email = payload.email.lower().strip()
    existing = await db.execute(select(Profile).where(Profile.email == email))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(status_code=409, detail=EMAIL_EXISTS)  # NOSONAR

    # Provision the Supabase auth user (so the staff member can log in). The
    # on_auth_user_created DB trigger auto-inserts the matching profiles row
    # (id, email, name, role from the user metadata) at the same time.
    try:
        auth_id = await supabase_admin.create_auth_user(
            email,
            payload.password,
            metadata={"name": payload.name, "role": payload.role},
        )
    except RuntimeError as exc:
        if "already been registered" in str(exc):
            raise HTTPException(status_code=409, detail=EMAIL_EXISTS)  # NOSONAR
        raise HTTPException(status_code=502, detail=str(exc))  # NOSONAR

    if not auth_id:
        raise HTTPException(  # NOSONAR
            status_code=503,
            detail="Supabase service-role not configured; cannot create auth user. "
            "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
        )

    profile = (
        await db.execute(select(Profile).where(Profile.id == uuid.UUID(auth_id)))
    ).scalar_one_or_none()

    if profile is None:
        # No on_auth_user_created trigger in this environment — create the
        # profile ourselves instead of relying on the trigger.
        profile = Profile(
            id=uuid.UUID(auth_id),
            email=email,
            name=payload.name,
            role=payload.role,
            department=payload.department,
            phone=payload.phone,
            branch_id=uuid.UUID(payload.branch_id) if payload.branch_id else None,
        )
        db.add(profile)
        try:
            await db.flush()
        except IntegrityError:
            raise HTTPException(status_code=409, detail=EMAIL_EXISTS)  # NOSONAR
    else:
        # Trigger created the row; apply the staff fields it leaves unset.
        changed = False
        if payload.department and profile.department != payload.department:
            profile.department = payload.department
            changed = True
        if payload.phone and profile.phone != payload.phone:
            profile.phone = payload.phone
            changed = True
        if payload.branch_id and str(profile.branch_id or "") != payload.branch_id:
            profile.branch_id = uuid.UUID(payload.branch_id)
            changed = True
        if changed:
            await db.flush()

    await db.refresh(profile)
    return serialize(profile)


@router.get("/{user_id}")
async def get_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(get_admin_user),
):
    user = await crud.get_item(db, Profile, user_id)
    if not user:
        raise HTTPException(status_code=404, detail=USER_NOT_FOUND)  # NOSONAR
    return serialize(user)


@router.patch("/{user_id}")
@router.put("/{user_id}")
async def update_user(
    user_id: str,
    payload: AdminProfileUpdate,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(get_admin_user),
):
    user = await crud.get_item(db, Profile, user_id)
    if not user:
        raise HTTPException(status_code=404, detail=USER_NOT_FOUND)  # NOSONAR
    data = payload.model_dump(exclude_unset=True)
    if "role" in data and data["role"] not in UserRole.ALL:
        raise HTTPException(status_code=400, detail="Invalid role")  # NOSONAR
    if data.get("branch_id"):
        data["branch_id"] = uuid.UUID(data["branch_id"])
    updated = await crud.update_item(db, user, data)
    return serialize(updated)


@router.patch("/{user_id}/status")
async def set_user_status(
    user_id: str,
    payload: StatusPatch,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_admin_user),
):
    """Activate / suspend a user account (admin only)."""
    user = await crud.get_item(db, Profile, user_id)
    if not user:
        raise HTTPException(status_code=404, detail=USER_NOT_FOUND)  # NOSONAR
    if str(user.id) == str(current_user.id) and payload.status != "active":
        raise HTTPException(status_code=400, detail="You cannot suspend your own account")  # NOSONAR
    user.status = payload.status
    await db.flush()
    await db.refresh(user)
    return serialize(user)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(get_admin_user),
):
    user = await crud.get_item(db, Profile, user_id)
    if not user:
        raise HTTPException(status_code=404, detail=USER_NOT_FOUND)  # NOSONAR
    await crud.delete_item(db, user)
    return None
