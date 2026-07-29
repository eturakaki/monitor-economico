# Operación Restaurante Financiero

Mapa de ruta para el backend de Monitor Económico — 8 fases · entregables verificables · sin saltear pasos.

> **QUÉ ES Y QUÉ NO ES ESTE DOCUMENTO**
> Este archivo es el plan **hacia adelante**. No describe el estado actual del proyecto ni el
> detalle de la fase en curso.
>
> | Pregunta | Archivo |
> |---|---|
> | ¿Qué hay construido hoy? | `ESTADO-PROYECTO.md` |
> | ¿Qué estamos haciendo ahora? | `docs/FASE-4.md` |
> | ¿Qué viene después? | este archivo |
>
> Un hecho, un lugar. Si el mismo dato vive en dos archivos, uno de los dos va a envejecer
> mal — y el que envejece mal es el que alguien lee y cree.

Última revisión: 28 de julio de 2026, con la Fase 3 cerrada y la Fase 4 en curso.

---

## Las reglas de la cocina

**Regla de avance.** No se pasa de fase hasta que la anterior tenga su sello de MISIÓN CUMPLIDA.
Un entregable verificado, funcionando, no "casi listo".

**Regla de alcance.** Cada fase entrega algo usable. Vale más una serie de datos funcionando de
punta a punta que un pipeline completo a medio hacer.

**Regla de seguridad.** El servidor nunca confía en el cliente. Rol, plan y permisos se validan
siempre del lado del backend, en cada request. Lo que decide el navegador es sugerencia; lo que
decide el servidor es verdad.

## La carta ya está escrita

Los servicios mock del frontend definen la API. Cada método en `src/services/**` es un endpoint
que el backend tiene que replicar con la misma forma de entrada y salida.

> **POR QUÉ IMPORTA**
> Si el backend respeta ese contrato, el día que se ponga `VITE_USE_MOCKS=false` la aplicación
> funciona sin tocar un solo componente. El contrato ya está diseñado — sólo hay que respetarlo.

**El contrato vigente, con la forma exacta de `GET /auth/me` y la tabla completa de endpoints con
su estado, vive en `ESTADO-PROYECTO.md`.** Acá no se repite a propósito: es el dato que más se
desactualiza, y tenerlo en dos lugares garantiza que uno mienta.

---

## Fases 1 a 3 — completadas

El detalle de lo que quedó construido, con versiones, decisiones de diseño y deuda anotada, está
en `ESTADO-PROYECTO.md`. Acá queda sólo el porqué del orden, que es lo que sigue siendo útil.

**FASE 1 — LA CIMENTACIÓN** ✅
*El búnker Linux.* Entorno de desarrollo dentro de WSL 2, con el repositorio en el disco Linux
nativo y no en `/mnt/c/` — ahí el rendimiento cae y aparecen problemas de mayúsculas y minúsculas.

**FASE 2 — LA HELADERA** ✅
*Base de datos híbrida.* PostgreSQL + TimescaleDB en Docker, con Alembic desde el día uno.
El esquema iba a cambiar muchas veces; sin migraciones, cada cambio significaba borrar la base.

**FASE 3 — EL PORTERO** ✅ *(cerrada el 28/7/2026)*
*API Core + Autenticación.* Era la fase crítica: hasta que cerró, el login del frontend aceptaba
cualquier email sin contraseña y `admin@monitoreco.com` tenía rol de administrador.

> ⚠️ **Ese agujero está cerrado.** Si encontrás en algún documento viejo la frase "hoy cualquier
> persona puede entrar como admin", describe el estado anterior al 28/7/2026 y ya no aplica. El
> login valida contraseña con Argon2id y la autorización la impone el backend en cada endpoint.

---

## FASE 4 — LA CAJA REGISTRADORA — **en curso**

*Pagos — cobrar de verdad*

Sin esta fase, el carrito, el checkout, los planes y las compras son una maqueta preciosa que no
factura.

**Se construye primero el pago único, aunque el destino sea la suscripción.** El webhook, la
idempotencia, la tabla de órdenes y el otorgamiento de acceso son idénticos en los dos modelos, y
son exactamente la parte donde se pierde plata si está mal. La recurrencia (el `POST /subscriptions`
del contrato) es una capa arriba de esa base: se agrega después, si el producto lo justifica.

Esto se decidió mirando el frontend real: los cursos ya prometen "acceso permanente" —compra
única—, mientras que los tres planes dicen `/mes`. La base de pago único se estrena con cursos sin
contradecir ninguna promesa hecha al usuario.

> **EL PLAN DE EJECUCIÓN VIVE EN `docs/FASE-4.md`**
> Ahí están la secuencia de nueve PRs, los tres portones de seguridad ya resueltos (verificación
> del webhook, el 409 de `/auth/register`, el botón de arrepentimiento), el prerrequisito del
> catálogo que este roadmap no había previsto, y la MISIÓN CUMPLIDA ampliada a siete puntos.
> Este archivo no lo repite.

Lo que sí queda acá, porque es principio de plan y no detalle de ejecución:

> **EL ACCESO LO OTORGA EL WEBHOOK VERIFICADO**
> El acceso se otorga únicamente cuando llega la notificación del proveedor y se verifica que es
> auténtica. Nunca porque el frontend diga "ya pagué" — el cliente es manipulable. Y tampoco por
> el contenido crudo del POST: el webhook es un endpoint público, y un `{"status": "paid"}`
> inventado que se acepte sin verificar es la misma puerta abierta, por el costado.

> **SOBRE LAS CREDENCIALES**
> Nunca poner claves de MercadoPago en variables `VITE_*`: todo lo que empieza con `VITE_` se
> incrusta en el bundle y queda público — cualquiera lo lee apretando F12. El Access Token vive
> únicamente en el `.env` del backend, que no se versiona. La Public Key sí puede ir al frontend:
> es pública por diseño.

---

## FASE 5 — EL PROVEEDOR AUTOMÁTICO

*Ingesta y ETL — llenar la heladera sola*

> **EMPEZAR CON UNA SOLA SERIE**
> El dólar, por ejemplo. Un endpoint funcionando de punta a punta vale más que un pipeline
> completo a medias. Una vez que el circuito funciona, replicarlo para las demás series es mecánico.

### Fuentes: priorizar las oficiales

| Fuente | Qué provee | Tipo |
|---|---|---|
| BCRA | Estadísticas cambiarias, tasas, reservas | API oficial |
| INDEC | IPC, EMAE, salarios | Series publicadas |
| APIs de cotizaciones | Dólar oficial, MEP, CCL, blue | API pública |
| Scraping | Sólo donde no exista alternativa | Último recurso |

> **SOBRE EL SCRAPING**
> Es frágil: se rompe cada vez que cambian el HTML, consume mantenimiento constante y tiene zona
> gris legal. Revisar términos de uso y `robots.txt` del sitio. Si hay API oficial, usarla siempre.

### Acciones

- Pandas para transformación y econometría, httpx para extracción
- Playwright/BeautifulSoup sólo para las páginas testarudas sin API
- Limpieza: normalizar fechas, estandarizar formatos, calcular variaciones
- Carga a Postgres con SQLAlchemy, usando hypertables de TimescaleDB
- APScheduler para el cron job (ej: todos los días a las 18:00)
- **Idempotencia:** si el job corre dos veces el mismo día, no debe duplicar filas
- **Logging y alertas:** si la fuente cambia de formato o se cae, hay que enterarse

> **HERENCIA DE LA FASE 4**
> Acá también entra el job que re-consulta contra la API las órdenes que quedaron en `pending`,
> porque hay webhooks que directamente no llegan. Mismo APScheduler, ninguna infraestructura
> nueva. Con varios workers de uvicorn el job corre una vez por worker: se evita con un *advisory
> lock* de Postgres.

> **MISIÓN CUMPLIDA**
> Se deja la PC sola y al volver hay filas nuevas de datos limpios con sus marcas de tiempo
> correctas. El endpoint `GET /indicadores/dolar` devuelve la serie.

---

## FASE 6 — EL CRÍTICO GASTRONÓMICO

*IA y análisis — de datos fríos a inteligencia*

Esta es la diferenciación del producto, no su cimiento. Por eso viene después de que el
restaurante ya funcione y facture.

### Acciones

- Integrar el SDK del proveedor de IA al backend
- Ingeniería de prompts: diseñar la personalidad de un analista financiero riguroso
- Lógica RAG: el backend extrae los datos recientes de SQL, los envía como contexto, y recibe el
  análisis escrito
- Endpoint `GET /analisis-mercado`

### Lo que suele olvidarse

- **Cachear el resultado.** Generar el análisis en cada visita es caro y lento. Uno por día alcanza.
- **Límite de gasto** configurado en la cuenta del proveedor.
- **La API key va en el backend.** Nunca en el frontend.
- **Disclaimer visible:** el análisis es informativo, no asesoramiento financiero. Relevante
  legalmente en Argentina.
- **Verificar los números.** El modelo puede alucinar cifras: las cantidades deben venir de la
  base de datos, no del texto generado.

> **MISIÓN CUMPLIDA**
> El endpoint devuelve un JSON con un análisis coherente y cacheado, basado en los datos reales
> de la última semana: *"La brecha cambiaria aumentó un 2%, lo que históricamente sugiere..."*

---

## FASE 7 — LA FACHADA

*Conexión frontend — la inauguración*

### Acciones

- CORS de FastAPI apuntando al origen exacto del frontend
- Poner `VITE_USE_MOCKS=false` y `VITE_API_URL` apuntando al backend real
- Reemplazar los servicios mock uno por uno, empezando por autenticación
- Estados de carga y mensajes de error: el backend puede caerse
- Verificar que los guards de `ProtectedRoute` coincidan con los del backend
- Retirar los usuarios de prueba del mock (`admin@`, `pro@`, `free@monitoreco.com`), que aceptan
  cualquier contraseña y no se migran al backend real

> **LA RECOMPENSA DEL CONTRATO**
> Si el contrato de la API se respetó desde el principio, esta fase es sorprendentemente corta.
> Ese es todo el propósito de haberlo definido al comienzo en lugar de improvisarlo.

> **MISIÓN CUMPLIDA**
> Se levanta la base de datos (Docker), el backend (FastAPI) y el frontend (Vite). Al abrir el
> navegador, los gráficos interactivos se alimentan de datos reales en vivo.

---

## FASE 8 — LA FRANQUICIA

*Despliegue — que funcione sin tu PC encendida*

| Componente | Opciones |
|---|---|
| Frontend | Vercel, Netlify (gratis, HTTPS incluido) |
| Backend | Railway, Render, Fly.io o un VPS barato |
| Base de datos | Postgres gestionado: Neon, Supabase, Railway |

### Checklist de producción

- HTTPS en todo (obligatorio para cookies `Secure`)
- Variables de entorno cargadas en el proveedor, nunca en el repositorio
- CORS restringido al dominio real
- Backups automáticos de la base — y probar que la restauración funciona
- Headers: `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`
- Monitoreo de errores (Sentry tiene plan gratuito)
- Rate limiting activo — con almacenamiento compartido, porque el de slowapi vive en memoria del
  proceso y con varios workers el límite es ficticio
- Revisar que ningún secreto haya quedado en el historial de Git

> **GATE DURO ANTES DE PRODUCCIÓN**
> `CheckoutPage.jsx` no puede llegar a producción capturando número de tarjeta y CVC en formulario
> propio. Eso es alcance PCI-DSS y se reemplaza en la Fase 4.

> **MISIÓN CUMPLIDA**
> Un link público funcionando 24/7 con HTTPS, que se puede compartir sin que la PC esté encendida.

---

## Qué cambió respecto del plan original

| Fase | En el plan original | Cambio |
|---|---|---|
| 1. La Cimentación | Fase 1 | Sin cambios |
| 2. La Heladera | Fase 2 | Se agrega Alembic |
| 3. El Portero | no existía | **Nueva — era la crítica** |
| 4. La Caja Registradora | no existía | **Nueva** |
| 5. El Proveedor | Fase 4 | Empezar con una sola serie |
| 6. El Crítico | Fase 5 | Se mueve después de auth y pagos |
| 7. La Fachada | Fase 6 | Sin cambios |
| 8. La Franquicia | Fase 7 | Se agrega checklist de producción |

**El razonamiento:** la autenticación y los pagos son lo que separa un prototipo de un producto.
La ingesta de datos y la IA son lo que lo hacen bueno. Primero hay que tener producto.

## Nota honesta sobre el alcance

Este roadmap completo es un proyecto grande para una persona. Dos observaciones que conviene
tener presentes:

**Se puede lanzar antes.** Con las fases 1 a 4 más un deploy básico ya hay una plataforma que
cobra cursos y da acceso a lo comprado. Las 44 calculadoras funcionan sin backend: hacen la
matemática en el navegador. Eso solo ya es un producto vendible. La suscripción a los planes es
la capa siguiente, no un requisito para lanzar.

**Los datos y la IA pueden venir después,** con usuarios reales diciendo qué necesitan.
Construirlos antes es adivinar.

---

## Los planes escritos envejecen

Este documento ya se equivocó una vez, y conviene dejarlo anotado en lugar de disimularlo:

- Pedía **Node.js 20 LTS**, que llegó a EOL el 30/04/2026. Se instaló 24.18.0.
- Pedía **passlib** para el hash de contraseñas; está sin mantenimiento desde 2020 y se rompe en
  Python moderno. Se usó `pwdlib` con Argon2id.
- Listaba los modelos `User, Subscription, Order, Course, Lesson, Progress` como si fueran de la
  Fase 3. La Fase 3 construyó sólo los de autenticación, y esa omisión reapareció como
  prerrequisito escondido de la Fase 4 (ver `docs/FASE-4.md`, §1.2).

La conclusión no es desconfiar del plan, sino verificar cada dependencia contra su fuente antes
de instalarla, y no contra lo que decía este archivo cuando se escribió.
