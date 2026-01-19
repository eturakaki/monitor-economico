import React from 'react';
import { Check, X, Crown, Shield, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * ---------------------------------------------------------------------
 * CONFIGURACIÓN DE DATOS (SSOT)
 * ---------------------------------------------------------------------
 */
const PRICING_TIERS = [
  {
    id: 'starter',
    title: 'Inicial',
    description: 'Para curiosos y estudiantes.',
    price: 0,
    currency: '$',
    period: '/mes',
    icon: Zap,
    isPremium: false,
    ctaText: 'Comenzar Gratis',
    ctaLink: '/exportar',
    features: [
      { text: 'Acceso al Dashboard en vivo', included: true },
      { text: 'Gráficos interactivos básicos', included: true },
      { text: 'Exportación: Últimos 10 datos', included: true },
      { text: 'Series históricas completas', included: false },
      { text: 'Soporte prioritario', included: false },
    ],
  },
  {
    id: 'pro',
    title: 'Profesional',
    description: 'Para analistas e inversores.',
    price: 6.00,
    currency: '$',
    period: '/mes',
    icon: Shield,
    isPremium: true, // ESTE ES EL PLAN DESTACADO
    badge: 'Más Elegido',
    ctaText: 'Suscribirme Ahora',
    ctaLink: '/checkout/pro',
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
    title: 'Unlimited',
    description: 'Para empresas y consultoras.',
    price: 12.00,
    currency: '$',
    period: '/mes',
    icon: Crown,
    isPremium: false,
    ctaText: 'Contactar Ventas',
    ctaLink: '/contact',
    features: [
      { text: 'Todo lo de Pro', included: true, isHeader: true },
      { text: 'Descargas ILIMITADAS', included: true, highlightColor: 'text-purple-600 dark:text-purple-400' },
      { text: 'Acceso API REST real-time', included: true },
      { text: 'Soporte 24/7 vía WhatsApp', included: true },
      { text: 'Marca blanca (Whitelabel)', included: true },
    ],
  },
];

export function Planes() {
  return (
    // CONTENEDOR PRINCIPAL:
    // Light: bg-slate-100
    // Dark: bg-[#0B1121] (Tu azul profundo corporativo)
    <div className="min-h-screen bg-slate-100 dark:bg-[#0B1121] py-20 px-4 font-sans transition-colors duration-300">
      
      {/* HEADER HERO */}
      <div className="max-w-3xl mx-auto text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h2 className="text-emerald-600 dark:text-emerald-400 font-bold tracking-widest uppercase text-xs mb-3">
          Planes y Precios
        </h2>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
          Desbloqueá el poder de los datos.
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
          Elegí el plan que mejor se adapte a tus necesidades de análisis. 
          Desde estudiantes hasta consultoras macroeconómicas.
        </p>
      </div>

      {/* GRID CONTAINER */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {PRICING_TIERS.map((tier, index) => (
          <PricingCard key={tier.id} tier={tier} index={index} />
        ))}
      </div>

      {/* FOOTER TRUST */}
      <div className="mt-20 text-center border-t border-slate-300 dark:border-slate-800 pt-10">
        <p className="text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2 text-sm">
          <Shield size={16} className="text-emerald-600 dark:text-emerald-500" />
          Pagos seguros procesados por <span className="font-bold text-slate-700 dark:text-slate-200">Mercado Pago</span>. Cancelás cuando quieras.
        </p>
      </div>
    </div>
  );
}

/**
 * ---------------------------------------------------------------------
 * COMPONENTE INTELIGENTE: PricingCard
 * Maneja la lógica de clases para Light/Dark + Premium/Standard
 * ---------------------------------------------------------------------
 */
function PricingCard({ tier, index }) {
  const { isPremium } = tier;

  // Lógica de Estilos (Arquitectura Visual V2.1)
  
  // 1. CONTAINER BASE
  let containerClasses = "rounded-3xl p-8 border transition-all duration-300 flex flex-col h-full relative ";
  
  if (isPremium) {
    // PREMIUM CARD
    // Light: Azul oscuro sólido (para destacar).
    // Dark: Slate-800 + Borde Emerald (para destacar sobre el fondo negro).
    containerClasses += "bg-slate-900 text-white shadow-2xl scale-105 z-10 ";
    containerClasses += "dark:bg-slate-800 dark:border-emerald-500/50 dark:shadow-emerald-900/20 ";
    containerClasses += "border-slate-800 "; // Borde default light
  } else {
    // STANDARD CARD
    // Light: Blanco + Borde Gris.
    // Dark: Slate-900 + Borde Sutil.
    containerClasses += "bg-white text-slate-900 border-slate-300 shadow-sm hover:shadow-xl ";
    containerClasses += "dark:bg-slate-900 dark:text-slate-100 dark:border-slate-800 dark:hover:border-slate-700 ";
  }

  // 2. BUTTONS
  let buttonClasses = "block w-full py-3 rounded-xl font-bold text-center transition-all mb-8 ";
  
  if (isPremium) {
    buttonClasses += "bg-emerald-500 text-white hover:bg-emerald-400 hover:shadow-emerald-500/25 shadow-lg border-transparent ";
  } else {
    // Botón Outline que se adapta a dark/light
    buttonClasses += "bg-transparent border-2 ";
    buttonClasses += "border-slate-200 text-slate-900 hover:border-slate-900 hover:bg-slate-50 "; // Light logic
    buttonClasses += "dark:border-slate-700 dark:text-white dark:hover:border-emerald-500 dark:hover:text-emerald-400 dark:hover:bg-slate-800 "; // Dark logic
  }

  return (
    <div 
      className={`${containerClasses} animate-in fade-in slide-in-from-bottom-8`}
      style={{ animationDelay: `${index * 150}ms` }}
    >
      {/* BADGE DESTACADO */}
      {tier.badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
          {tier.badge}
        </div>
      )}

      {/* HEADER */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          {/* Icono cambia de color según contexto */}
          <tier.icon 
            className={isPremium ? "text-emerald-400" : "text-emerald-600 dark:text-emerald-400"} 
            size={24} strokeWidth={2} 
          />
          <h3 className="text-xl font-bold">{tier.title}</h3>
        </div>
        <p className={`text-sm ${isPremium ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>
          {tier.description}
        </p>
      </div>

      {/* PRECIO */}
      <div className="mb-8">
        <div className="flex items-baseline">
          <span className="text-4xl font-black tracking-tight tabular-nums font-mono">
            {tier.currency}{tier.price.toFixed(2)}
          </span>
          <span className={`ml-2 text-sm font-medium ${isPremium ? 'text-slate-500' : 'text-slate-400 dark:text-slate-500'}`}>
            {tier.period}
          </span>
        </div>
      </div>

      {/* CTA */}
      <Link to={tier.ctaLink} className={buttonClasses}>
        {tier.ctaText}
      </Link>

      {/* LISTA DE CARACTERÍSTICAS */}
      <div className="space-y-4 flex-grow">
        {tier.features.map((feature, idx) => (
          <FeatureItem 
            key={idx} 
            feature={feature} 
            isPremiumContext={isPremium} 
          />
        ))}
      </div>
    </div>
  );
}

/**
 * ---------------------------------------------------------------------
 * FEATURE ITEM: Maneja el color del texto y check/cross
 * ---------------------------------------------------------------------
 */
function FeatureItem({ feature, isPremiumContext }) {
  if (feature.isHeader) {
    return (
      <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${isPremiumContext ? 'text-slate-500' : 'text-slate-400 dark:text-slate-500'}`}>
        {feature.text}
      </p>
    );
  }

  const Icon = feature.included ? Check : X;
  
  // Colores Base
  // En tarjeta Premium siempre es claro sobre oscuro.
  // En tarjeta Standard cambia según el modo (oscuro sobre blanco / blanco sobre oscuro).
  
  let iconColor = "";
  let textColor = "";

  if (isPremiumContext) {
    // Contexto siempre oscuro (Premium Card)
    iconColor = feature.included ? "text-emerald-400" : "text-slate-600";
    textColor = feature.included ? "text-slate-300" : "text-slate-600 line-through";
  } else {
    // Contexto Variable (Standard Card)
    iconColor = feature.included 
      ? "text-emerald-600 dark:text-emerald-400" 
      : "text-slate-300 dark:text-slate-700";
      
    textColor = feature.included 
      ? "text-slate-700 dark:text-slate-300" 
      : "text-slate-400 dark:text-slate-600 line-through";
  }

  // Override de color específico (ej: Unlimited violeta)
  if (feature.highlightColor && feature.included) {
    textColor = feature.highlightColor;
  }

  return (
    <div className="flex items-start gap-3">
      <Icon size={18} className={`mt-0.5 shrink-0 ${iconColor}`} strokeWidth={2} />
      <span className={`text-sm leading-tight ${textColor}`}>
        {feature.text}
      </span>
    </div>
  );
}