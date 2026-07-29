"""Logica de negocio del checkout. Sin FastAPI: los errores son
excepciones propias (CheckoutError y subclases) que
app/api/routes/checkout.py traduce a HTTPException con el codigo y el
cuerpo que le corresponden a cada una.
"""

from dataclasses import dataclass
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.course import Course
from app.models.order import Order, OrderItem
from app.models.purchase import Purchase
from app.models.user import User

MAX_ITEMS_POR_CARRITO = 20


class CheckoutError(Exception):
    """Base de los errores de negocio del checkout."""


class CarritoInvalidoError(CheckoutError):
    """Carrito vacio, con un course_id repetido, o con mas de
    MAX_ITEMS_POR_CARRITO items.
    """


class CursoNoDisponibleError(CheckoutError):
    """Alguno de los course_id no existe o tiene active=False."""

    def __init__(self, course_ids: list[str]) -> None:
        super().__init__(f"Cursos no disponibles: {course_ids}")
        self.course_ids = course_ids


class CursosYaCompradosError(CheckoutError):
    """El usuario ya compro alguno de los cursos del carrito.

    Trae la lista COMPLETA de course_id conflictivos: el checkout
    completo se rechaza, no se filtra el resto para cobrarlo
    (FASE-4.md 6.3).
    """

    def __init__(self, course_ids: list[str]) -> None:
        super().__init__(f"Cursos ya comprados: {course_ids}")
        self.course_ids = course_ids


class CheckoutEnCarreraError(CheckoutError):
    """Dos checkouts del mismo usuario corrieron en paralelo y este
    perdio contra uq_orders_una_pending_por_usuario. Misma forma de
    manejo que el IntegrityError de /auth/register en F4-1.
    """


@dataclass(frozen=True)
class CheckoutResultado:
    orden: Order
    preferencia_a_anular: str | None


def _validar_carrito(course_ids: list[str]) -> None:
    if not course_ids:
        raise CarritoInvalidoError("El carrito esta vacio")
    if len(course_ids) > MAX_ITEMS_POR_CARRITO:
        raise CarritoInvalidoError(
            f"El carrito no puede tener mas de {MAX_ITEMS_POR_CARRITO} items"
        )
    if len(set(course_ids)) != len(course_ids):
        raise CarritoInvalidoError("El carrito tiene un curso repetido")


def crear_checkout(
    db: Session, *, user: User, course_ids: list[str]
) -> CheckoutResultado:
    _validar_carrito(course_ids)

    cursos_por_id = {
        curso.id: curso
        for curso in db.execute(
            select(Course).where(Course.id.in_(course_ids))
        ).scalars()
    }
    no_disponibles = [
        cid
        for cid in course_ids
        if cid not in cursos_por_id or not cursos_por_id[cid].active
    ]
    if no_disponibles:
        raise CursoNoDisponibleError(no_disponibles)

    ya_comprados = list(
        db.execute(
            select(Purchase.course_id).where(
                Purchase.user_id == user.id, Purchase.course_id.in_(course_ids)
            )
        ).scalars()
    )
    if ya_comprados:
        raise CursosYaCompradosError(ya_comprados)

    # Reemplazo, no reutilizacion: si hay una orden pending, pasa a
    # expired en esta misma transaccion y se crea una nueva al precio
    # de hoy (FASE-4.md 6.4). El 409 de arriba ya paso, asi que este
    # bloque nunca corre en el mismo request que un 409.
    orden_previa = db.execute(
        select(Order).where(Order.user_id == user.id, Order.status == "pending")
    ).scalar_one_or_none()

    preferencia_a_anular = None
    if orden_previa is not None:
        orden_previa.status = "expired"
        preferencia_a_anular = orden_previa.provider_preference_id

    items = [
        OrderItem(
            course_id=cid,
            title=cursos_por_id[cid].title,
            unit_price=cursos_por_id[cid].price,
        )
        for cid in course_ids
    ]
    total = sum((item.unit_price for item in items), Decimal("0"))

    orden = Order(
        user_id=user.id,
        status="pending",
        total=total,
        currency="ARS",
        items=items,
    )
    db.add(orden)
    try:
        db.flush()
    except IntegrityError:
        # Ventana de carrera contra uq_orders_una_pending_por_usuario,
        # misma forma que el INSERT de /auth/register en F4-1:
        # db.rollback() deshace el savepoint de este intento nada mas.
        db.rollback()
        raise CheckoutEnCarreraError() from None

    db.commit()

    return CheckoutResultado(orden=orden, preferencia_a_anular=preferencia_a_anular)
