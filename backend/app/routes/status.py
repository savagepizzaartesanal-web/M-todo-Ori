from fastapi import APIRouter

router = APIRouter(prefix="/api", tags=["status"])


@router.get("/status")
def api_status():
    return {
        "api": "online",
    }
