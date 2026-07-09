import asyncio
from datetime import UTC, datetime

import httpx
from fastapi import HTTPException, status

from app.data.quiz import QUESTIONS
from app.schemas.auth import CurrentUser
from app.schemas.produto1 import (
    Produto1ConclusaoResponse,
    Produto1RespostasResponse,
    Produto1RespostasStoredResponse,
)
from app.constants import journey_status
from app.services.auth_service import get_supabase_config
from app.services.quiz_service import calculate_quiz_result, normalize_answers

TABLE_NAME = "produto_1_respostas"
CLIENTES_TABLE_NAME = "clientes"
FEEDBACK_TABLE_NAME = "produto_1_feedbacks"
FEEDBACK_CONTEXT = "produto-1-leitura"


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


def validate_partial_answers(answers: dict[str, int]) -> dict[str, int]:
    normalized_answers = normalize_answers(answers)
    expected_question_ids = {question["id"] for question in QUESTIONS}
    unknown = sorted(set(normalized_answers.keys()) - expected_question_ids)

    if unknown:
        raise ValueError(
            "Existem respostas que não pertencem ao Código das Deusas: "
            f"{', '.join(str(item) for item in unknown)}."
        )

    return {str(question_id): value for question_id, value in normalized_answers.items()}


def empty_produto1_respostas(current_user: CurrentUser) -> Produto1RespostasStoredResponse:
    return Produto1RespostasStoredResponse(
        user_id=current_user.user_id,
        email=current_user.email,
        answers={},
        answered_count=0,
        total_questions=len(QUESTIONS),
        is_complete=False,
        saved_at=datetime.now(UTC),
        result=None,
        ai_report=None,
        ai_report_key=None,
        ai_report_generated_at=None,
    )


def parse_saved_at(row: dict) -> datetime:
    raw_date = row.get("updated_at") or row.get("created_at")

    if not raw_date:
        return datetime.now(UTC)

    return datetime.fromisoformat(raw_date.replace("Z", "+00:00"))


def row_to_response(row: dict, current_user: CurrentUser) -> Produto1RespostasStoredResponse:
    return Produto1RespostasStoredResponse(
        user_id=row.get("user_id", current_user.user_id),
        email=row.get("email") or current_user.email,
        answers=row.get("answers", {}),
        answered_count=row.get("answered_count", 0),
        total_questions=row.get("total_questions", len(QUESTIONS)),
        is_complete=bool(row.get("is_complete")),
        saved_at=parse_saved_at(row),
        result=row.get("result"),
        ai_report=row.get("ai_report"),
        ai_report_key=row.get("ai_report_key"),
        ai_report_generated_at=row.get("ai_report_generated_at"),
    )


async def save_produto1_ai_report(
    *,
    report: dict,
    report_key: str,
    current_user: CurrentUser,
) -> bool:
    supabase_url, _ = get_supabase_config()
    headers = {
        **get_supabase_rest_headers(current_user),
        "Prefer": "return=minimal",
    }
    payload = {
        "ai_report": report,
        "ai_report_key": report_key,
        "ai_report_generated_at": datetime.now(UTC).isoformat(),
    }

    async with httpx.AsyncClient(timeout=8) as client:
        response = await client.patch(
            f"{supabase_url}/rest/v1/{TABLE_NAME}",
            params={"user_id": f"eq.{current_user.user_id}"},
            json=payload,
            headers=headers,
        )

    if response.status_code >= 400:
        print(
            "AI reading persistence skipped: "
            f"status={response.status_code} detail={response.text[:300]}"
        )
        return False

    print("AI reading persisted")
    return True


async def get_produto1_respostas(
    *,
    current_user: CurrentUser,
) -> Produto1RespostasStoredResponse:
    supabase_url, _ = get_supabase_config()

    async with httpx.AsyncClient(timeout=8) as client:
        user_response = await client.get(
            f"{supabase_url}/rest/v1/{TABLE_NAME}",
            params={
                "select": "*",
                "user_id": f"eq.{current_user.user_id}",
                "limit": "1",
            },
            headers=get_supabase_rest_headers(current_user),
        )

        email_response = None
        if current_user.email:
            email_response = await client.get(
                f"{supabase_url}/rest/v1/{TABLE_NAME}",
                params={
                    "select": "*",
                    "email": f"eq.{current_user.email}",
                    "limit": "1",
                },
                headers=get_supabase_rest_headers(current_user),
            )

    if user_response.status_code >= 400 or (
        email_response is not None and email_response.status_code >= 400
    ):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Não foi possível consultar as respostas do Código das Deusas.",
        )

    rows = user_response.json()

    if not rows and email_response is not None:
        rows = email_response.json()

    if not rows:
        return empty_produto1_respostas(current_user)

    return row_to_response(rows[0], current_user)


async def save_produto1_respostas(
    *,
    answers: dict[str, int],
    current_user: CurrentUser,
) -> Produto1RespostasResponse:
    supabase_url, _ = get_supabase_config()
    validated_answers = validate_partial_answers(answers)
    total_questions = len(QUESTIONS)
    answered_count = len(validated_answers)
    is_complete = answered_count == total_questions
    result = calculate_quiz_result(validated_answers) if is_complete else None

    payload = {
        "user_id": current_user.user_id,
        "email": current_user.email,
        "answers": validated_answers,
        "answered_count": answered_count,
        "total_questions": total_questions,
        "is_complete": is_complete,
        "result": result,
    }

    headers = {
        **get_supabase_rest_headers(current_user),
        "Prefer": "resolution=merge-duplicates,return=representation",
    }

    async with httpx.AsyncClient(timeout=8) as client:
        response = await client.post(
            f"{supabase_url}/rest/v1/{TABLE_NAME}",
            params={"on_conflict": "user_id"},
            json=payload,
            headers=headers,
        )

    if response.status_code >= 400:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Não foi possível salvar as respostas do Código das Deusas.",
        )

    rows = response.json()
    row = rows[0] if rows else payload
    saved_at = parse_saved_at(row)

    return Produto1RespostasResponse(
        user_id=current_user.user_id,
        email=current_user.email,
        answered_count=answered_count,
        total_questions=total_questions,
        is_complete=is_complete,
        saved_at=saved_at,
        result=result,
    )


async def update_cliente_produto1_result(
    *,
    result: dict,
    current_user: CurrentUser,
) -> None:
    supabase_url, _ = get_supabase_config()
    payload = {
        "user_id": current_user.user_id,
        "email": current_user.email,
        "resultado": result["nomeComposto"],
        "arquetipo_principal": result["principal"],
        "arquetipo_secundario": result["secundario"],
        "status_jornada": journey_status.CODIGO_DAS_DEUSAS_CONCLUIDO,
        "produto_1_liberado": True,
    }
    headers = {
        **get_supabase_rest_headers(current_user),
        "Prefer": "resolution=merge-duplicates,return=minimal",
    }

    async with httpx.AsyncClient(timeout=8) as client:
        response = await client.post(
            f"{supabase_url}/rest/v1/{CLIENTES_TABLE_NAME}",
            params={"on_conflict": "email"},
            json=payload,
            headers=headers,
        )

    if response.status_code >= 400:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Não foi possível atualizar o resultado da cliente.",
        )


async def concluir_produto1(
    *,
    answers: dict[str, int],
    current_user: CurrentUser,
) -> Produto1ConclusaoResponse:
    validated_answers = validate_partial_answers(answers)
    result = calculate_quiz_result(validated_answers)
    respostas = await save_produto1_respostas(
        answers=validated_answers,
        current_user=current_user,
    )

    await update_cliente_produto1_result(
        result=result,
        current_user=current_user,
    )

    return Produto1ConclusaoResponse(
        user_id=current_user.user_id,
        email=current_user.email,
        result=result,
        respostas=respostas,
    )


async def reset_produto1(
    *,
    current_user: CurrentUser,
) -> dict[str, bool]:
    supabase_url, _ = get_supabase_config()
    headers = get_supabase_rest_headers(current_user)
    reset_cliente_payload = {
        "resultado": None,
        "arquetipo_principal": None,
        "arquetipo_secundario": None,
        "status_jornada": journey_status.CODIGO_DAS_DEUSAS_EM_ANDAMENTO,
        "produto_1_liberado": True,
    }

    await save_produto1_respostas(answers={}, current_user=current_user)

    async with httpx.AsyncClient(timeout=8) as client:
        cliente_response, feedback_response = await asyncio.gather(
            client.patch(
                f"{supabase_url}/rest/v1/{CLIENTES_TABLE_NAME}",
                params={"user_id": f"eq.{current_user.user_id}"},
                json=reset_cliente_payload,
                headers=headers,
            ),
            client.delete(
                f"{supabase_url}/rest/v1/{FEEDBACK_TABLE_NAME}",
                params={
                    "user_id": f"eq.{current_user.user_id}",
                    "context": f"eq.{FEEDBACK_CONTEXT}",
                },
                headers=headers,
            ),
        )

    if cliente_response.status_code >= 400:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Não foi possível reiniciar o resultado da cliente.",
        )

    if feedback_response.status_code >= 400:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Não foi possível limpar o feedback anterior da leitura.",
        )

    return {"reset": True}
