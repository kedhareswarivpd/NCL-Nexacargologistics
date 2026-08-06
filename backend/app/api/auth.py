import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.config import settings
from app.core.database import get_db
from app.core.security import (
    create_access_token,
    create_password_reset_token,
    hash_password,
    verify_password,
    verify_password_reset_token,
    TokenError,
)
from app.middleware.auth import get_current_user
from app.models.profile import Profile, UserRole
from app.schemas.payloads import (
    ChangePasswordRequest,
    ForgotPasswordRequest,
    LoginRequest,
    ProfileUpdate,
    RegisterRequest,
    ResetPasswordRequest,
)
from app.services.crud import update_item
from app.services.notification_service import create_notification
from app.utils.constants import EMAIL_EXISTS
from app.utils.helpers import serialize

router = APIRouter(prefix="/auth", tags=["auth"])

AUTH_NOT_CONFIGURED = "Backend auth is not configured"
USER_NOT_FOUND = "User not found"


def _token_response(profile: Profile) -> dict:
    token = create_access_token(
        subject=str(profile.id),
        email=profile.email,
        role=profile.role,
        name=profile.name,
    )
    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": serialize(profile),
    }


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest, db: AsyncSession = Depends(get_db)):
    if not settings.JWT_SECRET:
        raise HTTPException(  # NOSONAR
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=AUTH_NOT_CONFIGURED,
        )

    email = payload.email.lower().strip()
    existing = await db.execute(select(Profile).where(Profile.email == email))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(  # NOSONAR
            status_code=status.HTTP_409_CONFLICT,
            detail=EMAIL_EXISTS,
        )

    profile = Profile(
        id=uuid.uuid4(),
        email=email,
        name=payload.name.strip(),
        role=UserRole.CUSTOMER,
        phone=payload.phone,
        company=payload.company,
        password_hash=hash_password(payload.password),
    )
    db.add(profile)
    await db.flush()
    return _token_response(profile)


@router.post("/login")
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    if not settings.JWT_SECRET:
        raise HTTPException(  # NOSONAR
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=AUTH_NOT_CONFIGURED,
        )

    email = payload.email.lower().strip()
    result = await db.execute(select(Profile).where(Profile.email == email))
    profile = result.scalar_one_or_none()

    if profile is None or not verify_password(payload.password, profile.password_hash):
        raise HTTPException(  # NOSONAR
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    if profile.status != "active":
        raise HTTPException(  # NOSONAR
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account is not active",
        )

    return _token_response(profile)


@router.get("/me")
async def get_me(current_user: Profile = Depends(get_current_user)):
    return serialize(current_user)


@router.patch("/me")
@router.put("/me")
async def update_me(
    payload: ProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    updated = await update_item(db, current_user, payload.model_dump(exclude_unset=True))
    return serialize(updated)


@router.post("/refresh-token")
async def refresh_token(current_user: Profile = Depends(get_current_user)):
    if not settings.JWT_SECRET:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=AUTH_NOT_CONFIGURED)  # NOSONAR
    return _token_response(current_user)


@router.post("/logout")
async def logout(current_user: Profile = Depends(get_current_user)):
    return {"message": "Logged out", "user_id": str(current_user.id)}


@router.post("/forgot-password")
async def forgot_password(payload: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    email = payload.email.lower().strip()
    result = await db.execute(select(Profile).where(Profile.email == email))
    profile = result.scalar_one_or_none()
    if profile is not None and settings.JWT_SECRET:
        _reset_token = create_password_reset_token(str(profile.id))
        await create_notification(
            db,
            user_id=str(profile.id),
            title="Password reset requested",
            message="A password reset link has been dispatched to your email address.",
            channel="email",
            type="system",
            email_to=profile.email,
        )
    return {"message": "If an account exists for that email, a reset link has been sent."}


@router.post("/reset-password")
async def reset_password(payload: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    try:
        user_id = verify_password_reset_token(payload.token)
    except TokenError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))  # NOSONAR

    profile = await db.get(Profile, uuid.UUID(user_id))
    if profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=USER_NOT_FOUND)  # NOSONAR
    profile.password_hash = hash_password(payload.new_password)
    await db.flush()
    return {"message": "Password has been reset. You can now log in."}


@router.post("/change-password")
async def change_password(
    payload: ChangePasswordRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user),  # NOSONAR
):
    if not current_user.password_hash:
        raise HTTPException(  # NOSONAR
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This account uses Supabase sign-in; change the password there.",
        )
    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Current password is incorrect")  # NOSONAR
    current_user.password_hash = hash_password(payload.new_password)
    await db.flush()
    return {"message": "Password updated successfully."}
