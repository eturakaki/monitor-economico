from pathlib import Path
from typing import Literal
from urllib.parse import quote_plus

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    """Configuracion de la aplicacion, leida del archivo .env."""

    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    postgres_user: str
    postgres_password: str
    postgres_db: str
    postgres_host: str = "localhost"
    postgres_port: int = 5432

    # Sin valor por defecto, igual que postgres_user: con un default, un
    # deploy que se olvide de setear esta variable asume "development" en
    # silencio y termina escribiendo tokens de verificacion en los logs de
    # produccion — el guardarrail falla abierto por omision. Sin default,
    # la app directamente no arranca, que es ruidoso e inmediato.
    environment: Literal["development", "staging", "production"]
    frontend_origin: str = "http://localhost:5173"
    session_cookie_name: str = "monitor_session"
    session_lifetime_days: int = 30
    verification_token_hours: int = 24
    reset_token_minutes: int = 60
    # El token de verificacion vence a las 24 horas y todavia no existe
    # endpoint de reenvio. Mientras este flag este en False es inofensivo,
    # pero el dia que se prenda, un usuario cuyo token vencio queda sin
    # ninguna forma de verificarse. El reenvio tiene que existir antes de
    # prender el flag.
    email_verification_required: bool = False
    terms_version: str = "1.0"
    # Cuanto tiempo se sostiene el precio de una preferencia de pago antes
    # de vencer (FASE-4.md 6.4). Lleva default porque 24 horas ya es la
    # decision escrita en el documento, no un valor tecnico que dependa
    # del entorno: si faltara, el sistema no debe quedar mal en silencio.
    checkout_preference_ttl_hours: int = 24
    # URL publica del backend, usada para armar los links de verificacion/reset
    # que van por mail. Nunca se construye con el header Host de la request:
    # eso permite Host Header Injection (un atacante manda un Host falso y el
    # link de "confirma tu email" apunta a un dominio suyo).
    public_base_url: str = "http://localhost:8000"

    @property
    def database_url(self) -> str:
        return (
            f"postgresql+psycopg://{self.postgres_user}:"
            f"{quote_plus(self.postgres_password)}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )


settings = Settings()
