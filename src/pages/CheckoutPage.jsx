import { useState } from 'react'; 
import { useNavigate } from 'react-router-dom'; 
import { ShieldCheck, CreditCard, Loader2, Lock, CheckCircle2, ArrowRight, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner'; 
import { useShop } from '../context/ShopContext';
import { useAuth } from '../hooks/useAuth';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, cartTotal, confirmPurchase } = useShop(); 
  const { updateUserPlan } = useAuth();
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    setProcessing(true);

    try {
        const subscriptionItem = cart.find(item => item.type === 'subscription');
        const isSubscriptionUpgrade = !!subscriptionItem;
        
        // Simulación de validación de pasarela de pago (Stripe/MercadoPago style)
        await new Promise((resolve) => setTimeout(resolve, 2500));

        if (isSubscriptionUpgrade) {
            updateUserPlan(subscriptionItem.id); 
            confirmPurchase();
            toast.success('¡Suscripción Activada!', {
                description: `Ya tienes acceso a las herramientas ${subscriptionItem.title}.`,
                duration: 5000,
                icon: <CheckCircle2 className="text-emerald-500" />
            });
            navigate('/dashboard'); 
        } else {
            confirmPurchase();
            toast.success('Compra Confirmada', {
                description: 'Hemos enviado el comprobante a tu email.',
                duration: 5000,
            });
            navigate('/mis-compras'); 
        }

    } catch {
        toast.error('Transacción Declinada', {
            description: 'Hubo un problema con el procesador de pagos. Reintenta.',
        });
        setProcessing(false);
    }
  };

  // PANTALLA DE PROCESAMIENTO (Professional Overlay)
  if (processing) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#0B1121] p-6 text-center">
           <div className="relative mb-8">
                <Loader2 className="w-20 h-20 text-indigo-600 animate-spin" />
                <Lock className="absolute inset-0 m-auto w-6 h-6 text-slate-400" />
           </div>
           <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Validando Transacción Segura</h2>
           <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-xs">
              Estamos conectando con el nodo de pago. No cierres esta ventana para asegurar tu licencia.
           </p>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1121] py-12 px-4 font-sans">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* COLUMNA IZQUIERDA: MÉTODO Y SEGURIDAD */}
        <div className="lg:col-span-7 space-y-8">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-600 rounded-lg text-white">
                    <CreditCard size={20} />
                </div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">Finalizar Compra</h1>
            </div>

            {/* MODO DE PAGO SIMULADO */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-900 dark:text-white">Método de Pago</h3>
                    <div className="flex gap-2 opacity-50">
                        <div className="w-8 h-5 bg-slate-200 rounded"></div>
                        <div className="w-8 h-5 bg-slate-200 rounded"></div>
                        <div className="w-8 h-5 bg-slate-200 rounded"></div>
                    </div>
                </div>
                
                <div className="border-2 border-indigo-500 bg-indigo-50/30 dark:bg-indigo-500/5 p-4 rounded-2xl flex items-center gap-4">
                    <div className="bg-indigo-600 p-2 rounded-lg text-white">
                        <ShieldCheck size={20} />
                    </div>
                    <div className="flex-grow">
                        <p className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Pago Protegido por MonitorEco SSL</p>
                        <p className="text-xs text-slate-500">Tus datos están encriptados de punto a punto.</p>
                    </div>
                </div>
            </div>

            {/* BADGES DE CONFIANZA */}
            <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-transparent dark:border-slate-800">
                    <CheckCircle2 size={18} className="text-emerald-500" />
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Activación Instantánea</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-transparent dark:border-slate-800">
                    <ShieldCheck size={18} className="text-indigo-500" />
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Garantía de Satisfacción</span>
                </div>
            </div>
        </div>

        {/* COLUMNA DERECHA: RESUMEN DE ORDEN (Sticky) */}
        <div className="lg:col-span-5">
            <div className="sticky top-8 bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <ShoppingBag size={18} className="text-indigo-600" />
                    Resumen de Orden
                </h3>

                <div className="space-y-4 mb-8">
                    {cart.map((item) => (
                        <div key={item.id} className="flex justify-between items-center group">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 font-bold text-xs uppercase">
                                    {item.type === 'subscription' ? 'Plan' : 'Item'}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</p>
                                    <p className="text-[10px] text-slate-500">Cant: {item.quantity}</p>
                                </div>
                            </div>
                            <span className="text-sm font-mono font-bold text-slate-700 dark:text-slate-300">
                                ${new Intl.NumberFormat('es-AR').format(item.price)}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="space-y-3 pt-6 border-t border-dashed border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Subtotal</span>
                        <span className="text-slate-900 dark:text-white font-medium">${new Intl.NumberFormat('es-AR').format(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Impuestos (Incluidos)</span>
                        <span className="text-emerald-500 font-bold">0%</span>
                    </div>
                    <div className="flex justify-between items-center pt-4">
                        <span className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">Total</span>
                        <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400 font-mono tracking-tighter">
                            ${new Intl.NumberFormat('es-AR').format(cartTotal)}
                        </span>
                    </div>
                </div>

                <button 
                    onClick={handlePayment}
                    disabled={processing || cart.length === 0}
                    className="w-full mt-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-lg rounded-2xl shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
                >
                    Confirmar Pago Seguro
                    <ArrowRight size={20} />
                </button>

                <p className="text-[10px] text-center text-slate-400 mt-6 leading-relaxed">
                    Al confirmar el pago, aceptas nuestros <span className="underline cursor-pointer">Términos de Servicio</span> y la política de renovaciones automáticas.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}