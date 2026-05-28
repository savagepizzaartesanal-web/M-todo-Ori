import asyncio

import httpx
from fastapi import HTTPException, status

from app.schemas.admin import AdminClienteUpdate
from app.schemas.auth import CurrentUser
from app.services.auth_service import get_supabase_config

CLIENTES_TABLE = "clientes"
PRODUTO_1_TABLE = "produto_1_respostas"
ORACULO_TABLE = "oraculo_cartas_diarias"


def get_supabase_rest_headers(current_user: CurrentUser) -> dict[str, str]:
    _, publishable_key = get_supabase_config()

    if not current_user.access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autenticação ausente.",
        )

    return {
        "apikey": publishable_key,
        "Authorization": f"Bearer {current_user.access_token}",
        "Content-Type": "application/json",
    }


async def ensure_admin(current_user: CurrentUser) -> None:
    supabase_url, _ = get_supabase_config()

    async with httpx.AsyncClient(timeout=8) as client:
        response = await client.get(
            f"{supabase_url}/rest/v1/{CLIENTES_TABLE}",
            params={
                "select": "id,admin",
                "user_id": f"eq.{current_user.user_id}",
                "limit": "1",
            },
            headers=get_supabase_rest_headers(current_user),
        )

    if response.status_code >= 400:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Não foi possível validar o acesso administrativo.",
        )

    rows = response.json()
    if not rows or rows[0].get("admin") is not True:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso administrativo necessário.",
        )


async def fetch_admin_overview(current_user: CurrentUser) -> dict:
    await ensure_admin(current_user)
    supabase_url, _ = get_supabase_config()
    headers = get_supabase_rest_headers(current_user)

    async with httpx.AsyncClient(timeout=10) as client:
        clientes_response, respostas_response, oraculo_response = await asyncio.gather(
            client.get(
                f"{supabase_url}/rest/v1/{CLIENTES_TABLE}",
                params={"select": "*", "order": "created_at.desc"},
                headers=headers,
            ),
            client.get(
                f"{supabase_url}/rest/v1/{PRODUTO_1_TABLE}",
                params={
                    "select": (
                        "user_id,email,answers,answered_count,total_questions,"
                        "is_complete,result,created_at,updated_at"
                    ),
                    "order": "updated_at.desc",
                },
                headers=headers,
            ),
            client.get(
                f"{supabase_url}/rest/v1/{ORACULO_TABLE}",
                params={
                    "select": "*",
                    "order": "date_key.desc,created_at.desc",
                },
                headers=headers,
            ),
        )

    for response in (clientes_response, respostas_response, oraculo_response):
        if response.status_code >= 400:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Não foi possível carregar os dados administrativos.",
            )

    return {
        "clientes": clientes_response.json(),
        "respostas_produto1": respostas_response.json(),
        "cartas_oraculo": oraculo_response.json(),
    }


async def fetch_admin_cliente(cliente_id: str, current_user: CurrentUser) -> dict:
    await ensure_admin(current_user)
    supabase_url, _ = get_supabase_config()
    headers = get_supabase_rest_headers(current_user)

    async with httpx.AsyncClient(timeout=10) as client:
        cliente_response = await client.get(
            f"{supabase_url}/rest/v1/{CLIENTES_TABLE}",
            params={"select": "*", "id": f"eq.{cliente_id}", "limit": "1"},
            headers=headers,
        )

    if cliente_response.status_code >= 400:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Não foi possível carregar a cliente.",
        )

    clientes = cliente_response.json()
    if not clientes:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente não encontrada.",
        )

    cliente = clientes[0]
    user_id = cliente.get("user_id")
    produto1 = None
    oraculo = None

    if user_id:
        async with httpx.AsyncClient(timeout=10) as client:
            respostas_response, oraculo_response = await asyncio.gather(
                client.get(
                    f"{supabase_url}/rest/v1/{PRODUTO_1_TABLE}",
                    params={"select": "*", "user_id": f"eq.{user_id}", "limit": "1"},
                    headers=headers,
                ),
                client.get(
                    f"{supabase_url}/rest/v1/{ORACULO_TABLE}",
                    params={
                        "select": "*",
                        "user_id": f"eq.{user_id}",
                        "order": "date_key.desc,created_at.desc",
                        "limit": "1",
                    },
                    headers=headers,
                ),
            )

        for response in (respostas_response, oraculo_response):
            if response.status_code >= 400:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="Não foi possível carregar os detalhes da cliente.",
                )

        produto1_rows = respostas_response.json()
        oraculo_rows = oraculo_response.json()
        produto1 = produto1_rows[0] if produto1_rows else None
        oraculo = oraculo_rows[0] if oraculo_rows else None

    return {
        "cliente": cliente,
        "produto1_respostas": produto1,
        "oraculo_carta": oraculo,
    }


async def update_admin_cliente(
    cliente_id: str,
    payload: AdminClienteUpdate,
    current_user: CurrentUser,
) -> dict:
    await ensure_admin(current_user)
    supabase_url, _ = get_supabase_config()
    updates = payload.model_dump(exclude_unset=True)

    if not updates:
        return await fetch_admin_cliente(cliente_id, current_user)

    headers = {
        **get_supabase_rest_headers(current_user),
        "Prefer": "return=representation",
    }

    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.patch(
            f"{supabase_url}/rest/v1/{CLIENTES_TABLE}",
            params={"id": f"eq.{cliente_id}"},
            json=updates,
            headers=headers,
        )

    if response.status_code >= 400:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Não foi possível atualizar a cliente.",
        )

    rows = response.json()
    if not rows:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente não encontrada.",
        )

    return await fetch_admin_cliente(cliente_id, current_user)
