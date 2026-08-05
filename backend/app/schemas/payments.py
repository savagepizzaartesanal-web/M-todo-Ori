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
