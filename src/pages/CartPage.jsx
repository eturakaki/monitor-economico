import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Trash2, 
  ArrowRight, 
  ShoppingCart, 
  CreditCard, 
  ShieldCheck, 
  CornerDownLeft, 
  GraduationCap, 
  Library,
  Ticket, // Icono para cupón
  CheckCircle2,
  Lock
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { toast } from 'sonner';

// --- HELPERS (SSOT) ---
const formatPrice = (value) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0
  }).format(value);
};

export default function CartPage() {
  const navigate = useNavigate();
  const { cart = [], removeFromCart } = useShop();
  
  // Estado local para interacción de UI (Cupones)
  const [couponCode, setCouponCode] = useState('');
  const [isCouponApplied, setIsCouponApplied] = useState(false);

  // 1. CÁLCULO DE TOTALES (Lógica Financiera)
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + (Number(item.price) || 0), 0);
  }, [cart]);

  // Simulación de impuestos (21% IVA) - Opcional, si quieres mostrarlo
  // const tax = subtotal * 0.21; 
  const tax = 0; // Por ahora 0 visualmente si son precios finales

  const total = subtotal + tax;

  // Scroll Top al montar
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // --- HANDLERS ---
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    
    // Simulación de validación (Mock)
    if (couponCode.toUpperCase() === 'PRO2026') {
        setIsCouponApplied(true);
        toast.success('Cupón aplicado con éxito', { description: 'Se aplicará el descuento en el siguiente paso.' });
    } else {
        toast.error('Cupón inválido o expirado');
    }
  };

  // --- EMPTY STATE ---
  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 animate-in fade-in duration-500">
        <div className="bg-slate-100 dark:bg-slate-800/50 p-8 rounded-full mb-6 relative group">
          <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <ShoppingCart size={48} className="text-slate-400 dark:text-slate-500 relative z-10" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
          Tu carrito está vacío
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md text-center text-lg">
          Las oportunidades de mercado no esperan. Explora nuestras herramientas premium.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link 
            to="/academia"
            className="flex items-center justify-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:-translate-y-1"
          >
            <GraduationCap size={20} />
            Ir a Cursos
          </Link>
          <Link 
            to="/libreria"
            className="flex items-center justify-center gap-2 px-8 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-white font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
          >
            <Library size={20} />
            Ir a Librería
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
            Tu Pedido
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
                Revisá los ítems antes de confirmar el pago seguro.
            </p>
        </div>
        <Link to="/" className="text-sm font-bold text-emerald-600 hover:text-emerald-500 flex items-center gap-2 transition-colors">
            <CornerDownLeft size={16} /> SEGUIR EXPLORANDO
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* === COLUMNA IZQUIERDA: LISTADO (ITEMS) === */}
        <div className="lg:col-span-8 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-800 overflow-hidden shadow-md">
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {cart.map((item) => (
                    <div key={item.id} className="p-5 sm:p-6 group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <div className="flex gap-5">
                            {/* IMAGEN / ICONO */}
                            <div className={`shrink-0 w-24 h-24 sm:w-32 sm:h-28 rounded-xl bg-${item.color || 'gray'}-50 dark:bg-${item.color || 'gray'}-900/20 flex items-center justify-center text-${item.color || 'gray'}-500 border border-slate-100 dark:border-slate-800 overflow-hidden relative`}>
                               {item.image ? (
                                  <img 
                                    src={item.image} 
                                    alt={item.title} 
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    // SI LA IMAGEN FALLA, OCULTAMOS ESTA IMG Y EL PADRE MOSTRARÁ EL CONTENIDO DE FONDO (O CAMBIAMOS EL SRC)
                                    onError={(e) => {
                                      e.target.style.display = 'none'; // Oculta la imagen rota
                                      e.target.parentElement.classList.add('flex', 'items-center', 'justify-center'); // Asegura centrado
                                      // Inyectamos el icono visualmente (esto es un truco rápido de React)
                                      // O más limpio: setear un estado local, pero para listas largas 'onError' ocultando es más performante.
                                    }}
                                  />
                              ) : (
                                  <CreditCard size={32} />
                              )}
                              {/* Truco Senior: Si ocultamos la imagen con display:none, necesitamos que se vea algo. 
                                  Asegúrate de que el div padre tenga un color de fondo o icono de fallback detrás */}
                            </div>

                            {/* INFO */}
                            <div className="flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight pr-4">
                                        {item.title} 
                                    </h3>
                                    <p className="font-mono font-bold text-lg text-slate-900 dark:text-white tabular-nums">
                                        {formatPrice(item.price)}
                                    </p>
                                </div>
                                
                                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                                    {item.description}
                                </p>
                                
                                <div className="mt-auto flex items-center justify-between">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                        {item.plan || 'Licencia Perpetua'}
                                    </span>

                                    <button 
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-slate-600 dark:text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg group/trash"
                                    >
                                        <Trash2 size={14} className="group-hover/trash:scale-110 transition-transform"/> 
                                        ELIMINAR
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                </div>
            </div>

            {/* SEGURIDAD INFO (Trust Badge) */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs">
                <ShieldCheck size={20} className="text-emerald-500 shrink-0"/>
                <p>
                    <strong>Garantía de Satisfacción:</strong> Si el producto no cumple con tus expectativas, tienes 7 días para solicitar un reembolso completo.
                </p>
            </div>
        </div>

        {/* === COLUMNA DERECHA: SUMMARY CARD (STICKY) === */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-6">
            
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-800 p-6 shadow-xl shadow-slate-200/50 dark:shadow-black/40">
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                <CreditCard size={16} className="text-emerald-500" />
                Resumen de Cuenta
              </h2>

              {/* 1. CUPÓN DE DESCUENTO */}
              <div className="mb-6">
                  {!isCouponApplied ? (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Ticket size={14} className="text-slate-600 dark:text-slate-400"/>
                            </div>
                            <input 
                                type="text" 
                                placeholder="Código de descuento" 
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value)}
                                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all uppercase placeholder-normal"
                            />
                        </div>
                        <button 
                            type="submit"
                            disabled={!couponCode}
                            className="px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-slate-900 transition-colors"
                        >
                            APLICAR
                        </button>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-lg">
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                            <Ticket size={14}/> CUPÓN APLICADO
                        </span>
                        <button onClick={() => setIsCouponApplied(false)} className="text-emerald-600 hover:text-emerald-800 text-[10px] font-black underline">
                            QUITAR
                        </button>
                    </div>
                  )}
              </div>

              {/* 2. DESGLOSE FINANCIERO */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-slate-600 dark:text-slate-400 text-sm">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums font-medium text-slate-900 dark:text-white">{formatPrice(subtotal)}</span>
                </div>
                
                {isCouponApplied && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 text-sm animate-in slide-in-from-left-2">
                        <span>Descuento (PRO2026)</span>
                        <span className="font-mono tabular-nums font-bold">- $0,00</span>
                    </div>
                )}

                <div className="flex justify-between text-slate-500 dark:text-slate-500 text-sm">
                  <span className="flex items-center gap-1">Impuestos <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1 rounded">IVA INC</span></span>
                  <span className="font-mono tabular-nums text-slate-600 dark:text-slate-400">$ 0,00</span>
                </div>
                
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-4"></div>
                
                <div className="flex justify-between items-end">
                  <span className="font-bold text-slate-900 dark:text-white text-lg">Total Final</span>
                  <div className="text-right">
                      <span className="block font-black text-3xl text-slate-900 dark:text-white font-mono tabular-nums tracking-tight">
                        {formatPrice(total)}
                      </span>
                      <span className="text-[10px] text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bold">Pesos Argentinos</span>
                  </div>
                </div>
              </div>

              {/* 3. CTA PRINCIPAL */}
              <button 
                onClick={() => navigate('/checkout')} 
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                    CONFIRMAR PEDIDO <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </span>
                {/* Brillo sutil en hover */}
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none"></div>
              </button>

              {/* 4. TRUST BADGES (Footer del Card) */}
              <div className="mt-6 flex flex-col items-center gap-3">
                 <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 opacity-60 grayscale">
                    {/* Mock de Tarjetas (Visual Only) */}
                    <div className="h-6 w-10 bg-slate-200 rounded"></div>
                    <div className="h-6 w-10 bg-slate-200 rounded"></div>
                    <div className="h-6 w-10 bg-slate-200 rounded"></div>
                 </div>
                 <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-wide">
                    <Lock size={10} /> Pago 100% Seguro y Encriptado
                 </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}