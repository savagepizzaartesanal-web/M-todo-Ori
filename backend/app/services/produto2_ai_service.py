import asyncio
import json
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

import httpx
from fastapi import HTTPException, status

from app.schemas.auth import CurrentUser
from app.schemas.produto2 import Produto2AiDraftResponse
from app.services.admin_ai_service import (
    generate_structured_ai_content,
    get_ai_provider_config,
)
from app.services.admin_service import ensure_admin
from app.services.produto2_service import (
    fetch_cliente_by_id,
    fetch_produto2_row_by_cliente_id,
    upsert_produto2_row,
)

AI_GUIDE_PATH = (
    Path(__file__).resolve().parents[1]
    / "data"
    / "method_ori_product2_ai.json"
)
AI_DRAFT_VERSION = "product2-draft-v1"
AI_DRAFT_BATCHES = [
    [
        "manifesto",
        "base_identitaria",
        "arquitetura_psicologica",
        "dor_real",
        "lei_coerencia_estetica",
        "onde_se_violenta",
        "ponto_virada",
    ],
    [
        "estrutura_corporal",
        "coloracao",
        "ancestralidade",
        "modelagem",
        "tecidos",
        "beleza",
        "cabelo",
        "presenca",
        "o_que_enfraquece",
    ],
    [
        "formula_imagem",
        "mapa_capsula_visual",
        "checklist_guarda_roupa",
        "fechamento",
    ],
]
SENSITIVE_KEYS = {
    "nome",
    "email",
    "whatsapp",
    "telefone",
    "endereco",
    "birthdate",
    "data_nascimento",
}
MEDIA_MARKERS = ("foto", "imagem", "arquivo", "upload", "storage", "url", "path")


def _load_ai_guide() -> dict[str, Any]:
    return json.loads(AI_GUIDE_PATH.read_text(encoding="utf-8"))


def _safe_ai_context(value: Any, key: str = "") -> Any:
    normalized_key = key.lower()

    if normalized_key in SENSITIVE_KEYS:
        return "[dado pessoal omitido]"

    if any(marker in normalized_key for marker in MEDIA_MARKERS):
        if isinstance(value, list):
            return {"arquivos_fornecidos": len(value)}
        return {"arquivo_fornecido": bool(value)}

    if isinstance(value, dict):
        return {
            child_key: _safe_ai_context(child_value, child_key)
            for child_key, child_value in value.items()
        }

    if isinstance(value, list):
        return [_safe_ai_context(item) for item in value]

    return value


def _build_batch_prompts(
    *,
    sections: list[str],
    row: dict[str, Any],
    cliente: dict[str, Any],
) -> tuple[str, str, dict[str, Any]]:
    context = {
        "versao": AI_DRAFT_VERSION,
        "diretrizes_metodo_ori": _load_ai_guide(),
        "status": row.get("status"),
        "insumos_textuais": _safe_ai_context(row.get("insumos") or {}),
        "analise_preliminar": row.get("analise_preliminar") or {},
        "diagnosticos_confirmados_pelo_admin": row.get("diagnosticos") or {},
        "jornada": {
            "resultado_arquetipico": cliente.get("resultado"),
            "arquetipo_principal": cliente.get("arquetipo_principal"),
            "arquetipo_secundario": cliente.get("arquetipo_secundario"),
            "status_jornada": cliente.get("status_jornada"),
        },
        "secoes_solicitadas": sections,
    }
    system_prompt = (
        "Você é a redatora interna do Método ORI by Telúrica. "
        "Produza um rascunho administrativo do Dossiê ORI, nunca uma entrega automática. "
        "Os diagnósticos confirmados pelo admin são soberanos. Não calcule, altere ou complete "
        "Kibbe, cartela sazonal, Patton, ancestralidade ou cabelo. Se faltar diagnóstico para "
        "uma seção, escreva claramente 'Pendente de validação técnica' e não improvise. "
        "Integre arquétipo, corpo, cor, cabelo, rotina e presença sem tratar as camadas isoladamente. "
        "Escreva diretamente para a cliente, com afeto adulto, profundidade e linguagem fácil. "
        "Traduza cada conceito em decisão prática de imagem. Não use tendências, corpo ideal, "
        "linguagem clínica, promessa ou correção de traços raciais. Não inclua dados pessoais. "
        "Não entregue curadoria final do armário, lista de compras ou fórmulas finais de looks, "
        "pois pertencem ao Código Final. Cada seção deve ter de 3 a 5 parágrafos e pelo menos "
        "500 caracteres. Responda somente com o JSON solicitado."
    )
    user_prompt = (
        "Redija apenas as seções solicitadas. Elas devem conversar entre si e usar os dados reais "
        "sem repetir o mesmo argumento. Diferencie diagnóstico confirmado, interpretação do Método "
        "ORI e recomendação prática.\n\n"
        f"{json.dumps(context, ensure_ascii=False, indent=2)}"
    )
    schema = {
        "type": "object",
        "properties": {section: {"type": "string"} for section in sections},
        "required": sections,
    }
    return system_prompt, user_prompt, schema


async def generate_admin_produto2_ai_draft(
    *,
    cliente_id: str,
    current_user: CurrentUser,
) -> Produto2AiDraftResponse:
    await ensure_admin(current_user)
    cliente = await fetch_cliente_by_id(
        cliente_id=cliente_id,
        current_user=current_user,
    )
    row = await fetch_produto2_row_by_cliente_id(
        cliente_id=cliente_id,
        current_user=current_user,
    )

    if not row:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A cliente ainda não enviou os insumos do Dossiê ORI.",
        )

    if row.get("status") == "publicado":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Despublique o Dossiê ORI antes de gerar um novo rascunho.",
        )

    if not row.get("diagnosticos"):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Confirme os diagnósticos técnicos antes de gerar o rascunho.",
        )

    provider, api_key, model, missing_key_message = get_ai_provider_config()
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=missing_key_message,
        )

    draft: dict[str, str] = {}

    for batch_index, sections in enumerate(AI_DRAFT_BATCHES, start=1):
        system_prompt, user_prompt, response_schema = _build_batch_prompts(
            sections=sections,
            row=row,
            cliente=cliente,
        )

        try:
            parsed = await generate_structured_ai_content(
                provider=provider,
                api_key=api_key,
                model=model,
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                response_schema=response_schema,
                max_output_tokens=5000,
            )
        except (httpx.HTTPError, KeyError, IndexError, TypeError, json.JSONDecodeError) as error:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=(
                    f"A IA não concluiu o bloco {batch_index} do rascunho. "
                    "Nenhum conteúdo foi publicado."
                ),
            ) from error

        for section in sections:
            text = str(parsed.get(section) or "").strip()
            if len(text) < 500:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=(
                        f"A seção {section} ficou superficial. "
                        "O rascunho não foi salvo."
                    ),
                )
            draft[section] = text[:6000]

        if batch_index < len(AI_DRAFT_BATCHES):
            await asyncio.sleep(3)

    generated_at = datetime.now(UTC)
    await upsert_produto2_row(
        cliente_id=cliente_id,
        payload={
            "ia_rascunho": draft,
            "ia_versao": AI_DRAFT_VERSION,
            "ia_gerado_em": generated_at.isoformat(),
            "ia_revisado_em": None,
        },
        current_user=current_user,
    )

    return Produto2AiDraftResponse(
        cliente_id=cliente_id,
        ia_rascunho=draft,
        ia_versao=AI_DRAFT_VERSION,
        ia_gerado_em=generated_at,
    )
