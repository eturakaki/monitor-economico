import html
import logging
import re
from datetime import datetime, timezone

from fastapi import (
    APIRouter,
    Depends,
    Form,
    HTTPException,
    Query,
    Request,
    Response,
    status,
)
from fastapi.responses import HTMLResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.cookies import clear_session_cookie, set_session_cookie
from app.api.deps import get_client_info, get_current_user
from app.core.config import settings
from app.core.security import hash_password, verify_password
from app.core.limiter import limiter
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import LoginIn, MessageOut, RegisterIn
from app.schemas.user import UserOut
from app.services import auth as auth_service

router = APIRouter(prefix="/auth", tags=["auth"])
logger = logging.getLogger(__name__)

_DUMMY_HASH = hash_password("hash-ficticio-para-timing-constante")
_TOKEN_PATTERN = re.compile(r"^[A-Za-z0-9_-]{20,128}$")
_VERIFY_HEADERS = {"Referrer-Policy": "no-referrer", "X-Robots-Tag": "noindex"}


def _pagina_html(titulo: str, cuerpo: str) -> str:
    return f"""<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>{titulo}</title>
<style>
  body {{ font-family: system-ui, sans-serif; background: #0f172a; color: #e2e8f0;
         display: flex; align-items: center; justify-content: center;
         min-height: 100vh; margin: 0; }}
  .tarjeta {{ background: #1e293b; padding: 2rem; border-radius: 0.75rem;
             max-width: 24rem; text-align: center; }}
  button {{ background: #10b981; color: #052e1f; border: none; border-radius: 0.5rem;
            padding: 0.75rem 1.5rem; font-size: 1rem; font-weight: 600; cursor: pointer; }}
  button:hover {{ background: #34d399; }}
</style>
</head>
<body>
  <div class="tarjeta">{cuerpo}</div>
</body>
</html>"""


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(
    datos: RegisterIn,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
) -> User:
    existing = db.execute(
        select(User).where(User.email == datos.email)
    ).scalar_one_or_none()
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe una cuenta con ese email",
        )

    ip, user_agent = get_client_info(request)

    user = User(
        email=datos.email,
        name=datos.name,
        hashed_password=hash_password(datos.password),
        plan="starter",
        role="user",
        accepted_terms_at=datetime.now(timezone.utc),
        terms_version=settings.terms_version,
    )
    db.add(user)
    db.flush()

    token = auth_service.create_session(db, user, ip=ip, user_agent=user_agent)
    set_session_cookie(response, token)

    verification_token = auth_service.create_auth_token(
        db, user, purpose="email_verification"
    )
    # Comparacion positiva a proposito: environment es un string libre, sin
    # validacion. Con "!= production" un .env que diga "prod" o "Production"
    # deja el guardarrail inservible sin que nadie se entere. Con "==
    # development", cualquier valor inesperado cae del lado seguro (no logea).
    if settings.environment == "development":
        # Este log contiene un token valido: nunca debe existir en produccion.
        # Reemplazar por el envio real de mail en la Fase 4.
        verify_link = f"{settings.public_base_url}/auth/verify?token={verification_token}"
        logger.warning("SOLO DESARROLLO - link de verificacion para %s: %s", user.email, verify_link)

    auth_service.log_event(
        db, "register", user_id=user.id, email_attempted=user.email,
        ip=ip, user_agent=user_agent,
    )
    db.commit()
    return user


@router.post("/login", response_model=UserOut)
@limiter.limit("5/15minutes")
def login(
    datos: LoginIn,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
) -> User:
    ip, user_agent = get_client_info(request)
    user = db.execute(
        select(User).where(User.email == datos.email)
    ).scalar_one_or_none()

    if user is None:
        # Defensa contra timing attack: aunque el usuario no exista,
        # verificamos igual contra un hash ficticio para que la
        # respuesta tarde lo mismo que un login con password incorrecta.
        verify_password(datos.password, _DUMMY_HASH)
        auth_service.log_event(
            db, "login_failed", email_attempted=datos.email,
            ip=ip, user_agent=user_agent,
        )
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
        )

    if not verify_password(datos.password, user.hashed_password):
        auth_service.log_event(
            db, "login_failed", user_id=user.id, email_attempted=datos.email,
            ip=ip, user_agent=user_agent,
        )
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
        )

    if settings.email_verification_required and user.email_verified_at is None:
        auth_service.log_event(
            db, "login_failed", user_id=user.id,
            email_attempted=datos.email, ip=ip, user_agent=user_agent,
        )
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Verifica tu email para poder ingresar",
        )

    token = auth_service.create_session(db, user, ip=ip, user_agent=user_agent)
    set_session_cookie(response, token)
    auth_service.log_event(
        db, "login_success", user_id=user.id, email_attempted=user.email,
        ip=ip, user_agent=user_agent,
    )
    db.commit()
    return user


@router.post("/logout", response_model=MessageOut)
def logout(
    request: Request, response: Response, db: Session = Depends(get_db)
) -> MessageOut:
    token = request.cookies.get(settings.session_cookie_name)
    if token:
        session = auth_service.get_active_session(db, token)
        if session is not None:
            ip, user_agent = get_client_info(request)
            auth_service.revoke_session(db, session)
            auth_service.log_event(
                db, "logout", user_id=session.user_id, ip=ip, user_agent=user_agent,
            )
            db.commit()
    clear_session_cookie(response)
    return MessageOut(detail="Sesion cerrada")


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)) -> User:
    return user


@router.get("/verify", response_class=HTMLResponse)
def verify_form(token: str = Query(...)) -> HTMLResponse:
    """Muestra el formulario de confirmacion de email.

    A proposito NO consulta la base ni valida el token contra ella: los
    escaneres de correo abren el link de verificacion antes que el
    usuario, y si este GET consumiera o validara el token contra la
    base, el usuario real veria "invalido" al hacer clic. La respuesta
    tiene que ser identica exista o no el token, para que no haya
    oraculo ni de tiempo ni de contenido. Agregar cualquier chequeo
    contra la base aca rompe esa propiedad.
    """
    if not _TOKEN_PATTERN.match(token):
        cuerpo = "<h1>Enlace invalido</h1><p>Este link de verificacion no es valido.</p>"
        return HTMLResponse(
            _pagina_html("Enlace invalido", cuerpo),
            status_code=400,
            headers=_VERIFY_HEADERS,
        )

    # Defensa en profundidad: aunque el regex de arriba ya excluye
    # < > " y cualquier otro caracter fuera de [A-Za-z0-9_-], escapamos
    # igual antes de incrustarlo en el HTML.
    token_seguro = html.escape(token)
    cuerpo = f"""
        <h1>Confirma tu email</h1>
        <p>Apreta el boton para terminar de verificar tu cuenta.</p>
        <form method="post" action="/auth/verify">
          <input type="hidden" name="token" value="{token_seguro}">
          <button type="submit">Confirmar mi email</button>
        </form>
    """
    return HTMLResponse(
        _pagina_html("Confirma tu email", cuerpo),
        status_code=200,
        headers=_VERIFY_HEADERS,
    )


@router.post("/verify", response_class=HTMLResponse)
@limiter.limit("5/15minutes")
def verify_confirm(
    request: Request,
    token: str = Form(...),
    db: Session = Depends(get_db),
) -> HTMLResponse:
    ip, user_agent = get_client_info(request)
    user = auth_service.consume_auth_token(db, token, purpose="email_verification")

    if user is None:
        cuerpo = (
            "<h1>No pudimos verificar tu email</h1>"
            "<p>El link puede haber vencido o ya haberse usado. Pedi uno nuevo.</p>"
        )
        return HTMLResponse(_pagina_html("No pudimos verificar", cuerpo), status_code=400)

    user.email_verified_at = datetime.now(timezone.utc)
    auth_service.revoke_all_sessions(db, user.id)
    auth_service.log_event(
        db, "email_verified", user_id=user.id, email_attempted=user.email,
        ip=ip, user_agent=user_agent,
    )
    db.commit()

    cuerpo = (
        "<h1>Email verificado</h1>"
        "<p>Tu cuenta ya esta verificada. Inicia sesion de nuevo para continuar.</p>"
    )
    resp = HTMLResponse(_pagina_html("Email verificado", cuerpo), status_code=200)
    # clear_session_cookie tiene que aplicarse sobre ESTE objeto: si se
    # aplicara sobre un Response inyectado por FastAPI, se perderia,
    # porque al devolver un HTMLResponse propio FastAPI descarta el
    # placeholder inyectado en vez de usarlo.
    clear_session_cookie(resp)
    return resp
