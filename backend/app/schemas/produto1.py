from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.quiz import QuizCalculateResponse


class Produto1RespostasRequest(BaseModel):
    answers: dict[str, int] = Field(
        ...,
        description="Mapa parcial ou completo de respostas do Produto 1.",
    )


class Produto1RespostasResponse(BaseModel):
    user_id: str
    email: str | None = None
    answered_count: int
    total_questions: int
    is_complete: bool
    saved_at: datetime
    result: QuizCalculateResponse | None = None


class Produto1RespostasStoredResponse(Produto1RespostasResponse):
    answers: dict[str, int]


class Produto1ConclusaoResponse(BaseModel):
    user_id: str
    email: str | None = None
    result: QuizCalculateResponse
    respostas: Produto1RespostasResponse


class Produto1LeituraPerfil(BaseModel):
    momento_atual: str | None = None
    dor_atual: str | None = None
    objetivo_principal: str | None = None


class Produto1LeituraHighlight(BaseModel):
    label: str
    text: str


class Produto1LeituraResponse(BaseModel):
    user_id: str
    email: str | None = None
    resultado: str | None = None
    perfil: Produto1LeituraPerfil
    highlights: list[Produto1LeituraHighlight]
    camadas: dict[str, str]
    report: dict | None = None


class Produto1RelatorioSection(BaseModel):
    id: str
    label: str
    title: str
    text: str


class Produto1RelatorioResponse(BaseModel):
    user_id: str
    email: str | None = None
    generated_at: datetime
    resultado: str
    combinacao: str | None = None
    title: str
    subtitle: str | None = None
    perfil: Produto1LeituraPerfil
    highlights: list[Produto1LeituraHighlight]
    sections: list[Produto1RelatorioSection]
    formula: str | None = None
    next_step: str | None = None
