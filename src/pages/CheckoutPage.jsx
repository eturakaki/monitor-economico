import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, 
  ShieldCheck, 
  Lock, 
  User, 
  Mail, 
  CheckCircle2, 
  Loader2, 
  ArrowLeft 
} from 'lucide-react';
import { toast } from 'sonner';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../hooks/useAuth';

// Helper de formato de moneda (SSOT Visual)
const formatPrice = (value) => new Intl.NumberFormat('es-AR', {
  style: 'currency', currency: 'ARS', minimumFractionDigits: 0
}).format(value);

export default function CheckoutPage() {
  const navigate = useNavigate();
  
  // 1. [LOGIC FIX] Importamos 'confirmPurchase' que maneja el ciclo completo (Guardar -> Limpiar)
  const { cart, confirmPurchase } = useShop(); 
  const { user, updateUserPlan } = useAuth();

  // Estados del Formulario
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    address: '',
    city: '',
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvc: ''
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Redirección si no hay carrito (Protección de Ruta)
  useEffect(() => {
    // Si el carrito está vacío y NO acabamos de pagar con éxito, sacar al usuario.
    if (cart.length === 0 && !paymentSuccess) {
      navigate('/carrito');
      toast.warning('Tu carrito está vacío.');
    }
  }, [cart, navigate, paymentSuccess]);

  // Cálculo de Totales
  const total = cart.reduce((acc, item) => acc + (Number(item.price) || 0), 0);

  // Manejo de Inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- PROCESAMIENTO DEL PAGO (CORE LOGIC) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación de campos requeridos
    if (!formData.address || !formData.cardNumber) {
      toast.error('Por favor completa todos los campos de pago.');
      return;
    }

    setIsProcessing(true);

    // Simulamos latencia de red (API de Pasarela de Pagos)
    setTimeout(() => {
      // 1. Finalizar carga visual
      setIsProcessing(false);
      setPaymentSuccess(true);
      
      // 2. [CRITICAL FIX] Confirmar la compra en el sistema
      // Esto crea la orden, la guarda en 'orders' y LUEGO vacía el carrito.
      // Así aseguramos que 'hasPurchased' encuentre el registro después.
      confirmPurchase(); 
      const purchasedPlan = cart.find(item => item.title.includes('Plan') || item.price > 0);
      if (purchasedPlan) {
  // Llamamos a la función que ya creaste en AuthProvider. 
  // Le pasamos 'pro' para que coincida con tu lógica de isPremium: ['pro', 'unlimited']
  updateUserPlan('pro'); 
}
      // 3. Feedback al usuario
      toast.success('¡Pago procesado con éxito!', {
        description: 'Te enviamos el recibo a tu email y habilitamos tus cursos.'
      });
      
      // 4. Redirección al Hub de Aprendizaje
      setTimeout(() => {
        navigate('/mis-compras'); 
      }, 3000);

    }, 2500);
  };

  // --- VISTA DE ÉXITO (Post-Payment) ---
  if (paymentSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 animate-in zoom-in duration-500">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl text-center max-w-md w-full border border-slate-100 dark:border-slate-700">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} strokeWidth={3} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">¡Pago Aprobado!</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
            Gracias, <span className="font-bold text-slate-900 dark:text-white">{formData.fullName.split(' ')[0]}</span>.<br/>
            Ya tienes acceso total a tu contenido premium.
          </p>
          
          {/* Barra de progreso visual para la redirección */}
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-emerald-500 animate-[loading_3s_ease-in-out_forwards]"></div>
          </div>
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Redirigiendo a tu Aula Virtual...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* HEADER DE NAVEGACIÓN */}
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
          
          {/* 1. DATOS DE FACTURACIÓN */}
          <section className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <User size={20} className="text-emerald-500"/> Información de Facturación
            </h3>
            
            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nombre Completo</label>
                <div className="relative group/input">
                  <User size={16} className="absolute left-3 top-3 text-slate-400 group-focus-within/input:text-emerald-500 transition-colors" />
                  <input 
                    type="text" 
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-400"
                    placeholder="Como figura en tu DNI"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email (Para envío de recibo)</label>
                <div className="relative group/input">
                  <Mail size={16} className="absolute left-3 top-3 text-slate-400 group-focus-within/input:text-emerald-500 transition-colors" />
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-400"
                    placeholder="ejemplo@correo.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Dirección</label>
                  <input 
                    type="text" 
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-400"
                    placeholder="Calle y Altura"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Ciudad / CP</label>
                  <input 
                    type="text" 
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-400"
                    placeholder="CABA"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* 2. DATOS DE PAGO */}
          <section className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            {/* Decoración de fondo */}
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
              <CreditCard size={120} />
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <CreditCard size={20} className="text-emerald-500"/> Detalles de la Tarjeta
            </h3>

            <div className="grid grid-cols-1 gap-5 relative z-10">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Número de Tarjeta</label>
                <div className="relative group/input">
                  <CreditCard size={16} className="absolute left-3 top-3 text-slate-400 group-focus-within/input:text-emerald-500 transition-colors" />
                  <input 
                    type="text" 
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    maxLength="19"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-400"
                    placeholder="0000 0000 0000 0000"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Vencimiento</label>
                  <input 
                    type="text" 
                    name="expiry"
                    value={formData.expiry}
                    onChange={handleInputChange}
                    placeholder="MM/AA"
                    maxLength="5"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">CVC / CVV</label>
                  <div className="relative group/input">
                     <Lock size={14} className="absolute left-3 top-3 text-slate-400 group-focus-within/input:text-emerald-500 transition-colors" />
                     <input 
                        type="text" 
                        name="cvc"
                        value={formData.cvc}
                        onChange={handleInputChange}
                        placeholder="123"
                        maxLength="4"
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-400"
                      />
                  </div>
                </div>
              </div>
              
              <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/20">
                <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400"/>
                <span className="text-emerald-800 dark:text-emerald-300 font-medium">Tus datos viajan encriptados vía SSL de 256-bits.</span>
              </div>
            </div>
          </section>
        </div>

        {/* === COLUMNA DERECHA: RESUMEN (STICKY) === */}
        <div className="lg:col-span-5">
          <div className="sticky top-24">
            <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-900/20 relative overflow-hidden ring-1 ring-white/10">
               {/* Decoración de fondo */}
               <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>

               <h3 className="text-lg font-black uppercase tracking-widest mb-6 border-b border-white/10 pb-4">
                 Resumen de Orden
               </h3>

               <div className="space-y-4 mb-8 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                 {cart.map(item => (
                   <div key={item.id} className="flex justify-between items-start gap-4 text-sm group/item">
                      <div className="flex-1">
                        <p className="font-bold text-white leading-tight group-hover/item:text-emerald-400 transition-colors">{item.title}</p>
                        <p className="text-slate-400 text-xs mt-0.5">{item.plan || 'Producto Digital'}</p>
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
                 onClick={handleSubmit}
                 disabled={isProcessing}
                 className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/50 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 relative overflow-hidden"
               >
                 {isProcessing ? (
                   <>
                     <Loader2 size={20} className="animate-spin" /> Procesando...
                   </>
                 ) : (
                   <>
                     PAGAR AHORA <Lock size={18} />
                   </>
                 )}
               </button>
               
               <p className="text-center text-[10px] text-slate-500 mt-4 uppercase font-bold tracking-wider">
                 Al confirmar aceptas nuestros términos y condiciones.
               </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}