import { useState } from 'react';
import { Search, Filter, BookOpen, GraduationCap, Users, Award, Sparkles } from 'lucide-react';
import { cursos } from '../data/cursos'; 
import { ProductCard } from '../components/ProductCard';

export default function Academia() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('Todos');

  // Lógica de Filtrado
  const filteredCourses = cursos.filter(curso => {
    // [FIX] Estandarización: Usamos 'title' en lugar de 'titulo'
    const matchesSearch = curso.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'Todos' || curso.nivel === filterLevel;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1121] transition-colors duration-300">
      
      {/* =================================================================================
          1. HERO SECTION PREMIUM (Con Patrón de Fondo Financiero)
      ================================================================================= */}
      <div className="relative bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Patrón de Fondo Sutil (Grid Financiero) */}
        <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-700/25 bg-[bottom_1px_center] dark:bg-[bottom_1px_center] [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
        {/* Decoración de luz */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/20 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                
                {/* Textos Principales */}
                <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-500/30 mb-4 backdrop-blur-sm">
                        <GraduationCap size={16} className="text-emerald-700 dark:text-emerald-400" />
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                            Formación Ejecutiva
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
                        Academia Monitor<span className="text-emerald-600 dark:text-emerald-500">Eco</span>
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                        Domina los mercados con cursos diseñados por analistas institucionales. Sin teoría de relleno, directo a la estrategia y la práctica.
                    </p>
                </div>

                {/* Stats de Confianza (Trust Bar) */}
                <div className="flex gap-6 md:gap-10 p-6 bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 backdrop-blur-md shadow-sm">
                    <div className="text-center">
                        <div className="flex justify-center text-emerald-600 dark:text-emerald-500 mb-1"><Users size={24} /></div>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">5.2k+</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Alumnos Activos</p>
                    </div>
                    <div className="w-px bg-slate-200 dark:bg-slate-700"></div>
                    <div className="text-center">
                        <div className="flex justify-center text-blue-600 dark:text-blue-500 mb-1"><Award size={24} /></div>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">4.9/5</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Valoración Media</p>
                    </div>
                </div>

            </div>
        </div>
      </div>

      {/* 2. BARRA DE HERRAMIENTAS PROFESIONAL (Sticky) */}
      <div className="sticky top-16 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 py-4 px-4 sm:px-6 lg:px-8 transition-all">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 md:items-center">
             
             {/* A. BUSCADOR (Fijo, no se encoge) */}
             <div className="relative w-full md:w-80 lg:w-96 shrink-0 group">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors duration-300" size={18} />
                 <input 
                    type="text" 
                    placeholder="Buscar cursos..." 
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:bg-white dark:focus:bg-slate-950 focus:border-emerald-500 focus:ring-0 text-slate-900 dark:text-white transition-all shadow-sm font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                 />
             </div>

             {/* B. FILTROS (Flexible, ocupa el resto y scrollea) */}
             {/* min-w-0 es la CLAVE para evitar que flexbox rompa el scroll */}
             <div className="flex-1 min-w-0 w-full">
                <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2">
                    
                    {/* Etiqueta Fija */}
                    <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 mr-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
                        <Filter size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">Nivel:</span>
                    </div>

                    {/* Botones de Filtro */}
                    {['Todos', 'Principiante', 'Intermedio', 'Avanzado'].map((level) => (
                        <button
                            key={level}
                            onClick={() => setFilterLevel(level)}
                            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all whitespace-nowrap border-2 shrink-0 ${
                                filterLevel === level 
                                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-md' 
                                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400'
                            }`}
                        >
                            {level}
                        </button>
                    ))}
                </div>
             </div>

         </div>
      </div>

      {/* =================================================================================
          3. GRILLA DE CURSOS
      ================================================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header de Resultados */}
        <div className="flex justify-between items-end mb-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles size={20} className="text-emerald-500" /> Explorar Catálogo
            </h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Mostrando {filteredCourses.length} {filteredCourses.length === 1 ? 'curso' : 'cursos'}
            </p>
        </div>

        {/* Estado Vacío Mejorado */}
        {filteredCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 opacity-80 animate-in fade-in zoom-in bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full mb-6">
                    <BookOpen size={64} className="text-slate-400 dark:text-slate-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No encontramos coincidencias</h3>
                <p className="text-slate-600 dark:text-slate-400 text-center max-w-md mb-8">
                    Intenta ajustar los términos de búsqueda o los filtros de nivel.
                </p>
                <button 
                    onClick={() => {setSearchTerm(''); setFilterLevel('Todos');}}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-emerald-900/20"
                >
                    Restablecer Filtros
                </button>
            </div>
        ) : (
            // Grilla de Tarjetas
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 xl:gap-8">
                {filteredCourses.map((curso) => (
                    <ProductCard key={curso.id} product={curso} />
                ))}
            </div>
        )}
      </div>
      
      {/* Espacio extra abajo */}
      <div className="h-12"></div>

    </div>
  );
}