from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class Produto1FeedbackMetadata(BaseModel):
    model_config = ConfigDict(extra="forbid")

    page: Literal["produto-1-leitura"] = "produto-1-leitura"
    completedAt: datetime


class Produto1FeedbackRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    response: Literal[
        "me_senti_vista",
        "fez_sentido_mas_abstrato",
        "nao_me_reconheci",
    ]
    comment: str | None = Field(default=None, max_length=1200)
    context: Literal["produto-1-leitura", "espelho-ori"] = "espelho-ori"
    resultado: str | None = Field(default=None, max_length=120)
    payload: Produto1FeedbackMetadata | None = None


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
