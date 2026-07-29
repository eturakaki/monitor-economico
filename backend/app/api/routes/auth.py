import html
import logging
import re
from datetime import datetime, timedelta, timezone

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    Form,
    HTTPException,
    Query,
    Request,
    Response,
    status,
)
from fastapi.responses import HTMLResponse
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.cookies import clear_session_cookie, set_session_cookie
from app.api.deps import get_client_info, get_current_user
from app.core.config import settings
from app.core.security import (
    MAX_PASSWORD_LENGTH,
    MIN_PASSWORD_LENGTH,
    hash_password,
    verify_password,
)
from app.core.limiter import limiter
from app.db.session import SessionLocal, get_db
from app.models.auth_token import AuthToken
from app.models.purchase import Purchase
from app.models.user import User
from app.schemas.auth import LoginIn, MessageOut, RecoveryIn, RegisterIn
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
  input[type="password"] {{ display: block; width: 100%; box-sizing: border-box;
            margin: 0.5rem 0; padding: 0.6rem; border-radius: 0.4rem; border: none; }}
</style>
</head>
<body>
  <div class="tarjeta">{cuerpo}</div>
</body>
</html>"""


def _email_duplicado() -> HTTPException:
    """Unico lugar del archivo que construye el 409 de email duplicado.

    Lo usan las dos ramas de register() que pueden detectarlo: el SELECT
    previo y el except del INSERT. Si el 409 cambia de forma, se toca
    aca y no en dos lugares.
    """
    return HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail="Ya existe una cuenta con ese email",
    )


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
        raise _email_duplicado()

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
    try:
        db.flush()
    except IntegrityError:
        # Ventana de carrera entre el SELECT de arriba y este INSERT: otra
        # request con el mismo email gano la carrera y ya lo inserto. El
        # UNIQUE de la base es la garantia real -nunca hubo ni puede haber
        # una fila duplicada-; esto solo evita que esta request reciba un
        # 500 crudo en vez de un 409 prolijo. db.rollback() es necesario
        # porque la sesion queda en estado abortado tras el IntegrityError.
        # Bajo los savepoints del conftest (join_transaction_mode='create_savepoint') este
        # rollback deshace solo el savepoint del intento fallido — verificado ejecutandolo.
        # En produccion, con sesion plana, deshace la transaccion del request completa. Hoy
        # eso es inocuo porque el INSERT fallido es la unica escritura del request.
        # INVARIANTE: si register() alguna vez escribe algo antes de este INSERT, este
        # rollback lo va a deshacer tambien — revisar este bloque.
        db.rollback()
        raise _email_duplicado()

    token = auth_service.create_session(db, user, ip=ip, user_agent=user_agent)
    set_session_cookie(response, token)

    verification_token = auth_service.create_auth_token(
        db, user, purpose="email_verification"
    )
    # "== development", no "!= production": environment ya es un Literal
    # validado y sin default (ver config.py), asi que no hace falta
    # blindarse contra un typo como "prod"/"Production". Pero staging
    # TAMPOCO debe logear estos links: puede tener direcciones de correo
    # reales. Habilitarlo ahi es una decision deliberada (cambiar esta
    # condicion a proposito), no un olvido de la lista de valores permitidos.
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
def me(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> User:
    purchased = db.execute(
        select(Purchase.course_id).where(Purchase.user_id == user.id)
    ).scalars().all()
    user.purchased_courses = list(purchased)
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


_RECOVERY_TOKENS_POR_HORA = 3


def _procesar_recuperacion_en_background(
    email: str, ip: str | None, user_agent: str | None
) -> None:
    """Busca el usuario, emite el token de reset y deja el log del link.

    Corre DESPUES de que el cliente ya recibio el 202: el tiempo de
    respuesta es identico exista o no la cuenta porque esta funcion
    nunca se ejecuta antes de responder, no porque se la haya
    cronometrado para que tarde lo mismo. Abre su propia Session en vez
    de reusar la del request: la de get_db es del ciclo de vida de la
    request, no del de esta tarea diferida.
    """
    db = SessionLocal()
    try:
        user = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
        if user is None:
            return

        # Rate limit por cuenta, no por IP: el de slowapi es por origen y
        # no frena a quien inunda la casilla de una persona rotando IPs.
        # Esto corre despues de responder, asi que no cambia el tiempo
        # de respuesta ni revela si la cuenta existe.
        una_hora_atras = datetime.now(timezone.utc) - timedelta(hours=1)
        pedidos_recientes = db.execute(
            select(func.count())
            .select_from(AuthToken)
            .where(
                AuthToken.user_id == user.id,
                AuthToken.purpose == "password_reset",
                AuthToken.created_at >= una_hora_atras,
            )
        ).scalar_one()
        if pedidos_recientes >= _RECOVERY_TOKENS_POR_HORA:
            logger.warning(
                "Rate limit por cuenta: %s ya pidio %d tokens de password_reset "
                "en la ultima hora, no se emite uno nuevo",
                email, pedidos_recientes,
            )
            return

        token = auth_service.create_auth_token(db, user, purpose="password_reset")

        # Solo development, ni siquiera staging (puede tener mails reales):
        # ver el comentario largo en register() sobre esta comparacion.
        if settings.environment == "development":
            # Este log contiene un token valido: nunca debe existir en produccion.
            reset_link = f"{settings.public_base_url}/auth/reset?token={token}"
            logger.warning(
                "SOLO DESARROLLO - link de reset para %s: %s", user.email, reset_link
            )

        auth_service.log_event(
            db, "password_reset_requested", user_id=user.id, email_attempted=email,
            ip=ip, user_agent=user_agent,
        )
        db.commit()
    except Exception:
        # Si algo explota aca, el usuario ya recibio "listo, revisa tu
        # correo" y no le va a llegar nada. Sin este log, nadie se entera.
        logger.exception("Fallo al procesar la recuperacion de password para %s", email)
    finally:
        db.close()


@router.post(
    "/recovery", response_model=MessageOut, status_code=status.HTTP_202_ACCEPTED
)
@limiter.limit("3/15minutes")
def recovery(
    datos: RecoveryIn,
    request: Request,
    background_tasks: BackgroundTasks,
) -> MessageOut:
    """Inicia la recuperacion de contraseña.

    A proposito NO toca la base en el cuerpo sincronico del endpoint:
    exista o no la cuenta, el codigo que corre antes de responder es el
    mismo, asi que el tiempo de respuesta es identico por construccion,
    no por compensacion (mismo agujero de timing que se tapo en el
    login con el hash ficticio).
    """
    ip, user_agent = get_client_info(request)
    background_tasks.add_task(
        _procesar_recuperacion_en_background, datos.email, ip, user_agent
    )
    return MessageOut(
        detail="Si existe una cuenta con ese email, vas a recibir instrucciones."
    )


@router.get("/reset", response_class=HTMLResponse)
def reset_form(token: str = Query(...)) -> HTMLResponse:
    """Muestra el formulario para elegir una contraseña nueva.

    Calcado de verify_form: no toca la base ni valida el token contra
    ella, para que la respuesta sea identica exista o no el token.
    """
    if not _TOKEN_PATTERN.match(token):
        cuerpo = "<h1>Enlace invalido</h1><p>Este link de recuperacion no es valido.</p>"
        return HTMLResponse(
            _pagina_html("Enlace invalido", cuerpo),
            status_code=400,
            headers=_VERIFY_HEADERS,
        )

    token_seguro = html.escape(token)
    cuerpo = f"""
        <h1>Elegi una contraseña nueva</h1>
        <form method="post" action="/auth/reset">
          <input type="hidden" name="token" value="{token_seguro}">
          <input type="password" name="password_nueva" placeholder="Contraseña nueva" required>
          <input type="password" name="password_repetida" placeholder="Repetir contraseña" required>
          <button type="submit">Cambiar contraseña</button>
        </form>
    """
    return HTMLResponse(
        _pagina_html("Elegi una contraseña nueva", cuerpo),
        status_code=200,
        headers=_VERIFY_HEADERS,
    )


@router.post("/reset", response_class=HTMLResponse)
@limiter.limit("5/15minutes")
def reset_confirm(
    request: Request,
    token: str = Form(...),
    password_nueva: str = Form(...),
    password_repetida: str = Form(...),
    db: Session = Depends(get_db),
) -> HTMLResponse:
    if password_nueva != password_repetida:
        cuerpo = "<h1>No pudimos cambiar tu contraseña</h1><p>Las contraseñas no coinciden.</p>"
        return HTMLResponse(
            _pagina_html("No pudimos cambiar tu contraseña", cuerpo), status_code=400
        )

    if not (MIN_PASSWORD_LENGTH <= len(password_nueva) <= MAX_PASSWORD_LENGTH):
        cuerpo = (
            "<h1>No pudimos cambiar tu contraseña</h1>"
            f"<p>Tiene que tener entre {MIN_PASSWORD_LENGTH} y {MAX_PASSWORD_LENGTH} "
            "caracteres.</p>"
        )
        return HTMLResponse(
            _pagina_html("No pudimos cambiar tu contraseña", cuerpo), status_code=400
        )

    ip, user_agent = get_client_info(request)
    user = auth_service.consume_auth_token(db, token, purpose="password_reset")

    if user is None:
        cuerpo = (
            "<h1>No pudimos cambiar tu contraseña</h1>"
            "<p>El link puede haber vencido o ya haberse usado. Pedi uno nuevo.</p>"
        )
        return HTMLResponse(
            _pagina_html("No pudimos cambiar tu contraseña", cuerpo), status_code=400
        )

    user.hashed_password = hash_password(password_nueva)
    if user.email_verified_at is None:
        # Para completar el reset hay que leer ese correo: es la misma
        # prueba que pide la verificacion, y cierra el pre-hijacking por
        # una segunda via.
        user.email_verified_at = datetime.now(timezone.utc)
    auth_service.revoke_all_sessions(db, user.id)
    auth_service.log_event(
        db, "password_changed", user_id=user.id, email_attempted=user.email,
        ip=ip, user_agent=user_agent,
    )
    db.commit()

    cuerpo = (
        "<h1>Contraseña actualizada</h1>"
        "<p>Ya podes iniciar sesion con tu contraseña nueva.</p>"
    )
    resp = HTMLResponse(_pagina_html("Contraseña actualizada", cuerpo), status_code=200)
    # Mismo motivo que en verify_confirm: clear_session_cookie tiene que
    # aplicarse sobre el objeto que efectivamente se devuelve.
    clear_session_cookie(resp)
    return resp


@router.post("/verify/resend", response_model=MessageOut)
@limiter.limit("5/15minutes")
def verify_resend(
    request: Request,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MessageOut:
    if user.email_verified_at is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tu email ya esta verificado",
        )

    ip, user_agent = get_client_info(request)
    token = auth_service.create_auth_token(db, user, purpose="email_verification")

    # Solo development, ni siquiera staging (puede tener mails reales):
    # ver el comentario largo en register() sobre esta comparacion.
    if settings.environment == "development":
        verify_link = f"{settings.public_base_url}/auth/verify?token={token}"
        logger.warning(
            "SOLO DESARROLLO - link de verificacion para %s: %s", user.email, verify_link
        )

    auth_service.log_event(
        db, "email_verification_resent", user_id=user.id, email_attempted=user.email,
        ip=ip, user_agent=user_agent,
    )
    db.commit()

    return MessageOut(detail="Te enviamos un nuevo link de verificacion")
