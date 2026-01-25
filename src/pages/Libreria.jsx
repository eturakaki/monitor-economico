import { useState } from 'react';
import { Search, Filter, Library, BookOpen, Truck, ShoppingBag, Sparkles } from 'lucide-react';
import { libros } from '../data/libros'; 
import { ProductCard } from '../components/ProductCard';

export default function Libreria() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Todos');

  // Lógica de Filtrado
  const filteredBooks = libros.filter(item => {
    // [FIX] Estandarización: Usamos 'title' en lugar de 'titulo'
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.author.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'Todos' || 
                        (filterType === 'Libros Físicos' && item.type === 'libro') ||
                        (filterType === 'Digitales' && item.type === 'recurso');
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1121] transition-colors duration-300">
      
      {/* =================================================================================
          1. HERO SECTION PREMIUM (Estilo Librería)
      ================================================================================= */}
      <div className="relative bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Patrón de Fondo Sutil (Grid Financiero) - MISMO QUE ACADEMIA */}
        <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-700/25 bg-[bottom_1px_center] dark:bg-[bottom_1px_center] [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
        {/* Decoración de luz (Color Ámbar para libros) */}
        <div className="absolute top-0 right-1/4 -translate-y-1/2 w-96 h-96 bg-amber-500/10 dark:bg-amber-500/20 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                
                {/* Textos Principales */}
                <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-500/30 mb-4 backdrop-blur-sm">
                        <Library size={16} className="text-amber-700 dark:text-amber-400" />
                        <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                            Store Oficial
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
                        Librería & Recursos
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                        Selección curada de bibliografía financiera clásica y plantillas de trabajo profesionales. Envío asegurado a todo el país.
                    </p>
                </div>

                {/* Stats de Confianza (Trust Bar) - Adaptado a Libros */}
                <div className="flex gap-6 md:gap-10 p-6 bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 backdrop-blur-md shadow-sm">
                    <div className="text-center">
                        <div className="flex justify-center text-amber-600 dark:text-amber-500 mb-1"><BookOpen size={24} /></div>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">150+</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Títulos Curados</p>
                    </div>
                    <div className="w-px bg-slate-200 dark:bg-slate-700"></div>
                    <div className="text-center">
                        <div className="flex justify-center text-blue-600 dark:text-blue-500 mb-1"><Truck size={24} /></div>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">24/48hs</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Despacho Rápido</p>
                    </div>
                </div>

            </div>
        </div>
      </div>

      {/* 2. BARRA DE HERRAMIENTAS PROFESIONAL (Sticky) */}
      <div className="sticky top-16 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 py-4 px-4 sm:px-6 lg:px-8 transition-all">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 md:items-center">
             
             {/* A. BUSCADOR */}
             <div className="relative w-full md:w-80 lg:w-96 shrink-0 group">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors duration-300" size={18} />
                 <input 
                    type="text" 
                    placeholder="Buscar por título..." 
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:bg-white dark:focus:bg-slate-950 focus:border-emerald-500 focus:ring-0 text-slate-900 dark:text-white transition-all shadow-sm font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                 />
             </div>

             {/* B. FILTROS */}
             <div className="flex-1 min-w-0 w-full">
                 <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2">
                     <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 mr-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
                        <Filter size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">Formato:</span>
                     </div>
                     {['Todos', 'Libros Físicos', 'Digitales'].map((type) => (
                         <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all whitespace-nowrap border-2 shrink-0 ${
                                filterType === type 
                                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-md' 
                                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400'
                            }`}
                         >
                            {type}
                         </button>
                     ))}
                 </div>
             </div>
         </div>
      </div>
      {/* =================================================================================
          3. GRILLA DE LIBROS
      ================================================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header de Resultados */}
        <div className="flex justify-between items-end mb-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles size={20} className="text-amber-500" /> Catálogo Disponible
            </h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Mostrando {filteredBooks.length} {filteredBooks.length === 1 ? 'ítem' : 'ítems'}
            </p>
        </div>

        {/* Estado Vacío Mejorado */}
        {filteredBooks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 opacity-80 animate-in fade-in zoom-in bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full mb-6">
                    <Library size={64} className="text-slate-400 dark:text-slate-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Sin resultados</h3>
                <p className="text-slate-600 dark:text-slate-400 text-center max-w-md mb-8">
                    No encontramos libros o recursos con ese criterio.
                </p>
                <button 
                    onClick={() => {setSearchTerm(''); setFilterType('Todos');}}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-emerald-900/20"
                >
                    Ver Todo el Catálogo
                </button>
            </div>
        ) : (
            // Grilla de Tarjetas
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 xl:gap-8">
                {filteredBooks.map((libro) => (
                    <ProductCard key={libro.id} product={libro} />
                ))}
            </div>
        )}
      </div>

      {/* Banner Promocional (Solo en Librería) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
              <div className="relative z-10 text-center md:text-left">
                  <h3 className="text-2xl md:text-3xl font-black text-white mb-3">¿Buscas un título específico?</h3>
                  <p className="text-slate-300 max-w-md text-lg">Si no lo tenemos en stock, lo importamos exclusivamente para miembros PRO.</p>
              </div>
              <button className="relative z-10 bg-white text-slate-900 px-8 py-4 rounded-xl font-bold uppercase tracking-wider hover:bg-emerald-50 transition-all shadow-xl hover:scale-105 active:scale-95">
                  Solicitar Importación
              </button>
              
              {/* Pattern de fondo */}
              <ShoppingBag size={300} className="absolute -right-20 -bottom-20 text-slate-700/20 dark:text-slate-950/30 rotate-12 pointer-events-none" />
          </div>
      </div>
      
      {/* Espacio extra abajo */}
      <div className="h-12"></div>

    </div>
  );
}