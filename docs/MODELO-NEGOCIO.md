# Modelo de negocio — monitoreco

Fecha de decisión: 29/07/2026. Decidido por Iñaki. Esta es la fuente de verdad; no
rediscutir sin datos nuevos de clientes reales.

## 1. Tres partes, dos productos pagos

- **Las 44 calculadoras son gratis y no requieren cuenta.** Hacen la matemática en el
  navegador, no necesitan backend, y son la carnada. Decisión ya vigente en
  `ESTADO-PROYECTO.md` como "portón por acción, no por login". **No se pone login
  delante de una calculadora.** El embudo es: anónimo usa calculadoras → crea cuenta
  gratis para el dashboard → paga `pro` por el análisis.
- **Planes (suscripción /mes)** venden datos + análisis: dashboard, series históricas,
  exportación, indicadores, y los informes de IA como diferencial central. Es consumo
  continuo: el análisis caduca, por eso se cobra recurrente.
- **Academia** vende cursos sueltos, pago único, acceso permanente. Un curso no
  caduca, se consume una vez; por eso no va por suscripción.

**Ningún plan incluye cursos.** Razón: con catálogo chico, incluirlos genera arbitraje
—alguien paga un mes de plan, consume todo el catálogo y cancela—. Se rediscute
únicamente si se cumplen **las dos** condiciones: catálogo por encima de ~10 cursos,
Y señales de clientes reales pidiéndolo. La condición del catálogo se suma a la regla
general del encabezado, no la reemplaza.

## 2. Definición de cada plan

**Sobre los nombres:** cada plan tiene un identificador técnico y una etiqueta visible,
y no son lo mismo. Los identificadores son `starter`, `pro` y `unlimited`, viven en la
constraint `CHECK` de la tabla `users`, en el contrato de `GET /auth/me` y en
`require_plan()`. **No se renombran nunca**: hacerlo sería una migración sobre datos
reales que además rompe el contrato de la API. Las etiquetas visibles sí se pueden
cambiar libremente.

- **`starter`, etiqueta "Inicial" (gratis):** el gancho, y **requiere cuenta** — a
  diferencia de las calculadoras, que no. Dashboard en vivo, gráficos básicos,
  exportación limitada. Cuando existan los informes de IA, un informe de muestra
  periódico como motor de conversión.
  **PENDIENTE DE DECIDIR:** qué distingue el informe gratuito de los de `pro`. Si los
  dos son mensuales y del mismo alcance, `pro` no tiene nada que vender ahí. Las
  opciones son frecuencia, profundidad o cobertura. Sin esto definido, no se publica
  el informe gratuito.
- **`pro`, 40.000/mes:** se vende como "análisis económico continuo de la economía
  argentina", no como acceso a datos. El dato crudo del BCRA y el INDEC es público y
  gratuito; lo que no existe en la fuente es el análisis. Incluye: informes de IA
  periódicos, series históricas completas, exportación Excel/CSV, indicadores
  avanzados.
- **`unlimited`: congelado.** Sin precio publicado; sólo "Contactar Ventas". No promete
  API, whitelabel ni soporte 24/7 hasta que existan. Cada contrato se negocia por
  escrito, caso por caso.

## 3. Regla de honestidad (obligatoria, sin excepciones)

- Toda feature publicada: o funciona hoy, o lleva "Próximamente" explícito. Aplica
  también a los informes de IA.
- Fundamento: en Argentina la publicidad integra el contrato — lo publicado es
  exigible. El alcance exacto y la norma aplicable hay que confirmarlos con abogado,
  junto con la consulta del botón de arrepentimiento. **La regla operativa no depende
  de esa confirmación:** no se publica nada incumplible.
- "Sin publicidad" se elimina de `pro`, salvo que el plan gratis efectivamente tenga
  publicidad.

## 4. Soporte

- Promesa pública: respuesta automática 24/7 (bot, cuando exista) + atención humana en
  horario hábil. Nunca "soporte 24/7" a secas: somos dos personas, y eso no es una
  feature técnica sino un compromiso laboral que no se puede sostener.
- El bot de WhatsApp (API de WhatsApp Business + IA) es proyecto futuro, recién cuando
  haya clientes y preguntas repetidas reales.

## 5. Palancas futuras (decididas como "después", no como "no")

- Descuento `pro` en cursos (~30%) cuando ambos productos existan y haya que darle
  razón de permanencia a la suscripción.
- Regalo de cursos a otra cuenta: sin decidir si entra en la Fase 4. Afecta el diseño
  de `orders`, porque separa quién paga de quién recibe el acceso. Si se implementa,
  el servidor tiene que verificar antes de generar el link de pago que el destinatario
  no tenga ya ese curso — cobrar y no poder entregar es peor que rechazar la compra.
- Los precios actuales (40.000 el plan, ~45.000 los cursos) son hipótesis inicial; se
  corrigen con los primeros ~10 clientes reales, no antes.
- **Costo real de cobrar (medido en sandbox el 29/7/2026).** Son mediciones de sandbox,
  no precios nuevos: el punto anterior ya dice que los precios actuales son hipótesis a
  corregir con clientes reales; esto es un insumo de costo para esa corrección.
  - MercadoPago retuvo 4,1% de comisión (41 sobre 1.000; neto 959). La tasa real depende
    del plan y de en cuántos días se cobra, así que hay que confirmarla contra la cuenta
    real antes de fijar precios definitivos.
  - La plata queda retenida: pago del 29/7/2026 con fecha de liberación el 16/8/2026.
    Dieciocho días. Es flujo de caja, no margen, pero cambia cuándo se puede contar con
    el dinero.
  - Al reembolsar, la comisión vuelve en proporción, así que devolver plata no cuesta la
    comisión de la parte devuelta.

## 6. Impacto técnico

- `purchases` modela "esta persona tiene acceso a esto" sin importar el origen. Si
  algún día un plan otorga acceso temporal a algo, se agrega una columna de
  origen/vencimiento; no cambia la arquitectura.
- Nada de este documento bloquea F4-4 en adelante. La suscripción recurrente sigue
  siendo una capa posterior a la Fase 4.

## 7. Qué tiene que existir para cobrar el primer peso

Los dos productos tienen fechas de lanzamiento distintas, y conviene no confundirlas.

- **La Academia puede lanzar primero.** Necesita: la Fase 4 terminada, **al menos un
  curso real grabado y cargado** —hoy el catálogo es utilería—, y un deploy. No
  depende de la ingesta de datos ni de la IA.
- **Los planes no pueden lanzarse hasta después de las Fases 5 y 6.** `pro` se vende
  por los informes de IA; los informes necesitan datos ingestados (Fase 5) y el motor
  de análisis (Fase 6). Publicar `pro` antes sería vender lo que no existe, contra la
  regla de la sección 3.
- Consecuencia: **"Fase 4 cerrada" no es "puedo vender".** Entre las dos cosas hay que
  grabar un curso.
