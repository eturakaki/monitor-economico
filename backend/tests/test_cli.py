import pytest
from sqlalchemy import select

from app import cli
from app.core.config import settings
from app.core.security import verify_password
from app.models.auth_event import AuthEvent
from app.models.user import User


@pytest.fixture(autouse=True)
def _entorno_cli(monkeypatch, db):
    # crear_admin() abre su propia Session con SessionLocal(): la
    # reemplazamos por la sesion de test (savepoints, se revierte sola)
    # para no tocar la base real.
    monkeypatch.setattr(cli, "SessionLocal", lambda: db)
    # pytest no corre con una terminal real: forzamos el chequeo de TTY
    # para poder probar el resto del flujo.
    monkeypatch.setattr(cli.sys.stdin, "isatty", lambda: True)


def _simular_respuestas(monkeypatch, *, email, nombre="Admin de Prueba", terminos="SI"):
    respuestas = iter([email, nombre, terminos])
    monkeypatch.setattr("builtins.input", lambda _prompt: next(respuestas))


def _simular_passwords(monkeypatch, valores):
    entradas = iter(valores)
    monkeypatch.setattr(cli.getpass, "getpass", lambda _prompt: next(entradas))


def test_crea_admin_con_los_campos_correctos(monkeypatch, db):
    _simular_respuestas(monkeypatch, email="admin@example.com")
    _simular_passwords(monkeypatch, ["contrasena-larga-123", "contrasena-larga-123"])

    codigo = cli.crear_admin()

    assert codigo == 0
    user = db.execute(
        select(User).where(User.email == "admin@example.com")
    ).scalar_one()
    assert user.role == "admin"
    assert user.plan == "unlimited"
    assert user.name == "Admin de Prueba"
    assert user.email_verified_at is not None
    assert user.accepted_terms_at is not None
    assert user.terms_version == settings.terms_version


def test_deja_un_evento_admin_created_via_cli_no_register(monkeypatch, db):
    _simular_respuestas(monkeypatch, email="admin-evento@example.com")
    _simular_passwords(monkeypatch, ["contrasena-larga-123", "contrasena-larga-123"])

    cli.crear_admin()

    user = db.execute(
        select(User).where(User.email == "admin-evento@example.com")
    ).scalar_one()
    evento = db.execute(
        select(AuthEvent).where(AuthEvent.user_id == user.id)
    ).scalar_one()
    assert evento.event_type == "admin_created_via_cli", (
        "la creacion por CLI tiene que distinguirse de un registro web (event_type='register')"
    )


def test_la_password_queda_hasheada_no_en_texto_plano(monkeypatch, db):
    _simular_respuestas(monkeypatch, email="admin2@example.com")
    _simular_passwords(monkeypatch, ["contrasena-larga-123", "contrasena-larga-123"])

    cli.crear_admin()

    user = db.execute(
        select(User).where(User.email == "admin2@example.com")
    ).scalar_one()
    assert user.hashed_password != "contrasena-larga-123"
    assert verify_password("contrasena-larga-123", user.hashed_password)


def test_si_ya_hay_admin_se_niega_y_no_crea_nada(monkeypatch, db, crear_usuario):
    crear_usuario(email="ya-admin@example.com", role="admin", plan="unlimited")

    _simular_respuestas(monkeypatch, email="otro-admin@example.com")
    _simular_passwords(monkeypatch, ["contrasena-larga-123", "contrasena-larga-123"])

    codigo = cli.crear_admin()

    assert codigo != 0
    existente = db.execute(
        select(User).where(User.email == "otro-admin@example.com")
    ).scalar_one_or_none()
    assert existente is None


def test_password_de_menos_de_12_caracteres_es_rechazada(monkeypatch, db):
    _simular_respuestas(monkeypatch, email="admin3@example.com")
    _simular_passwords(
        monkeypatch,
        ["corta1234", "corta1234", "contrasena-larga-123", "contrasena-larga-123"],
    )

    codigo = cli.crear_admin()

    assert codigo == 0, "la password corta debia rechazarse y volver a pedir, no abortar"
    user = db.execute(
        select(User).where(User.email == "admin3@example.com")
    ).scalar_one()
    assert verify_password("contrasena-larga-123", user.hashed_password)
    assert not verify_password("corta1234", user.hashed_password)


def test_email_con_mayusculas_se_guarda_en_minusculas(monkeypatch, db):
    _simular_respuestas(monkeypatch, email="ADMIN4@Example.COM")
    _simular_passwords(monkeypatch, ["contrasena-larga-123", "contrasena-larga-123"])

    cli.crear_admin()

    user = db.execute(
        select(User).where(User.email == "admin4@example.com")
    ).scalar_one_or_none()
    assert user is not None, "el email debia quedar guardado en minusculas"
    assert user.email == "admin4@example.com"


def test_email_invalido_es_rechazado_y_vuelve_a_pedir(monkeypatch, db):
    respuestas = iter(["no-es-un-email", "admin6@example.com", "Admin de Prueba", "SI"])
    monkeypatch.setattr("builtins.input", lambda _prompt: next(respuestas))
    _simular_passwords(monkeypatch, ["contrasena-larga-123", "contrasena-larga-123"])

    codigo = cli.crear_admin()

    assert codigo == 0
    user = db.execute(
        select(User).where(User.email == "admin6@example.com")
    ).scalar_one_or_none()
    assert user is not None, "el email invalido debia rechazarse y volver a pedir, no abortar"


def test_si_no_confirma_terminos_no_crea_nada(monkeypatch, db):
    _simular_respuestas(monkeypatch, email="admin5@example.com", terminos="no")
    _simular_passwords(monkeypatch, ["contrasena-larga-123", "contrasena-larga-123"])

    codigo = cli.crear_admin()

    assert codigo != 0
    existente = db.execute(
        select(User).where(User.email == "admin5@example.com")
    ).scalar_one_or_none()
    assert existente is None


@pytest.mark.parametrize("valor", ["production", "staging", "prod"])
def test_verificar_email_se_niega_fuera_de_development(monkeypatch, db, crear_usuario, valor):
    # "prod" demuestra por que la comparacion va en positivo (== "development"):
    # con una negativa (!= "production") este valor se colaria como si fuera
    # development. "staging" es el caso peor: no es un typo, es un entorno
    # real que tambien se colaria con esa negativa.
    monkeypatch.setattr(settings, "environment", valor)
    usuario = crear_usuario(email="pendiente@example.com", verificado=False)

    codigo = cli.verificar_email(usuario.email)

    assert codigo != 0
    db.refresh(usuario)
    assert usuario.email_verified_at is None


def test_verificar_email_se_niega_sin_tty(monkeypatch, db, crear_usuario):
    monkeypatch.setattr(settings, "environment", "development")
    monkeypatch.setattr(cli.sys.stdin, "isatty", lambda: False)
    usuario = crear_usuario(email="sin-tty@example.com", verificado=False)

    codigo = cli.verificar_email(usuario.email)

    assert codigo != 0
    db.refresh(usuario)
    assert usuario.email_verified_at is None


def test_verificar_email_falla_si_el_email_no_existe(monkeypatch, db):
    monkeypatch.setattr(settings, "environment", "development")

    codigo = cli.verificar_email("no-existe@example.com")

    assert codigo != 0


def test_verificar_email_marca_email_verified_at_en_la_base(monkeypatch, db, crear_usuario):
    monkeypatch.setattr(settings, "environment", "development")
    usuario = crear_usuario(email="a-verificar@example.com", verificado=False)

    codigo = cli.verificar_email(usuario.email)

    assert codigo == 0
    db.refresh(usuario)
    assert usuario.email_verified_at is not None


def test_verificar_email_es_idempotente_en_la_segunda_corrida(monkeypatch, db, crear_usuario):
    monkeypatch.setattr(settings, "environment", "development")
    usuario = crear_usuario(email="dos-veces@example.com", verificado=False)

    primer_codigo = cli.verificar_email(usuario.email)
    db.refresh(usuario)
    primera_marca = usuario.email_verified_at

    segundo_codigo = cli.verificar_email(usuario.email)
    db.refresh(usuario)

    assert primer_codigo == 0
    assert segundo_codigo == 0
    assert usuario.email_verified_at == primera_marca
