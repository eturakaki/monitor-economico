# Fase 4 — La Caja Registradora: camino de ejecución

Documento de trabajo. Deriva de `Operacion-Restaurante-Financiero-v2.docx` (Fase 4) y de
`ESTADO-PROYECTO.md` al 28/7/2026. Destino sugerido en el repo: `docs/FASE-4.md`.

**Estado**: los tres portones de seguridad quedaron resueltos el 28/7. F4-1, F4-2 y
F4-3 están cerrados. Sigue F4-4a.

Modelo de negocio decidido: ver `docs/MODELO-NEGOCIO.md` (planes = datos + IA;
Academia = cursos sueltos).

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

### Portón C — Botón de arrepentimiento: **la columna va en F4-4a; el formulario se decide con abogado** ✅

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

**F4-3 · Modelos `Course` y `Purchase` + migración**
Prerrequisito real de todo lo demás (§1.2). No hay catálogo que migrar: toda la data de
`src/data/**` del frontend es utilería de maqueta, no un inventario real. `courses` nace vacía
en producción; los datos de desarrollo y test son fixtures inequívocamente falsas
(`course_test_uno`), no un seed que pueda filtrarse a producción.
- `courses`: `id` (el slug estable, un solo campo — no `id` y `slug` por separado), título,
  descripción, **precio como `Numeric`, nunca `float`** —los binarios de punto flotante no
  representan exacto los decimales, y en dinero eso es plata que no cierra—, moneda `ARS`,
  activo sí/no. Sin `estudiantes` ni `rating`: son números inventados de la maqueta, y un número
  fabricado servido por una API es una medición falsa.
- `purchases`: qué usuario compró qué curso y cuándo. Único por (usuario, curso), impuesto por
  la base y no sólo por el código. Nace sin `order_id`: la tabla `orders` llega en F4-4a y ahí se
  agregan la columna y la FK.
- `GET /auth/me` empieza a devolver `purchasedCourses` de verdad. **El test que compara el
  conjunto completo de claves del contrato tiene que seguir pasando sin tocarlo.**

### Bloque 2 — La caja

> **F4-4 se partió en dos** (decisiones completas en §6). Contradice cómo estaba escrito
> este documento hasta ahora, pero un PR = un propósito, y el esquema de base y la
> integración con un tercero de pagos son dos propósitos distintos. El paso de
> verificación de MercadoPago (§7) **no es un PR** — no lleva rama, no produce código, su
> salida es conocimiento — y va **antes** de F4-4a: tres de sus cinco respuestas fijan
> columnas del esquema.

**F4-4a · Modelos `Order` y `OrderItem` + `POST /checkout`**
Esquema completo, checkout contra una interfaz de proveedor de pagos con implementación
falsa. El test del precio manipulado se prueba entero acá, sin salir a la red. Detalle
de diseño en §6.

**F4-4b · Integración real de MercadoPago**
El SDK (o `httpx` a mano, decisión de este PR con la API a la vista), credenciales y
llamadas reales.

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
- **Limpieza de `planes.js` y `cursos.js`**: los dos muestran cosas que no existen.
  `planes.js` promete features inexistentes (API real-time, soporte 24/7 por
  WhatsApp, whitelabel), tiene el precio visible conviviendo con "Contactar Ventas",
  y comentarios de generación sin resolver. `cursos.js` tiene `estudiantes` y
  `rating` inventados: cifras de maqueta que nunca fueron reales, presentadas como
  si fueran medición. El plazo es el mismo para los dos y no es esta fase: el
  despliegue (Fase 8), que es el primer momento en que una persona real puede
  verlas. Hasta entonces todo corre en local y sobre mocks. El lugar práctico para
  hacerlo es el PR de frontend de F4-7, que ya toca esa zona.

---

## 4. Lo que verifico antes de escribir código de MercadoPago

Regla de la casa, y la que evitó el bug del orden de argumentos de `pwdlib.verify`: la API real
de la librería se verifica antes de escribir, no se escribe de memoria.

Antes de F4-4a y F4-5 hay que confirmar contra la fuente, no contra una página que puede estar
cacheada: el nombre y la versión del SDK de Python, cómo se construye una preferencia y qué
devuelve, el nombre exacto del header de firma y el algoritmo con que se calcula, y la forma
del payload de notificación. Nada de eso se escribe hasta haberlo mirado.

Lista concreta de qué se verifica y en qué orden: §7.

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

---

## 6. Decisiones de diseño de F4-4 (29/07/2026)

Estas decisiones se tomaron en conversación de diseño y se registran acá porque una decisión
que no está en el repo no existe. No rediscutir sin motivo nuevo.

### 6.1 — Alcance

- El regalo de cursos **no** entra en la Fase 4, y no se le reserva lugar en el esquema. El
  concepto ya está soportado por la separación existente: `orders` dice quién pagó, `purchases`
  dice quién accede. El día que se implemente, un `recipient_user_id` nullable es una migración
  aditiva barata. Lo que falta es el flujo (email del destinatario, qué pasa si no tiene
  cuenta), y eso es otro propósito y otro PR.
- Una orden sólo puede contener **cursos**. Los planes son suscripción y son capa posterior a
  la Fase 4. Los libros no están decididos: si son físicos cambian el modelo entero (cantidad,
  stock, envío).
- **Multi-ítem**: `orders` + `order_items`, no un curso por orden. Motivos: el frontend ya tiene
  carrito (`cartService`, `ShopProvider`, `CheckoutPage`); el contrato de la API dice
  `createOrder(items, total)`, en plural; y agregar `order_items` después sería una migración
  sobre órdenes reales más reescribir checkout y webhook.

### 6.2 — Esquema

Tipos verificados contra la base real el 29/7, no contra los modelos: `users.id varchar(32)`,
`courses.id varchar(64)`, `price numeric(12,2)`. Patrón de id de la casa: `prefijo_ +
uuid4().hex[:12]`. Convención de nombres leída de la base: los `CHECK` y los `UNIQUE` se
nombran a mano (`ck_courses_currency`, `uq_purchases_user_course`), las FK se dejan con el
default de Postgres (`purchases_user_id_fkey`). `base.py` es un `DeclarativeBase` pelado, sin
`naming_convention`.

```
orders
  id                   String(32), PK, "ord_" + uuid4().hex[:12]
  user_id              String(32), NULLABLE, FK users ON DELETE SET NULL
  status               String(16), default 'pending'
  total                Numeric(12,2), anotado Mapped[Decimal]
  currency             String(3), CHECK IN ('ARS')
  cancellation_code    String(64), NOT NULL, UNIQUE
  provider_payment_id  String(?), NULLABLE, UNIQUE   <- largo pendiente de §7
  created_at / updated_at
```

- `user_id` es nullable **por el borrado de cuenta**, no porque exista checkout anónimo. Dejarlo
  escrito en el docstring del modelo: un lector futuro va a leer "nullable" como "se puede
  comprar sin cuenta". Efecto lateral bueno: en F4-6 el control de acceso compara
  `order.user_id` contra el usuario de la sesión, y `NULL` no matchea nada, así que una orden
  huérfana devuelve 404 por construcción.
- `provider_payment_id` nullable **y** `UNIQUE` no es contradictorio: Postgres permite múltiples
  `NULL` en un índice único. Todas las órdenes `pending` conviven sin chocar, y en cuanto el
  webhook escribe el ID la base impide que una segunda orden reclame el mismo pago. Ahí vive la
  idempotencia, impuesta por la base y no por un `if`.
- `CHECK` de `status` con **seis** valores: `'pending'`, `'paid'`, `'failed'`, `'refunded'`,
  `'expired'`, `'partially_refunded'`. Los dos últimos no se construyen hoy. Están para no pagar
  dos migraciones futuras sobre una tabla con plata adentro — ya se pagaron dos por el `CHECK`
  de `auth_events`.
  **Límite conocido de `partially_refunded`**: describe la orden pero no puede decir qué ítem se
  devolvió ni cuánto. Cuando la Fase 8 construya reembolsos de verdad (el botón de
  arrepentimiento los va a exigir), van a necesitar su propio registro. No pedirle al `CHECK`
  más de lo que puede.
- `cancellation_code` **en claro, no hasheado**. Los tokens de auth se hashean porque son
  credenciales que nadie debe leer; este hay que poder mostrárselo al usuario en el comprobante
  de F4-9, y un hash no se des-hashea. Generador: `secrets.token_urlsafe(32)`, el mismo de la
  casa. Se genera al **crear** la orden, no al pagarla: `NOT NULL` hace que la base garantice que
  toda orden tiene exactamente un código. La validez (que la orden esté `paid`) la va a exigir el
  formulario futuro. Existencia y validez son dos cosas y viven en dos lugares.

```
order_items
  id          String(32), PK, "oit_" + uuid4().hex[:12]
  order_id    String(32), FK orders ON DELETE CASCADE
  course_id   String(64), FK courses, SIN ondelete (NO ACTION)
  title       String(200)      <- snapshot
  unit_price  Numeric(12,2)    <- snapshot
  UNIQUE (order_id, course_id)
```

- El precio es **snapshot**: se lee de `courses` al crear la orden y ahí queda congelado. Si se
  leyera de `courses` al mostrar una orden vieja, cambiar el precio de un curso reescribiría la
  historia de lo que la gente pagó.
- El título también es snapshot, por el mismo argumento: una orden es un comprobante, y un
  comprobante dice qué se vendió con el nombre con el que se vendió.
- Sin columna `quantity`: un curso es acceso permanente, no una unidad.
- El `UNIQUE` impide el mismo curso dos veces en la misma orden, que sería cobrar el doble sin
  poder entregar el doble.

**`purchases` (modificación)**

```
  + order_id  String(32), NULLABLE, FK orders, SIN ondelete (NO ACTION)
```

- Sin `ondelete`: no se puede borrar una orden que otorgó acceso.
- Nullable porque el otorgamiento administrativo (cortesía, corrección a mano) no tiene orden
  detrás, y porque las filas que ya existen nacieron sin la columna.

**Índice único parcial**

```sql
CREATE UNIQUE INDEX uq_orders_una_pending_por_usuario
    ON orders (user_id) WHERE status = 'pending';
```

- Una sola orden `pending` por usuario, garantizada por Postgres.
- **No** se usa un `SELECT COUNT` antes del `INSERT`: eso es el mismo TOCTOU que F4-1 acaba de
  enterrar en `/auth/register`. Dos requests simultáneas cuentan lo mismo y las dos insertan. "No
  depende del worker" no es "no tiene race".
- **No** se puede usar `(user_id, course_id)`: `orders` es multi-ítem y los cursos viven en
  `order_items`. Un índice parcial es de una tabla y Postgres no tiene constraints únicos que
  crucen tablas. Denormalizar `status` dentro de `order_items` para poder indexarlo ahí queda
  descartado: una copia del estado que hay que sincronizar en cada transición del webhook se
  desincroniza justo en la fila que importa.
- Una sola `pending` por usuario no molesta porque el producto tiene carrito: el flujo real es
  "A y B en el carrito, un checkout", no dos checkouts en paralelo.

**Orden huérfana**: `SET NULL` a secas, sin denormalizar el email del comprador. La asimetría
decide: no guardarlo cuesta cero — según `MODELO-NEGOCIO.md` §7 no se puede vender hasta grabar
un curso —, guardarlo y arrepentirse es haber conservado datos personales de gente que pidió ser
borrada. Agregar la columna después es migración aditiva. Va a la consulta legal, que tiene
**dos** patas que tiran para lados opuestos: derecho de supresión (Ley 25.326) contra
conservación de datos del comprador por obligación fiscal (ARCA).

### 6.3 — `POST /checkout`

- Lleva `require_verified_email`. Verificado en `deps.py`: esa dependencia es **incondicional**,
  no mira `EMAIL_VERIFICATION_REQUIRED` (ese flag es el portón del login entero, otro portón).
  Consecuencia asumida: nadie compra hasta que exista proveedor de mail, porque hoy el link de
  verificación se escribe en el log. Se acepta porque F4-9 está dentro de esta fase y no se puede
  vender antes de grabar un curso. Sacar el portón "por ahora" sería fail-open en el endpoint
  donde se mueve plata.
- Hoy `require_verified_email` sólo tiene consumidor en `conftest.py`. `/checkout` la estrena en
  producción, así que van los **dos** tests espejo: el que prueba que sin verificar da 403 y el
  que prueba que verificando entra. Es el mismo agujero que destapó el PR #19 en `require_plan`.
- El precio lo lee de `courses` por ID. Lo que viene en el request es qué se compra, nunca cuánto
  sale.
- Carrito con un curso que el usuario **ya compró**: 409 al checkout **completo**, con la lista
  de `course_id` conflictivos en el cuerpo. No se filtra el ítem para cobrar el resto: el
  servidor manda sobre el precio y **no** manda sobre el contenido. Cambiar qué se compra sin que
  el usuario lo confirme es la clase de sorpresa que termina en disputa. El frontend corrige el
  carrito y reintenta. Virtud adicional: el 409 sale **antes** de crear la orden, así que no
  interactúa con el índice parcial ni con el reemplazo — el reintento es un checkout nuevo y
  limpio.
- Ese chequeo tiene ventana de carrera y **se acepta**. Ojo con la lección 17 del proyecto: acá el
  chequeo en código **no** es cortesía, es lo único que existe entre el usuario y el cobro. La
  constraint lo agarra igual, pero lo agarra después de cobrar. Se acepta porque para perder
  plata harían falta dos checkouts simultáneos del mismo usuario por el mismo curso **y** dos
  pagos completados, y el costo es un reembolso, no un agujero.
- Rate limit **por usuario**, no por IP: el endpoint ya exige sesión, así que el atacante está
  identificado antes de entrar. Es un lomo de burro para el ruido (un bug del frontend
  martillando el endpoint), no un candado: slowapi vive en memoria del proceso y con varios
  workers el límite es aproximado. El candado es el índice parcial.
- Carrito vacío, con `course_id` repetido, o con más de **20 ítems**: 400, antes de tocar
  `courses`. El límite es un techo de sentido común (nadie compra 20 cursos en un checkout), no
  un valor que dependa del catálogo.
- Si `create_preference` falla contra el proveedor: la orden recién creada pasa a `expired` y el
  endpoint devuelve 502. Una orden `pending` sin link de pago es un estado que miente y
  bloquearía el índice parcial sin representar nada.
- Los montos del cuerpo de la respuesta (`total`, y cualquier otro que se agregue) viajan como
  **string** en el JSON, no como número: un número JSON es coma flotante y reintroduciría el
  mismo bug que `Course.price: Mapped[Decimal]` acaba de sacar del modelo.

### 6.4 — Vencimiento y reemplazo

- La preferencia se crea con vencimiento de **24 horas**. El número no es técnico: es cuánto
  tiempo te comprometés a sostener un precio en Argentina. Sin esto, el link que quedó en una
  pestaña deja pagar el precio viejo tres semanas después, que es el mismo agujero que hizo
  rechazar la reutilización de órdenes `pending`, entrando por otra puerta. Vive en
  `settings.checkout_preference_ttl_hours` (default `24`): lleva default porque el número ya es
  la decisión escrita acá, no un valor que dependa del entorno.
- **De las dos piezas, sólo una es el guardarraíl.** Si la preferencia vence del lado de
  MercadoPago, esa orden no se puede pagar nunca y el precio viejo queda cerrado con o sin job.
  El estado `expired` local es **contabilidad**, no protección. Tratarlo como protección sería el
  error.
- Segundo checkout con una `pending` viva: **reemplazo, no reutilización**. En la misma
  transacción, la anterior pasa a `expired` y se crea una nueva al precio de hoy. Reutilizar
  devolvería el precio viejo, que es exactamente lo que el snapshot quiere evitar. Si dos
  checkouts corren en paralelo, uno gana y el otro recibe `IntegrityError` contra el índice
  parcial: se maneja con el mismo `try`/`except` de F4-1.
- Invalidar la preferencia vieja del lado de MercadoPago al reemplazar: **best-effort**, si la
  API lo permite (pregunta 4 de §7). Es una llamada de red que puede fallar y el checkout no
  puede depender de ella. La corrección viene de la política del webhook de 6.5; la invalidación
  es higiene.
  **Orden de operaciones**: primero se anula la preferencia vieja en el proveedor, después se
  crea la nueva. Al revés, si la creación de la preferencia nueva falla, la vieja queda sin
  anular y su link sigue vivo con el precio viejo, que es exactamente el agujero que el
  vencimiento vino a cerrar.
- El job que barre `pending` viejas **no** entra acá: queda en la deuda ya anotada de F4-6
  (APScheduler, que llega en la Fase 5, con el advisory lock de Postgres para que no corra una
  vez por worker).

### 6.5 — Consecuencias para F4-5 (decididas acá, aplican al webhook)

- `external_reference` = el id de la orden, mandado al crear la preferencia. **Se lee de la
  re-consulta, nunca del payload de la notificación.** Es el mismo campo, y de dónde se lee es la
  diferencia entre correlación y agujero: leerlo del mensaje dejaría que el atacante elija qué
  orden marcás como pagada. Es el Portón A aplicado al campo de correlación.
- **La idempotencia se llavea contra `provider_payment_id`, no contra el estado local de la
  orden.** Escribir `if order.status != "pending": return 200` parece idempotencia y es una
  alcancía rota: se come pagos reales. Una orden `expired` que recibe un pago aprobado **tiene**
  que pasar a `paid` y otorgar, porque la plata entró dentro de las 24 horas que se aceptó
  sostener. El estado local no es autoridad sobre nada; la autoridad es la re-consulta y el
  registro de qué pagos ya se procesaron. Único estado terminal: `refunded`, que nunca vuelve a
  `paid`.
- **El id del pago llega como número en el JSON de MercadoPago y se guarda como texto en
  `provider_payment_id`.** La conversión a `str()` tiene que hacerse **siempre**, tanto al
  escribir como al comparar. Si en algún punto se compara el texto guardado contra el número
  que viene del proveedor, no coinciden, y esa comparación es exactamente donde vive la
  idempotencia del webhook: un pago repetido se procesaría dos veces.
- **Acceso y plata se resuelven por separado.** Son dos preguntas distintas y tratarlas como una
  sola bloquea F4-5 sin motivo:
  - Acceso: determinístico. El otorgamiento recorre los ítems con `INSERT ... ON CONFLICT DO
    NOTHING` contra el `UNIQUE (user_id, course_id)` de `purchases`. El duplicado no revienta, no
    tira 500, no dispara reintentos de MercadoPago. El usuario termina con todos los cursos.
  - Plata: decisión de negocio, fuera del camino del pago. Con cero clientes se resuelve a mano.
    No hace falta columna ni rama.
- Consulta de detección del caso (textual, para no re-derivarla el día que aparezca; una consulta
  que nadie corre es una política que nadie ejecuta):

```sql
SELECT o.id AS orden, o.user_id, oi.course_id, oi.unit_price
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN purchases p
  ON p.user_id = o.user_id AND p.course_id = oi.course_id
WHERE o.status IN ('paid', 'partially_refunded')
  AND (p.order_id IS NULL OR p.order_id <> o.id);
```

  Devuelve los ítems que la orden cobró pero cuyo acceso vino de otro lado: candidatos a
  devolución.

### 6.6 — Herramienta de desarrollo

Subcomando `verificar-email` en `app.cli`, PR propio y **antes** de F4-4a, porque sin él cada
prueba manual del checkout choca contra el 403 y hay que ir a pescar el link al log del servidor
cada vez que se recrea la base. Frenos, no negociables: exige TTY real como `crear-admin`, y se
niega salvo que `settings.environment` sea **exactamente** `"development"`, escrito en positivo.
Con `!= "production"`, un `.env` que diga `prod` o `Production` deja el comando habilitado sin
que nadie se entere.

### 6.7 — Notas para los tests de F4-4a

- Todo test que ejercite un checkout exitoso tiene que crear el usuario con
  `email_verified_at` seteado. Si no, la suite entera devuelve 403 y se pierde una tarde
  buscándolo en el lugar equivocado.
- Los tests que creen varias órdenes van a chocar contra el índice único parcial: usuarios
  distintos por test, o expirar la anterior.
- Test obligatorio del roadmap: un request con precio manipulado desde el cliente genera la
  preferencia con el precio real leído de la base.

---

## 7. Paso de verificación de MercadoPago — cinco preguntas

No es un PR: no lleva rama y no produce código. Su salida es conocimiento y va antes de F4-4a,
porque tres de las cinco respuestas fijan columnas del esquema. Regla de §4 y lección 10: se
verifica contra la API o contra el paquete instalado, nunca contra una página que puede estar
cacheada.

1. Nombre y formato del campo de vencimiento de la preferencia.
2. Si `external_reference` vuelve en la re-consulta del pago.
3. Tipo y largo del ID de pago (fija el largo de `provider_payment_id`).
4. Si se puede invalidar una preferencia ya creada.
5. Si permite reembolsos parciales sobre un pago.

Orden: la 4 antes que la 5. Si se puede invalidar, la orden reemplazada casi no se puede pagar y
el escenario de la 5 pasa de probable a raro; si no se puede, es probable, porque el usuario que
reabre el checkout arma casi siempre el mismo carrito. La 5 hace falta igual para la Fase 8: el
botón de arrepentimiento implica devolver plata.

Estado del SDK al 29/7: paquete `mercadopago` 3.3.1, `requires_python >=3.10` (compatible con el
3.12.3 del proyecto), release del 24/07/2026 — está vivo. La decisión SDK contra `httpx` a mano
es de F4-4b, con la API a la vista. Falta mirar el último commit del repo en GitHub: hay
paquetes que publican releases automáticos sobre un repo muerto.

### 7.1 — Resultado (verificado el 29/7/2026)

Las cinco preguntas quedaron cerradas, verificadas contra la API real el 29/7/2026 con
cuentas de prueba.

1. **Vencimiento**: los campos son `expires` (booleano) y `expiration_date_to`, en ISO
   8601 con huso horario (`2026-07-30T23:59:59.000-03:00`). Aceptados y devueltos.
2. `external_reference` viaja de ida al crear la preferencia **y vuelve** al consultar
   el pago. Confirma el diseño de correlación de §6.5.
3. El id del pago es un **número entero de 12 dígitos** (ej. `171098070396`), no un
   string.
4. Se puede anular una preferencia ya creada con un `PUT` que le ponga una fecha de
   vencimiento pasada. MercadoPago responde `preference_expired: true`.
5. Se puede reembolsar parcialmente (`POST /v1/payments/{id}/refunds` con
   `{"amount": N}`), y MercadoPago devuelve su comisión en proporción a lo
   reembolsado. Esa llamada exige el header `X-Idempotency-Key`.

Observaciones del mismo ejercicio:

- `notification_url` es un campo de la **preferencia**, y en la prueba volvió en
  `null` porque no se mandó. F4-4b tiene que setearlo al crear la preferencia; si no,
  el webhook de F4-5 no llega a ningún lado.
- El pago trae además un objeto `order` con su propio id (`type: "mercadopago"`),
  distinto del id de la preferencia y del id del pago. Es un tercer identificador de
  MercadoPago que no usamos, anotado para que no sorprenda.
- Datos operativos de la verificación, para poder repetirla:
  - Se hizo con dos cuentas de prueba: vendedor `3573047103` y comprador
    `3573047111`.
  - Las cuentas de prueba adicionales **no** se pueden crear vía API con
    credenciales de test: devuelve `40311` `"caller.id must be a productive user"`.
    Se crean (y se listan, si ya existen) desde el panel de developers, sección
    Cuentas de prueba. Conviene mirar ahí primero: puede que ya estén creadas.
  - `live_mode` figura como `true` incluso operando entre cuentas de prueba, así que
    **no** sirve para saber si se está moviendo plata real. Lo que sí lo indica: la
    etiqueta `test_user` en los tags del cobrador, y que el email del pagador
    termine en `@testuser.com`.
