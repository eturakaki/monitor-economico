# Guía didáctica del backend — Fases 1, 2 y 3

Qué es cada cosa que instalamos y por qué. Escrito para leer sin la terminal abierta.

---

## El mapa mental

Todo lo que hicimos son cinco capas, una arriba de la otra:

```
┌─────────────────────────────────────────────────┐
│ 1. WINDOWS — tu computadora de siempre          │
│                                                 │
│  ┌───────────────────────────────────────────┐  │
│  │ 2. UBUNTU (WSL 2) — un Linux real         │  │
│  │    adentro de Windows                     │  │
│  │                                           │  │
│  │  ┌─────────────────────────────────────┐  │  │
│  │  │ 3. DOCKER — cajas aisladas          │  │  │
│  │  │                                     │  │  │
│  │  │   [ PostgreSQL + TimescaleDB ]      │  │  │
│  │  └─────────────────────────────────────┘  │  │
│  │                    ▲                      │  │
│  │  4. EL PROYECTO PYTHON                    │  │
│  │     modelos, migraciones, configuración   │  │
│  │                    ▲                      │  │
│  │  5. LA API (FastAPI + Uvicorn)            │  │
│  │     escucha en localhost:8000             │  │
│  └───────────────────────────────────────────┘  │
│                       ▲                         │
│   El navegador y VS Code viven acá afuera       │
└─────────────────────────────────────────────────┘
```

Las capas 1 a 4 existen por una sola razón: **que lo que corre en tu máquina se parezca lo más posible a lo que va a correr en el servidor.** Cada diferencia entre tu entorno y producción es un bug esperando su turno.

La capa 5 es la que se agregó en la Fase 3, y es la única que el mundo exterior puede tocar.

---

## Capa 1 y 2 — Windows y Ubuntu

### WSL

Windows Subsystem for Linux. Corre un Ubuntu real, con su propio sistema de archivos, sus propios programas y su propio usuario. No es un emulador ni una máquina virtual pesada: comparte el hardware y arranca en segundos.

**La confusión más común:** Windows y Ubuntu son dos sistemas separados. Tener Node instalado en Windows no significa tenerlo en Ubuntu. Cada uno instala lo suyo. Lo mismo pasó con git y con Claude Code.

### Cómo saber dónde estás parado

| Prompt | Dónde estás | Qué comandos andan |
|---|---|---|
| `PS C:\Users\kakif>` | Windows / PowerShell | `wsl`, `Test-NetConnection`, `Rename-Item`, `Select-String` |
| `eturakaki@KAKI-PC:~$` | Ubuntu / Linux | `ls`, `sudo`, `docker`, `uv`, `git`, `grep` |

Regla corta: **empieza con `PS` → Windows. Termina en `$` → Linux.**

Para pasar de PowerShell a Ubuntu: escribir `wsl`. Para volver: `exit`.

Truco útil: desde Linux podés invocar programas de Windows agregándoles `.exe`. Por ejemplo `explorer.exe .` abre la carpeta actual en el Explorador.

### `~` y `/mnt/c`

- `~` es tu carpeta personal de Linux: `/home/eturakaki`. Disco Linux nativo, rápido.
- `/mnt/c` es tu disco C: de Windows visto desde Linux. Funciona, pero cada lectura cruza un puente de traducción entre dos sistemas de archivos.

**Por eso el proyecto vive en `~/proyectos/` y no en `/mnt/c/Users/...`.** La diferencia de velocidad en operaciones con muchos archivos (npm install, git status) es de varias veces.

Ojo con las barras: las rutas de Windows usan `\`, que en Linux es un carácter de escape. Un `cd C:\Users\...` desde bash no falla con un error claro: se come las barras y termina buscando `C:Users...`. Y si el `cd` falla, los comandos siguientes corren donde estabas — que es una forma silenciosa de mirar la carpeta equivocada. Por eso conviene `git -C <ruta>` en vez de `cd`: si la ruta está mal, falla el comando.

### `.bashrc`

Un archivo que la terminal lee **cada vez que la abrís**. Sirve para dejar cosas configuradas de forma permanente: ahí cargamos `nvm` y ahí conviene poner atajos.

`source ~/.bashrc` = "releé ese archivo ahora", sin cerrar y abrir la terminal.

Un alias es un apodo para un comando:

```bash
echo "alias mon='cd ~/proyectos/monitor-economico'" >> ~/.bashrc
source ~/.bashrc
```

### `sudo` y `apt`

- `apt` es el instalador de programas de Ubuntu, equivalente a la Microsoft Store pero de línea de comandos.
- `sudo` significa "hacé esto con permisos de administrador". Pide tu contraseña de Ubuntu.

**Nunca pegues un bloque de comandos que contenga `sudo` junto con otros.** Cuando `sudo` pide la contraseña se queda esperando, y la línea siguiente del bloque se la come el campo de contraseña.

### Una nota sobre la contraseña de WSL

Desde PowerShell podés entrar a Ubuntu como root **sin contraseña** (`wsl -u root`). Es decir: esa contraseña no protege nada frente a alguien que ya tiene tu sesión de Windows. Es una molestia útil contra errores propios, no una barrera de seguridad.

Es la misma distinción que en el frontend: `ProtectedRoute` te evita ver una pantalla rota, pero no impide nada. **La barrera real siempre está del lado del servidor.** La Fase 3 es, entera, la construcción de esa barrera.

---

## Capa 3 — Docker

### El problema que resuelve

Tu backend necesita PostgreSQL 17 con la extensión TimescaleDB. Instalarlo directo en tu sistema trae tres dolores:

1. Queda enredado con el sistema operativo y desinstalarlo bien es difícil.
2. Si otro proyecto necesita otra versión de Postgres, se pelean.
3. Tu versión no va a ser idéntica a la del servidor, y vas a tener bugs que sólo aparecen al desplegar.

### Los cuatro conceptos

**Imagen** — la receta congelada. `timescale/timescaledb:2.28.3-pg17` es una imagen: un sistema de archivos completo con Postgres ya instalado y configurado. La descargás, no la construís.

**Contenedor** — una instancia de esa imagen, corriendo. De una imagen podés levantar diez contenedores. **Los contenedores son descartables**: se crean y se destruyen en segundos, y con ellos se va todo lo que tengan adentro.

**Volumen** — un almacén de datos que vive **afuera** del contenedor y sobrevive a su destrucción. Acá van tus datos.

> Analogía: el contenedor es una computadora alquilada, el volumen es tu disco externo. Devolvés la computadora, alquilás otra, enchufás el mismo disco.

**Red** — Docker crea una red privada entre contenedores. Cuando la API se sume como segundo contenedor, va a poder hablarle a la base por el nombre `db`, sin exponer nada hacia afuera.

### Cómo lo comprobamos (tres veces)

1. Creamos una tabla y le insertamos una fila con marca de tiempo `01:17:14.711841`.
2. Corrimos `docker compose up -d --force-recreate`, que **destruye el contenedor y crea uno nuevo**. `docker compose ps` mostró un contenedor con 1 segundo de vida.
3. La consulta devolvió la misma fila, con el mismo microsegundo.

Después el usuario de prueba sobrevivió a un `wsl --shutdown` completo, y más tarde a un reinicio de la máquina.

El contenedor que escribió esa fila ya no existe. La fila sí. Eso es el volumen.

**Sin la línea del volumen, esa fila se habría perdido.** Y en unas semanas, con usuarios reales, se habrían perdido usuarios reales.

### Docker Desktop y WSL

El comando `docker` dentro de Ubuntu **no es un programa instalado en Linux**: lo inyecta Docker Desktop mientras está abierto. Si Docker Desktop está cerrado, el comando desaparece con el mensaje "could not be found in this WSL 2 distro".

La solución es siempre la misma: abrir Docker Desktop, esperar a que diga *Engine running*, y **abrir una terminal nueva** — el `PATH` se arma cuando la shell arranca.

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
| `services:` | La lista de contenedores. |
| `image:` | Qué descargar. Postgres 17 con TimescaleDB ya adentro. |
| `container_name:` | Un nombre fijo, para poder referirse a él sin buscar su id. |
| `restart: unless-stopped` | Si reiniciás la PC vuelve solo. Si lo parás vos, se queda parado. |
| `environment:` | Postgres lee estas variables la primera vez que arranca y crea el usuario, la contraseña y la base. |
| `${POSTGRES_USER}` | La llave del asunto: **no hay valores escritos acá**, se toman del `.env`. Por eso este archivo puede ir a Git sin filtrar nada. |
| `ports: "5432:5432"` | Primer número: puerto de tu máquina. Segundo: puerto adentro del contenedor. |
| `volumes:` | **La línea que evita que pierdas todo.** |
| `healthcheck:` | Docker le pregunta a Postgres cada 10 segundos si está listo. Postgres tarda unos segundos en arrancar, y sin esto la API intentaría conectarse antes de tiempo. |

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

Es el mismo patrón que vas a usar con las claves de MercadoPago en la Fase 4.

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
| `uv.lock` | `package-lock.json` | Las versiones exactas de todo. **Va a Git.** |
| `.venv/` | `node_modules/` | Las librerías instaladas. **No va a Git**, se recrea con `uv sync`. |

**`uv run <comando>`** ejecuta algo usando el Python del entorno virtual, sin tener que "activarlo". Es el equivalente de `npx`. Si corrieras `alembic` a secas, la terminal no lo encontraría: sólo existe dentro de `.venv`.

### Los paquetes y para qué sirve cada uno

**De la Fase 2:**

- **SQLAlchemy** — te deja definir tablas como clases de Python en lugar de escribir SQL a mano.
- **Alembic** — el control de versiones del esquema de la base.
- **psycopg** — el driver: el traductor que permite a Python hablar el protocolo de Postgres.
- **pydantic-settings** — lee el `.env` y valida que las variables existan con el tipo correcto.

**De la Fase 3:**

- **FastAPI** — el framework de la API. Define endpoints, valida los datos que entran, genera la documentación sola.
- **Uvicorn** — el servidor que efectivamente escucha en el puerto 8000. FastAPI define *qué* responder; Uvicorn se ocupa de *escuchar*.
- **pwdlib** — hashea contraseñas con Argon2id.
- **slowapi** — limita cuántas veces se puede llamar a un endpoint.
- **pytest** — corre los tests.
- **httpx** — el cliente HTTP que usan los tests para hablarle a la API sin abrir un navegador.

### Un detalle de instalación que vale la pena saber

Instalamos FastAPI con el extra `standard-no-fastapi-cloud-cli`, no con `standard`.

El extra `standard`, además de Uvicorn, arrastra `fastapi-cloud-cli` —la herramienta de despliegue del producto comercial de FastAPI Cloud— y con ella `sentry-sdk`, un SDK de telemetría. No los necesitás, y son cuatro dependencias con acceso de red que suman superficie de ataque en la cadena de suministro. Se pierde cero funcionalidad al sacarlas.

### `app/core/config.py`

```python
class Settings(BaseSettings):
    postgres_user: str          # sin valor por defecto = obligatoria
    postgres_password: str
    postgres_db: str
    postgres_host: str = "localhost"
    postgres_port: int = 5432

    # agregadas en la Fase 3
    environment: str = "development"
    frontend_origin: str = "http://localhost:5173"
    session_cookie_name: str = "monitor_session"
    session_lifetime_days: int = 30
    verification_token_hours: int = 24
    reset_token_minutes: int = 60
    email_verification_required: bool = False
    terms_version: str = "1.0"

    @property
    def database_url(self) -> str:
        return (f"postgresql+psycopg://{self.postgres_user}:"
                f"{quote_plus(self.postgres_password)}"
                f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}")
```

**Tres decisiones adentro:**

1. **Sin valores por defecto en las variables críticas.** Si falta `POSTGRES_PASSWORD`, la app no arranca y te dice cuál falta. Mucho mejor que arrancar bien y explotar tres horas después con un error de conexión indescifrable.

2. **`quote_plus` alrededor de la contraseña.** Esto evitó un bug real. Una URL de conexión se ve así: `postgresql://usuario:CONTRASEÑA@host:5432/base`. Tu contraseña la generó `openssl rand -base64`, que produce caracteres como `+`, `/` y `=`. Si contiene una `/`, el parser cree que ahí termina el host.

3. **`database_url` es una propiedad calculada, no una variable del `.env`.** Se arma sola con las piezas.

**Las de la Fase 3 sí tienen valores por defecto**, y eso es deliberado: no son secretos, y si alguien se olvida de definirlas en producción el sistema **falla cerrado** (CORS bloquea al frontend real, la verificación de email queda apagada) en vez de fallar abierto.

---

## El modelo `User`

Lo que está en `app/models/user.py` **no crea la tabla**: la describe. Es el plano, no el edificio.

Pensalo como una hoja de Excel:

| id | email | name | hashed_password | plan | role | created_at |
|---|---|---|---|---|---|---|
| usr_a3f9c21 | ana@mail.com | Ana Pérez | $argon2id$v=19... | pro | user | 2026-07-27 |

El archivo es la fila de encabezados: qué columnas hay y qué se puede escribir en cada una.

### Las decisiones y su razón

**`hashed_password`, no `password`.** El nombre es un recordatorio permanente: en esa columna nunca va una contraseña legible. Si algún día ves código que escribe ahí algo que un humano puede leer, es un bug de seguridad.

**El `id` es texto (`usr_a3f9c21`), no un número secuencial.** Dos razones: el contrato del frontend ya especifica ese formato, y un id secuencial filtra información (cualquiera que se registre puede ver que es el usuario 47 y deducir cuántos clientes tenés).

**`unique=True` en el email.** Podrías verificar en Python "¿existe este email?" antes de insertar, pero entre esa consulta y el insert hay milisegundos donde otro registro puede entrar. Con dos personas registrándose a la vez te quedan dos cuentas con el mismo email. El índice único de Postgres no tiene esa ventana: es imposible.

**Las `CheckConstraint`.** Le dicen a Postgres que `plan` sólo puede ser `starter`, `pro` o `unlimited`. Si un bug en tu API intenta guardar `plan='gratis'`, **la base rechaza la operación**:

```
ERROR: new row for relation "users" violates check constraint "ck_users_plan"
```

Esa es la regla del roadmap —"el servidor nunca confía en el cliente"— llevada un nivel más adentro: la base tampoco confía del todo en el servidor. Cada capa valida lo suyo.

**`server_default` en vez de `default`.** `default` lo aplica Python; `server_default` queda escrito en la definición de la tabla. Si insertás una fila desde `psql` o desde una migración, sin pasar por tu código, el valor por defecto igual se aplica.

### Lo que le agregó la Fase 3

**`email_verified_at`** — una fecha, no un sí/no. Guardar *cuándo* verificó vale más que guardar *si* verificó: sirve para auditar y no cuesta nada. El sí/no se deriva con una property de Python (`email_verified`), que no es una columna y no requiere migración.

**`accepted_terms_at` y `terms_version`** — la Ley 25.326 exige poder acreditar el consentimiento del titular. Guardar el momento y la versión aceptada es la única forma de probarlo. Y **la versión la fija el servidor**: si el cliente mandara "acepté la versión 3", eso no prueba nada, porque cualquiera puede mandar cualquier número desde una consola.

**El CHECK `ck_users_email_lowercase`** — el índice único de Postgres distingue mayúsculas: `Juan@Mail.com` y `juan@mail.com` serían dos filas distintas. Eso habilita dos cuentas para la misma persona, y peor, permite registrar una variante del email de otro para confundir el flujo de recuperación. Se normaliza en la aplicación **y** se impone en la base.

---

## Alembic — el Git de tu base de datos

### El problema

Tu base tiene una forma: qué tablas hay, qué columnas, qué tipos. Esa forma va a cambiar decenas de veces. Sin migraciones, cada cambio significa borrar la base y perder los datos.

### Cómo funciona

Alembic guarda cada cambio de estructura como un **archivo de Python numerado**, con dos funciones:

- `upgrade()` — cómo aplicar el cambio
- `downgrade()` — cómo revertirlo

Esos archivos van a Git. Cuando desplegás, corrés `alembic upgrade head` y la base de producción aplica exactamente los mismos cambios, en el mismo orden, sin perder datos.

La tabla `alembic_version` guarda en qué punto de la historia está la base. Es el equivalente del commit actual en Git.

### Qué hace `--autogenerate`

Se conecta a tu base, mira qué tablas hay, mira tus modelos, **calcula la diferencia**, y escribe el archivo de migración solo.

### ⚠️ Lo que `--autogenerate` NO detecta

**No detecta CHECK constraints sobre tablas que ya existen.**

En la Fase 3 agregamos `ck_users_email_lowercase` al modelo `User`. El autogenerate detectó las tres tablas nuevas, los doce índices y las cuatro columnas nuevas de `users`, pero **del CHECK no dijo una palabra**. Hubo que agregarlo a mano:

```python
# en upgrade()
op.create_check_constraint(
    "ck_users_email_lowercase", "users", "email = lower(email)"
)

# en downgrade()
op.drop_constraint("ck_users_email_lowercase", "users", type_="check")
```

Los CHECK de las tablas **nuevas** sí salen, porque ahí Alembic renderiza la tabla entera.

**La regla que se desprende: siempre leer la migración autogenerada antes de aplicarla.** El `--autogenerate` es un buen borrador, no una respuesta final.

### Qué hicimos en `alembic/env.py`

- `target_metadata = Base.metadata` → le dice a Alembic **dónde están tus planos**.
- `create_engine(settings.database_url)` → le dice **a qué base conectarse**, leyendo la contraseña del `.env` en lugar de tenerla escrita en `alembic.ini`, que va a Git.

---

## Capa 5 — La API

Acá empieza la Fase 3.

### Qué es un endpoint

Una dirección específica de tu servidor que hace **una sola cosa**. Como las ventanillas de una oficina: no entrás a "la oficina" y pedís cualquier cosa, vas a la ventanilla 3, que es la de reclamos.

```
POST /auth/login
 ↑        ↑
 qué      dónde
```

**El "dónde"** es lo que va después del dominio. **El "qué"** es el verbo:

| Verbo | Significa | Ejemplo |
|---|---|---|
| `GET` | Dame información, no cambies nada | `GET /auth/me` — "¿quién soy?" |
| `POST` | Creá algo o hacé algo | `POST /auth/register` |
| `PATCH` | Modificá algo que ya existe | `PATCH /users/me` |
| `DELETE` | Borrá algo | `DELETE /cart` |

La misma dirección con verbos distintos son endpoints distintos.

**La diferencia entre `GET` y los demás no es sólo convención.** La cookie `SameSite=Lax` viaja automáticamente en un `GET` que venga de otro sitio, pero no en un `POST`. Si existiera `GET /auth/delete-account`, alguien podría ponerte ese link disfrazado en un mail, vos hacés clic, el navegador manda tu cookie, y te borraste la cuenta. Con `POST` eso no pasa.

**Regla: todo lo que cambia algo va por POST, PATCH o DELETE. Nunca por GET.**

### Swagger

Cuando levantás el servidor y abrís `localhost:8000/docs`, aparece una página con todos tus endpoints, sus formularios y sus respuestas.

**Nadie escribió esa página.** FastAPI lee tu código Python, ve qué endpoints definiste y qué datos esperan, y la genera sola. Cada endpoint que agregues aparece ahí sin que hagas nada. Sirve como documentación siempre al día, y como banco de pruebas: podés ejecutar cualquier endpoint desde ahí sin escribir código.

### `/health`

Un endpoint tonto a propósito, que sólo contesta `{"status": "ok"}`. Existe para responder una pregunta: *¿el servidor está vivo?* En producción, el servicio de hosting le va a pegar cada 30 segundos para saber si hay que reiniciarlo.

---

## Contraseñas: por qué se hashean

Cuando alguien se registra con la contraseña `messi2024`, vos **nunca** guardás eso. Guardás algo así:

```
$argon2id$v=19$m=65536,t=3,p=4$JaLcAmQD9kMVygjuxExy4Q$KHfvPBODJrk+ZV5SWC3zliHoVdrT8azVe50fWSfhXsI
```

Ese revoltijo se calcula a partir de la contraseña pero **no se puede volver atrás**. Cuando esa persona vuelve a entrar, agarrás lo que escribió, lo revolvés igual, y comparás los dos revoltijos.

**Por qué importa tanto:** el día que alguien te robe la base de datos, se lleva revoltijos, no contraseñas. Y esto no te protege sólo a vos: la gente repite la misma contraseña en el mail, en el home banking y en tu página. Una filtración tuya sin hashear es una filtración del banco de tus usuarios.

### Por qué Argon2id y no cualquier hash

Porque está diseñado para ser **lento y comer RAM a propósito**. Tarda unos 40 ms en tu máquina —imperceptible para alguien que se loguea— pero a un atacante que quiere probar mil millones de contraseñas le arruina el negocio. Es la diferencia entre que le lleve una tarde o doscientos años.

El "memory-hard" es la parte clave: obliga a gastar RAM, lo que anula la ventaja de las placas de video y los chips especializados, que es como se atacan los hashes viejos.

Los parámetros van escritos **adentro del propio hash**: `m=65536` (64 MB de RAM), `t=3` (tres pasadas), `p=4` (cuatro hilos). Eso tiene una consecuencia práctica linda: si mañana los cambiás, los hashes viejos siguen verificándose con sus parámetros originales. No es una decisión irreversible.

### Un detalle que envejeció mal

Todo tutorial de FastAPI + autenticación que encuentres usa **`passlib`**. Está sin mantenimiento desde 2020 y se rompe en Python moderno. La documentación oficial de FastAPI ya migró a **`pwdlib`**.

Es la misma lección de Node 20: los planes y los tutoriales escritos envejecen. Verificar antes de seguirlos.

### El bug que casi pasa desapercibido

`pwdlib` tiene una función `verify(password, hash)`. Si los argumentos estuvieran al revés, el código se leería exactamente igual de bien. Y el efecto sería: intentaría parsear la contraseña como si fuera un hash, tiraría una excepción, el `except` la atraparía, y devolvería `False`.

O sea: **rechazaría también la contraseña correcta**, sin dejar ningún error en el log.

Por eso la instrucción a Claude Code incluía "inspeccioná la API real antes de escribir, no la escribas de memoria", y por eso después lo probamos con tres líneas de Python en vez de leerlo y asentir.

---

## Sesiones: cómo el servidor se acuerda de quién sos

### El problema

HTTP no tiene memoria. Cada request que hace tu navegador llega en blanco: el servidor no sabe quién sos, aunque te hayas logueado hace tres segundos. Sin nada más, tendrías que mandar email y contraseña en cada clic.

### La solución, en cuatro pasos

1. Mandás email y contraseña a `POST /auth/login`. El backend verifica y, si está bien, genera un número aleatorio largo —un **token**— y lo guarda en la tabla `sessions` junto a tu `user_id`.
2. Te devuelve ese token dentro de una **cookie**. El navegador la guarda solo y la reenvía en cada request siguiente, sin que el frontend haga nada.
3. En cada request, el backend lee la cookie, busca el token en la tabla, y sabe que sos vos.
4. `POST /auth/logout` marca esa fila como revocada. La cookie que quedó en el navegador ya no sirve para nada.

Esa fila **es** la sesión. Vas a tener una por dispositivo.

### Token opaco vs JWT: por qué elegimos el primero

Hay dos escuelas.

**JWT stateless** — el token se autofirma y contiene los datos adentro. El servidor no consulta la base para validarlo. Rapidísimo. Problema: **no se puede revocar antes de que venza**. Si a alguien le bajás el plan, o le robaron el token, sigue teniendo acceso hasta el vencimiento. Se arregla con refresh tokens y una lista de revocación — que es exactamente la tabla de sesiones de la otra opción, pero con más piezas.

**Token opaco en base** — la cookie lleva sólo un identificador aleatorio; todo lo demás vive en Postgres. Cuesta un `SELECT` por request, que a esta escala es irrelevante. A cambio: logout, cambio de contraseña y baja de plan revocan **al instante**, y "cerrar sesión en todos los dispositivos" es un `UPDATE`.

Elegimos el segundo. Y esa elección se pagó sola cuando apareció el problema del pre-hijacking (más abajo).

### El detalle importante: el token se guarda hasheado

La tabla `sessions` **no guarda el token**. Guarda su SHA-256.

Si mañana se filtra un backup, o una inyección SQL en cualquier endpoint deja leer una tabla, el atacante ve hashes y no puede hacerse pasar por nadie. Es el mismo argumento de hashear contraseñas, aplicado a la credencial de sesión — que en la práctica *es* una contraseña temporal.

**Y acá SHA-256 alcanza, no hace falta Argon2.** La razón: el token lo genera el servidor con 256 bits de entropía real (`secrets.token_urlsafe(32)`). No hay diccionario que probar, no hay "token débil" posible. El hash lento existe para frenar ataques de diccionario contra secretos que eligió un humano; contra un secreto aleatorio no compra nada y te cuesta 40 ms en *cada request*.

### Renovación deslizante, con freno

La sesión dura 30 días. Pero cada request la empuja 30 días más adelante, así que mientras uses la plataforma nunca te desloguea; si desaparecés un mes entero, vencés.

El freno: si pasó menos de una hora desde la última renovación, no se escribe nada. Sin eso, cada clic de cada usuario sería una escritura en la base.

### El ataque de pre-hijacking, y por qué la elección de arriba importó

Un atacante registra `sofia@gmail.com` antes de que Sofía lo haga, con una contraseña que elige él. Meses después Sofía va a registrarse, ve "email ya en uso", hace "recuperar contraseña", entra tranquila y empieza a usar la plataforma. **El atacante sigue adentro**, con su propia contraseña, viendo todo lo que ella hace.

Un estudio de Microsoft de 2022 encontró que 35 de 75 servicios populares eran vulnerables a alguna variante de esto. La causa raíz siempre es la misma: el servicio deja usar la cuenta antes de comprobar que el email es tuyo.

La mitigación es **revocar todas las sesiones existentes cuando se verifica el email o se cambia la contraseña**. Con el token opaco en base eso es un `UPDATE sessions SET revoked_at = now() WHERE user_id = ?`. Con JWT stateless sería imposible.

La función ya está escrita (`revoke_all_sessions`). Falta el endpoint que la dispare, que llega junto con el proveedor de mail.

---

## La cookie y sus tres banderas

```
monitor_session | 30QtkvQ...  | localhost | / | 2026-08-27 | ✓HttpOnly | ✓Secure | Lax
```

| Bandera | Qué hace | Qué pasa sin ella |
|---|---|---|
| **`HttpOnly`** | Ningún JavaScript de la página puede leer la cookie | Un script inyectado (XSS) roba la sesión y entra como vos. Es la diferencia concreta con guardar el token en `localStorage`, que es lo que hace el frontend hoy. |
| **`Secure`** | Sólo viaja por HTTPS | El token viaja en texto plano por la red; cualquiera en el mismo WiFi lo lee |
| **`SameSite=Lax`** | No se manda en pedidos POST que vengan de otro sitio | Otro sitio puede hacer que tu navegador ejecute acciones en tu nombre (CSRF) |

**Dos cosas que confunden:**

`Secure=True` **funciona igual en desarrollo sin HTTPS**, porque los navegadores tratan `http://localhost` como contexto seguro. No hace falta una rama dev/prod.

`SameSite=Lax` cubre el caso normal **siempre que ningún GET modifique estado**, porque `Lax` sí manda la cookie en navegación top-level por GET. Es una regla de disciplina, no una configuración.

**Un detalle que muerde en los tests:** `httpx`, el cliente que usan los tests, **no reenvía cookies `Secure` sobre `http` plano** — correctamente, según la especificación. Si el `TestClient` se crea sin `base_url="https://testserver"`, todos los tests de sesión fallan con un 401 que parece un bug del login y no lo es.

---

## CORS: por qué el asterisco no sirve

Tu frontend corre en `localhost:5173` y tu backend en `localhost:8000`. Para el navegador son **orígenes distintos**, y por defecto bloquea que uno le hable al otro.

CORS es el permiso explícito que da el servidor: "acepto pedidos de este origen".

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],  # el origen EXACTO
    allow_credentials=True,
)
```

**El comodín `["*"]` no es una mala práctica acá: es directamente incompatible.** La especificación del navegador prohíbe combinar `Access-Control-Allow-Origin: *` con envío de cookies. Si lo ponés, el navegador rechaza toda respuesta y el error que ves parece un problema de red.

Por eso `FRONTEND_ORIGIN` es una variable de configuración: en producción cambia al dominio real, y si alguien se olvida de definirla, **falla cerrado** (CORS bloquea) en vez de fallar abierto.

---

## Rate limiting: frenar al que martilla

`POST /auth/login` acepta 5 intentos cada 15 minutos por IP. El sexto recibe un `429 Too Many Requests`.

Sirve contra dos cosas: alguien probando contraseñas al azar, y alguien que quiere tirarte el servidor forzándote a calcular hashes de Argon2 (que cuestan 64 MB de RAM cada uno, a propósito).

**Se limita por IP y no por email, deliberadamente.** Si el límite fuera por email, cualquiera podría bloquearte la cuenta a vos simplemente fallando cinco veces con tu dirección.

**Dos limitaciones que hay que saber:**

El contador de `slowapi` **vive en la memoria del proceso**. Se borra al reiniciar el servidor, y no se comparte entre workers: el día que corras con cuatro procesos de uvicorn, el límite real pasa a ser 20 y no 5. La solución es Redis, en la Fase 8.

Y `request.client.host` devuelve la IP real **sólo si no hay nada adelante**. En producción, detrás de nginx o Cloudflare, va a devolver la IP del proxy para todos los usuarios: el límite contaría a todo el mundo junto. La solución es leer `X-Forwarded-For`, **pero sólo junto con una lista de proxies confiables** — porque ese header lo puede escribir cualquiera, y confiarlo sin la lista permite mandar una IP falsa distinta en cada intento y saltearse el límite por completo. Queda peor que ahora.

---

## Las dependencias de autorización

Esto es lo más importante de toda la fase, y es muy poco código.

```python
@router.get("/algo-pago")
def endpoint(user: User = Depends(require_plan("unlimited"))):
    ...
```

Esa línea `Depends(...)` es un portero que corre **antes** que el endpoint. Hace tres preguntas: ¿tenés cookie válida?, ¿la sesión sigue viva?, ¿tu plan alcanza?

| Dependencia | Qué exige | Qué devuelve si no |
|---|---|---|
| `get_current_user` | Sesión válida | 401 "No autenticado" |
| `get_optional_user` | Nada; devuelve `None` si no hay sesión | — |
| `require_verified_email` | Email verificado | 403 "Verifica tu email para continuar" |
| `require_plan("pro", "unlimited")` | Uno de esos planes. Los admin pasan siempre | 403 "Tu plan no incluye esta función" |
| `require_admin` | `role == "admin"` | 403 |

**Por qué esto cambia todo:** tu `ProtectedRoute` de React esconde botones. Cualquiera que escriba la dirección en el navegador, o mande un `curl`, se lo saltea entero. Estas dependencias corren en el servidor: no hay forma de esquivarlas desde el cliente.

### La política de acceso que elegimos

**"Portón por acción, no por login."**

| Momento | Qué pasa |
|---|---|
| Entra sin cuenta y usa las calculadoras | Nada. Adelante. |
| Toca "comprar curso" sin sesión | → pantalla de login, y vuelve a donde estaba |
| Toca "comprar curso" logueado sin verificar | → "verificá tu email para continuar" |
| Toca "generar informe IA" | Mismo portón. Este cuesta tokens de verdad. |

El razonamiento: las 44 calculadoras corren en el navegador del usuario y no te cuestan nada, así que son tu mejor carnada. Los informes de IA los pagás vos en tokens, así que un bot con 500 cuentas falsas te vacía el presupuesto en una tarde — y eso no lo frena un cartel, sólo un bloqueo real.

El flag `EMAIL_VERIFICATION_REQUIRED` mueve el portón afuera del login entero cuando quieras. Hoy está apagado porque sin dominio no hay proveedor de mail, y nadie podría verificarse.

### Un mensaje de error es una decisión de seguridad

`POST /auth/login` responde **exactamente lo mismo** —`401 "Email o contraseña incorrectos"`— tanto si el email no existe como si la contraseña está mal. Y `get_current_session` responde `401 "No autenticado"` sin distinguir entre "no hay cookie", "la cookie es inválida" y "la sesión venció".

Si distinguiera, cualquiera podría usar el login para averiguar qué direcciones tienen cuenta en tu plataforma. Se llama **enumeración de usuarios**.

### Y el tiempo de respuesta también

Verificar Argon2 tarda 40 ms. Buscar un email que no existe tarda 1 ms. Si el código respondiera de inmediato cuando el usuario no existe, **la diferencia de tiempo diría lo que el mensaje calla**.

Por eso el login, cuando no encuentra el usuario, verifica igual contra un hash ficticio y tira el resultado:

```python
_DUMMY_HASH = hash_password("hash-ficticio-para-timing-constante")
...
if user is None:
    verify_password(datos.password, _DUMMY_HASH)  # sólo para gastar los mismos 40 ms
```

---

## El contrato: por qué los schemas traducen a camelCase

Python escribe `accepted_terms` con guión bajo. JavaScript escribe `acceptedTerms` pegado. Son dos convenciones y hay que traducir en la frontera.

Los schemas de Pydantic lo hacen en **las dos direcciones**: las respuestas salen en camelCase, y los pedidos aceptan camelCase. Si sólo se tradujeran las salidas, el frontend mandaría `acceptedTerms`, el backend esperaría `accepted_terms`, y el registro devolvería un 422 incomprensible.

`GET /auth/me` ya devuelve exactamente la forma que los servicios mock del frontend consumen:

```json
{
  "id": "usr_cd9801ec4516",
  "email": "inaki@monitoreco.com",
  "name": "Iñaki Etura",
  "plan": "starter",
  "role": "user",
  "emailVerified": false,
  "purchasedCourses": [],
  "completedLessons": [],
  "lastActivity": {},
  "createdAt": "2026-07-28T20:35:31.141190Z"
}
```

Los tres campos vacíos son intencionales: los modelos de cursos y progreso llegan más adelante, pero **la forma del contrato ya está completa**, así que el día que pongas `VITE_USE_MOCKS=false` no rompe nada.

Hay un test que compara el **conjunto exacto** de claves, no una muestra. Si alguien agrega o saca un campo, la pantalla se pone roja.

---

## La arquitectura en tres capas

El código de autenticación está partido en tres, y no por prolijidad:

```
api/routes/auth.py    ← HTTP: recibe el pedido, saca la IP, pone la cookie,
                         devuelve el código de estado
        ↓
services/auth.py      ← lógica: crear sesión, buscarla, revocarla, quemar tokens.
                         NO importa fastapi
        ↓
models/               ← las tablas
```

**Por qué la capa del medio no conoce a FastAPI:**

*Se puede probar sin levantar el servidor.* Son funciones que reciben datos y devuelven datos. Un test las llama directo, sin navegador, sin puerto, sin cookies. Los tests que corren rápido son los que efectivamente corrés.

*Se reusa.* El script que crea el primer administrador va a necesitar crear un usuario. El webhook de MercadoPago va a necesitar mirar sesiones. Si la lógica vive adentro de un endpoint, para reusarla tenés que copiarla — y después tenés dos copias que se van separando.

---

## Los tests

### Qué son

Programas cortos que usan tu API solos y verifican que responda lo que tiene que responder. Corrés `uv run pytest -v` y en dos segundos te dice si los catorce pasaron.

**Por qué no alcanza con probarlo a mano:** lo vas a probar hoy, va a andar, y dentro de tres semanas vas a cambiar algo del login para arreglar otra cosa y vas a romper un caso sin enterarte. Nadie se acuerda de reprobar los catorce escenarios cada vez.

### Los cuatro obligatorios (el sello de la fase)

1. Login con contraseña correcta → 200 **y cookie seteada**
2. Contraseña incorrecta → 401
3. Endpoint protegido sin sesión → 401
4. Endpoint de plan `unlimited` con usuario `starter` → 403

Más diez adicionales: forma exacta del contrato, email duplicado, contraseña corta, términos no aceptados, normalización a minúsculas, mismo mensaje en los dos fallos de login, 401 después del logout, bypass de admin, verificación de email, y la fila en la bitácora.

### La base de datos de test

Los tests **no tocan tu base de desarrollo**. `conftest.py` crea una base aparte llamada `monitor_test`, le aplica las migraciones, corre los tests y la destruye.

Dos detalles que valen la pena:

**Usa Alembic, no `create_all`.** Podría crear las tablas directamente desde los modelos, más rápido. Pero al usar las migraciones, cada corrida de los tests verifica además que **la cadena de migraciones aplica limpio desde una base vacía** — que es exactamente lo que va a pasar el día del deploy. Un bonus gratis.

**Cada test corre dentro de un SAVEPOINT.** Los endpoints hacen su propio `db.commit()`. Si el test corriera dentro de una transacción común, ese commit la cerraría y la limpieza no funcionaría. La solución de SQLAlchemy 2.0 es crear la sesión con `join_transaction_mode="create_savepoint"`: el commit del endpoint libera un punto de guardado en vez de la transacción externa, así que el rollback final borra todo igual. Cada test arranca con la base vacía sin tener que borrar nada.

### "14 passed" no prueba nada por sí solo

Un test que no afirma nada también pasa. Antes de creerle a la pantalla verde, hicimos esto:

```bash
# romper verify_password para que acepte cualquier contraseña
sed -i 's/return _password_hash.verify(password, hashed)/return True/' app/core/security.py
uv run pytest -q
# → 3 failed, 11 passed
git checkout app/core/security.py
uv run pytest -q
# → 14 passed
```

Cayeron exactamente los tres tests que dependen de la verificación de contraseñas. Si los catorce hubieran seguido pasando con el login aceptando cualquier cosa, los tests serían decorativos y habría que reescribirlos.

**Se llama prueba de mutación, y es la única forma de saber si tu suite sirve.**

---

## Cómo trabajar con Claude Code

Claude Code está instalado **dentro de Ubuntu**, parado en `~/proyectos/monitor-economico`. Es una instalación distinta de la de Windows: son dos sistemas.

Ocupa la terminal mientras está abierto, así que conviene tener **dos pestañas de Ubuntu**: una con Claude Code y otra para tus comandos.

### El reparto

| Quién | De qué se ocupa |
|---|---|
| El chat | Diseño, decisiones, explicación, revisión, documentos, investigación |
| Claude Code (en WSL) | Escribir archivos dentro del repo, correr lint y tests, cambios repetitivos |
| Vos | Los comandos que enseñan, y **aprobar** lo que Claude Code propone |

**Lo mecánico se delega, lo conceptual no.** Pedirle "hacé la autenticación" devuelve código que no entendés. Pedirle "creá este archivo con este contenido que ya decidimos" ahorra veinte minutos de copiar y pegar.

### Cómo se le pide

Una buena instrucción tiene tres partes: **qué leer**, **qué escribir**, **qué no tocar**. Y cuando hay una librería de por medio, una cuarta: **verificá su API real antes de escribir**.

```
CONTEXTO
[dónde estamos, qué existe ya]

QUE LEER PRIMERO
[lista concreta de archivos]

VERIFICAR ANTES DE ESCRIBIR
Tenemos pwdlib 0.3.0 instalado. NO asumas su API de memoria:
inspeccionala primero y usá la firma real, incluido el orden de los
argumentos. Si no coincide con lo que esperabas, avisame.

QUE ESCRIBIR
[especificación detallada, con las razones]

QUE NO TOCAR
[lista explícita]

AL TERMINAR
Decime qué archivos creaste. No me resumas el contenido: el diff lo leo yo.
```

Esa cuarta parte no es adorno. Evitó un bug grave: si el orden de los argumentos de `verify` hubiera estado invertido, el código se vería perfecto y el login rechazaría todas las contraseñas, sin dejar rastro en el log.

### Y las razones sirven de verdad

En los encargos de la Fase 3 se incluyó el *por qué* de cada decisión, no sólo el *qué*. Eso no es cortesía: cuando el agente entiende la intención, resuelve mejor los casos que la instrucción no cubría. En un encargo se le ocurrió por su cuenta verificar contra la base que el patrón de savepoints hiciera lo que prometía, antes de escribirlo.

### Qué modelo usar

Sonnet alcanza para encargos prescriptivos, donde el chat ya decidió y sólo hay que transcribir bien. En la Fase 3 acertó los seis. Conviene guardar Opus para trabajo abierto: una revisión de seguridad de un módulo entero, por ejemplo.

### Tres reglas

1. **Leé el diff antes de commitear.** Siempre.
2. **No apruebes permisos en piloto automático.**
3. **Nunca dejes que toque `.env`.**

### Cuidado: `git diff` no muestra todo

En la Fase 3 revisamos un `git diff` de la carpeta de modelos y no apareció una sola línea de los tres archivos nuevos. **`git diff` no muestra archivos sin trackear.** Estaban listados como `??` en `git status`, y por poco se revisan sin mirar.

Para revisar trabajo de un agente hace falta mirar las dos cosas:

```bash
git status --short          # ¿hay archivos nuevos (??) que el diff no va a mostrar?
git --no-pager diff         # qué cambió en los que ya existían
cat archivo-nuevo.py        # los nuevos, a mano
```

### La prueba que lo demostró (Fase 2)

En el primer encargo —escribir `backend/README.md`— produjo esto:

```bash
docker compose exec db psql -U $POSTGRES_USER -d $POSTGRES_DB
```

**Ese comando no funciona.** `$POSTGRES_USER` lo expande bash *antes* de que Docker vea nada, y esa variable no existe en la terminal: vive en el `.env`, que lo lee Docker Compose, no la shell. El comando llega como `psql -U -d`, vacío, y falla.

Se veía correcto. Estaba bien intencionado. Y no andaba.

La forma correcta es cargar el `.env` en la shell primero:

```bash
set -a && . ./.env && set +a
docker compose exec -T db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "\dt"
```

---

## Comandos que vas a usar todos los días

```bash
# --- Base de datos ---
cd ~/proyectos/monitor-economico/backend
docker compose up -d              # levantar
docker compose ps                 # ver estado; querés "Up (healthy)"
docker compose logs db --tail 30  # ver qué dice Postgres
docker compose down               # apagar (los datos siguen ahí)

# --- Consultar la base ---
set -a && . ./.env && set +a      # cargar las variables ANTES de usar psql
docker compose exec -T db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "\dt"
docker compose exec -T db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "\d users"
docker compose exec db psql -U monitor -d monitor    # sesión interactiva (\q para salir)

# --- Migraciones ---
uv run alembic revision --autogenerate -m "descripcion"  # generar (¡y después LEERLA!)
uv run alembic upgrade head                              # aplicar
uv run alembic downgrade -1                              # revertir la última
uv run alembic current                                   # en qué versión está la base

# --- La API ---
uv run uvicorn app.main:app --reload --port 8000   # levantar; Ctrl+C para frenar
# después abrir http://localhost:8000/docs

# --- Tests ---
uv run pytest -v                  # los 14, con nombres
uv run pytest -q                  # resumen corto
uv run pytest -k login            # sólo los que tengan "login" en el nombre

# --- Ver qué endpoints expone la app ---
uv run python -c "
from app.main import app
paths = app.openapi()['paths']
for p in sorted(paths):
    print(sorted(m.upper() for m in paths[p]), p)
"

# --- Dependencias ---
uv add nombre-del-paquete    # agregar
uv sync                      # recrear .venv desde uv.lock
uv run <comando>             # correr algo dentro del entorno

# --- Git y GitHub ---
git add -n backend/          # ensayo: qué se agregaría
git status --short           # incluye los archivos nuevos (??)
git --no-pager diff          # qué cambió, sin paginador
gh pr checks 11              # estado del CI de un PR
gh pr create --base main --title "..." --body-file /tmp/pr.md
```

### Los comandos peligrosos

```bash
docker compose down -v   # el -v BORRA EL VOLUMEN. Se pierden todos los datos.
git push --force         # reescribe historia remota
rm -rf                   # borra sin preguntar ni papelera
```

`down -v` no es sólo peligroso: también es **útil a propósito**. Cuando rompas una migración —va a pasar— `docker compose down -v && docker compose up -d && uv run alembic upgrade head` te da una base virgen en veinte segundos.

### Un consejo de terminal

```bash
git config --global core.pager cat
```

Sin eso, `git diff` y `git log` abren un paginador que te deja la terminal esperando en un `:` y corta la salida cuando la copiás. Con eso, imprimen todo de una.

---

## Los errores del camino y qué enseñaron

### Fases 1 y 2

| Qué pasó | Qué enseñó |
|---|---|
| Corrimos comandos de Linux en PowerShell (varias veces) | Son dos sistemas. Mirar el prompt antes de pegar. |
| `wsl --set-default` adentro de Ubuntu | `wsl` es un programa de Windows; no existe del lado Linux. |
| `cd C:\Users\...` desde bash | Las `\` de Windows son escapes en Linux. El `cd` falla en silencio y los comandos siguientes corren en el lugar equivocado. Usar `git -C <ruta>`. |
| El clone falló: la carpeta ya existía | Git se niega a pisar una carpeta con contenido. Buen reflejo. |
| "dubious ownership" en `/mnt/c` | Git desconfía de repos de otro usuario porque pueden ejecutar código (hooks). |
| La contraseña quedó escrita en un chat | Un secreto escrito en algún lado deja de ser secreto. Rotarlo es la única solución. |
| El roadmap pedía Node 20 | Node 20 llegó a fin de vida en abril de 2026. Los planes escritos envejecen. |
| `latest-pg17` sin fijar | Un tag móvil hace que "funciona en mi máquina" deje de ser reproducible. |
| `docker` desapareció de Ubuntu | Lo inyecta Docker Desktop. Sin Docker Desktop abierto, no existe. |
| El `psql` que escribió Claude Code | El resultado de un agente se verifica contra el archivo, no contra su reporte. |

### Fase 3

| Qué pasó | Qué enseñó |
|---|---|
| El roadmap decía `passlib` | Está muerto desde 2020 y se rompe en Python moderno, aunque siga en todos los tutoriales. Es la segunda vez que un plan propio envejece mal. |
| `lazy="selectin"` en las relaciones | Yo lo pedí mal. Habría cargado todas las sesiones y tokens del usuario en cada `GET /auth/me`, que corre en cada carga de página. Cambiado a `lazy="raise_on_sql"` + `passive_deletes=True`. |
| `git diff` no mostró los tres modelos nuevos | No muestra archivos sin trackear. Una revisión incompleta puede pasar por completa. |
| Alembic no generó el CHECK | `--autogenerate` no detecta CHECK constraints sobre tablas que ya existen. Siempre leer la migración antes de aplicarla. |
| Apareció un archivo `e exec db psql -U  -d ` en la raíz | El mismo bug de las variables vacías, otra vez: los espacios dobles del nombre eran `$POSTGRES_USER` y `$POSTGRES_DB` expandiéndose a nada. |
| Import circular entre `main.py` y `routes/auth.py` | El síntoma es un import en el medio del archivo con `# noqa: E402`. Se resuelve sacando la pieza compartida —el `limiter`— a su propio módulo. |
| Cuatro rondas persiguiendo rutas "faltantes" | En FastAPI 0.140, `include_router` ya no aplana las rutas dentro de `app.routes`: mete un objeto `_IncludedRouter`. Contar `app.routes` esperando la forma vieja diagnosticó un bug inexistente. **Verificar la versión antes de diagnosticar, no sólo antes de recomendar.** La pregunta correcta es `app.openapi()['paths']`. |
| El PR #11 se mergeó con el CI en `pending` | La protección de `main` exige PR pero no exige checks verdes. La barrera no estaba donde parecía. |

---

## Dónde estás parado

Tenés una base de datos de series temporales corriendo, con cuatro tablas creadas mediante migraciones versionadas, credenciales fuera de Git, restricciones que la propia base hace cumplir, y **una API que valida contraseñas de verdad**.

Alguien puede registrarse, iniciar sesión, cerrar sesión y preguntar quién es. La cookie no la puede leer JavaScript. La sesión se puede revocar al instante. El plan y el rol se validan en el servidor, no en React. Y hay catorce tests que verificaste rompiendo el código a propósito.

**Lo que todavía no tenés:**

- **Forma de verificar un email**, porque no hay dominio ni proveedor de mail. Mientras tanto, el pre-hijacking sigue abierto.
- **Forma de crear un administrador.** Falta el comando de CLI.
- **Los tests corriendo solos** en el CI.
- **Cobros.** Eso es la Fase 4, y con eso ya hay producto vendible.

El frontend sigue con sus datos simulados y su login que acepta cualquier cosa. Conectarlo es la Fase 7, y es un cambio de una variable de entorno — porque el contrato ya coincide, verificado por test.
