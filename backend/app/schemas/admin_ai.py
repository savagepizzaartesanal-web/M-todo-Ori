from pydantic import BaseModel, ConfigDict, Field


class AdminAiMessageRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    next_action_label: str = Field(..., min_length=2, max_length=120)
    next_action_reason: str = Field(..., min_length=2, max_length=500)
    next_action_instruction: str = Field(..., min_length=2, max_length=500)
    message_goal: str | None = Field(default=None, max_length=500)
    fallback_title: str = Field(..., min_length=2, max_length=120)
    fallback_text: str = Field(..., min_length=10, max_length=1200)


class AdminAiMessageResponse(BaseModel):
    title: str
    text: str
    generated: bool
    provider: str = "fallback"
    warning: str | None = None
