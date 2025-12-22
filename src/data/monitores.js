import { DollarSign, Activity, Briefcase, TrendingUp, TrendingDown, Factory, Scale, Users } from 'lucide-react';

export const misIndicadores = [
  // --- 1. MERCADO CAMBIARIO (Dólar) ---
  { 
    id: "dolar-blue", 
    categoria: "cambiario",  // <--- CLAVE: Dice "cambiario"
    titulo: "Dólar Blue", 
    valor: "$1.200", 
    variacion: 2.5, 
    esInverso: true, 
    Icono: DollarSign, 
    subtexto: "Brecha: 20%",
    descripcion: "Cotización del dólar en el mercado informal de cambios."
  },
  { 
    id: "dolar-mep", 
    categoria: "cambiario",
    titulo: "Dólar MEP", 
    valor: "$1.150", 
    variacion: 1.8, 
    Icono: DollarSign, 
    subtexto: "Bolsa" 
  },

  // --- 2. MERCADO FINANCIERO (Riesgo, Bonos) ---
  { 
    id: "riesgo-pais", 
    categoria: "financiero", // <--- CLAVE: Dice "financiero" (con O)
    titulo: "Riesgo País", 
    valor: "1.450 pts", 
    variacion: -2.1, 
    esInverso: true, 
    Icono: Activity,
    descripcion: "Índice que mide la sobretasa que paga Argentina."
  },
  { 
    id: "merval", 
    categoria: "financiero",
    titulo: "Merval (S&P)", 
    valor: "1.120.500", 
    variacion: 3.4, 
    Icono: TrendingUp 
  },

  // --- 3. MONETARIO (Reservas) ---
  { 
    id: "reservas-bcra", 
    categoria: "monetario", 
    titulo: "Reservas BCRA", 
    valor: "US$ 24.000M", 
    variacion: 1.2, 
    Icono: Briefcase, 
    subtexto: "Objetivo: 30MM" 
  },

  // --- 4. ECONOMÍA REAL / ACTIVIDAD ---
  { 
    id: "inflacion-mensual", 
    categoria: "precios", // (O "economia" según como lo tengas en sectores.js, usaremos 'precios' si creaste ese sector)
    titulo: "Inflación Mensual", 
    valor: "12.4%", 
    variacion: -0.5, 
    esInverso: true, 
    Icono: TrendingDown, 
    subtexto: "Interanual: 210%" 
  },
  { 
    id: "actividad-industrial", 
    categoria: "actividad",
    titulo: "Actividad Industrial", 
    valor: "-12.0%", 
    variacion: -1.5, 
    Icono: Factory 
  },
  
  // --- 5. FISCAL ---
  {
    id: "superavit-fiscal",
    categoria: "fiscal",
    titulo: "Superávit Fiscal",
    valor: "$518.000M",
    variacion: 0.8,
    Icono: Scale
  }
];