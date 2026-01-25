import { useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingCart, CreditCard, ShieldCheck, CornerDownLeft, GraduationCap, Library } from 'lucide-react';
import { useShop } from '../context/ShopContext';

// Helper de formato (SSOT visual: mismo formato que usas en CartDrawer)
const formatPrice = (value) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0
  }).format(value);
};

export default function CartPage() {
  const navigate = useNavigate();
  // Extraemos lo necesario. Defensive: fallback a array vacío.
  const { cart = [], removeFromCart } = useShop(); 

  // CÁLCULO LOCAL (Seguridad): No dependemos de que el context lo traiga.
  // [CHANGE] Estandarización: Solo calculamos usando 'price'.
  const total = useMemo(() => {
    return cart.reduce((acc, item) => acc + (Number(item.price) || 0), 0);
  }, [cart]);

  // Scroll to top al entrar
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // EMPTY STATE
  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 animate-in fade-in duration-500">
        <div className="bg-slate-100 dark:bg-slate-800/50 p-8 rounded-full mb-6">
          <ShoppingCart size={48} className="text-slate-400 dark:text-slate-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          El carrito está vacío
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md text-center">
          Explora nuestros análisis de mercado para encontrar oportunidades de inversión.
        </p>
       <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-2">
  {/* Botón 1: Academia */}
  <Link 
    to="/academia"
    className="flex items-center justify-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/20 hover:-translate-y-1"
  >
    <GraduationCap size={20} />
    Ir a Cursos
  </Link>

  {/* Botón 2: Librería */}
  <Link 
    to="/libreria"
    className="flex items-center justify-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/20 hover:-translate-y-1"
  >
    <Library size={20} />
    Ir a Librería
  </Link>
</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* HEADER SIMPLE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Resumen de Orden
            </h1>
            <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            {cart.length} ítems
            </span>
        </div>
        <Link to="/" className="text-sm font-medium text-slate-500 hover:text-emerald-500 flex items-center gap-2 transition-colors">
            <CornerDownLeft size={16} /> Seguir explorando
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* COLUMNA IZQUIERDA: LISTADO (2/3 del ancho) */}
        <div className="lg:col-span-8 space-y-4">
            <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {cart.map((item) => (
                    <div key={item.id} className="p-4 sm:p-6 group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="flex gap-4 sm:gap-6">
                            {/* Imagen / Icono del Producto */}
                            <div className={`shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-${item.color || 'gray'}-100 dark:bg-${item.color || 'gray'}-900/20 flex items-center justify-center text-${item.color || 'gray'}-500 border border-slate-100 dark:border-slate-800`}>
                                {/* [CHANGE] Standard key 'image' */}
                                {item.image ? (
                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover rounded-xl" />
                                ) : (
                                    <CreditCard size={32} />
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg leading-tight pr-8">
                                            {/* [CHANGE] Standard key 'title' */}
                                            {item.title} 
                                        </h3>
                                        <p className="font-mono font-bold text-lg text-slate-900 dark:text-white tabular-nums">
                                            {/* [CHANGE] Standard key 'price' */}
                                            {formatPrice(item.price)}
                                        </p>
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                        {/* [CHANGE] Standard key 'description' */}
                                        {item.description}
                                    </p>
                                </div>
                                
                                <div className="flex items-center justify-between mt-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                            {item.plan || 'Suscripción Mensual'}
                                        </span>
                                    </div>
                                    <button 
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1.5 text-xs font-medium px-2 py-1 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg"
                                    >
                                        <Trash2 size={14} /> Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                </div>
            </div>
        </div>

        {/* COLUMNA DERECHA: TOTAL Y PAGO (1/3 del ancho) */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-6">
            
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl shadow-slate-200/50 dark:shadow-black/40">
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <CreditCard size={16} className="text-emerald-500" />
                Detalle de Pago
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-slate-600 dark:text-slate-400 text-sm">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400 text-sm">
                  <span>Impuestos (IVA incl.)</span>
                  <span className="font-mono tabular-nums text-slate-400">0,00</span>
                </div>
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-4"></div>
                <div className="flex justify-between items-end">
                  <span className="font-bold text-slate-900 dark:text-white text-lg">Total Final</span>
                  <div className="text-right">
                      <span className="block font-black text-3xl text-emerald-600 dark:text-emerald-500 font-mono tabular-nums tracking-tight">
                        {formatPrice(total)}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">ARS / Mensual</span>
                  </div>
                </div>
              </div>

              {/* ACTION: IR A CHECKOUT */}
              <button 
                onClick={() => navigate('/checkout')} 
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
              >
                CONFIRMAR PEDIDO <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-slate-400 dark:text-slate-600 text-[10px] font-medium uppercase tracking-wider">
                <ShieldCheck size={12} />
                <span>Transacción encriptada 256-bit</span>
              </div>
            </div>

            {/* NOTA DE AYUDA */}
            <div className="p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-900/10">
                <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                    <strong>¿Necesitas factura A?</strong> Podrás ingresar tu CUIT en el siguiente paso del proceso de pago.
                </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}