# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

"Monitor Económico" is a Spanish-language (Argentina) financial content platform: a hub of 50+ financial calculators ("Herramientas"/"Calculadoras"), a paid course/learning platform ("Academia"), an e-commerce flow for courses and subscription plans, and a markets dashboard. It's a React SPA with **no backend yet** — all data persistence is mocked via `localStorage`.

## Commands

```bash
npm run dev       # start Vite dev server
npm run build     # production build
npm run preview   # preview production build
npm run lint      # eslint .
```

There is no test suite/framework configured in this repo (no Jest/Vitest). Don't assume one exists when asked to "run tests."

## Environment

Copy `.env.example` to `.env`. Key variables:
- `VITE_API_URL` — backend base URL (defaults to `http://localhost:3000/api`)
- `VITE_USE_MOCKS` — `true` (default) runs entirely on mock services/localStorage; set `false` to hit a real backend

Anything prefixed `VITE_` is inlined into the client bundle and public — never put secrets there.

## Architecture

### Mock-backend pattern (important — read before touching any service)

There is no real backend. Every service in `src/services/**` follows the same dual-mode shape:

```js
async someMethod(...) {
  if (IS_MOCK_MODE) {
    await _simulateLatency();       // artificial delay for realistic UX
    // read/write a namespaced localStorage key, return plain data
  }
  return apiClient.get/post/...(...); // the "real" path, once a backend exists
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
