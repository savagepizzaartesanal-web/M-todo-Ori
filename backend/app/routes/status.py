import os

from fastapi import APIRouter

router = APIRouter(prefix="/api", tags=["status"])


@router.get("/status")
def api_status():
    return {
        "api": "online",
        "frontend_origin": os.getenv(
            "FRONTEND_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173",
        ),
        "environment": os.getenv("APP_ENV", "development"),
    }
