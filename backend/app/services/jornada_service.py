import httpx
from fastapi import HTTPException, status

from app.schemas.auth import CurrentUser
from app.schemas.jornada import JornadaResponse, JornadaStatus
from app.services.auth_service import get_supabase_config

CLIENTE_SELECT = ",".join(
    [
        "id",
        "user_id",
        "email",
        "nome",
        "resultado",
        "produto_1_liberado",
        "produto_2_liberado",
        "produto_3_liberado",
        "perfil_onboarding_concluido",
        "status_jornada",
    ]
)


def get_supabase_rest_headers(current_user: CurrentUser) -> dict[str, str]:
    _, publishable_key = get_supabase_config()

    if not current_user.access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autenticação ausente.",
        )

    return {
        "apikey": publishable_key,
        "Authorization": f"Bearer {current_user.access_token}",
    }


async def fetch_cliente_by_field(
    *,
    field: str,
    value: str,
    current_user: CurrentUser,
) -> dict | None:
    supabase_url, _ = get_supabase_config()

    async with httpx.AsyncClient(timeout=8) as client:
        response = await client.get(
            f"{supabase_url}/rest/v1/clientes",
            params={
                "select": CLIENTE_SELECT,
                field: f"eq.{value}",
                "limit": "1",
            },
            headers=get_supabase_rest_headers(current_user),
        )

    if response.status_code >= 400:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Não foi possível consultar a jornada no Supabase.",
        )

    rows = response.json()
    return rows[0] if rows else None


async def fetch_current_cliente(current_user: CurrentUser) -> dict | None:
    cliente = await fetch_cliente_by_field(
        field="user_id",
        value=current_user.user_id,
        current_user=current_user,
    )

    if cliente or not current_user.email:
        return cliente

    return await fetch_cliente_by_field(
        field="email",
        value=current_user.email,
        current_user=current_user,
    )


def build_jornada_status(cliente: dict | None) -> JornadaStatus:
    if not cliente:
        return JornadaStatus(
            entradaOri="pendente",
            produto1="disponivel",
            produto2="selado",
            produto3="selado",
            espelhoOri="selado",
            oraculo="selado",
        )

    has_onboarding = bool(cliente.get("perfil_onboarding_concluido"))
    has_result = bool(cliente.get("resultado"))
    produto_1_liberado = cliente.get("produto_1_liberado")
    produto_2_liberado = bool(cliente.get("produto_2_liberado"))
    produto_3_liberado = bool(cliente.get("produto_3_liberado"))

    return JornadaStatus(
        entradaOri="concluida" if has_onboarding else "pendente",
        produto1=(
            "concluido"
            if has_result
            else "disponivel"
            if produto_1_liberado is not False
            else "selado"
        ),
        produto2="disponivel" if produto_2_liberado else "proximo" if has_result else "selado",
        produto3="disponivel" if produto_3_liberado else "proximo" if produto_2_liberado else "selado",
        espelhoOri="ativo" if has_result else "selado",
        oraculo="ativo" if has_result else "selado",
    )


async def get_current_jornada(current_user: CurrentUser) -> JornadaResponse:
    cliente = await fetch_current_cliente(current_user)
    jornada = build_jornada_status(cliente)

    if not cliente:
        return JornadaResponse(
            user_id=current_user.user_id,
            email=current_user.email,
            jornada=jornada,
        )

    return JornadaResponse(
        user_id=current_user.user_id,
        email=cliente.get("email") or current_user.email,
        cliente_id=cliente.get("id"),
        nome=cliente.get("nome"),
        resultado=cliente.get("resultado"),
        status_jornada=cliente.get("status_jornada"),
        perfil_onboarding_concluido=bool(cliente.get("perfil_onboarding_concluido")),
        produto_1_liberado=cliente.get("produto_1_liberado") is not False,
        produto_2_liberado=bool(cliente.get("produto_2_liberado")),
        produto_3_liberado=bool(cliente.get("produto_3_liberado")),
        jornada=jornada,
    )
