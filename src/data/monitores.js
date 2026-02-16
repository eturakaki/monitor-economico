// src/data/monitores.js
// src/data/monitores.js
import { 
  // Iconos Generales y Financieros
  DollarSign, 
  Activity, 
  Briefcase, 
  TrendingUp, 
  TrendingDown, 
  Percent, 
  Landmark, 
  ArrowLeftRight, 
  Globe, 
  Zap, 
  BarChart3, 
  Scale,

  // Iconos de Industria y Comercio
  Factory, 
  Building2, 
  Users, 
  ShoppingCart, 
  FileText, // Nuevo para contratos/alquileres
  
  // Opcionales (si tu versión de Lucide los tiene, sino borralos)
  Wheat,    // Para Agro/Soja
  Car       // Para Autos
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
    id: "dolar-oficial", 
    categoria: "cambiario",
    titulo: "Dólar Oficial (Mayorista)", 
    tipo: "raw", 
    valor: "$ 1.015", 
    datoAnterior: "$ 1.014",
    cambioAbsoluto: 1,
    variacion: 0.1, 
    Icono: Landmark, // Representa al BCRA
    descripcion: "Tipo de cambio de referencia A3500 (BCRA).",
    subtexto: "Crawl 2% mensual",
    historial: generarHistorial(1015, 0.005) // Volatilidad baja (Crawl)
  },
  { 
    id: "dolar-minorista", 
    categoria: "cambiario",
    titulo: "Dólar Minorista", 
    tipo: "raw", 
    valor: "$ 1.060", 
    datoAnterior: "$ 1.058",
    cambioAbsoluto: 2,
    variacion: 0.2, 
    Icono: DollarSign, 
    descripcion: "Promedio vendedor bancos (BCRA).",
    historial: generarHistorial(1060, 0.01)
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
    id: "bopreal",
    categoria: "financiero",
    titulo: "BOPREAL (Serie 1)",
    tipo: "raw", 
    valor: "US$ 92.50", 
    datoAnterior: "US$ 91.00",
    cambioAbsoluto: 1.5,
    variacion: 1.6,
    descripcion: "Bono para importadores (Paridad).",
    insight: "Si sube de precio, baja el costo de salida para importadores (CCL implícito).",
    Icono: FileText,
    color: "indigo",
    historial: generarHistorial(92.5)
  },
  {
    id: "lecaps",
    categoria: "financiero",
    titulo: "Lecaps (Tasa Ref)",
    tipo: "raw", 
    valor: "3.8% TEM", 
    datoAnterior: "3.9% TEM",
    cambioAbsoluto: -0.1,
    variacion: -2.5,
    descripcion: "Letras del Tesoro Capitalizables.",
    insight: "La nueva tasa de referencia de corto plazo del modelo.",
    Icono: TrendingUp,
    historial: generarHistorial(3.8)
  },
  {
    id: "ons-corporativas",
    categoria: "financiero",
    titulo: "ONs Corporativas (TIR)",
    tipo: "calculated", 
    valor: "7.5%", 
    datoAnterior: "7.8%",
    cambioAbsoluto: -0.3,
    variacion: -3.8,
    descripcion: "Rendimiento promedio deuda empresas privadas (Hard Dollar).",
    insight: "Refugio de valor conservador. Si la tasa baja, hay mucha demanda por 'seguridad'.",
    Icono: Briefcase,
    historial: generarHistorial(7.5)
  },
  {
    id: "argendolares",
    categoria: "financiero",
    titulo: "Argendólares (Stock)",
    tipo: "raw", 
    valor: "US$ 32.500M", 
    datoAnterior: "US$ 32.200M",
    cambioAbsoluto: 300,
    variacion: 0.9,
    descripcion: "Depósitos privados en dólares en bancos.",
    insight: "Termómetro de confianza. Si caen, hay pánico sistémico (como en 2001 o 2019).",
    Icono: Briefcase,
    color: "emerald",
    esDestacado: true,
    historial: generarHistorial(32500)
  },
  {
    id: "mora-bancaria",
    categoria: "financiero",
    titulo: "Mora Bancaria (NPL)",
    tipo: "raw", 
    valor: "3.1%", 
    datoAnterior: "2.9%",
    cambioAbsoluto: 0.2,
    variacion: 6.9,
    esInverso: true,
    descripcion: "Ratio de irregularidad del crédito.",
    Icono: Activity,
    color: "rose",
    historial: generarHistorial(3.1)
  },
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
  {
    id: "valor-uva",
    categoria: "financiero",
    titulo: "Valor UVA",
    tipo: "raw", 
    valor: "$ 985.50", 
    datoAnterior: "$ 980.20",
    cambioAbsoluto: 5.3,
    variacion: 0.5,
    descripcion: "Unidad de Valor Adquisitivo (Ajusta por CER).",
    Icono: TrendingUp,
    historial: generarHistorial(985)
  },
  {
    id: "icl-alquileres",
    categoria: "financiero",
    titulo: "ICL (Alquileres)",
    tipo: "raw", 
    valor: "18.5", 
    datoAnterior: "18.0",
    cambioAbsoluto: 0.5,
    variacion: 2.7,
    descripcion: "Índice de Contratos de Locación (BCRA).",
    Icono: FileText, // Asegúrate de importar FileText o usa Scale
    historial: generarHistorial(18.5)
  },
  {
    id: "adrs-argentinos",
    categoria: "financiero",
    titulo: "ADRs Promedio",
    tipo: "calculated",
    valor: "US$ 18.40", 
    datoAnterior: "US$ 18.10",
    cambioAbsoluto: 0.3,
    variacion: 1.6,
    descripcion: "Promedio de cotización activos locales en Wall Street.",
    Icono: Globe,
    color: "indigo",
    historial: generarHistorial(18.4)
  },

  // ========================================================================
  // 3. SECTOR MONETARIO
  // ========================================================================
  {
    id: "reservas-netas",
    categoria: "monetario",
    titulo: "Reservas Netas (RIN)",
    tipo: "calculated", 
    valor: "US$ 5.500M", 
    datoAnterior: "US$ 5.200M",
    cambioAbsoluto: 300,
    variacion: 5.7,
    descripcion: "Reservas Brutas menos encajes y swap.",
    insight: "El verdadero poder de fuego del BCRA. Es la meta principal con el FMI.",
    Icono: Landmark,
    color: "emerald",
    historial: generarHistorial(5500)
  },
  {
    id: "base-monetaria-amplia",
    categoria: "monetario",
    titulo: "Base Monetaria Amplia",
    tipo: "calculated", 
    valor: "$ 48.0 T", 
    datoAnterior: "$ 47.5 T",
    cambioAbsoluto: 0.5,
    variacion: 1.1,
    descripcion: "Base monetaria + Pasivos Remunerados + Puts.",
    insight: "Mide la 'emisión latente'. Si crece más rápido que la inflación, hay riesgo.",
    Icono: Landmark,
    historial: generarHistorial(48000)
  },
  {
    id: "intervencion-mulc",
    categoria: "monetario",
    titulo: "Intervención BCRA (Diaria)",
    tipo: "raw", 
    valor: "US$ 80 M", 
    datoAnterior: "US$ 45 M",
    cambioAbsoluto: 35,
    variacion: 77,
    descripcion: "Compras/Ventas netas de dólares en mercado oficial.",
    insight: "Clave seguir las 'rachas compradoras' para acumular reservas.",
    Icono: ArrowLeftRight,
    color: "emerald",
    historial: generarHistorial(80)
  },
  {
    id: "tm20",
    categoria: "monetario",
    titulo: "Tasa TM20",
    tipo: "raw", 
    valor: "38% TNA", 
    datoAnterior: "37.5%",
    cambioAbsoluto: 0.5,
    variacion: 1.3,
    descripcion: "Tasa de plazo fijo mayorista (>20M).",
    Icono: Percent,
    historial: generarHistorial(38)
  },
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
    id: "pasivos-remunerados",
    categoria: "monetario",
    titulo: "Pasivos Remunerados",
    tipo: "raw", 
    valor: "$ 30.5 T", 
    datoAnterior: "$ 30.2 T",
    cambioAbsoluto: 0.3,
    variacion: 1.0,
    descripcion: "Stock de Pases/Leliq (Deuda del BCRA).",
    insight: "Principal fuente de emisión endógena futura.",
    Icono: Landmark,
    color: "blue",
    historial: generarHistorial(30500)
  },
  {
    id: "depositos-pesos",
    categoria: "monetario",
    titulo: "Depósitos en Pesos",
    tipo: "raw", 
    valor: "$ 45.2 T", 
    datoAnterior: "$ 44.0 T",
    cambioAbsoluto: 1.2,
    variacion: 2.7,
    descripcion: "Total de depósitos del sector privado.",
    Icono: Landmark, // O Database si prefieres
    historial: generarHistorial(45200)
  },
  {
    id: "prestamos-privados",
    categoria: "monetario",
    titulo: "Préstamos al Sector Privado",
    tipo: "raw", 
    valor: "$ 18.5 T", 
    datoAnterior: "$ 18.0 T",
    cambioAbsoluto: 0.5,
    variacion: 2.8,
    descripcion: "Crédito total al sector privado.",
    insight: "Si crece por encima de la inflación, hay reactivación real.",
    Icono: Activity,
    color: "blue",
    historial: generarHistorial(18500)
  },
  {
    id: "tasa-badlar",
    categoria: "monetario",
    titulo: "Tasa Badlar",
    tipo: "raw", 
    valor: "105% TNA", 
    datoAnterior: "105%",
    cambioAbsoluto: 0,
    variacion: 0,
    descripcion: "Tasa para plazos fijos mayoristas (>1M).",
    Icono: Percent,
    historial: generarHistorial(105, 0.01)
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
  {
    id: "recaudacion-total",
    categoria: "fiscal",
    titulo: "Recaudación Tributaria",
    tipo: "raw", 
    valor: "$ 11.5 B", 
    datoAnterior: "$ 10.8 B",
    cambioAbsoluto: 0.7,
    variacion: 6.4,
    descripcion: "Ingresos totales AFIP.",
    insight: "Clave monitorear caída real por recesión vs nominalidad.",
    Icono: Landmark,
    color: "purple",
    historial: generarHistorial(11500)
  },
  {
    id: "gasto-primario",
    categoria: "fiscal",
    titulo: "Gasto Público Primario",
    tipo: "raw", 
    valor: "$ 9.8 B", 
    datoAnterior: "$ 9.5 B",
    cambioAbsoluto: 0.3,
    variacion: 3.1,
    descripcion: "Gasto antes de intereses de deuda.",
    insight: "La 'motosierra' se mide aquí.",
    Icono: Scale,
    color: "purple",
    historial: generarHistorial(9800)
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
    id: "ipim-mayorista",
    categoria: "precios",
    titulo: "IPIM (Mayorista)",
    tipo: "raw", 
    valor: "3.5%", 
    datoAnterior: "3.2%",
    cambioAbsoluto: 0.3,
    variacion: 9.3,
    esInverso: true,
    descripcion: "Precios al por mayor (Indice adelantado).",
    insight: "Si es mayor al IPC, presiona inflación futura.",
    Icono: Factory,
    color: "orange",
    historial: generarHistorial(3.5)
  },
  {
    id: "rem-inflacion",
    categoria: "precios",
    titulo: "REM (Expectativa 12m)",
    tipo: "raw", 
    valor: "140%", 
    datoAnterior: "150%",
    cambioAbsoluto: -10,
    variacion: -6.6,
    esInverso: true,
    descripcion: "Relevamiento de Expectativas de Mercado (BCRA).",
    Icono: Activity,
    historial: generarHistorial(140)
  },
  {
    id: "canasta-total",
    categoria: "precios",
    titulo: "Canasta Básica (CBT)",
    tipo: "raw", 
    valor: "$ 980.000", 
    datoAnterior: "$ 950.000",
    cambioAbsoluto: 30000,
    variacion: 3.1,
    esInverso: true,
    descripcion: "Línea de Pobreza (Familia tipo).",
    Icono: ShoppingCart,
    color: "rose",
    historial: generarHistorial(980000)
  },
  {
    id: "canasta-alimentaria",
    categoria: "precios",
    titulo: "Canasta Alim. (CBA)",
    tipo: "raw", 
    valor: "$ 450.000", 
    datoAnterior: "$ 435.000",
    cambioAbsoluto: 15000,
    variacion: 3.4,
    esInverso: true,
    descripcion: "Línea de Indigencia.",
    Icono: ShoppingCart,
    color: "rose",
    historial: generarHistorial(450000)
  },
  {
    id: "commodities-agro",
    categoria: "precios",
    titulo: "Soja (Chicago)",
    tipo: "raw", 
    valor: "US$ 420", 
    datoAnterior: "US$ 415",
    cambioAbsoluto: 5,
    variacion: 1.2,
    descripcion: "Precio internacional tonelada de Soja.",
    insight: "Motor de ingreso de dólares para reservas.",
    Icono: Globe, // O Wheat si lo importas
    color: "emerald",
    historial: generarHistorial(420)
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
    id: "inversion-fbcf",
    categoria: "actividad",
    titulo: "Inversión (FBCF)",
    tipo: "raw", 
    valor: "-15%", 
    datoAnterior: "-18%",
    cambioAbsoluto: 3,
    variacion: 16,
    descripcion: "Formación Bruta de Capital Fijo.",
    insight: "Mide la inversión real (máquinas, construcciones). Clave para crecimiento futuro.",
    Icono: Building2,
    color: "cyan",
    historial: generarHistorial(15)
  },
  {
    id: "despachos-cemento",
    categoria: "actividad",
    titulo: "Despachos Cemento",
    tipo: "raw", 
    valor: "850.000 tn", 
    datoAnterior: "820.000 tn",
    cambioAbsoluto: 30000,
    variacion: 3.6,
    descripcion: "Indicador líder de la construcción.",
    Icono: Factory,
    historial: generarHistorial(850000)
  },
  {
    id: "confianza-consumidor",
    categoria: "actividad",
    titulo: "Confianza Consumidor",
    tipo: "raw", 
    valor: "42.5 pts", 
    datoAnterior: "40.1 pts",
    cambioAbsoluto: 2.4,
    variacion: 6.0,
    descripcion: "Índice UTDT. Predice consumo y clima político.",
    Icono: Users, // O Zap si prefieres
    historial: generarHistorial(42.5)
  },
  {
    id: "importaciones-ica",
    categoria: "externo",
    titulo: "Importaciones (ICA)",
    tipo: "raw", 
    valor: "US$ 4.800M", 
    datoAnterior: "US$ 4.500M",
    cambioAbsoluto: 300,
    variacion: 6.6,
    descripcion: "Compras al exterior (INDEC).",
    insight: "Si suben los Bienes de Capital, es señal de inversión. Si suben insumos, es actividad.",
    Icono: Globe,
    historial: generarHistorial(4800)
  },
  {
    id: "tasa-actividad",
    categoria: "actividad", // O Laboral
    titulo: "Tasa de Actividad",
    tipo: "raw", 
    valor: "48.5%", 
    datoAnterior: "48.0%",
    cambioAbsoluto: 0.5,
    variacion: 1.0,
    descripcion: "Población que trabaja o busca trabajo.",
    Icono: Users,
    historial: generarHistorial(48.5)
  },
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
    id: "emae",
    categoria: "actividad",
    titulo: "EMAE (Actividad)",
    tipo: "raw", 
    valor: "-3.2%", 
    datoAnterior: "-3.5%",
    cambioAbsoluto: 0.3,
    variacion: 0.3,
    descripcion: "Estimador Mensual de Actividad Económica (PBI mensual).",
    Icono: Activity,
    historial: generarHistorial(3.2)
  },
  {
    id: "isac-construccion",
    categoria: "actividad",
    titulo: "ISAC (Construcción)",
    tipo: "raw", 
    valor: "-20.5%", 
    datoAnterior: "-22.0%",
    cambioAbsoluto: 1.5,
    variacion: 1.5,
    descripcion: "Indicador Sintético de la Construcción.",
    Icono: Building2,
    color: "cyan",
    historial: generarHistorial(20.5)
  },
  {
    id: "capacidad-instalada",
    categoria: "actividad",
    titulo: "Uso Capacidad Instalada",
    tipo: "raw", 
    valor: "54.5%", 
    datoAnterior: "53.0%",
    cambioAbsoluto: 1.5,
    variacion: 2.8,
    descripcion: "Porcentaje de uso de fábricas.",
    insight: "Niveles bajos indican recesión profunda.",
    Icono: Factory,
    historial: generarHistorial(54.5)
  },
  {
    id: "consumo-super",
    categoria: "actividad",
    titulo: "Ventas Supermercados",
    tipo: "raw", 
    valor: "-11.0%", 
    datoAnterior: "-12.5%",
    cambioAbsoluto: 1.5,
    variacion: 1.5,
    descripcion: "Variación interanual volumen de ventas.",
    Icono: ShoppingCart,
    color: "rose",
    historial: generarHistorial(11)
  },
  {
    id: "patentamientos",
    categoria: "actividad",
    titulo: "Patentamientos Autos",
    tipo: "raw", 
    valor: "32.000 un.", 
    datoAnterior: "30.500 un.",
    cambioAbsoluto: 1500,
    variacion: 4.9,
    descripcion: "Venta de autos 0km (ACARA).",
    Icono: Activity, // O Car si existiera
    historial: generarHistorial(32000)
  },
  {
    id: "indice-salarios",
    categoria: "actividad", // O categoria Laboral si creas una nueva
    titulo: "Índice de Salarios",
    tipo: "raw", 
    valor: "1550 pts", 
    datoAnterior: "1400 pts",
    cambioAbsoluto: 150,
    variacion: 10.7,
    descripcion: "Evolución general de salarios (INDEC).",
    insight: "Comparar siempre vs Inflación mensual.",
    Icono: Users,
    color: "cyan",
    historial: generarHistorial(1550)
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