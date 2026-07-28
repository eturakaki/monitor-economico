from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
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

_DUMMY_HASH = hash_password("hash-ficticio-para-timing-constante")


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
