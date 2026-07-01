import json
import os
from typing import Any

import httpx

from app.schemas.admin_ai import (
    AdminAiMessageRequest,
    AdminAiMessageResponse,
)
from app.schemas.auth import CurrentUser
from app.services.admin_service import fetch_admin_cliente


def _safe_parse_profile(raw_profile: Any) -> dict[str, Any]:
    if isinstance(raw_profile, dict):
        return raw_profile

    if not isinstance(raw_profile, str) or not raw_profile.strip():
        return {}

    try:
        parsed = json.loads(raw_profile)
        return parsed if isinstance(parsed, dict) else {}
    except json.JSONDecodeError:
        return {}


def _compact(value: Any, fallback: str = "Não informado") -> str:
    if value is None:
        return fallback

    if isinstance(value, list):
        clean_items = [str(item).strip() for item in value if str(item).strip()]
        return ", ".join(clean_items) if clean_items else fallback

    clean_value = str(value).strip()
    return clean_value or fallback


def _fallback_response(
    payload: AdminAiMessageRequest,
    warning: str,
) -> AdminAiMessageResponse:
    return AdminAiMessageResponse(
        title=payload.fallback_title,
        text=payload.fallback_text,
        generated=False,
        warning=warning,
    )


def _build_prompt_context(
    cliente_data: dict[str, Any],
    payload: AdminAiMessageRequest,
) -> str:
    cliente = cliente_data.get("cliente") or {}
    resposta = cliente_data.get("produto1_respostas") or {}
    feedback = cliente_data.get("produto1_feedback") or {}
    oraculo = cliente_data.get("oraculo_carta") or {}
    eventos = cliente_data.get("eventos_admin") or []
    profile = _safe_parse_profile(cliente.get("perfil_onboarding"))

    context = {
        "cliente": {
            "nome": cliente.get("nome"),
            "resultado": cliente.get("resultado"),
            "perfil_onboarding_concluido": cliente.get("perfil_onboarding_concluido"),
            "produto_2_liberado": cliente.get("produto_2_liberado"),
            "produto_3_liberado": cliente.get("produto_3_liberado"),
            "status_jornada": cliente.get("status_jornada"),
        },
        "perfil_entrada": {
            "como_gosta_de_ser_chamada": profile.get("preferredName"),
            "momento_atual": profile.get("journeyStage"),
            "dor_principal": profile.get("mainPainCustom") or profile.get("mainPain"),
            "desejo_principal": profile.get("mainDesire"),
        },
        "produto_1": {
            "resultado": resposta.get("result", {}).get("nomeComposto")
            if isinstance(resposta.get("result"), dict)
            else cliente.get("resultado"),
            "respondidas": resposta.get("answered_count"),
            "total": resposta.get("total_questions"),
            "completo": resposta.get("is_complete"),
        },
        "feedback": {
            "resposta": feedback.get("response"),
            "comentario": feedback.get("comment"),
        },
        "oraculo": {
            "ultima_carta": oraculo.get("card_title"),
            "data": oraculo.get("date_key"),
        },
        "historico_administrativo_recente": [
            {
                "tipo": evento.get("event_type"),
                "descricao": evento.get("label"),
                "data": evento.get("created_at"),
            }
            for evento in eventos[:8]
        ],
        "proxima_melhor_acao": {
            "rotulo": payload.next_action_label,
            "motivo": payload.next_action_reason,
            "acao": payload.next_action_instruction,
            "objetivo_da_mensagem": payload.message_goal,
        },
    }

    return json.dumps(context, ensure_ascii=False, indent=2)


def _build_message_prompts(
    cliente_data: dict[str, Any],
    payload: AdminAiMessageRequest,
) -> tuple[str, str]:
    prompt_context = _build_prompt_context(cliente_data, payload)
    system_prompt = (
        "Você escreve mensagens de WhatsApp para o Método ORI. "
        "A mensagem será revisada por uma humana antes de ser enviada. "
        "Não invente diagnóstico, promessa, resultado, preço, prazo ou informação ausente. "
        "Não altere o arquétipo nem decida nova etapa da cliente. "
        "Use português do Brasil, tom humano, profissional, direto e claro. "
        "A voz ORI no admin deve ser analítica: nomeia o estado, orienta a ação e evita excesso simbólico. "
        "Prefira palavras concretas a termos vagos. Evite soar terapêutica, mística, fantasiosa ou vendedora demais. "
        "Evite as palavras percepção, feedback, potência e transformação. "
        "Escreva para WhatsApp em 3 a 5 frases curtas. "
        "Responda apenas JSON válido com as chaves title e text."
    )
    user_prompt = (
        "Crie uma mensagem personalizada para a cliente com base neste contexto. "
        "A mensagem deve seguir a próxima melhor ação e não deve vender se a ação for pedir retorno da leitura, "
        "acolher dúvida ou concluir uma etapa pendente.\n\n"
        f"{prompt_context}"
    )

    return system_prompt, user_prompt


def _parse_openai_response(response_data: dict[str, Any]) -> dict[str, Any]:
    content = response_data["choices"][0]["message"]["content"]
    return json.loads(content)


def _parse_gemini_response(response_data: dict[str, Any]) -> dict[str, Any]:
    content = response_data["candidates"][0]["content"]["parts"][0]["text"]
    return json.loads(content)


async def _generate_with_openai(
    api_key: str,
    model: str,
    system_prompt: str,
    user_prompt: str,
    max_output_tokens: int = 360,
) -> dict[str, Any]:
    timeout_seconds = 90 if max_output_tokens > 1000 else 45

    async with httpx.AsyncClient(timeout=timeout_seconds) as client:
        response = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                "temperature": 0.55,
                "max_tokens": max_output_tokens,
                "response_format": {"type": "json_object"},
            },
        )
        response.raise_for_status()

    return _parse_openai_response(response.json())


async def _generate_with_gemini(
    api_key: str,
    model: str,
    system_prompt: str,
    user_prompt: str,
    response_schema: dict[str, Any] | None = None,
    max_output_tokens: int = 360,
) -> dict[str, Any]:
    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"{model}:generateContent"
    )
    timeout_seconds = 90 if max_output_tokens > 1000 else 45

    async with httpx.AsyncClient(timeout=timeout_seconds) as client:
        response = await client.post(
            url,
            headers={
                "x-goog-api-key": api_key,
                "Content-Type": "application/json",
            },
            json={
                "systemInstruction": {
                    "parts": [{"text": system_prompt}],
                },
                "contents": [
                    {
                        "role": "user",
                        "parts": [{"text": user_prompt}],
                    },
                ],
                "generationConfig": {
                    "temperature": 0.55,
                    "maxOutputTokens": max_output_tokens,
                    "responseMimeType": "application/json",
                    "responseJsonSchema": response_schema or {
                        "type": "object",
                        "properties": {
                            "title": {"type": "string"},
                            "text": {"type": "string"},
                        },
                        "required": ["title", "text"],
                    },
                },
            },
        )
        response.raise_for_status()

    return _parse_gemini_response(response.json())


def _get_provider_config() -> tuple[str, str | None, str, str]:
    provider = os.getenv("AI_PROVIDER", "openai").strip().lower()

    if provider == "gemini":
        return (
            provider,
            os.getenv("GEMINI_API_KEY"),
            os.getenv("GEMINI_MODEL", "gemini-2.5-flash-lite"),
            "IA Gemini ainda não configurada no backend. Defina GEMINI_API_KEY.",
        )

    return (
        "openai",
        os.getenv("OPENAI_API_KEY"),
        os.getenv("OPENAI_MODEL", "gpt-4.1-mini"),
        "IA OpenAI ainda não configurada no backend. Defina OPENAI_API_KEY.",
    )


def get_ai_provider_config() -> tuple[str, str | None, str, str]:
    return _get_provider_config()


async def _generate_structured_content(
    provider: str,
    api_key: str,
    model: str,
    system_prompt: str,
    user_prompt: str,
    response_schema: dict[str, Any] | None = None,
    max_output_tokens: int = 360,
) -> dict[str, Any]:
    if provider == "gemini":
        return await _generate_with_gemini(
            api_key,
            model,
            system_prompt,
            user_prompt,
            response_schema=response_schema,
            max_output_tokens=max_output_tokens,
        )

    return await _generate_with_openai(
        api_key,
        model,
        system_prompt,
        user_prompt,
        max_output_tokens=max_output_tokens,
    )


async def generate_structured_ai_content(
    *,
    provider: str,
    api_key: str,
    model: str,
    system_prompt: str,
    user_prompt: str,
    response_schema: dict[str, Any] | None = None,
    max_output_tokens: int = 360,
) -> dict[str, Any]:
    return await _generate_structured_content(
        provider=provider,
        api_key=api_key,
        model=model,
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        response_schema=response_schema,
        max_output_tokens=max_output_tokens,
    )


async def generate_admin_ai_message(
    cliente_id: str,
    payload: AdminAiMessageRequest,
    current_user: CurrentUser,
) -> AdminAiMessageResponse:
    cliente_data = await fetch_admin_cliente(cliente_id=cliente_id, current_user=current_user)
    provider, api_key, model, missing_key_message = _get_provider_config()

    if not api_key:
        return _fallback_response(
            payload,
            missing_key_message,
        )

    system_prompt, user_prompt = _build_message_prompts(cliente_data, payload)

    try:
        parsed = await _generate_structured_content(
            provider=provider,
            api_key=api_key,
            model=model,
            system_prompt=system_prompt,
            user_prompt=user_prompt,
        )
    except httpx.HTTPStatusError as error:
        detail = error.response.text[:240] if error.response is not None else str(error)
        return _fallback_response(
            payload,
            f"IA indisponível agora. Mensagem base mantida. Detalhe: {detail}",
        )
    except httpx.HTTPError as error:
        return _fallback_response(
            payload,
            f"IA indisponível agora. Mensagem base mantida. Detalhe: {error}",
        )
    except (KeyError, IndexError, TypeError, json.JSONDecodeError):
        return _fallback_response(
            payload,
            "A IA respondeu fora do formato esperado. Mensagem base mantida.",
        )

    try:
        title = _compact(parsed.get("title"), payload.fallback_title)
        text = _compact(parsed.get("text"), payload.fallback_text)
    except AttributeError:
        return _fallback_response(
            payload,
            "A IA respondeu fora do formato esperado. Mensagem base mantida.",
        )

    return AdminAiMessageResponse(
        title=title[:120],
        text=text[:1200],
        generated=True,
        provider=f"{provider}:{model}",
    )
