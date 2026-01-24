import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, BarChart3, ExternalLink, GraduationCap, Library } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export default function WishlistPage() {
  const { wishlist = [], removeFromWishlist, addToCart } = useShop();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (wishlist.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 animate-in zoom-in duration-300">
        <div className="bg-rose-50 dark:bg-rose-900/10 p-6 rounded-full mb-4">
          <Heart size={48} className="text-rose-400 dark:text-rose-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Sin Favoritos
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md text-center">
          Guarda las herramientas que te interesan pulsando el corazón en los listados.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
  {/* Botón Principal - Academia */}
  <Link 
    to="/academia"
    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
  >
    <GraduationCap size={18} />
    Explorar Cursos
  </Link>

  {/* Botón Secundario - Librería */}
  <Link 
    to="/libreria"
    className="flex items-center justify-center gap-2 px-6 py-2.5 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-white font-bold rounded-lg transition-colors"
  >
    <Library size={18} />
    Ver Librería
  </Link>
</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-rose-100 dark:bg-rose-900/20 rounded-lg">
            <Heart className="text-rose-600 dark:text-rose-500" size={24} />
        </div>
        <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
            Mis Favoritos
            </h1>
            <p className="text-sm text-slate-500 mt-1">Herramientas guardadas para después</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlist.map((item) => (
          <div 
            key={item.id} 
            className="group flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/30 transition-all duration-300 hover:-translate-y-1"
          >
            {/* Header Color */}
            <div className={`h-1.5 w-full bg-${item.color || 'emerald'}-500`}></div>
            
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg bg-${item.color || 'emerald'}-50 dark:bg-${item.color || 'emerald'}-900/20 text-${item.color || 'emerald'}-600 dark:text-${item.color || 'emerald'}-400`}>
                  <BarChart3 size={20} />
                </div>
                <button 
                  onClick={() => removeFromWishlist(item.id)}
                  className="text-slate-300 hover:text-rose-500 transition-colors p-1.5 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md"
                  title="Quitar de favoritos"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                {item.titulo}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-3 flex-1">
                {item.descripcion}
              </p>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                 <Link to={`/tool/${item.id}`} className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1">
                    VER DETALLES <ExternalLink size={10} />
                 </Link>
                
                <button 
                  onClick={() => {
                    addToCart(item);
                    removeFromWishlist(item.id);
                  }}
                  className="flex items-center gap-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-emerald-600 dark:hover:bg-emerald-500 hover:text-white dark:hover:text-white transition-all"
                >
                  <ShoppingCart size={14} /> Agregar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}