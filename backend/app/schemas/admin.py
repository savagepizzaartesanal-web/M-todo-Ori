from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class AdminClienteUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    produto_2_liberado: bool | None = None
    produto_3_liberado: bool | None = None
    status_jornada: str | None = None
    observacoes_admin: str | None = None
    admin: bool | None = None


class AdminClienteEventoCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    event_type: str = Field(..., min_length=2, max_length=80)
    label: str = Field(..., min_length=2, max_length=180)
    details: dict[str, Any] = Field(default_factory=dict)
