import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  ShoppingCart, 
  Trash2, 
  BarChart3, 
  ArrowRight, 
  Zap, 
  GraduationCap, 
  Library, 
  // Iconos para reconstruir la identidad del producto
  BookOpen,
  FileSpreadsheet,
  Video,
  Clock,
  Star,
  Truck,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';

// --- CONTEXTOS ---
import { useWishlist } from '../context/WishlistContext';
import { useShop } from '../context/ShopContext';

// --- UTILIDADES VISUALES ---
const COLOR_THEMES = {
  emerald: { bg: 'bg-emerald-500', light: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-200' },
  blue:    { bg: 'bg-blue-500',    light: 'bg-blue-500/10',    text: 'text-blue-600',    border: 'border-blue-200' },
  indigo:  { bg: 'bg-indigo-500',  light: 'bg-indigo-500/10',  text: 'text-indigo-600',  border: 'border-indigo-200' },
  purple:  { bg: 'bg-purple-500',  light: 'bg-purple-500/10',  text: 'text-purple-600',  border: 'border-purple-200' },
  rose:    { bg: 'bg-rose-500',    light: 'bg-rose-500/10',    text: 'text-rose-600',    border: 'border-rose-200' },
  slate:   { bg: 'bg-slate-500',   light: 'bg-slate-500/10',   text: 'text-slate-600',   border: 'border-slate-200' },
};

/**
 * 💎 Componente: WishlistCard (SUPER CHARGED)
 * Reconstruye la UI completa del producto original.
 */
const WishlistCard = ({ item, onRemove, onAddToCart }) => {
  // 1. Recuperamos el tema de color original
  const theme = COLOR_THEMES[item.color] || COLOR_THEMES.emerald;

  // 2. Lógica de Ícono Inteligente (Rehidratación)
  // Como JSON no guarda componentes, decidimos cuál mostrar según el 'type'
  const renderIcon = () => {
    // Si el ícono vino como string o type, lo mapeamos
    switch (item.type) {
      case 'libro': return <BookOpen size={24} />;
      case 'recurso': return <FileSpreadsheet size={24} />;
      case 'curso': return <Video size={24} />;
      default: return <Zap size={24} />; // Fallback elegante
    }
  };

  return (
    <div className="group relative flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      
      {/* 1. HEADER VISUAL: Color e Identidad */}
      <div className={`relative h-28 overflow-hidden ${theme.light} transition-colors`}>
        {/* Decoración de fondo */}
        <div className={`absolute -right-6 -top-6 opacity-10 ${theme.text} transform rotate-12 group-hover:scale-110 transition-transform duration-700`}>
           {renderIcon()} {/* Versión gigante decorativa */}
           <div className="scale-[5] origin-center">{renderIcon()}</div> 
        </div>
        
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
          {/* Badge de Tipo */}
          <span className="backdrop-blur-md bg-white/90 dark:bg-black/20 text-slate-700 dark:text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-white/20 shadow-sm">
            {item.type || 'Herramienta'}
          </span>
          
          {/* Botón Eliminar */}
          <button 
            onClick={() => onRemove(item.id)}
            className="p-2 rounded-full bg-white/60 dark:bg-black/30 hover:bg-rose-500 hover:text-white text-slate-400 transition-all backdrop-blur-md shadow-sm"
            title="Quitar de favoritos"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* 2. BODY CONTENT */}
      <div className="p-5 flex-1 flex flex-col relative">
        
        {/* Icono Flotante Principal */}
        <div className={`absolute -top-8 left-5 p-3 rounded-xl bg-white dark:bg-slate-800 shadow-md border border-slate-100 dark:border-slate-700 ${theme.text}`}>
          {renderIcon()}
        </div>

        {/* Título & Badges */}
        <div className="mt-8 mb-3">
            {item.badge && (
                <span className={`inline-block mb-1 text-[10px] font-black uppercase tracking-widest ${theme.text}`}>
                    ★ {item.badge}
                </span>
            )}
            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {item.title || item.titulo || item.name}
            </h3>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-5 leading-relaxed">
          {item.description || item.descripcion}
        </p>

        {/* METADATOS (La parte que faltaba para que se vea "Completo") */}
        <div className="grid grid-cols-2 gap-y-2 mb-5 pt-4 border-t border-slate-100 dark:border-slate-800">
             {item.duracion && (
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <Clock size={14} className="text-emerald-500"/> {item.duracion}
                </div>
             )}
             {item.rating > 0 && (
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <Star size={14} className="text-amber-400 fill-amber-400"/> {item.rating} / 5
                </div>
             )}
             {item.estudiantes && (
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <Truck size={14} className="text-blue-500"/> {item.estudiantes} {item.type === 'libro' ? 'ventas' : 'alumnos'}
                </div>
             )}
             {/* Fallback si no hay data, mostramos chips de calidad */}
             {!item.duracion && !item.rating && (
                 <>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                        <ShieldCheck size={12} className="text-emerald-500"/> VERIFICADO
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                        <TrendingUp size={12} className="text-blue-500"/> ACTUALIZADO
                    </div>
                 </>
             )}
        </div>

        {/* 3. ACTION ZONE */}
        <div className="mt-auto flex items-center justify-between gap-3">
            <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Precio</span>
                <span className="text-xl font-black text-slate-900 dark:text-white">
                    ${item.price?.toLocaleString() || '0'}
                </span>
            </div>

            <button 
            onClick={() => onAddToCart(item)}
            className="flex-1 max-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black uppercase tracking-wide rounded-xl hover:bg-emerald-600 dark:hover:bg-emerald-400 hover:text-white dark:hover:text-slate-900 transition-all shadow-sm hover:shadow-lg active:scale-95"
            >
            <ShoppingCart size={14} />
            AGREGAR
            </button>
        </div>
      </div>
    </div>
  );
};

// --- PÁGINA PRINCIPAL ---
export default function WishlistPage() {
  const { wishlist, removeFromWishlist, loading } = useWishlist();
  const { addToCart } = useShop();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // --- EMPTY STATE ---
  if (!loading && wishlist.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 animate-in zoom-in duration-300">
        <div className="relative mb-6 group">
          <div className="absolute inset-0 bg-emerald-500/20 blur-[40px] rounded-full group-hover:bg-emerald-500/30 transition-all"></div>
          <div className="relative bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700">
            <Heart size={48} className="text-slate-300 dark:text-slate-600" />
            <div className="absolute -top-2 -right-2 bg-emerald-500 text-white p-2 rounded-full shadow-lg animate-bounce">
               <Zap size={16} fill="currentColor"/>
            </div>
          </div>
        </div>
        
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight text-center">
          Tu colección está vacía
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md text-center text-lg leading-relaxed">
          Explora nuestra suite de inteligencia financiera y guarda las herramientas clave para tu estrategia.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link 
            to="/academia"
            className="flex items-center justify-center gap-2 px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/30 hover:-translate-y-1"
          >
            <GraduationCap size={20} />
            Explorar Academia
          </Link>

          <Link 
            to="/libreria"
            className="flex items-center justify-center gap-2 px-8 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-white font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 transition-all hover:shadow-lg"
          >
            <Library size={20} />
            Ver Librería
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-6 border-b border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-4 duration-700">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-rose-100 to-orange-50 dark:from-rose-900/20 dark:to-orange-900/10 rounded-2xl border border-rose-100 dark:border-rose-500/20">
                <Heart className="text-rose-500" size={32} fill="currentColor" />
            </div>
            <div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                Mis Favoritos
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2 mt-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {wishlist.length} {wishlist.length === 1 ? 'herramienta guardada' : 'herramientas guardadas'} en tu nube personal
                </p>
            </div>
        </div>
        
        <div className="flex gap-2">
            <Link to="/carrito" className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
                IR AL CARRITO <ArrowRight size={12}/>
            </Link>
        </div>
      </div>

      {/* GRID PRINCIPAL */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {wishlist.map((item) => (
            <WishlistCard 
                key={item.id} 
                item={item} 
                onRemove={removeFromWishlist}
                onAddToCart={addToCart}
            />
            ))}
        </div>
      )}
    </div>
  );
}