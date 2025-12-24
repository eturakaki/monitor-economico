// src/data/dataGlosario.js
import { 
  Coins, Landmark, PieChart, ShoppingCart, TrendingUp, 
  Users, Activity, Building2, Globe, Wallet 
} from 'lucide-react';

/* ========================================================================
   1. SECTORES ENRIQUECIDOS (7 SECTORES COMPLETOS)
   ======================================================================== */
export const sectores = [
  // 1. MERCADO CAMBIARIO
  { 
    titulo: "Mercado Cambiario", 
    id: "cambiario",
    color: "emerald", 
    bgHeader: "bg-emerald-50",
    textHeader: "text-emerald-700",
    Icono: Coins, 
    items: [
      {
        nombre: "Dólar Blue",
        definicion: "Tipo de cambio informal que se opera fuera del sistema bancario ('cuevas'). Su valor depende puramente de la oferta y demanda entre privados sin intervención directa del Estado.",
        formula: "Precio de mercado libre (Oferta vs Demanda)",
        importancia: "Es el termómetro de la incertidumbre y la referencia de precios para muchos comercios y servicios."
      },
      {
        nombre: "Brecha Cambiaria",
        definicion: "Diferencia porcentual entre el dólar oficial (mayorista) y los dólares paralelos (Blue, MEP o CCL).",
        formula: "Brecha % = ((Dólar Paralelo - Oficial) / Oficial) * 100",
        importancia: "Una brecha alta genera expectativas de devaluación e incentiva a no liquidar exportaciones."
      },
      {
        nombre: "Dólar MEP (Bolsa)",
        definicion: "Tipo de cambio legal que se obtiene comprando un bono en pesos (ej: AL30) y vendiéndolo en dólares (AL30D) dentro de Argentina.",
        formula: "Precio Bono en Pesos / Precio Bono en Dólares",
        importancia: "Permite dolarizarse de forma legal y blanca a empresas y particulares."
      },
      {
        nombre: "Tipo de Cambio Real Multilateral (TCRM)",
        definicion: "Índice que mide qué tan 'caro' o 'barato' es Argentina respecto a sus socios comerciales, ajustando por la inflación de cada país.",
        formula: "Promedio ponderado de tipos de cambio reales bilaterales",
        importancia: "Si es bajo, el país es caro en dólares (retraso cambiario). Si es alto, es competitivo para exportar."
      }
    ] 
  },

  // 2. SECTOR MONETARIO
  { 
    titulo: "Sector Monetario", 
    id: "monetario",
    color: "blue", 
    bgHeader: "bg-blue-50",
    textHeader: "text-blue-700",
    Icono: Landmark, 
    items: [
      {
        nombre: "Base Monetaria",
        definicion: "Es la cantidad total de dinero 'de alta potencia' emitido por el Banco Central. Incluye billetes y monedas en la calle + encajes bancarios.",
        formula: "Base = Circulante en Público + Reservas de Bancos",
        importancia: "Es la variable que controla el BCRA. Si crece más rápido que la demanda de dinero, genera inflación."
      },
      {
        nombre: "Pasivos Remunerados (Leliq/Pases)",
        definicion: "Deuda que emite el BCRA para retirar pesos del mercado (esterilización) y evitar que vayan a precios o dólar.",
        formula: "Stock de Leliq + Stock de Pases Pasivos",
        importancia: "Generan emisión futura (emisión endógena) por el pago de intereses, alimentando la 'bola de nieve'."
      },
      {
        nombre: "Reservas Internacionales Brutas",
        definicion: "Total de activos en moneda extranjera (dólares, oro, yuanes) en poder del Banco Central.",
        formula: "Reservas = Divisas + Oro + Derechos Especiales de Giro (DEG)",
        importancia: "Son el respaldo de la moneda y la 'caja' para pagar importaciones y deuda externa."
      }
    ] 
  },

  // 3. SECTOR FINANCIERO (NUEVO)
  { 
    titulo: "Sector Financiero", 
    id: "financiero",
    color: "indigo", 
    bgHeader: "bg-indigo-50",
    textHeader: "text-indigo-700",
    Icono: Building2, 
    items: [
      {
        nombre: "Tasa BADLAR",
        definicion: "Tasa de interés promedio que pagan los bancos privados por plazos fijos mayores a un millón de pesos.",
        formula: "Promedio ponderado diario de tasas pasivas > $1M",
        importancia: "Es la tasa de referencia para grandes inversores y créditos corporativos."
      },
      {
        nombre: "Préstamos al Sector Privado",
        definicion: "Volumen total de crédito (pesos y dólares) que los bancos otorgan a empresas y familias.",
        formula: "Stock de Préstamos Personales + Comerciales + Hipotecarios + Tarjetas",
        importancia: "Si crece, indica que la economía se está moviendo y hay inversión o consumo."
      },
      {
        nombre: "Depósitos en Pesos",
        definicion: "Dinero que el sector privado mantiene dentro de los bancos (Cuentas Corrientes, Cajas de Ahorro y Plazos Fijos).",
        formula: "Suma de depósitos a la vista y a plazo",
        importancia: "Mide la confianza en el sistema financiero y la demanda de pesos."
      }
    ] 
  },

  // 4. PRECIOS E INFLACIÓN
  { 
    titulo: "Precios e Inflación", 
    id: "precios",
    color: "orange", 
    bgHeader: "bg-orange-50",
    textHeader: "text-orange-700",
    Icono: TrendingUp, 
    items: [
      {
        nombre: "IPC (Índice de Precios al Consumidor)",
        definicion: "Mide la variación mensual de precios de una canasta representativa de bienes y servicios de los hogares.",
        formula: "Variación % del índice respecto al mes anterior",
        importancia: "Es la medida oficial de la inflación que afecta el bolsillo de la gente."
      },
      {
        nombre: "Inflación Núcleo (Core)",
        definicion: "Es la inflación 'pura', excluyendo precios regulados (tarifas) y estacionales (frutas/verduras) que son volátiles.",
        formula: "IPC General - (Regulados + Estacionales)",
        importancia: "Muestra la tendencia real de fondo de la inflación. Es la que mira el Banco Central."
      },
      {
        nombre: "UVA (Unidad de Valor Adquisitivo)",
        definicion: "Unidad de cuenta que se ajusta diariamente según la inflación (CER).",
        formula: "Valor diario ajustado por Coeficiente CER",
        importancia: "Se usa para que los créditos hipotecarios o plazos fijos no pierdan valor real contra la inflación."
      }
    ] 
  },

  // 5. SECTOR FISCAL
  { 
    titulo: "Sector Fiscal", 
    id: "fiscal",
    color: "purple", 
    bgHeader: "bg-purple-50",
    textHeader: "text-purple-700",
    Icono: PieChart, 
    items: [
      {
        nombre: "Resultado Fiscal Primario",
        definicion: "Diferencia entre los ingresos del Estado y sus gastos operativos, ANTES de pagar intereses de deuda.",
        formula: "Ingresos Totales - Gastos Primarios",
        importancia: "Indica si el Estado gasta más de lo que genera genuinamente (Déficit) o ahorra (Superávit)."
      },
      {
        nombre: "Resultado Financiero",
        definicion: "Es el resultado final de las cuentas públicas (" + "la línea de abajo" + "). Incluye el pago de intereses de la deuda.",
        formula: "Resultado Primario - Intereses de Deuda",
        importancia: "Determina cuánto dinero real necesita pedir prestado el país para cerrar el año."
      },
      {
        nombre: "Recaudación Tributaria",
        definicion: "Monto total que ingresa al Estado por cobro de impuestos (IVA, Ganancias, Retenciones, etc.).",
        formula: "Suma de ingresos por DGI + Aduana + Seguridad Social",
        importancia: "Si cae en términos reales (ajustado por inflación), el Estado se desfinancia."
      }
    ] 
  },

  // 6. ACTIVIDAD ECONÓMICA
  { 
    titulo: "Actividad Económica", 
    id: "actividad",
    color: "cyan", 
    bgHeader: "bg-cyan-50",
    textHeader: "text-cyan-700",
    Icono: Activity, 
    items: [
      {
        nombre: "EMAE",
        definicion: "Estimador Mensual de Actividad Económica. Es un 'anticipo' mensual del comportamiento del PBI.",
        formula: "Índice de volumen físico de la producción (Base 2004=100)",
        importancia: "Permite saber mes a mes si la economía está creciendo (recuperación) o cayendo (recesión)."
      },
      {
        nombre: "Utilización de Capacidad Instalada",
        definicion: "Porcentaje de la infraestructura industrial (máquinas, fábricas) que está siendo utilizada realmente.",
        formula: "(Producción Actual / Producción Máxima Potencial) * 100",
        importancia: "Si es baja, hay recesión y desempleo. Si es muy alta, puede generar cuellos de botella e inflación."
      },
      {
        nombre: "ISAC (Construcción)",
        definicion: "Indicador Sintético de la Actividad de la Construcción. Mide la venta de insumos clave (cemento, ladrillos).",
        formula: "Promedio de variaciones de insumos despachados",
        importancia: "La construcción es 'madre de industrias' y gran generadora de empleo rápido."
      }
    ] 
  },

  // 7. SECTOR EXTERNO
  { 
    titulo: "Sector Externo", 
    id: "externo",
    color: "rose", 
    bgHeader: "bg-rose-50",
    textHeader: "text-rose-700",
    Icono: Globe, 
    items: [
      {
        nombre: "Balanza Comercial",
        definicion: "Saldo neto de dólares por intercambio de bienes. Es la diferencia entre lo que exportamos y lo que importamos.",
        formula: "Exportaciones (FOB) - Importaciones (CIF)",
        importancia: "Es la principal fuente genuina de dólares de la Argentina. Fundamental para acumular reservas."
      },
      {
        nombre: "Términos de Intercambio",
        definicion: "Relación de precios: ¿Cuánto compramos con lo que vendemos? (ej: cuántos iPhone compramos con una tonelada de soja).",
        formula: "(Índice Precios Expo / Índice Precios Impo) * 100",
        importancia: "Si mejora, al país le entran más dólares por hacer el mismo esfuerzo ('Viento de cola')."
      },
      {
        nombre: "Exportaciones Agrícolas",
        definicion: "Ventas al exterior del complejo agroindustrial (Soja, Maíz, Trigo, Harinas).",
        formula: "Volumen x Precio Internacional",
        importancia: "Representan la mayor parte del ingreso de divisas del país."
      }
    ] 
  }
];

/* ========================================================================
   2. FÓRMULAS METODOLÓGICAS (Sección Inferior)
   ======================================================================== */
export const calculos = [
  {
    titulo: "Tasa de Interés Real",
    formula: "Tasa Real = ((1 + Tasa Nominal) / (1 + Inflación)) - 1",
    ejemplo: "Si Plazo Fijo paga 10% mensual y la inflación es 8%, ganaste 1.8% real."
  },
  {
    titulo: "Base Monetaria en Dólares",
    formula: "BM en U$D = Base Monetaria (Pesos) / Dólar CCL",
    ejemplo: "Muestra cuántos dólares 'de verdad' respaldan a todos los pesos circulantes."
  },
  {
    titulo: "Brecha Cambiaria",
    formula: "Brecha % = ((Dólar Blue - Dólar Oficial) / Dólar Oficial) x 100",
    ejemplo: "Si Blue = 1200 y Oficial = 800, la brecha es del 50%."
  },
  {
    titulo: "Resultado Primario vs Financiero",
    formula: "Financiero = Primario - Intereses de Deuda",
    ejemplo: "Podés tener superávit primario (operativo) pero déficit financiero si pagás muchos intereses."
  }
];

/* ========================================================================
   3. DICCIONARIO GENERAL (Para el Buscador)
   ======================================================================== */
export const terminos = [
  { id: 'leliq', titulo: 'Leliq', definicion: 'Letras de Liquidez del BCRA. Deuda emitida por el Banco Central para absorber pesos y pagar tasa a los bancos.' },
  { id: 'base', titulo: 'Base Monetaria', definicion: 'Dinero de alta potencia: Billetes en la calle + Reservas de los bancos en el BCRA.' },
  { id: 'mep', titulo: 'Dólar MEP', definicion: 'Dólar Bolsa. Se consigue comprando y vendiendo bonos legalmente en el mercado local.' },
  { id: 'ccl', titulo: 'Dólar CCL', definicion: 'Contado con Liqui. Similar al MEP pero permite transferir los dólares a una cuenta en el exterior.' },
  { id: 'emae', titulo: 'EMAE', definicion: 'Estimador Mensual de Actividad Económica. Anticipo mensual del PBI.' },
  { id: 'riesgo', titulo: 'Riesgo País', definicion: 'Sobretasa que paga Argentina para endeudarse comparado con los bonos de EE.UU. (Libres de riesgo).' },
];