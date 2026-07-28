# Guía didáctica del backend — Fases 1 y 2

Qué es cada cosa que instalamos y por qué. Escrito para leer sin la terminal abierta.

---

## El mapa mental

Todo lo que hicimos son cuatro capas, una arriba de la otra:

```
┌─────────────────────────────────────────────┐
│ 1. WINDOWS — tu computadora de siempre      │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │ 2. UBUNTU (WSL 2) — un Linux real     │  │
│  │    adentro de Windows                 │  │
│  │                                       │  │
│  │  ┌─────────────────────────────────┐  │  │
│  │  │ 3. DOCKER — cajas aisladas      │  │  │
│  │  │                                 │  │  │
│  │  │   [ PostgreSQL + TimescaleDB ]  │  │  │
│  │  └─────────────────────────────────┘  │  │
│  │                                       │  │
│  │  4. EL PROYECTO PYTHON                │  │
│  │     (le habla a la caja de arriba)    │  │
│  └───────────────────────────────────────┘  │
│                                             │
│   El navegador y VS Code viven acá afuera   │
└─────────────────────────────────────────────┘
```

Las cuatro capas existen por una sola razón: **que lo que corre en tu máquina se parezca lo más posible a lo que va a correr en el servidor.** Cada diferencia entre tu entorno y producción es un bug esperando su turno.

---

## Capa 1 y 2 — Windows y Ubuntu

### WSL

Windows Subsystem for Linux. Corre un Ubuntu real, con su propio sistema de archivos, sus propios programas y su propio usuario. No es un emulador ni una máquina virtual pesada: comparte el hardware y arranca en segundos.

**La confusión más común:** Windows y Ubuntu son dos sistemas separados. Tener Node instalado en Windows no significa tenerlo en Ubuntu. Cada uno instala lo suyo.

### Cómo saber dónde estás parado

| Prompt | Dónde estás | Qué comandos andan |
|---|---|---|
| `PS C:\Users\kakif>` | Windows / PowerShell | `wsl`, `Test-NetConnection`, `dir` |
| `eturakaki@KAKI-PC:~$` | Ubuntu / Linux | `ls`, `sudo`, `docker`, `uv`, `git` |

Regla corta: **empieza con `PS` → Windows. Termina en `$` → Linux.**

Para pasar de PowerShell a Ubuntu: escribir `wsl`. Para volver: `exit`.

### `~` y `/mnt/c`

- `~` es tu carpeta personal de Linux: `/home/eturakaki`. Disco Linux nativo, rápido.
- `/mnt/c` es tu disco C: de Windows visto desde Linux. Funciona, pero cada lectura cruza un puente de traducción entre dos sistemas de archivos.

**Por eso el proyecto vive en `~/proyectos/` y no en `/mnt/c/Users/...`.** La diferencia de velocidad en operaciones con muchos archivos (npm install, git status) es de varias veces.

### `.bashrc`

Un archivo que la terminal lee **cada vez que la abrís**. Sirve para dejar cosas configuradas de forma permanente. Ahí agregamos las tres líneas que cargan `nvm`; sin eso, `node` funcionaría hasta que cerraras la ventana.

`source ~/.bashrc` = "releé ese archivo ahora", sin cerrar y abrir la terminal.

### `sudo` y `apt`

- `apt` es el instalador de programas de Ubuntu, equivalente a la Microsoft Store pero de línea de comandos.
- `sudo` significa "hacé esto con permisos de administrador". Pide tu contraseña de Ubuntu.

**Nunca pegues un bloque de comandos que contenga `sudo` junto con otros.** Cuando `sudo` pide la contraseña se queda esperando, y la línea siguiente del bloque se la come el campo de contraseña.

### Una nota sobre la contraseña de WSL

Desde PowerShell podés entrar a Ubuntu como root **sin contraseña** (`wsl -u root`). Es decir: esa contraseña no protege nada frente a alguien que ya tiene tu sesión de Windows. Es una molestia útil contra errores propios, no una barrera de seguridad.

Es la misma distinción que en el frontend: `ProtectedRoute` te evita ver una pantalla rota, pero no impide nada. **La barrera real siempre está del lado del servidor.**

---

## Capa 3 — Docker

### El problema que resuelve

Tu backend necesita PostgreSQL 17 con la extensión TimescaleDB. Instalarlo directo en tu sistema trae tres dolores:

1. Queda enredado con el sistema operativo y desinstalarlo bien es difícil.
2. Si otro proyecto necesita otra versión de Postgres, se pelean.
3. Tu versión no va a ser idéntica a la del servidor, y vas a tener bugs que solo aparecen al desplegar.

### Los cuatro conceptos

**Imagen** — la receta congelada. `timescale/timescaledb:2.28.3-pg17` es una imagen: un sistema de archivos completo con Postgres ya instalado y configurado. La descargás, no la construís.

**Contenedor** — una instancia de esa imagen, corriendo. De una imagen podés levantar diez contenedores. **Los contenedores son descartables**: se crean y se destruyen en segundos, y con ellos se va todo lo que tengan adentro.

**Volumen** — un almacén de datos que vive **afuera** del contenedor y sobrevive a su destrucción. Acá van tus datos.

> Analogía: el contenedor es una computadora alquilada, el volumen es tu disco externo. Devolvés la computadora, alquilás otra, enchufás el mismo disco.

**Red** — Docker crea una red privada entre contenedores. Cuando en la Fase 3 sumemos la API como segundo contenedor, va a poder hablarle a la base por el nombre `db`, sin exponer nada hacia afuera.

### Cómo lo comprobamos

1. Creamos una tabla y le insertamos una fila con marca de tiempo `01:17:14.711841`.
2. Corrimos `docker compose up -d --force-recreate`, que **destruye el contenedor y crea uno nuevo**.
3. `docker compose ps` mostró un contenedor con 1 segundo de vida.
4. La consulta devolvió la misma fila, con el mismo microsegundo.

El contenedor que escribió esa fila ya no existe. La fila sí. Eso es el volumen.

**Sin la línea del volumen, esa fila se habría perdido.** Y en unas semanas, con usuarios reales, se habrían perdido usuarios reales.

### El `docker-compose.yml`, línea por línea

```yaml
services:
  db:
    image: timescale/timescaledb:2.28.3-pg17
    container_name: monitor_db
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    ports:
      - "5432:5432"
    volumes:
      - monitor_pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  monitor_pgdata:
```

| Línea | Qué hace |
|---|---|
| `services:` | La lista de contenedores. Hoy uno; en la Fase 3 se suma la API. |
| `image:` | Qué descargar. Postgres 17 con TimescaleDB ya adentro. |
| `container_name:` | Un nombre fijo, para poder referirse a él sin buscar su id. |
| `restart: unless-stopped` | Si reiniciás la PC vuelve solo. Si lo parás vos, se queda parado. |
| `environment:` | Postgres lee estas variables la primera vez que arranca y crea el usuario, la contraseña y la base. |
| `${POSTGRES_USER}` | La llave del asunto: **no hay valores escritos acá**, se toman del `.env`. Por eso este archivo puede ir a Git sin filtrar nada. |
| `ports: "5432:5432"` | Primer número: puerto de tu máquina. Segundo: puerto adentro del contenedor. Esto es lo que permite llegar a la base desde afuera. |
| `volumes:` | **La línea que evita que pierdas todo.** Postgres escribe en `/var/lib/postgresql/data`; ese contenido se guarda en el almacén `monitor_pgdata`. |
| `healthcheck:` | Docker le pregunta a Postgres cada 10 segundos si está listo. Importa porque Postgres tarda unos segundos en arrancar, y sin esto la API intentaría conectarse antes de tiempo. |

**No hay línea `version:`.** Los tutoriales viejos la ponen; Compose v2 en adelante la ignora y avisa que está obsoleta.

### Por qué fijamos la versión de la imagen

Arrancamos con `latest-pg17` y después lo cambiamos a `2.28.3-pg17`.

`latest-pg17` es un blanco móvil: hoy apunta a 2.28.3, en dos meses a otra cosa. El día que reconstruyas el entorno —en otra máquina, o en producción— bajarías una versión distinta a la que probaste. Con el tag fijo, **el archivo que está en Git describe exactamente lo que corriste**.

---

## Secretos: `.env`, `.env.example` y `.gitignore`

Tres archivos, un solo patrón:

| Archivo | Contiene | ¿Va a Git? |
|---|---|---|
| `.env` | Los valores reales, incluida la contraseña | **NO, nunca** |
| `.env.example` | Los mismos nombres de variable, vacíos | Sí |
| `.gitignore` | La regla que excluye `.env` | Sí |

**El secreto afuera, la forma adentro.** El `.env.example` le dice a cualquiera (incluido tu yo de dentro de seis meses) *qué* variables hacen falta, sin decir *cuáles* son los valores.

Es el mismo patrón que vas a usar con las claves de MercadoPago en la Fase 4. Practicarlo ahora con una contraseña que no importa es exactamente el punto.

### Cómo verificar antes de commitear

```bash
git check-ignore -v backend/.env    # debe responder con la regla que lo ignora
git add -n backend/                 # ensayo: lista qué se agregaría, sin agregar nada
```

Un secreto que entra al historial de Git no sale fácil: queda en todos los clones, en todos los forks, y rotarlo es la única solución real. Verificar antes cuesta cinco segundos.

### Contraseñas distintas para cosas distintas

| Para qué | De dónde sale |
|---|---|
| Usuario de Ubuntu (`sudo`) | La definiste al instalar |
| Base de datos local | `openssl rand -base64 24` |
| Base de datos de producción | Otra, generada igual, cuando llegue el momento |

Si una se filtra, se filtra una sola cosa.

---

## Capa 4 — El proyecto Python

### `uv`

El administrador de paquetes y entornos. Es a Python lo que npm es a Node, pero mucho más rápido.

| Archivo | Equivalente en el frontend | Qué es |
|---|---|---|
| `pyproject.toml` | `package.json` | Nombre del proyecto, versión de Python, dependencias declaradas |
| `uv.lock` | `package-lock.json` | Las versiones exactas de todo, incluidas las dependencias de tus dependencias. **Va a Git.** |
| `.venv/` | `node_modules/` | Las librerías instaladas. **No va a Git**, se recrea con `uv sync`. |

**`uv run <comando>`** ejecuta algo usando el Python del entorno virtual, sin tener que "activarlo". Es el equivalente de `npx`. Si corrieras `alembic` a secas, la terminal no lo encontraría: solo existe dentro de `.venv`.

Pediste 4 paquetes y se instalaron 14. Los otros 10 son dependencias de tus dependencias: `mako` lo usa Alembic para generar archivos, `greenlet` lo usa SQLAlchemy para su modo asíncrono.

### Las cuatro dependencias

- **SQLAlchemy** — te deja definir tablas como clases de Python en lugar de escribir SQL a mano.
- **Alembic** — el control de versiones del esquema de la base.
- **psycopg** — el driver: el traductor que permite a Python hablar el protocolo de Postgres. El `[binary]` trae las partes en C ya compiladas.
- **pydantic-settings** — lee el `.env` y valida que las variables existan con el tipo correcto.

### `app/core/config.py`

```python
class Settings(BaseSettings):
    postgres_user: str          # sin valor por defecto = obligatoria
    postgres_password: str
    postgres_db: str
    postgres_host: str = "localhost"
    postgres_port: int = 5432

    @property
    def database_url(self) -> str:
        return (f"postgresql+psycopg://{self.postgres_user}:"
                f"{quote_plus(self.postgres_password)}"
                f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}")
```

**Tres decisiones adentro:**

1. **Sin valores por defecto en las variables críticas.** Si falta `POSTGRES_PASSWORD`, la app no arranca y te dice cuál falta. Mucho mejor que arrancar bien y explotar tres horas después con un error de conexión indescifrable.

2. **`quote_plus` alrededor de la contraseña.** Esto evitó un bug real. Una URL de conexión se ve así: `postgresql://usuario:CONTRASEÑA@host:5432/base`. Tu contraseña la generó `openssl rand -base64`, que produce caracteres como `+`, `/` y `=`. Si contiene una `/`, el parser cree que ahí termina el host. Resultado: "no puedo conectarme", sin pista de por qué. `quote_plus` convierte `/` en `%2F`.

3. **`database_url` es una propiedad calculada, no una variable del `.env`.** Se arma sola con las piezas, así no repetís la contraseña en dos lugares.

---

## El modelo `User`

Lo que escribiste en `app/models/user.py` **no crea la tabla**: la describe. Es el plano, no el edificio.

Pensalo como una hoja de Excel:

| id | email | name | hashed_password | plan | role | created_at |
|---|---|---|---|---|---|---|
| usr_a3f9c21 | ana@mail.com | Ana Pérez | $argon2id$v=19... | pro | user | 2026-07-27 |

El archivo es la fila de encabezados: qué columnas hay y qué se puede escribir en cada una.

### Las decisiones y su razón

**`hashed_password`, no `password`.** El nombre es un recordatorio permanente: en esa columna nunca va una contraseña legible. Si algún día ves código que escribe ahí algo que un humano puede leer, es un bug de seguridad.

**El `id` es texto (`usr_a3f9c21`), no un número secuencial.** Dos razones: el contrato del frontend ya especifica ese formato, y un id secuencial filtra información (cualquiera que se registre puede ver que es el usuario 47 y deducir cuántos clientes tenés).

**`unique=True` en el email.** Podrías verificar en Python "¿existe este email?" antes de insertar, pero entre esa consulta y el insert hay milisegundos donde otro registro puede entrar. Con dos personas registrándose a la vez te quedan dos cuentas con el mismo email. El índice único de Postgres no tiene esa ventana: es imposible.

**Las `CheckConstraint`.** Le dicen a Postgres que `plan` solo puede ser `starter`, `pro` o `unlimited`. Si un bug en tu API intenta guardar `plan='gratis'`, **la base rechaza la operación**:

```
ERROR: new row for relation "users" violates check constraint "ck_users_plan"
```

Esa es la regla del roadmap —"el servidor nunca confía en el cliente"— llevada un nivel más adentro: la base tampoco confía del todo en el servidor. Cada capa valida lo suyo.

**`server_default` en vez de `default`.** `default` lo aplica Python; `server_default` queda escrito en la definición de la tabla. Diferencia práctica: si insertás una fila desde `psql` o desde una migración, sin pasar por tu código, el valor por defecto igual se aplica.

**Lo que NO está.** El contrato incluye `purchasedCourses` y `completedLessons`, que son listas. No van como columnas: van a ser tablas aparte con relaciones, en la Fase 3. Una columna que guarda una lista no se puede indexar bien — preguntar "¿quiénes compraron el curso X?" obligaría a leer todos los usuarios.

---

## Alembic — el Git de tu base de datos

### El problema

Tu base tiene una forma: qué tablas hay, qué columnas, qué tipos. Esa forma va a cambiar decenas de veces. Hoy `users` tiene email y contraseña; mañana necesita `stripe_customer_id`. Sin migraciones, cada cambio significa borrar la base y perder los datos.

### Cómo funciona

Alembic guarda cada cambio de estructura como un **archivo de Python numerado**, con dos funciones:

- `upgrade()` — cómo aplicar el cambio
- `downgrade()` — cómo revertirlo

Esos archivos van a Git. Cuando desplegás, corrés `alembic upgrade head` y la base de producción aplica exactamente los mismos cambios, en el mismo orden, sin perder datos.

La tabla `alembic_version` que apareció en tu base guarda en qué punto de la historia está. Es el equivalente del commit actual en Git.

### Qué hace `--autogenerate`

Se conecta a tu base, mira qué tablas hay, mira tus modelos, **calcula la diferencia**, y escribe el archivo de migración solo.

Por eso borramos la tabla `prueba_volumen` antes: la habíamos creado a mano, y Alembic la habría visto como algo que sobra y habría generado un `DROP TABLE`.

**Regla que se desprende:** de ahora en más, todo lo que exista en la base tiene que estar descrito en una migración. Nada de crear tablas a mano.

### Qué hicimos en `alembic/env.py`

Dos líneas importantes:

- `target_metadata = Base.metadata` → le dice a Alembic **dónde están tus planos**.
- `create_engine(settings.database_url)` → le dice **a qué base conectarse**, leyendo la contraseña del `.env` en lugar de tenerla escrita en `alembic.ini`, que va a Git.

---

## Comandos que vas a usar todos los días

```bash
# --- Base de datos ---
docker compose up -d              # levantar (desde backend/)
docker compose ps                 # ver estado; querés "Up (healthy)"
docker compose logs db --tail 30  # ver qué dice Postgres
docker compose down               # apagar (los datos siguen ahí)

# --- Consultar la base ---
docker compose exec db psql -U monitor -d monitor -c "\dt"      # listar tablas
docker compose exec db psql -U monitor -d monitor -c "\d users" # ver una tabla
docker compose exec db psql -U monitor -d monitor               # sesión interactiva (\q para salir)

# --- Migraciones ---
uv run alembic revision --autogenerate -m "descripcion"  # generar
uv run alembic upgrade head                              # aplicar
uv run alembic downgrade -1                              # revertir la última
uv run alembic current                                   # en qué versión está la base
uv run alembic history                                   # historial completo

# --- Dependencias ---
uv add nombre-del-paquete    # agregar
uv sync                      # recrear .venv desde uv.lock
uv run <comando>             # correr algo dentro del entorno
```

### Los comandos peligrosos

```bash
docker compose down -v   # el -v BORRA EL VOLUMEN. Se pierden todos los datos.
git push --force         # reescribe historia remota
rm -rf                   # borra sin preguntar ni papelera
```

`down -v` no es solo peligroso: también es **útil a propósito**. Cuando rompas una migración —va a pasar— `docker compose down -v && docker compose up -d && uv run alembic upgrade head` te da una base virgen en veinte segundos.

Lo importante es saber exactamente qué se borra y qué no.

---

## Los errores del camino y qué enseñaron

| Qué pasó | Qué enseñó |
|---|---|
| Corrimos comandos de Linux en PowerShell | Son dos sistemas. Mirar el prompt antes de pegar. |
| `wsl --set-default` adentro de Ubuntu | `wsl` es un programa de Windows; no existe del lado Linux. |
| El clone falló: la carpeta ya existía | Git se niega a pisar una carpeta con contenido. Buen reflejo. |
| La contraseña quedó escrita en un chat | Un secreto escrito en algún lado deja de ser secreto. Rotarlo es la única solución. |
| El roadmap pedía Node 20 | Node 20 llegó a fin de vida en abril de 2026. Los planes escritos envejecen: verificar antes de seguirlos. |
| `latest-pg17` sin fijar | Un tag móvil hace que "funciona en mi máquina" deje de ser reproducible. |

---

## Dónde estás parado

Tenés una base de datos de series temporales corriendo, con una tabla de usuarios creada mediante una migración versionada, credenciales fuera de Git y restricciones que la propia base hace cumplir.

Lo que **todavía no** tenés: una API. Nada de esto es alcanzable desde el navegador. Eso es la Fase 3, y es la que desbloquea todo lo demás — porque hoy tu login acepta cualquier contraseña y `admin@monitoreco.com` entra como administrador.
