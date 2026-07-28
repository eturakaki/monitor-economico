# Monitor Económico — Estado y contexto

Documento de traspaso. Pegá esto (o su contenido) al arrancar un chat nuevo para no reconstruir contexto.

**Repo:** https://github.com/eturakaki/monitor-economico (público)
**Local:** `~/proyectos/monitor-economico` **dentro de WSL 2 / Ubuntu 24.04**
**Equipo:** Iñaki (economía + programación) y Sofía (psicología, no programa)
**Última actualización:** 28 de julio de 2026

---

## Qué es

SPA de React 19 + Vite 7 + Tailwind 3, más un backend en construcción (FastAPI + PostgreSQL). Plataforma financiera argentina con tres partes:

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
| 9 | Expansión del tema claro a todo el proyecto (77 archivos) | **mergeado — PR #9** |

**Infraestructura activa:** `main` protegida (solo por PR), CI que corre lint + build + audit en cada PR, `CLAUDE.md` que Claude Code lee solo, permisos en `.claude/settings.json`.

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

**El repo se movió a `~/proyectos/monitor-economico`** (disco Linux nativo). Alias `mon` en `.bashrc` para llegar rápido.

La copia vieja en `C:\Users\kakif\Documents\monitor-economico` está verificada como limpia (sincronizada con `main`, sin stash, sin trabajo perdido) pero **no se pudo renombrar**: algún proceso la mantiene tomada. Pendiente menor.

Pendiente menor: rotar la contraseña del usuario de Ubuntu (`passwd`) — quedó expuesta en un chat.

### FASE 2 — La Heladera ✅ (PR #10)

Todo dentro de `backend/`:

- **`docker-compose.yml`** con PostgreSQL 17.10 + TimescaleDB 2.28.3, imagen **fijada** a `timescale/timescaledb:2.28.3-pg17` (no `latest-*`), volumen nombrado `monitor_pgdata`, healthcheck con `pg_isready`, puerto 5432 publicado.
- **Credenciales fuera de Git**: `.env` con contraseña generada por `openssl rand -base64 24`, ignorado por la regla `.env` del `.gitignore` raíz (verificado con `git check-ignore` y con `git add -n`). `.env.example` versionado.
- **`.gitignore` propio en `backend/`** para `.venv/`, `__pycache__/`, `*.py[cod]`, cachés de pytest y ruff.
- **Proyecto Python con uv**: SQLAlchemy 2.0.51, Alembic 1.18.5, psycopg 3.3.4 (binary), pydantic-settings 2.14.2. `uv.lock` versionado.
- **`app/core/config.py`**: `Settings` de pydantic-settings, variables críticas sin valor por defecto, y `database_url` como propiedad calculada con `quote_plus` sobre la contraseña (necesario porque base64 produce `+`, `/` y `=`, que rompen el parseo de la URL).
- **`app/models/user.py`**: modelo `User` con id de texto (`usr_...`), índice único en email, `hashed_password`, y dos `CheckConstraint` sobre `plan` y `role`.
- **Alembic configurado** en `alembic/env.py` con `target_metadata = Base.metadata` y `create_engine(settings.database_url)`. Primera migración `b02deb347e61_crea_tabla_users.py` generada, aplicada y verificada.
- **`backend/README.md`** con requisitos, puesta en marcha, comandos habituales y la advertencia sobre `docker compose down -v`. Escrito por Claude Code y corregido tras revisión.

**Verificaciones hechas:** persistencia del volumen comprobada tres veces (recreación forzada del contenedor, `wsl --shutdown`, y reinicio de la máquina — la fila sobrevivió a las tres); restricción CHECK comprobada con un INSERT inválido rechazado; `\dt` muestra `users` y `alembic_version`.

**Sustituciones respecto del roadmap:** no se instaló DBeaver. La verificación de alcance externo se hace con `Test-NetConnection -Port 5432` desde PowerShell. Un cliente gráfico se puede sumar cuando haga falta.

---

## Lo primero que hay que hacer

**Revisar y mergear el PR #10** (`feat/backend-fase-2-database`).

```
https://github.com/eturakaki/monitor-economico/pull/10
```

Antes de mergear: `gh pr checks 10` debe estar en verde.

---

## Cómo se trabaja: el reparto de roles

| Quién | De qué se ocupa |
|---|---|
| El chat | Diseño, decisiones, explicación, revisión, documentos, investigación |
| Claude Code (en WSL) | Escribir archivos dentro del repo, correr lint y tests, cambios repetitivos |
| Iñaki | Los comandos que enseñan, y aprobar lo que Claude Code propone |

**Lo mecánico se delega, lo conceptual no.** Las instrucciones a Claude Code llevan siempre tres partes: qué leer, qué escribir, qué no tocar.

**Cuentas:** hay dos cuentas pagas de Claude. Conviene usar una para el chat y otra para Claude Code, así los límites de uso no compiten.

**Verificado en la práctica:** en su primer encargo, Claude Code escribió un comando que se veía correcto y no funcionaba (`psql -U $POSTGRES_USER`, variable que bash expande vacía porque vive en el `.env`). El resto del archivo estaba bien. Conclusión operativa: **leer el diff y verificar contra el archivo, nunca contra el reporte del agente.**

---

## Después: FASE 3 — El Portero

**Es la fase crítica y el único bloqueante real para tener usuarios de verdad.**

Estado actual: el login del frontend acepta cualquier email sin contraseña, y `admin@monitoreco.com` entra con rol de administrador. Hoy cualquier persona puede entrar como admin.

Alcance de la fase:

- FastAPI + Uvicorn sobre el `.venv` que ya existe
- Modelos: completar `User` (relaciones), y sumar `Subscription`, `Order`, `Course`, `Lesson`, `Progress`
- Hash de contraseñas con **Argon2** (o bcrypt). Nunca texto plano, nunca MD5 o SHA1.
- Sesión en cookie **httpOnly + Secure + SameSite=Lax**, no en `localStorage`. El frontend ya tiene `withCredentials: true` en axios.
- Endpoints: `POST /auth/register`, `/auth/login`, `/auth/logout`, `GET /auth/me`, `POST /auth/recovery`
- Dependencia de autorización que valide plan y rol en **cada** endpoint protegido
- Rate limiting en `/auth/login`
- CORS con el origen exacto del frontend — no `*`, que es incompatible con `withCredentials`

**Tests mínimos, no opcionales:**

1. Login correcto → 200 y cookie seteada
2. Contraseña incorrecta → 401
3. Endpoint protegido sin sesión → 401
4. Endpoint de plan `unlimited` con usuario `starter` → 403

**Sello:** `localhost:8000/docs` muestra Swagger, un usuario se registra, inicia sesión, y `GET /auth/me` devuelve el objeto con la forma exacta del contrato. Los cuatro tests pasan.

### Fases siguientes

4. **Pagos** (MercadoPago; acceso otorgado solo por webhook confirmado, nunca porque el frontend diga "ya pagué")
5. **Ingesta de datos** (empezar con una sola serie; priorizar APIs oficiales del BCRA/INDEC sobre scraping)
6. **IA / análisis** (cachear el resultado, verificar los números contra la base, disclaimer visible)
7. **Conexión con el frontend** (`VITE_USE_MOCKS=false`)
8. **Deploy** (HTTPS, backups probados, headers de seguridad, Sentry)

**Nota de alcance:** con las fases 1 a 4 más un deploy ya hay producto vendible. Las 44 calculadoras funcionan sin backend.

### Recursos anotados para más adelante

- **Video de VPS con Claude Code** (midudev, patrocinado por Hostinger): la primera mitad —usuarios sin privilegios, claves SSH, desactivar login por contraseña, UFW, fail2ban— es prácticamente el checklist de la Fase 8. La segunda mitad, el agente autónomo 24/7, no es prioritario y conviene pensarla dos veces antes de darle acceso a un repo que toque credenciales de pago.
- **Video de MCP** (midudev): concepto vigente y ampliamente adoptado, pero no toca el camino crítico. Construir un MCP propio tiene sentido recién cuando haya producto — por ejemplo, para exponer las 44 calculadoras como herramientas.
- **Notebook vieja (8 GB RAM, 500 GB)**: excelente campo de entrenamiento para ensayar el deploy de la Fase 8 sin pagar un VPS, y candidata para el cron de ingesta de la Fase 5. Mal servidor de producción una vez que haya clientes pagando: depende de la luz, el internet hogareño y una IP que cambia.

---

## El contrato de la API

Ya está definido por los servicios mock. Cada método es un endpoint.

```json
{
  "id": "usr_abc123",
  "email": "usuario@mail.com",
  "name": "Nombre Apellido",
  "plan": "starter | pro | unlimited",
  "role": "user | admin",
  "purchasedCourses": ["course_macro_101"],
  "completedLessons": ["course_macro_101_l_101"],
  "lastActivity": { "course_macro_101": "course_macro_101_l_101" },
  "createdAt": "2026-01-15T10:30:00Z"
}
```

| Servicio mock | Método | Endpoint |
|---|---|---|
| `userStatus` | `login({email})` | `POST /auth/login` |
| | `fetchUser()` | `GET /auth/me` |
| | `logout()` | `POST /auth/logout` |
| | `updateProfile(data)` | `PATCH /users/me` |
| | `updatePlan(planId)` | `POST /subscriptions` |
| | `grantAccess(ids)` | interno, tras pago confirmado |
| `courseService` | `getAllCourses()` / `getCourseById(id)` / `searchCourses(q)` | `GET /courses`, `/courses/{id}`, `/courses?search=` |
| `progressService` | `markLessonAsCompleted()` | `POST /progress/lessons/{id}/complete` |
| | `getAllCompletedLessons()` | `GET /progress/me` |
| | `saveWatchTime(id, s)` | `PUT /progress/lessons/{id}/watchtime` |
| `cartService` | get / add / remove | `GET·POST·DELETE /cart` |
| `orderService` | `getOrders()` / `createOrder()` | `GET /orders`, `POST /orders` |
| | `hasPurchased(id)` | derivar de `GET /auth/me` |
| `checkoutService` | `processPayment(data)` | `POST /checkout` |
| | `validateCoupon(code)` | `GET /coupons/{code}` |
| `wishlistService` | get / add / remove | `GET·POST·DELETE /wishlist` |

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

- **31 colores hex fijos en gráficos de Recharts** (`stroke="#334155"`, etc.) que no responden al tema.
- **2 placeholders en `slate-600`**, bastante oscuros. Si un campo vacío se lee como si estuviera lleno, `slate-500` es el punto medio.
- **Tokens semánticos**: definir variables CSS (`--color-surface`, `--color-text-muted`) en vez de repartir clases de Tailwind por 100 archivos. Refactor grande, para cuando el proyecto se asiente.
- **`src/utils/formulas.js`** es el motor financiero central, pero solo ~13 de las 44 calculadoras lo usan. El resto calcula inline. Riesgo de que dos calculadoras den resultados distintos para lo mismo.
- **`public/demo-video.mp4` pesa 82 MB y está en Git.** Hizo fallar el clone dos veces (hay que forzar HTTP/1.1: `git config --global http.version HTTP/1.1`). Cuando haya videos reales, van a un servicio de streaming.
- **El token de `gh` quedó guardado en texto plano** en `~/.config/gh/hosts.yml` dentro de WSL. Aceptable en una máquina personal; conviene saberlo.
- **La carpeta vieja en `C:\Users\kakif\Documents\monitor-economico`** sigue ahí, bloqueada por algún proceso. Renombrarla o borrarla cuando se libere.

---

## Seguridad — dónde está parado

**Resuelto en el frontend:** bug de autorización, `.env` protegido, sin token placeholder, `IS_MOCK_MODE` apagable, open redirect mitigado, sin logs de datos sensibles.

**Resuelto en el backend (Fase 2):** credenciales fuera de Git con verificación explícita, contraseña generada al azar, restricciones de dominio impuestas por la base.

**Sin resolver, y no se puede desde React:**

- El login **no valida contraseña**. Acepta cualquier email, y `admin@monitoreco.com` entra como admin.
- `ProtectedRoute` es solo UX. La autorización real la tiene que validar el backend.
- `CheckoutPage.jsx` captura `cardNumber`/`expiry`/`cvc` en formulario propio → alcance PCI-DSS. Hay que reemplazarlo por MercadoPago Checkout Pro o Stripe Elements antes de conectar pagos reales.

**Sin fix disponible:** react-router tiene CVEs abiertos sin versión corregida. La mayoría aplican a SSR/RSC (no a este SPA). El único que tocaba —open redirect— está mitigado a mano.

Detalle completo en `docs/SEGURIDAD.md`.

**Usuarios de prueba del mock** (acepta cualquier contraseña): `admin@monitoreco.com` (admin, unlimited), `pro@monitoreco.com` (plan pro, con cursos comprados), `free@monitoreco.com` (starter).

---

## Cómo se trabaja acá

- **Siempre en ramas**, nunca commitear a `main` (además está protegida en GitHub).
- Un PR = un propósito. No mezclar limpieza con features.
- `npm run lint` en verde antes de cada commit del frontend.
- **Verificar que `.env` no entre a Git** antes de cada commit del backend: `git add -n backend/`.
- **Todo lo que exista en la base tiene que estar descrito en una migración de Alembic.** Nada de crear tablas a mano.
- Convenciones completas en `CLAUDE.md` (raíz del repo).

**Lección con los agentes en paralelo:** en la expansión del tema claro, Claude Code lanzó 6 agentes por carpeta (~800k tokens). Funcionó, pero **se saltearon 5 casos y un archivo entero** (`Layout.jsx`). Aparecieron solo al pedir una verificación explícita post-hoc. Si se vuelve a paralelizar, **pedir siempre la verificación exhaustiva antes de commitear**.

**Lección de la Fase 2:** los planes escritos envejecen. El roadmap pedía Node 20 LTS, que llegó a fin de vida en abril de 2026. Verificar versiones antes de seguir un documento, aunque sea propio.

**Lección del primer encargo a Claude Code:** produce resultados que se ven bien y a veces no funcionan. Verificar contra el archivo (`grep`, `git diff`), nunca contra su propio reporte.
