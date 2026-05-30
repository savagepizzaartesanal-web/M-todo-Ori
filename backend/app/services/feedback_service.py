from datetime import UTC, datetime

import httpx
from fastapi import HTTPException, status

from app.schemas.auth import CurrentUser
from app.schemas.feedback import Produto1FeedbackRequest, Produto1FeedbackResponse
from app.services.auth_service import get_supabase_config
from app.services.produto1_service import get_supabase_rest_headers

TABLE_NAME = "produto_1_feedbacks"


def parse_datetime(value: str | None) -> datetime:
    if not value:
        return datetime.now(UTC)

    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def row_to_response(row: dict, current_user: CurrentUser) -> Produto1FeedbackResponse:
    return Produto1FeedbackResponse(
        user_id=row.get("user_id", current_user.user_id),
        email=row.get("email") or current_user.email,
        context=row.get("context") or "espelho-ori",
        response=row.get("response") or "",
        comment=row.get("comment"),
        resultado=row.get("resultado"),
        payload=row.get("payload") or {},
        created_at=parse_datetime(row.get("created_at")),
        updated_at=parse_datetime(row.get("updated_at")),
    )


async def get_produto1_feedback(
    *,
    current_user: CurrentUser,
    context: str = "espelho-ori",
) -> Produto1FeedbackResponse | None:
    supabase_url, _ = get_supabase_config()

    async with httpx.AsyncClient(timeout=8) as client:
        response = await client.get(
            f"{supabase_url}/rest/v1/{TABLE_NAME}",
            params={
                "select": "*",
                "user_id": f"eq.{current_user.user_id}",
                "context": f"eq.{context}",
                "limit": "1",
            },
            headers=get_supabase_rest_headers(current_user),
        )

    if response.status_code >= 400:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Não foi possível consultar o feedback da leitura.",
        )

    rows = response.json()
    return row_to_response(rows[0], current_user) if rows else None


async def save_produto1_feedback(
    *,
    payload: Produto1FeedbackRequest,
    current_user: CurrentUser,
) -> Produto1FeedbackResponse:
    supabase_url, _ = get_supabase_config()
    row_payload = {
        "user_id": current_user.user_id,
        "email": current_user.email,
        "context": payload.context,
        "response": payload.response,
        "comment": payload.comment,
        "resultado": payload.resultado,
        "payload": payload.payload or {},
    }
    headers = {
        **get_supabase_rest_headers(current_user),
        "Prefer": "resolution=merge-duplicates,return=representation",
    }

    async with httpx.AsyncClient(timeout=8) as client:
        response = await client.post(
            f"{supabase_url}/rest/v1/{TABLE_NAME}",
            params={"on_conflict": "user_id,context"},
            json=row_payload,
            headers=headers,
        )

    if response.status_code >= 400:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Não foi possível salvar o feedback da leitura.",
        )

    rows = response.json()
    return row_to_response(rows[0] if rows else row_payload, current_user)
