import { LineChart, BarChart3, Wallet, Building2, TrendingUp } from 'lucide-react';

export const cursos = [
  {
    id: 'course_1',
    type: 'curso',
    title: 'Master en Análisis Técnico', // [CHANGE] Standardized key
    description: 'Domina la lectura de gráficos, patrones de velas y osciladores avanzados para operar como un institucional.', // [CHANGE] Standardized key
    price: 45000, // [CHANGE] Standardized key
    nivel: 'Intermedio',
    duracion: '12 Horas',
    estudiantes: 1240,
    rating: 4.8,
    badge: 'BEST SELLER',
    color: 'emerald',
    Icono: LineChart,
    image: 'https://images.unsplash.com/photo-1611974765270-ca12586343bb?q=80&w=1000&auto=format&fit=crop' // [CHANGE] Standardized key
  },
  {
    id: 'course_2',
    type: 'curso',
    title: 'Valuación de Empresas (DCF)',
    description: 'Aprende a calcular el valor intrínseco de una compañía utilizando el método de Flujos de Fondos Descontados.',
    price: 55000,
    nivel: 'Avanzado',
    duracion: '18 Horas',
    estudiantes: 850,
    rating: 4.9,
    badge: 'NUEVO',
    color: 'blue',
    Icono: Building2,
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'course_3',
    type: 'curso',
    title: 'Bonos y Renta Fija Arg.',
    description: 'Guía completa sobre Renta Fija Argentina: Bonos Soberanos, ONs, CER y Dollar Link.',
    price: 35000,
    nivel: 'Principiante',
    duracion: '8 Horas',
    estudiantes: 2100,
    rating: 4.7,
    badge: null,
    color: 'rose',
    Icono: TrendingUp,
    image: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'course_4',
    type: 'curso',
    title: 'Gestión de Portafolios',
    description: 'Cómo armar una cartera "All-Weather" que resista inflación, deflación y crisis cambiarias.',
    price: 42000,
    nivel: 'Intermedio',
    duracion: '10 Horas',
    estudiantes: 940,
    rating: 4.8,
    badge: 'RECOMENDADO',
    color: 'violet',
    Icono: Wallet,
    image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=1000&auto=format&fit=crop'
  }
];