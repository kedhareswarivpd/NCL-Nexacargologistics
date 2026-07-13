"""
Health check endpoint for the API.
"""

from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check():
    """Health check endpoint - returns service status."""
    return {"status": "ok"}