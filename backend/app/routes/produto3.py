from fastapi import APIRouter, Depends

from app.schemas.auth import CurrentUser
from app.schemas.produto3 import (
    Produto3CodigoFinalResponse,
    Produto3InsumosRequest,
)
from app.services.auth_service import get_current_user
from app.services.produto3_service import (
    get_produto3_me,
    save_produto3_insumos,
    submit_produto3_insumos,
)

router = APIRouter(prefix="/api/produto-3", tags=["produto-3"])


@router.get("/me", response_model=Produto3CodigoFinalResponse)
async def read_produto3_me(current_user: CurrentUser = Depends(get_current_user)):
    return await get_produto3_me(current_user=current_user)


@router.post("/insumos", response_model=Produto3CodigoFinalResponse)
async def save_insumos_produto3(
    payload: Produto3InsumosRequest,
    current_user: CurrentUser = Depends(get_current_user),
):
    return await save_produto3_insumos(
        payload=payload,
        current_user=current_user,
    )


@router.post("/enviar", response_model=Produto3CodigoFinalResponse)
async def submit_insumos_produto3(
    payload: Produto3InsumosRequest,
    current_user: CurrentUser = Depends(get_current_user),
):
    return await submit_produto3_insumos(
        payload=payload,
        current_user=current_user,
    )

