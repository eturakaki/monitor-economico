// src/data/herramientas.js
import { BookOpen, BarChart2, Download, Calculator, Database } from 'lucide-react';

export const herramientas = [
  { 
    id: "analytics", 
    titulo: "Analytics & IA", 
    ruta: "/analytics", 
    Icono: BarChart2, 
    color: "violet",
    descripcion: "Tableros avanzados y predicciones."
  },
  { 
    id: "glosario", 
    titulo: "Glosario", 
    ruta: "/glosario", 
    Icono: BookOpen, 
    color: "blue",
    descripcion: "Diccionario de términos económicos."
  },
  { 
    id: "exportar", 
    titulo: "Exportar Datos", 
    ruta: "/exportar", 
    Icono: Download, 
    color: "orange",
    descripcion: "Descarga series históricas en CSV/Excel."
  },
  { 
    id: "calculadora", 
    titulo: "Herramientas Financieras", 
    ruta: "/herramientas", 
    Icono: Calculator, 
    color: "emerald",
    descripcion: "Conversor de monedas y ajustes por inflación."
  },
  /*{ 
    id: "api", 
    titulo: "API Docs", 
    ruta: "/docs", 
    Icono: Database, 
    color: "gray",
    descripcion: "Documentación para desarrolladores."
  }*/
];