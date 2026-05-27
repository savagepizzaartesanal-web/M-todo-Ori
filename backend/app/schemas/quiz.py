from pydantic import BaseModel, Field


class QuizCalculateRequest(BaseModel):
    answers: dict[str, int] = Field(
        ...,
        description="Mapa de respostas do quiz. Chave = id da pergunta; valor = intensidade de 1 a 5.",
    )


class QuizCalculateResponse(BaseModel):
    scores: dict[str, int]
    principal: str
    secundario: str
    principalId: str
    secundarioId: str
    nomeComposto: str
