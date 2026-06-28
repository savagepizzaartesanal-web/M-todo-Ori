from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field

Produto2Status = Literal["aguardando_insumos", "em_analise", "publicado"]


class Produto2InsumosRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    insumos: dict[str, Any] = Field(default_factory=dict)


class Produto2AdminUpdateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    status: Produto2Status | None = None
    insumos: dict[str, Any] | None = None
    analise_preliminar: dict[str, Any] | None = None
    diagnosticos: dict[str, Any] | None = None
    dossie: dict[str, Any] | None = None


class Produto2DossieResponse(BaseModel):
    id: str | None = None
    cliente_id: str | None = None
    status: Produto2Status
    produto_2_liberado: bool = False
    insumos: dict[str, Any] = Field(default_factory=dict)
    analise_preliminar: dict[str, Any] = Field(default_factory=dict)
    diagnosticos: dict[str, Any] = Field(default_factory=dict)
    dossie: dict[str, Any] = Field(default_factory=dict)
    enviado_em: datetime | None = None
    publicado_em: datetime | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None


class Produto2AdminResponse(Produto2DossieResponse):
    cliente: dict[str, Any] | None = None


class Produto2PublishRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    diagnosticos: dict[str, Any] = Field(default_factory=dict)
    dossie: dict[str, Any] = Field(default_factory=dict)
