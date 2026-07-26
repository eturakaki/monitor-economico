import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// CONTEXT & DATA
import { useAuth } from '../../hooks/useAuth';
import { useShop } from '../../context/ShopContext'; // Asumo esta ruta
import { planes } from '../../data/planes';

// UTILS
// Función auxiliar para formateo de moneda (si no tienes una global aún)
const formatCurrency = (amount, currency = '$') => 
  `${currency} ${amount.toLocaleString('es-AR')}`;

/**
 * COMPONENTE: SUBSCRIPTION TAB
 * Arquitectura: 
 * - Lectura: AuthContext (Estado actual) + planes.js (Catálogo)
 * - Escritura (Upgrade): ShopContext -> Checkout
 * - Escritura (Downgrade): AuthContext (Directo)
 */
export const SubscriptionTab = () => {
  const navigate = useNavigate();
  const { user, updateUserPlan } = useAuth();
  const { addToCart } = useShop();
  
  const [isProcessing, setIsProcessing] = useState(false);

  // Normalización del plan actual para evitar errores de string/undefined
  const currentPlanId = user?.plan || 'starter';

  // ---------------------------------------------------------------------------
  // HANDLERS
  // ---------------------------------------------------------------------------

  /**
   * Maneja el flujo de compra de un nuevo plan.
   * Transforma el objeto estático 'plan' en un 'product' para el ShopContext.
   */
  const handleUpgrade = (plan) => {
    // 1. Prevención: No permitir comprar el plan actual (aunque la UI lo oculte)
    if (plan.id === currentPlanId) return;

    try {
      setIsProcessing(true);

      // 2. Mapping (DTO Pattern): De Plan -> CartItem
      const cartItem = {
        id: plan.id,           // ID del plan (ej: 'pro')
        title: plan.name,      // Mapeo name -> title (estándar e-commerce)
        price: plan.price,     // Precio numérico
        image: null,           // Los planes no suelen tener foto, o usa un placeholder
        type: 'plan',          // FLAG CRÍTICA: Indica al checkout que es suscripción
        quantity: 1
      };

      // 3. Acción del Contexto
      addToCart(cartItem);

      // 4. Feedback & Navegación
      toast.success(`Plan ${plan.name} añadido al carrito.`);
      
      // Pequeño delay para UX (opcional, para que vea el toast)
      setTimeout(() => {
        navigate('/checkout');
      }, 500);

    } catch (error) {
      console.error("Error adding plan to cart:", error);
      toast.error("Error al procesar la solicitud.");
      setIsProcessing(false);
    }
  };

  /**
   * Maneja la cancelación (Downgrade).
   * Mantiene la lógica directa porque no requiere pago.
   */
  const handleCancelSubscription = async () => {
    const isConfirmed = window.confirm(
      "¿Estás seguro de cancelar? Perderás tus beneficios Premium al instante."
    );

    if (!isConfirmed) return;

    try {
      setIsProcessing(true);
      await updateUserPlan('starter'); // Llamada directa a la API/Servicio
      toast.info("Has vuelto al plan Gratuito.");
    } catch (error) {
      console.error(error);
      toast.error("No se pudo cancelar la suscripción.");
    } finally {
      setIsProcessing(false);
    }
  };

  // ---------------------------------------------------------------------------
  // RENDER HELPERS
  // ---------------------------------------------------------------------------

  const renderPlanCard = (plan) => {
    const isCurrent = plan.id === currentPlanId;
    const isStarter = plan.id === 'starter';
    const Icon = plan.icon;

    // Lógica visual: Si soy PRO, el Starter y el PRO se ven diferentes
    // Si es el plan actual, mostramos estado, no botón de compra.
    
    return (
      <div 
        key={plan.id}
        className={`
          relative flex flex-col p-6 rounded-2xl border transition-all duration-300
          ${plan.recommended 
            ? 'border-purple-500/50 bg-gradient-to-b from-purple-500/5 to-transparent shadow-lg shadow-purple-500/10' 
            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50'
          }
          ${isCurrent ? 'ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-slate-900' : 'hover:border-slate-400 dark:hover:border-slate-600'}
        `}
      >
        {/* Badge Recomendado */}
        {plan.recommended && !isCurrent && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
            {plan.badge || 'Recomendado'}
          </div>
        )}

        {/* Header del Card */}
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-xl ${plan.recommended ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'}`}>
            <Icon size={24} />
          </div>
          <div className="text-right">
             <div className="text-xl font-black text-slate-900 dark:text-white">
               {plan.price === 0 ? 'Gratis' : formatCurrency(plan.price, plan.currency)}
               <span className="text-xs font-normal text-slate-500 ml-1">{plan.period}</span>
             </div>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{plan.name}</h3>
        <p className="text-sm text-slate-500 mb-6 h-10 line-clamp-2">{plan.description}</p>

        {/* Features */}
        <ul className="space-y-3 mb-8 flex-grow">
          {plan.features.map((feature, idx) => (
            <li key={idx} className={`flex gap-2 text-sm ${!feature.included ? 'opacity-50' : ''}`}>
              <CheckCircle2 
                size={16} 
                className={`flex-shrink-0 ${feature.included ? (plan.recommended ? 'text-purple-500' : 'text-emerald-500') : 'text-slate-600 dark:text-slate-300'}`}
              />
              <span className={`${feature.highlightColor || 'text-slate-600 dark:text-slate-400'} ${feature.isHeader ? 'font-semibold' : ''}`}>
                {feature.text}
              </span>
            </li>
          ))}
        </ul>

        {/* Botón de Acción */}
        <div className="mt-auto">
          {isCurrent ? (
            <button disabled className="w-full py-3 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-bold rounded-xl cursor-default flex items-center justify-center gap-2">
              <CheckCircle2 size={18} /> Plan Activo
            </button>
          ) : (
            <button 
              onClick={() => handleUpgrade(plan)}
              disabled={isProcessing || (isStarter && !isCurrent)} // No "compras" el starter, lo cancelas abajo
              className={`
                w-full py-3 rounded-xl font-bold transition-all
                ${plan.recommended 
                  ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-500/20' 
                  : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white'
                }
              `}
            >
              {isStarter ? 'Incluido al registrarse' : plan.cta}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      
      {/* HEADER VISUAL (Opcional: Resumen del estado actual arriba) */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Tu Suscripción</h2>
          <p className="text-slate-500">Gestiona tu nivel de acceso y facturación.</p>
        </div>
        {/* Si no es starter, mostrar botón de cancelar pequeño aquí o abajo */}
      </div>

      {/* GRILLA DE PLANES (Dinámica desde planes.js) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {planes.map(renderPlanCard)}
      </div>

      {/* ZONA DE PELIGRO (Solo visible si pagas) */}
      {currentPlanId !== 'starter' && (
        <div className="mt-12 p-6 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30">
          <h3 className="text-red-700 dark:text-red-400 font-bold mb-2 flex items-center gap-2">
            <XCircle size={20} /> Cancelar Suscripción
          </h3>
          <p className="text-red-600/80 dark:text-red-400/70 text-sm mb-4">
            Al cancelar, volverás al plan "Inicial" inmediatamente. No se realizarán más cargos a tu tarjeta.
          </p>
          <button 
            onClick={handleCancelSubscription}
            disabled={isProcessing}
            className="text-sm font-bold text-red-600 underline hover:text-red-800 transition-colors"
          >
            {isProcessing ? 'Procesando...' : 'Sí, quiero cancelar mi plan'}
          </button>
        </div>
      )}

      {/* LOADING OVERLAY (UX Zero-Lag: Feedback visual si algo tarda) */}
      {isProcessing && (
        <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center rounded-3xl">
          <Loader2 className="animate-spin text-purple-600" size={40} />
        </div>
      )}
    </div>
  );
};