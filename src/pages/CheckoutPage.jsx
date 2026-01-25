import { useState } from 'react'; 
import { useNavigate } from 'react-router-dom'; 
import { ShieldCheck, CreditCard, Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner'; 
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';

export default function CheckoutPage() {
  const navigate = useNavigate();
  // 1. Traemos 'cart' para inspeccionar QUÉ se está comprando
  const { cart, cartTotal, confirmPurchase } = useShop(); 
  // 2. Traemos 'updateUserPlan' para ejecutar el upgrade
  const { user, updateUserPlan } = useAuth();
  
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    setProcessing(true);

    try {
        // A. SNAPSHOT DE INTENCIÓN (Antes de borrar el carrito)
        // Buscamos si hay un plan en el carrito
        const subscriptionItem = cart.find(item => item.type === 'subscription');
        const isSubscriptionUpgrade = !!subscriptionItem;
        
        // B. SIMULACIÓN DE API (3s)
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // C. LÓGICA DE NEGOCIO (Aquí ocurre la magia)
        if (isSubscriptionUpgrade) {
            // 1. Actualizamos el permiso del usuario (AuthContext)
            updateUserPlan(subscriptionItem.id); // 'pro' o 'unlimited'
            
            // 2. Guardamos la orden (ShopContext) y limpiamos carrito
            confirmPurchase();

            // 3. Feedback Premium
            toast.success('¡Bienvenido a la Élite!', {
                description: `Tu plan ${subscriptionItem.title} ha sido activado.`,
                duration: 5000,
                icon: '🚀'
            });
            navigate('/dashboard'); 
        } else {
            // Flujo normal de productos físicos
            confirmPurchase();
            toast.success('¡Pago exitoso!', {
                description: 'El recibo ha sido enviado a tu correo.',
                duration: 5000,
            });
            navigate('/mis-compras'); 
        }

    } catch (error) {
        console.error("Payment Error:", error);
        toast.error('Error en el pago', {
            description: 'La transacción fue denegada. Intenta nuevamente.',
        });
        setProcessing(false);
    }
  };

  // ... (MANTÉN TODO EL RESTO DEL JSX IGUAL, SOLO CAMBIAMOS handlePayment)
  // SI NECESITAS EL JSX COMPLETO PORQUE NO ESTÁS SEGURO, PÍDEMELO.
  
  if (processing) {
      // ... (Tu loader existente)
      return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
           <Loader2 className="w-16 h-16 text-emerald-500 animate-spin mb-6" />
           <h2 className="text-2xl font-black text-slate-900 dark:text-white">Procesando upgrade...</h2>
           <p className="text-slate-500 mt-2">Activando licencia digital en la nube.</p>
        </div>
      );
  }

  return (
    // ... (Tu UI de Checkout existente, usando cartTotal y handlePayment)
    <div className="max-w-4xl mx-auto px-4 py-12 animate-in slide-in-from-bottom-4 duration-700">
        {/* Asegúrate de conectar el botón: onClick={handlePayment} */}
        {/* ... Resto del componente ... */}
        
        {/* SOLO COMO REFERENCIA, TU BOTÓN DEBERÍA VERSE ASÍ: */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 shadow-xl border border-slate-200 dark:border-slate-800">
             {/* ... Resumen ... */}
             <div className="flex justify-between items-center py-8 border-y border-dashed border-slate-200 dark:border-slate-800 mb-8">
                <span className="text-xl font-medium text-slate-700 dark:text-slate-300">Total a Pagar</span>
                <span className="text-4xl font-black text-emerald-600 dark:text-emerald-500 font-mono">
                    {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(cartTotal)}
                </span>
            </div>

            <button 
                onClick={handlePayment}
                disabled={processing}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg rounded-xl transition-all"
            >
                {processing ? 'Procesando...' : 'Confirmar Pago Seguro'}
            </button>
        </div>
    </div>
  );
}