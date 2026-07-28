from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings

engine = create_engine(settings.database_url, pool_pre_ping=True)

SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def get_db() -> Generator[Session, None, None]:
    """Abre una sesion de base de datos y la cierra al terminar la request.

    Dependencia de FastAPI: se inyecta con Depends(get_db) en los
    endpoints que necesitan acceso a la base.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
