from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.core.config import settings
from app.core.security import generate_token, hash_token
from app.models.auth_event import AuthEvent
from app.models.auth_token import AuthToken
from app.models.user import User
from app.models.user_session import UserSession

SESSION_TOUCH_THROTTLE = timedelta(hours=1)


def create_session(
    db: Session, user: User, ip: str | None = None, user_agent: str | None = None
) -> str:
    """Crea una sesion nueva para el usuario y devuelve el token en claro.

    Es la unica vez que el token en claro existe fuera de la cookie del
    usuario: no lo loguees ni lo devuelvas en ningun otro lado.
    """
    token = generate_token()
    session = UserSession(
        user_id=user.id,
        token_hash=hash_token(token),
        expires_at=datetime.now(timezone.utc)
        + timedelta(days=settings.session_lifetime_days),
        ip=ip,
        user_agent=user_agent,
    )
    db.add(session)
    db.flush()
    return token


def get_active_session(db: Session, token: str) -> UserSession | None:
    """Busca una sesion activa (no revocada, no vencida) por su token."""
    stmt = (
        select(UserSession)
        .options(joinedload(UserSession.user))
        .where(UserSession.token_hash == hash_token(token))
    )
    session = db.execute(stmt).scalar_one_or_none()
    if session is None:
        return None
    if session.revoked_at is not None or session.expires_at <= datetime.now(timezone.utc):
        return None
    return session


def touch_session(db: Session, session: UserSession) -> None:
    """Renueva la sesion (sliding expiration) con un freno de una hora.

    Sin el freno, cada request del usuario escribiria en la base. Con
    el, escribe como maximo una vez por hora.
    """
    now = datetime.now(timezone.utc)
    if now - session.last_seen_at < SESSION_TOUCH_THROTTLE:
        return
    session.last_seen_at = now
    session.expires_at = now + timedelta(days=settings.session_lifetime_days)


def revoke_session(db: Session, session: UserSession) -> None:
    """Revoca una sesion si todavia estaba activa."""
    if session.revoked_at is None:
        session.revoked_at = datetime.now(timezone.utc)


def revoke_all_sessions(
    db: Session, user_id: str, except_session_id: str | None = None
) -> int:
    """Revoca todas las sesiones activas de un usuario y devuelve cuantas.

    Se usa al verificar el email y al cambiar la password, para cerrar
    el ataque de pre-hijacking (alguien registro la cuenta con el email
    de otro y sigue adentro cuando el dueño real la recupera).
    """
    now = datetime.now(timezone.utc)
    stmt = select(UserSession).where(
        UserSession.user_id == user_id, UserSession.revoked_at.is_(None)
    )
    if except_session_id is not None:
        stmt = stmt.where(UserSession.id != except_session_id)
    sessions = db.execute(stmt).scalars().all()
    for session in sessions:
        session.revoked_at = now
    return len(sessions)


def create_auth_token(db: Session, user: User, purpose: str) -> str:
    """Crea un token de un solo uso (verificacion de email o reset) y
    devuelve el valor en claro para el link del mail.

    Invalida cualquier token previo sin usar del mismo usuario y
    proposito: si alguien pide "recuperar contraseña" varias veces,
    solo el ultimo link debe funcionar.
    """
    if purpose == "email_verification":
        lifetime = timedelta(hours=settings.verification_token_hours)
    elif purpose == "password_reset":
        lifetime = timedelta(minutes=settings.reset_token_minutes)
    else:
        raise ValueError(f"purpose invalido: {purpose!r}")

    now = datetime.now(timezone.utc)

    stmt = select(AuthToken).where(
        AuthToken.user_id == user.id,
        AuthToken.purpose == purpose,
        AuthToken.used_at.is_(None),
    )
    for previous in db.execute(stmt).scalars().all():
        previous.used_at = now

    token = generate_token()
    auth_token = AuthToken(
        user_id=user.id,
        token_hash=hash_token(token),
        purpose=purpose,
        expires_at=now + lifetime,
    )
    db.add(auth_token)
    db.flush()
    return token


def consume_auth_token(db: Session, token: str, purpose: str) -> User | None:
    """Valida y consume un token de un solo uso. Devuelve el usuario si
    era valido, o None si no existe, ya se uso, o vencio.
    """
    stmt = select(AuthToken).where(
        AuthToken.token_hash == hash_token(token), AuthToken.purpose == purpose
    )
    auth_token = db.execute(stmt).scalar_one_or_none()
    if auth_token is None:
        return None
    now = datetime.now(timezone.utc)
    if auth_token.used_at is not None or auth_token.expires_at <= now:
        return None
    auth_token.used_at = now
    return auth_token.user


def log_event(
    db: Session,
    event_type: str,
    user_id: str | None = None,
    email_attempted: str | None = None,
    ip: str | None = None,
    user_agent: str | None = None,
) -> None:
    """Registra un evento en la bitacora de autenticacion."""
    event = AuthEvent(
        user_id=user_id,
        email_attempted=email_attempted.lower() if email_attempted else email_attempted,
        event_type=event_type,
        ip=ip,
        user_agent=user_agent,
    )
    db.add(event)
