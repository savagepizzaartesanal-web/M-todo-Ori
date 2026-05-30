from fastapi import APIRouter, Depends

from app.schemas.auth import CurrentUser
from app.schemas.mapa_vivo import MapaVivoResponse
from app.services.auth_service import get_current_user
from app.services.mapa_vivo_service import get_mapa_vivo

router = APIRouter(prefix="/api/mapa-vivo", tags=["mapa-vivo"])


@router.get("/me", response_model=MapaVivoResponse)
async def read_mapa_vivo(current_user: CurrentUser = Depends(get_current_user)):
    return await get_mapa_vivo(current_user=current_user)
