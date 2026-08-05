from datetime import UTC, datetime
from typing import Any
from uuid import uuid4

from fastapi import HTTPException, status

from app.constants import journey_status
from app.schemas.auth import CurrentUser
from app.schemas.payments import (
    PaymentCheckoutResponse,
    PaymentListResponse,
    PaymentStatusResponse,
)
from app.services.mercado_pago_service import (
    MercadoPagoClient,
    decimal_amount_to_cents,
    validate_mercado_pago_signature,
)
from app.services.supabase_admin_service import SupabaseAdminRepository

PAYMENT_PROVIDER = "mercado_pago"
PAYMENT_EVENT_TYPES = {"payment"}
ALLOWED_PRODUCT_ENTITLEMENTS = {
    "produto_1_completo": "produto_1_completo_liberado",
    "produto_2": "produto_2_liberado",
    "produto_3": "produto_3_liberado",
}
PAYMENT_TERMINAL_STATUSES = {"approved", "rejected", "cancelled", "expired", "refunded"}
PAYMENT_INTERNAL_STATUSES = {
    "created",
    "pending",
    "approved",
    "rejected",
    "cancelled",
    "expired",
    "refunded",
    "error",
}
PRODUTO1_DONE_STATUSES = {
    journey_status.CODIGO_DAS_DEUSAS_CONCLUIDO,
    journey_status.DOSSIE_ORI_LIBERADO,
    journey_status.DOSSIE_ORI_EM_PREENCHIMENTO,
    journey_status.DOSSIE_ORI_EM_ANALISE,
    journey_status.DOSSIE_ORI_PUBLICADO,
    journey_status.CODIGO_FINAL_LIBERADO,
    journey_status.CODIGO_FINAL_EM_PREENCHIMENTO,
    journey_status.CODIGO_FINAL_EM_ANALISE,
    journey_status.CODIGO_FINAL_PUBLICADO,
    journey_status.JORNADA_FINALIZADA,
}
PRODUTO2_DONE_STATUSES = {
    journey_status.DOSSIE_ORI_PUBLICADO,
    journey_status.CODIGO_FINAL_LIBERADO,
    journey_status.CODIGO_FINAL_EM_PREENCHIMENTO,
    journey_status.CODIGO_FINAL_EM_ANALISE,
    journey_status.CODIGO_FINAL_PUBLICADO,
    journey_status.JORNADA_FINALIZADA,
}


def get_payment_repository() -> SupabaseAdminRepository:
    return SupabaseAdminRepository()


def get_mercado_pago_client() -> MercadoPagoClient:
    return MercadoPagoClient()


def map_mercado_pago_status(provider_status: str | None) -> str:
    mapping = {
        "approved": "approved",
        "authorized": "pending",
        "in_process": "pending",
        "in_mediation": "pending",
        "pending": "pending",
        "rejected": "rejected",
        "cancelled": "cancelled",
        "refunded": "refunded",
        "charged_back": "refunded",
    }
    return mapping.get(provider_status or "", "error")


def sanitize_webhook_payload(payload: dict[str, Any], data_id: str | None) -> dict:
    return {
        "id": payload.get("id"),
        "type": payload.get("type"),
        "action": payload.get("action"),
        "api_version": payload.get("api_version"),
        "data_id": data_id,
    }


def get_provider_event_id(payload: dict[str, Any], x_request_id: str, data_id: str) -> str:
    raw_event_id = payload.get("id")
    if raw_event_id:
        return str(raw_event_id)
    return f"{x_request_id}:{data_id}"


def validate_product_for_checkout(product: dict | None, product_code: str) -> dict:
    if not product or product.get("product_code") != product_code:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produto não encontrado.",
        )

    if product_code not in ALLOWED_PRODUCT_ENTITLEMENTS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Produto não disponível para checkout.",
        )

    expected_entitlement = ALLOWED_PRODUCT_ENTITLEMENTS[product_code]
    if product.get("grants_product") != expected_entitlement:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Catálogo de pagamento inconsistente.",
        )

    if product.get("active") is not True:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Produto inativo para checkout.",
        )

    if not isinstance(product.get("amount_cents"), int) or product["amount_cents"] <= 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Produto sem preço válido.",
        )

    if product.get("currency") != "BRL":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Moeda inválida para checkout.",
        )

    return product


def entitlement_key_for_product(product_code: str) -> str:
    entitlement_key = ALLOWED_PRODUCT_ENTITLEMENTS.get(product_code)
    if not entitlement_key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Produto não permitido.",
        )
    return entitlement_key


def cliente_has_entitlement(cliente: dict, product_code: str) -> bool:
    return bool(cliente.get(entitlement_key_for_product(product_code)))


def validate_checkout_prerequisites(cliente: dict, product_code: str) -> None:
    has_produto1_result = bool(cliente.get("resultado"))
    status_jornada = cliente.get("status_jornada")

    if product_code == "produto_1_completo":
        if not has_produto1_result:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Conclua o resultado do Código das Deusas antes deste checkout.",
            )

    if product_code == "produto_2":
        if not has_produto1_result or status_jornada not in PRODUTO1_DONE_STATUSES:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Conclua o Código das Deusas antes deste checkout.",
            )

    if product_code == "produto_3":
        if status_jornada not in PRODUTO2_DONE_STATUSES:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Conclua o Dossiê ORI antes deste checkout.",
            )


def status_response_from_order(order: dict, *, entitlement_granted: bool) -> PaymentStatusResponse:
    return PaymentStatusResponse(
        order_id=order["id"],
        product_code=order["product_code"],
        status=order["status"],
        created_at=order.get("created_at"),
        approved_at=order.get("approved_at"),
        entitlement_granted=entitlement_granted,
    )


async def create_checkout(
    *,
    payload_product_code: str,
    current_user: CurrentUser,
    repository: Any | None = None,
    mercado_pago: Any | None = None,
) -> PaymentCheckoutResponse:
    repository = repository or get_payment_repository()
    mercado_pago = mercado_pago or get_mercado_pago_client()

    cliente = await repository.fetch_current_cliente(
        user_id=current_user.user_id,
        email=current_user.email,
    )
    if not cliente or not cliente.get("id"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil da cliente não encontrado.",
        )

    product = validate_product_for_checkout(
        await repository.fetch_product(payload_product_code),
        payload_product_code,
    )
    validate_checkout_prerequisites(cliente, payload_product_code)

    if cliente_has_entitlement(cliente, payload_product_code):
        return PaymentCheckoutResponse(
            order_id=None,
            status="already_granted",
            checkout_url=None,
        )

    approved_order = await repository.fetch_approved_order(
        cliente_id=cliente["id"],
        product_code=payload_product_code,
    )
    if approved_order:
        return PaymentCheckoutResponse(
            order_id=approved_order["id"],
            status="approved",
            checkout_url=None,
        )

    open_order = await repository.fetch_open_order(
        cliente_id=cliente["id"],
        product_code=payload_product_code,
    )
    if open_order and open_order.get("checkout_url"):
        return PaymentCheckoutResponse(
            order_id=open_order["id"],
            status=open_order["status"],
            checkout_url=open_order["checkout_url"],
        )

    order = await repository.create_order(
        {
            "cliente_id": cliente["id"],
            "user_id": current_user.user_id,
            "email": cliente.get("email") or current_user.email,
            "product_code": product["product_code"],
            "grants_product": product["grants_product"],
            "provider": PAYMENT_PROVIDER,
            "status": "created",
            "external_reference": f"ori-{uuid4()}",
            "amount_cents": product["amount_cents"],
            "currency": product["currency"],
            "metadata": {},
        }
    )
    preference = await mercado_pago.create_preference(order=order, product=product)
    checkout_url = preference.get("init_point") or preference.get("sandbox_init_point")

    if not preference.get("id") or not checkout_url:
        await repository.update_order(order["id"], {"status": "error"})
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Checkout não confirmou a URL de pagamento.",
        )

    updated_order = await repository.update_order(
        order["id"],
        {
            "provider_preference_id": preference["id"],
            "checkout_url": checkout_url,
            "status": "pending",
        },
    )

    return PaymentCheckoutResponse(
        order_id=updated_order.get("id") or order["id"],
        status=updated_order.get("status") or "pending",
        checkout_url=updated_order.get("checkout_url") or checkout_url,
    )


async def get_payment_status(
    *,
    order_id: str,
    current_user: CurrentUser,
    repository: Any | None = None,
) -> PaymentStatusResponse:
    repository = repository or get_payment_repository()
    order = await repository.fetch_order_by_id(order_id)

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pedido não encontrado.",
        )

    if order.get("user_id") != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Pedido não pertence a esta usuária.",
        )

    cliente = await repository.fetch_cliente_by_id(order["cliente_id"])
    entitlement_granted = (
        bool(cliente.get(entitlement_key_for_product(order["product_code"])))
        if cliente
        else False
    )

    return status_response_from_order(order, entitlement_granted=entitlement_granted)


async def list_my_payments(
    *,
    current_user: CurrentUser,
    repository: Any | None = None,
) -> PaymentListResponse:
    repository = repository or get_payment_repository()
    orders = await repository.list_orders_for_user(current_user.user_id)
    responses = []

    for order in orders:
        cliente = await repository.fetch_cliente_by_id(order["cliente_id"])
        responses.append(
            status_response_from_order(
                order,
                entitlement_granted=(
                    bool(cliente.get(entitlement_key_for_product(order["product_code"])))
                    if cliente
                    else False
                ),
            )
        )

    return PaymentListResponse(orders=responses)


def should_preserve_approved(current_status: str | None, new_status: str) -> bool:
    return current_status == "approved" and new_status != "approved"


def validate_provider_payment(payment: dict, order: dict, product: dict) -> str:
    provider_payment_id = str(payment.get("id") or "")
    if not provider_payment_id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Pagamento sem identificador do provider.",
        )

    if str(payment.get("external_reference") or "") != order.get("external_reference"):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Referência externa divergente.",
        )

    if order.get("provider_payment_id") and order["provider_payment_id"] != provider_payment_id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Pagamento divergente para o pedido.",
        )

    metadata = payment.get("metadata") if isinstance(payment.get("metadata"), dict) else {}
    if metadata.get("order_id") and metadata["order_id"] != order.get("id"):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Pedido divergente nos metadados do pagamento.",
        )

    if metadata.get("product_code") and metadata["product_code"] != order.get("product_code"):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Produto divergente nos metadados do pagamento.",
        )

    paid_amount_cents = decimal_amount_to_cents(payment.get("transaction_amount"))
    if paid_amount_cents != order.get("amount_cents"):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Valor de pagamento divergente.",
        )

    if payment.get("currency_id") != order.get("currency") or product.get("currency") != order.get("currency"):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Moeda de pagamento divergente.",
        )

    if product.get("product_code") != order.get("product_code"):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Produto divergente para o pedido.",
        )

    collector_id = payment.get("collector_id")
    expected_collector_id = product.get("collector_id") or order.get("collector_id")
    if expected_collector_id and str(collector_id) != str(expected_collector_id):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Conta recebedora divergente.",
        )

    return map_mercado_pago_status(payment.get("status"))


def is_payment_webhook_event(payload: dict[str, Any]) -> bool:
    event_type = str(payload.get("type") or "").lower()
    action = str(payload.get("action") or "").lower()
    return event_type in PAYMENT_EVENT_TYPES or action.startswith("payment.")


async def process_mercado_pago_webhook(
    *,
    headers: dict[str, str],
    query_params: dict[str, str],
    payload: dict[str, Any],
    repository: Any | None = None,
    mercado_pago: Any | None = None,
) -> dict[str, str | None]:
    repository = repository or get_payment_repository()
    mercado_pago = mercado_pago or get_mercado_pago_client()
    x_signature = headers.get("x-signature")
    x_request_id = headers.get("x-request-id")
    data_id = query_params.get("data.id") or query_params.get("data_id")

    if not validate_mercado_pago_signature(
        x_signature=x_signature,
        x_request_id=x_request_id,
        data_id=data_id,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Assinatura inválida.",
        )

    assert x_request_id is not None
    assert data_id is not None
    provider_event_id = get_provider_event_id(payload, x_request_id, data_id)
    event = await repository.create_webhook_event(
        {
            "provider": PAYMENT_PROVIDER,
            "provider_event_id": provider_event_id,
            "event_type": payload.get("type") or payload.get("action"),
            "provider_payment_id": data_id,
            "payload_sanitized": sanitize_webhook_payload(payload, data_id),
        }
    )

    if event.get("processed"):
        return {"status": "duplicate", "event_id": event.get("id")}

    if not is_payment_webhook_event(payload):
        await repository.update_webhook_event(
            event["id"],
            {
                "processed": True,
                "processing_error": None,
                "processed_at": datetime.now(UTC).isoformat(),
            },
        )
        return {"status": "ignored", "event_id": event.get("id")}

    try:
        payment = await mercado_pago.get_payment(data_id)
        external_reference = str(payment.get("external_reference") or "")
        order = await repository.fetch_order_by_external_reference(external_reference)

        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pedido não encontrado para o pagamento.",
            )

        product = validate_product_for_checkout(
            await repository.fetch_product(order["product_code"]),
            order["product_code"],
        )
        new_status = validate_provider_payment(payment, order, product)
        order_updates = {
            "provider_payment_id": str(payment["id"]),
            "status": order["status"] if should_preserve_approved(order.get("status"), new_status) else new_status,
        }

        if new_status == "approved" and order.get("approved_at") is None:
            order_updates["approved_at"] = datetime.now(UTC).isoformat()

        updated_order = await repository.update_order(order["id"], order_updates)
        final_order = {**order, **updated_order, **order_updates}
        cliente = await repository.fetch_cliente_by_id(order["cliente_id"])

        if new_status == "approved" and cliente:
            entitlement_key = entitlement_key_for_product(order["product_code"])
            entitlement_was_granted = bool(cliente.get(entitlement_key))

            if not entitlement_was_granted:
                cliente = await repository.grant_entitlement(
                    cliente_id=order["cliente_id"],
                    entitlement_key=entitlement_key,
                )
                await repository.create_admin_event(
                    {
                        "cliente_id": order["cliente_id"],
                        "admin_user_id": order["user_id"],
                        "event_type": "payment_entitlement_granted",
                        "label": "Liberação automática por pagamento aprovado",
                        "details": {
                            "product_code": order["product_code"],
                            "payment_order_id": order["id"],
                            "provider": PAYMENT_PROVIDER,
                            "provider_payment_id": str(payment["id"]),
                            "granted_at": datetime.now(UTC).isoformat(),
                        },
                    }
                )

        await repository.update_webhook_event(
            event["id"],
            {
                "payment_order_id": final_order["id"],
                "processed": True,
                "processing_error": None,
                "processed_at": datetime.now(UTC).isoformat(),
            },
        )
        return {"status": "processed", "event_id": event.get("id")}

    except HTTPException as error:
        if event.get("id"):
            should_retry = error.status_code >= 500
            await repository.update_webhook_event(
                event["id"],
                {
                    "processed": not should_retry,
                    "processing_error": str(error.detail),
                    "processed_at": None
                    if should_retry
                    else datetime.now(UTC).isoformat(),
                },
            )
        raise
