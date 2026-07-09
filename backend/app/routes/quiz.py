from fastapi import APIRouter, HTTPException

from app.schemas.quiz import QuizCalculateRequest, QuizCalculateResponse
from app.services.produto1_catalogo_service import (
    get_arquetipos,
    get_combinacoes,
    get_produto1_catalogo,
    get_quiz_perguntas,
)
from app.services.quiz_service import calculate_quiz_result

router = APIRouter(prefix="/api/quiz", tags=["quiz"])


@router.get("/perguntas")
def read_quiz_perguntas():
    return get_quiz_perguntas()


@router.get("/catalogo")
def read_quiz_catalogo():
    return get_produto1_catalogo()


@router.get("/arquetipos")
def read_quiz_arquetipos():
    return get_arquetipos()


@router.get("/combinacoes")
def read_quiz_combinacoes():
    return get_combinacoes()


@router.post("/calculate", response_model=QuizCalculateResponse)
def calculate_quiz(payload: QuizCalculateRequest):
    try:
        return calculate_quiz_result(payload.answers)
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail="Não foi possível preparar sua leitura agora.",
        ) from exc
