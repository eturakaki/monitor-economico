import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { StatCard } from './StatCard'; 
import { misIndicadores } from '../data/monitores';
import { 
  Banknote, Landmark, TrendingUp, Scale, 
  ShoppingCart, Briefcase, Globe, ArrowRight,
  PlusCircle // Icono para el botón "Ver más"
} from 'lucide-react';

// Configuración visual y semántica de cada sección
const SECTIONS_CONFIG = {
  cambiario: { title: 'Mercado Cambiario', icon: Banknote, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  financiero: { title: 'Mercado Financiero', icon: TrendingUp, color: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
  monetario: { title: 'Política Monetaria', icon: Landmark, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  fiscal: { title: 'Cuentas Públicas', icon: Scale, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  precios: { title: 'Precios e Inflación', icon: ShoppingCart, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  actividad: { title: 'Actividad Real', icon: Briefcase, color: 'text-cyan-500', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  externo: { title: 'Sector Externo', icon: Globe, color: 'text-teal-500', bg: 'bg-teal-500/10', border: 'border-teal-500/20' },
};

// Orden por defecto si no se especifica categoría única
const ALL_CATEGORIES = ['cambiario', 'financiero', 'monetario', 'fiscal', 'precios', 'actividad', 'externo'];

/**
 * MonitorGrid
 * @param {number} limit - Máximo de tarjetas a mostrar (ej: 4).
 * @param {string} category - (Opcional) ID de la categoría única a mostrar (ej: 'cambiario').
 */
export function MonitorGrid({ limit, category }) {
  
  // 1. Agrupación de datos (Memoizado para performance)
  // Transforma el array plano de indicadores en un objeto { cambiario: [...], financiero: [...] }
  const indicadoresAgrupados = useMemo(() => {
    return misIndicadores?.reduce((acc, indicador) => {
      const cat = indicador.categoria || 'otros';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(indicador);
      return acc;
    }, {}) || {}; 
  }, []);

  // 2. Determinar qué categorías renderizar
  // Si nos pasan la prop 'category', usamos solo esa. Si no, usamos todas.
  const categoriesToRender = category ? [category] : ALL_CATEGORIES;

  return (
    <div className="w-full">
      {categoriesToRender.map((catKey) => {
        const todosLosIndicadores = indicadoresAgrupados[catKey];
        
        // Safety Check: Si no hay data, no renderizamos secciones vacías
        if (!todosLosIndicadores || todosLosIndicadores.length === 0) return null;

        // 3. Lógica de Recorte (Slicing)
        // Si existe 'limit', cortamos el array.
        const itemsToShow = limit ? todosLosIndicadores.slice(0, limit) : todosLosIndicadores;
        // Calculamos cuántos quedaron ocultos para el botón "Ver más"
        const hiddenCount = todosLosIndicadores.length - itemsToShow.length;

        // Configuración estética (Iconos y colores)
        const config = SECTIONS_CONFIG[catKey] || { title: catKey, icon: Globe, color: 'text-slate-500', bg: 'bg-slate-800' };
        const SectionIcon = config.icon;

        return (
          <section key={catKey} className="group/section mb-12 last:mb-0">
            
            {/* --- HEADER DE SECCIÓN --- */}
            <div className="flex items-end justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${config.bg} ${config.color} ring-1 ring-inset ring-slate-900/5 dark:ring-white/10`}>
                        <SectionIcon size={20} strokeWidth={2} />
                    </div>
                    <div>
                        <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1">
                            {config.title}
                        </h2>
                        <span className="text-xs text-slate-500 font-medium font-mono">
                            {todosLosIndicadores.length} METRICAS EN TIEMPO REAL
                        </span>
                    </div>
                </div>

                {/* Link de navegación "Explorar" */}
                <Link 
                    to={`/categoria/${catKey}`} 
                    className="
                        flex items-center gap-2 px-4 py-2 rounded-lg 
                        bg-slate-100 dark:bg-slate-800 
                        border border-slate-200 dark:border-slate-700
                        text-xs font-bold text-slate-600 dark:text-slate-400 
                        hover:bg-indigo-600 hover:text-white hover:border-indigo-600 dark:hover:bg-indigo-600 dark:hover:text-white dark:hover:border-indigo-500
                        transition-all duration-300
                    "
                >
                    Explorar
                    <ArrowRight size={14} />
                </Link>
            </div>

            {/* --- GRID DE TARJETAS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              
              {/* Mapeo de indicadores visibles */}
              {itemsToShow.map((indicador) => (
                <div key={indicador.id} className="h-full"> 
                    <StatCard {...indicador} />
                </div>
              ))}

              {/* --- CARD "VER MÁS" (Inteligente) --- 
                  Solo aparece si hay indicadores ocultos por el límite
              */}
              {limit && hiddenCount > 0 && (
                 <Link 
                    to={`/categoria/${catKey}`}
                    className="
                        group relative flex flex-col items-center justify-center p-6 
                        rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 
                        bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 
                        hover:border-indigo-400 dark:hover:border-indigo-500
                        transition-all duration-300 cursor-pointer h-full min-h-[180px]
                    "
                 >
                    <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-indigo-500 group-hover:scale-110 transition-all duration-300 mb-3">
                        <PlusCircle size={32} strokeWidth={1.5} />
                    </div>
                    
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        Ver {hiddenCount} indicadores más
                    </span>
                    
                    <span className="text-xs text-slate-400 mt-1 font-medium">
                        Haga clic para ver el panel completo
                    </span>
                 </Link>
              )}
            </div>

          </section>
        );
      })}
    </div>
  );
}