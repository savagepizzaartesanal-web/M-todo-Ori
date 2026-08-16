import os

import httpx
from fastapi import APIRouter

from app.services.leitura_service import ai_reading_enabled
from app.services.mercado_pago_service import check_mercado_pago_health

router = APIRouter(tags=["health"])


@router.get("/health")
def health_check():
    return {"ok": True}


@router.get("/health/dependencies")
async def dependencies_health_check():
    supabase_url = os.getenv("SUPABASE_URL", "").rstrip("/")
    publishable_key = os.getenv("SUPABASE_PUBLISHABLE_KEY", "")
    ai_provider = os.getenv("AI_PROVIDER", "openai").strip().lower()
    ai_key = (
        os.getenv("GEMINI_API_KEY")
        if ai_provider == "gemini"
        else os.getenv("OPENAI_API_KEY")
    )
    supabase_reachable = False

    if supabase_url and publishable_key:
        try:
            async with httpx.AsyncClient(timeout=4) as client:
                response = await client.get(
                    f"{supabase_url}/rest/v1/",
                    headers={"apikey": publishable_key},
                )
            supabase_reachable = response.status_code < 500
        except httpx.HTTPError:
            supabase_reachable = False

    mercado_pago_health = await check_mercado_pago_health()

    return {
        "ok": supabase_reachable,
        "supabase": {
            "configured": bool(supabase_url and publishable_key),
            "reachable": supabase_reachable,
        },
        "ai": {
            "provider": ai_provider,
            "configured": bool(ai_key),
            "reading_enabled": ai_reading_enabled(),
        },
        "mercado_pago": {
            "configured": mercado_pago_health["configured"],
            "reachable": mercado_pago_health["reachable"],
        },
    }
