"""
Standardized API response schemas.

All endpoints should return these structures for consistency:
- Single resource: direct object
- List of resources: {"items": [...], "total": n, "skip": s, "limit": l}
- Created resource: object with 201 status
- Deleted: 204 No Content
"""

from typing import Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


classListResponse(BaseModel, Generic[T]):
    """Standard paginated list response."""

    items: list[T]
    total: int
    skip: int
    limit: int


class MessageResponse(BaseModel):
    """Simple message response."""

    message: str


class ErrorResponse(BaseModel):
    """Error response."""

    detail: str


class IdResponse(BaseModel):
    """Response containing only an ID."""

    id: str
