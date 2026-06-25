import uuid

from fastapi import Request, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.core.security import verify_access_token, TokenError
from app.models.profile import Profile

bearer = HTTPBearer(auto_error=False)


def _extract_token(request: Request, credentials: HTTPAuthorizationCredentials | None) -> str | None:
    if credentials:
        return credentials.credentials
    cookie = request.cookies.get("access_token")
    if cookie and cookie.startswith("Bearer "):
        return cookie[7:]
    return cookie


async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_db),
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
) -> Profile:
    token = _extract_token(request, credentials)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    try:
        claims = await verify_access_token(token)
    except TokenError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc))

    user_id = uuid.UUID(claims["id"])
    result = await db.execute(select(Profile).where(Profile.id == user_id))
    profile = result.scalar_one_or_none()

    if profile is None:
        profile = Profile(
            id=user_id,
            email=claims.get("email") or "",
            name=claims.get("name") or (claims.get("email") or "User").split("@")[0],
            role=claims.get("role") or "customer",
            phone=claims.get("phone"),
            company=claims.get("company"),
        )
        db.add(profile)
        await db.flush()
    else:
        if claims.get("email") and profile.email != claims["email"]:
            profile.email = claims["email"]

    return profile


async def get_current_user_optional(
    request: Request,
    db: AsyncSession = Depends(get_db),
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
) -> Profile | None:
    try:
        return await get_current_user(request, db, credentials)
    except HTTPException:
        return None
