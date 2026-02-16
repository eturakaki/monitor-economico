import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  LayoutGrid, 
  Search, 
  X, 
  Filter,
  Activity,
  Layers 
} from 'lucide-react';

// 1. COMPONENTES
import { StatCard } from '../components/StatCard'; 

// 2. DATOS (SSOT: Single Source of Truth)
import { misIndicadores } from '../data/monitores';
import { sectores } from '../data/sectores'; 

/**
 * Página: Mercados (Market Explorer) v2.1 (Stable)
 * Fix: Corrección de nombres de propiedades (nombre -> titulo)
 */
export function Mercados() {
  
  // --- STATE ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // --- LOGIC: ENGINE DE FILTRADO (CORREGIDO) ---
  const { marketGroups, activeSectors } = useMemo(() => {
    // 0. Safety Check
    const sourceData = misIndicadores || [];
    const normalizedSearch = searchTerm.toLowerCase().trim();

    // 1. Filtrado de Datos
    const filteredItems = sourceData.filter(item => {
      // Safety Check: Si el item es nulo, lo saltamos
      if (!item) return false;

      // A. Coincidencia de Categoría
      const matchesCategory = selectedCategory === 'all' || item.categoria === selectedCategory;
      
      // B. Coincidencia de Texto (FIX: Usamos 'titulo' en lugar de 'nombre')
      // Usamos Nullish Coalescing (?? "") para evitar crashes si falta algún campo
      const safeTitle = item.titulo?.toLowerCase() ?? "";
      const safeDesc = item.descripcion?.toLowerCase() ?? "";
      
      const matchesText = 
        safeTitle.includes(normalizedSearch) || 
        safeDesc.includes(normalizedSearch);

      return matchesCategory && matchesText;
    });

    // 2. Agrupamiento
    const grupos = {};
    filteredItems.forEach(item => {
      const catKey = item.categoria || 'otros';
      if (!grupos[catKey]) grupos[catKey] = [];
      grupos[catKey].push(item);
    });

    // 3. Sectores Disponibles (Configuración Estática)
    const availableSectors = sectores; 

    return { marketGroups: grupos, activeSectors: availableSectors };
  }, [searchTerm, selectedCategory]);

  // Helper para obtener metadatos de un sector
  const getSectorMeta = (catId) => {
    const sector = sectores.find(s => s.id === catId);
    return {
      titulo: sector?.titulo || catId.charAt(0).toUpperCase() + catId.slice(1),
      Icono: sector?.Icono || Layers,
      color: sector?.color || 'indigo'
    };
  };

  // --- HANDLER: Limpiar búsqueda ---
  const handleClear = () => {
    setSearchTerm('');
    setSelectedCategory('all');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1121] pb-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* NAVEGACIÓN */}
        <Link to="/" className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-medium mb-6 hover:underline group">
          <ArrowLeft size={20} className="mr-2 transition-transform group-hover:-translate-x-1" />
          Volver al Dashboard
        </Link>

        {/* HEADER */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/20">
                  <LayoutGrid size={28} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                  Explorador de Mercados
                </h1>
              </div>
              <p className="text-gray-500 dark:text-slate-400 text-lg max-w-xl">
                Cotizaciones en tiempo real organizadas por sector.
              </p>
            </div>

            {/* SEARCH BAR */}
            <div className="w-full lg:w-96 relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Buscar activo (ej: Blue, Merval...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-10 py-3 border border-gray-200 dark:border-slate-700 rounded-xl leading-5 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all shadow-sm"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* CHIPS DE FILTRO */}
          <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar mask-gradient">
            <Filter className="w-4 h-4 text-gray-400 shrink-0 mr-1" />
            
            <CategoryChip 
              label="Todos" 
              isActive={selectedCategory === 'all'} 
              onClick={() => setSelectedCategory('all')} 
            />
            
            {activeSectors.map((sector) => {
              const Icon = sector.Icono || Layers;
              return (
                <CategoryChip 
                  key={sector.id}
                  label={sector.titulo} 
                  icon={Icon}
                  isActive={selectedCategory === sector.id} 
                  onClick={() => setSelectedCategory(sector.id)} 
                />
              )
            })}
          </div>
        </div>

        {/* CONTENIDO */}
        <div className="space-y-12 min-h-[400px]">
          {Object.keys(marketGroups).length > 0 ? (
            Object.entries(marketGroups).map(([catId, items]) => {
              const meta = getSectorMeta(catId);
              const SectorIcon = meta.Icono;

              return (
                <section key={catId} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
  
  {/* === UPGRADE UX: HEADER ADHESIVO (STICKY) === 
      Esto mantiene el título visible mientras scrolleas los items de esa categoría.
      Agregamos: sticky, top-0, z-10, backdrop-blur y background.
  */}
  <div className="sticky top-0 z-10 py-4 mb-6 border-b border-gray-200 dark:border-slate-800 bg-slate-50/95 dark:bg-[#0B1121]/95 backdrop-blur-sm flex items-center justify-between">
    
    <div className="flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-white uppercase tracking-wider">
      <SectorIcon size={20} className="text-indigo-500" />
      {meta.titulo}
    </div>
    
    <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
      {items.length} activos
    </span>

  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                    {items.map((item) => (
                      // CAMBIO APLICADO: h-full permite que la tarjeta crezca según su contenido (Insights)
                      <div key={item.id} className="h-full min-h-[190px]">
                           <StatCard {...item} />
                      </div>
                    ))}
                  </div>
</section>
              );
            })
          ) : (
            // EMPTY STATE
            <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-4">
                <Activity className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">Sin resultados</h3>
              <p className="text-slate-500 dark:text-slate-500 max-w-md mx-auto mb-6">
                No hay activos para "{searchTerm}" en esta categoría.
              </p>
              <button onClick={handleClear} className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Subcomponente Chip
const CategoryChip = ({ label, icon: Icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
      border
      ${isActive 
        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20' 
        : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:border-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-400'
      }
    `}
  >
    {Icon && <Icon size={14} className={isActive ? "text-indigo-200" : "opacity-70"} />}
    {label}
  </button>
);