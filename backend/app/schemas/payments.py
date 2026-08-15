from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class PaymentCheckoutRequest(BaseModel):
    product_code: str = Field(min_length=1, max_length=80)


class PaymentCheckoutResponse(BaseModel):
    order_id: str | None = None
    status: str
    checkout_url: str | None = None


class PaymentStatusResponse(BaseModel):
    order_id: str
    product_code: str
    status: str
    created_at: datetime | None = None
    approved_at: datetime | None = None
    entitlement_granted: bool = False


class PaymentListResponse(BaseModel):
    orders: list[PaymentStatusResponse]


class PaymentCatalogProductResponse(BaseModel):
    product_code: str
    name: str
    active: bool
    amount_cents: int | None = None
    currency: str
    already_unlocked: bool
    eligible: bool
    blocking_reason: str | None = None


class PaymentCatalogResponse(BaseModel):
    products: list[PaymentCatalogProductResponse]


class MercadoPagoWebhookResponse(BaseModel):
    status: str
    event_id: str | None = None


class PaymentReconcileRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    payment_id: str = Field(min_length=1, max_length=120)


class PaymentReconcileResponse(BaseModel):
    result: str
    reason: str | None = None
    order_id: str | None = None
    product_code: str | None = None


# OBS-3 — timeline administrativa read-only de uma payment_order. Schemas
# explícitos, com whitelist de campos, para nunca vazar colunas futuras de
# payment_orders/payment_webhook_events/clientes através de dict genérico.


class TimelineOrderSummary(BaseModel):
    id: str
    cliente_id: str
    product_code: str
    provider_payment_id: str | None = None
    status: str
    created_at: datetime | None = None
    approved_at: datetime | None = None


class TimelineEvent(BaseModel):
    event: str
    occurred_at: datetime
    source: str
    webhook_event_id: str | None = None


class TimelineCurrentState(BaseModel):
    payment_status: str
    entitlement_granted: bool


class PaymentTimelineResponse(BaseModel):
    order: TimelineOrderSummary
    timeline: list[TimelineEvent]
    current_state: TimelineCurrentState
    limitations: list[str]


class PaymentProduct(BaseModel):
    model_config = ConfigDict(extra="allow")

    product_code: str
    name: str
    grants_product: str
    active: bool
    amount_cents: int | None = None
    currency: str


class PaymentOrder(BaseModel):
    model_config = ConfigDict(extra="allow")

    id: str
    cliente_id: str
    user_id: str | None = None
    email: str | None = None
    product_code: str
    grants_product: str
    provider: str
    status: str
    external_reference: str
    provider_preference_id: str | None = None
    provider_payment_id: str | None = None
    checkout_url: str | None = None
    amount_cents: int | None = None
    currency: str
    created_at: datetime | None = None
    updated_at: datetime | None = None
    approved_at: datetime | None = None
