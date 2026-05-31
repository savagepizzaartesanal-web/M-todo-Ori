from typing import Literal

from fastapi import APIRouter, Depends

from app.schemas.auth import CurrentUser
from app.schemas.feedback import Produto1FeedbackRequest, Produto1FeedbackResponse
from app.services.auth_service import get_current_user
from app.services.feedback_service import (
    get_produto1_feedback,
    save_produto1_feedback,
)

router = APIRouter(prefix="/api/feedback", tags=["feedback"])


@router.get("/produto-1/me", response_model=Produto1FeedbackResponse | None)
async def read_produto1_feedback(
    context: Literal["produto-1-leitura", "espelho-ori"] = "espelho-ori",
    current_user: CurrentUser = Depends(get_current_user),
):
    return await get_produto1_feedback(
        current_user=current_user,
        context=context,
    )


@router.post("/produto-1", response_model=Produto1FeedbackResponse)
async def create_produto1_feedback(
    payload: Produto1FeedbackRequest,
    current_user: CurrentUser = Depends(get_current_user),
):
    return await save_produto1_feedback(
        payload=payload,
        current_user=current_user,
    )
