# Backend — Monitor Económico

Backend en Python para Monitor Económico. Base de datos PostgreSQL (con
extensión TimescaleDB) levantada vía Docker, migraciones gestionadas con
Alembic y configuración leída desde un archivo `.env`.

## Requisitos

- Docker (con Docker Compose)
- Python 3.12 o superior
- [uv](https://docs.astral.sh/uv/)

## Puesta en marcha

Desde la carpeta `backend/`:

1. Copiar el archivo de ejemplo de variables de entorno:

   ```bash
   cp env.example .env
   ```

2. Generar una contraseña para `POSTGRES_PASSWORD` y completarla en `.env`:

   ```bash
   openssl rand -base64 24
   ```

3. Levantar la base de datos:

   ```bash
   docker compose up -d
   ```

4. Instalar las dependencias del proyecto:

   ```bash
   uv sync
   ```

5. Aplicar las migraciones para crear el esquema:

   ```bash
   uv run alembic upgrade head
   ```

### Variables de entorno

`app/core/config.py` lee la configuración desde `backend/.env`. Las variables
requeridas son:

- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`
- `POSTGRES_HOST` (opcional, por defecto `localhost`)
- `POSTGRES_PORT` (opcional, por defecto `5432`)

Estas mismas variables (`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`)
son las que usa `docker-compose.yml` para inicializar el contenedor de la
base de datos, así que deben coincidir.

## Comandos habituales

**Levantar y apagar la base de datos:**

```bash
docker compose up -d      # levanta el contenedor db en segundo plano
docker compose down       # lo apaga (conserva el volumen de datos)
```

**Conectarse con psql:**

```bash
docker compose exec db psql -U monitor -d monitor
```

El usuario y la base (`monitor`) deben coincidir con `POSTGRES_USER` y
`POSTGRES_DB` definidos en `.env`.

**Generar y aplicar migraciones (Alembic):**

```bash
uv run alembic revision --autogenerate -m "descripcion del cambio"
uv run alembic upgrade head
```

## ⚠️ Advertencia: `docker compose down -v`

**Nunca** ejecutar `docker compose down -v` salvo que se quiera borrar la
base de datos por completo. El flag `-v` elimina el volumen `monitor_pgdata`
junto con el contenedor, y con él **se pierden todos los datos** de forma
irreversible. Para apagar la base sin perder datos, usar `docker compose
down` (sin `-v`).

## `.env` nunca se commitea

El archivo `.env` contiene credenciales (usuario y contraseña de Postgres) y
**no debe commitearse nunca**. Usar siempre `env.example` como plantilla y
mantener `.env` fuera del control de versiones.
