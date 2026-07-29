import secrets
import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Numeric,
    String,
    UniqueConstraint,
    func,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


def _new_order_id() -> str:
    return f"ord_{uuid.uuid4().hex[:12]}"


def _new_order_item_id() -> str:
    return f"oit_{uuid.uuid4().hex[:12]}"


def _new_cancellation_code() -> str:
    return secrets.token_urlsafe(32)


class Order(Base):
    """Una orden de compra de uno o mas cursos.

    user_id es nullable por el borrado de cuenta (ON DELETE SET NULL),
    no porque exista checkout anonimo: toda orden nace con un usuario.
    Efecto lateral bueno: una orden huerfana no matchea contra ninguna
    sesion, asi que el control de acceso de F4-6 la devuelve 404 por
    construccion.

    provider_payment_id es nullable y UNIQUE a la vez a proposito:
    Postgres permite multiples NULL en un indice unico, asi que todas
    las ordenes pending conviven sin chocar entre si, y en cuanto el
    webhook de F4-5 escribe el id de pago la base impide que una
    segunda orden reclame el mismo pago. La idempotencia vive ahi, no
    en un if.
    """

    __tablename__ = "orders"
    __table_args__ = (
        CheckConstraint(
            "status IN ('pending', 'paid', 'failed', 'refunded', 'expired', "
            "'partially_refunded')",
            name="ck_orders_status",
        ),
        CheckConstraint("currency IN ('ARS')", name="ck_orders_currency"),
        Index(
            "uq_orders_una_pending_por_usuario",
            "user_id",
            unique=True,
            postgresql_where=text("status = 'pending'"),
        ),
    )

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_new_order_id)
    user_id: Mapped[str | None] = mapped_column(
        String(32), ForeignKey("users.id", ondelete="SET NULL"), index=True
    )
    status: Mapped[str] = mapped_column(String(20), server_default="pending")
    total: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    currency: Mapped[str] = mapped_column(String(3), server_default="ARS")
    cancellation_code: Mapped[str] = mapped_column(
        String(64), unique=True, default=_new_cancellation_code
    )
    provider_preference_id: Mapped[str | None] = mapped_column(String(64), unique=True)
    provider_payment_id: Mapped[str | None] = mapped_column(String(64), unique=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    items: Mapped[list["OrderItem"]] = relationship(
        back_populates="order", cascade="all, delete-orphan", passive_deletes=True
    )


class OrderItem(Base):
    """Un curso dentro de una orden, con titulo y precio congelados al
    momento de la compra (snapshot): si se leyeran de courses al
    mostrar una orden vieja, cambiar el precio o el titulo de un curso
    reescribiria la historia de lo que la gente pago. Sin columna
    quantity: un curso es acceso permanente, no una unidad.
    """

    __tablename__ = "order_items"
    __table_args__ = (
        UniqueConstraint("order_id", "course_id", name="uq_order_items_order_course"),
    )

    id: Mapped[str] = mapped_column(
        String(32), primary_key=True, default=_new_order_item_id
    )
    order_id: Mapped[str] = mapped_column(
        String(32), ForeignKey("orders.id", ondelete="CASCADE"), index=True
    )
    course_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("courses.id"), index=True
    )
    title: Mapped[str] = mapped_column(String(200))
    unit_price: Mapped[Decimal] = mapped_column(Numeric(12, 2))

    order: Mapped["Order"] = relationship(back_populates="items")
