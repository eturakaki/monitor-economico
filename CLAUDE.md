# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

"Monitor Económico" is a Spanish-language (Argentina) financial content platform: a hub of 50+ financial calculators ("Herramientas"/"Calculadoras"), a paid course/learning platform ("Academia"), an e-commerce flow for courses and subscription plans, and a markets dashboard. There's a FastAPI + PostgreSQL backend under active construction in `backend/`; the frontend keeps running entirely on mocks via `localStorage` until Phase 7 replaces them one service at a time — both coexist right now.

## Documentos de referencia

El estado y las decisiones del proyecto viven en `docs/`, no en la cabeza de nadie:

- `docs/ESTADO-PROYECTO.md` — qué hay construido hoy, con la deuda técnica anotada.
- `docs/ROADMAP.md` — las 8 fases y qué viene después.
- `docs/FASE-4.md` — la fase en curso, con su secuencia de PRs.
- `docs/MODELO-NEGOCIO.md` — qué se vende, cómo se cobra y por qué.

Ante contradicción entre el código y estos documentos, preguntar. No resolver solo.

## Commands

```bash
npm run dev       # start Vite dev server
npm run build     # production build
npm run preview   # preview production build
npm run lint      # eslint .
```

Backend (desde `backend/`):

```bash
cd ~/proyectos/monitor-economico/backend
set -a && . ./.env && set +a        # cargar las variables del .env en el shell antes de usar psql
docker compose up -d                 # levantar Postgres
uv run alembic upgrade head          # aplicar migraciones
uv run uvicorn app.main:app --reload --port 8000
uv run python -m app.cli crear-admin # crea el primer administrador
uv run python -m app.cli verificar-email <email> # solo development
uv run pytest -v
docker compose exec -T db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "\dt"
```

Los comandos que cargan el `.env` (`set -a && . ./.env`) los corre Iñaki, no Claude
Code: el `deny` de `.claude/settings.json` bloquea cualquier acceso a `.env*`.

The backend has a pytest suite that runs in CI and is required to pass on every PR. The frontend still has no test framework configured (no Jest/Vitest) — don't assume one exists when asked to "run tests."

## Environment

Copy `env.example` to `.env`. Key variables:
- `VITE_API_URL` — backend base URL (defaults to `http://localhost:3000/api`; that default is stale, from before the real backend existed — it runs on `:8000` with no `/api` prefix. Fix scheduled for Phase 7. Tracked in `docs/ESTADO-PROYECTO.md`'s deuda técnica.)
- `VITE_USE_MOCKS` — `true` (default) runs entirely on mock services/localStorage; set `false` to hit a real backend

Anything prefixed `VITE_` is inlined into the client bundle and public — never put secrets there.

## Architecture

### Mock-backend pattern (important — read before touching any service)

The backend is real, but the frontend doesn't consume it yet: every service in `src/services/**` still runs in mock mode until Phase 7 replaces them one at a time. That's exactly what this dual-mode shape is for — switching a service from mock to real without touching the components that call it:

```js
async someMethod(...) {
  if (IS_MOCK_MODE) {
    await _simulateLatency();       // artificial delay for realistic UX
    // read/write a namespaced localStorage key, return plain data
  }
  return apiClient.get/post/...(...); // the "real" path, once this service stops running in mock mode
}
```

- `src/services/core/api.client.js` is the single Axios instance (interceptors for auth token injection, 401 session-expiry redirect, 500 toast). `IS_MOCK_MODE` is exported from here.
- `src/services/userStatus.js` is the mock "auth database" (`localStorage` key `monitoreco_mock_db_v2`, session key `monitoreco_session_v2`). It fakes login by email only (no password check), simulates latency and a random failure rate ("Chaos Monkey"). When wiring a real backend, this is the file to replace — plan/role must come from the server, never be trusted from the client.
- `src/services/commerce/*` (cart, order, checkout) and `src/services/learning/*` (course, progress) follow the identical mock/real branching.
- When adding a new service or modifying an existing one, preserve this pattern (mock branch + real branch) rather than hardcoding one or the other.

### Global providers (`src/main.jsx`)

Nesting order matters: `ThemeProvider > AuthProvider > ShopProvider > BrowserRouter > App`. `ShopProvider` depends on `useAuth()` and waits for auth to finish loading before syncing cart/orders.

- `AuthContext`/`AuthProvider` (`src/context/AuthContext.jsx`, `AuthProvider.jsx`) — single source of truth for the user, session bootstrap, login/logout, optimistic profile updates, and ACL helper selectors (`hasAccessToCourse`, `isLessonCompleted`, etc.). Consume via `useAuth()` (`src/hooks/useAuth.js`), never `useContext(AuthContext)` directly.
- `ShopContext` (`src/context/ShopContext.jsx`) — "thin context, fat service": holds cart/orders state and delegates all logic to `services/commerce/*`. `processCheckout` orchestrates payment → order creation → cache update → cart clear. `hasPurchased` checks in-memory order state, no network call.
- `ThemeContext` — light/dark, persisted to `localStorage`, toggled via a `light`/`dark` class on `<html>` (Tailwind `darkMode: 'class'`).
- `WishlistContext` — wraps `<App />` itself (inside `App.jsx`, not `main.jsx`).

### Routing (`src/App.jsx`)

All pages are lazy-loaded via a `lazyPage()` helper that supports both named and default exports. Routes are organized in three zones:

- **Zone A** — standalone pages outside the main layout (login/register/recovery, legal, API docs).
- **Zone B** — wrapped in `<Layout>` (navbar/footer chrome): public marketing pages, `<ProtectedRoute>`-gated private pages (dashboard, profile, analytics, purchases), a plan-gated sub-route (`allowedPlans={['unlimited']}` for `/api-keys`), and the full `/calculadoras/**` catalog of tools grouped by module (inflación, inversiones, crédito, inmobiliario, fiscal, vida, corporativo).
- **Zone C** — the immersive course player, wrapped in `<ProtectedRoute>` + `<LearningLayout>` instead of the main `Layout` (no navbar/footer while learning).

`ProtectedRoute` (`src/components/auth/ProtectedRoute.jsx`) handles both authentication (redirect to `/login` preserving `state.from`) and plan-based authorization (`allowedPlans`, with an admin bypass). It works both as a layout route (`<Route element={<ProtectedRoute />}>`) and as a direct wrapper. **This is a client-side UX gate only** — matching authorization must exist on any real backend.

### Tools registry and calculator pages

`src/data/toolsRegistry.js` is the master catalog: every calculator's id, category, title, description, route, icon, color and feature flags. `categoryLabels` maps the 7 module keys (`inflacion`, `inversiones`, `credito`, `inmobiliario`, `fiscal`, `vida`, `corporativo`) to display names. This registry drives the `/herramientas` hub UI — when adding a new calculator, register it here *and* add its lazy route in `App.jsx`.

Every calculator page (`src/pages/herramientas/<modulo>/*.jsx`) follows the same shape: wrapped in `<ToolLayout title description icon color>` (back-link, header card, content slot), local `useState` for inputs, a `handleCalcular` that pulls pure math from `src/utils/formulas.js`. All financial math lives in `formulas.js` under the `financial` namespace, grouped by module (`financial.inflation.*`, `financial.investments.*`, etc.) as side-effect-free functions — keep new formulas there rather than inlining math in components.

### Learning/Academia module

`CoursePlayerContext` (`src/context/CoursePlayerContext.jsx`) is the "smart layer" for the course player: loads course + lesson content via `courseService`, tracks completed-lesson state optimistically, and is scoped to `courseId`/`lessonId` from the route (see Zone C above). `GuardedCourseRoute` (`src/context/GuardedCourseRoute.jsx`) is a separate, course-specific guard from `ProtectedRoute` (checks `hasAccessToCourse`, not just login state).

### Styling

Tailwind CSS v3, `darkMode: 'class'`. `src/utils/StyleConfig.js` (`getStyles(color)`) hardcodes full Tailwind class strings per accent color (emerald/blue/purple/amber/rose/default) rather than building class names dynamically — this is intentional so Tailwind's static analysis can find and include them in the production CSS purge. When adding a new accent color anywhere in the app, add it as its own explicit entry here (and check `toolsRegistry.js`/`ToolLayout` usages), don't try to interpolate `bg-${color}-100` ad hoc in new code without adding the color to the relevant safelist.

### Path/naming conventions

- Pages: `src/pages/**` (route-level components). Reusable UI: `src/components/**`, with subfolders by feature (`auth/`, `layout/`, `player/`, `profile/`, `shop/`).
- Business logic that isn't pure math or API calls (auth, ACL) lives in contexts/providers; pure calculation lives in `utils/formulas.js`; anything crossing a network/localStorage boundary lives in `services/**`.
- Static/reference data (course catalog, glossary, plans, sectors) lives in `src/data/*.js`.

## Convenciones del proyecto

### Exports
- Componentes y páginas: named export (`export function Home()`). No default export.
- Data, utils, services: named export.

### Nombres
- Componentes y páginas: `PascalCase.jsx`
- Hooks: `useAlgo.js`
- Utils, services, data: `camelCase.js`
- Rutas URL: `kebab-case` (`/calculadoras/inflacion/salario-real`)
- Prohibido: prefijos `TEMP_`, nombres provisorios o con typos en `main`.

### Estructura
- Carpetas sin espacios ni paréntesis, en `kebab-case`.
- Imágenes en `src/assets/` o `public/`, nunca en la raíz.

### Lógica de negocio
- Toda fórmula financiera va en `src/utils/formulas.js`. Los componentes la importan, no la reimplementan.
- Los services (`src/services/`) son la única puerta a datos/API. Los componentes no llaman axios directo.

### Seguridad
- Nunca commitear `.env` ni claves. Las variables `VITE_*` son públicas: van al bundle y las ve cualquiera.
- Claves privadas de APIs y pagos van SOLO en el backend.
- `ProtectedRoute` usa las props `allowedPlans` y `redirectPath`. Es solo UX: la autorización real la valida el backend.

### Calidad
- `npm run lint` debe dar verde antes de cada commit.
- Providers globales viven solo en `main.jsx`, nunca duplicados.
- Trabajar siempre en ramas, nunca commitear directo a `main`.

## Método de trabajo (obligatorio)

Este archivo es cortesía; la garantía vive en `.claude/settings.json`, que bloquea de
verdad lo que acá sólo se pide. Si una regla importa, tiene que estar en los dos lados.

### Encargos
- Todo cambio llega como ENCARGO con cuatro secciones: QUÉ LEER / QUÉ ESCRIBIR /
  QUÉ NO TOCAR / AL TERMINAR. Si falta alguna, parar y pedirla.
- Sin encargo: sólo analizar y proponer. No escribir.
- Leer los archivos reales antes de escribir. Nunca responder de memoria sobre qué
  contiene un archivo.
- Si hay una librería de por medio, verificar su API real contra la versión
  instalada antes de escribir. No escribirla de memoria.
- Explicar el porqué en lenguaje simple ANTES de la solución.

### Frenos
Ante cualquiera de estos casos: parar, avisar con lo que se encontró, y esperar.
Nunca resolver creativo para no frenar.
- Un test existente falla por el cambio. No editarlo para que pase.
- El encargo pide algo que el repo contradice.
- Aparece algo mejorable fuera del alcance: anotarlo, no arreglarlo.
- El propio trabajo se desvió del encargo: decirlo antes de que lo pregunten.

### Verificación
- `git diff` no muestra archivos sin trackear. Al terminar, mostrar siempre
  `git diff HEAD` **y** `git status --short`.
- Una suite en verde no prueba nada por sí sola. Para lo que importa, prueba de
  mutación: romper el cambio a propósito y confirmar que caen exactamente los tests
  que dependen de él.
- El schema se verifica contra la base real (`\d tabla` en psql), no contra el
  modelo de Python.
- Por cada test que prueba que algo está prohibido, el espejo que prueba que algo
  está permitido.

### Git
- Crear la rama es el paso cero de todo encargo, antes de leer nada. Sale siempre
  de `main` actualizado, y se verifica con `git log --oneline main..HEAD`, que
  tiene que salir vacío: un working tree limpio no dice de qué rama saliste.
- El agente corre el git local: rama, `status`, `log`, `diff`, `add` por ruta
  explícita, `commit`, `push` de su propia rama, y `gh pr create --draft`. Siempre
  en draft, sin excepción.
- El agente NUNCA marca "Ready for review" y NUNCA mergea. Esos dos clics son de
  Iñaki y son el punto donde se toma la decisión.
- Por qué draft y no un PR normal: un draft no se puede mergear, ni por accidente
  ni por apuro. Así el freno de parar y mirar el diff deja de depender de la
  disciplina y queda impuesto por la herramienta. Es la lección 17 de
  `ESTADO-PROYECTO.md` aplicada al flujo de trabajo: cuando una regla importa, la
  impone el sistema, no los buenos modales.
- Prohibido para todos, agente e Iñaki: `reset --hard`, `rebase` (cualquiera, sin
  distinguir si la rama fue pusheada o no), `push --force` en todas sus formas, y
  cualquier commit o push directo a `main`. Es lo único irreversible del juego. El
  rebase se prohíbe entero y no sólo sobre ramas pusheadas: la distinción no se
  puede expresar en una regla automática, y una regla que dice cubrir algo que no
  cubre es peor que no tenerla. Con un PR por encargo, el rebase local no hace
  falta.
- El deny de `.claude/settings.json` para push a `main` es cortesía, no garantía:
  un patrón no puede ver en qué rama estás parado, así que un `git push` a secas
  desde `main` no queda atrapado ahí. La garantía real es el ruleset de `main` del
  lado del servidor —checks obligatorios, `bypass_actors: []`, ya verificado
  rompiendo un test a propósito—.
- Stagear por ruta explícita. Prohibido `git add .` y `git add -A`.
- Un PR = un propósito. Nunca mezclar limpieza con feature.
- Mensajes de commit en español, con prefijo (`feat:`, `fix:`, `docs:`, `chore:`).
- Cláusula de reversión, escrita a propósito: si Iñaki se descubre aprobando un PR
  sin haber leído el diff, se vuelve al corte estricto —el agente no commitea— y
  listo. Esta regla es reversible y se evalúa con el uso, no de una vez y para
  siempre.
- `.claude/settings.json` lo edita Iñaki y sólo Iñaki, nunca el agente, ni
  siquiera para endurecer una regla. Un agente que puede apretar sus permisos
  también puede aflojarlos, y ese archivo es la garantía de todo lo demás. El deny
  `Edit(.claude/**)` de F4-2 es lo que lo impone, y quedó confirmado en la
  práctica el 29/7/2026: al intentar agregar sus propias restricciones, la
  herramienta lo rechazó.
- `gh pr merge` y `gh pr ready` están en el deny. Eso es lo que convierte el PR en
  draft de una costumbre en una garantía: el agente no puede marcarlo listo ni
  mergearlo aunque quiera.
- El deny de comandos destructivos es cortesía, no garantía, por la lección 9 del
  proyecto: es una lista negra sobre una CLI con banderas cortas y orden libre de
  argumentos, así que siempre va a tener huecos —`git pull --rebase` no lo atrapa
  `Bash(git rebase*)`, por ejemplo—. Frena el accidente, que es el caso real. La
  garantía es el ruleset de `main` y que todo lo importante esté pusheado.

### Mantener los documentos al día

Un PR no está terminado hasta que los documentos dicen lo que el PR hizo. No es una
tarea posterior ni un PR aparte: entra en el mismo PR.

Antes de declarar MISIÓN CUMPLIDA, revisar si el cambio afecta alguno:

- Cambió lo que hay construido, apareció deuda nueva, o se aprendió algo que no
  queremos repetir → `docs/ESTADO-PROYECTO.md`.
- Cambió el plan o el alcance de la fase en curso → `docs/FASE-4.md`.
- Cambió qué se vende o cómo se cobra → `docs/MODELO-NEGOCIO.md`.
- Cambió una fase futura → `docs/ROADMAP.md`.
- Cambió una convención o una regla de trabajo → este archivo.

Si ninguno aplica, decirlo explícito en el reporte: "ningún documento cambia por
este PR". Lo que no puede pasar es no haberlo revisado.

**La regla que sostiene todo esto: una decisión tomada en una conversación no
existe hasta que está escrita en un documento del repo.** El chat se cierra y se
olvida; el repo queda. `docs/ESTADO-PROYECTO.md` es el documento de traspaso: es lo
que se pega al abrir un chat nuevo, y por eso tiene que estar siempre al día.
