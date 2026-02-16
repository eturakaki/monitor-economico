import { Zap, Shield, Crown } from 'lucide-react';

export const planes = [
  {
    id: 'starter',
    name: 'Inicial', // Unifiqué 'title' a 'name' para consistencia con ProductCard
    price: 0,
    currency: '$',
    period: '/mes',
    description: 'Para curiosos y estudiantes.',
    icon: Zap,
    recommended: false, // Equivale a tu isPremium: false
    badge: null,
    cta: 'Comenzar Gratis',
    features: [
      { text: 'Acceso al Dashboard en vivo', included: true },
      { text: 'Gráficos interactivos básicos', included: true },
      { text: 'Exportación: Últimos 12 datos', included: true },
      { text: 'Series históricas completas', included: false },
      { text: 'Soporte prioritario', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Profesional',
    price: 40000, // OJO: Asumo pesos ARS. Si son USD, pon 40.
    currency: '$',
    period: '/mes',
    description: 'Para analistas e inversores.',
    icon: Shield,
    recommended: true, // Este activa el borde verde y el scale
    badge: 'Más Elegido',
    cta: 'Suscribirme Ahora',
    features: [
      { text: 'Todo lo de Gratis', included: true, isHeader: true },
      { text: 'Series históricas completas', included: true },
      { text: 'Descarga en Excel y CSV', included: true },
      { text: 'Acceso a indicadores avanzados', included: true },
      { text: 'Sin publicidad', included: true },
      { text: 'API Access', included: false },
    ],
  },
  {
    id: 'unlimited',
    name: 'Unlimited',
    price: 100000, // Ajusta este valor numérico según tu moneda real
    currency: '$',
    period: '/mes',
    description: 'Para empresas y consultoras.',
    icon: Crown,
    recommended: false,
    badge: null,
    cta: 'Contactar Ventas', // O flow de compra directa
    features: [
      { text: 'Todo lo de Pro', included: true, isHeader: true },
      { text: 'Descargas ILIMITADAS', included: true, highlightColor: 'text-purple-600 dark:text-purple-400 font-bold' },
      { text: 'Acceso API REST real-time', included: true },
      { text: 'Soporte 24/7 vía WhatsApp', included: true },
      { text: 'Marca blanca (Whitelabel)', included: true },
    ],
  }
];