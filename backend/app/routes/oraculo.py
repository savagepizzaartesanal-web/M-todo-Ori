from fastapi import APIRouter, Depends

from app.schemas.auth import CurrentUser
from app.schemas.oraculo import OraculoCartaDiaRequest, OraculoCartaDiaResponse
from app.services.auth_service import get_current_user
from app.services.oraculo_service import get_carta_do_dia, salvar_carta_do_dia

router = APIRouter(prefix="/api/oraculo", tags=["oraculo"])


@router.get("/carta-dia/me", response_model=OraculoCartaDiaResponse)
async def read_carta_do_dia(
    date_key: str,
    current_user: CurrentUser = Depends(get_current_user),
):
    return await get_carta_do_dia(date_key=date_key, current_user=current_user)


@router.post("/carta-dia", response_model=OraculoCartaDiaResponse)
async def save_carta_do_dia(
    payload: OraculoCartaDiaRequest,
    current_user: CurrentUser = Depends(get_current_user),
):
    return await salvar_carta_do_dia(payload=payload, current_user=current_user)
