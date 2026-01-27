import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Star, Clock, BookOpen, Video, ShoppingCart, Heart, 
  Truck, FileSpreadsheet, Check, X,
  PlayCircle 
} from 'lucide-react';
import { toast } from 'sonner';

// --- CORRECCIÓN DE RUTAS (FIX) ---
// Usamos '../' porque 'components' y 'context' son hermanos dentro de 'src'
import { useShop } from '../context/ShopContext';       
import { useWishlist } from '../context/WishlistContext'; 

export function ProductCard({ product }) {
  const navigate = useNavigate();
  
  // --- 2. HOOKS DESACOPLADOS ---
  // A. Lógica Transaccional (Carrito)
  // [MODIFICADO] Agregamos 'hasPurchased' para verificar historial
  const { addToCart, removeFromCart, cart, hasPurchased } = useShop();
  
  // B. Lógica de Engagement (Wishlist - NUEVO CEREBRO)
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const { 
    id, 
    type = 'recurso', 
    title = 'Sin Título', 
    description,          
    price = 0,            
    // nivel,  <-- ELIMINADO: No se usa en la UI actualmente, limpiamos el linter.
    duracion, 
    rating = 0, 
    estudiantes, 
    badge, 
    color = 'emerald', 
    Icono: IconoProp, 
    image                 
  } = product || {};

  // --- 3. ESTADOS DERIVADOS ---
  const isLiked = isInWishlist(id);
  const isAdded = cart.some(item => item.id === id);

  // [NUEVO] Lógica de Propiedad: 
  // Si ya lo compraste Y NO es un libro, lo marcamos como adquirido.
  const isPurchased = hasPurchased(id) && type !== 'libro';

  // Icono por defecto (Mantenemos tu lógica visual)
  let IconoPrincipal = IconoProp || Video;
  if (!IconoProp) {
      switch (type) {
        case 'libro': IconoPrincipal = BookOpen; break;
        case 'recurso': IconoPrincipal = FileSpreadsheet; break;
        default: IconoPrincipal = Video;
      }
  }

  const precioFinal = new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS', minimumFractionDigits: 0
  }).format(price);

  // --- HANDLERS ---

  // Handler para Carrito (Mantenemos tu lógica de Toggle + Protección)
  const handleCartAction = (e) => {
    e.stopPropagation();

    // [NUEVO] Si ya es tuyo, te llevo a verlo en lugar de comprarlo
    if (isPurchased) {
       navigate('/mis-cursos');
       return;
    }

    if (isAdded) {
        removeFromCart(id);
        toast.info("Eliminado del carrito", { duration: 2000 });
    } else {
        addToCart(product);
    }
  };

  // Handler para Wishlist (NUEVO)
  const handleWishlistAction = (e) => {
    e.stopPropagation(); // Evitamos navegar al detalle
    if (isLiked) {
        removeFromWishlist(id);
    } else {
        addToWishlist(product);
    }
  };

  return (
    <div 
      onClick={() => navigate(`/producto/${id}`)}
      className="group relative flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-black/40 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
    >
      
      {/* --- ZONA SUPERIOR --- */}
      <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
        {image ? (
            <>
                <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/0 transition-colors z-10" />
                <img 
                    src={image} 
                    alt={title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
            </>
        ) : (
            <div className={`w-full h-full bg-${color}-50 dark:bg-${color}-900/20 flex items-center justify-center`}>
                <IconoPrincipal size={64} className={`text-${color}-200 dark:text-${color}-800`} />
            </div>
        )}

        {/* Badge */}
        <div className="absolute top-3 left-3 z-20">
             <span className="backdrop-blur-md bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider shadow-sm border border-slate-200 dark:border-slate-700">
                {type}
            </span>
        </div>

        {/* Wishlist Toggle CONECTADO */}
        <button 
            onClick={handleWishlistAction}
            className={`absolute top-3 right-3 z-20 p-2 rounded-full backdrop-blur-md shadow-sm border border-white/20 transition-all active:scale-90 ${
                isLiked 
                ? 'bg-rose-500 text-white shadow-rose-500/30' 
                : 'bg-white/80 dark:bg-black/50 text-slate-600 dark:text-slate-300 hover:bg-rose-500 hover:text-white'
            }`}
        >
            <Heart size={18} fill={isLiked ? "currentColor" : "none"} strokeWidth={isLiked ? 0 : 2} />
        </button>
      </div>

      {/* --- ZONA INFERIOR --- */}
      <div className="p-5 flex-1 flex flex-col">
        
        {badge && (
            <div className="mb-2">
                <span className={`text-[10px] font-black uppercase tracking-widest text-${color}-600 dark:text-${color}-400`}>
                    ★ {badge}
                </span>
            </div>
        )}

        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-tight group-hover:text-emerald-600 transition-colors">
            {title}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
            {description}
        </p>

        {/* Metadatos */}
        <div className="grid grid-cols-2 gap-y-2 mb-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
            {duracion && (
                <div className="flex items-center gap-1.5"><Clock size={14} className="text-emerald-500"/> {duracion}</div>
            )}
            {estudiantes && (
                <div className="flex items-center gap-1.5"><Truck size={14} className="text-blue-500"/> {estudiantes} {type === 'libro' ? 'vendidos' : 'alumnos'}</div>
            )}
            <div className="flex items-center gap-1.5"><Star size={14} className="text-amber-400 fill-amber-400"/> {rating}</div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex flex-col">
                <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Precio</span>
                <span className="text-xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                    {/* [VISUAL] Si ya lo compraste, mostramos 'ADQUIRIDO' en lugar del precio */}
                    {isPurchased ? 'ADQUIRIDO' : precioFinal}
                </span>
            </div>

            {/* Botón de Compra Inteligente */}
            <button 
              onClick={handleCartAction}
              className={`
                group/btn flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all shadow-lg active:scale-95
                ${isPurchased 
                    // ESTILO: YA COMPRADO (Azul)
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40'
                    : isAdded 
                        // ESTILO: EN CARRITO (Verde)
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 dark:hover:bg-rose-900/30 dark:hover:text-rose-400 dark:hover:border-rose-800' 
                        // ESTILO: NORMAL (Negro/Blanco)
                        : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-emerald-600 dark:hover:bg-emerald-400 hover:text-white dark:hover:text-slate-900 shadow-slate-900/20'
                }
              `}
            >
                {isPurchased ? (
                    <>
                        <PlayCircle size={16} /> Ver Curso
                    </>
                ) : isAdded ? (
                    <>
                        <span className="group-hover/btn:hidden flex items-center gap-2">
                            <Check size={16}/> Agregado
                        </span>
                        <span className="hidden group-hover/btn:flex items-center gap-2">
                            <X size={16}/> Quitar
                        </span>
                    </>
                ) : (
                    <><ShoppingCart size={16}/> Comprar</>
                )}
            </button>
        </div>

      </div>
    </div>
  );
}