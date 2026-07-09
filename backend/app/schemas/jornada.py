from pydantic import BaseModel

from app.constants.journey_status import JourneyStatus


class JornadaStatus(BaseModel):
    entradaOri: str
    produto1: str
    produto2: str
    produto3: str
    espelhoOri: str
    oraculo: str


class JornadaResponse(BaseModel):
    user_id: str
    email: str | None = None
    cliente_id: str | int | None = None
    nome: str | None = None
    resultado: str | None = None
    status_jornada: JourneyStatus | str | None = None
    perfil_onboarding_concluido: bool = False
    produto_1_liberado: bool = True
    produto_2_liberado: bool = False
    produto_3_liberado: bool = False
    jornada: JornadaStatus
