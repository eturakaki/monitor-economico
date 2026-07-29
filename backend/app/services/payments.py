"""Adaptador de proveedor de pago para el checkout.

FakePaymentProvider es la unica implementacion de este PR: no sale a la
red, y las dos ramas de error (fail_create/fail_expire) existen para
que routes/checkout.py pueda testear el manejo de las dos fallas
posibles sin depender de una API real.

El adaptador real de MercadoPago (F4-4b) le manda el id de la orden
como external_reference al crear la preferencia. Al consultar un pago,
ese external_reference se lee SIEMPRE de la RE-CONSULTA a la API,
nunca del payload de la notificacion del webhook: leerlo del mensaje
dejaria que un atacante elija que orden marcar como pagada
(FASE-4.md 6.5).
"""

from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from typing import Any, Protocol


class PaymentProviderError(Exception):
    """El proveedor de pago fallo al crear o anular una preferencia."""


@dataclass(frozen=True)
class PreferenceItem:
    """Lo que el dominio necesita para armar una preferencia: sin
    quantity (un curso es acceso, no una unidad) ni currency (una sola
    moneda). Lo que MercadoPago exija de mas lo agrega el adaptador real
    en F4-4b, no este tipo.
    """

    course_id: str
    title: str
    unit_price: Decimal


@dataclass(frozen=True)
class Preference:
    preference_id: str
    init_point: str


class PaymentProvider(Protocol):
    def create_preference(
        self, *, order_id: str, items: list[PreferenceItem], expires_at: datetime
    ) -> Preference: ...

    def expire_preference(self, preference_id: str) -> None: ...


class FakePaymentProvider:
    """Implementacion sin red, unica de F4-4a. Valores deterministas
    para que los tests puedan predecirlos sin inspeccionar el objeto.
    """

    def __init__(self) -> None:
        self.calls: list[dict[str, Any]] = []
        self.fail_create = False
        self.fail_expire = False

    def create_preference(
        self, *, order_id: str, items: list[PreferenceItem], expires_at: datetime
    ) -> Preference:
        self.calls.append(
            {
                "method": "create_preference",
                "order_id": order_id,
                "items": items,
                "expires_at": expires_at,
            }
        )
        if self.fail_create:
            raise PaymentProviderError(
                f"Fallo simulado al crear la preferencia de {order_id}"
            )
        preference_id = f"fake_pref_{order_id}"
        return Preference(
            preference_id=preference_id,
            init_point=f"https://fake.checkout/{preference_id}",
        )

    def expire_preference(self, preference_id: str) -> None:
        self.calls.append({"method": "expire_preference", "preference_id": preference_id})
        if self.fail_expire:
            raise PaymentProviderError(
                f"Fallo simulado al anular la preferencia {preference_id}"
            )
