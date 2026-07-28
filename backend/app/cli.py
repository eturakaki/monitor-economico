"""CLI de administracion del backend.

Uso: uv run python -m app.cli crear-admin
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


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="python -m app.cli")
    subparsers = parser.add_subparsers(dest="comando", required=True)
    subparsers.add_parser("crear-admin", help="Crea el primer administrador")

    args = parser.parse_args(argv)

    if args.comando == "crear-admin":
        return crear_admin()

    parser.print_help()
    return 1


if __name__ == "__main__":
    sys.exit(main())
