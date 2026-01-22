import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext'; // Importamos el Contexto
import { 
  Star, 
  Clock, 
  BookOpen, 
  Video, 
  ShoppingCart, 
  Heart, 
  Truck, 
  FileSpreadsheet, 
  Download 
} from 'lucide-react';

export function ProductCard({ product }) {
  const navigate = useNavigate();
  
  // 1. EXTRAEMOS LAS FUNCIONES DEL CONTEXTO (Solución a "addToCart is not defined")
  const { addToCart, toggleWishlist, isInWishlist } = useShop();

  // 2. DESESTRUCTURACIÓN SEGURA
  const { 
    id, 
    type = 'recurso', 
    title = 'Sin Título', 
    author = 'MonitorEco', 
    price = 0, 
    discountPrice, 
    image, 
    tags = [], 
    badge, 
    rating = 0, 
    reviewsCount = 0,
    meta = {} 
  } = product || {};

  // 3. LÓGICA DE ICONOS
  let IconoPrincipal, IconoMeta, textoMeta;

  switch (type) {
    case 'curso':
      IconoPrincipal = Video;
      IconoMeta = Clock;
      textoMeta = meta.duration ?? 'Online';
      break;
    case 'libro':
      IconoPrincipal = BookOpen;
      IconoMeta = Truck;
      textoMeta = meta.delivery ?? 'Envío estándar';
      break;
    default: // Recursos
      IconoPrincipal = FileSpreadsheet;
      IconoMeta = Download;
      textoMeta = meta.fileType ?? 'Digital';
      break;
  }

  // 4. ESTADO DERIVADO (Solución a "isLiked is unused")
  const isLiked = isInWishlist(id);

  // 5. FORMATEO DE PRECIO
  const formatoDinero = new Intl.NumberFormat('es-AR', {
    style: 'currency', 
    currency: 'ARS', 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });

  const precioFinal = formatoDinero.format(discountPrice ?? price);
  const precioOriginal = discountPrice ? formatoDinero.format(price) : null;

  return (
    <div className="
      group relative flex flex-col h-full overflow-hidden
      bg-white dark:bg-slate-900 
      border border-slate-300 dark:border-slate-700 
      rounded-2xl 
      transition-all duration-300 ease-out
      hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50
      hover:border-emerald-500/50
      hover:-translate-y-1
    ">
      
      {/* ZONA DE IMAGEN (Clicable para ir a detalle/checkout) */}
      <div 
        className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer"
        onClick={() => navigate(`/checkout/${id}`)} // Solución a "navigate is unused"
      >
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          loading="lazy" 
        />
        
        {/* Badge de Tipo */}
        <div className="absolute top-3 left-3 flex gap-2">
            <span className="
              flex items-center gap-1.5 px-2.5 py-1 
              bg-slate-900/90 backdrop-blur-md text-white 
              text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-lg
            ">
                <IconoPrincipal size={12} strokeWidth={2.5} /> 
                {type}
            </span>
            
            {badge && (
                <span className="
                  px-2.5 py-1 
                  bg-amber-500 text-white 
                  text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-lg shadow-amber-500/20
                ">
                    {badge}
                </span>
            )}
        </div>

        {/* BOTÓN WISHLIST (CORAZÓN) */}
        <button 
          onClick={(e) => {
            e.stopPropagation(); // Evita que el clic dispare el navigate de la imagen
            toggleWishlist(product);
          }}
          className={`
            absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-300
            ${isLiked 
              ? 'bg-rose-500 text-white opacity-100 translate-y-0 shadow-lg shadow-rose-500/30' 
              : 'bg-white/90 dark:bg-black/50 text-slate-400 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 hover:text-rose-500 hover:bg-white' 
            }
          `}
        >
            <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
        </button>
      </div>

      {/* ZONA DE INFO */}
      <div className="flex-1 p-5 flex flex-col">
        
        <div className="mb-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
            {title}
          </h3>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
            Por <span className="text-slate-700 dark:text-slate-300">{author}</span>
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
            {tags.slice(0, 3).map((tag, idx) => (
                <span key={idx} className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    {tag}
                </span>
            ))}
        </div>

        {/* Métricas */}
        <div className="flex items-center gap-4 mb-5 text-xs text-slate-600 dark:text-slate-400 font-medium">
            <div className="flex items-center gap-1 text-amber-500">
                <Star size={14} fill="currentColor" strokeWidth={0} />
                <span className="font-bold text-slate-900 dark:text-white">{rating}</span>
                <span className="text-slate-400">({reviewsCount})</span>
            </div>
            <div className="w-px h-3 bg-slate-300 dark:bg-slate-700"></div>
            <div className="flex items-center gap-1.5">
                <IconoMeta size={14} className="text-emerald-600 dark:text-emerald-400" />
                <span>{textoMeta}</span>
            </div>
        </div>

        {/* PIE DE TARJETA */}
        <div className="mt-auto flex items-end justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <div>
                {precioOriginal && (
                    <p className="text-[11px] font-bold text-slate-400 line-through mb-0.5">
                        {precioOriginal}
                    </p>
                )}
                <div className="flex items-baseline gap-1">
                    <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                        {precioFinal}
                    </p>
                    <span className="text-[10px] font-bold text-slate-400">ARS</span>
                </div>
            </div>

            {/* BOTÓN CARRITO: Ahora usa addToCart */}
            <button 
              onClick={() => addToCart(product)}
              className="
                flex items-center gap-2 px-4 py-2 
                bg-slate-900 dark:bg-white text-white dark:text-slate-900 
                rounded-xl font-bold text-xs uppercase tracking-wide
                hover:bg-emerald-600 dark:hover:bg-emerald-400 dark:hover:text-black
                transition-all active:scale-95 shadow-lg shadow-slate-900/10
              "
            >
                <ShoppingCart size={16} strokeWidth={2} />
                <span>Agregar</span>
            </button>
        </div>
      </div>
    </div>
  );
}