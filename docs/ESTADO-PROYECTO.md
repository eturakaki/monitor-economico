# Monitor Económico — Estado y contexto

Documento de traspaso. Pegá esto (o su contenido) al arrancar un chat nuevo para no reconstruir contexto.

**Repo:** https://github.com/eturakaki/monitor-economico
**Local:** `~/proyectos/monitor-economico` **dentro de WSL 2 / Ubuntu 24.04**
**Equipo:** Iñaki (economía + programación) y Sofía (psicología, no programa)
**Última actualización:** 29 de julio de 2026, Fase 4 en curso (F4-1 a F4-4a cerrados)

**`ESTADO-PROYECTO.md`** (este archivo): lo que hay construido.
**`docs/ROADMAP.md`**: lo que viene.
**`docs/FASE-4.md`**: la fase en curso.
**`docs/MODELO-NEGOCIO.md`**: qué se vende, cómo se cobra y por qué.

**Toda la data en `src/data/**` (cursos, libros, indicadores) es utilería de
maqueta:** esos registros no existen y nadie los compró. Lo único real hoy son las
44 calculadoras, que hacen la matemática en el navegador sobre los números que
ingresa el usuario — no leen nada de `src/data`.

---

## Qué es

SPA de React 19 + Vite 7 + Tailwind 3, más un backend FastAPI + PostgreSQL en construcción. Plataforma financiera argentina con tres partes:

- **44 calculadoras** en 7 módulos (inflación, inversiones, crédito, inmobiliario, fiscal, estilo de vida, corporativo)
- **Academia**: cursos con reproductor de video, progreso, e-commerce (carrito, checkout, planes)
- **Dashboard** de indicadores y mercados

El frontend sigue funcionando con datos simulados en `localStorage`. Los servicios en `src/services/**` tienen doble rama (`IS_MOCK_MODE`) para conectarse a la API real cuando esté lista, sin tocar componentes.

**Monorepo:** el backend vive en `backend/`, dentro del mismo repositorio. Decisión tomada para que el contrato de la API y los servicios mock que lo definen queden uno al lado del otro y no se desincronicen.

---

## Frontend — trabajo completado

| # | Qué | Estado |
|---|---|---|
| 1 | Lint de 8 errores a 0. Bug de autorización en `/api-keys`. `ShopProvider` duplicado. Carpetas con espacios renombradas. Code-splitting: bundle 1.506 kB → 380 kB | mergeado |
| 2 | `CLAUDE.md` con arquitectura y convenciones. Docs movidos a `docs/` | mergeado |
| 3 | `npm audit fix`. Open redirect mitigado (`src/utils/safeRedirect.js`) | mergeado |
| 4 | Progreso de cursos: 4 bugs encadenados. `progressService` como fuente única, IDs compuestos, `useVideoProgress` conectado | mergeado |
| 5 | Flash de tema claro al recargar (script inline en `index.html`) | mergeado |
| 6 | `.claude/settings.json` con reglas de permisos | mergeado |
| 7 | Hardening del checkout: sin logs de tarjeta, aviso PCI-DSS, CI en GitHub Actions | mergeado |
| 8 | Piloto de tema claro (5 archivos): contraste WCAG, profundidad, sombras | mergeado |
| 9 | Expansión del tema claro a todo el proyecto (77 archivos) | mergeado — PR #9 |

**Infraestructura activa:** `main` protegida por un *ruleset* (no por las *classic branch protections*, que quedan vacías — ver el recuadro debajo). CI de frontend (lint + build + audit) y CI de backend (`pytest`, PR #13) corren en cada PR, ambos como checks obligatorios. `CLAUDE.md` que Claude Code lee solo, permisos en `.claude/settings.json`.

✅ **Verificado el 28/7:** la protección de `main` ya exige checks verdes. Se configuró en el *ruleset* "proteger main" (`id 19746900`), no en las *classic branch protections* —que están vacías y confunden—. Checks obligatorios: `tests` (backend) y `build` (frontend). `bypass_actors: []`, nadie puede saltearlo, tampoco el dueño. Verificado rompiendo un test a propósito: el PR #14 quedó en `mergeStateStatus: BLOCKED` y se cerró sin mergear.

---

## Backend — trabajo completado

Roadmap de referencia: *Operación Restaurante Financiero*, 8 fases.

### FASE 1 — La Cimentación ✅

Entorno de desarrollo montado dentro de WSL 2:

| Componente | Versión |
|---|---|
| Ubuntu (WSL 2) | 24.04 LTS, kernel 6.6.87.2 |
| Docker Desktop | 29.2.1, Compose v5.1.0, integración WSL activada |
| Node (vía nvm en Ubuntu) | 24.18.0 — **no 20**, que llegó a EOL el 30/04/2026 |
| Python | 3.12.3 (del sistema) |
| uv | 0.11.32 |
| git (en Ubuntu) | 2.43.0, identidad configurada, `core.autocrlf=input` |
| gh (GitHub CLI) | 2.45.0, autenticado como `eturakaki` |
| Claude Code (en Ubuntu) | 2.1.220, instalación nativa en `~/.local/bin/claude` |

**El repo vive en `~/proyectos/monitor-economico`** (disco Linux nativo). Alias `mon` en `.bashrc`.

Pendientes menores: rotar la contraseña del usuario de Ubuntu (`passwd`); la carpeta vieja en `C:\Users\kakif\Documents\monitor-economico` sigue bloqueada por algún proceso.

### FASE 2 — La Heladera ✅ (PR #10)

- **`docker-compose.yml`** con PostgreSQL 17.10 + TimescaleDB 2.28.3, imagen **fijada** a `timescale/timescaledb:2.28.3-pg17` (no `latest-*`), volumen `monitor_pgdata`, healthcheck con `pg_isready`, puerto 5432.
- **Credenciales fuera de Git**: `.env` con contraseña de `openssl rand -base64 24`, verificado con `git check-ignore` y `git add -n`. `env.example` versionado.
- **Proyecto Python con uv**: SQLAlchemy 2.0.51, Alembic 1.18.5, psycopg 3.3.4, pydantic-settings 2.14.2. `uv.lock` versionado.
- **`app/core/config.py`**: `Settings` de pydantic-settings, variables críticas sin valor por defecto, `database_url` como propiedad calculada con `quote_plus` sobre la contraseña.
- **`app/models/user.py`**: `User` con id de texto (`usr_...`), índice único en email, y dos `CheckConstraint` sobre `plan` y `role`.
- **Alembic** con `target_metadata = Base.metadata`. Primera migración `b02deb347e61`.
- **`backend/README.md`** con puesta en marcha y la advertencia sobre `docker compose down -v`.

**Verificaciones:** persistencia del volumen comprobada tres veces (recreación forzada, `wsl --shutdown`, reinicio de la máquina); CHECK comprobado con un INSERT inválido rechazado.

### FASE 3 — El Portero ✅ (PR #11, squash a `main`)

**28 archivos, 2.234 líneas. El login ya no acepta cualquier email sin contraseña.**

#### Dependencias añadidas

| Paquete | Versión |
|---|---|
| fastapi | 0.140.13 — extra `standard-no-fastapi-cloud-cli` |
| uvicorn | 0.51.0 |
| starlette | 1.3.1 |
| pwdlib[argon2] | 0.3.0 (argon2-cffi 25.1.0) |
| slowapi | 0.1.10 (limits 5.8.0) |
| pytest | 9.1.1 |
| pytest-asyncio | 1.4.0 |
| httpx | 0.28.1 |

⚠️ Se usó `standard-no-fastapi-cloud-cli` **a propósito**: el extra `standard` arrastra `fastapi-cloud-cli` y `sentry-sdk`, herramientas de despliegue comercial con acceso de red que no necesitamos.

#### Tablas nuevas (migración `b16b27fb51ba`)

- **`sessions`** — sesión activa. Guarda el **SHA-256 del token**, nunca el token en claro. `expires_at`, `revoked_at`, `last_seen_at`, `ip`, `user_agent`. FK a `users` con `ON DELETE CASCADE`.
- **`auth_tokens`** — tokens de un solo uso. `purpose IN ('email_verification','password_reset')`. También hasheado.
- **`auth_events`** — bitácora de autenticación. FK con **`ON DELETE SET NULL`** para sobrevivir al borrado de la cuenta.
- **`users`** — cuatro columnas nuevas: `email_verified_at`, `updated_at`, `accepted_terms_at`, `terms_version`. Más el CHECK `ck_users_email_lowercase`.

#### Estructura de archivos

```
backend/app/
  core/security.py      hash_password, verify_password, generate_token, hash_token
  core/limiter.py       instancia compartida de slowapi
  core/config.py        + environment, frontend_origin, session_cookie_name,
                          session_lifetime_days, verification_token_hours,
                          reset_token_minutes, email_verification_required, terms_version
  db/session.py         engine, SessionLocal, get_db
  models/               user, user_session (clase UserSession), auth_token, auth_event
  schemas/              base (CamelModel), user (UserOut), auth (RegisterIn, LoginIn, ...)
  services/auth.py      lógica pura de sesiones y tokens, sin FastAPI
  api/deps.py           get_current_user, get_optional_user, require_verified_email,
                          require_plan(*planes), require_admin
  api/cookies.py        set_session_cookie, clear_session_cookie
  api/routes/auth.py    register, login, logout, me
  main.py               app, CORS, limiter, /health
backend/tests/
  conftest.py           base monitor_test aislada, savepoints, limiter apagado
  test_auth.py          14 tests
```

#### Endpoints vivos

| Método | Ruta | Comportamiento |
|---|---|---|
| POST | `/auth/register` | 201, crea usuario en plan `starter` y lo loguea. 409 si el email ya existe. |
| POST | `/auth/login` | 200 + cookie. Rate limit 5 intentos / 15 min por IP. |
| POST | `/auth/logout` | 200. Nunca falla, haya sesión o no. |
| GET | `/auth/me` | 200 con el contrato exacto, o 401. |
| GET | `/auth/verify` | Muestra el formulario de confirmación. No toca la base. |
| POST | `/auth/verify` | Consume el token, marca `email_verified_at`, revoca todas las sesiones, borra la cookie. Rate limit 5/15min. |
| POST | `/auth/recovery` | 202 siempre, sin revelar si el email existe. Todo el trabajo corre en background. Rate limit por IP y por cuenta. |
| GET | `/auth/reset` | Muestra el formulario para elegir contraseña nueva. No toca la base. |
| POST | `/auth/reset` | Consume el token, cambia la contraseña, marca `email_verified_at` si estaba en null, revoca todas las sesiones. |
| POST | `/auth/verify/resend` | Reenvía el link de verificación. Exige sesión. |
| GET | `/health` | 200 |

#### Decisiones de diseño (no revisar sin motivo)

1. **Sesión con token opaco en base, no JWT.** Permite revocar al instante: logout, cambio de contraseña o baja de plan tienen efecto inmediato. Con un JWT stateless habría que esperar el vencimiento.
2. **El token se guarda hasheado (SHA-256), nunca en claro.** Un backup filtrado o una SQL injection no permiten suplantar a nadie. SHA-256 y no Argon2 porque el token ya tiene 256 bits de entropía aleatoria: no admite ataque de diccionario, y un hash lento sólo agregaría latencia en cada request.
3. **Argon2id vía `pwdlib`.** `passlib` está sin mantenimiento desde 2020 y se rompe en Python moderno, aunque siga apareciendo en todos los tutoriales. Parámetros resultantes: `m=65536, t=3, p=4` (default de argon2-cffi, más caro que el mínimo de OWASP). Medido en **40 ms con 24 núcleos**.
4. **Cookie `httpOnly` + `Secure` + `SameSite=Lax`**, 30 días con renovación deslizante y freno de una hora para no escribir en la base en cada request.
5. **CORS con el origen exacto del frontend.** El comodín es incompatible con `allow_credentials` por especificación del navegador, no por preferencia.
6. **Contraseñas: mínimo 12, máximo 128, sin reglas de composición.** Postura actual de OWASP y NIST: exigir mayúscula+número+símbolo produce `Password1!`.
7. **`terms_version` la fija el servidor**, no el cliente. La Ley 25.326 exige poder acreditar el consentimiento, y un valor que manda el navegador no prueba nada.
8. **Defensa contra timing attack en el login:** si el email no existe, se verifica igual contra un hash ficticio. Sin eso, la diferencia entre 1 ms y 40 ms revela quién tiene cuenta.
9. **Mismo mensaje de error** para email inexistente y contraseña incorrecta. Hay un test que compara los dos textos entre sí.
10. **Política de acceso: "portón por acción, no por login".** Las 44 calculadoras son libres y sirven de carnada. Comprar, acceder a cursos, generar informes de IA y todo lo pago exige sesión **y** email verificado. El flag `EMAIL_VERIFICATION_REQUIRED` (hoy `false`) mueve el portón afuera del login entero cuando exista proveedor de mail.
11. **`GET /auth/verify` no consulta la base a propósito.** Los escáneres de correo y los prefetchers abren los links antes que el usuario; si el GET consumiera o validara el token, el usuario real vería "inválido" al hacer clic. Como no hay lookup, la respuesta es idéntica exista o no el token: tampoco hay oráculo de tiempo ni de contenido.
12. **La pantalla de confirmación la sirve el backend como HTML mínimo, sin JavaScript.** Es un interino deliberado: el frontend sigue en modo mock hasta la Fase 7, así que una página React ahí quedaría huérfana. Se reemplaza sin cambiar el endpoint.
13. **Al verificar se revocan todas las sesiones, incluida la del navegador que confirmó.** OWASP desaconseja loguear automáticamente después de estos flujos: agrega complejidad al manejo de sesiones, que es donde aparecen los bugs.
14. **El guardarraíl del log usa comparación positiva (`== "development"`), no negativa.** Con `!= "production"`, un `.env` que diga `prod` o `Production` dejaría el guardarraíl inservible sin que nadie se entere. Con la positiva, cualquier valor inesperado cae del lado seguro.
15. **`/auth/recovery` no toca la base antes de responder.** Todo va a una tarea en segundo plano, así el tiempo de respuesta es idéntico exista o no la cuenta por construcción, no por compensación. Mismo agujero que se tapó en el login con el hash ficticio, resuelto de otra forma.
16. **Rate limit por cuenta además de por IP.** El de slowapi es por origen y no frena el ataque real: inundarle la casilla a una persona rotando IPs.
17. **Resetear la contraseña marca el email como verificado si no lo estaba.** Para completar el reset hay que leer ese correo, la misma prueba que pide la verificación. Cierra el pre-hijacking por una segunda vía.
18. **`require_plan` usa pertenencia exacta, no jerarquía.** Hay un test cuyo nombre defiende esa semántica: si alguien la cambia, ese test falla, y ese fallo es la señal correcta.

#### Verificación hecha

- **14 tests** contra una base `monitor_test` que se crea y se destruye sola, con las migraciones de Alembic aplicadas desde cero (no `create_all`): cada corrida valida además que la cadena de migraciones aplica limpio, que es lo que va a pasar el día del deploy.
- **Prueba de mutación:** rompiendo `verify_password` para que acepte cualquier contraseña, caen exactamente los 3 tests que dependen de ella. Los tests no son decorativos.
- Prueba manual completa vía Swagger: registro, cookie con las banderas correctas, `/auth/me`, logout, 401 posterior, login fallido y login correcto.

### FASE 4 — La Caja Registradora ⏳ (en curso)

Roadmap de referencia: `docs/FASE-4.md`, con el detalle completo (los tres portones
de seguridad, la secuencia de diez PRs —F4-4 se partió en F4-4a/F4-4b el 29/7—, la
MISIÓN CUMPLIDA ampliada a siete puntos). Acá sólo el resumen de lo cerrado. Sin
dependencias nuevas hasta F4-4a.

**F4-1 · TOCTOU en `POST /auth/register`** (PR #25) — el `INSERT` quedó envuelto en
`try`/`except IntegrityError`, con las dos ramas (la del `SELECT` previo y la del
`except`) saliendo por la misma función. Devuelve 409 en vez de 500 ante la carrera
de email duplicado.

**F4-2 · Patrón de `.claude/settings.json`** (PR #26) — se sacaron las plantillas
del espacio de nombres de los secretos (`.env.example` → `env.example`,
`backend/.env.example` → `backend/env.example`), se agregó `Edit(.env)` /
`Edit(.env.*)` al deny para cerrar el hueco de escritura sobre `.env` real, y se
consolidaron los cinco patrones del `.gitignore` en uno solo, `.env*`. `env.example`
ya está completo, con `PUBLIC_BASE_URL` y `TERMS_VERSION` documentadas.

**F4-3 · Modelos `Course` y `Purchase`** (PR #28)

#### Tablas nuevas (migración `c8ee0f8a840e`)

- **`courses`** — `id` como slug estable (ej. `course_valuacion_dcf`), `title`,
  `description`, `price` en `Numeric(12,2)` (nunca `float`), `currency` con `CHECK`
  a `'ARS'`, `active` boolean con default `false`. Sin `estudiantes` ni `rating`:
  son números de la maqueta del frontend, no una medición real.
- **`purchases`** — `id` (`pur_...`), `user_id` (FK a `users`, `ON DELETE CASCADE`
  porque es acceso vigente, no registro contable), `course_id` (FK a `courses`),
  `created_at`. `UNIQUE` sobre `(user_id, course_id)` impuesto por la base. Nace sin
  `order_id`: la tabla `orders` llega en F4-4a.

#### Estructura de archivos

- `backend/app/models/course.py`, `backend/app/models/purchase.py` — nuevos.
- `backend/tests/test_purchases.py` — nuevo.

#### Contrato de API

`GET /auth/me` ya no devuelve `purchasedCourses: []` fijo: consulta `purchases` por
`user_id` y devuelve la lista real de `course_id` comprados. El test que compara el
conjunto completo de claves del contrato sigue pasando sin haberlo tocado.

#### Verificación hecha

58 tests (40 en `test_auth.py`, 8 en `test_cli.py`, 3 en `test_config.py` — uno
parametrizado en 3 valores —, 5 en `test_purchases.py`). Prueba de mutación:
sacando el `UniqueConstraint` de `purchases`, cae únicamente el test de compra
duplicada. Ciclo `downgrade`/`upgrade` de la migración verificado contra la base
real.

**F4-4a · Modelos `Order`/`OrderItem` + `POST /checkout` contra un proveedor de pago
falso** — decisiones de diseño completas en `docs/FASE-4.md` §6.

#### Tablas nuevas (migración `f0180ac18a07`)

- **`orders`** — `id` (`ord_...`), `user_id` nullable (`ON DELETE SET NULL`, por el
  borrado de cuenta, no por checkout anónimo), `status` con `CHECK` a seis valores
  (`pending`/`paid`/`failed`/`refunded`/`expired`/`partially_refunded`), `total` en
  `Numeric(12,2)`, `currency` con `CHECK` a `'ARS'`, `cancellation_code` único en
  claro (no hasheado: hay que poder mostrárselo al usuario), `provider_preference_id`
  y `provider_payment_id` nullable y `UNIQUE` a la vez (Postgres permite múltiples
  `NULL`; ahí vive la idempotencia del webhook de F4-5). Índice único parcial
  `uq_orders_una_pending_por_usuario` (`WHERE status = 'pending'`): una sola orden
  `pending` por usuario, impuesta por la base, no por un `SELECT` previo.
- **`order_items`** — `id` (`oit_...`), `order_id` (FK a `orders`, `ON DELETE
  CASCADE`), `course_id` (FK a `courses`, sin `ondelete`), `title` y `unit_price`
  como *snapshot* del momento de la compra (si se leyeran de `courses` al mostrar
  una orden vieja, cambiar el precio de un curso reescribiría la historia de lo que
  la gente pagó). `UNIQUE (order_id, course_id)`. Sin `quantity`: un curso es acceso
  permanente, no una unidad.
- **`purchases`** — se agregó `order_id` nullable (FK a `orders`, sin `ondelete`).
  Llega vacía a propósito: el otorgamiento real la escribe el webhook de F4-5.
- `courses.price` pasó de `Mapped[float]` a `Mapped[Decimal]` (la columna
  `Numeric(12,2)` no cambió). Corrección de anotación: ver la entrada que salió de
  la deuda técnica, más abajo.

#### Estructura de archivos

- `backend/app/models/order.py` — nuevo (`Order`, `OrderItem`).
- `backend/app/services/checkout.py` — nuevo. Lógica pura sin FastAPI: valida el
  carrito, chequea disponibilidad y compras previas, resuelve el reemplazo de la
  orden `pending` anterior, crea la orden nueva. Levanta excepciones propias que la
  ruta traduce a HTTP.
- `backend/app/services/payments.py` — nuevo. `PaymentProvider` (`Protocol`) y
  `FakePaymentProvider`, única implementación de este PR: sin red, con
  `fail_create`/`fail_expire` para testear las dos ramas de error, y `self.calls`
  para que los tests afirmen contra los argumentos exactos de cada llamada.
- `backend/app/api/routes/checkout.py` — nuevo. `POST /checkout`, 201, detrás de
  `require_verified_email` (primer consumidor en producción, antes sólo lo usaba
  `conftest.py`). Rate limit de 10/hora **por usuario**, no por IP (`key_func`
  nueva en `core/limiter.py`, `get_user_id_or_ip`).
- `backend/app/api/deps.py` — sólo se agregó `get_payment_provider`; ninguna
  dependencia existente se tocó.
- `backend/app/schemas/order.py` — nuevo. Los montos viajan como **string** en el
  JSON, no como número (verificado con Pydantic 2.13.4: lo hace por default).
- `backend/tests/test_checkout.py` — nuevo, 26 tests.

#### Contrato de API

`POST /checkout` — entrada `{"items": [{"courseId": "..."}]}` (`unitPrice` se
acepta y se ignora por completo: el precio siempre sale de `courses`). Salida 201:
`{"orderId", "status", "total", "currency", "initPoint"}`.

Todos los errores tienen la misma forma —`{"detail": {"code": "...", ...campos
extra}}`, con `code` en snake_case y las claves de los campos extra en
camelCase—, para que el frontend de la Fase 7 decida leyendo un campo estable,
sin parsear texto ni adivinar el tipo de `detail`:

| Status | `code` | Campos extra |
|---|---|---|
| 400 | `carrito_invalido` | — (vacío, repetido, o más de 20 ítems) |
| 404 | `curso_no_disponible` | `unavailableCourseIds` |
| 409 | `cursos_ya_comprados` | `conflictingCourseIds` (checkout completo rechazado, no se filtra el resto) |
| 409 | `checkout_en_carrera` | — (dos checkouts del mismo usuario en paralelo) |
| 502 | `proveedor_no_disponible` | — (la orden queda `expired`, nunca `pending` sin link de pago) |

#### Verificación hecha

91 tests en total (26 nuevos en `test_checkout.py`). Cuatro pruebas de mutación,
revertidas después de confirmarlas:

- Sacar el índice único parcial → cae únicamente
  `test_dos_ordenes_pending_del_mismo_usuario_rechazadas_por_constraint`.
- Que el precio salga del request en vez de `courses` → cae únicamente
  `test_precio_manipulado_usa_el_precio_real_de_courses`.
- Que el 409 filtre los ítems ya comprados y cobre el resto → caen los tres tests
  del 409 (uno comprado, dos de tres comprados, no crea nada).
- Sacar el `try`/`except IntegrityError` de `crear_checkout` → cae únicamente
  `test_carrera_dos_checkouts_del_mismo_usuario_devuelve_409_y_no_deja_orden_colgada`.

Ciclo `downgrade`/`upgrade` de la migración verificado contra la base real,
incluyendo el índice parcial con su `WHERE` y las dos migraciones previas.

---

## Lo que quedó afuera de la Fase 3

- **PR #13 — `pytest` en el CI.** Workflow `.github/workflows/backend-ci.yml`, separado del frontend y sin `paths:` a propósito, para que el check siempre reporte y nunca deje un PR colgado cuando se vuelva obligatorio. Servicio con la misma imagen fijada del `docker-compose.yml`. Credenciales de la base en claro en el YAML, decisión explicada en un comentario del propio archivo. 43 segundos por corrida, verde a la primera.
- **Candado de `main`.** Los checks obligatorios se configuraron en el *ruleset* "proteger main" (`id 19746900`), no en las *classic branch protections*, que están vacías y confunden. Checks requeridos: `tests` y `build`. `bypass_actors: []` — nadie puede saltearlo, tampoco el dueño. Verificado rompiendo un test a propósito: el PR #14 quedó en `mergeStateStatus: BLOCKED` y se cerró sin mergear.
- **PR #15 — verificación de email.** Cierra el pre-hijacking. 21 tests en total, los 14 originales intactos más 7 nuevos.
- **PR #17 — CLI del primer administrador.** `uv run python -m app.cli crear-admin`. Contraseña por consola con `getpass`, exige TTY real, se niega si ya existe un admin, pide escribir `SI` para acreditar el consentimiento de términos. Migración `023d70051b96` para agregar `admin_created_via_cli` al CHECK de `auth_events`, así la bitácora distingue una cuenta creada por consola de un registro web.
- **PR #18 — recuperación, reset y reenvío.** `POST /auth/recovery` responde 202 sin tocar la base; todo corre en una tarea en segundo plano. Rate limit por cuenta (3 tokens por hora) además del de IP. `GET`/`POST /auth/reset` calcados del flujo de verificación. `POST /auth/verify/resend` exige sesión. Migración `3807584609cf` para `email_verification_resent`.
- **PR #19 — caso positivo de `require_plan`.** La suite probaba que el portón cierra pero nunca que abre. Se confirmó leyendo el código que la semántica es pertenencia exacta, no jerarquía, y el nombre del test lo deja escrito.
- **PR #20 — `environment` obligatoria y restringida.** De `str` con default a `Literal["development", "staging", "production"]` sin default. Antes, un deploy que se olvidara de setearla asumía desarrollo y escribía links con tokens válidos en los logs de producción: el guardarraíl fallaba abierto por omisión. Consecuencia operativa: cualquier `.env` sin `ENVIRONMENT` deja de arrancar.

---

## Lo primero que hay que hacer

**La Fase 3 está cerrada.** Los cinco puntos que habían quedado afuera salieron, cada uno en su propio PR (regla de un propósito por PR): `pytest` en el CI (#13), verificación de email (#15), CLI del primer administrador (#17), recuperación/reset/reenvío (#18), caso positivo de `require_plan` (#19). Además salió `environment` obligatoria y restringida (#20), encontrada revisando la deuda técnica anotada — no era uno de los cinco puntos originales, pero cerraba el mismo tipo de agujero (fail-open por omisión).

**F4-4a está cerrado**: modelos `Order`/`OrderItem` y `POST /checkout` contra un
proveedor de pago falso (`FakePaymentProvider`), sin salir a la red. Lo que sigue es
**F4-4b**, la integración real de MercadoPago sobre esa misma interfaz
(`PaymentProvider`). F4-4 quedó partida en dos el 29/7 —F4-4a y F4-4b—: un PR = un
propósito, y el esquema de base y la integración con un tercero son dos. Detalle de
la partición y de las decisiones de diseño en `docs/FASE-4.md` §6, y las cinco
preguntas de verificación de MercadoPago (con tres ya respondidas) en su §7. El
bloqueante suave del dominio sigue vigente (ver más abajo): sin dominio no hay
proveedor de mail, y sin proveedor de mail los cuatro flujos de correo que ya están
implementados y probados no le llegan a nadie — incluido el link de verificación que
`POST /checkout` exige antes de dejar comprar.

---

## Cómo se trabaja: el reparto de roles

| Quién | De qué se ocupa |
|---|---|
| El chat | Diseño, decisiones, explicación, revisión, documentos, investigación |
| Claude Code (en WSL) | Escribir archivos dentro del repo, correr lint y tests, cambios repetitivos, git local del propio encargo (rama, commit, push, `gh pr create --draft`) |
| Iñaki | Los comandos que enseñan, editar `.claude/settings.json`, revisar el diff en el PR, marcarlo "Ready for review" y mergear |

**Lo mecánico se delega, lo conceptual no.** Las instrucciones a Claude Code llevan siempre el formato ENCARGO — ver "Método de trabajo" en `CLAUDE.md`. La regla de verificar la API real de una librería antes de escribir, que vive ahí, evitó un bug grave en la Fase 3: el orden de los argumentos de `pwdlib.verify`.

**Cuentas:** hay dos cuentas pagas de Claude. Conviene usar una para el chat y otra para Claude Code, así los límites no compiten.

**Qué modelo usar en Claude Code:** Sonnet alcanza para encargos prescriptivos —donde el chat ya decidió y sólo hay que transcribir bien. En la Fase 3 acertó los seis encargos, y en uno se le ocurrió por su cuenta verificar el patrón de savepoints contra la base antes de escribirlo. Conviene guardar Opus para trabajo abierto: una revisión de seguridad de un módulo entero, por ejemplo.

---

## Lecciones operativas acumuladas

1. **Verificar contra el archivo, nunca contra el reporte del agente.** (Fase 2: `psql -U $POSTGRES_USER` con la variable vacía porque vive en el `.env`, no en la shell.)
2. **Los planes escritos envejecen.** El roadmap pedía Node 20 LTS, que llegó a EOL en abril de 2026. Y pedía `passlib`, que está muerto desde 2020.
3. **`git diff` no muestra archivos sin trackear.** Un `git status --short` con `??` puede ocultar archivos enteros de la revisión. Pasó con los tres modelos nuevos de la Fase 3.
4. **Alembic `--autogenerate` no detecta CHECK constraints sobre tablas que ya existen.** Los de tablas nuevas sí salen. Hay que agregarlos a mano y **revisar siempre la migración antes de aplicarla**.
5. **"14 passed" no prueba nada por sí solo.** Un test que no afirma nada también pasa. La prueba de mutación —romper algo a propósito y ver si los tests se dan cuenta— es lo que valida la suite.
6. **Verificar la versión de la librería antes de diagnosticar, no sólo antes de recomendar.** En FastAPI 0.140, `include_router` ya no aplana las rutas dentro de `app.routes`: mete un objeto `_IncludedRouter` que las contiene. Contar `app.routes` esperando la forma vieja produjo cuatro rondas de diagnóstico sobre un bug que no existía. La forma correcta de preguntar qué endpoints expone la app es `app.openapi()['paths']`.
7. **Si paralelizás agentes, pedí siempre la verificación exhaustiva antes de commitear.** (Expansión del tema claro: 6 agentes, ~800k tokens, se saltearon 5 casos y un archivo entero.)
8. **FastAPI descarta el `Response` inyectado si el endpoint devuelve su propio objeto `Response`.** Cualquier `set_cookie` o `delete_cookie` sobre el inyectado se pierde en silencio, y ningún test lo detecta. Encontrado levantando un mini FastAPI para probarlo, antes de escribir el código.
9. **Para guardarraíles de seguridad, lista blanca y no lista negra.** "Permitido sólo X" falla cerrado ante lo imprevisto; "prohibido Y" falla abierto.
10. **Una página web puede estar cacheada y mentirte sobre la última versión.** La página de releases de `actions/checkout` mostraba `v6.0.3` cuando `gh api` devolvía `v7.0.1`. Para versiones, preguntarle a la API, no leer una página.
11. **`git checkout -b` arrastra los cambios sin commitear a la rama nueva.** Un archivo de otra tarea puede colarse a un PR sin que nadie lo note; por eso se stagean archivos por nombre y nunca con `git add .`.
12. **Por cada test que prueba que algo está prohibido, buscar el espejo que prueba que algo está permitido.** Una autorización rota que rechace a todo el mundo pasa todos los tests negativos.
13. **Un test que espera "algún error" pasa aunque el error sea otro.** `pytest.raises(ValidationError)` sobre una config con varios campos obligatorios se satisface con cualquier campo faltante: hay que afirmar sobre el `loc`, no sobre el tipo.
14. **Un "confirmame X antes de escribir" que viene con la respuesta ya redactada no es un gate, es un trámite.** Para que tenga dientes hay que decir qué hacer si la respuesta es la otra.
15. **Las tareas en segundo plano no pueden usar la sesión que inyecta `Depends(get_db)`: esa muere con el request.** Tienen que abrir la suya y cerrarla en un `finally`. En los tests eso apunta a la base equivocada si no se parchea.
16. **Un grep mal anclado produce un diagnóstico falso con cara de dato duro.** Buscando variables en `env.example` con un patrón anclado al inicio de línea, las que ya estaban documentadas como comentario (`# VAR=valor`) no aparecieron, y el resultado —"faltan diez"— era falso: faltaban dos. Antes de actuar sobre la salida de un comando, mirar el archivo.
17. **El chequeo en código es cortesía; la garantía vive en la constraint de la base.** Un `SELECT` antes de un `INSERT` sirve para devolver un error prolijo, pero siempre tiene una ventana de carrera; el `UNIQUE` de la base no la tiene. Por eso el TOCTOU de `POST /auth/register` es robustez y no seguridad: la base aguantó y nunca se creó una cuenta duplicada. Cuando una regla importa de verdad, tiene que estar impuesta por la base, y el chequeo en código es sólo la capa de buenos modales.
18. **Una afirmación verdadera se vuelve falsa al mudarla de documento.** El calificador que la sostenía —"de la Fase 4", "en desarrollo", "para este endpoint"— suele estar en la frase anterior y no viaja con la cita. Al trasplantar una conclusión entre documentos, verificar que el alcance del destino sea el mismo que el del origen.
19. **`gh pr create` usa la rama en la que estás parado, no la que nombraste en el push.** Si el `git push` falla y el `gh pr create` corre igual, se crea un PR contra la rama equivocada, con el título del trabajo que no contiene. Pasó con el PR #27: se llamaba "modelos Course y Purchase" y adentro tenía archivos de otro PR ya mergeado. Antes de crear un PR, `git branch --show-current`.
20. **Para relajar un guardarraíl amplio, sacar el archivo del espacio protegido, no agregarle una excepción.** En los permisos de Claude Code `deny` le gana a `allow` siempre, así que no se puede exceptuar un archivo de un patrón que lo matchea. `.env.example` se destrabó renombrándolo a `env.example`, sin tocar el candado. Un archivo público no tiene que vivir en el espacio de nombres de los secretos.
21. **Una llave de idempotencia tiene que apuntar al hecho externo, no al estado propio.** Llavear contra el estado local —"si mi registro no está en el estado que espero, ya lo procesé, devuelvo OK"— parece idempotencia y es una alcancía rota: descarta en silencio el evento legítimo que llega cuando el estado local se movió por otra razón. La llave correcta es el identificador del hecho que ya se procesó.
22. **Un working tree limpio no dice nada sobre de qué rama saliste.** `git status --short` responde por los cambios sin commitear; `git checkout -b` hereda además todos los commits de la rama donde estabas parado, y esos entran al PR sin que nadie los vea. Pasó el 29/7: la rama de un PR de documentación salió de una rama de fix sin mergear y arrastraba su commit. Se verifica con `git log --oneline main..HEAD`, que tiene que salir vacío en una rama recién creada desde main. Es la misma familia que las lecciones 11 y 19: las tres son "git usa la rama en la que estás parado, no la que tenías en la cabeza".
23. **El tipo de un identificador cambia al cruzar el límite entre dos sistemas.** MercadoPago devuelve el id de un pago como número entero en el JSON; nosotros lo guardamos como texto. Comparar los dos sin convertir da "distinto" para el mismo pago, y si esa comparación es la llave de idempotencia, el hecho se procesa dos veces. Al guardar un identificador ajeno, fijar la conversión en un solo lugar y escribir de qué tipo llega.

---

## Fases siguientes

4. **Pagos** (MercadoPago; acceso otorgado sólo por webhook confirmado, nunca porque el frontend diga "ya pagué"). Trae también el proveedor de mail, que desbloquea la verificación real.
5. **Ingesta de datos** (empezar con una sola serie; priorizar APIs oficiales del BCRA/INDEC sobre scraping)
6. **IA / análisis** (cachear el resultado, verificar los números contra la base, disclaimer visible)
7. **Conexión con el frontend** (`VITE_USE_MOCKS=false`)
8. **Deploy** (HTTPS, backups probados, headers de seguridad, Sentry)

**Nota de alcance:** con las fases 1 a 4 más un deploy ya hay producto vendible. Las 44 calculadoras funcionan sin backend.

### Bloqueante suave: el dominio

**Todavía no hay dominio comprado.** Sin dominio no hay proveedor de mail: Resend sólo permite enviar desde `onboarding@resend.dev` **y sólo a la dirección de registro de la cuenta**, como sandbox anti-abuso. Para escribirle a un usuario real hay que verificar un dominio propio con registros SPF y DKIM.

Eso bloquea: la verificación de email real, la recuperación de contraseña real, y los comprobantes de pago de la Fase 4. Lo que no bloquea es el arranque de la Fase 4: el dominio es un camino paralelo, se compra mientras se programa. Dentro de esa fase frena sólo dos cosas —el comprobante por mail y el reemplazo del 409 de `/auth/register`—; todo lo demás se construye y se prueba sin dominio. Razonamiento completo en `docs/FASE-4.md` §1.1. Un `.com` cuesta 12-15 USD al año; un `.com.ar` requiere CUIT.

### Recursos anotados para más adelante

- **Video de VPS con Claude Code** (midudev, patrocinado por Hostinger): la primera mitad —usuarios sin privilegios, claves SSH, desactivar login por contraseña, UFW, fail2ban— es prácticamente el checklist de la Fase 8. La segunda mitad, el agente autónomo 24/7, no es prioritario y conviene pensarla dos veces antes de darle acceso a un repo que toque credenciales de pago.
- **Video de MCP** (midudev): concepto vigente y ampliamente adoptado, pero no toca el camino crítico. Construir un MCP propio tiene sentido recién cuando haya producto — por ejemplo, para exponer las 44 calculadoras como herramientas.
- **Notebook vieja (8 GB RAM, 500 GB)**: excelente campo de entrenamiento para ensayar el deploy de la Fase 8 sin pagar un VPS, y candidata para el cron de ingesta de la Fase 5. Mal servidor de producción una vez que haya clientes pagando: depende de la luz, el internet hogareño y una IP que cambia.

---

## Marco legal argentino

No es asesoramiento legal; hace falta un abogado antes de producción. Pero estas dos normas ya tienen consecuencias en el código.

**Datos personales.** Rige la **Ley 25.326**, de 2000. Hay al menos tres proyectos de reforma en el Congreso (Carro, Doñate, y el 1751-D-2026 de Yeza) inspirados en el borrador de la AAIP y alineados con el GDPR, **ninguno sancionado**. Obligaciones vigentes: consentimiento informado del titular, derechos de acceso, rectificación y supresión, e inscripción de la base ante la AAIP. Por eso existen las columnas `accepted_terms_at` y `terms_version`.

**Botón de arrepentimiento.** La **Resolución 424/2020** de la Secretaría de Comercio Interior obliga a todo sitio que venda online en Argentina a tener un link visible **en la home** que permita revocar la compra dentro de **10 días corridos**, sin costo, **sin exigir registro previo ni ningún trámite**, y a devolver un código de identificación **dentro de las 24 horas**. Es materia de la Fase 4, pero el requisito de "sin registro previo" choca de frente con cualquier diseño donde el botón esté detrás del login.

---

## El contrato de la API

`GET /auth/me` ya devuelve exactamente esto, verificado por un test que compara el **conjunto completo** de claves:

```json
{
  "id": "usr_abc123",
  "email": "usuario@mail.com",
  "name": "Nombre Apellido",
  "plan": "starter | pro | unlimited",
  "role": "user | admin",
  "emailVerified": false,
  "purchasedCourses": [],
  "completedLessons": [],
  "lastActivity": {},
  "createdAt": "2026-01-15T10:30:00Z"
}
```

`purchasedCourses` ya devuelve las compras reales del usuario (F4-3, sobre la tabla
`purchases`); en el ejemplo de arriba aparece vacío porque es el estado de un usuario
sin compras, no un valor fijo. `completedLessons` y `lastActivity` siguen vacíos **a
propósito**: los modelos de progreso llegan en una fase posterior.

| Servicio mock | Método | Endpoint | Estado |
|---|---|---|---|
| `userStatus` | `login({email})` | `POST /auth/login` | ✅ |
| | `fetchUser()` | `GET /auth/me` | ✅ |
| | `logout()` | `POST /auth/logout` | ✅ |
| | `updateProfile(data)` | `PATCH /users/me` | pendiente |
| | `updatePlan(planId)` | `POST /subscriptions` | pendiente |
| | `grantAccess(ids)` | interno, tras pago confirmado | pendiente |
| `courseService` | `getAllCourses()` / `getCourseById(id)` / `searchCourses(q)` | `GET /courses`, `/courses/{id}`, `/courses?search=` | pendiente |
| `progressService` | `markLessonAsCompleted()` | `POST /progress/lessons/{id}/complete` | pendiente |
| | `getAllCompletedLessons()` | `GET /progress/me` | pendiente |
| | `saveWatchTime(id, s)` | `PUT /progress/lessons/{id}/watchtime` | pendiente |
| `cartService` | get / add / remove | `GET·POST·DELETE /cart` | pendiente |
| `orderService` | `getOrders()` / `createOrder()` | `GET /orders`, `POST /orders` | pendiente |
| | `hasPurchased(id)` | derivar de `GET /auth/me` | pendiente |
| `checkoutService` | `processPayment(data)` | `POST /checkout` | pendiente |
| | `validateCoupon(code)` | `GET /coupons/{code}` | pendiente |
| `wishlistService` | get / add / remove | `GET·POST·DELETE /wishlist` | pendiente |

Planes vigentes: `starter` (gratis) · `pro` (40.000) · `unlimited` (100.000).

**Si el backend respeta estas formas, poner `VITE_USE_MOCKS=false` conecta todo sin tocar componentes.**

---

## Sistema de color — decisiones a respetar

Definidas con mediciones de contraste WCAG. **El modo oscuro no se toca.**

- Paleta neutra única: **`slate`**. Ya no queda ningún `gray-*` en el proyecto.
- Texto secundario en claro: **`slate-600`** (7.58:1 sobre blanco, 6.15:1 sobre `slate-200`). `slate-500` fue descartado: 4.34:1 sobre `slate-200`, por debajo del mínimo de 4.5:1.
- Forma correcta de migrar: `text-slate-600 dark:text-slate-400`. Nunca cambiar el valor `dark:`.
- Fondo de página en claro: **`slate-200`**.
- Bordes de tarjeta: `border-slate-300 dark:border-slate-800`. No tocar bordes de inputs ni divisores de sección.
- Sombras: `shadow-md` base, `hover:shadow-lg`.

### ⚠️ La trampa de los fondos oscuros fijos

Hay contenedores con fondo oscuro **fijo** (`bg-[#0F172A]`, `bg-[#0B1121]`, `bg-[#1E293B]`, `bg-slate-900`, sin prefijo `dark:`) que se ven oscuros en **ambos** temas. Ahí `text-slate-400` sin `dark:` es **correcto** — cambiarlo a `slate-600` lo vuelve ilegible.

Archivos con esta característica: `StatCard.jsx`, `Terminos.jsx`, `ApiDocs.jsx`, `Home.jsx` (tarjeta "Analytics & Proyecciones IA"), footer de `Layout.jsx`, heroes de `SobreMi.jsx` / `Glosario.jsx` / `Contacto.jsx`, banner de `Libreria.jsx`, resumen sticky de `CheckoutPage.jsx`, `ResumenIA.jsx`, `LearningLayout.jsx`, `ProfileHeader.jsx`, `SortableWidget.jsx`, `InvestorTestPage.jsx`, y la sección de resultados de 6 calculadoras de inversiones (`BandasCambiarias`, `CalculadoraRetiro`, `CalendarioDividendos`, `FlujoFondosBonos`, `InflacionUsdSpy`, `ScannerBonos`).

**Regla general:** antes de cambiar un color de texto, leer el contenedor padre. Si el fondo es oscuro fijo, no tocar.

---

## Deuda técnica anotada, sin resolver

### Backend (Fase 3)

- **`get_client_info` lee `request.client.host`.** Detrás de un proxy inverso eso devuelve la IP del proxy para todos los usuarios: el rate limiter contaría a todo el mundo junto y la bitácora registraría siempre la misma IP inútil. Hay que pasar a `X-Forwarded-For` **junto con** una lista de proxies confiables — **nunca antes**, porque sin esa lista cualquiera falsea el header y se saltea el límite por completo, quedando peor que ahora. Fase 8.
- **El rate limit de slowapi vive en memoria del proceso.** Se pierde al reiniciar y no se comparte entre workers. Con varios workers de uvicorn el límite es ficticio. Redis en la Fase 8.
- **Argon2id consume 64 MB de RAM por login concurrente.** En un VPS de 2 GB, veinte logins simultáneos son 1,3 GB. Hay que volver a medir con el hardware real antes de decidir si se bajan los parámetros. Dato tranquilizador: los parámetros van escritos dentro del hash, así que cambiarlos no invalida los hashes viejos.
- **`TestClient` con `httpx` quedó deprecado** en Starlette 1.3 (`StarletteDeprecationWarning`); migrar a `httpx2`.
- **El 409 al registrar un email existente revela qué direcciones tienen cuenta** (enumeración de usuarios). Ocultarlo requiere poder mandar mails. Revisar en la Fase 4.
- **Sin límite de sesiones activas por usuario**, y sin job que purgue sesiones y tokens vencidos. Ambas tablas crecen sin techo.
- **`auth_events` no tiene política de retención** y guarda emails intentados, que son datos personales.
- **La segunda defensa contra XSS del `GET /auth/verify` (`html.escape`) no está cubierta por ningún test**, porque el regex de formato rechaza antes. Es defensa en profundidad deliberada, pero conviene saber que sólo la primera capa está probada.
- **`logout` no envuelve su `db.commit()` en `try`/`except`.** Decisión tomada, no deuda: atajarlo devolvería 200 con la sesión todavía válida en el servidor durante 30 días, lo que contradice la decisión de diseño #1 y le miente al usuario. Un 500 deja el estado coherente.
- **`_sesion_de_test_para_tareas_en_background` neutraliza `close()` en toda la suite, no sólo en los de recuperación**, y hace que la tarea en segundo plano comparta sesión y transacción con el test — en producción usa una aparte. La suite no ejercita el comportamiento real de dos transacciones separadas.
- **El `TestClient` corre las tareas en segundo plano de forma síncrona**, así que la suite no prueba la propiedad de tiempo de respuesta constante de `/auth/recovery`. Esa propiedad la garantiza el diseño, no los tests.
- **Van dos migraciones sólo para agregar valores al CHECK de `auth_events`.** Es el precio de que la base imponga el dominio y sigue siendo correcto, pero el riesgo real es que alguien deje de loguear un evento para no escribir una migración. Si aparece un tercer caso, revisarlo.
- **Race condition en `POST /auth/register` (TOCTOU sobre el email duplicado) — resuelta en F4-1 (PR #25).** El endpoint hacía `SELECT` para ver si el email existía y después `INSERT`, sin `try`/`except` alrededor del insert; la segunda request de una carrera reventaba con `IntegrityError` sin atajar → 500 crudo en vez de un 409 prolijo. Diagnosticada leyendo el código el 28/7. F4-1 envolvió el `INSERT` en `try`/`except IntegrityError`, con las dos ramas —la del `SELECT` previo y la del `except`— saliendo por la misma función.
- **`base.py` es un `DeclarativeBase` sin `naming_convention` en el `MetaData`.** Consecuencia:
  Alembic no puede generar el downgrade de constraints que no tienen nombre explícito. Ponerla
  ahora renombraría las que ya existen, así que no se toca; la convención de la casa mientras
  tanto es nombrar a mano los `CHECK` y los `UNIQUE` y dejar las FK con el default de Postgres.
  **Ya cobró su primera factura**: el downgrade autogenerado de la migración `f0180ac18a07`
  (F4-4a) salió con `op.drop_constraint(None, ...)` para la FK sin nombre de
  `purchases.order_id`, y hubo que completarlo a mano con `purchases_order_id_fkey` para que el
  downgrade no reventara. No es teórica.
- **`get_user_id_or_ip` (rate limit por usuario de `POST /checkout`) abre una segunda `Session`
  por request para releer la sesión que `get_current_session` ya leyó.** Es el precio de que
  slowapi evalúe el `key_func` antes de que `Depends` resuelva el usuario: el `key_func` sólo
  recibe el `Request`, no los argumentos ya resueltos del endpoint (ver el docstring de la
  función en `core/limiter.py`). Duplica una consulta indexada de sólo lectura en cada
  `POST /checkout`; aceptable con el volumen de hoy, a revisar cuando el limiter pase a Redis en
  la Fase 8.

### Frontend

- **`VITE_API_URL=http://localhost:3000/api`** — valor viejo de cuando el backend no existía. El backend real corre en **`:8000` sin prefijo `/api`**. Se corrige en la Fase 7; anotado ahora porque es la clase de detalle que hace perder una tarde buscando un bug de backend que en realidad es una variable de entorno.
- **31 colores hex fijos en gráficos de Recharts** (`stroke="#334155"`, etc.) que no responden al tema.
- **2 placeholders en `slate-600`**, bastante oscuros. Si un campo vacío se lee como si estuviera lleno, `slate-500` es el punto medio.
- **Tokens semánticos**: definir variables CSS (`--color-surface`, `--color-text-muted`) en vez de repartir clases de Tailwind por 100 archivos. Refactor grande, para cuando el proyecto se asiente.
- **`src/utils/formulas.js`** es el motor financiero central, pero sólo ~13 de las 44 calculadoras lo usan. El resto calcula inline. Riesgo de que dos calculadoras den resultados distintos para lo mismo.
- **`public/demo-video.mp4` pesa 82 MB y está en Git.** Hizo fallar el clone dos veces (`git config --global http.version HTTP/1.1`). Cuando haya videos reales, van a un servicio de streaming.

### Entorno

- **El token de `gh` está en texto plano** en `~/.config/gh/hosts.yml` dentro de WSL. Aceptable en una máquina personal; conviene saberlo.
- **La carpeta vieja en `C:\Users\kakif\Documents\monitor-economico`** sigue bloqueada por algún proceso.

---

## Seguridad — dónde está parado

### Resuelto en el frontend

Bug de autorización, `.env` protegido, sin token placeholder, `IS_MOCK_MODE` apagable, open redirect mitigado, sin logs de datos sensibles.

### Resuelto en el backend (Fase 2)

Credenciales fuera de Git con verificación explícita, contraseña generada al azar, restricciones de dominio impuestas por la propia base.

### Resuelto en el backend (Fase 3)

- El login **valida contraseña de verdad**, con Argon2id.
- **La autorización la impone el backend** en cada endpoint protegido, no el frontend. Un `curl` que se saltee la interfaz recibe el mismo 401 o 403.
- Sesión en cookie `httpOnly` — un XSS ya no puede robar el token, a diferencia de `localStorage`.
- Logout, cambio de contraseña y baja de plan pueden revocar sesiones al instante.
- Sin enumeración de usuarios en el login: mismo mensaje y mismo tiempo de respuesta para email inexistente y contraseña incorrecta.
- Rate limit en `/auth/login`.
- Bitácora de eventos de autenticación que sobrevive al borrado de la cuenta.
- Consentimiento de términos acreditable con fecha y versión.

### Sin resolver

- **Los cuatro flujos de correo (verificación, reenvío, recuperación, reset) están implementados y probados, pero ninguno le llega a nadie**: el link se escribe en el log del servidor. Sin dominio no hay proveedor de mail, y sin proveedor de mail `EMAIL_VERIFICATION_REQUIRED` no se puede prender. El pre-hijacking ya tiene el mecanismo cerrado del lado del código (`POST /auth/verify` y `POST /auth/reset` revocan todas las sesiones previas); falta que el link llegue de verdad.
- **`CheckoutPage.jsx` captura `cardNumber`/`expiry`/`cvc` en formulario propio** → alcance PCI-DSS. Hay que reemplazarlo por MercadoPago Checkout Pro o Stripe Elements antes de conectar pagos reales.

**Sin fix disponible:** react-router tiene CVEs abiertos sin versión corregida. La mayoría aplican a SSR/RSC (no a este SPA). El único que tocaba —open redirect— está mitigado a mano.

Detalle completo en `docs/SEGURIDAD.md`.

**Usuarios de prueba del mock del frontend** (acepta cualquier contraseña, sigue vivo hasta la Fase 7): `admin@monitoreco.com` (admin, unlimited), `pro@monitoreco.com` (plan pro, con cursos comprados), `free@monitoreco.com` (starter). **Ninguno de los tres se migra al backend real.**

---

## Cómo se trabaja acá

- **Siempre en ramas**, nunca commitear a `main` (además está protegida en GitHub).
- Un PR = un propósito. No mezclar limpieza con features.
- `npm run lint` en verde antes de cada commit del frontend.
- **Verificar que `.env` no entre a Git** antes de cada commit del backend: `git add -n backend/`.
- **Todo lo que exista en la base tiene que estar descrito en una migración de Alembic.** Nada de crear tablas a mano.
- **Revisar la migración autogenerada antes de aplicarla.** Alembic no detecta todo.
- **Config crítica = obligatoria, sin valor por defecto.** Si a una variable de entorno le falta el valor y el sistema puede seguir andando mal en silencio, no lleva default: la app no arranca sin ella. Ya aplicado a `postgres_user`, `postgres_password`, `postgres_db` y `environment`; pendiente en `public_base_url`.
- Convenciones completas en `CLAUDE.md` (raíz del repo).

### Comandos frecuentes del backend

```bash
cd ~/proyectos/monitor-economico/backend
set -a && . ./.env && set +a        # cargar las variables del .env en el shell antes de usar psql
docker compose up -d                 # levantar Postgres
uv run alembic upgrade head          # aplicar migraciones
uv run uvicorn app.main:app --reload --port 8000
uv run python -m app.cli crear-admin # crea el primer administrador
uv run python -m app.cli verificar-email correo@ejemplo.com # solo development
uv run pytest -v
docker compose exec -T db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "\dt"
```

⚠️ `docker compose down -v` borra el volumen y con él toda la base.
