from fastapi import APIRouter, Depends

from app.schemas.auth import CurrentUser
from app.schemas.jornada import JornadaResponse
from app.services.auth_service import get_current_user
from app.services.jornada_service import get_current_jornada

router = APIRouter(prefix="/api/jornada", tags=["jornada"])


@router.get("/me", response_model=JornadaResponse)
async def read_current_jornada(
    current_user: CurrentUser = Depends(get_current_user),
):
    return await get_current_jornada(current_user)
