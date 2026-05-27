from fastapi import APIRouter, HTTPException

from app.schemas.quiz import QuizCalculateRequest, QuizCalculateResponse
from app.services.quiz_service import calculate_quiz_result

router = APIRouter(prefix="/api/quiz", tags=["quiz"])


@router.post("/calculate", response_model=QuizCalculateResponse)
def calculate_quiz(payload: QuizCalculateRequest):
    try:
        return calculate_quiz_result(payload.answers)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
