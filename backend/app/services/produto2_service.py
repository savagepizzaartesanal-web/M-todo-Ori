import json
from datetime import UTC, date, datetime
from typing import Any

import httpx
from fastapi import HTTPException, status

from app.schemas.auth import CurrentUser
from app.schemas.produto2 import (
    Produto2AdminResponse,
    Produto2AdminUpdateRequest,
    Produto2DossieResponse,
    Produto2InsumosRequest,
    Produto2PublishRequest,
)
from app.services.admin_service import ensure_admin
from app.services.auth_service import get_supabase_config
from app.services.jornada_service import fetch_current_cliente
from app.services.produto1_service import get_produto1_respostas
from app.services.produto2_calculo_service import build_produto2_analise_preliminar

PRODUTO_2_TABLE = "produto_2_dossies"
CLIENTES_TABLE = "clientes"


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


def _clean(value: Any) -> str:
    return str(value or "").strip()


def _parse_profile(profile_data: Any) -> dict[str, Any]:
    if not profile_data:
        return {}

    if isinstance(profile_data, dict):
        return profile_data

    try:
        parsed = json.loads(profile_data)
    except (TypeError, json.JSONDecodeError):
        return {}

    return parsed if isinstance(parsed, dict) else {}


def _age_from_birth_date(value: Any) -> str:
    text = _clean(value)
    if not text:
        return ""

    try:
        born = date.fromisoformat(text[:10])
    except ValueError:
        return ""

    today = date.today()
    age = today.year - born.year - ((today.month, today.day) < (born.month, born.day))
    return str(age) if age >= 0 else ""


def _map_racial_identity(value: Any) -> str:
    text = _clean(value)
    lower = text.lower()

    if lower in {"preta", "parda"}:
        return "Negra (preta ou parda)"
    if lower == "branca":
        return "Branca"
    if lower == "indígena" or lower == "indigena":
        return "Indígena"
    if lower == "amarela":
        return "Asiática"
    if lower == "prefiro não responder":
        return "Prefiro não declarar"

    return text


def _deep_merge(base: dict[str, Any], overlay: dict[str, Any] | None) -> dict[str, Any]:
    next_value = dict(base)

    for key, value in (overlay or {}).items():
        if isinstance(next_value.get(key), dict) and isinstance(value, dict):
            next_value[key] = _deep_merge(next_value[key], value)
        else:
            next_value[key] = value

    return next_value


def _set_path(target: dict[str, Any], path: str, value: Any) -> None:
    current = target
    keys = path.split(".")

    for key in keys[:-1]:
        current[key] = dict(current.get(key) or {})
        current = current[key]

    current[keys[-1]] = value


def build_produto2_prefill_insumos(
    *,
    cliente: dict | None,
    produto1_result: dict[str, Any] | None = None,
) -> dict[str, Any]:
    profile = _parse_profile((cliente or {}).get("perfil_onboarding"))
    pain = profile.get("mainPainCustom") if profile.get("mainPain") == "Quero escrever com minhas palavras" else profile.get("mainPain")
    result = produto1_result or {}

    nome = (
        _clean(profile.get("preferredName"))
        or _clean(profile.get("fullName"))
        or _clean((cliente or {}).get("nome"))
    )
    autoidentificacao = _map_racial_identity(profile.get("racialIdentity"))

    return {
        "dados_base": {
            "nome": nome,
            "idade": _age_from_birth_date(profile.get("birthDate")),
            "endereco": _clean(profile.get("residenceLocation")),
            "whatsapp": _clean(profile.get("whatsapp")),
            "email": _clean((cliente or {}).get("email")),
            "autoidentificacao_racial": autoidentificacao,
        },
        "essencia": {
            "deusa_principal": _clean(result.get("principal") or (cliente or {}).get("arquetipo_principal")),
            "deusa_auxiliar": _clean(result.get("secundario") or (cliente or {}).get("arquetipo_secundario")),
            "arquetipo_mesclado": _clean(result.get("nomeComposto") or (cliente or {}).get("resultado")),
        },
        "jornada": {
            "resultado_produto_1": _clean(result.get("nomeComposto") or (cliente or {}).get("resultado")),
            "momento_atual": _clean(profile.get("journeyStage") or (cliente or {}).get("momento_atual")),
            "dor_atual": _clean(pain or (cliente or {}).get("principal_dor")),
            "objetivo_principal": _clean(profile.get("mainDesire") or (cliente or {}).get("objetivo_principal")),
            "perfil_onboarding_concluido": bool((cliente or {}).get("perfil_onboarding_concluido")),
        },
    }


def merge_produto2_insumos_with_context(
    *,
    stored_insumos: dict[str, Any] | None,
    cliente: dict | None,
    produto1_result: dict[str, Any] | None = None,
) -> dict[str, Any]:
    base = build_produto2_prefill_insumos(cliente=cliente, produto1_result=produto1_result)
    merged = _deep_merge(base, stored_insumos or {})

    # Esses campos pertencem à jornada/cadastro e continuam vindo do servidor.
    for path in (
        "dados_base.nome",
        "dados_base.idade",
        "dados_base.endereco",
        "dados_base.whatsapp",
        "dados_base.email",
        "essencia.deusa_principal",
        "essencia.deusa_auxiliar",
        "essencia.arquetipo_mesclado",
        "jornada.resultado_produto_1",
        "jornada.momento_atual",
        "jornada.dor_atual",
        "jornada.objetivo_principal",
        "jornada.perfil_onboarding_concluido",
    ):
        value = path.split(".")
        source: Any = base
        for key in value:
            source = source.get(key) if isinstance(source, dict) else None
        _set_path(merged, path, source)

    return merged


async def get_produto1_result_context(current_user: CurrentUser) -> dict[str, Any] | None:
    respostas = await get_produto1_respostas(current_user=current_user)
    return respostas.result.model_dump() if respostas.result else None


def empty_response(
    cliente: dict | None,
    produto1_result: dict[str, Any] | None = None,
) -> Produto2DossieResponse:
    return Produto2DossieResponse(
        cliente_id=str(cliente.get("id")) if cliente and cliente.get("id") else None,
        status="aguardando_insumos",
        produto_2_liberado=bool((cliente or {}).get("produto_2_liberado")),
        insumos=merge_produto2_insumos_with_context(
            stored_insumos=None,
            cliente=cliente,
            produto1_result=produto1_result,
        ),
    )


def row_to_response(
    row: dict[str, Any],
    cliente: dict | None = None,
    produto1_result: dict[str, Any] | None = None,
) -> Produto2DossieResponse:
    return Produto2DossieResponse(
        id=row.get("id"),
        cliente_id=row.get("cliente_id"),
        status=row.get("status") or "aguardando_insumos",
        produto_2_liberado=bool((cliente or {}).get("produto_2_liberado")),
        insumos=merge_produto2_insumos_with_context(
            stored_insumos=row.get("insumos") or {},
            cliente=cliente,
            produto1_result=produto1_result,
        ),
        analise_preliminar=row.get("analise_preliminar") or {},
        diagnosticos=row.get("diagnosticos") or {},
        dossie=row.get("dossie") or {},
        enviado_em=row.get("enviado_em"),
        publicado_em=row.get("publicado_em"),
        created_at=row.get("created_at"),
        updated_at=row.get("updated_at"),
    )


def row_to_admin_response(
    row: dict[str, Any] | None,
    cliente: dict[str, Any],
) -> Produto2AdminResponse:
    if not row:
        base = empty_response(cliente).model_dump()
        return Produto2AdminResponse(**base, cliente=cliente)

    return Produto2AdminResponse(
        **row_to_response(row, cliente).model_dump(),
        cliente=cliente,
    )


async def fetch_produto2_row_by_cliente_id(
    *,
    cliente_id: str,
    current_user: CurrentUser,
) -> dict[str, Any] | None:
    supabase_url, _ = get_supabase_config()

    async with httpx.AsyncClient(timeout=8) as client:
        response = await client.get(
            f"{supabase_url}/rest/v1/{PRODUTO_2_TABLE}",
            params={
                "select": "*",
                "cliente_id": f"eq.{cliente_id}",
                "limit": "1",
            },
            headers=get_supabase_rest_headers(current_user),
        )

    if response.status_code == 404:
        return None

    if response.status_code >= 400:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Não foi possível consultar o Dossiê ORI.",
        )

    rows = response.json()
    return rows[0] if rows else None


async def fetch_cliente_by_id(
    *,
    cliente_id: str,
    current_user: CurrentUser,
) -> dict[str, Any]:
    supabase_url, _ = get_supabase_config()

    async with httpx.AsyncClient(timeout=8) as client:
        response = await client.get(
            f"{supabase_url}/rest/v1/{CLIENTES_TABLE}",
            params={"select": "*", "id": f"eq.{cliente_id}", "limit": "1"},
            headers=get_supabase_rest_headers(current_user),
        )

    if response.status_code >= 400:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Não foi possível carregar a cliente.",
        )

    rows = response.json()
    if not rows:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente não encontrada.",
        )

    return rows[0]


def ensure_produto2_released(cliente: dict | None) -> None:
    if not cliente or not cliente.get("id"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil da cliente não encontrado.",
        )

    if not cliente.get("produto_2_liberado"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Dossiê ORI ainda não liberado para esta cliente.",
        )


async def upsert_produto2_row(
    *,
    cliente_id: str,
    payload: dict[str, Any],
    current_user: CurrentUser,
) -> dict[str, Any]:
    supabase_url, _ = get_supabase_config()
    headers = {
        **get_supabase_rest_headers(current_user),
        "Prefer": "resolution=merge-duplicates,return=representation",
    }

    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.post(
            f"{supabase_url}/rest/v1/{PRODUTO_2_TABLE}",
            params={"on_conflict": "cliente_id"},
            json={"cliente_id": cliente_id, **payload},
            headers=headers,
        )

    if response.status_code >= 400:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Não foi possível salvar o Dossiê ORI.",
        )

    rows = response.json()
    if not rows:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="O Supabase não confirmou o Dossiê ORI salvo.",
        )

    return rows[0]


async def patch_produto2_row(
    *,
    cliente_id: str,
    payload: dict[str, Any],
    current_user: CurrentUser,
) -> dict[str, Any]:
    supabase_url, _ = get_supabase_config()
    headers = {
        **get_supabase_rest_headers(current_user),
        "Prefer": "return=representation",
    }

    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.patch(
            f"{supabase_url}/rest/v1/{PRODUTO_2_TABLE}",
            params={"cliente_id": f"eq.{cliente_id}"},
            json=payload,
            headers=headers,
        )

    if response.status_code >= 400:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Não foi possível atualizar o Dossiê ORI.",
        )

    rows = response.json()
    if not rows:
        return await upsert_produto2_row(
            cliente_id=cliente_id,
            payload=payload,
            current_user=current_user,
        )

    return rows[0]


async def update_cliente_status_jornada(
    *,
    cliente_id: str,
    status_jornada: str,
    current_user: CurrentUser,
) -> None:
    supabase_url, _ = get_supabase_config()

    async with httpx.AsyncClient(timeout=8) as client:
        response = await client.patch(
            f"{supabase_url}/rest/v1/{CLIENTES_TABLE}",
            params={"id": f"eq.{cliente_id}"},
            json={"status_jornada": status_jornada},
            headers=get_supabase_rest_headers(current_user),
        )

    if response.status_code >= 400:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Não foi possível atualizar o status da jornada.",
        )


async def get_produto2_me(
    *,
    current_user: CurrentUser,
) -> Produto2DossieResponse:
    cliente = await fetch_current_cliente(current_user)
    produto1_result = await get_produto1_result_context(current_user)

    if not cliente:
        return empty_response(None, produto1_result=produto1_result)

    row = await fetch_produto2_row_by_cliente_id(
        cliente_id=str(cliente["id"]),
        current_user=current_user,
    )

    if not row:
        return empty_response(cliente, produto1_result=produto1_result)

    response = row_to_response(row, cliente, produto1_result=produto1_result)

    if response.status != "publicado":
        response.dossie = {}
        response.diagnosticos = {}

    return response


async def save_produto2_insumos(
    *,
    payload: Produto2InsumosRequest,
    current_user: CurrentUser,
) -> Produto2DossieResponse:
    cliente = await fetch_current_cliente(current_user)
    ensure_produto2_released(cliente)
    cliente_id = str(cliente["id"])
    produto1_result = await get_produto1_result_context(current_user)
    current_row = await fetch_produto2_row_by_cliente_id(
        cliente_id=cliente_id,
        current_user=current_user,
    )

    if current_row and current_row.get("status") == "publicado":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Dossiê ORI publicado não pode receber novos insumos.",
        )

    next_status = current_row.get("status") if current_row else "aguardando_insumos"
    next_insumos = merge_produto2_insumos_with_context(
        stored_insumos=payload.insumos,
        cliente=cliente,
        produto1_result=produto1_result,
    )
    row = await upsert_produto2_row(
        cliente_id=cliente_id,
        payload={
            "status": next_status,
            "insumos": next_insumos,
        },
        current_user=current_user,
    )

    return row_to_response(row, cliente, produto1_result=produto1_result)


async def submit_produto2_insumos(
    *,
    payload: Produto2InsumosRequest,
    current_user: CurrentUser,
) -> Produto2DossieResponse:
    cliente = await fetch_current_cliente(current_user)
    ensure_produto2_released(cliente)
    cliente_id = str(cliente["id"])
    produto1_result = await get_produto1_result_context(current_user)
    current_row = await fetch_produto2_row_by_cliente_id(
        cliente_id=cliente_id,
        current_user=current_user,
    )

    if current_row and current_row.get("status") == "publicado":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Dossiê ORI publicado não pode receber novo envio.",
        )

    next_insumos = merge_produto2_insumos_with_context(
        stored_insumos=payload.insumos,
        cliente=cliente,
        produto1_result=produto1_result,
    )
    analise = build_produto2_analise_preliminar(
        insumos=next_insumos,
        produto1_result=produto1_result,
        cliente=cliente,
    )
    enviado_em = datetime.now(UTC).isoformat()
    row = await upsert_produto2_row(
        cliente_id=cliente_id,
        payload={
            "status": "em_analise",
            "insumos": next_insumos,
            "analise_preliminar": analise,
            "enviado_em": enviado_em,
        },
        current_user=current_user,
    )
    await update_cliente_status_jornada(
        cliente_id=cliente_id,
        status_jornada="Dossiê ORI em análise",
        current_user=current_user,
    )

    return row_to_response(row, cliente, produto1_result=produto1_result)


async def get_admin_produto2(
    *,
    cliente_id: str,
    current_user: CurrentUser,
) -> Produto2AdminResponse:
    await ensure_admin(current_user)
    cliente = await fetch_cliente_by_id(cliente_id=cliente_id, current_user=current_user)
    row = await fetch_produto2_row_by_cliente_id(
        cliente_id=cliente_id,
        current_user=current_user,
    )

    return row_to_admin_response(row, cliente)


async def update_admin_produto2(
    *,
    cliente_id: str,
    payload: Produto2AdminUpdateRequest,
    current_user: CurrentUser,
) -> Produto2AdminResponse:
    await ensure_admin(current_user)
    cliente = await fetch_cliente_by_id(cliente_id=cliente_id, current_user=current_user)
    updates = payload.model_dump(exclude_unset=True)

    if not updates:
        return await get_admin_produto2(cliente_id=cliente_id, current_user=current_user)

    row = await upsert_produto2_row(
        cliente_id=cliente_id,
        payload=updates,
        current_user=current_user,
    )

    return row_to_admin_response(row, cliente)


async def publish_admin_produto2(
    *,
    cliente_id: str,
    payload: Produto2PublishRequest,
    current_user: CurrentUser,
) -> Produto2AdminResponse:
    await ensure_admin(current_user)
    cliente = await fetch_cliente_by_id(cliente_id=cliente_id, current_user=current_user)
    publicado_em = datetime.now(UTC).isoformat()
    row = await upsert_produto2_row(
        cliente_id=cliente_id,
        payload={
            "status": "publicado",
            "diagnosticos": payload.diagnosticos,
            "dossie": payload.dossie,
            "publicado_em": publicado_em,
        },
        current_user=current_user,
    )
    await update_cliente_status_jornada(
        cliente_id=cliente_id,
        status_jornada="Dossiê ORI publicado",
        current_user=current_user,
    )

    return row_to_admin_response(row, cliente)


async def unpublish_admin_produto2(
    *,
    cliente_id: str,
    current_user: CurrentUser,
) -> Produto2AdminResponse:
    await ensure_admin(current_user)
    cliente = await fetch_cliente_by_id(cliente_id=cliente_id, current_user=current_user)
    row = await patch_produto2_row(
        cliente_id=cliente_id,
        payload={
            "status": "em_analise",
            "publicado_em": None,
        },
        current_user=current_user,
    )
    await update_cliente_status_jornada(
        cliente_id=cliente_id,
        status_jornada="Dossiê ORI em análise",
        current_user=current_user,
    )

    return row_to_admin_response(row, cliente)
