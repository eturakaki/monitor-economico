import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  CreditCard, ShieldCheck, Lock, User, Mail, 
  Truck, CheckCircle2, Loader2, ArrowLeft, Rocket 
} from 'lucide-react';
import { toast } from 'sonner';

// INTERNAL ARCHITECTURE
import { useShop } from '../context/ShopContext';
import { useAuth } from '../hooks/useAuth';
import { useCartAnalysis } from '../hooks/useCartAnalysis';
import { getCheckoutSchema } from '../utils/checkoutSchemas'; 
// ✅ IMPORTACIÓN CRÍTICA PARA LA CORRECCIÓN
import { UserStatusService } from '../services/userStatus'; 

// UTILS
const formatPrice = (value) => new Intl.NumberFormat('es-AR', {
  style: 'currency', currency: 'ARS', minimumFractionDigits: 0
}).format(value);

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, processCheckout } = useShop(); 
  // Extraemos refreshUser si existe, o confiamos en que grantAccess persiste en DB
  const { user, updateUserPlan } = useAuth();
  
  // 1. CEREBRO DE NEGOCIO (Análisis del carrito)
  const { requiresShipping, hasPhysical } = useCartAnalysis(cart);

  // 2. ESTADOS UI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [purchasedSnapshot, setPurchasedSnapshot] = useState([]); 
  const [useSameAddress, setUseSameAddress] = useState(true); 
  const [confirmedEmail, setConfirmedEmail] = useState('');

  // 3. CONFIGURACIÓN DEL FORMULARIO
  const activeSchema = useMemo(() => 
    getCheckoutSchema(requiresShipping && !useSameAddress), 
  [requiresShipping, useSameAddress]);

  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm({
    resolver: zodResolver(activeSchema),
    defaultValues: {
      fullName: user?.name || '',
      email: user?.email || '',
      billingAddress: '',
      billingCity: '',
      billingZip: '',
      cardNumber: '',
      expiry: '',
      cvc: '',
      shippingAddress: '',
      shippingCity: '',
      shippingZip: '',
      shippingNotes: ''
    }
  });

  // 4. PROTECCIÓN DE RUTA
  useEffect(() => {
    if (cart.length === 0 && !paymentSuccess) {
      navigate('/carrito'); 
    }
  }, [cart, paymentSuccess, navigate]);

  // 5. CÁLCULO DE TOTALES
  const total = useMemo(() => 
    cart.reduce((acc, item) => acc + (Number(item.price) || 0) * item.quantity, 0), 
  [cart]);

  // ---------------------------------------------------------------------------
  // HANDLER: PROCESAMIENTO DEL PAGO (CORE LOGIC)
  // ---------------------------------------------------------------------------
  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      // A. PREPARACIÓN DEL PAYLOAD
      const finalData = { ...data };
      
      if (requiresShipping && useSameAddress) {
        finalData.shippingAddress = data.billingAddress;
        finalData.shippingCity = data.billingCity;
        finalData.shippingZip = data.billingZip;
      }

      // Simulamos latencia de pasarela
      await new Promise(resolve => setTimeout(resolve, 2000));

      // B. CAPTURA DE SNAPSHOT
      const itemsPurchased = [...cart];
      setPurchasedSnapshot(itemsPurchased);
      setConfirmedEmail(data.email);

      // C. CONFIRMACIÓN Y LIMPIEZA
      // Inyectamos el 'total' y la 'data' que ShopContext necesita
      await processCheckout({
          amount: total,    
          ...finalData,     
          paymentMethod: 'Credit Card' 
      });
      
      setPaymentSuccess(true);

      // --- LOGICA DE FULFILLMENT (ENTREGA DE ACTIVOS) ---

      // D. ACTIVACIÓN DE SUSCRIPCIONES (PLANS)
      const planItem = itemsPurchased.find(item => 
        ['plan', 'subscription'].includes(item.type)
      );

      if (planItem) {
        console.info(`[Auto-Activation] Actualizando usuario a plan: ${planItem.id}`);
        await updateUserPlan(planItem.id); 
      }

      // E. ACTIVACIÓN DE CURSOS (CORRECCIÓN "LÁSER" 🛠️)
      // Filtramos solo los productos que son cursos digitales unitarios
      const digitalCourses = itemsPurchased.filter(item => 
        ['course', 'curso'].includes(item.type || item.category)
      );

      if (digitalCourses.length > 0) {
        const courseIds = digitalCourses.map(c => c.id);
        console.info(`[Auto-Activation] Otorgando acceso perpetuo a: ${courseIds.join(', ')}`);
        
        // 1. Persistimos en la "Base de Datos" (UserStatusService)
        await UserStatusService.grantAccess(courseIds);
        
        // Nota: Al usar grantAccess, el localStorage se actualiza.
        // Si useAuth escucha cambios de storage o recarga al navegar, 
        // el usuario verá sus cursos inmediatamente.
      }

      toast.success('¡Pago Aprobado!', {
        description: hasPhysical 
          ? 'Tu pedido está siendo procesado.' 
          : 'Acceso habilitado correctamente.'
      });

    } catch (error) {
      console.error("Payment Error:", error);
      toast.error('Error en el pago', { 
        description: error.message || 'Intenta nuevamente o contacta soporte.' 
      });
      setIsSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // VISTA: PANTALLA DE ÉXITO
  // ---------------------------------------------------------------------------
  if (paymentSuccess) {
    const showDigitalSuccess = purchasedSnapshot.some(i => ['plan', 'subscription', 'course', 'curso'].includes(i.type || i.category));
    const showPhysicalSuccess = purchasedSnapshot.some(i => !['plan', 'subscription', 'course', 'curso'].includes(i.type || i.category));

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 animate-in zoom-in duration-300">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl text-center max-w-md w-full border border-slate-100 dark:border-slate-700">
          
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} strokeWidth={3} />
          </div>
          
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">¡Compra Exitosa!</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
            Gracias por confiar en Monitor-Económico.
          </p>

          <div className="space-y-3">
            {showDigitalSuccess && (
              <button 
                onClick={() => navigate('/mis-cursos')} 
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2"
              >
                <Rocket size={18} /> IR A MIS CURSOS
              </button>
            )}
            
            {showPhysicalSuccess && (
              <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-xl text-sm text-slate-600 dark:text-slate-400 flex items-start gap-3 text-left">
                <Truck className="flex-shrink-0 mt-0.5" size={18} />
                <span>
                  Te enviaremos el código de seguimiento a <b>{confirmedEmail}</b> en cuanto despachemos tus productos físicos.
                </span>
              </div>
            )}
            
            {!showDigitalSuccess && !showPhysicalSuccess && (
               <button onClick={() => navigate('/')} className="text-sm font-bold text-slate-500 hover:text-emerald-500">Volver al Inicio</button>
            )}
          </div>

        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // VISTA: CHECKOUT FORM
  // ---------------------------------------------------------------------------
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in duration-500">
      
      <div className="mb-8">
        <button onClick={() => navigate('/carrito')} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-600 transition-colors mb-4 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform"/> Volver al Carrito
        </button>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <Lock size={28} className="text-emerald-600" /> Checkout Seguro
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* === COLUMNA IZQUIERDA: FORMULARIO === */}
        <div className="lg:col-span-7 space-y-8">
          <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            
            {/* 1. DATOS DE FACTURACIÓN */}
            <section className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <User size={20} className="text-emerald-500"/> Información de Facturación
              </h3>
              
              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nombre Completo</label>
                  <input {...register('fullName')} className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-lg text-sm outline-none transition-all ${errors.fullName ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-emerald-500'}`} placeholder="Como figura en tu DNI" />
                  {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
                    <input {...register('email')} type="email" className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-lg text-sm outline-none transition-all ${errors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-emerald-500'}`} placeholder="Para enviarte el recibo" />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Dirección de Facturación</label>
                    <input {...register('billingAddress')} className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-lg text-sm outline-none transition-all ${errors.billingAddress ? 'border-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-emerald-500'}`} placeholder="Calle y Altura" />
                    {errors.billingAddress && <p className="text-red-500 text-xs mt-1">{errors.billingAddress.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Ciudad</label>
                    <input {...register('billingCity')} className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-lg text-sm outline-none transition-all ${errors.billingCity ? 'border-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-emerald-500'}`} placeholder="Ciudad" />
                    {errors.billingCity && <p className="text-red-500 text-xs mt-1">{errors.billingCity.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">C. Postal</label>
                    <input {...register('billingZip')} className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-lg text-sm outline-none transition-all ${errors.billingZip ? 'border-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-emerald-500'}`} placeholder="CP" />
                    {errors.billingZip && <p className="text-red-500 text-xs mt-1">{errors.billingZip.message}</p>}
                  </div>
                </div>
              </div>
            </section>

            {/* 2. DATOS DE ENVÍO */}
            {requiresShipping && (
              <section className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm animate-in slide-in-from-top-4 duration-500">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Truck size={20} className="text-emerald-500"/> Datos de Envío
                  </h3>
                  
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={useSameAddress} 
                      onChange={(e) => setUseSameAddress(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300"
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Usar dirección de facturación</span>
                  </label>
                </div>

                {!useSameAddress && (
                  <div className="grid grid-cols-1 gap-5 animate-in fade-in duration-300">
                     <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Calle y Altura (Envío)</label>
                      <input {...register('shippingAddress')} className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-lg text-sm outline-none transition-all ${errors.shippingAddress ? 'border-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-emerald-500'}`} />
                      {errors.shippingAddress && <p className="text-red-500 text-xs mt-1">{errors.shippingAddress.message}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Ciudad</label>
                        <input {...register('shippingCity')} className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-lg text-sm outline-none transition-all ${errors.shippingCity ? 'border-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-emerald-500'}`} />
                        {errors.shippingCity && <p className="text-red-500 text-xs mt-1">{errors.shippingCity.message}</p>}
                      </div>
                      <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">CP</label>
                         <input {...register('shippingZip')} className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-lg text-sm outline-none transition-all ${errors.shippingZip ? 'border-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-emerald-500'}`} />
                         {errors.shippingZip && <p className="text-red-500 text-xs mt-1">{errors.shippingZip.message}</p>}
                      </div>
                    </div>
                    <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Notas (Opcional)</label>
                         <input {...register('shippingNotes')} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-emerald-500 placeholder:text-slate-400" placeholder="Ej: Dejar en portería" />
                    </div>
                  </div>
                )}
                
                {useSameAddress && (
                   <p className="text-sm text-slate-500 italic bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50">
                     📦 Enviaremos tu pedido a la dirección indicada en la facturación.
                   </p>
                )}
              </section>
            )}

            {/* 3. DATOS DE PAGO */}
            <section className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
                <CreditCard size={120} />
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <CreditCard size={20} className="text-emerald-500"/> Detalles de la Tarjeta
              </h3>
              
              <div className="grid grid-cols-1 gap-5 relative z-10">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Número de Tarjeta</label>
                  <div className="relative">
                     <CreditCard size={16} className="absolute left-3 top-3 text-slate-400" />
                     <input 
                       {...register('cardNumber')} 
                       maxLength={19} 
                       className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-lg text-sm font-mono outline-none transition-all ${errors.cardNumber ? 'border-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-emerald-500'}`} 
                       placeholder="0000 0000 0000 0000"
                     />
                  </div>
                  {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber.message}</p>}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Vencimiento</label>
                    <input 
                      {...register('expiry')} 
                      placeholder="MM/AA" 
                      maxLength={5} 
                      className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-lg text-sm font-mono outline-none transition-all ${errors.expiry ? 'border-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-emerald-500'}`} 
                    />
                    {errors.expiry && <p className="text-red-500 text-xs mt-1">{errors.expiry.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">CVC</label>
                    <div className="relative">
                       <Lock size={14} className="absolute left-3 top-3 text-slate-400" />
                       <input 
                         {...register('cvc')} 
                         placeholder="123" 
                         maxLength={4} 
                         className={`w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-lg text-sm font-mono outline-none transition-all ${errors.cvc ? 'border-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-emerald-500'}`} 
                       />
                    </div>
                    {errors.cvc && <p className="text-red-500 text-xs mt-1">{errors.cvc.message}</p>}
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/20">
                  <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400"/>
                  <span className="text-emerald-800 dark:text-emerald-300 font-medium">Transacción encriptada de extremo a extremo.</span>
                </div>
              </div>
            </section>
          </form>
        </div>

        {/* === COLUMNA DERECHA: RESUMEN (STICKY) === */}
        <div className="lg:col-span-5">
          <div className="sticky top-24">
            <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-900/20 relative overflow-hidden ring-1 ring-white/10">
               <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>

               <h3 className="text-lg font-black uppercase tracking-widest mb-6 border-b border-white/10 pb-4">
                 Resumen de Orden
               </h3>

               <div className="space-y-4 mb-8 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                 {cart.map(item => (
                   <div key={item.id} className="flex justify-between items-start gap-4 text-sm group/item">
                      <div className="flex-1">
                        <p className="font-bold text-white leading-tight group-hover/item:text-emerald-400 transition-colors">{item.title}</p>
                        <p className="text-slate-400 text-xs mt-0.5">{item.type === 'plan' ? 'Suscripción Mensual' : 'Producto Digital'}</p>
                      </div>
                      <p className="font-mono text-emerald-400 font-bold">{formatPrice(item.price)}</p>
                   </div>
                 ))}
               </div>

               <div className="pt-4 border-t border-white/10 space-y-2 mb-8">
                 <div className="flex justify-between text-slate-400 text-sm">
                   <span>Subtotal</span>
                   <span>{formatPrice(total)}</span>
                 </div>
                 <div className="flex justify-between text-white text-xl font-black mt-2 items-end">
                   <span>Total a Pagar</span>
                   <span className="text-2xl text-emerald-400 leading-none">{formatPrice(total)}</span>
                 </div>
               </div>

               <button 
                 type="submit" 
                 form="checkout-form" 
                 disabled={isSubmitting}
                 className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/50 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 relative overflow-hidden"
               >
                 {isSubmitting ? (
                   <>
                     <Loader2 size={20} className="animate-spin" /> Procesando...
                   </>
                 ) : (
                   <>
                     {requiresShipping ? 'PAGAR Y ENVIAR' : 'PAGAR Y ACTIVAR'} <Lock size={18} />
                   </>
                 )}
               </button>
               
               <p className="text-center text-[10px] text-slate-500 mt-4 uppercase font-bold tracking-wider">
                 Al confirmar aceptas nuestros términos.
               </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}