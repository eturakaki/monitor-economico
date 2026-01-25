import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import { planes } from '../data/planes';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext'; 

/**
 * ------------------------------------------------------------------
 * COMPONENTE: PLANES (Pricing Page)
 * ------------------------------------------------------------------
 * Responsabilidad: Mostrar la oferta comercial y dirigir al usuario
 * al flujo correcto (Registro gratuito o Checkout de pago).
 */

const Planes = () => {
  const navigate = useNavigate();
  const { addToCart } = useShop(); 
  const { user } = useAuth(); 

  /**
   * MANEJADOR DE SUSCRIPCIÓN
   */
  const handleSubscribe = (plan) => {
    
    // 1. ESCENARIO PLAN GRATUITO
    if (plan.price === 0) {
      if (user) {
        navigate('/dashboard');
      } else {
        navigate('/register');
      }
      return; 
    }

    // 2. ESCENARIO PLAN PAGO
    // Adaptamos el Plan para que el Carrito lo entienda como un Producto
    const productToCart = {
      id: plan.id,                     
      title: plan.name || plan.title,  
      description: plan.description,   // [MEJORA UX] Agregamos esto para verlo en el carrito
      price: Number(plan.price),       
      image: null,                     // Sin foto física
      type: 'subscription',            // Flag para activar la lógica de reemplazo en el Contexto
      period: plan.period,             
      quantity: 1                      
    };

    addToCart(productToCart); 
    navigate('/checkout'); 
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      
      {/* HEADER */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-emerald-600 font-semibold tracking-wide uppercase text-sm mb-2">
          Pricing & Tiers
        </h2>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Potencia tu análisis económico
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Datos profesionales al alcance de un click. Cancela cuando quieras.
        </p>
      </div>

      {/* GRID */}
      <div className="max-w-7xl mx-auto grid gap-8 lg:grid-cols-3 items-start">
        {planes.map((plan) => {
          const Icon = plan.icon;

          return (
            <div 
              key={plan.id}
              className={`
                relative flex flex-col p-8 rounded-2xl border transition-all duration-300 h-full
                ${plan.recommended 
                  ? 'bg-white dark:bg-slate-800 border-emerald-500 shadow-2xl scale-100 lg:scale-105 z-10' 
                  : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700/50'
                }
              `}
            >
              {plan.badge && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-emerald-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
                     {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {plan.name}
                  </h3>
                  <p className="mt-1 text-slate-500 dark:text-slate-400 text-sm">
                    {plan.description}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${plan.recommended ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                    <Icon size={24} />
                </div>
              </div>

              <div className="mb-8 flex items-baseline">
                <span className="text-4xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                  {plan.price === 0 ? 'Gratis' : `${plan.currency}${plan.price.toLocaleString('es-AR')}`}
                </span>
                <span className="text-slate-500 dark:text-slate-400 ml-2">
                  {plan.period}
                </span>
              </div>

              <ul className="flex-1 space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <div className="flex-shrink-0 mt-0.5">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <X className="h-5 w-5 text-slate-300 dark:text-slate-600" />
                      )}
                    </div>
                    <p className={`
                      ml-3 text-sm 
                      ${feature.included 
                        ? 'text-slate-700 dark:text-slate-300' 
                        : 'text-slate-400 dark:text-slate-600 line-through decoration-slate-300'}
                      ${feature.isHeader ? 'font-bold text-slate-900 dark:text-white' : ''}
                      ${feature.highlightColor ? feature.highlightColor : ''}
                    `}>
                      {feature.text}
                    </p>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan)}
                className={`
                  w-full py-3 px-4 rounded-lg text-sm font-bold transition-all duration-200
                  ${plan.recommended
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-emerald-500/25'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white border border-transparent hover:border-slate-300'
                  }
                `}
              >
                {plan.cta}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Planes;