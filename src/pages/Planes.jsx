import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Info } from 'lucide-react'; // [ADD] Info icon para tooltip si fuera necesario
import { planes } from '../data/planes';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner'; // [ADD] Feedback visual

/**
 * ------------------------------------------------------------------
 * COMPONENTE: PLANES (Pricing Page)
 * ------------------------------------------------------------------
 * Actualizado: Lógica de protección de re-compra.
 */

const Planes = () => {
  const navigate = useNavigate();
  const { addToCart } = useShop();
  const { user } = useAuth();

  const handleSubscribe = (plan) => {
    // [LOGIC] Protección contra re-compra (Defensive Programming)
    if (user?.plan === plan.id) {
        toast.info("Ya tienes este plan activo.");
        return;
    }

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
    const productToCart = {
      id: plan.id,
      title: plan.name || plan.title,
      description: plan.description,
      price: Number(plan.price),
      image: null,
      type: 'subscription',
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
          // [LOGIC] Determinamos si es el plan actual del usuario
          const isCurrentPlan = user?.plan === plan.id;

          return (
            <div 
              key={plan.id}
              className={`
                relative flex flex-col p-8 rounded-2xl border transition-all duration-300 h-full
                ${plan.recommended 
                  ? 'bg-white dark:bg-slate-800 border-emerald-500 shadow-2xl scale-100 lg:scale-105 z-10' 
                  : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700/50'
                }
                ${isCurrentPlan ? 'ring-2 ring-emerald-500/50 ring-offset-2 dark:ring-offset-slate-900' : ''}
              `}
            >
              {plan.badge && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-emerald-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
                     {plan.badge}
                  </span>
                </div>
              )}

              {/* [UI] Etiqueta visual si es el plan actual */}
              {isCurrentPlan && (
                <div className="absolute top-4 right-4">
                   <span className="flex items-center gap-1 text-[10px] uppercase font-black text-emerald-600 bg-emerald-100 px-2 py-1 rounded">
                      Tu Plan
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

              {/* [LOGIC & UI] Botón condicional según estado del plan */}
              <button
                onClick={() => handleSubscribe(plan)}
                disabled={isCurrentPlan} 
                className={`
                  w-full py-3 px-4 rounded-lg text-sm font-bold transition-all duration-200
                  ${isCurrentPlan 
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-transparent' 
                    : plan.recommended
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-emerald-500/25'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white border border-transparent hover:border-slate-300'
                  }
                `}
              >
                {isCurrentPlan ? 'Plan Actual' : plan.cta}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Planes;