from fastapi import APIRouter, Depends

from app.schemas.auth import CurrentUser
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/api", tags=["auth"])


@router.get("/me", response_model=CurrentUser)
def read_current_user(current_user: CurrentUser = Depends(get_current_user)):
    return current_user
