import React, { useMemo } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Info, 
  TrendingUp, 
  TrendingDown, 
  Calculator, // Para métricas calculadas
  Database,   // Para datos crudos
  Activity,
  SearchX
} from 'lucide-react';

// --- DATA SOURCE ---
// Importamos la nueva "Single Source of Truth"
import { macroRegistry } from '../data/macroRegistry';
import { sectores } from '../data/sectores';

// --- UTILS: COLOR MAPPING ---
// Rationale: Tailwind no soporta interpolación dinámica completa (bg-${color}-500) en JIT mode 
// sin safelist. Este mapa garantiza que los estilos se purguen y apliquen correctamente.
const themeMap = {
  emerald: { bg: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-500/20', badge: 'bg-emerald-500/10 text-emerald-400', hover: 'hover:border-emerald-500/50' },
  blue:    { bg: 'bg-blue-500',    text: 'text-blue-500',    border: 'border-blue-500/20',    badge: 'bg-blue-500/10 text-blue-400',    hover: 'hover:border-blue-500/50' },
  indigo:  { bg: 'bg-indigo-500',  text: 'text-indigo-500',  border: 'border-indigo-500/20',  badge: 'bg-indigo-500/10 text-indigo-400',  hover: 'hover:border-indigo-500/50' },
  purple:  { bg: 'bg-purple-500',  text: 'text-purple-500',  border: 'border-purple-500/20',  badge: 'bg-purple-500/10 text-purple-400',  hover: 'hover:border-purple-500/50' },
  orange:  { bg: 'bg-orange-500',  text: 'text-orange-500',  border: 'border-orange-500/20',  badge: 'bg-orange-500/10 text-orange-400',  hover: 'hover:border-orange-500/50' },
  rose:    { bg: 'bg-rose-500',    text: 'text-rose-500',    border: 'border-rose-500/20',    badge: 'bg-rose-500/10 text-rose-400',    hover: 'hover:border-rose-500/50' },
  cyan:    { bg: 'bg-cyan-500',    text: 'text-cyan-500',    border: 'border-cyan-500/20',    badge: 'bg-cyan-500/10 text-cyan-400',    hover: 'hover:border-cyan-500/50' },
  slate:   { bg: 'bg-slate-500',   text: 'text-slate-500',   border: 'border-slate-500/20',   badge: 'bg-slate-500/10 text-slate-400',   hover: 'hover:border-slate-500/50' },
};

/**
 * Componente: Vista Maestra de Sector (Dynamic Route)
 * Arquitectura: Principal Frontend Architect
 * Descripción: Renderiza un dashboard específico basado en la categoría de la URL.
 */
export const Categorias = () => {
  const { id } = useParams(); // Ej: 'monetario', 'fiscal'

  // --- LOGIC: DATA FETCHING ---
  // Rationale: useMemo evita re-filtrar el array gigante de macroRegistry en cada render si el ID no cambia.
  const sectorInfo = useMemo(() => 
    sectores.find(s => s.id === id), 
  [id]);

  const indicadores = useMemo(() => 
    macroRegistry.filter(item => item.category === id),
  [id]);

  // --- SAFETY NET: 404 HANDLING ---
  if (!sectorInfo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B1121] px-4">
        <div className="bg-slate-900 p-6 rounded-full border border-slate-800 mb-6">
          <SearchX size={48} className="text-slate-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Sector no encontrado</h2>
        <p className="text-slate-400 mb-8">La categoría "{id}" no existe en nuestra base de datos.</p>
        <Link to="/" className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors">
          Volver al Inicio
        </Link>
      </div>
    );
  }

  // Configuración de tema visual
  const theme = themeMap[sectorInfo.color] ?? themeMap.slate;
  const SectorIcon = sectorInfo.Icono || Database;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1121] pb-20 transition-colors duration-300">
      
      {/* --- HERO HEADER --- */}
      <div className="w-full py-12 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <Link to="/" className="inline-flex items-center text-slate-500 hover:text-emerald-500 mb-8 transition-colors text-sm font-medium group">
            <ArrowLeft size={16} className="mr-2 transition-transform group-hover:-translate-x-1" /> 
            Volver al Tablero
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-start gap-5">
              {/* Icono del Sector con Glow */}
              <div className={`p-4 rounded-2xl ${theme.badge} border ${theme.border} relative overflow-hidden group-hover:scale-105 transition-transform`}>
                 <div className={`absolute inset-0 ${theme.bg} opacity-10 blur-xl`}></div>
                 <SectorIcon size={32} className="relative z-10" />
              </div>
              
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                  {sectorInfo.titulo}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 max-w-2xl text-lg leading-relaxed">
                  {sectorInfo.descripcion || "Monitor de variables clave y métricas derivadas."}
                </p>
              </div>
            </div>

            {/* KPI Counter (Visual Candy) */}
            <div className="hidden md:block text-right border-l border-slate-200 dark:border-slate-800 pl-8">
              <span className="text-4xl font-black text-slate-900 dark:text-white font-mono tracking-tighter">
                {indicadores.length}
              </span>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">
                Variables Activas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- DASHBOARD GRID --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {indicadores.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {indicadores.map((item) => (
              <MetricCard key={item.id} item={item} theme={theme} />
            ))}
          </div>
        ) : (
          // EMPTY STATE (Data-First Design)
          <div className="flex flex-col items-center justify-center py-24 bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-3xl">
            <Database size={48} className="text-slate-700 mb-4" />
            <h3 className="text-xl font-bold text-slate-400">Sin datos sincronizados</h3>
            <p className="text-slate-500 max-w-sm text-center">
              Estamos conectando las APIs para el sector <span className="text-slate-300">{sectorInfo.titulo}</span>.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

// --- SUBCOMPONENTE: METRIC CARD (Private Component) ---
// Rationale: Este componente es exclusivo de esta vista. Maneja la lógica visual de "Raw" vs "Calculated".
const MetricCard = ({ item, theme }) => {
  // Safety Nets
  const value = item.value ?? 'N/A';
  const variation = item.variation ?? '0%';
  const isCalculated = item.type === 'calculated';
  const isHighlight = item.isHighlight ?? false; // Nullish coalescing

  // Iconografía Dinámica
  const TypeIcon = isCalculated ? Calculator : Database;
  const ItemIcon = item.icon || Activity;
  
  // Lógica de Tendencia (Color Semántico)
  const isNegative = variation.includes('-');
  const trendColor = isNegative ? 'text-rose-400 bg-rose-500/10' : 'text-emerald-400 bg-emerald-500/10';
  const TrendIcon = isNegative ? TrendingDown : TrendingUp;

  return (
    <div className={`
      relative group flex flex-col justify-between p-6 rounded-2xl 
      bg-white dark:bg-slate-900 
      border transition-all duration-300 ease-out
      ${isHighlight 
        ? `border-${item.color || 'indigo'}-500/40 shadow-[0_0_30px_rgba(0,0,0,0.3)] dark:shadow-${item.color || 'indigo'}-900/20` 
        : 'border-slate-200 dark:border-slate-800 hover:border-slate-600 dark:hover:border-slate-700'
      }
      hover:-translate-y-1 hover:shadow-xl
    `}>
      
      {/* 1. BADGE DE TIPO (Top Right) */}
      <div className="absolute top-5 right-5">
        <span className={`
          flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border
          ${isCalculated 
            ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' 
            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
          }
        `}>
          <TypeIcon size={10} strokeWidth={3} />
          {isCalculated ? 'Métrica Derivada' : 'Dato Oficial'}
        </span>
      </div>

      {/* 2. HEADER E ICONO */}
      <div className="mb-6 pr-8">
        <div className={`
          inline-flex p-3 rounded-xl mb-4 transition-colors
          ${isCalculated 
            ? 'bg-indigo-500/10 text-indigo-400' 
            : theme.badge
          }
        `}>
          <ItemIcon size={22} strokeWidth={2} />
        </div>
        
        <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight mb-1">
          {item.title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-2 h-8">
          {item.description}
        </p>
      </div>

      {/* 3. DATA DISPLAY */}
      <div>
        <div className="flex items-baseline justify-between mb-3">
          {/* Valor Principal (Tabular Nums para alineación) */}
          <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight font-mono tabular-nums">
            {value}
          </span>
          
          {/* Badge de Variación */}
          <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trendColor}`}>
            <TrendIcon size={12} />
            {variation}
          </span>
        </div>

        {/* 4. INSIGHT (Solo si existe - Lógica de Experto) */}
        {item.insight && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex gap-2.5 items-start">
              <Info size={14} className="text-indigo-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600 dark:text-indigo-200/80 leading-relaxed font-medium">
                {item.insight}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};