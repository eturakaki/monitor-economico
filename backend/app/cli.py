"""CLI de administracion del backend.

Uso: uv run python -m app.cli crear-admin
     uv run python -m app.cli verificar-email <email>
"""

import argparse
import getpass
import sys
from datetime import datetime, timezone

from pydantic import EmailStr, TypeAdapter, ValidationError
from sqlalchemy import select

from app.core.config import settings
from app.core.security import MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH, hash_password
from app.db.session import SessionLocal
from app.models.user import User
from app.services import auth as auth_service

_email_adapter = TypeAdapter(EmailStr)


def _pedir_email() -> str:
    # Mismo tipo (EmailStr) y mismo orden que RegisterIn: EmailStr valida
    # el formato y normaliza el dominio, y recien despues se hace
    # strip().lower(). Si el CLI aceptara emails que el formulario web
    # rechaza, se podria crear un admin que despues no pueda loguearse.
    while True:
        crudo = input("Email: ")
        try:
            validado = _email_adapter.validate_python(crudo)
        except ValidationError:
            print("Ese email no es valido. Probá de nuevo.", file=sys.stderr)
            continue
        return validado.strip().lower()


def _pedir_nombre() -> str:
    while True:
        nombre = input("Nombre: ").strip()
        if nombre:
            return nombre
        print("El nombre no puede estar vacío. Probá de nuevo.", file=sys.stderr)


def _pedir_password() -> str:
    while True:
        password = getpass.getpass("Contraseña: ")
        if not (MIN_PASSWORD_LENGTH <= len(password) <= MAX_PASSWORD_LENGTH):
            print(
                f"La contraseña debe tener entre {MIN_PASSWORD_LENGTH} y "
                f"{MAX_PASSWORD_LENGTH} caracteres. Probá de nuevo.",
                file=sys.stderr,
            )
            continue
        confirmacion = getpass.getpass("Repetir contraseña: ")
        if password != confirmacion:
            print("Las contraseñas no coinciden. Probá de nuevo.", file=sys.stderr)
            continue
        return password


def crear_admin() -> int:
    """Crea el primer administrador. Devuelve el codigo de salida."""
    if not sys.stdin.isatty():
        print(
            "Este comando es interactivo y necesita una terminal real: sin "
            "eso, la contraseña puede terminar mostrada en pantalla o "
            "leida de un pipe.",
            file=sys.stderr,
        )
        return 1

    db = SessionLocal()
    try:
        ya_hay_admin = db.execute(
            select(User).where(User.role == "admin")
        ).scalar_one_or_none()
        if ya_hay_admin is not None:
            print(
                "Ya existe un administrador. Este comando es solo para "
                "crear el primero; los siguientes se crean desde la "
                "aplicacion.",
                file=sys.stderr,
            )
            return 1

        email = _pedir_email()
        existente = db.execute(
            select(User).where(User.email == email)
        ).scalar_one_or_none()
        if existente is not None:
            print(f"Ya existe una cuenta con el email {email}.", file=sys.stderr)
            return 1

        nombre = _pedir_nombre()
        password = _pedir_password()

        print(
            f"Vas a aceptar los terminos y condiciones version "
            f"{settings.terms_version} en nombre de esta cuenta."
        )
        confirmacion_terminos = input('Escribi "SI" en mayusculas para continuar: ')
        if confirmacion_terminos != "SI":
            print("Cancelado: no se creo ninguna cuenta.", file=sys.stderr)
            return 1

        ahora = datetime.now(timezone.utc)
        user = User(
            email=email,
            name=nombre,
            hashed_password=hash_password(password),
            plan="unlimited",
            role="admin",
            email_verified_at=ahora,
            accepted_terms_at=ahora,
            terms_version=settings.terms_version,
        )
        db.add(user)
        db.flush()

        auth_service.log_event(
            db, "admin_created_via_cli", user_id=user.id, email_attempted=email
        )
        db.commit()

        print(f"Administrador creado: {user.id} <{user.email}>")
        return 0
    finally:
        db.close()


def verificar_email(email: str) -> int:
    """Marca un usuario como verificado sin pasar por el mail real.

    Herramienta de desarrollo: sin proveedor de mail, el link de
    verificacion se escribe en el log del servidor, y pescarlo a mano en
    cada prueba manual del checkout pierde tiempo.

    No escribe en auth_events: el comando no puede correr fuera de
    development, asi que ese evento nunca existiria en produccion, y
    agregar un valor al CHECK de auth_events solo para esto es una
    migracion de mas.

    No revoca sesiones, a diferencia de POST /auth/verify. Esto es un
    atajo de desarrollo, no una simulacion fiel del flujo real: revocar
    solo obligaria a re-loguearse en dev sin ganar nada. No "corregir"
    esto para que se parezca mas al endpoint real.

    Devuelve el codigo de salida.
    """
    # "== development", no "!= production" (mismo criterio que el
    # guardarrail del log en routes/auth.py): con la negativa, un .env
    # que diga "prod" o "Production" dejaria el comando habilitado sin
    # que nadie se entere.
    es_development = settings.environment == "development"
    if not es_development:
        print(
            "Este comando solo corre con environment=development. "
            f"Environment actual: {settings.environment!r}.",
            file=sys.stderr,
        )
        return 1

    if not sys.stdin.isatty():
        print(
            "Este comando es interactivo y necesita una terminal real.",
            file=sys.stderr,
        )
        return 1

    db = SessionLocal()
    try:
        user = db.execute(
            select(User).where(User.email == email.strip().lower())
        ).scalar_one_or_none()
        if user is None:
            print(f"No existe una cuenta con el email {email}.", file=sys.stderr)
            return 1

        if user.email_verified_at is not None:
            print(f"{user.email} ya estaba verificado.")
            return 0

        user.email_verified_at = datetime.now(timezone.utc)
        db.commit()

        print(f"Email verificado: {user.id} <{user.email}>")
        return 0
    finally:
        db.close()


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="python -m app.cli")
    subparsers = parser.add_subparsers(dest="comando", required=True)
    subparsers.add_parser("crear-admin", help="Crea el primer administrador")
    verificar_email_parser = subparsers.add_parser(
        "verificar-email",
        help="Marca un email como verificado (solo development)",
    )
    verificar_email_parser.add_argument("email", help="Email de la cuenta a verificar")

    args = parser.parse_args(argv)

    if args.comando == "crear-admin":
        return crear_admin()

    if args.comando == "verificar-email":
        return verificar_email(args.email)

    parser.print_help()
    return 1


if __name__ == "__main__":
    sys.exit(main())
