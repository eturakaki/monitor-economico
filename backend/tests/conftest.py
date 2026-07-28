from collections.abc import Generator
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote_plus

import pytest
from alembic import command
from alembic.config import Config
from fastapi import Depends
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session
from sqlalchemy.pool import NullPool

from app.api.deps import require_plan, require_verified_email
from app.core.config import settings
from app.core.limiter import limiter
from app.core.security import hash_password
from app.db.session import get_db
from app.main import app
from app.models.user import User

BASE_DIR = Path(__file__).resolve().parents[1]
TEST_DB_NAME = f"{settings.postgres_db}_test"


def _db_url(database: str) -> str:
    return (
        f"postgresql+psycopg://{settings.postgres_user}:"
        f"{quote_plus(settings.postgres_password)}"
        f"@{settings.postgres_host}:{settings.postgres_port}/{database}"
    )


# Endpoints que existen solo para probar las dependencias de autorizacion
# sin esperar a que existan los endpoints reales de cursos y de IA.
@app.get("/_test/solo-unlimited")
def _solo_unlimited(user: User = Depends(require_plan("unlimited"))) -> dict[str, bool]:
    return {"ok": True}


@app.get("/_test/solo-verificado")
def _solo_verificado(user: User = Depends(require_verified_email)) -> dict[str, bool]:
    return {"ok": True}


@pytest.fixture(scope="session", autouse=True)
def test_database() -> Generator[None, None, None]:
    """Crea una base de datos de test separada y le aplica las migraciones
    de Alembic (no Base.metadata.create_all): asi los tests tambien
    verifican que la cadena de migraciones aplica limpio desde cero, que
    es lo que va a pasar el dia del deploy.
    """
    admin_engine = create_engine(_db_url("postgres"), isolation_level="AUTOCOMMIT")
    with admin_engine.connect() as conn:
        conn.execute(text(f'DROP DATABASE IF EXISTS "{TEST_DB_NAME}" WITH (FORCE)'))
        conn.execute(text(f'CREATE DATABASE "{TEST_DB_NAME}"'))
    admin_engine.dispose()

    original_db = settings.postgres_db
    settings.postgres_db = TEST_DB_NAME
    try:
        alembic_cfg = Config(str(BASE_DIR / "alembic.ini"))
        command.upgrade(alembic_cfg, "head")
    finally:
        settings.postgres_db = original_db

    yield

    admin_engine = create_engine(_db_url("postgres"), isolation_level="AUTOCOMMIT")
    with admin_engine.connect() as conn:
        conn.execute(text(f'DROP DATABASE IF EXISTS "{TEST_DB_NAME}" WITH (FORCE)'))
    admin_engine.dispose()


@pytest.fixture(scope="session")
def _test_engine(test_database: None):
    engine = create_engine(_db_url(TEST_DB_NAME), poolclass=NullPool)
    yield engine
    engine.dispose()


@pytest.fixture()
def db(_test_engine) -> Generator[Session, None, None]:
    """Sesion de test aislada. Cada test corre dentro de un SAVEPOINT que
    se revierte al final: aunque los endpoints hagan su propio
    db.commit(), eso solo libera el savepoint, no la transaccion externa,
    asi que no hace falta borrar nada entre tests.
    """
    connection = _test_engine.connect()
    outer_transaction = connection.begin()
    session = Session(bind=connection, join_transaction_mode="create_savepoint")
    try:
        yield session
    finally:
        session.close()
        outer_transaction.rollback()
        connection.close()


@pytest.fixture()
def client(db: Session) -> Generator[TestClient, None, None]:
    def _override_get_db() -> Generator[Session, None, None]:
        yield db

    app.dependency_overrides[get_db] = _override_get_db
    test_client = TestClient(app, base_url="https://testserver")
    yield test_client
    app.dependency_overrides.pop(get_db, None)


@pytest.fixture(autouse=True)
def _sin_rate_limit() -> Generator[None, None, None]:
    limiter.enabled = False
    yield
    limiter.enabled = True


@pytest.fixture()
def crear_usuario(db: Session):
    """Devuelve una funcion para crear usuarios de prueba con la password
    hasheada de verdad (Argon2id via hash_password).
    """

    def _crear_usuario(
        email: str = "usuaria@example.com",
        password: str = "contrasena-de-prueba-123",
        plan: str = "starter",
        role: str = "user",
        verificado: bool = False,
        name: str = "Usuaria de Prueba",
    ) -> User:
        user = User(
            email=email.lower(),
            name=name,
            hashed_password=hash_password(password),
            plan=plan,
            role=role,
            email_verified_at=datetime.now(timezone.utc) if verificado else None,
            accepted_terms_at=datetime.now(timezone.utc),
            terms_version=settings.terms_version,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    return _crear_usuario
