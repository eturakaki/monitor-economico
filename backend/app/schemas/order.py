from decimal import Decimal

from app.schemas.base import CamelModel


class CheckoutItemIn(CamelModel):
    course_id: str
    # Aceptado y completamente ignorado: el precio real sale siempre de
    # courses (services/checkout.py), nunca del request. Se acepta este
    # campo, en vez de rechazarlo como extra, para que el test de precio
    # manipulado pueda mandarlo y probar que no se usa.
    unit_price: Decimal | None = None


class CheckoutIn(CamelModel):
    items: list[CheckoutItemIn]


class CheckoutOut(CamelModel):
    order_id: str
    status: str
    # Decimal se serializa como string en JSON (verificado con Pydantic
    # 2.13.4: model_dump_json/model_dump(mode="json") lo hacen por
    # default). Un numero JSON es coma flotante y reintroduciria el bug
    # que Course.price: Mapped[Decimal] acaba de sacar del modelo.
    total: Decimal
    currency: str
    init_point: str
