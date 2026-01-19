// src/data/monitores.js
import { 
  DollarSign, Activity, Briefcase, TrendingUp, TrendingDown, 
  Factory, Scale, Users, Percent, Landmark, ArrowLeftRight, 
  Globe, Zap, BarChart3, Building2, ShoppingCart 
} from 'lucide-react';

// --- HELPER: Generador de curvas para Sparklines ---
const generarHistorial = (valorBase, volatilidad = 0.05) => {
  const historial = [];
  // Limpieza del valor (ej: "$ 1.200" -> 1200)
  let valorNum = parseFloat(valorBase.toString().replace(/[^\d.-]/g, ''));
  if (isNaN(valorNum)) valorNum = 100; 

  let valorActual = valorNum;
  for (let i = 0; i < 30; i++) {
    const cambio = valorActual * volatilidad * (Math.random() - 0.5);
    valorActual += cambio;
    historial.push({ 
      fecha: `Día ${i + 1}`, 
      valor: parseFloat(valorActual.toFixed(2)) 
    });
  }
  return historial;
};

// --- BASE DE DATOS UNIFICADA ---
export const misIndicadores = [

  // ========================================================================
  // 1. SECTOR CAMBIARIO
  // ========================================================================
  { 
    id: "dolar-blue", 
    categoria: "cambiario",
    titulo: "Dólar Blue", 
    tipo: "raw", 
    valor: "$ 1.200", 
    datoAnterior: "$ 1.171", // Agregado
    cambioAbsoluto: 29,      // Agregado
    variacion: 2.5, 
    esInverso: true, 
    Icono: DollarSign, 
    descripcion: "Cotización del dólar en el mercado informal (Cuevas).",
    subtexto: "BYMA",
    historial: generarHistorial(1200)
  },
  { 
    id: "dolar-mep", 
    categoria: "cambiario",
    titulo: "Dólar MEP", 
    tipo: "raw", 
    valor: "$ 1.150", 
    datoAnterior: "$ 1.130", // Agregado
    cambioAbsoluto: 20,      // Agregado
    variacion: 1.8, 
    Icono: DollarSign, 
    subtexto: "Bolsa",
    descripcion: "Dólar Bolsa operado con bonos AL30.",
    historial: generarHistorial(1150)
  },
  { 
    id: "dolar-ccl", 
    categoria: "cambiario",
    titulo: "Dólar CCL", 
    tipo: "raw", 
    valor: "$ 1.190", 
    datoAnterior: "$ 1.172", // Agregado
    cambioAbsoluto: 18,      // Agregado
    variacion: 1.5, 
    Icono: DollarSign, 
    subtexto: "Cedears",
    descripcion: "Contado con Liquidación. Dólar corporativo vía bonos/acciones.",
    historial: generarHistorial(1190)
  },
  {
    id: "brecha-cambiaria",
    categoria: "cambiario",
    titulo: "Brecha Cambiaria",
    tipo: "calculated",
    valor: "35%",
    datoAnterior: "35.7%",   // Agregado
    cambioAbsoluto: -0.7,    // Agregado
    variacion: -2,
    descripcion: "Distorsión entre dólar oficial y paralelos.",
    insight: "Arriba de 30-50% comienzan las distorsiones macroeconómicas graves.",
    Icono: ArrowLeftRight,
    color: "emerald",
    esDestacado: true,
    historial: generarHistorial(35)
  },
  {
    id: "tipo-cambio-real",
    categoria: "cambiario",
    titulo: "TCRM (Competitividad)",
    tipo: "calculated",
    valor: "85 pts",
    datoAnterior: "86.3 pts", // Agregado
    cambioAbsoluto: -1.3,     // Agregado
    variacion: -1.5,
    descripcion: "Tipo de Cambio Real Multilateral.",
    insight: "Si cae, Argentina se vuelve cara en dólares (Atraso Cambiario).",
    Icono: Globe,
    color: "emerald",
    historial: generarHistorial(85)
  },
  {
    id: "costo-canje",
    categoria: "cambiario",
    titulo: "Costo del Canje (Cable)",
    tipo: "calculated",
    valor: "3.5%",
    datoAnterior: "3.5%",    // Agregado
    cambioAbsoluto: 0.0,     // Agregado
    variacion: 0.5,
    descripcion: "Spread entre CCL y MEP.",
    insight: "Indica la desesperación por sacar dinero al exterior. Si es alto, hay fuga.",
    Icono: ArrowLeftRight,
    color: "emerald",
    historial: generarHistorial(3.5)
  },
  {
    id: "tasa-impl-rofex",
    categoria: "cambiario",
    titulo: "Tasa Implícita Futuros",
    tipo: "calculated",
    valor: "45% TNA",
    datoAnterior: "42.9% TNA", // Agregado
    cambioAbsoluto: 2.1,       // Agregado
    variacion: 5,
    descripcion: "Devaluación esperada en mercado Rofex.",
    insight: "Si supera la tasa de plazo fijo, el mercado espera un salto cambiario.",
    Icono: TrendingUp,
    color: "emerald",
    historial: generarHistorial(45)
  },
  {
    id: "dolar-blend",
    categoria: "cambiario",
    titulo: "Dólar Blend (Expo)",
    tipo: "calculated",
    valor: "$ 1.080",
    datoAnterior: "$ 1.064", // Agregado
    cambioAbsoluto: 16,      // Agregado
    variacion: 1.5,
    descripcion: "Mix 80% Oficial + 20% CCL.",
    insight: "Es el tipo de cambio real que reciben los exportadores.",
    Icono: DollarSign,
    color: "emerald",
    historial: generarHistorial(1080)
  },

  // ========================================================================
  // 2. SECTOR FINANCIERO
  // ========================================================================
  { 
    id: "riesgo-pais", 
    categoria: "financiero",
    titulo: "Riesgo País", 
    tipo: "raw", 
    valor: "1.450 pts", 
    datoAnterior: "1.481 pts", // Agregado
    cambioAbsoluto: -31,       // Agregado
    variacion: -2.1, 
    esInverso: true, 
    Icono: Activity,
    descripcion: "Índice EMBI+ de JP Morgan.",
    historial: generarHistorial(1450)
  },
  { 
    id: "merval", 
    categoria: "financiero",
    titulo: "Merval (S&P)", 
    tipo: "raw", 
    valor: "1.120.500", 
    datoAnterior: "1.083.650", // Agregado
    cambioAbsoluto: 36850,     // Agregado
    variacion: 3.4, 
    Icono: TrendingUp,
    descripcion: "Índice líder de la bolsa local en pesos.",
    historial: generarHistorial(1120500)
  },
  {
    id: "merval-usd",
    categoria: "financiero",
    titulo: "Merval en USD (CCL)",
    tipo: "calculated",
    valor: "US$ 950",
    datoAnterior: "US$ 939", // Agregado
    cambioAbsoluto: 11,      // Agregado
    variacion: 1.2,
    descripcion: "Valor real de las empresas argentinas.",
    insight: "Métrica definitiva de valuación de activos, descontando efecto inflacionario.",
    Icono: BarChart3,
    color: "indigo",
    esDestacado: true,
    historial: generarHistorial(950)
  },
  {
    id: "tasa-real",
    categoria: "financiero",
    titulo: "Tasa de Interés Real",
    tipo: "calculated",
    valor: "-5.2%",
    datoAnterior: "-5.2%",   // Agregado
    cambioAbsoluto: 0.0,     // Agregado
    variacion: 0.1,
    descripcion: "Rendimiento descontando inflación.",
    insight: "Si es negativa, conviene dolarizarse o consumir. Si es positiva, conviene ahorrar.",
    Icono: Percent,
    color: "indigo",
    historial: generarHistorial(-5.2)
  },
  {
    id: "spread-legislacion",
    categoria: "financiero",
    titulo: "Spread Legislación",
    tipo: "calculated",
    valor: "40 bps",
    datoAnterior: "42 bps",  // Agregado
    cambioAbsoluto: -2,      // Agregado
    variacion: -5,
    descripcion: "Diferencia de rendimiento Ley NY vs Ley ARG.",
    insight: "Mide la inseguridad jurídica. A menor spread, mayor confianza legal.",
    Icono: Scale,
    color: "indigo",
    historial: generarHistorial(40)
  },
  {
    id: "paridad-bonos",
    categoria: "financiero",
    titulo: "Paridad Promedio (AL30)",
    tipo: "calculated",
    valor: "52%",
    datoAnterior: "51.5%",   // Agregado
    cambioAbsoluto: 0.5,     // Agregado
    variacion: 1,
    descripcion: "% de recupero sobre valor nominal.",
    insight: "Debajo de 30% es zona de default. Arriba de 60% es zona de normalización.",
    Icono: TrendingUp,
    color: "indigo",
    historial: generarHistorial(52)
  },

  // ========================================================================
  // 3. SECTOR MONETARIO
  // ========================================================================
  { 
    id: "reservas-bcra", 
    categoria: "monetario", 
    titulo: "Reservas Brutas", 
    tipo: "raw", 
    valor: "US$ 24.000M", 
    datoAnterior: "US$ 23.715 M", // Agregado
    cambioAbsoluto: 285,          // Agregado
    variacion: 1.2, 
    Icono: Briefcase, 
    subtexto: "Objetivo: 30MM",
    descripcion: "Activos totales en moneda extranjera del BCRA.",
    historial: generarHistorial(29500)
  },
  { 
    id: "tasa", 
    categoria: "monetario", 
    titulo: "Tasa de Política Monetaria", 
    tipo: "raw", 
    valor: "118%", 
    datoAnterior: "118%",    // Agregado
    cambioAbsoluto: 0,       // Agregado
    variacion: 0, 
    Icono: Percent, 
    subtexto: "TNA",
    descripcion: "Tasa de referencia (Pases/Leliq).",
    historial: generarHistorial(118)
  },
  {
    id: "base-monetaria",
    categoria: "monetario",
    titulo: "Base Monetaria",
    tipo: "raw", 
    valor: "$ 10.5 B", 
    datoAnterior: "$ 10.6 B", // Agregado
    cambioAbsoluto: -0.1,     // Agregado
    variacion: -0.5,
    descripcion: "Dinero de alta potencia (Circulante + Encajes).",
    Icono: Landmark,
    color: "blue",
    historial: generarHistorial(10500)
  },
  {
    id: "m2-reservas",
    categoria: "monetario",
    titulo: "Cobertura M2 / Reservas",
    tipo: "calculated",
    valor: "$ 1.350", 
    datoAnterior: "$ 1.350", // Agregado
    cambioAbsoluto: 0,       // Agregado
    variacion: 0,
    descripcion: "Dólar de convertibilidad teórica ('Dólar Sombra').",
    insight: "Si el Blue está debajo de este valor, se considera barato en términos monetarios.",
    Icono: Scale,
    color: "indigo",
    esDestacado: true,
    historial: generarHistorial(1350)
  },
  {
    id: "liquidez-bancaria",
    categoria: "monetario",
    titulo: "Liquidez del Sistema",
    tipo: "calculated",
    valor: "65%",
    datoAnterior: "63.7%",   // Agregado
    cambioAbsoluto: 1.3,     // Agregado
    variacion: 2,
    descripcion: "Ratio de cobertura ante retiro de depósitos.",
    insight: "Niveles superiores al 30-40% aseguran solidez sistémica.",
    Icono: Activity,
    color: "blue",
    historial: generarHistorial(65)
  },
  {
    id: "deficit-cuasifiscal",
    categoria: "monetario",
    titulo: "Déficit Cuasifiscal",
    tipo: "calculated",
    valor: "3.5% PBI",
    datoAnterior: "3.5% PBI", // Agregado
    cambioAbsoluto: 0,        // Agregado
    variacion: -0.1,
    descripcion: "Intereses que paga el BCRA por sus pasivos.",
    insight: "Es la 'emisión futura' escondida. Si este número es mayor que el crecimiento, la inflación es inevitable.",
    Icono: Zap,
    color: "blue",
    historial: generarHistorial(3.5)
  },

  // ========================================================================
  // 4. SECTOR FISCAL
  // ========================================================================
  {
    id: "superavit-fiscal",
    categoria: "fiscal",
    titulo: "Superávit Fiscal",
    tipo: "raw", 
    valor: "$518.000M", 
    datoAnterior: "$ 513.889 M", // Agregado
    cambioAbsoluto: 4111,        // Agregado
    variacion: 0.8,
    Icono: Scale,
    descripcion: "Resultado primario del sector público nacional.",
    historial: generarHistorial(518000)
  },
  {
    id: "resultado-financiero",
    categoria: "fiscal",
    titulo: "Resultado Financiero",
    tipo: "calculated",
    valor: "-0.5% PBI",
    datoAnterior: "-0.5% PBI", // Agregado
    cambioAbsoluto: 0,         // Agregado
    variacion: 0.1,
    descripcion: "Superávit Primario - Intereses Deuda.",
    insight: "La verdadera 'línea final'. Determina si necesitamos pedir deuda nueva.",
    Icono: Scale,
    color: "purple",
    esDestacado: true,
    historial: generarHistorial(-0.5)
  },
  {
    id: "rollover-deuda",
    categoria: "fiscal",
    titulo: "Ratio de Rollover",
    tipo: "calculated",
    valor: "115%",
    datoAnterior: "128%",  // Agregado
    cambioAbsoluto: -13,   // Agregado
    variacion: -10,
    descripcion: "% de deuda renovada en licitaciones.",
    insight: "Si es >100%, el Estado consigue financiamiento neto. Si es <100%, hay estrés.",
    Icono: Activity,
    color: "purple",
    historial: generarHistorial(115)
  },
  {
    id: "breakeven-inflacion",
    categoria: "fiscal",
    titulo: "Breakeven Inflación",
    tipo: "calculated",
    valor: "4.5% m/m",
    datoAnterior: "4.5% m/m", // Agregado
    cambioAbsoluto: 0,        // Agregado
    variacion: 0,
    descripcion: "Inflación implícita en bonos CER vs Tasa Fija.",
    insight: "Revela la inflación que el mercado espera realmente ('Skin in the game').",
    Icono: Zap,
    color: "purple",
    historial: generarHistorial(4.5)
  },
  {
    id: "deuda-pbi",
    categoria: "fiscal",
    titulo: "Deuda / PBI",
    tipo: "calculated",
    valor: "85%",
    datoAnterior: "86.7%", // Agregado
    cambioAbsoluto: -1.7,  // Agregado
    variacion: -2,
    descripcion: "Ratio de solvencia soberana.",
    insight: "Mide la capacidad de pago real del país. Arriba del 100% es zona de riesgo crítico.",
    Icono: Scale,
    color: "purple",
    historial: generarHistorial(85)
  },

  // ========================================================================
  // 5. PRECIOS E INFLACIÓN
  // ========================================================================
  { 
    id: "inflacion-mensual", 
    categoria: "precios", 
    titulo: "Inflación Mensual", 
    tipo: "raw", 
    valor: "4.2%", 
    datoAnterior: "4.2%", // Agregado
    cambioAbsoluto: 0,    // Agregado
    variacion: -0.5, 
    esInverso: true, 
    Icono: TrendingDown, 
    subtexto: "Interanual: 210%",
    descripcion: "IPC Nivel General (INDEC).",
    historial: generarHistorial(4.2)
  },
  {
    id: "inflacion-nucleo",
    categoria: "precios",
    titulo: "Inflación Núcleo (Core)",
    tipo: "calculated",
    valor: "3.8%",
    datoAnterior: "3.8%", // Agregado
    cambioAbsoluto: 0,    // Agregado
    variacion: -0.2,
    descripcion: "Excluye regulados y estacionales.",
    insight: "Tendencia real de fondo. Es la métrica que mira el BCRA para la tasa.",
    Icono: Activity,
    color: "orange",
    esDestacado: true,
    historial: generarHistorial(3.8)
  },
  {
    id: "salario-real",
    categoria: "precios",
    titulo: "Salario Real (RIPTE)",
    tipo: "calculated",
    valor: "$ 980 USD",
    datoAnterior: "$ 1.000 USD", // Agregado
    cambioAbsoluto: -20,         // Agregado
    variacion: -2,
    descripcion: "Poder de compra ajustado por inflación.",
    insight: "Sin recuperación de esta métrica, el consumo no puede crecer.",
    Icono: Briefcase,
    color: "orange",
    historial: generarHistorial(980)
  },
  {
    id: "cobertura-tarifas",
    categoria: "precios",
    titulo: "Cobertura Tarifaria",
    tipo: "calculated",
    valor: "65%",
    datoAnterior: "62%",  // Agregado
    cambioAbsoluto: 3,    // Agregado
    variacion: 5,
    descripcion: "% del costo real de energía cubierto por boletas.",
    insight: "La diferencia (35%) son subsidios. Para tener superávit fiscal, este número debe tender a 100%.",
    Icono: Zap,
    color: "orange",
    historial: generarHistorial(65)
  },
  {
    id: "pass-through",
    categoria: "precios",
    titulo: "Coef. Pass-Through",
    tipo: "calculated",
    valor: "0.8",
    datoAnterior: "0.8",  // Agregado
    cambioAbsoluto: 0,    // Agregado
    variacion: 0,
    descripcion: "Traslado a precios de la devaluación.",
    insight: "Mide cuánto de una suba del dólar se va directo a inflación. En Argentina es altísimo.",
    Icono: TrendingUp,
    color: "rose",
    historial: generarHistorial(0.8)
  },

  // ========================================================================
  // 6. ACTIVIDAD ECONÓMICA
  // ========================================================================
  { 
    id: "pib", 
    categoria: "actividad", 
    titulo: "Crecimiento PIB", 
    tipo: "raw", 
    valor: "2.8%", 
    datoAnterior: "2.8%", // Agregado
    cambioAbsoluto: 0,    // Agregado
    variacion: 0.5, 
    Icono: TrendingUp, 
    subtexto: "Variación anual",
    descripcion: "Producto Bruto Interno.",
    historial: generarHistorial(2.8)
  },
  { 
    id: "actividad-industrial", 
    categoria: "actividad",
    titulo: "Actividad Industrial", 
    tipo: "raw", 
    valor: "-12.0%", 
    datoAnterior: "-12.2%", // Agregado
    cambioAbsoluto: 0.2,    // Agregado
    variacion: -1.5, 
    Icono: Factory,
    descripcion: "Índice de producción industrial manufacturero (IPI).",
    historial: generarHistorial(12)
  },
  {
    id: "desempleo", 
    categoria: "actividad", 
    titulo: "Desempleo",
    tipo: "raw", 
    valor: "6.8%", 
    datoAnterior: "6.8%", // Agregado
    cambioAbsoluto: 0,    // Agregado
    variacion: -0.2,
    esInverso: true, 
    Icono: Users,
    subtexto: "Trimestral",
    descripcion: "Tasa de desocupación abierta.",
    historial: generarHistorial(6.8)
  },
  {
    id: "empleo-privado",
    categoria: "actividad",
    titulo: "Empleo Privado",
    tipo: "raw", 
    valor: "6.3 M", 
    datoAnterior: "6.3 M", // Agregado
    cambioAbsoluto: 0,     // Agregado
    variacion: 0,
    descripcion: "Trabajadores en blanco sector privado (SIPA).",
    insight: "La única métrica de empleo de calidad que importa. Si cae, la crisis es estructural.",
    Icono: Users,
    color: "cyan",
    historial: generarHistorial(6.3)
  },
  {
    id: "recaudacion-iva",
    categoria: "actividad",
    titulo: "IVA DGI (Real)",
    tipo: "calculated",
    valor: "$ 4.2 B",
    datoAnterior: "$ 4.4 B", // Agregado
    cambioAbsoluto: -0.2,    // Agregado
    variacion: -5,
    descripcion: "Recaudación de IVA ajustada por inflación.",
    insight: "Es el mejor termómetro del consumo. Si cae, la recesión en la calle es peor de lo que dice el PBI.",
    Icono: ShoppingCart, 
    color: "cyan",
    historial: generarHistorial(4.2)
  },
  {
    id: "costo-construccion-usd",
    categoria: "actividad",
    titulo: "Costo Construcción (m²)",
    tipo: "calculated",
    valor: "US$ 1.100",
    datoAnterior: "US$ 982", // Agregado
    cambioAbsoluto: 118,     // Agregado
    variacion: 12,
    descripcion: "Costo de reposición por metro cuadrado.",
    insight: "Indica si el dólar está 'atrasado'. Si construir es caro en dólares, Argentina se encareció.",
    Icono: Building2,
    color: "cyan",
    historial: generarHistorial(1100)
  },
  // --- SUBSECTOR EXTERNO ---
  {
    id: "balanza-energetica",
    categoria: "externo",
    titulo: "Balanza Energética",
    tipo: "calculated",
    valor: "+ US$ 200M",
    datoAnterior: "+ US$ 133 M", // Agregado
    cambioAbsoluto: 67,           // Agregado
    variacion: 50,
    descripcion: "Exportaciones - Importaciones de energía.", // Corregido el texto cortado
    Icono: Zap,                   // Agregado Icono por consistencia visual
    color: "cyan",
    historial: generarHistorial(200)
  }
];