import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Database,
  Search,
  SearchX,
  ListFilter,
  X,
  ArrowDownNarrowWide, 
  ArrowUpNarrowWide,   
  ArrowDownAZ          
} from 'lucide-react';

import { StatCard } from '../components/StatCard'; 
import { misIndicadores } from '../data/monitores';
import { sectores } from '../data/sectores';

// --- UTILS ---
// Nota de Arquitecto: Mantenemos el ThemeMap pero aseguramos que los badges tengan buen contraste
const themeMap = {
  emerald: { bg: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-500', border: 'border-emerald-500/30', badge: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400', ring: 'focus:ring-emerald-500/50' },
  blue:    { bg: 'bg-blue-500',    text: 'text-blue-600 dark:text-blue-500',    border: 'border-blue-500/30',    badge: 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400',    ring: 'focus:ring-blue-500/50' },
  indigo:  { bg: 'bg-indigo-500',  text: 'text-indigo-600 dark:text-indigo-500',  border: 'border-indigo-500/30',  badge: 'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400',  ring: 'focus:ring-indigo-500/50' },
  purple:  { bg: 'bg-purple-500',  text: 'text-purple-600 dark:text-purple-500',  border: 'border-purple-500/30',  badge: 'bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400',  ring: 'focus:ring-purple-500/50' },
  orange:  { bg: 'bg-orange-500',  text: 'text-orange-600 dark:text-orange-500',  border: 'border-orange-500/30',  badge: 'bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400',  ring: 'focus:ring-orange-500/50' },
  rose:    { bg: 'bg-rose-500',    text: 'text-rose-600 dark:text-rose-500',    border: 'border-rose-500/30',    badge: 'bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400',    ring: 'focus:ring-rose-500/50' },
  cyan:    { bg: 'bg-cyan-500',    text: 'text-cyan-600 dark:text-cyan-500',    border: 'border-cyan-500/30',    badge: 'bg-cyan-100 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400',    ring: 'focus:ring-cyan-500/50' },
  slate:   { bg: 'bg-slate-500',   text: 'text-slate-600 dark:text-slate-500',   border: 'border-slate-500/30',   badge: 'bg-slate-100 dark:bg-slate-500/10 text-slate-700 dark:text-slate-400',   ring: 'focus:ring-slate-500/50' },
};

export const Categorias = () => {
  const { id } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  
  // 1. ESTADO DE ORDENAMIENTO
  const [sortConfig, setSortConfig] = useState({ key: 'default', direction: 'desc' });
  const [showSortMenu, setShowSortMenu] = useState(false);

  // 2. DATA
  const sectorInfo = useMemo(() => sectores.find(s => s.id === id), [id]);
  const rawIndicadores = useMemo(() => misIndicadores.filter(item => item.categoria === id), [id]);

  // 3. ENGINE: FILTRO + ORDENAMIENTO
  const processedIndicadores = useMemo(() => {
    let data = [...rawIndicadores];

    // A. Filtrado
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      data = data.filter(item => 
        (item.titulo || '').toLowerCase().includes(lowerTerm) ||
        (item.descripcion || '').toLowerCase().includes(lowerTerm)
      );
    }

    // B. Ordenamiento
    if (sortConfig.key !== 'default') {
      data.sort((a, b) => {
        let valA, valB;

        if (sortConfig.key === 'variacion') {
           valA = parseFloat(a.variacion || a.variation || 0);
           valB = parseFloat(b.variacion || b.variation || 0);
        } else if (sortConfig.key === 'titulo') {
           valA = (a.titulo || '').toLowerCase();
           valB = (b.titulo || '').toLowerCase();
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [searchTerm, rawIndicadores, sortConfig]);

  // 4. HANDLERS
  const handleSort = (key, direction) => {
    setSortConfig({ key, direction });
    setShowSortMenu(false);
  };

  // 404 Guard
  if (!sectorInfo) return <div className="text-slate-900 dark:text-white p-10">Sector no encontrado</div>;

  const theme = themeMap[sectorInfo.color] ?? themeMap.slate;
  const SectorIcon = sectorInfo.Icono || Database;

  return (
    // CAMBIO 1: bg-slate-100 en lugar de bg-slate-50 para mejor contraste técnico
    <div className="min-h-screen w-full bg-slate-100 dark:bg-[#0B1121] pb-20 transition-colors duration-300">
      
      {/* HEADER COMPACTO */}
      {/* CAMBIO 2: border-slate-300 en Light Mode */}
      <div className="w-full border-b border-slate-300 dark:border-slate-800 bg-white/90 dark:bg-[#0B1121]/90 backdrop-blur-md sticky top-0 z-40 transition-colors shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 md:py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* IZQUIERDA: Title */}
            <div className="flex items-center gap-4">
              <Link to="/" className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50 transition-all group">
                <ArrowLeft size={20} className="group-hover:-translate-x-1" strokeWidth={2.5} />
              </Link>
              <div className="flex items-center gap-3">
                 {/* Icono del Sector con bordes corregidos */}
                 <div className={`p-2.5 rounded-xl border hidden sm:block bg-white dark:bg-slate-900 ${theme.border} ${theme.text}`}>
                     <SectorIcon size={20} strokeWidth={2} />
                  </div>
                  <div>
                    <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                      {sectorInfo.titulo}
                    </h1>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium hidden sm:block mt-1">
                      {processedIndicadores.length} variables en tiempo real
                    </p>
                  </div>
              </div>
            </div>

            {/* DERECHA: Search & Sort Toolbar */}
            <div className="w-full md:w-auto flex items-center gap-3 relative">
               {/* Search Input */}
               <div className="relative group w-full md:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={14} className="text-slate-600 dark:text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  {/* CAMBIO 3: Inputs con bg-white en Light Mode para máximo contraste y border-slate-300 */}
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Filtrar variables..."
                    className={`
                      block w-full pl-9 pr-4 py-2 text-sm font-medium rounded-lg transition-all
                      bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800
                      text-slate-900 dark:text-slate-100 placeholder:text-slate-400
                      focus:outline-none focus:ring-2 ${theme.ring} focus:border-transparent
                      shadow-sm
                    `}
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-600 dark:text-slate-400 hover:text-rose-500 cursor-pointer">
                      <X size={14} />
                    </button>
                  )}
               </div>
               
               {/* MENU DE ORDENAMIENTO (DROPDOWN) */}
               <div className="relative">
                 <button 
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    className={`
                        p-2 rounded-lg border transition-all flex items-center gap-2 shadow-sm
                        ${showSortMenu 
                            ? 'bg-slate-200 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-indigo-500/50' 
                            : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-700'
                        }
                    `}
                    title="Ordenar lista"
                 >
                    <ListFilter size={18} strokeWidth={2} />
                 </button>

                 {/* Dropdown Panel */}
                 {showSortMenu && (
                   // CAMBIO 4: Dropdown con border-slate-300 y sombras definidas
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-1.5">
                            <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 mb-1">
                                Ordenar por
                            </div>
                            
                            <button 
                                onClick={() => handleSort('variacion', 'desc')}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-left transition-colors"
                            >
                                <ArrowDownNarrowWide size={14} className="text-emerald-600 dark:text-emerald-500" /> Mayor Suba (%)
                            </button>
                            
                            <button 
                                onClick={() => handleSort('variacion', 'asc')}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-left transition-colors"
                            >
                                <ArrowUpNarrowWide size={14} className="text-rose-600 dark:text-rose-500" /> Mayor Baja (%)
                            </button>
                            
                            <div className="my-1 border-t border-slate-100 dark:border-slate-800"></div>

                            <button 
                                onClick={() => handleSort('titulo', 'asc')}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-left transition-colors"
                            >
                                <ArrowDownAZ size={14} className="text-slate-600 dark:text-slate-400" /> Alfabético (A-Z)
                            </button>
                            
                             <button 
                                onClick={() => handleSort('default', 'asc')}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-left transition-colors"
                            >
                                <Database size={14} className="text-slate-600 dark:text-slate-400" /> Por Defecto
                            </button>
                        </div>
                    </div>
                 )}
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {processedIndicadores.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6 auto-rows-fr animate-in fade-in slide-in-from-bottom-4 duration-700">
            {processedIndicadores.map((item) => (
              <div key={item.id} className="h-full min-h-[280px]">
                <StatCard 
                    id={item.id}
                    titulo={item.titulo || item.title}
                    valor={item.valor ?? item.value}
                    variacion={item.variacion ?? item.variation}
                    historial={item.historial}
                    esInverso={item.esInverso}
                    Icono={item.Icono || item.icon} 
                    descripcion={item.descripcion || item.description}
                    subtexto={item.subtexto}
                    insight={item.insight}
                    tipo={item.tipo}
                    datoAnterior={item.datoAnterior}
                    cambioAbsoluto={item.cambioAbsoluto}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 animate-in fade-in">
             <div className="p-4 rounded-full bg-slate-200 dark:bg-slate-800 mb-4">
                <SearchX size={32} className="text-slate-400 dark:text-slate-500" />
             </div>
             <span className="text-slate-500 font-medium">No se encontraron resultados para "{searchTerm}"</span>
             <button 
               onClick={() => setSearchTerm('')}
               className="mt-4 text-indigo-600 dark:text-indigo-400 text-sm font-semibold hover:underline"
             >
               Limpiar filtro
             </button>
          </div>
        )}
      </div>
    </div>
  );
};