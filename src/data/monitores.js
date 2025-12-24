import { DollarSign, Activity, Briefcase, TrendingUp, TrendingDown, Factory, Scale, Users, Percent } from 'lucide-react';

export const misIndicadores = [
  // --- 1. MERCADO CAMBIARIO (Dólar) ---
  { 
    id: "dolar-blue", 
    categoria: "cambiario",
    titulo: "Dólar Blue", 
    valor: "$1.200", 
    variacion: 2.5, 
    esInverso: true, 
    Icono: DollarSign, 
    descripcion: "Cotización del dólar en el mercado informal de cambios.",
    datoAnterior: "$1.170",
    cambioAbsoluto: "$30",
    subtexto: "BYMA",
    historial: [
      { fecha: 'Ene', valor: 1000 },
      { fecha: 'Feb', valor: 1050 },
      { fecha: 'Mar', valor: 1020 },
      { fecha: 'Abr', valor: 1080 },
      { fecha: 'May', valor: 1150 },
      { fecha: 'Jun', valor: 1200 },
    ]
  },
  { 
    id: "dolar-mep", 
    categoria: "cambiario",
    titulo: "Dólar MEP", 
    valor: "$1.150", 
    variacion: 1.8, 
    Icono: DollarSign, 
    subtexto: "Bolsa",
    historial: [
      { fecha: 'Ene', valor: 1000 },
      { fecha: 'Feb', valor: 1050 },
      { fecha: 'Mar', valor: 1020 },
      { fecha: 'Abr', valor: 1080 },
      { fecha: 'May', valor: 1150 },
      { fecha: 'Jun', valor: 1200 },
    ]
  },

  // --- 2. MERCADO FINANCIERO (Riesgo, Bonos) ---
  { 
    id: "riesgo-pais", 
    categoria: "financiero",
    titulo: "Riesgo País", 
    valor: "1.450 pts", 
    variacion: -2.1, 
    esInverso: true, 
    Icono: Activity,
    descripcion: "Índice que mide la sobretasa que paga Argentina.",
    historial: [
      { fecha: 'Ene', valor: 1600 },
      { fecha: 'Feb', valor: 1550 },
      { fecha: 'Mar', valor: 1500 },
      { fecha: 'Abr', valor: 1480 },
      { fecha: 'May', valor: 1460 },
      { fecha: 'Jun', valor: 1450 },
    ]
  },
  { 
    id: "merval", 
    categoria: "financiero",
    titulo: "Merval (S&P)", 
    valor: "1.120.500", 
    variacion: 3.4, 
    Icono: TrendingUp,
    historial: [
      { fecha: 'Ene', valor: 1000 },
      { fecha: 'Feb', valor: 1050 },
      { fecha: 'Mar', valor: 1020 },
      { fecha: 'Abr', valor: 1080 },
      { fecha: 'May', valor: 1150 },
      { fecha: 'Jun', valor: 1200 },
    ]
  },

  // --- 3. MONETARIO (Reservas, Tasas) ---
  { 
    id: "reservas-bcra", 
    categoria: "monetario", 
    titulo: "Reservas BCRA", 
    valor: "US$ 24.000M", 
    variacion: 1.2, 
    Icono: Briefcase, 
    subtexto: "Objetivo: 30MM",
    historial: [
      { fecha: 'Ene', valor: 1000 },
      { fecha: 'Feb', valor: 1050 },
      { fecha: 'Mar', valor: 1020 },
      { fecha: 'Abr', valor: 1080 },
      { fecha: 'May', valor: 1150 },
      { fecha: 'Jun', valor: 1200 },
    ] 
  },
  { 
    id: "tasa", // <--- Requerido por IA)
    categoria: "monetario", 
    titulo: "Tasa de Política Monetaria", 
    valor: "118%", 
    variacion: 0, 
    Icono: Percent, // Importante: Asegurate de importar 'Percent' arriba si querés este ícono, o usá Scale
    subtexto: "TNA",
    historial: [
      { fecha: 'Ene', valor: 1000 },
      { fecha: 'Feb', valor: 1050 },
      { fecha: 'Mar', valor: 1020 },
      { fecha: 'Abr', valor: 1080 },
      { fecha: 'May', valor: 1150 },
      { fecha: 'Jun', valor: 1200 },
    ] 
  },

  // --- 4. ECONOMÍA REAL / ACTIVIDAD ---
  { 
    id: "inflacion-mensual", // <---  IA
    categoria: "precios", 
    titulo: "Inflación Mensual", 
    valor: "4.2%", 
    variacion: -0.5, 
    esInverso: true, 
    Icono: TrendingDown, 
    subtexto: "Interanual: 210%",
    historial: [
      { fecha: 'Ene', valor: 1000 },
      { fecha: 'Feb', valor: 1050 },
      { fecha: 'Mar', valor: 1020 },
      { fecha: 'Abr', valor: 1080 },
      { fecha: 'May', valor: 1150 },
      { fecha: 'Jun', valor: 1200 },
    ] 
  },
  { 
    id: "pib", // (Requerido por IA)
    categoria: "actividad", 
    titulo: "Crecimiento PIB", 
    valor: "2.8%", 
    variacion: 0.5, 
    Icono: TrendingUp, 
    subtexto: "Variación anual",
    historial: [
      { fecha: 'Ene', valor: 1000 },
      { fecha: 'Feb', valor: 1050 },
      { fecha: 'Mar', valor: 1020 },
      { fecha: 'Abr', valor: 1080 },
      { fecha: 'May', valor: 1150 },
      { fecha: 'Jun', valor: 1200 },
    ] 
  },
  { 
    id: "actividad-industrial", 
    categoria: "actividad",
    titulo: "Actividad Industrial", 
    valor: "-12.0%", 
    variacion: -1.5, 
    Icono: Factory,
    historial: [
      { fecha: 'Ene', valor: 1000 },
      { fecha: 'Feb', valor: 1050 },
      { fecha: 'Mar', valor: 1020 },
      { fecha: 'Abr', valor: 1080 },
      { fecha: 'May', valor: 1150 },
      { fecha: 'Jun', valor: 1200 },
    ] 
  },
  {
    id: "desempleo", // <--(Requerido por IA)
    categoria: "actividad", 
    titulo: "Desempleo",
    valor: "6.8%",
    variacion: -0.2,
    esInverso: true,
    Icono: Users,
    subtexto: "Trimestral",
    historial: [
      { fecha: 'Ene', valor: 1000 },
      { fecha: 'Feb', valor: 1050 },
      { fecha: 'Mar', valor: 1020 },
      { fecha: 'Abr', valor: 1080 },
      { fecha: 'May', valor: 1150 },
      { fecha: 'Jun', valor: 1200 },
    ]
  },
  
  // --- 5. FISCAL ---
  {
    id: "superavit-fiscal",
    categoria: "fiscal",
    titulo: "Superávit Fiscal",
    valor: "$518.000M",
    variacion: 0.8,
    Icono: Scale,
    historial: [
      { fecha: 'Ene', valor: 1000 },
      { fecha: 'Feb', valor: 1050 },
      { fecha: 'Mar', valor: 1020 },
      { fecha: 'Abr', valor: 1080 },
      { fecha: 'May', valor: 1150 },
      { fecha: 'Jun', valor: 1200 },
    ]
  }
];