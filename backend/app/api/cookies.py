from fastapi import Response

from app.core.config import settings

_COOKIE_KWARGS = {
    "key": settings.session_cookie_name,
    "httponly": True,
    "secure": True,
    "samesite": "lax",
    "path": "/",
}


def set_session_cookie(response: Response, token: str) -> None:
    """Setea la cookie de sesion.

    httponly impide que JavaScript la lea, lo que neutraliza el robo de
    sesion por XSS. secure=True funciona igual en desarrollo porque los
    navegadores tratan http://localhost como contexto seguro.
    """
    response.set_cookie(
        value=token,
        max_age=settings.session_lifetime_days * 24 * 3600,
        **_COOKIE_KWARGS,
    )


def clear_session_cookie(response: Response) -> None:
    """Borra la cookie de sesion con los mismos atributos con los que se
    seteo: si no coinciden, el navegador no la borra.
    """
    response.delete_cookie(**_COOKIE_KWARGS)
