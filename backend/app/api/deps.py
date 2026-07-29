from collections.abc import Callable

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models.user import User
from app.models.user_session import UserSession
from app.services import auth as auth_service
from app.services.payments import FakePaymentProvider, PaymentProvider


def get_client_info(request: Request) -> tuple[str | None, str | None]:
    """Extrae ip y user agent de la request para guardarlos en la base."""
    ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    if user_agent is not None:
        user_agent = user_agent[:255]
    return ip, user_agent


def get_current_session(
    request: Request, db: Session = Depends(get_db)
) -> UserSession:
    """Exige una sesion valida via cookie. El mensaje es el mismo sin
    importar si falta la cookie, es invalida o vencio: no le damos
    pistas a quien este probando.
    """
    token = request.cookies.get(settings.session_cookie_name)
    session = auth_service.get_active_session(db, token) if token else None
    if session is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="No autenticado"
        )
    auth_service.touch_session(db, session)
    db.commit()
    return session


def get_current_user(
    session: UserSession = Depends(get_current_session),
) -> User:
    return session.user


def get_optional_user(
    request: Request, db: Session = Depends(get_db)
) -> User | None:
    """Igual que get_current_user pero devuelve None en vez de 401.

    Sirve para paginas que se ven distinto si estas logueado pero no
    exigen sesion.
    """
    token = request.cookies.get(settings.session_cookie_name)
    session = auth_service.get_active_session(db, token) if token else None
    if session is None:
        return None
    auth_service.touch_session(db, session)
    db.commit()
    return session.user


def require_verified_email(user: User = Depends(get_current_user)) -> User:
    if user.email_verified_at is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Verifica tu email para continuar",
        )
    return user


def require_plan(*plans: str) -> Callable[[User], User]:
    """Fabrica de dependencias que exige uno de los planes dados.

    Un usuario con role == "admin" pasa siempre, sin importar el plan.
    """

    def dependency(user: User = Depends(get_current_user)) -> User:
        if user.role != "admin" and user.plan not in plans:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Tu plan no incluye esta funcion",
            )
        return user

    return dependency


def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Necesitas permisos de administrador",
        )
    return user


def get_payment_provider() -> PaymentProvider:
    """Dependencia de FastAPI para inyectar el proveedor de pago.

    Va aca y no en services/ porque services/ no importa FastAPI (ver
    services/checkout.py y services/payments.py: ninguno lo hace).
    FakePaymentProvider es la unica implementacion hasta F4-4b.
    """
    return FakePaymentProvider()
