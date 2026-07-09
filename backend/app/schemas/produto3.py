from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field

Produto3Status = Literal["aguardando_inventario", "em_analise", "publicado"]


class Produto3InsumosRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    insumos: dict[str, Any] = Field(default_factory=dict)


class Produto3AdminUpdateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    status: Produto3Status | None = None
    insumos: dict[str, Any] | None = None
    analise_preliminar: dict[str, Any] | None = None
    diagnosticos: dict[str, Any] | None = None
    capsula: dict[str, Any] | None = None
    ia_rascunho: dict[str, Any] | None = None


class Produto3CodigoFinalResponse(BaseModel):
    id: str | None = None
    cliente_id: str | None = None
    status: Produto3Status
    produto_3_liberado: bool = False
    insumos: dict[str, Any] = Field(default_factory=dict)
    analise_preliminar: dict[str, Any] = Field(default_factory=dict)
    diagnosticos: dict[str, Any] = Field(default_factory=dict)
    capsula: dict[str, Any] = Field(default_factory=dict)
    enviado_em: datetime | None = None
    publicado_em: datetime | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None


class Produto3AdminResponse(Produto3CodigoFinalResponse):
    cliente: dict[str, Any] | None = None
    ia_rascunho: dict[str, Any] = Field(default_factory=dict)
    ia_versao: str | None = None
    ia_gerado_em: datetime | None = None
    ia_revisado_em: datetime | None = None


class Produto3PublishRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    diagnosticos: dict[str, Any] = Field(default_factory=dict)
    capsula: dict[str, Any] = Field(default_factory=dict)

