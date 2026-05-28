from pydantic import BaseModel, ConfigDict


class AdminClienteUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    produto_2_liberado: bool | None = None
    produto_3_liberado: bool | None = None
    status_jornada: str | None = None
    observacoes_admin: str | None = None
    admin: bool | None = None
