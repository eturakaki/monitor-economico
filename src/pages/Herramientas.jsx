import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calculator, 
  Search, 
  X, 
  Filter 
} from 'lucide-react';
import { Grid } from '../components/Grid';
// IMPORTAMOS LA DATA CENTRALIZADA
import { toolsRegistry, categoryLabels } from '../data/toolsRegistry';

/**
 * Página: Centro de Herramientas (Hub)
 * Arquitectura: Implementa patrón "Search & Discovery" con filtrado en memoria.
 */
export function Calculadoras() {
  
  // --- STATE ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all'); // 'all' o 'inflacion', 'inversiones', etc.

  // --- LOGIC: ENGINE DE FILTRADO (Memoized) ---
  // Rationale: Ejecutamos esta lógica solo cuando cambian los inputs de búsqueda o categoría.
  const toolsGrouped = useMemo(() => {
    // 1. Normalizamos el término de búsqueda (Zero Trust: trim y lowercase)
    const normalizedSearch = searchTerm.toLowerCase().trim();

    // 2. Filtramos el array plano primero
    const filteredTools = toolsRegistry.filter(tool => {
      // Filtro por Categoría
      const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
      
      // Filtro por Texto (Título o Descripción)
      const matchesText = 
        tool.title.toLowerCase().includes(normalizedSearch) || 
        tool.desc.toLowerCase().includes(normalizedSearch);

      return matchesCategory && matchesText;
    });

    // 3. Re-agrupamos el resultado filtrado
    const grupos = {};
    filteredTools.forEach(tool => {
      if (!grupos[tool.category]) grupos[tool.category] = [];
      grupos[tool.category].push(tool);
    });

    return grupos;
  }, [searchTerm, selectedCategory]);

  // --- HANDLERS ---
  const clearSearch = () => {
    setSearchTerm('');
    setSelectedCategory('all');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1121] pb-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* NAVEGACIÓN */}
        <Link to="/" className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-medium mb-6 hover:underline group">
          <ArrowLeft size={20} className="mr-2 transition-transform group-hover:-translate-x-1" />
          Volver al Inicio
        </Link>

        {/* HEADER & CONTROLES */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            
            {/* Títulos */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/20">
                  <Calculator size={28} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                  Centro de Herramientas
                </h1>
              </div>
              <p className="text-gray-500 dark:text-slate-400 text-lg max-w-xl">
                Acceso directo a más de 40 simuladores financieros profesionales.
              </p>
            </div>

            {/* SEARCH BAR (Componente Visual) */}
            <div className="w-full lg:w-96 relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Buscar herramienta (ej: bonos, uva...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-10 py-3 border border-gray-200 dark:border-slate-700 rounded-xl leading-5 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-all shadow-sm"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* CHIPS DE FILTRO DE CATEGORÍA (Horizontal Scroll) */}
          <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar mask-gradient">
            <Filter className="w-4 h-4 text-gray-400 shrink-0 mr-1" />
            
            <CategoryChip 
              label="Todas" 
              isActive={selectedCategory === 'all'} 
              onClick={() => setSelectedCategory('all')} 
            />
            
            {Object.keys(categoryLabels).map((key) => (
              <CategoryChip 
                key={key}
                label={categoryLabels[key]} 
                isActive={selectedCategory === key} 
                onClick={() => setSelectedCategory(key)} 
              />
            ))}
          </div>
        </div>

        {/* CONTENIDO: GRILLA SECCIONADA */}
        <div className="space-y-12 min-h-[400px]">
          {Object.keys(toolsGrouped).length > 0 ? (
            Object.entries(toolsGrouped).map(([catKey, tools]) => (
              <section key={catKey} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Título de Categoría */}
                <div className="flex items-center gap-4 mb-6 border-b border-gray-200 dark:border-slate-800 pb-2">
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    {categoryLabels[catKey] || catKey}
                  </h2>
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                    {tools.length}
                  </span>
                </div>

                {/* Cards Grid */}
                <Grid>
                  {tools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </Grid>
              </section>
            ))
          ) : (
            // ESTADO VACÍO (Search Feedback)
            <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-4">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">
                No encontramos herramientas
              </h3>
              <p className="text-slate-500 dark:text-slate-500 max-w-md mx-auto mb-6">
                No hay resultados para "{searchTerm}" en la categoría seleccionada.
              </p>
              <button 
                onClick={clearSearch}
                className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
              >
                Limpiar filtros y ver todo
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// --- SUBCOMPONENTES (Para limpieza y reutilización interna) ---

const CategoryChip = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`
      whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
      border-2
      ${isActive 
        ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-500/20' 
        : 'bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:border-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-400'
      }
    `}
  >
    {label}
  </button>
);

const ToolCard = ({ tool }) => (
  <Link
    to={tool.path}
    className={`
      group relative flex flex-col justify-between
      bg-white dark:bg-slate-900 
      rounded-2xl p-6 
      /* Bordes más definidos para mayor contraste */
      border-2 border-gray-300 dark:border-slate-700 
      shadow-sm hover:shadow-xl dark:hover:shadow-emerald-900/20
      /* Cambio de color de borde en hover */
      transition-all duration-300 ease-out hover:scale-[1.02] 
      hover:border-emerald-500/50 dark:hover:border-emerald-400/50
    `}
  >
    {/* Hover Glow Effect */}
    <div className={`absolute inset-0 bg-gradient-to-br from-${tool.color}-50/50 to-transparent dark:from-${tool.color}-900/10 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none`} />

    <div>
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`
          p-3 rounded-xl 
          bg-${tool.color}-100 dark:bg-${tool.color}-900/30 
          text-${tool.color}-600 dark:text-${tool.color}-400
          /* Borde interno para el icono para resaltarlo */
          border border-${tool.color}-200 dark:border-${tool.color}-500/30
        `}>
          <tool.icon size={24} strokeWidth={2} />
        </div>
        {tool.badge && (
          <span className="px-2 py-1 text-xs font-bold uppercase tracking-wider text-gray-500 bg-gray-100 dark:bg-slate-800 dark:text-gray-300 rounded-md border-2 border-gray-200 dark:border-slate-600">
            {tool.badge}
          </span>
        )}
      </div>

      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 relative z-10 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
        {tool.title}
      </h3>
      <p className="text-gray-600 dark:text-slate-300 text-sm leading-relaxed relative z-10">
        {tool.desc}
      </p>
    </div>

    <div className="mt-6 flex items-center text-sm font-semibold text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 relative z-10">
      Abrir <ArrowLeft className="ml-2 rotate-180" size={16} />
    </div>
  </Link>
);