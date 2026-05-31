from fastapi import APIRouter, Depends

from app.schemas.admin import AdminClienteEventoCreate, AdminClienteUpdate
from app.schemas.admin_ai import (
    AdminAiMessageRequest,
    AdminAiMessageResponse,
)
from app.schemas.auth import CurrentUser
from app.services.admin_ai_service import generate_admin_ai_message
from app.services.admin_service import (
    create_admin_cliente_evento,
    fetch_admin_cliente,
    fetch_admin_overview,
    update_admin_cliente,
)
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/clientes")
async def read_admin_clientes(current_user: CurrentUser = Depends(get_current_user)):
    return await fetch_admin_overview(current_user=current_user)


@router.get("/clientes/{cliente_id}")
async def read_admin_cliente(
    cliente_id: str,
    current_user: CurrentUser = Depends(get_current_user),
):
    return await fetch_admin_cliente(
        cliente_id=cliente_id,
        current_user=current_user,
    )


@router.patch("/clientes/{cliente_id}")
async def patch_admin_cliente(
    cliente_id: str,
    payload: AdminClienteUpdate,
    current_user: CurrentUser = Depends(get_current_user),
):
    return await update_admin_cliente(
        cliente_id=cliente_id,
        payload=payload,
        current_user=current_user,
    )


@router.post("/clientes/{cliente_id}/eventos")
async def create_admin_evento(
    cliente_id: str,
    payload: AdminClienteEventoCreate,
    current_user: CurrentUser = Depends(get_current_user),
):
    return await create_admin_cliente_evento(
        cliente_id=cliente_id,
        payload=payload,
        current_user=current_user,
    )


@router.post(
    "/clientes/{cliente_id}/mensagem-ia",
    response_model=AdminAiMessageResponse,
)
async def create_admin_ai_message(
    cliente_id: str,
    payload: AdminAiMessageRequest,
    current_user: CurrentUser = Depends(get_current_user),
):
    return await generate_admin_ai_message(
        cliente_id=cliente_id,
        payload=payload,
        current_user=current_user,
    )
