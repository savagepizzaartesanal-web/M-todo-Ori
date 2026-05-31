import httpx
from fastapi import HTTPException, status

from app.schemas.auth import CurrentUser
from app.schemas.oraculo import OraculoCartaDiaRequest, OraculoCartaDiaResponse
from app.services.auth_service import get_supabase_config
from app.services.produto1_service import get_supabase_rest_headers

TABLE_NAME = "oraculo_cartas_diarias"


def row_to_response(row: dict | None) -> OraculoCartaDiaResponse:
    if not row:
        return OraculoCartaDiaResponse()

    payload = row.get("payload") or {}

    return OraculoCartaDiaResponse(
        hasCard=True,
        dateKey=str(row.get("date_key") or payload.get("dateKey") or ""),
        cardId=row.get("card_id") or payload.get("cardId"),
        cardTitle=row.get("card_title") or payload.get("cardTitle"),
        revealLabel=row.get("reveal_label") or payload.get("revealLabel"),
        code=row.get("code") or payload.get("code"),
        message=row.get("message") or payload.get("message"),
        cardOrder=payload.get("cardOrder") or [],
    )


async def get_carta_do_dia(
    *,
    date_key: str,
    current_user: CurrentUser,
) -> OraculoCartaDiaResponse:
    supabase_url, _ = get_supabase_config()

    async with httpx.AsyncClient(timeout=8) as client:
        response = await client.get(
            f"{supabase_url}/rest/v1/{TABLE_NAME}",
            params={
                "select": "*",
                "user_id": f"eq.{current_user.user_id}",
                "date_key": f"eq.{date_key}",
                "limit": "1",
            },
            headers=get_supabase_rest_headers(current_user),
        )

    if response.status_code >= 400:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Não foi possível consultar a carta diária.",
        )

    rows = response.json()
    return row_to_response(rows[0] if rows else None)


async def salvar_carta_do_dia(
    *,
    payload: OraculoCartaDiaRequest,
    current_user: CurrentUser,
) -> OraculoCartaDiaResponse:
    supabase_url, _ = get_supabase_config()
    row_payload = {
        "user_id": current_user.user_id,
        "email": current_user.email,
        "date_key": str(payload.dateKey),
        "card_id": payload.cardId,
        "card_title": payload.cardTitle,
        "reveal_label": payload.revealLabel,
        "code": payload.code,
        "message": payload.message,
        "payload": payload.model_dump(mode="json"),
    }
    headers = {
        **get_supabase_rest_headers(current_user),
        "Prefer": "resolution=merge-duplicates,return=representation",
    }

    async with httpx.AsyncClient(timeout=8) as client:
        response = await client.post(
            f"{supabase_url}/rest/v1/{TABLE_NAME}",
            params={"on_conflict": "user_id,date_key"},
            json=row_payload,
            headers=headers,
        )

    if response.status_code >= 400:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Não foi possível salvar a carta diária.",
        )

    rows = response.json()
    return row_to_response(rows[0] if rows else row_payload)
