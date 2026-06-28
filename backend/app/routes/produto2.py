from fastapi import APIRouter, Depends

from app.schemas.auth import CurrentUser
from app.schemas.produto2 import (
    Produto2DossieResponse,
    Produto2InsumosRequest,
)
from app.services.auth_service import get_current_user
from app.services.produto2_service import (
    get_produto2_me,
    save_produto2_insumos,
    submit_produto2_insumos,
)

router = APIRouter(prefix="/api/produto-2", tags=["produto-2"])


@router.get("/me", response_model=Produto2DossieResponse)
async def read_produto2_me(current_user: CurrentUser = Depends(get_current_user)):
    return await get_produto2_me(current_user=current_user)


@router.post("/insumos", response_model=Produto2DossieResponse)
async def save_insumos_produto2(
    payload: Produto2InsumosRequest,
    current_user: CurrentUser = Depends(get_current_user),
):
    return await save_produto2_insumos(
        payload=payload,
        current_user=current_user,
    )


@router.post("/enviar", response_model=Produto2DossieResponse)
async def submit_insumos_produto2(
    payload: Produto2InsumosRequest,
    current_user: CurrentUser = Depends(get_current_user),
):
    return await submit_produto2_insumos(
        payload=payload,
        current_user=current_user,
    )
