import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.auth_token import AuthToken
    from app.models.user_session import UserSession


def _new_user_id() -> str:
    return f"usr_{uuid.uuid4().hex[:12]}"


class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        CheckConstraint(
            "plan IN ('starter', 'pro', 'unlimited')", name="ck_users_plan"
        ),
        CheckConstraint("role IN ('user', 'admin')", name="ck_users_role"),
        CheckConstraint("email = lower(email)", name="ck_users_email_lowercase"),
    )

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_new_user_id)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    hashed_password: Mapped[str] = mapped_column(String(255))
    plan: Mapped[str] = mapped_column(String(20), server_default="starter")
    role: Mapped[str] = mapped_column(String(20), server_default="user")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    email_verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    accepted_terms_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    terms_version: Mapped[str | None] = mapped_column(String(20))

    sessions: Mapped[list["UserSession"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
        lazy="raise_on_sql",
    )
    auth_tokens: Mapped[list["AuthToken"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
        lazy="raise_on_sql",
    )

    @property
    def email_verified(self) -> bool:
        return self.email_verified_at is not None
