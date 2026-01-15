// 1. IMPORTACIONES
import { useState, useMemo } from 'react';
import { 
  BookOpen, Search, Info, Calculator, ChevronDown, ChevronUp 
} from 'lucide-react';

// Traemos los datos desde el archivo externo
import { sectores, calculos } from '../data/dataGlosario';

export function Glosario() {
  
  // ========================================================================
  // 2. ESTADOS
  // ========================================================================
  const [busqueda, setBusqueda] = useState('');
  const [itemAbierto, setItemAbierto] = useState(null);

  // ========================================================================
  // 3. LÓGICA
  // ========================================================================

  const toggleItem = (id) => {
    setItemAbierto(itemAbierto === id ? null : id);
  };

  const todosLosTerminos = useMemo(() => {
    return sectores.flatMap(sector => 
      sector.items.map(item => ({
        ...item,
        sectorColor: sector.color,
        sectorNombre: sector.titulo
      }))
    );
  }, []);

  const resultadosBusqueda = todosLosTerminos.filter(t => 
    t.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    t.definicion.toLowerCase().includes(busqueda.toLowerCase())
  );

  // ========================================================================
  // 4. INTERFAZ VISUAL
  // ========================================================================
  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#0B1121] transition-colors duration-300 font-sans pb-20">
      
      {/* --- HEADER TIPO PORTADA (Dark Mode Force) --- */}
      <div className="bg-slate-900 py-20 px-4 border-b border-white/5 relative overflow-hidden">
        {/* Decoración Atmosférica */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
            Diccionario Económico
          </h1>
          <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
            Todas las definiciones, fórmulas y conceptos clave del monitor, explicados de forma simple.
          </p>
          
          {/* BARRA DE BÚSQUEDA FLOTANTE */}
          <div className="relative max-w-xl mx-auto">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="text-slate-400" size={20} />
            </div>
            <input 
              type="text"
              placeholder="Buscá un concepto (ej: Brecha, Leliq, EMAE...)"
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800/80 backdrop-blur-md rounded-xl shadow-2xl dark:shadow-emerald-900/20 text-slate-800 dark:text-white font-medium border border-transparent focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-slate-400"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-8 relative z-20 space-y-16">

        {/* --- LÓGICA PRINCIPAL --- */}
        
        {busqueda ? (
          /* =========================================
             ESCENARIO A: RESULTADOS DE BÚSQUEDA
             ========================================= */
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Search size={24} className="text-emerald-500" />
              Resultados para "{busqueda}"
            </h2>
            
            <div className="grid gap-4">
              {resultadosBusqueda.map((item, index) => {
                const searchId = `search-${index}`;
                const isOpen = itemAbierto === searchId;

                return (
                  <div key={index} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden hover:border-emerald-500/30 transition-all">
                    
                    {/* CABECERA */}
                    <button 
                      onClick={() => toggleItem(searchId)}
                      className="w-full flex items-center justify-between p-5 text-left group"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`h-8 w-1.5 rounded-full bg-${item.sectorColor}-500 shadow-[0_0_10px_rgba(0,0,0,0.2)] shadow-${item.sectorColor}-500/50`}></div>
                        
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white text-lg group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                            {item.nombre}
                          </h3>
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                            {item.sectorNombre}
                          </span>
                        </div>
                      </div>

                      <div className={`p-2 rounded-full transition-all ${isOpen ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300' : 'text-slate-300 dark:text-slate-600 group-hover:text-blue-500'}`}>
                         {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </button>

                    {/* CONTENIDO */}
                    {isOpen && (
                      <div className="px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 animate-in slide-in-from-top-2 duration-200">
                        
                        <div className="mb-5 mt-2">
                           <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
                             {item.definicion}
                           </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Fórmula Card */}
                          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                             <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wide mb-2">
                               Fórmula / Cálculo
                             </span>
                             <div className="font-mono text-sm text-slate-700 dark:text-emerald-400">
                               {item.formula}
                             </div>
                          </div>

                          {/* Importancia Card */}
                          <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
                             <span className="block text-[10px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-wide mb-2">
                               Importancia Económica
                             </span>
                             <p className="text-sm text-blue-900/80 dark:text-blue-200 font-medium leading-relaxed">
                               {item.importancia}
                             </p>
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                );
              })}

              {resultadosBusqueda.length === 0 && (
                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search size={24} className="text-slate-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">No encontramos nada.</h3>
                  <p className="text-slate-400">Probá buscando por sector o usando palabras más simples.</p>
                </div>
              )}
            </div>
          </div>

        ) : (
          
          /* =========================================
             ESCENARIO B: PANTALLA DE SECTORES (ACORDEÓN)
             ========================================= */
          <div className="animate-in fade-in duration-500">
             <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
               <BookOpen size={24} className="text-slate-400" />
               Explorar por Sector
             </h2>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
               {sectores.map((sector) => (
                 <div key={sector.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                   
                   {/* Cabecera Sector */}
                   <div className={`px-6 py-4 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30`}>
                     <div className={`p-2 rounded-lg shadow-sm ${sector.bgHeader || 'bg-white dark:bg-slate-800'} ${sector.textHeader}`}>
                       <sector.Icono size={20} />
                     </div>
                     <h3 className={`font-bold text-lg text-slate-900 dark:text-white`}>{sector.titulo}</h3>
                   </div>
                   
                   {/* Lista Acordeón */}
                   <div className="p-2">
                     <ul className="flex flex-col gap-1">
                       {sector.items.map((item, index) => {
                         const itemId = `${sector.id}-${index}`;
                         const isOpen = itemAbierto === itemId;
                         
                         return (
                           <li key={index} className="rounded-xl overflow-hidden transition-all duration-300">
                             <button 
                               onClick={() => toggleItem(itemId)}
                               className={`w-full flex items-center justify-between p-3 text-sm font-bold transition-colors rounded-lg
                                 ${isOpen 
                                   ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' 
                                   : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'}
                               `}
                             >
                               <span>{item.nombre}</span>
                               {isOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                             </button>

                             {isOpen && (
                               <div className="px-4 pb-5 pt-2 bg-white dark:bg-slate-900 animate-in slide-in-from-top-2 duration-200">
                                 {/* Definición */}
                                 <div className="mb-4">
                                   <span className="inline-block px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 bg-slate-50 dark:bg-slate-800">
                                     Definición
                                   </span>
                                   <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{item.definicion}</p>
                                 </div>
                                 
                                 {/* Fórmula */}
                                 <div className="mb-4">
                                   <span className="inline-block px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 bg-slate-50 dark:bg-slate-800">
                                     Fórmula
                                   </span>
                                   <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-700 dark:text-emerald-400">
                                     {item.formula}
                                   </div>
                                 </div>

                                 {/* Importancia */}
                                 <div>
                                   <span className="inline-block px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-2">
                                     Importancia
                                   </span>
                                   <p className="text-sm text-blue-700/80 dark:text-blue-300 font-medium leading-relaxed">{item.importancia}</p>
                                 </div>
                               </div>
                             )}
                           </li>
                         );
                       })}
                     </ul>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        )}

        {/* --- SECCIÓN 3: FÓRMULAS AL PIE --- */}
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Calculator size={24} className="text-blue-500" />
            Fórmulas de Cálculo Avanzadas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {calculos.map((calc, index) => (
              <div key={index} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-400 dark:hover:border-blue-500/50 transition-colors group">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4">{calc.titulo}</h3>
                <div className="bg-slate-800 dark:bg-slate-950 rounded-xl p-4 mb-4 font-mono text-xs text-emerald-400 overflow-x-auto border border-slate-700 dark:border-slate-800 shadow-inner">
                  {calc.formula}
                </div>
                <div className="flex gap-3 items-start text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider shrink-0 mt-0.5 text-[10px]">Ejemplo:</span>
                  <p>{calc.ejemplo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- SECCIÓN 4: NOTAS METODOLÓGICAS --- */}
        <div className="mt-16 bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-10 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          
          <div className="absolute top-0 right-0 p-12 opacity-[0.02] dark:opacity-[0.05] pointer-events-none">
             <BookOpen size={150} className="dark:text-white" />
          </div>

          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3 relative z-10">
            <div className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl">
               <Info size={22} />
            </div>
            Notas Metodológicas
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 relative z-10">
            
            {/* 1. Fuente de Datos */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wide border-l-4 border-emerald-500 pl-3">
                Fuente de Datos
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed pl-4">
                Todos los datos provienen de la API oficial del Banco Central de la República Argentina (BCRA) y se actualizan automáticamente según la frecuencia de publicación de cada variable.
              </p>
            </div>

            {/* 2. Periodicidad */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wide border-l-4 border-blue-500 pl-3">
                Periodicidad
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed pl-4">
                Las variables tienen diferentes frecuencias: diarias (tipo de cambio), semanales (LELIQ), mensuales (agregados monetarios) y trimestrales (algunas variables fiscales).
              </p>
            </div>

            {/* 3. Valores Reales vs Nominales */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wide border-l-4 border-purple-500 pl-3">
                Valores Reales vs Nominales
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed pl-4">
                Los valores monetarios están expresados en pesos corrientes. Para análisis temporales se recomienda deflactar por IPC para obtener valores reales.
              </p>
            </div>

            {/* 4. Estacionalidad */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wide border-l-4 border-orange-500 pl-3">
                Estacionalidad
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed pl-4">
                Algunas variables presentan patrones estacionales (ej: recaudación en diciembre). Se recomienda comparar con el mismo período del año anterior.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}