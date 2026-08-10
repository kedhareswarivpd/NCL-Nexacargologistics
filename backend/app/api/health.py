"""
Health check endpoint — comprehensive service health & diagnostics monitoring.
"""

import time
import os
import psutil
from datetime import datetime, timezone
import urllib.request

from fastapi import APIRouter, Depends
from sqlalchemy import text, select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.profile import Profile
from app.models.shipment import Shipment
from app.models.finance import Invoice
from app.models.shipment import Quote
from app.models.support import SupportTicket

router = APIRouter(tags=["health"])

START_TIME = time.time()


@router.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    """Comprehensive health check endpoint — monitors DB, Supabase Auth, System Metrics & Table stats."""
    services = {}
    is_degraded = False

    # 1. Database Health & Ping Latency Check
    db_start = time.perf_counter()
    try:
        await db.execute(text("SELECT 1"))
        db_latency_ms = round((time.perf_counter() - db_start) * 1000, 2)
        services["database"] = {
            "status": "up",
            "latency_ms": db_latency_ms,
            "message": "Database connection healthy"
        }
    except Exception as exc:
        services["database"] = {
            "status": "down",
            "error": str(exc),
            "message": "Database connection failed"
        }
        is_degraded = True

    # 2. Supabase Auth Health Check
    auth_start = time.perf_counter()
    try:
        req = urllib.request.Request(
            "https://sgwywgrabomkbegnsref.supabase.co/auth/v1/health",
            headers={"User-Agent": "NexaCargo-HealthCheck/1.0"}
        )
        with urllib.request.urlopen(req, timeout=3) as resp:
            auth_latency_ms = round((time.perf_counter() - auth_start) * 1000, 2)
            services["auth_service"] = {
                "status": "up" if resp.status < 400 else "degraded",
                "latency_ms": auth_latency_ms,
                "message": "Supabase Auth operational"
            }
    except Exception as exc:
        services["auth_service"] = {
            "status": "degraded",
            "error": str(exc),
            "message": "Supabase Auth check skipped or unreachable"
        }

    # 3. System Memory & Process Stats
    try:
        process = psutil.Process(os.getpid())
        mem_info = process.memory_info()
        services["system"] = {
            "status": "up",
            "memory_usage_mb": round(mem_info.rss / (1024 * 1024), 2),
            "pid": os.getpid()
        }
    except Exception:
        services["system"] = {"status": "up"}

    # 4. Key Table Row Counts (Quick operational metrics)
    counts = {}
    try:
        counts["users"] = (await db.execute(select(func.count()).select_from(Profile))).scalar() or 0
        counts["shipments"] = (await db.execute(select(func.count()).select_from(Shipment))).scalar() or 0
        counts["quotes"] = (await db.execute(select(func.count()).select_from(Quote))).scalar() or 0
        counts["invoices"] = (await db.execute(select(func.count()).select_from(Invoice))).scalar() or 0
        counts["support_tickets"] = (await db.execute(select(func.count()).select_from(SupportTicket))).scalar() or 0
    except Exception:
        pass

    uptime_seconds = int(time.time() - START_TIME)

    return {
        "status": "ok",
        "system_status": "degraded" if is_degraded else "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "uptime_seconds": uptime_seconds,
        "services": services,
        "metrics": counts,
    }