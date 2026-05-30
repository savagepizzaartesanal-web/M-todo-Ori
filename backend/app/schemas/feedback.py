from datetime import datetime

from pydantic import BaseModel, Field


class Produto1FeedbackRequest(BaseModel):
    response: str = Field(..., min_length=1)
    comment: str | None = None
    context: str = "espelho-ori"
    resultado: str | None = None
    payload: dict | None = None


class Produto1FeedbackResponse(BaseModel):
    user_id: str
    email: str | None = None
    context: str
    response: str
    comment: str | None = None
    resultado: str | None = None
    payload: dict
    created_at: datetime
    updated_at: datetime
