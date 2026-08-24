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


class Produto1MicroSurveyRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    recognition: Literal["muito", "em_parte", "pouco"]
    clarity_loss_location: Literal[
        "reconhecimento",
        "essencia_base_interna",
        "dinamica",
        "vida_real",
        "imagem_na_pratica",
        "sintese_final",
        "relatorio_pdf",
        "antes_da_leitura",
        "transicao_dossie_ori",
        "nao_sei",
    ]
    needed_help: Literal[
        "exemplo_concreto",
        "proximo_passo_simples",
        "menos_linguagem_simbolica",
        "mais_ligacao_com_minhas_respostas",
        "explicacao_melhor_gratuita_completa",
        "outro",
    ]
    expectation_fit: Literal["sim", "em_parte", "nao", "nao_sabia_o_que_esperar"]


class Produto1MicroSurveyResponse(BaseModel):
    id: str
    recognition: str
    clarity_loss_location: str
    needed_help: str
    expectation_fit: str
    created_at: datetime
