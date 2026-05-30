from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.produto1 import Produto1LeituraPerfil


class MapaVivoSignal(BaseModel):
    id: str
    label: str
    text: str
    intensity: float
    source: str


class MapaVivoBlockInsight(BaseModel):
    id: str
    label: str
    meaning: str
    average: float
    state: str
    high_signals: list[str] = Field(default_factory=list)
    low_signals: list[str] = Field(default_factory=list)


class MapaVivoArchetypeInsight(BaseModel):
    id: str | None = None
    name: str
    role: str
    score: int | None = None
    tone: str
    evidence: list[str] = Field(default_factory=list)


class MapaVivoRecommendation(BaseModel):
    id: str
    title: str
    text: str
    priority: str
    source: str


class MapaVivoReadingCard(BaseModel):
    id: str
    label: str
    title: str
    text: str
    state: str = "revealed"


class MapaVivoReading(BaseModel):
    phase: str
    phase_label: str
    headline: str
    next_layer_title: str
    next_layer_text: str
    cards: list[MapaVivoReadingCard]


class MapaVivoResponse(BaseModel):
    user_id: str
    email: str | None = None
    generated_at: datetime
    status: str
    readiness_score: int
    confidence_score: int
    confidence_label: str
    resultado: str | None = None
    perfil: Produto1LeituraPerfil
    result: dict | None = None
    reading: MapaVivoReading
    summary: str
    strengths: list[MapaVivoSignal]
    tensions: list[MapaVivoSignal]
    archetypes: list[MapaVivoArchetypeInsight]
    blocks: list[MapaVivoBlockInsight]
    recommendations: list[MapaVivoRecommendation]
    next_steps: list[MapaVivoRecommendation]
