"""Instancia compartida de Limiter.

Vive en su propio modulo (y no en main.py) para que main.py y los
routers puedan importarla sin depender uno del otro.
"""

from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.config import settings
from app.db.session import SessionLocal
from app.services import auth as auth_service

limiter = Limiter(key_func=get_remote_address)


def get_user_id_or_ip(request: Request) -> str:
    """Key function de slowapi para limitar por usuario en vez de por IP
    (la usa POST /checkout: el endpoint ya exige sesion, asi que el
    atacante esta identificado antes de entrar).

    slowapi evalua el key_func ANTES de invocar el endpoint (ver
    Limiter.__limit_decorator en la libreria instalada): a esa altura
    Depends(get_current_user) ya se resolvio para armar los argumentos
    del endpoint, pero el key_func solo recibe `request`, no esos
    argumentos ya resueltos. Por eso repite la misma consulta de sesion
    con una Session propia en vez de leer el usuario que deps.py ya
    calculo. get_active_session es de solo lectura (no hace
    touch_session ni commit), asi que repetirla es inocuo.

    Cae a la IP si no hay sesion valida: no deberia pasar detras de
    require_verified_email, pero un key_func no puede devolver un 401 -
    esa autorizacion la sigue haciendo la dependencia real.
    """
    token = request.cookies.get(settings.session_cookie_name)
    if token:
        db = SessionLocal()
        try:
            session = auth_service.get_active_session(db, token)
            if session is not None:
                return f"user:{session.user_id}"
        finally:
            db.close()
    return get_remote_address(request)
