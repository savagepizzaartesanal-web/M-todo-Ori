from pydantic import BaseModel, Field


class CurrentUser(BaseModel):
    user_id: str
    email: str | None = None
    role: str | None = None
    access_token: str | None = Field(default=None, exclude=True)
