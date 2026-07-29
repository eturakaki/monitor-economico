# Seguridad — Monitor Económico

Guía práctica: qué se arregló, qué falta, y el concepto clave que evita el 90% de los problemas.

---

## ⚠️ Lo más importante que tenés que entender

**En el frontend NO existen los secretos.** Todo lo que va en el código de React —claves, tokens, contraseñas, lógica de permisos— se descarga al navegador del visitante. Cualquiera puede abrir DevTools (F12) y leerlo. No hay forma de ocultarlo: ni ofuscando, ni minificando, ni con variables de entorno.

Esto no es un defecto de tu proyecto, es cómo funciona la web. La consecuencia práctica:

> **Toda clave privada y toda decisión de permisos vive en el backend. El frontend solo pide y muestra.**

Cuando conectes MercadoPago, un servicio de datos financieros, o cualquier API con clave privada: **el navegador nunca debe tocar esa clave**. El flujo correcto es:

```
Navegador  →  TU backend (guarda la clave secreta)  →  API externa
```

Y **nunca**:

```
Navegador (con la clave a la vista)  →  API externa   ❌
```

---

## ✅ Lo que se arregló en este patch

### 1. Bug de autorización real (el más serio)

`ProtectedRoute` está definido para recibir `allowedPlans` y `redirectPath`. Pero `App.jsx` le pasaba `isAllowed` y `redirectTo` — props que el componente **no lee**. Resultado: el chequeo de plan nunca se ejecutaba y la ruta `/api-keys` (supuestamente exclusiva de plan *unlimited*) estaba **abierta a cualquier usuario logueado**.

Corregido: ahora usa `allowedPlans={['unlimited']}` y el guard efectivamente funciona.

### 2. `.env` no estaba protegido

El `.gitignore` no incluía `.env`. Si alguna vez creaban uno con credenciales, se subía a GitHub público. Agregado junto con `*.pem`, `*.key` y variantes.

*Verificado: nunca se commiteó un `.env` en el historial. No hay nada filtrado.*

### 3. Token placeholder falso

`api.client.js` mandaba `Bearer mock-token-placeholder` cuando no había sesión. Eso enmascara errores de autenticación: el backend recibe un token inválido en vez de ninguno, y los bugs de sesión se vuelven invisibles. Ahora el header solo se adjunta si hay token real.

### 4. Mocks imposibles de apagar

`IS_MOCK_MODE` tenía `|| true` al final, lo que anulaba la variable de entorno: los datos simulados quedaban activos **siempre, incluso en producción**. Ahora responde a `VITE_USE_MOCKS` (sigue en `true` por defecto porque todavía no hay backend, pero ya se puede apagar).

### 5. Login sin contraseña — documentado

`UserStatusService.login()` recibe solo `{ email }` y **no valida contraseña**. Acepta cualquier email y, si no existe, crea el usuario. Como `admin@monitoreco.com` existe con rol admin y plan unlimited, **hoy cualquiera puede entrar como administrador**.

Está bien para un mock de desarrollo, pero es crítico no olvidarlo. Le agregué un bloque de advertencia bien visible en el código.

### 6. `env.example`

Creado, documentando `VITE_API_URL` y `VITE_USE_MOCKS`, con una advertencia explícita sobre qué **nunca** poner en variables `VITE_*`.

### 7. Dependencias vulnerables (`npm audit fix`)

Se corrió `npm audit fix` (sin `--force`, para no arrastrar breaking changes sin revisar). Bajó de 16 a 7 vulnerabilidades. Se verificó que `npm run lint` y `npm run build` siguen en verde después del update.

Quedan pendientes, deliberadamente sin tocar:

- **`brace-expansion` (vía `eslint`/`minimatch`)**: el fix requiere `eslint@10` (breaking change). Es una dependencia de desarrollo (lint), no viaja al bundle de producción — riesgo bajo, se evalúa en otro momento junto con la migración de config de ESLint.
- **`react-router` / `react-router-dom`**: ya estamos en la última versión publicada (`7.18.1`); no hay un release que corrija los avisos abiertos. Ver detalle abajo.

#### Sobre los avisos de `react-router` sin fix disponible

`npm audit` reporta varios CVEs contra `react-router` (RCE en deserialización de `turbo-stream`, XSS en RSC, DoS en manifest/route-matching, CSRF en RSC, etc.). Ya estamos en la versión más nueva publicada y **no hay upgrade disponible que los corrija** todavía.

Lo importante: **la gran mayoría de estos avisos aplican a modos que esta app no usa** — Server-Side Rendering (SSR), React Server Components (RSC), el modo `unstable_middleware`/`single-fetch` de un server de React Router, o el endpoint `__manifest`. Este proyecto es un **SPA 100% client-side** servido como archivos estáticos (Vite build, `BrowserRouter`, sin server de React Router ni RSC) — esa superficie no existe acá.

La única excepción que sí nos toca en un SPA es el **open redirect vía path `//` o `/\`** (`GHSA-2j2x-hqr9-3h42`, `GHSA-wrjc-x8rr-h8h6`): un `<Link>`/`navigate()` que reciba un path controlado por el usuario (por ejemplo `location.state.from.pathname` tras el login) y empiece con `//` o `/\` puede ser reinterpretado por el navegador como una URL absoluta a otro dominio.

**Mitigación aplicada manualmente** (no depende de la librería): `src/utils/safeRedirect.js` expone `isSafeInternalPath`/`getSafeRedirectPath`, que solo acepta paths que empiecen con `/` simple (rechaza `//` y `/\`). Se usa en `Login.jsx` y `Register.jsx` para validar `location.state?.from?.pathname` antes de navegar; si no es un path interno seguro, redirige a `/dashboard`.

Acción de seguimiento: cuando React Router publique una versión que resuelva estos CVEs, correr `npm audit fix` de nuevo y evaluar si el helper de `safeRedirect.js` puede simplificarse o se mantiene como defensa en profundidad.

---

## 💳 PCI-DSS: datos de tarjeta en el Checkout

`CheckoutPage.jsx` captura `cardNumber`, `expiry` y `cvc` en un formulario propio (sección "3. DATOS DE PAGO"). Eso es aceptable **solo** porque hoy el checkout es 100% mock: esos datos nunca salen del navegador ni tocan un backend real ni un log (ver corrección en `checkout.service.js` arriba: el log de la transacción simulada ya no incluye `paymentData` completo).

**En cuanto se conecte una pasarela de pago real, este formulario no puede usarse tal cual.** El motivo es PCI-DSS, el estándar de seguridad de datos de tarjetas: apenas un número de tarjeta pasa por código propio — aunque sea solo para reenviarlo a Stripe o MercadoPago — la infraestructura entra en el "alcance" (scope) de PCI-DSS. Eso implica cuestionarios SAQ, requisitos de segmentación de red, logging auditado, etc. — carga de compliance que no tiene sentido para un proyecto de este tamaño, y que además es fácil de evitar.

**Solución correcta:** usar los widgets embebidos del procesador de pago, donde los campos de tarjeta son iframes que controla el procesador, no nuestro código:

- **MercadoPago Checkout Pro** (o Checkout API con Secure Fields) — recomendado acá porque Argentina es el mercado principal de la app.
- **Stripe Elements** — alternativa si en algún momento hace falta cobrar en otras monedas/mercados.

En ambos casos el número de tarjeta viaja directo del navegador del usuario al procesador de pago; nuestro frontend nunca lo ve, y nuestro backend solo recibe un token/ID de pago ya tokenizado. Eso deja a la app en el nivel de compliance más bajo (SAQ A) en vez del más exigente.

Hay un comentario de advertencia en el propio código, arriba de la sección "3. DATOS DE PAGO" en `CheckoutPage.jsx`, para que nadie conecte ese formulario a un backend real sin antes reemplazarlo por Checkout Pro / Stripe Elements.

---

## 🔴 Pendiente antes de salir a producción

Esto no se puede resolver desde el frontend — requiere backend:

| # | Tema | Qué hacer |
|---|---|---|
| 1 | **Autenticación real** | Backend que valide email + contraseña con hash (bcrypt o argon2). Nunca guardar contraseñas en texto plano. |
| 2 | **Sesión en cookie httpOnly** | Hoy la sesión vive en `localStorage`, accesible por JavaScript (vulnerable a XSS). Una cookie `httpOnly` + `Secure` + `SameSite=Lax` no es legible por JS. Ya dejé `withCredentials: true` en axios para esto. |
| 3 | **Autorización en el servidor** | `ProtectedRoute` solo mejora la UX: el usuario puede editar su plan en localStorage y entrar igual. **Cada endpoint del backend debe re-verificar** el plan y el rol. |
| 4 | **Rate limiting** | Límite de intentos de login para frenar fuerza bruta. |
| 5 | **HTTPS** | Obligatorio en producción. Vercel y Netlify lo dan gratis. |
| 6 | **Validar en el backend** | Ya usás zod en el front (bien), pero el backend debe validar de nuevo: el cliente es manipulable. |
| 7 | **CORS** | Configurar el backend para aceptar solo tu dominio. Con `withCredentials: true`, no puede usar `Access-Control-Allow-Origin: *` — necesita el origen exacto. |
| 8 | **Headers de seguridad** | `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`. Se configuran en el hosting. |

---

## 🔑 Sobre las API keys de tus usuarios

Tenés una página `/api-keys` donde los usuarios gestionan sus claves. Reglas para cuando la conectes al backend:

- La clave se muestra **una sola vez**, al crearla. Después nunca más.
- En la base de datos guardás solo el **hash**, jamás la clave en texto plano (mismo criterio que una contraseña).
- Se muestra un prefijo para identificarla: `mk_live_a4f2…`
- El usuario debe poder **revocarla** en cualquier momento.
- Registrá fecha de creación y último uso, para detectar actividad rara.

---

## 🛡️ Hábitos que te van a ahorrar disgustos

1. **Nunca commitear `.env`.** Ya está protegido, pero revisá antes de cada push.
2. **Si filtrás una clave, rotala.** Borrarla del código no alcanza: queda en el historial de Git para siempre. Hay que generar una nueva y anular la vieja.
3. **`npm audit`** de vez en cuando, para vulnerabilidades en dependencias.
4. **Activá 2FA en GitHub** (ambos).
5. **Nada de datos sensibles en `console.log`** — quedan visibles en la consola del navegador en producción.
6. **Revisá los PRs.** Cuatro ojos ven más que dos, sobre todo en código que toca auth o pagos.

---

## ✅ Checklist de ciberseguridad — estado actual

Foto del estado de seguridad, organizada por quién es responsable de resolver cada ítem.

### Cubierto (frontend, ya resuelto)

- [x] `.env` protegido en `.gitignore`; `env.example` documentado sin secretos.
- [x] Sin token placeholder falso en el cliente HTTP (`api.client.js`).
- [x] `IS_MOCK_MODE` respeta `VITE_USE_MOCKS` (no queda forzado a `true`).
- [x] `ProtectedRoute` usa `allowedPlans`/`redirectPath` correctamente (bug de autorización corregido).
- [x] Open redirect en login/register mitigado (`src/utils/safeRedirect.js`).
- [x] Dependencias actualizadas con `npm audit fix` (sin `--force`); lo que queda pendiente está documentado arriba, con motivo.
- [x] Sin logs de datos de tarjeta ni de otros datos sensibles en `console.*` (`checkout.service.js`, revisado el resto del código en busca de logs similares).
- [x] CI (`.github/workflows/ci.yml`) corre lint y build en cada push/PR, y reporta —sin bloquear— vulnerabilidades de dependencias en cada corrida (`npm audit --omit=dev --audit-level=high`).
- [x] Riesgo de captura de tarjeta propia (PCI-DSS) documentado y marcado en el código (ver sección arriba).

### Depende del hosting (Vercel/Netlify/Nginx, etc.) — no se configura desde el código de React

- [ ] **CSP** (`Content-Security-Policy`): restringe de qué orígenes se puede cargar script/estilos/conexiones. Se define como header HTTP en el hosting, no en el bundle de Vite.
- [ ] **HSTS** (`Strict-Transport-Security`): fuerza HTTPS en el navegador. También es un header HTTP del hosting (Vercel/Netlify lo agregan por defecto en varios casos, pero conviene verificarlo explícitamente).
- [ ] **X-Frame-Options** (o `frame-ancestors` en la CSP): evita que el sitio se pueda embeber en un iframe ajeno (clickjacking).
- [ ] **X-Content-Type-Options: nosniff**: evita que el navegador "adivine" el tipo de contenido de una respuesta y ejecute algo que no debería.

Ninguno de estos cuatro depende de código React: se configuran en `vercel.json`, `netlify.toml`, o la config del servidor/CDN que sirva el build estático. Queda pendiente definirlos según qué hosting se use en producción.

### Depende del backend (todavía no existe)

- [ ] Autenticación real (hash de contraseña con bcrypt/argon2; hoy el mock no valida password).
- [ ] Sesión en cookie `httpOnly` + `Secure` + `SameSite=Lax` en vez de `localStorage`.
- [ ] Autorización re-verificada en cada endpoint (`ProtectedRoute` es solo UX, no seguridad real).
- [ ] Rate limiting en login, para frenar fuerza bruta.
- [ ] CORS restringido al dominio propio (recordar: con `withCredentials: true` no se puede usar `Access-Control-Allow-Origin: *`).
- [ ] Validación de inputs repetida server-side (zod en el cliente no alcanza; el cliente es manipulable).
- [ ] Tokenización de pagos vía MercadoPago/Stripe (ver sección PCI-DSS arriba) — el backend nunca debe recibir `cardNumber`/`cvc` en texto plano, ni loguearlos.

---

## Resumen honesto

El frontend quedó **prolijo y sin los agujeros que dependían de él**. Pero la seguridad real de la aplicación se juega en el backend, que todavía no existe: hoy la app funciona con datos simulados en el navegador.

Mientras sea un prototipo con mocks no hay riesgo real — no hay datos de usuarios ni dinero en juego. El momento crítico es **cuando conectes usuarios reales o pagos**: ahí la lista de pendientes de arriba deja de ser opcional.
