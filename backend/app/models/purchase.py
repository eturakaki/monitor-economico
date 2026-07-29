import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


def _new_purchase_id() -> str:
    return f"pur_{uuid.uuid4().hex[:12]}"


class Purchase(Base):
    """Registra que un usuario compro un curso. Sin order_id todavia: la
    tabla orders llega en F4-4 y ahi se agrega la columna y la FK.
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
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
