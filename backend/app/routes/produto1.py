from fastapi import APIRouter, Depends, HTTPException, Response

from app.schemas.auth import CurrentUser
from app.schemas.produto1 import (
    Produto1ConclusaoResponse,
    Produto1LeituraResponse,
    Produto1RelatorioResponse,
    Produto1RespostasRequest,
    Produto1RespostasResponse,
    Produto1RespostasStoredResponse,
)
from app.services.auth_service import get_current_user
from app.services.leitura_service import (
    get_produto1_leitura_personalizada,
    get_produto1_relatorio,
)
from app.services.pdf_service import (
    build_produto1_report_pdf,
    get_report_pdf_filename,
)
from app.services.produto1_service import (
    concluir_produto1,
    get_produto1_respostas,
    reset_produto1,
    save_produto1_respostas,
)
from app.services.produto1_catalogo_service import get_produto1_catalogo

router = APIRouter(prefix="/api/produto-1", tags=["produto-1"])


@router.get("/catalogo")
async def read_catalogo_produto1():
    return get_produto1_catalogo()


@router.get("/respostas/me", response_model=Produto1RespostasStoredResponse)
async def read_respostas(current_user: CurrentUser = Depends(get_current_user)):
    return await get_produto1_respostas(current_user=current_user)


@router.post("/respostas", response_model=Produto1RespostasResponse)
async def save_respostas(
    payload: Produto1RespostasRequest,
    current_user: CurrentUser = Depends(get_current_user),
):
    try:
        return await save_produto1_respostas(
            answers=payload.answers,
            current_user=current_user,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/concluir", response_model=Produto1ConclusaoResponse)
async def concluir_leitura(
    payload: Produto1RespostasRequest,
    current_user: CurrentUser = Depends(get_current_user),
):
    try:
        return await concluir_produto1(
            answers=payload.answers,
            current_user=current_user,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/reset")
async def reset_leitura(
    current_user: CurrentUser = Depends(get_current_user),
):
    return await reset_produto1(current_user=current_user)


@router.get("/leitura/me", response_model=Produto1LeituraResponse)
async def read_leitura_personalizada(
    current_user: CurrentUser = Depends(get_current_user),
):
    return await get_produto1_leitura_personalizada(current_user=current_user)


@router.get("/relatorio/me", response_model=Produto1RelatorioResponse)
async def read_relatorio_produto1(
    current_user: CurrentUser = Depends(get_current_user),
):
    return await get_produto1_relatorio(current_user=current_user)


@router.get("/relatorio/me/pdf")
async def download_relatorio_produto1_pdf(
    current_user: CurrentUser = Depends(get_current_user),
):
    report = await get_produto1_relatorio(current_user=current_user)
    pdf_bytes = await build_produto1_report_pdf(report)
    filename = get_report_pdf_filename(report)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
        },
    )
