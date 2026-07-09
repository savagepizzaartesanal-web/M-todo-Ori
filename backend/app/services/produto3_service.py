from collections import Counter
from datetime import UTC, datetime
from typing import Any

import httpx
from fastapi import HTTPException, status

from app.schemas.auth import CurrentUser
from app.schemas.produto3 import (
    Produto3AdminResponse,
    Produto3AdminUpdateRequest,
    Produto3CodigoFinalResponse,
    Produto3InsumosRequest,
    Produto3PublishRequest,
)
from app.services.admin_service import ensure_admin
from app.services.auth_service import get_supabase_config
from app.services.jornada_service import fetch_current_cliente
from app.services.produto1_service import get_produto1_respostas
from app.services.produto2_service import (
    fetch_cliente_by_id,
    fetch_produto2_row_by_cliente_id,
    get_supabase_rest_headers,
    update_cliente_status_jornada,
)

PRODUTO_3_TABLE = "produto_3_codigos_finais"
CLIENTES_TABLE = "clientes"


def _clean(value: Any) -> str:
    return str(value or "").strip()


def _deep_merge(base: dict[str, Any], overlay: dict[str, Any] | None) -> dict[str, Any]:
    next_value = dict(base)

    for key, value in (overlay or {}).items():
        if isinstance(next_value.get(key), dict) and isinstance(value, dict):
            next_value[key] = _deep_merge(next_value[key], value)
        else:
            next_value[key] = value

    return next_value


async def get_produto1_result_context(current_user: CurrentUser) -> dict[str, Any] | None:
    respostas = await get_produto1_respostas(current_user=current_user)
    return respostas.result.model_dump() if respostas.result else None


async def get_produto2_context(
    *,
    cliente_id: str,
    current_user: CurrentUser,
) -> dict[str, Any]:
    row = await fetch_produto2_row_by_cliente_id(
        cliente_id=cliente_id,
        current_user=current_user,
    )

    if not row or row.get("status") != "publicado":
        return {
            "produto_2_publicado": False,
            "resumo_corpo": {},
            "resumo_cor": {},
            "resumo_cabelo": {},
        }

    dossie = row.get("dossie") or {}
    diagnosticos = row.get("diagnosticos") or {}
    insumos = row.get("insumos") or {}

    return {
        "produto_2_publicado": True,
        "kibbe": _clean(diagnosticos.get("kibbe") or dossie.get("kibbe")),
        "influencia_corporal": _clean(
            diagnosticos.get("influencia_corporal") or dossie.get("influencia_corporal")
        ),
        "cartela_sazonal": _clean(
            diagnosticos.get("cartela_sazonal") or dossie.get("cartela_sazonal")
        ),
        "cartela_patton": _clean(
            diagnosticos.get("cartela_patton") or dossie.get("cartela_patton")
        ),
        "metal": _clean(diagnosticos.get("metal") or dossie.get("metal")),
        "resumo_corpo": dossie.get("corpo") or diagnosticos.get("corpo") or {},
        "resumo_cor": dossie.get("cor") or diagnosticos.get("cor") or {},
        "resumo_cabelo": dossie.get("cabelo") or diagnosticos.get("cabelo") or {},
        "insumos_produto_2": {
            "estrutura_corporal": insumos.get("estrutura_corporal") or {},
            "coloracao": insumos.get("coloracao") or {},
            "cabelo": insumos.get("cabelo") or {},
        },
    }


def build_produto3_base_insumos(
    *,
    cliente: dict | None,
    produto1_result: dict[str, Any] | None = None,
    produto2_context: dict[str, Any] | None = None,
) -> dict[str, Any]:
    result = produto1_result or {}
    produto2 = produto2_context or {}

    return {
        "contexto_jornada": {
            "resultado_produto_1": _clean(
                result.get("nomeComposto") or (cliente or {}).get("resultado")
            ),
            "arquetipo_principal": _clean(
                result.get("principal") or (cliente or {}).get("arquetipo_principal")
            ),
            "arquetipo_secundario": _clean(
                result.get("secundario") or (cliente or {}).get("arquetipo_secundario")
            ),
            "nome_arquetipico": _clean(
                result.get("nomeComposto") or (cliente or {}).get("resultado")
            ),
            "formula_produto_1": _clean(result.get("formula")),
            "produto_2_publicado": bool(produto2.get("produto_2_publicado")),
            "kibbe": _clean(produto2.get("kibbe")),
            "influencia_corporal": _clean(produto2.get("influencia_corporal")),
            "cartela_sazonal": _clean(produto2.get("cartela_sazonal")),
            "cartela_patton": _clean(produto2.get("cartela_patton")),
            "metal": _clean(produto2.get("metal")),
            "resumo_corpo": produto2.get("resumo_corpo") or {},
            "resumo_cor": produto2.get("resumo_cor") or {},
            "resumo_cabelo": produto2.get("resumo_cabelo") or {},
        },
        "perfil_capsula": {
            "estacao_ou_recorte": "",
            "tamanho_desejado": "",
            "neutra_1": "",
            "neutra_2": "",
            "destaque_1": "",
            "destaque_2": "",
            "destaque_3": "",
            "peca_base_da_capsula": "",
            "formula_de_imagem": "",
        },
        "rotina_real": {},
        "preferencias": {},
        "inventario": {
            "roupas": [],
            "calcados": [],
            "bolsas": [],
            "acessorios": [],
        },
        "uploads": {
            "fotos_visao_geral": [],
            "fotos_por_categoria": {},
            "looks_referencia": [],
        },
    }


def merge_produto3_insumos_with_context(
    *,
    stored_insumos: dict[str, Any] | None,
    cliente: dict | None,
    produto1_result: dict[str, Any] | None = None,
    produto2_context: dict[str, Any] | None = None,
) -> dict[str, Any]:
    base = build_produto3_base_insumos(
        cliente=cliente,
        produto1_result=produto1_result,
        produto2_context=produto2_context,
    )
    merged = _deep_merge(base, stored_insumos or {})
    merged["contexto_jornada"] = base["contexto_jornada"]
    return merged


def _iter_inventory_items(insumos: dict[str, Any]) -> list[dict[str, Any]]:
    inventario = insumos.get("inventario") or {}
    items: list[dict[str, Any]] = []

    for group in ("roupas", "calcados", "bolsas", "acessorios"):
        values = inventario.get(group) or []
        if isinstance(values, list):
            items.extend(item for item in values if isinstance(item, dict))

    return items


def build_produto3_analise_preliminar(insumos: dict[str, Any]) -> dict[str, Any]:
    items = _iter_inventory_items(insumos)
    category_counts = Counter(_clean(item.get("categoria")) or "Sem categoria" for item in items)
    usage_counts = Counter(_clean(item.get("uso_declarado")) or "sem_uso_declarado" for item in items)

    missing_photo = [
        item.get("id") or item.get("peca") or item.get("descricao")
        for item in items
        if not item.get("foto_paths")
    ]
    missing_usage = [
        item.get("id") or item.get("peca") or item.get("descricao")
        for item in items
        if not _clean(item.get("uso_declarado"))
    ]
    missing_context = [
        item.get("id") or item.get("peca") or item.get("descricao")
        for item in items
        if not item.get("contextos_uso") and not item.get("ocasiao")
    ]

    return {
        "total_itens": len(items),
        "por_categoria": dict(category_counts),
        "por_uso_declarado": dict(usage_counts),
        "pendencias": {
            "sem_foto": [value for value in missing_photo if value],
            "sem_uso_declarado": [value for value in missing_usage if value],
            "sem_contexto_uso": [value for value in missing_context if value],
        },
        "perfil_capsula": insumos.get("perfil_capsula") or {},
        "rotina_real": insumos.get("rotina_real") or {},
    }


def empty_response(
    cliente: dict | None,
    produto1_result: dict[str, Any] | None = None,
    produto2_context: dict[str, Any] | None = None,
) -> Produto3CodigoFinalResponse:
    return Produto3CodigoFinalResponse(
        cliente_id=str(cliente.get("id")) if cliente and cliente.get("id") else None,
        status="aguardando_inventario",
        produto_3_liberado=bool((cliente or {}).get("produto_3_liberado")),
        insumos=merge_produto3_insumos_with_context(
            stored_insumos=None,
            cliente=cliente,
            produto1_result=produto1_result,
            produto2_context=produto2_context,
        ),
    )


def row_to_response(
    row: dict[str, Any],
    cliente: dict | None = None,
    produto1_result: dict[str, Any] | None = None,
    produto2_context: dict[str, Any] | None = None,
) -> Produto3CodigoFinalResponse:
    return Produto3CodigoFinalResponse(
        id=row.get("id"),
        cliente_id=row.get("cliente_id"),
        status=row.get("status") or "aguardando_inventario",
        produto_3_liberado=bool((cliente or {}).get("produto_3_liberado")),
        insumos=merge_produto3_insumos_with_context(
            stored_insumos=row.get("insumos") or {},
            cliente=cliente,
            produto1_result=produto1_result,
            produto2_context=produto2_context,
        ),
        analise_preliminar=row.get("analise_preliminar") or {},
        diagnosticos=row.get("diagnosticos") or {},
        capsula=row.get("capsula") or {},
        enviado_em=row.get("enviado_em"),
        publicado_em=row.get("publicado_em"),
        created_at=row.get("created_at"),
        updated_at=row.get("updated_at"),
    )


def row_to_admin_response(
    row: dict[str, Any] | None,
    cliente: dict[str, Any],
) -> Produto3AdminResponse:
    if not row:
        base = empty_response(cliente).model_dump()
        return Produto3AdminResponse(**base, cliente=cliente)

    return Produto3AdminResponse(
        **row_to_response(row, cliente).model_dump(),
        cliente=cliente,
        ia_rascunho=row.get("ia_rascunho") or {},
        ia_versao=row.get("ia_versao"),
        ia_gerado_em=row.get("ia_gerado_em"),
        ia_revisado_em=row.get("ia_revisado_em"),
    )


async def fetch_produto3_row_by_cliente_id(
    *,
    cliente_id: str,
    current_user: CurrentUser,
) -> dict[str, Any] | None:
    supabase_url, _ = get_supabase_config()

    async with httpx.AsyncClient(timeout=8) as client:
        response = await client.get(
            f"{supabase_url}/rest/v1/{PRODUTO_3_TABLE}",
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
            detail="Não foi possível consultar o Código Final.",
        )

    rows = response.json()
    return rows[0] if rows else None


def ensure_produto3_released(cliente: dict | None) -> None:
    if not cliente or not cliente.get("id"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil da cliente não encontrado.",
        )

    if not cliente.get("produto_3_liberado"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Código Final ainda não liberado para esta cliente.",
        )


async def upsert_produto3_row(
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
            f"{supabase_url}/rest/v1/{PRODUTO_3_TABLE}",
            params={"on_conflict": "cliente_id"},
            json={"cliente_id": cliente_id, **payload},
            headers=headers,
        )

    if response.status_code >= 400:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Não foi possível salvar o Código Final.",
        )

    rows = response.json()
    if not rows:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="O Supabase não confirmou o Código Final salvo.",
        )

    return rows[0]


async def patch_produto3_row(
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
            f"{supabase_url}/rest/v1/{PRODUTO_3_TABLE}",
            params={"cliente_id": f"eq.{cliente_id}"},
            json=payload,
            headers=headers,
        )

    if response.status_code >= 400:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Não foi possível atualizar o Código Final.",
        )

    rows = response.json()
    if not rows:
        return await upsert_produto3_row(
            cliente_id=cliente_id,
            payload=payload,
            current_user=current_user,
        )

    return rows[0]


async def get_produto3_me(
    *,
    current_user: CurrentUser,
) -> Produto3CodigoFinalResponse:
    cliente = await fetch_current_cliente(current_user)
    produto1_result = await get_produto1_result_context(current_user)

    if not cliente:
        return empty_response(None, produto1_result=produto1_result)

    cliente_id = str(cliente["id"])
    produto2_context = await get_produto2_context(
        cliente_id=cliente_id,
        current_user=current_user,
    )
    row = await fetch_produto3_row_by_cliente_id(
        cliente_id=cliente_id,
        current_user=current_user,
    )

    if not row:
        return empty_response(
            cliente,
            produto1_result=produto1_result,
            produto2_context=produto2_context,
        )

    response = row_to_response(
        row,
        cliente,
        produto1_result=produto1_result,
        produto2_context=produto2_context,
    )

    if response.status != "publicado":
        response.capsula = {}
        response.diagnosticos = {}

    return response


async def save_produto3_insumos(
    *,
    payload: Produto3InsumosRequest,
    current_user: CurrentUser,
) -> Produto3CodigoFinalResponse:
    cliente = await fetch_current_cliente(current_user)
    ensure_produto3_released(cliente)
    cliente_id = str(cliente["id"])
    produto1_result = await get_produto1_result_context(current_user)
    produto2_context = await get_produto2_context(
        cliente_id=cliente_id,
        current_user=current_user,
    )
    current_row = await fetch_produto3_row_by_cliente_id(
        cliente_id=cliente_id,
        current_user=current_user,
    )

    if current_row and current_row.get("status") == "publicado":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Código Final publicado não pode receber novos insumos.",
        )

    next_status = current_row.get("status") if current_row else "aguardando_inventario"
    next_insumos = merge_produto3_insumos_with_context(
        stored_insumos=payload.insumos,
        cliente=cliente,
        produto1_result=produto1_result,
        produto2_context=produto2_context,
    )
    row = await upsert_produto3_row(
        cliente_id=cliente_id,
        payload={
            "status": next_status,
            "insumos": next_insumos,
        },
        current_user=current_user,
    )

    return row_to_response(
        row,
        cliente,
        produto1_result=produto1_result,
        produto2_context=produto2_context,
    )


async def submit_produto3_insumos(
    *,
    payload: Produto3InsumosRequest,
    current_user: CurrentUser,
) -> Produto3CodigoFinalResponse:
    cliente = await fetch_current_cliente(current_user)
    ensure_produto3_released(cliente)
    cliente_id = str(cliente["id"])
    produto1_result = await get_produto1_result_context(current_user)
    produto2_context = await get_produto2_context(
        cliente_id=cliente_id,
        current_user=current_user,
    )
    current_row = await fetch_produto3_row_by_cliente_id(
        cliente_id=cliente_id,
        current_user=current_user,
    )

    if current_row and current_row.get("status") == "publicado":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Código Final publicado não pode receber novo envio.",
        )

    next_insumos = merge_produto3_insumos_with_context(
        stored_insumos=payload.insumos,
        cliente=cliente,
        produto1_result=produto1_result,
        produto2_context=produto2_context,
    )
    analise = build_produto3_analise_preliminar(next_insumos)
    enviado_em = datetime.now(UTC).isoformat()
    row = await upsert_produto3_row(
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
        status_jornada="Código Final em análise",
        current_user=current_user,
    )

    return row_to_response(
        row,
        cliente,
        produto1_result=produto1_result,
        produto2_context=produto2_context,
    )


async def get_admin_produto3(
    *,
    cliente_id: str,
    current_user: CurrentUser,
) -> Produto3AdminResponse:
    await ensure_admin(current_user)
    cliente = await fetch_cliente_by_id(cliente_id=cliente_id, current_user=current_user)
    row = await fetch_produto3_row_by_cliente_id(
        cliente_id=cliente_id,
        current_user=current_user,
    )

    return row_to_admin_response(row, cliente)


async def update_admin_produto3(
    *,
    cliente_id: str,
    payload: Produto3AdminUpdateRequest,
    current_user: CurrentUser,
) -> Produto3AdminResponse:
    await ensure_admin(current_user)
    cliente = await fetch_cliente_by_id(cliente_id=cliente_id, current_user=current_user)
    updates = payload.model_dump(exclude_unset=True)

    if not updates:
        return await get_admin_produto3(cliente_id=cliente_id, current_user=current_user)

    if "ia_rascunho" in updates:
        updates["ia_revisado_em"] = datetime.now(UTC).isoformat()

    row = await upsert_produto3_row(
        cliente_id=cliente_id,
        payload=updates,
        current_user=current_user,
    )

    return row_to_admin_response(row, cliente)


async def publish_admin_produto3(
    *,
    cliente_id: str,
    payload: Produto3PublishRequest,
    current_user: CurrentUser,
) -> Produto3AdminResponse:
    await ensure_admin(current_user)
    cliente = await fetch_cliente_by_id(cliente_id=cliente_id, current_user=current_user)
    publicado_em = datetime.now(UTC).isoformat()
    row = await upsert_produto3_row(
        cliente_id=cliente_id,
        payload={
            "status": "publicado",
            "diagnosticos": payload.diagnosticos,
            "capsula": payload.capsula,
            "publicado_em": publicado_em,
            "ia_revisado_em": publicado_em,
        },
        current_user=current_user,
    )
    await update_cliente_status_jornada(
        cliente_id=cliente_id,
        status_jornada="Código Final publicado",
        current_user=current_user,
    )

    return row_to_admin_response(row, cliente)


async def unpublish_admin_produto3(
    *,
    cliente_id: str,
    current_user: CurrentUser,
) -> Produto3AdminResponse:
    await ensure_admin(current_user)
    cliente = await fetch_cliente_by_id(cliente_id=cliente_id, current_user=current_user)
    row = await patch_produto3_row(
        cliente_id=cliente_id,
        payload={
            "status": "em_analise",
            "publicado_em": None,
        },
        current_user=current_user,
    )
    await update_cliente_status_jornada(
        cliente_id=cliente_id,
        status_jornada="Código Final em análise",
        current_user=current_user,
    )

    return row_to_admin_response(row, cliente)

