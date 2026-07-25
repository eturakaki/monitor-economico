# Monitor Económico — Estado del proyecto + Convenciones base

> Foto real del código al 19/07/2026. Sirve como punto de partida ("lo correcto") para trabajar de ahora en más.

---

## 1. Estado general

| Chequeo | Resultado |
|---|---|
| `npm install` | ✅ OK (350 paquetes) |
| `npm run build` | ✅ Compila (con warning de bundle gigante) |
| `npm run lint` | ❌ **Falla: 8 errores** (1 de sintaxis) |

**Stack:** React 19 + Vite 7, Tailwind 3, React Router 7, Recharts, react-hook-form + zod, @dnd-kit, axios, sonner.

**Escala:** 73 páginas, 23 componentes, 44 herramientas en 7 módulos, e-commerce + academia con reproductor de video, auth con rutas protegidas.

La base es sólida y grande. Lo que falta no es funcionalidad, es **orden**: hay inconsistencias, archivos basura y reglas que nadie definió todavía. Eso es lo que fijamos acá.

---

## 2. Hallazgos, por severidad

### 🔴 Crítico — hay que arreglarlo sí o sí

1. **El lint no pasa (8 errores).** Uno es un **error de sintaxis** en `src/data/herramientasfin.js` (línea 2): el archivo es un array sin su apertura `export const ... = [`. Está **roto y además no se importa en ningún lado** — es un duplicado muerto de `herramientas.js`. → borrar.
2. **7 variables sin usar** en 5 herramientas (`DecodificadorCFT`, `ComprarAlquilar`, `GastosEscritura`, `PlazoFijoUva`, `RutasDolar`). Errores de lint fáciles de limpiar.
3. **`ShopProvider` está duplicado.** Envuelve la app en `main.jsx` **y otra vez** en `App.jsx`. Dos providers anidados del mismo contexto → bug latente (estado/render duplicado). Debe quedar en un solo lugar.

### 🟠 Estructural — desordena todo el proyecto

4. **Carpetas con espacios y paréntesis** (7 de ellas): `inversiones (mod 2)`, `Inflacion (Mod1)`, `credito(mod3)`, etc. Funciona hoy pero es frágil en imports, rutas de build y algunos deploys/SO. Fuente segura de dolores de cabeza.
5. **Exports inconsistentes:** en `pages/` hay 57 componentes con export *named* y 17 con export *default*. No hay regla → uno nunca sabe cómo importar.
6. **Archivos basura commiteados en la raíz:**
   - `et --hard 3b57cd8` → es la salida de un `git log` pegada por error como archivo.
   - `PROMPT FRONT-END.txt` → notas de trabajo.
   - `FotoLinkedIn.jpg` → imagen suelta fuera de `public/` o `assets/`.
7. **Archivos temporales / con typo:** `TEMP_Glosario.jsx` (prefijo TEMP en producción) y `DescargaPremiun.jsx` (typo: debería ser *Premium*, y su export interno sí dice `DescargaPremium`).

### 🟡 Calidad / deuda técnica — no urge, pero conviene

8. **Lógica financiera duplicada.** Existe un motor central `src/utils/formulas.js`, pero **solo 13 de 44 herramientas lo usan**; el resto calcula fórmulas inline. Riesgo de que dos calculadoras den resultados distintos para lo mismo.
9. **58 marcas TODO/FIXME** repartidas en el código.
10. **`IS_MOCK_MODE` está forzado a `true`** en `api.client.js` (`... || true`). El override deja los mocks siempre activos; no se pueden apagar por variable de entorno.
11. **Bundle sin code-splitting:** el build genera un chunk de **1,5 MB** (+ hls 521 KB, dash 992 KB). Carga inicial pesada. Se resuelve con `React.lazy` en las rutas.
12. **README** es el template por defecto de Vite (no documenta el proyecto).
13. **No hay `.env.example`** pese a usar `VITE_API_URL` y `VITE_USE_MOCKS`.
14. **Auth sobre `localStorage`** con `mock-token-placeholder`. Esperable en esta etapa, pero anotarlo como pendiente antes de producción real.

---

## 3. Convenciones propuestas — "lo correcto" de acá en adelante

Esta es la base. La idea es que todo lo nuevo la respete y lo viejo se vaya migrando de a poco.

**Exports**
- Componentes y páginas: **named export** (`export function Home()`). Ya es la mayoría (57 vs 17); alineamos los 17 default a named.
- Data y utils: named export (ya se cumple).

**Nombres**
- Archivos de componentes/páginas: `PascalCase.jsx` → `Home.jsx`, `CuotaSimple.jsx`.
- Hooks: `useAlgo.js` (camelCase con prefijo `use`).
- Utils, services, data: `camelCase.js`.
- Rutas (URLs): `kebab-case` → `/calculadoras/inflacion/salario-real`.
- Nada de `TEMP_`, typos ni nombres provisorios en `main`.

**Estructura de carpetas**
- Sin espacios ni paréntesis. Renombrar los 7 módulos a `kebab-case`:
  `Inflacion (Mod1)` → `mod1-inflacion`, `inversiones (mod 2)` → `mod2-inversiones`, etc. (o simplemente `inflacion`, `inversiones`…).
- Imágenes en `public/` o `src/assets/`, nunca sueltas en la raíz.

**Lógica de negocio**
- Toda fórmula financiera vive en `src/utils/formulas.js`. Los componentes solo llaman funciones, no reimplementan cálculos.
- Los services (`src/services/`) son la única puerta a datos/API. Los componentes no llaman axios directo.

**Calidad**
- `npm run lint` tiene que dar **verde** antes de cada commit. Es la línea que marca "correcto".
- Providers globales viven **solo** en `main.jsx`.
- `.env.example` con todas las variables `VITE_*` documentadas.
- README propio del proyecto (qué es, cómo se corre, estructura).

---

## 4. Primer paso sugerido

Arrancar por lo 🔴 crítico, que es rápido y deja el lint en verde:

1. Borrar `herramientasfin.js` (roto y sin uso) y los 3 archivos basura de la raíz.
2. Sacar el `ShopProvider` duplicado (dejarlo solo en `main.jsx`).
3. Limpiar las 7 variables sin usar.

Con eso el proyecto queda instalando, compilando **y linteando limpio** — la base mínima de "correcto". Después seguimos con lo estructural (renombrar carpetas, unificar exports).

Decime si querés que empiece por esos arreglos 🔴 o que primero renombremos las carpetas.
