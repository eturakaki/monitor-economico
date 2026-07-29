import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


def _new_purchase_id() -> str:
    return f"pur_{uuid.uuid4().hex[:12]}"


class Purchase(Base):
    """Registra que un usuario compro un curso.

    order_id es nullable porque el otorgamiento administrativo
    (cortesia, correccion a mano) no tiene orden detras, y porque las
    filas creadas antes de F4-4 nacieron sin la columna. Sin ondelete:
    no se puede borrar una orden que otorgo acceso. Esta columna llega
    vacia a proposito en F4-4a: el otorgamiento real la escribe el
    webhook de F4-5.
    """

    __tablename__ = "purchases"
    __table_args__ = (
        UniqueConstraint("user_id", "course_id", name="uq_purchases_user_course"),
    )

    id: Mapped[str] = mapped_column(
        String(32), primary_key=True, default=_new_purchase_id
    )
    user_id: Mapped[str] = mapped_column(
        String(32), ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    course_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("courses.id"), index=True
    )
    order_id: Mapped[str | None] = mapped_column(
        String(32), ForeignKey("orders.id"), index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
