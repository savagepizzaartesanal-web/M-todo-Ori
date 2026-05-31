from datetime import date
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

OracleCardId = Literal[
    "essencia",
    "sombra",
    "imagem",
    "presenca",
    "caminho",
    "limite",
    "corpo",
    "desejo",
    "coerencia",
    "travessia",
]


class OraculoCartaDiaRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    dateKey: date = Field(..., description="Data da carta no formato YYYY-MM-DD.")
    cardId: OracleCardId
    cardTitle: str = Field(..., min_length=2, max_length=80)
    revealLabel: str = Field(..., min_length=2, max_length=80)
    code: str = Field(..., min_length=1, max_length=8)
    message: str = Field(..., min_length=2, max_length=900)
    cardOrder: list[OracleCardId] = Field(default_factory=list, max_length=10)


class OraculoCartaDiaResponse(BaseModel):
    hasCard: bool = False
    dateKey: str | None = None
    cardId: str | None = None
    cardTitle: str | None = None
    revealLabel: str | None = None
    code: str | None = None
    message: str | None = None
    cardOrder: list[str] = Field(default_factory=list)
