// src/data/libros.js
import { BookOpen, TrendingUp, BarChart, DollarSign } from 'lucide-react';

export const libros = [
  {
    id: 'book_1',
    type: 'libro',
    title: 'El Inversor Inteligente', // [CHANGE] Standardized key
    author: 'Benjamin Graham',
    description: 'La biblia del Value Investing. Aprende a distinguir entre inversión y especulación con el mentor de Warren Buffett.', // [CHANGE] Standardized key
    price: 28500, // [CHANGE] Standardized key
    badge: 'CLÁSICO',
    rating: 5.0,
    reviewsCount: 3200,
    color: 'amber',
    Icono: BookOpen,
    meta: { delivery: 'Envío Gratis', fileType: 'Físico' },
    image: 'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?q=80&w=600&auto=format&fit=crop' // [CHANGE] Standardized key
  },
  {
    id: 'book_2',
    type: 'libro',
    title: 'Análisis Técnico de los Mercados',
    author: 'John J. Murphy',
    description: 'El manual definitivo para entender gráficos, tendencias y patrones visuales. Lectura obligatoria para traders.',
    price: 42000,
    badge: 'BEST SELLER',
    rating: 4.8,
    reviewsCount: 1500,
    color: 'emerald',
    Icono: TrendingUp,
    meta: { delivery: '24hs', fileType: 'Físico' },
    image: 'https://images.unsplash.com/photo-1611974765270-ca12586343bb?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'book_3',
    type: 'recurso',
    title: 'Plantilla de Valuación (Excel)',
    author: 'MonitorEco Team',
    description: 'Spreadsheet automatizada para realizar DCF (Discounted Cash Flow) de empresas argentinas.',
    price: 15000,
    badge: 'DIGITAL',
    rating: 4.9,
    reviewsCount: 450,
    color: 'blue',
    Icono: BarChart,
    meta: { delivery: 'Email Inmediato', fileType: 'XLSX' },
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'book_4',
    type: 'libro',
    title: 'Psicología del Dinero',
    author: 'Morgan Housel',
    description: 'Lecciones atemporales sobre riqueza, codicia y felicidad. Cómo comportarse es más importante que qué saber.',
    price: 22000,
    badge: 'TENDENCIA',
    rating: 4.7,
    reviewsCount: 890,
    color: 'violet',
    Icono: DollarSign,
    meta: { delivery: 'Envío Gratis', fileType: 'Físico' },
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=600&auto=format&fit=crop'
  }
];