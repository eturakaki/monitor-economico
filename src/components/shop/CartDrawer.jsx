import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingCart, Trash2, ArrowRight, CreditCard } from 'lucide-react';
import { useShop } from '../../context/ShopContext'; // Ajusta la ruta si es necesario

// Helper local (Mismo SSOT que en CartPage)
const formatPrice = (value) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0
  }).format(value);
};

export function CartDrawer() {
  const navigate = useNavigate();
  // Extraemos estados y funciones del Contexto Global
  const { isCartOpen, closeCart, cart, removeFromCart, cartTotal } = useShop();
  
  // Ref para detectar clics fuera del drawer (opcional, por seguridad UX)
  const drawerRef = useRef(null);

  // Evitar scroll de fondo cuando el drawer está abierto
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isCartOpen]);

  // Si no está abierto, no renderizamos nada (Portal Pattern simplificado)
  if (!isCartOpen) return null;

  const handleGoToCart = () => {
    closeCart(); // Cerramos el drawer primero
    navigate('/carrito'); // Navegamos a la página completa
  };

  return (
    <div className="relative z-[100]">
      
      {/* 1. BACKDROP (Fondo Oscuro) */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={closeCart}
      />

      {/* 2. PANEL DESLIZANTE */}
      <div 
        ref={drawerRef}
        className="fixed inset-y-0 right-0 z-[101] w-full sm:w-[400px] bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col transform transition-transform animate-in slide-in-from-right duration-300"
      >
        
        {/* A. HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="relative">
                <ShoppingCart className="text-emerald-600 dark:text-emerald-500" size={20} />
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-rose-500 rounded-full"></span>
            </div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Tu Carrito
            </h2>
          </div>
          <button 
            onClick={closeCart}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* B. LISTADO DE ÍTEMS (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
               <ShoppingCart size={48} className="text-slate-300 dark:text-slate-600 mb-4" />
               <p className="text-slate-500 dark:text-slate-400 font-medium">No tienes ítems agregados</p>
               <button onClick={closeCart} className="mt-4 text-emerald-600 text-sm font-bold hover:underline">
                 Volver a la tienda
               </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-3 group animate-in slide-in-from-bottom-2 duration-300">
                {/* Imagen Mini */}
                <div className={`w-16 h-16 rounded-lg bg-${item.color || 'gray'}-100 dark:bg-${item.color || 'gray'}-900/20 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-${item.color || 'gray'}-500 shrink-0`}>
                   <CreditCard size={20} />
                </div>
                
                {/* Datos */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate pr-2">
                        {item.titulo}
                    </h4>
                    <p className="font-mono text-sm font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                        {formatPrice(item.precio)}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {item.descripcion}
                  </p>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="mt-2 text-[10px] font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={12} /> ELIMINAR
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* C. FOOTER (Resumen y Acción) */}
        {cart.length > 0 && (
          <div className="p-5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-end mb-4">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Subtotal</span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-500 font-mono tabular-nums tracking-tight">
                {formatPrice(cartTotal)}
              </span>
            </div>
            
            <div className="space-y-2">
                <button 
                    onClick={handleGoToCart}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    INICIAR COMPRA <ArrowRight size={18} />
                </button>
                
                <button 
                    onClick={closeCart}
                    className="w-full py-3 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
                >
                    Seguir mirando
                </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}