from pydantic import BaseModel, Field


class OraculoCartaDiaRequest(BaseModel):
    dateKey: str = Field(..., description="Data da carta no formato YYYY-MM-DD.")
    cardId: str
    cardTitle: str
    revealLabel: str
    code: str
    message: str
    cardOrder: list[str] = Field(default_factory=list)


class OraculoCartaDiaResponse(BaseModel):
    hasCard: bool = False
    dateKey: str | None = None
    cardId: str | None = None
    cardTitle: str | None = None
    revealLabel: str | None = None
    code: str | None = None
    message: str | None = None
    cardOrder: list[str] = Field(default_factory=list)
