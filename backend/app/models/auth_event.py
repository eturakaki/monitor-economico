import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


def _new_event_id() -> str:
    return f"evt_{uuid.uuid4().hex[:12]}"


class AuthEvent(Base):
    """Bitacora de eventos de autenticacion (login, logout, cambios de password, etc)."""

    __tablename__ = "auth_events"
    __table_args__ = (
        CheckConstraint(
            "event_type IN ('login_success', 'login_failed', 'logout', 'register', "
            "'password_changed', 'password_reset_requested', 'email_verified', "
            "'session_revoked')",
            name="ck_auth_events_type",
        ),
    )

    id: Mapped[str] = mapped_column(
        String(32), primary_key=True, default=_new_event_id
    )
    user_id: Mapped[str | None] = mapped_column(
        String(32), ForeignKey("users.id", ondelete="SET NULL"), index=True
    )
    email_attempted: Mapped[str | None] = mapped_column(String(255), index=True)
    event_type: Mapped[str] = mapped_column(String(40), index=True)
    ip: Mapped[str | None] = mapped_column(String(45), index=True)
    user_agent: Mapped[str | None] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )
