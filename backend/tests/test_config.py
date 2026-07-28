import pytest
from pydantic import ValidationError

from app.core.config import Settings


def _campos_postgres() -> dict[str, str]:
    return {"postgres_user": "u", "postgres_password": "p", "postgres_db": "d"}


@pytest.mark.parametrize("valor", ["development", "staging", "production"])
def test_environment_con_los_tres_valores_validos_no_lanza_error(valor, monkeypatch):
    monkeypatch.setenv("ENVIRONMENT", valor)

    settings = Settings(_env_file=None, **_campos_postgres())

    assert settings.environment == valor


def test_environment_con_valor_fuera_de_la_lista_es_rechazado(monkeypatch):
    monkeypatch.setenv("ENVIRONMENT", "qa")

    with pytest.raises(ValidationError) as exc_info:
        Settings(_env_file=None, **_campos_postgres())

    # No alcanza con "hubo un ValidationError": si faltaran los campos de
    # Postgres, pydantic tambien levantaria uno, y este test pasaria igual
    # aunque se borrara el Literal por completo (un test que no afirma lo
    # correcto tambien pasa). Por eso se inspecciona el loc del error.
    errores_de_environment = [
        e for e in exc_info.value.errors() if e["loc"] == ("environment",)
    ]
    assert len(errores_de_environment) == 1
    assert errores_de_environment[0]["type"] == "literal_error"


def test_environment_ausente_es_rechazado(monkeypatch):
    # _env_file=None solo desactiva el archivo .env: pydantic-settings
    # sigue leyendo os.environ. El CI define ENVIRONMENT=development en
    # el job (.github/workflows/backend-ci.yml), asi que sin borrarla acá
    # este test pasaria en CI aunque environment volviera a ser opcional.
    monkeypatch.delenv("ENVIRONMENT", raising=False)

    with pytest.raises(ValidationError) as exc_info:
        Settings(_env_file=None, **_campos_postgres())

    errores_de_environment = [
        e for e in exc_info.value.errors() if e["loc"] == ("environment",)
    ]
    assert len(errores_de_environment) == 1
    assert errores_de_environment[0]["type"] == "missing"
