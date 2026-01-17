// src/data/macroRegistry.js
import { 
  DollarSign, TrendingUp, Activity, Landmark, 
  Scale, PieChart, BarChart3, Globe, Zap, 
  Percent, ArrowLeftRight, Briefcase, Building2,
  ShoppingCart, Users,
} from 'lucide-react';

/* ARQUITECTURA DE DATOS:
  - type: 'raw' -> Dato duro que viene de la API (ej: Precio Dólar).
  - type: 'calculated' -> Métrica derivada (ej: Brecha, Ratios).
  - isHighlight: true -> Aparece destacado en el dashboard.
*/
/* ========================================================================
   MASTER BACKLOG: LISTADO COMPLETO DE INDICADORES (50 MÉTRICAS)
   Fuente: Informe de Inteligencia Estratégica 2025-2026
   Estado: Pendiente de Implementación (TODO)
   ========================================================================

   --- 1. MERCADO CAMBIARIO (La prioridad #1) ---
   [x] Dólar Blue (Termómetro social)
   [x] Dólar MEP (Flujo clase media)
   [ ] Dólar CCL (Flujo corporativo)
   [ ] Dólar Mayorista (Ancla nominal A3500)
   [x] Brecha Cambiaria (Calculated: % vs Oficial)
   [ ] TCRM (Tipo de Cambio Real Multilateral - Competitividad)
   [ ] Costo del Canje (Calculated: Spread CCL/MEP)
   [ ] Dólar "Blend" (Mix 80/20 Exportador)
   [ ] Tasa Implícita Futuros (Rofex vs Spot)

   --- 2. PRECIOS E INFLACIÓN ---
   [x] IPC Nivel General (Inflación Headline)
   [x] IPC Núcleo (Core - Tendencia real sin regulados)
   [ ] REM (Expectativas de Mercado - Pronósticos)
   [ ] CER (Coeficiente de Estabilización - Deuda indexada)
   [ ] UVA (Valor diario para créditos)
   [ ] Salario Real (RIPTE deflactado por IPC)
   [ ] Costo de Construcción (ICC en Dólares)
   [ ] Precios Mayoristas (IPIM - Anticipa góndola)
   [ ] Breakeven de Inflación (Calculated: Bonos CER vs Tasa Fija)
   [ ] Canasta Básica (Línea de Pobreza)

   --- 3. DEUDA Y FINANZAS (Riesgo Soberano) ---
   [x] Riesgo País (EMBI+ JP Morgan)
   [x] Paridad de Bonos (Promedio ponderado Globales)
   [ ] TIR (Yield Curve - Inversión de curva)
   [ ] Spread Legislación (Calculated: Ley NY vs Arg)
   [ ] Tasa de Rollover (Licitaciones del Tesoro)
   [ ] Curva de Tasas Fijas (Lecaps/Boncaps - Referencia)
   [ ] Deuda Corporativa (Rendimiento ONs)
   [ ] BOPREAL (Paridad mercado secundario)

   --- 4. SECTOR MONETARIO (El Banco Central) ---
   [x] Reservas Brutas
   [ ] Reservas Netas (El verdadero poder de fuego)
   [x] Base Monetaria (Dinero de alta potencia)
   [x] Cobertura M2/Reservas (Calculated: Dólar Sombra)
   [ ] Pasivos Remunerados (Stock Pases + Lecaps bancarias)
   [ ] Intervención MULC (Saldo diario comprador/vendedor)
   [ ] Tasa de Política Monetaria (Referencia Pases)
   [ ] Stock de Puts (Seguro de liquidez bancaria - Emisión latente)

   --- 5. SECTOR FISCAL (La Caja) ---
   [ ] Resultado Primario (Ingresos - Gastos antes de intereses)
   [x] Resultado Financiero (La línea final - Superávit/Déficit)
   [ ] Recaudación Tributaria (Variación real interanual)
   [ ] Depósitos del Gobierno (Colchón fiscal en el BCRA)
   [ ] Gasto Público Real (Ajuste por inflación)

   --- 6. ACTIVIDAD REAL Y EXTERNO ---
   [ ] EMAE (Estimador Mensual de Actividad - Proxy PBI)
   [ ] Liquidación del Agro (CIARA - Ingreso de dólares)
   [x] Balanza Energética (Vaca Muerta: Expo vs Impo)
   [x] Términos de Intercambio (Precios Expo vs Impo)
   [ ] Utilización Capacidad Instalada (Industria)
   [ ] Importaciones (Cantidades y Precios)
   [ ] Confianza del Consumidor (UTDT)

   --- 7. SISTEMA BANCARIO ---
   [ ] Depósitos en Dólares (Argendólares - Confianza)
   [ ] Préstamos al Sector Privado (Crédito real)
   [ ] Tasa BADLAR (Costo de fondeo bancos)
   [ ] Liquidez del Sistema (% Encajes + Efectivo)
   [ ] Ratio de Mora (Irregularidad de cartera)





   --- 8. PACK ECONOMISTA PRO (Ratios Estructurales & Sostenibilidad) ---
   [ ] Deuda / PBI (Ratio de Solvencia Soberana >100% crítico)
   [ ] Déficit Cuasifiscal (% PBI - La "bomba" de intereses del BCRA)
   [ ] Cobertura Tarifaria (% del costo real que pagan los usuarios)
   [ ] Costo de Construcción USD (Proxy de inflación en dólares / Atraso)
   [ ] Dólar Blend 80/20 (Tipo de cambio real que recibe el exportador)
   [ ] Coeficiente Pass-Through (Elasticidad: cuánto de la devaluación va a precios)

Déficit Cuasifiscal: Es la métrica favorita de los monetaristas. Explica por qué hay inflación aunque el gobierno no imprima billetes (por los intereses de la deuda del banco central).
Cobertura Tarifaria: Clave para entender la "Sustentabilidad Fiscal". Un economista sabe que si las tarifas están pisadas, el superávit es mentiroso.
Costo de Construcción en USD: Es el mejor indicador de "Inflación en Dólares". Si este número sube mucho, el país se está volviendo caro y pierde competitividad.
Dólar Blend: Es técnico pero vital para la Balanza Comercial. Afecta directamente la oferta de dólares del CCL.




    --- 9. INDICADORES "LEADING" (Anticipadores de Ciclo) ---
    [ ] IVA DGI Real (El mejor termómetro de consumo y recesión - Dato adelantado)
   [ ] TCRM Bilateral Brasil (Competitividad industrial específica - Toyota/Fiat/Arcor)
   [ ] Liquidación Agro Diaria (Flujo de caja real del BCRA en temporada alta)
   [ ] Empleo Privado Registrado (La única métrica de calidad laboral que importa)

IVA DGI (Real): El PBI sale con 3 meses de atraso. El IVA sale todos los meses. Si quieres saber HOY si hay recesión, miras el IVA. Es un indicador adelantado (Leading Indicator).
TCRM Brasil: Argentina puede estar barata contra Europa pero cara contra Brasil. Como Brasil es nuestro principal socio comercial industrial, este ratio define la suerte de las fábricas (Toyota, Fiat, Arcor).
Liquidación Agro: Es la "caja diaria" del país. Sin esto, no hay reservas netas, y sin reservas netas, no hay estabilidad cambiaria.
Empleo Privado: Es el dato de "calidad". El desempleo general puede bajar por planes sociales o empleo público, pero si el empleo privado no sube, la economía está estancada.
   ======================================================================== 
*/





export const macroRegistry = [
  
  // ========================================================================
  // 1. SECTOR MONETARIO
  // ========================================================================
  {
    id: "reservas-brutas",
    category: "monetario",
    title: "Reservas Brutas",
    type: "raw",
    value: "US$ 29.500 M",
    variation: "+1.2%",
    description: "Activos totales en moneda extranjera del BCRA.",
    icon: Landmark,
    color: "blue"
  },
  {
    id: "base-monetaria",
    category: "monetario",
    title: "Base Monetaria",
    type: "raw",
    value: "$ 10.5 B",
    variation: "-0.5%",
    description: "Dinero de alta potencia (Circulante + Encajes).",
    icon:  Landmark,
    color: "blue"
  },
  // --- CALCULATED ---
  {
    id: "m2-reservas",
    category: "monetario",
    title: "Cobertura M2 / Reservas",
    type: "calculated",
    value: "$ 1.350",
    variation: "0%",
    description: "Tipo de cambio de convertibilidad teórica ('Dólar Sombra').",
    insight: "Si el Blue está debajo de este valor, se considera barato en términos monetarios[cite: 244].",
    icon: Scale,
    color: "indigo",
    isHighlight: true
  },
  {
    id: "liquidez-bancaria",
    category: "monetario",
    title: "Liquidez del Sistema",
    type: "calculated",
    value: "65%",
    variation: "+2%",
    description: "Ratio de cobertura ante retiro de depósitos.",
    insight: "Niveles superiores al 30-40% aseguran solidez sistémica[cite: 353].",
    icon: Activity,
    color: "blue"
  },

  // ========================================================================
  // 2. MERCADO CAMBIARIO
  // ========================================================================
  {
    id: "dolar-blue",
    category: "cambiario",
    title: "Dólar Blue",
    type: "raw",
    value: "$ 1.200",
    variation: "+2.5%",
    description: "Tipo de cambio informal (Cuevas).",
    icon: DollarSign,
    color: "emerald"
  },
  {
    id: "dolar-mep",
    category: "cambiario",
    title: "Dólar MEP",
    type: "raw",
    value: "$ 1.150",
    variation: "+1.8%",
    description: "Dólar Bolsa (AL30).",
    icon: DollarSign,
    color: "emerald"
  },
  // --- CALCULATED ---
  {
    id: "brecha-cambiaria",
    category: "cambiario",
    title: "Brecha Cambiaria",
    type: "calculated",
    value: "35%",
    variation: "-2%",
    description: "Distorsión entre dólar oficial y paralelos.",
    insight: "Arriba de 30-50% comienzan las distorsiones macroeconómicas graves[cite: 53].",
    icon: ArrowLeftRight,
    color: "emerald",
    isHighlight: true
  },
  {
    id: "tipo-cambio-real",
    category: "cambiario",
    title: "TCRM (Competitividad)",
    type: "calculated",
    value: "85 pts",
    variation: "-1.5%",
    description: "Tipo de Cambio Real Multilateral.",
    insight: "Si cae, Argentina se vuelve cara en dólares (Atraso Cambiario)[cite: 69].",
    icon: Globe,
    color: "emerald"
  },
  {
    id: "costo-canje",
    category: "cambiario",
    title: "Costo del Canje (Cable)",
    type: "calculated",
    value: "3.5%",
    variation: "+0.5%",
    description: "Spread entre CCL y MEP.",
    insight: "Indica la desesperación por sacar dinero al exterior. Si es alto, hay fuga[cite: 34].",
    icon: ArrowLeftRight,
    color: "emerald"
  },
  {
    id: "tasa-impl-rofex",
    category: "cambiario",
    title: "Tasa Implícita Futuros",
    type: "calculated",
    value: "45% TNA",
    variation: "+5%",
    description: "Devaluación esperada en mercado Rofex.",
    insight: "Si supera la tasa de plazo fijo, el mercado espera un salto cambiario[cite: 79].",
    icon: TrendingUp,
    color: "emerald"
  },

  // ========================================================================
  // 3. MERCADO FINANCIERO
  // ========================================================================
  {
    id: "riesgo-pais",
    category: "financiero",
    title: "Riesgo País",
    type: "raw",
    value: "1.450 bps",
    variation: "-20 bps",
    description: "EMBI+ Argentina (JP Morgan).",
    icon: Activity,
    color: "indigo"
  },
  // --- CALCULATED ---
  {
    id: "merval-usd",
    category: "financiero",
    title: "Merval en USD (CCL)",
    type: "calculated",
    value: "US$ 950",
    variation: "+1.2%",
    description: "Valor real de las empresas argentinas.",
    insight: "Métrica definitiva de valuación de activos, descontando efecto inflacionario.",
    icon: BarChart3,
    color: "indigo",
    isHighlight: true
  },
  {
    id: "tasa-real",
    category: "financiero",
    title: "Tasa de Interés Real",
    type: "calculated",
    value: "-5.2%",
    variation: "0.1%",
    description: "Rendimiento descontando inflación.",
    insight: "Si es negativa, conviene dolarizarse o consumir. Si es positiva, conviene ahorrar en pesos[cite: 23].",
    icon: Percent,
    color: "indigo"
  },
  {
    id: "spread-legislacion",
    category: "financiero",
    title: "Spread Legislación",
    type: "calculated",
    value: "40 bps",
    variation: "-5 bps",
    description: "Diferencia de rendimiento Ley NY vs Ley ARG.",
    insight: "Mide la inseguridad jurídica. A menor spread, mayor confianza legal[cite: 190].",
    icon: Scale,
    color: "indigo"
  },
  {
    id: "paridad-bonos",
    category: "financiero",
    title: "Paridad Promedio (AL30)",
    type: "calculated",
    value: "52%",
    variation: "+1%",
    description: "% de recupero sobre valor nominal.",
    insight: "Debajo de 30% es zona de default. Arriba de 60% es zona de normalización[cite: 177].",
    icon: TrendingUp,
    color: "indigo"
  },

  // ========================================================================
  // 4. SECTOR FISCAL
  // ========================================================================
  // --- CALCULATED ---
  {
    id: "resultado-financiero",
    category: "fiscal",
    title: "Resultado Financiero",
    type: "calculated",
    value: "-0.5% PBI",
    variation: "+0.1%",
    description: "Superávit Primario - Intereses Deuda.",
    insight: "La verdadera 'línea final'. Determina si necesitamos pedir deuda nueva[cite: 211].",
    icon: Scale,
    color: "purple",
    isHighlight: true
  },
  {
    id: "rollover-deuda",
    category: "fiscal",
    title: "Ratio de Rollover",
    type: "calculated",
    value: "115%",
    variation: "-10%",
    description: "% de deuda renovada en licitaciones.",
    insight: "Si es >100%, el Estado consigue financiamiento neto. Si es <100%, hay estrés[cite: 204].",
    icon: Activity,
    color: "purple"
  },
  {
    id: "breakeven-inflacion",
    category: "fiscal",
    title: "Breakeven Inflación",
    type: "calculated",
    value: "4.5% m/m",
    variation: "0%",
    description: "Inflación implícita en bonos CER vs Tasa Fija.",
    insight: "Revela la inflación que el mercado espera realmente ('Skin in the game')[cite: 86].",
    icon: Zap,
    color: "purple"
  },

  // ========================================================================
  // 5. PRECIOS E INFLACIÓN
  // ========================================================================
  {
    id: "ipc-mensual",
    category: "precios",
    title: "Inflación Mensual",
    type: "raw",
    value: "4.2%",
    variation: "-0.8%",
    description: "IPC Nivel General (INDEC).",
    icon: TrendingUp,
    color: "orange"
  },
  // --- CALCULATED ---
  {
    id: "inflacion-nucleo",
    category: "precios",
    title: "Inflación Núcleo (Core)",
    type: "calculated",
    value: "3.8%",
    variation: "-0.2%",
    description: "Excluye regulados y estacionales.",
    insight: "Tendencia real de fondo. Es la métrica que mira el BCRA para la tasa[cite: 116].",
    icon: Activity,
    color: "orange",
    isHighlight: true
  },
  {
    id: "salario-real",
    category: "precios",
    title: "Salario Real (RIPTE)",
    type: "calculated",
    value: "$ 980 USD",
    variation: "-2%",
    description: "Poder de compra ajustado por inflación.",
    insight: "Sin recuperación de esta métrica, el consumo no puede crecer[cite: 135].",
    icon: Briefcase,
    color: "orange"
  },

  // ========================================================================
  // 6. ACTIVIDAD Y EXTERNO
  // ========================================================================
  {
    id: "balanza-energetica",
    category: "externo",
    title: "Balanza Energética",
    type: "calculated",
    value: "+ US$ 200M",
    variation: "+50M",
    description: "Exportaciones - Importaciones Energía.",
    insight: "El paso a superávit (Vaca Muerta) es el 'Game Changer' de la estabilidad cambiaria[cite: 293].",
    icon: Zap,
    color: "rose"
  },
  {
    id: "terminos-intercambio",
    category: "externo",
    title: "Términos de Intercambio",
    type: "calculated",
    value: "110 pts",
    variation: "+2%",
    description: "Precio Exportaciones / Precio Importaciones.",
    insight: "Mide el 'viento de cola' externo. Si sube, entran más dólares por lo mismo[cite: 291].",
    icon: Globe,
    color: "rose"
  },

  // ========================================================================
  // 7. PACK ECONOMISTA (RATIOS ESTRUCTURALES)
  // ========================================================================
  {
    id: "deuda-pbi",
    category: "fiscal",
    title: "Deuda / PBI",
    type: "calculated",
    value: "85%",
    variation: "-2%",
    description: "Ratio de solvencia soberana.",
    insight: "Mide la capacidad de pago real del país. Arriba del 100% es zona de riesgo crítico de default.",
    icon: Scale,
    color: "purple"
  },
  {
    id: "deficit-cuasifiscal",
    category: "monetario",
    title: "Déficit Cuasifiscal",
    type: "calculated",
    value: "3.5% PBI",
    variation: "-0.1%",
    description: "Intereses que paga el BCRA por sus pasivos.",
    insight: "Es la 'emisión futura' escondida. Si este número es mayor que el crecimiento de la economía, la inflación es inevitable.",
    icon: Zap,
    color: "blue"
  },
  {
    id: "cobertura-tarifas",
    category: "precios",
    title: "Cobertura Tarifaria",
    type: "calculated",
    value: "65%",
    variation: "+5%",
    description: "% del costo real de energía cubierto por boletas.",
    insight: "La diferencia (35%) son subsidios que paga el Estado. Para tener superávit fiscal, este número debe tender a 100%.",
    icon: Zap,
    color: "orange"
  },
  {
    id: "costo-construccion-usd",
    category: "actividad",
    title: "Costo Construcción (m²)",
    type: "calculated",
    value: "US$ 1.100",
    variation: "+12%",
    description: "Costo de reposición por metro cuadrado.",
    insight: "Indica si el dólar está 'atrasado'. Si construir es caro en dólares, significa que Argentina se encareció (Inflación en USD).",
    icon: Building2,
    color: "cyan"
  },
  {
    id: "dolar-blend",
    category: "cambiario",
    title: "Dólar Blend (Expo)",
    type: "calculated",
    value: "$ 1.080",
    variation: "+1.5%",
    description: "Mix 80% Oficial + 20% CCL.",
    insight: "Es el tipo de cambio real que reciben los exportadores. Determina si al campo le conviene vender la cosecha o guardarla.",
    icon: DollarSign,
    color: "emerald"
  },
  {
    id: "pass-through",
    category: "precios",
    title: "Coef. Pass-Through",
    type: "calculated",
    value: "0.8",
    variation: "0",
    description: "Traslado a precios de la devaluación.",
    insight: "Mide cuánto de una suba del dólar se va directo a inflación. En Argentina es altísimo (cercano a 1).",
    icon: TrendingUp,
    color: "rose"
  },
// ========================================================================
  // 9. INDICADORES "LEADING" (ANTICIPADORES DE CICLO)
  // ========================================================================
  {
    id: "recaudacion-iva",
    category: "actividad",
    title: "IVA DGI (Real)",
    type: "calculated",
    value: "$ 4.2 B",
    variation: "-5%",
    description: "Recaudación de IVA ajustada por inflación.",
    insight: "Es el mejor termómetro del consumo. Si el IVA cae en términos reales, la recesión en la calle es peor de lo que dice el PBI.",
    icon: ShoppingCart, // Importar ShoppingCart de lucide-react
    color: "cyan"
  },
  {
    id: "itcrm-brasil",
    category: "externo",
    title: "TCRM Bilateral (Brasil)",
    type: "calculated",
    value: "92 pts",
    variation: "-1%",
    description: "Competitividad precio específica contra Brasil.",
    insight: "Más importante que el Multilateral. Si estamos caros contra Brasil (tipo de cambio bajo), nuestras industrias automotriz y pyme sufren.",
    icon: Globe,
    color: "rose"
  },
  {
    id: "liquidacion-agro",
    category: "externo",
    title: "Liquidación Agro (CIARA)",
    type: "raw",
    value: "US$ 150 M/día",
    variation: "+20%",
    description: "Ingreso diario de divisas del campo.",
    insight: "El verdadero motor de las reservas. Los economistas miran esto día a día en temporada alta (Abril-Julio) para ver si el BCRA podrá acumular.",
    icon: TrendingUp,
    color: "emerald"
  },
  {
    id: "empleo-privado",
    category: "actividad",
    title: "Empleo Privado Registrado",
    type: "raw",
    value: "6.3 M",
    variation: "0%",
    description: "Trabajadores en blanco sector privado (SIPA).",
    insight: "La única métrica de empleo que importa. Si este número cae, la crisis es estructural. Si sube, es crecimiento genuino.",
    icon: Users, // Importar Users de lucide-react
    color: "cyan"
  }

];