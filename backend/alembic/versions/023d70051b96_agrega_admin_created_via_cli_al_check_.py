"""agrega admin_created_via_cli al check de auth_events

Revision ID: 023d70051b96
Revises: b16b27fb51ba
Create Date: 2026-07-28 22:11:07.715240

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '023d70051b96'
down_revision: Union[str, Sequence[str], None] = 'b16b27fb51ba'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Postgres no permite ALTER de un CHECK existente: hay que borrarlo y
    # crearlo de nuevo con la lista completa.
    op.drop_constraint("ck_auth_events_type", "auth_events", type_="check")
    op.create_check_constraint(
        "ck_auth_events_type",
        "auth_events",
        "event_type IN ('login_success', 'login_failed', 'logout', 'register', "
        "'password_changed', 'password_reset_requested', 'email_verified', "
        "'session_revoked', 'admin_created_via_cli')",
    )


def downgrade() -> None:
    """Downgrade schema.

    Este downgrade falla si ya existen filas en auth_events con
    event_type = 'admin_created_via_cli': la restriccion vieja no admite
    ese valor, y Postgres se niega a crear un CHECK que los datos
    actuales violan. Es el comportamiento correcto: la base se niega a
    quedar en un estado que su propia restriccion prohibe. Si eso pasa,
    no hay una respuesta automatica correcta (borrar esas filas destruye
    auditoria; cambiarles el event_type falsea el registro) — hay que
    decidir a mano que hacer con ellas antes de poder bajar la migracion.
    """
    op.drop_constraint("ck_auth_events_type", "auth_events", type_="check")
    op.create_check_constraint(
        "ck_auth_events_type",
        "auth_events",
        "event_type IN ('login_success', 'login_failed', 'logout', 'register', "
        "'password_changed', 'password_reset_requested', 'email_verified', "
        "'session_revoked')",
    )
