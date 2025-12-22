import { 
  Banknote, 
  Landmark, 
  Scale, 
  ShoppingBag, 
  Factory, 
  Users, 
  BookOpen, 
  BrainCircuit, 
  Database,
  CircleDollarSign, // <--- NUEVO ICONO PARA CAMBIARIO
  LineChart         // <--- NUEVO ICONO PARA FINANCIERO
} from 'lucide-react';

export const sectores = [
  // --- SECTORES PRINCIPALES ---
  {
    id: "monetario",
    titulo: "Monetario",
    subtitulo: "Reservas y agregados",
    descripcion: "Base monetaria, reservas del BCRA, Leliqs y circulación monetaria.",
    Icono: Banknote,
    color: "emerald"
  },
  {
    id: "cambiario", // <--- NUEVO SECTOR 1
    titulo: "Mercado Cambiario",
    subtitulo: "Dólar y Divisas",
    descripcion: "Tipos de cambio (Blue, MEP, CCL, Mayorista) y brecha cambiaria.",
    Icono: CircleDollarSign,
    color: "emerald"
  },
  {
    id: "financiero", // <--- NUEVO SECTOR 2
    titulo: "Mercado Financiero",
    subtitulo: "Bonos, Acciones y Riesgo País ",
    descripcion: "Riesgo País, Merval (S&P), Bonos Soberanos y Tasas de Interés.",
    Icono: LineChart,
    color: "emerald"
  },
  {
    id: "fiscal",
    titulo: "Sector Fiscal",
    subtitulo: "Cuentas públicas",
    descripcion: "Recaudación tributaria, gasto público primario, déficit y deuda pública.",
    Icono: Scale,
    color: "emerald"
  },
  {
    id: "precios",
    titulo: "Precios e Inflación",
    subtitulo: "IPC y Canastas",
    descripcion: "Inflación mensual/interanual, precios mayoristas y costo de construcción.",
    Icono: ShoppingBag,
    color: "emerald"
  },
  {
    id: "actividad",
    titulo: "Actividad Económica",
    subtitulo: "PBI e Industria",
    descripcion: "Estimador mensual (EMAE), uso de capacidad instalada y despachos de cemento.",
    Icono: Factory,
    color: "emerald"
  },
  {
    id: "laboral",
    titulo: "Mercado Laboral",
    subtitulo: "Empleo y Salarios",
    descripcion: "Tasa de desempleo, empleo registrado, RIPTE e índice de salarios.",
    Icono: Users,
    color: "emerald"
  },

  // --- HERRAMIENTAS ---
  {
    id: "analytics",
    titulo: "Analytics & IA",
    subtitulo: "Análisis avanzado",
    descripcion: "Proyecciones y análisis de tendencias.",
    Icono: BrainCircuit,
    color: "violet"
  },
  {
    id: "glosario",
    titulo: "Glosario",
    subtitulo: "Diccionario",
    descripcion: "Definiciones de términos económicos.",
    Icono: BookOpen,
    color: "teal"
  },
  {
    id: "base-datos",
    titulo: "Exportar",
    subtitulo: "Datos Premium",
    descripcion: "Descarga de series históricas.",
    Icono: Database,
    color: "slate"
  }
];