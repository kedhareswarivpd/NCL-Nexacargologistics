"""
Utility validators for API inputs.
Provides safe UUID parsing and common validation helpers.
"""

from uuid import UUID

from fastapi import HTTPException, Query, status


def safe_uuid(value: str, field_name: str = "id") -> UUID:
    """Parse a UUID string, returning 400 on invalid format."""
    try:
        return UUID(str(value))
    except (ValueError, AttributeError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid {field_name} format. Expected a valid UUID.",
        )


def safe_uuid_optional(value: str | None, field_name: str = "id") -> UUID | None:
    """Parse an optional UUID string, returning None if not provided."""
    if value is None:
        return None
    return safe_uuid(value, field_name)


def validate_pagination(
    skip: int = Query(default=0, ge=0, description="Number of records to skip"),
    limit: int = Query(default=50, ge=1, le=200, description="Max records to return"),
) -> tuple[int, int]:
    """Validate and return pagination parameters."""
    return skip, limit
