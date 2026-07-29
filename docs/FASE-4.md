# Fase 4 — La Caja Registradora: camino de ejecución

Documento de trabajo. Deriva de `Operacion-Restaurante-Financiero-v2.docx` (Fase 4) y de
`ESTADO-PROYECTO.md` al 28/7/2026. Destino sugerido en el repo: `docs/FASE-4.md`.

**Estado**: los tres portones de seguridad quedaron resueltos el 28/7. Se arranca por F4-1.

---

## 1. Tres hallazgos que cambian el orden del roadmap

### 1.1 El dominio no bloquea el arranque de la Fase 4

Con credenciales de producción de MercadoPago ya activas y CUIT verificado, el bloqueante
del dominio es más chico de lo que parecía. De la Fase 4, el dominio bloquea **sólo dos
cosas**: el comprobante de pago por mail, y el reemplazo del 409 de `/auth/register`.

Todo lo demás —preferencia, webhook, firma, idempotencia, órdenes, otorgamiento de acceso,
cupones— se construye y se prueba sin dominio. Consecuencia práctica: el dominio deja de ser
un bloqueante en serie y pasa a ser un **camino paralelo**. Se compra mientras se programa.

Lo que sí hace falta para recibir webhooks reales de sandbox no es un dominio sino un **túnel
público** hacia `localhost:8000` (`cloudflared` o `ngrok`). Son dos comandos, no un trámite.

### 1.2 Falta un prerrequisito que el roadmap no lista: el catálogo

El roadmap dice, correctamente, que *"el precio lo lee el servidor de la base por ID de curso"*,
y su MISIÓN CUMPLIDA exige que *"el curso aparece en `purchasedCourses` del usuario"*.

Pero según `ESTADO-PROYECTO.md`, los modelos que existen hoy son `user`, `user_session`,
`auth_token` y `auth_event`. **No hay tabla de cursos ni tabla de compras.** Y el contrato de
`GET /auth/me` devuelve `purchasedCourses: []` fijo, a propósito, porque *"los modelos de cursos
y progreso llegan en una fase posterior"*.

Es decir: la Fase 4 tal como está escrita no se puede terminar sin traer una parte del catálogo
desde la fase posterior. No es un error del roadmap, es una dependencia que quedó implícita.

> **Confirmar antes de actuar** (regla: verificar contra el archivo, no contra el reporte):
> ```bash
> ls backend/app/models/
> cd backend && set -a && . ./.env && set +a
> docker compose exec -T db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "\dt"
> ```
> Si aparecen tablas de cursos u órdenes, este hallazgo se cae y hay que rehacer el plan.

El alcance mínimo de ese adelanto es chico y está acotado: `courses` (con precio) y
`purchases` (quién compró qué). **No** entran `lessons`, ni progreso, ni el reproductor. Eso
sigue en la fase posterior.

### 1.3 El TOCTOU y la enumeración tocan las mismas cinco líneas

Las dos deudas anotadas sobre `POST /auth/register` son la misma región de código:

- **TOCTOU**: envolver el `INSERT` en `try/except IntegrityError` para devolver 409 en vez de 500.
- **Enumeración**: el 409 revela qué emails tienen cuenta; ocultarlo requiere poder mandar mails.

Si se arregla el TOCTOU escribiendo `raise HTTPException(409)` en dos lugares distintos —la rama
del `SELECT` y la del `except`— después hay que tocar los dos para cambiarlo. La forma de
escribirlo hoy que no obliga a reescribirlo mañana es **una sola salida compartida**: las dos
ramas llaman a la misma función, y el día que el 409 se convierta en otra cosa se cambia en un
solo lugar.

---

## 2. Los tres portones de seguridad — resueltos el 28/7/2026

### Portón A — Verificación del webhook: **las dos capas** ✅

La firma primero, la re-consulta después. La firma frena la basura sin tocar la red; la
re-consulta contra la API de MercadoPago es la fuente autoritativa, y es el flujo que el propio
proveedor recomienda: la notificación trae el ID, el estado se consulta. Una llamada de red por
webhook legítimo es irrelevante a este volumen.

**Regla dura para F4-5**: del payload se toma **únicamente el ID**. El monto y el estado que se
guardan salen de la re-consulta, nunca del mensaje.

**Prueba de mutación en dos capas separadas**: romper la validación de firma y romper la
re-consulta tienen que hacer caer *tests distintos*. Si al romper una sola caen todos, las capas
no están realmente separadas y una de las dos no está probada.

### Portón B — El 409 de `/auth/register`: **arreglar el TOCTOU ahora** ✅

El 500 por carrera está vivo hoy y el arreglo es chico. La enumeración no empeora: el 409 ya
existe y ya está anotada como deuda; su solución real espera al dominio y a los mails. Cambiar
el contrato sin poder mandar mails no tiene respuesta buena.

Se escribe con **salida compartida** entre la rama del `SELECT` y la del `except`, de modo que
el día que el 409 cambie se toque un solo lugar. F4-1 se abre ya.

### Portón C — Botón de arrepentimiento: **la columna va en F4-4; el formulario se decide con abogado** ✅

Las dos opciones que dejaban la puerta abierta coincidían en la columna, y la única que la omitía
era la única con riesgo legal señalado. Agregarla ahora es una línea en el modelo; agregarla
después es una migración sobre datos reales.

**Especificación de la columna**: código aleatorio de alta entropía, con el mismo generador que
los tokens de autenticación (`secrets`), con índice único. El formulario del futuro pedirá
**código + email como par**, nunca el código solo.

**Anotado como consulta legal previa a vender**, con este matiz para el abogado: el CCyC
(art. 1116) tiene excepciones a la revocación para contenido digital ya consumido —un curso
empezado podría estar exceptuado del reembolso—, pero el botón de la Res. 424/2020 tiene que
existir igual. Es pregunta para abogado, no para nosotros.

---

## 3. La secuencia de PRs

Un PR = un propósito. Cada uno se abre en su rama, se revisa con `git diff` **y**
`git status --short`, y no se mergea sin los checks en verde.

### Bloque 0 — Despejar la mesa

**F4-1 · TOCTOU en `POST /auth/register`** — *listo para arrancar*
Envolver el `INSERT` en `try/except IntegrityError`, con las dos ramas —la del `SELECT` previo
y la del `except`— saliendo por la misma función. Test nuevo: forzar el `IntegrityError` de
forma determinista y verificar que la respuesta es idéntica a la del camino con `SELECT`.

**F4-2 · Patrón de `.claude/settings.json`**
Independiente. No es código de la aplicación; salió solo. La vía del `allow` no funciona:
no se puede afinar el patrón para que bloquee los `.env` reales pero no `env.example`, porque
en este esquema de permisos `deny` le gana a `allow` siempre. La solución fue sacar las
plantillas del espacio de nombres de los secretos: se renombraron `.env.example` y
`backend/.env.example` a `env.example`. Aparte, el deny de `Read(.env)`/`Read(.env.*)` no
cubría la herramienta `Write`, así que se cerró ese hueco de escritura agregando
`Edit(.env)` y `Edit(.env.*)`. Se aprovechó para consolidar los cinco patrones del
`.gitignore` (`.env`, `.env.local`, `.env.*.local`, `.env.development`, `.env.production`)
en uno solo, `.env*`. Verificación: Claude Code puede editar `env.example` y no puede editar
`.env`.

### Bloque 1 — El catálogo, mínimo indispensable

**F4-3 · Modelos `Course` y `Purchase` + migración + carga del catálogo**
Prerrequisito real de todo lo demás (§1.2).
- `courses`: id, slug, título, **precio como `Numeric`, nunca `float`** —los binarios de punto
  flotante no representan exacto los decimales, y en dinero eso es plata que no cierra—,
  moneda `ARS`, activo sí/no.
- `purchases`: qué usuario compró qué curso, cuándo, y con qué orden. Único por
  (usuario, curso), impuesto por la base y no sólo por el código.
- Los precios se cargan desde los datos que ya existen en el frontend. El frontend deja de ser
  la fuente de verdad del precio: pasa a serlo la base.
- `GET /auth/me` empieza a devolver `purchasedCourses` de verdad. **El test que compara el
  conjunto completo de claves del contrato tiene que seguir pasando sin tocarlo.**

### Bloque 2 — La caja

**F4-4 · Modelo `Order` + `POST /checkout`**
- `orders`: estados `pending` / `paid` / `failed` / `refunded`, impuestos por un `CHECK`.
  Columna para el ID de pago del proveedor con índice **único** —ahí vive la idempotencia, y
  la garantía tiene que estar en la base, no en un `if`—. Monto en `Numeric`.
- **Columna del código público de arrepentimiento** (Portón C): aleatorio de alta entropía vía
  `secrets`, índice único.
- `POST /checkout` crea la orden en `pending` y genera la preferencia de MercadoPago. **El
  precio lo lee de `courses` por ID.** Lo que viene en el request es qué se compra, nunca cuánto sale.
- Test obligatorio: un request con un precio manipulado genera la preferencia con el precio real.

**F4-5 · El webhook**
Según el Portón A: firma primero, re-consulta después.
- Del payload se toma sólo el ID. Monto y estado salen de la re-consulta.
- Idempotencia: buscar la orden por el ID de pago del proveedor; si ya está `paid`, responder
  200 y no hacer nada. Test: el mismo webhook dos veces = un solo otorgamiento, sin error.
- Test: webhook con firma inválida → rechazado antes de salir a la red, la orden **no** pasa a `paid`.
- Test: firma válida pero el pago no existe al re-consultar → la orden **no** pasa a `paid`.
- Prueba de mutación en dos capas: romper la firma y romper la re-consulta hacen caer tests distintos.
- El otorgamiento de acceso escribe en `purchases`. Es lo único que lo escribe.

**F4-6 · `GET /orders/{id}` y el estado post-pago**
- **Control de acceso a nivel de objeto**: la orden tiene que pertenecer al usuario de la sesión.
  Se responde **404, no 403**, para no revelar que la orden existe. Tests espejo obligatorios:
  el dueño la ve (200) y otro usuario recibe 404. Un endpoint que devuelve cualquier orden a
  cualquiera es una fuga de datos de compra, y es de las cosas que pasan todos los tests
  positivos sin que nadie se entere.
- La orden en `pending` no es un error: es "estamos confirmando tu pago". El backend expone el
  estado y la página de retorno lo dice así.
- **Deuda aceptada y anotada**: falta el job que re-consulte órdenes `pending` viejas, porque hay
  webhooks que directamente no llegan. Se resuelve con **APScheduler**, que ya entra en la Fase 5
  del roadmap — no hace falta infraestructura nueva. Único detalle a tener presente: con varios
  workers de uvicorn, APScheduler corre el job una vez por worker; se evita con un *advisory
  lock* de Postgres, que ya está puesto.

### Bloque 3 — Cerrar el circuito

**F4-7 · Reemplazo de `CheckoutPage.jsx`**
Hoy captura número de tarjeta, vencimiento y CVC en formulario propio: eso es alcance PCI-DSS.
Conviene notar que **la parte que elimina el riesgo es una borrada**, y no depende de nada:
sacar esos campos se puede hacer cuando se quiera. Construir el redirect a Checkout Pro sí
conviene hacerlo después de F4-5, cuando ya se sabe exactamente qué devuelve el backend.
Gate duro: esto **no puede llegar a producción**. Va al checklist de la Fase 8.

**F4-8 · Cupones**
`GET /coupons/{code}` y validación en el backend al construir la preferencia: vencimiento,
límite de usos, a qué cursos aplica. La del frontend es sólo comodidad visual.
Por el espejo negativo/positivo: por cada test que prueba que un cupón vencido se rechaza,
uno que pruebe que un cupón válido se aplica y baja el monto de la preferencia.

**F4-9 · Comprobante de pago por mail**
Bloqueado por el dominio. Se dispara desde el webhook confirmado, nunca desde la redirección.
Al llegar acá, los cuatro flujos de correo de la Fase 3 dejan de escribirse en el log.

**Prerrequisito**: `PUBLIC_BASE_URL` pasa a ser obligatoria, sin valor por defecto. Hoy
`config.py` la define con default `http://localhost:8000`; mientras no haya proveedor de mail
es inofensivo, pero el día que se conecte el dominio, el primer mail de verificación sale con
un link a `localhost`. Alcance: sacar el default de `config.py` (conservando el comentario sobre
Host Header Injection, que explica por qué no se usa el header `Host`), agregar la variable a
`env.example` con el valor de desarrollo, y un test que afirme que sin la variable falla la
construcción de `Settings` — afirmando sobre el `loc` del error, que tiene que decir
`public_base_url`. Afirmar sobre el tipo `ValidationError` no sirve: se satisface con cualquier
campo obligatorio faltante.

### Fuera de la secuencia, en paralelo

- **Dominio `monitoreco`**: verificar disponibilidad, comprar, configurar SPF y DKIM.
  Desbloquea F4-9, el reemplazo del 409, y `EMAIL_VERIFICATION_REQUIRED=true`.
- **Túnel público** (`cloudflared` / `ngrok`) para recibir webhooks reales de sandbox. Hace
  falta a partir de F4-5.
- **Convertir el roadmap a `docs/ROADMAP.md`** y commitearlo, para que deje de vivir afuera del repo.
- **Consulta legal** sobre el botón de arrepentimiento (Portón C), con el matiz del CCyC art. 1116.
- **Limpieza de `planes.js`**: features prometidas que no existen (API real-time, soporte 24/7
  por WhatsApp, whitelabel), el precio visible que convive con "Contactar Ventas", y los
  comentarios de generación sin resolver. No urgente para la Fase 4 —los planes no se cobran en
  esta fase— pero es publicidad de algo que no existe, y eso tiene consecuencias en Argentina.

---

## 4. Lo que verifico antes de escribir código de MercadoPago

Regla de la casa, y la que evitó el bug del orden de argumentos de `pwdlib.verify`: la API real
de la librería se verifica antes de escribir, no se escribe de memoria.

Antes de F4-4 y F4-5 hay que confirmar contra la fuente, no contra una página que puede estar
cacheada: el nombre y la versión del SDK de Python, cómo se construye una preferencia y qué
devuelve, el nombre exacto del header de firma y el algoritmo con que se calcula, y la forma
del payload de notificación. Nada de eso se escribe hasta haberlo mirado.

---

## 5. MISIÓN CUMPLIDA de la Fase 4

Del roadmap, más lo que salió de este análisis:

1. Una compra de prueba en sandbox recorre el ciclo completo: checkout, pago, webhook, orden en
   `paid`, y el curso aparece en `purchasedCourses` del usuario.
2. Un webhook con firma inválida —o cuyo pago no existe al re-consultar— es rechazado y la orden
   **no** pasa a `paid`.
3. El mismo webhook entregado dos veces produce un solo otorgamiento y ningún error.
4. Un checkout con precio manipulado desde el cliente genera la preferencia con el precio real
   leído de la base.
5. **Agregado**: `CheckoutPage.jsx` ya no captura datos de tarjeta.
6. **Agregado**: `GET /orders/{id}` devuelve 404 —no 403— a un usuario que no es el dueño, y hay
   un test espejo que prueba que el dueño sí la ve.
7. **Agregado**: prueba de mutación sobre las **dos capas** de verificación del webhook, por
   separado. Romper la firma y romper la re-consulta tienen que hacer caer tests distintos.
   "52 passed" no prueba nada por sí solo.
