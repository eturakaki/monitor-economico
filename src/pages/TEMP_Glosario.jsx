// 1. IMPORTACIONES
// Traemos las herramientas de React. 
// 'useState' es para la memoria (guardar lo que escribe el usuario, qué item está abierto).
// 'useMemo' es para optimizar cálculos (evita recalcular la lista maestra cada vez que tocas una tecla).
import { useState, useMemo } from 'react';

// Traemos los íconos de la librería 'lucide-react'.
import { 
  BookOpen, Search, Info, Calculator, ChevronDown, ChevronUp 
} from 'lucide-react';

// Traemos TU base de datos desde el otro archivo.
// Si querés cambiar un texto o una fórmula, VAS A ESE ARCHIVO, no a este.
import { sectores, calculos } from '../data/dataGlosario';

export function Glosario() {
  
  // ========================================================================
  // 2. ESTADOS (LA MEMORIA DEL COMPONENTE)
  // ========================================================================

  // Estado para el Buscador:
  // 'busqueda': guarda el texto que el usuario escribe.
  // 'setBusqueda': es la función para actualizar ese texto.
  const [busqueda, setBusqueda] = useState('');
  
  // Estado para el Acordeón (Desplegable):
  // Guarda un ID único (ej: "monetario-0") del item que está abierto actualmente.
  // Si es 'null', significa que todos están cerrados.
  const [itemAbierto, setItemAbierto] = useState(null);

  // ========================================================================
  // 3. LÓGICA / FUNCIONES
  // ========================================================================

  // Función para abrir/cerrar un item:
  // Recibe el ID del sector y el índice del item (0, 1, 2...).
  const toggleItem = (sectorId, index) => {
    const id = `${sectorId}-${index}`; // Creamos un ID único combinando ambos.
    
    // Si el ID actual es igual al que clicamos, lo ponemos en null (cerrar).
    // Si no, guardamos el nuevo ID (abrir).
    setItemAbierto(itemAbierto === id ? null : id);
  };

  // --- EL CEREBRO DEL BUSCADOR ---
  // Aquí usamos 'useMemo' para crear una "Lista Maestra" con TODOS los términos.
  // Lo que hace .flatMap es:
  // 1. Entra a cada sector.
  // 2. Saca todos los items de adentro.
  // 3. Los pone todos juntos en una sola lista larga para poder buscarlos fácil.
  // Además, le agregamos el color y nombre de su sector para usarlos en el diseño después.
  const todosLosTerminos = useMemo(() => {
    return sectores.flatMap(sector => 
      sector.items.map(item => ({
        ...item, // Copiamos toda la info del item (nombre, def, formula...)
        sectorColor: sector.color, // Le pegamos el color de su sector
        sectorNombre: sector.titulo // Le pegamos el nombre de su sector
      }))
    );
  }, []); // [] significa que esto se calcula una sola vez al cargar la página.

  // Filtro de Búsqueda:
  // Agarra la lista maestra y se fija cuáles coinciden con lo que escribió el usuario.
  // Busca tanto en el 'nombre' como en la 'definicion'.
  const resultadosBusqueda = todosLosTerminos.filter(t => 
    t.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    t.definicion.toLowerCase().includes(busqueda.toLowerCase())
  );

  // ========================================================================
  // 4. INTERFAZ VISUAL (LO QUE SE VE EN PANTALLA)
  // ========================================================================
  return (
    <div className="min-h-screen bg-gray-50/50 font-sans pb-20">
      
      {/* --- HEADER (ENCABEZADO AZUL OSCURO) --- */}
      <div className="bg-slate-900 py-16 px-4 border-b border-white/5 relative overflow-hidden">
        
        {/* Decoración de fondo (Efecto de luz azulada) */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h1 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">
            Diccionario Económico
          </h1>
          
          {/* INPUT DEL BUSCADOR */}
          <div className="relative max-w-xl mx-auto">
            {/* Ícono de lupa a la izquierda */}
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="text-slate-400" size={20} />
            </div>
            {/* Campo de texto donde escribe el usuario */}
            <input 
              type="text"
              placeholder="Buscá un concepto (ej: Brecha, Leliq, EMAE...)"
              className="w-full pl-12 pr-4 py-4 bg-white rounded-xl shadow-xl text-slate-800 font-medium focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-slate-400"
              
              // Conectamos el input con el estado 'busqueda'
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="max-w-6xl mx-auto px-4 -mt-8 relative z-20 space-y-16">

        {/* --- LÓGICA CONDICIONAL PRINCIPAL --- 
            Si 'busqueda' tiene texto, mostramos RESULTADOS.
            Si 'busqueda' está vacío, mostramos los SECTORES (Acordeón).
        */}

        {busqueda ? (
          
          /* =========================================
             ESCENARIO A: EL USUARIO ESTÁ BUSCANDO
             ========================================= */
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <Search size={24} className="text-emerald-500" />
              Resultados para "{busqueda}"
            </h2>
            
            <div className="grid gap-6">
              {/* Recorremos (map) los resultados encontrados */}
              {resultadosBusqueda.map((item, index) => (
                
                <div key={index} className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                  
                  {/* Barrita de color lateral dinámica según el sector */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-${item.sectorColor || 'slate'}-500`}></div>

                  <div className="pl-4">
                    {/* Título y etiqueta del Sector */}
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-2xl font-bold text-slate-900">{item.nombre}</h3>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest border border-slate-100 px-2 py-1 rounded-lg">
                        {item.sectorNombre}
                      </span>
                    </div>

                    {/* Definición */}
                    <div className="mb-5">
                      <p className="text-slate-600 text-lg leading-relaxed">
                        {item.definicion}
                      </p>
                    </div>

                    {/* Grid para Fórmula e Importancia */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-50">
                      
                      {/* Bloque Fórmula */}
                      <div>
                        <span className="inline-block px-2 py-1 rounded-md bg-gray-100 text-[10px] font-black text-gray-600 uppercase tracking-wide mb-2">
                          Fórmula / Cálculo
                        </span>
                        <div className="font-mono text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                          {item.formula}
                        </div>
                      </div>

                      {/* Bloque Importancia */}
                      <div>
                        <span className="inline-block px-2 py-1 rounded-md bg-blue-50 text-[10px] font-black text-blue-600 uppercase tracking-wide mb-2">
                          ¿Por qué importa?
                        </span>
                        <p className="text-sm text-slate-600 font-medium leading-relaxed">
                          {item.importancia}
                        </p>
                      </div>

                    </div>
                  </div>
                </div>
              ))}

              {/* Mensaje si no encuentra nada */}
              {resultadosBusqueda.length === 0 && (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search size={24} className="text-gray-300" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700">No encontramos nada con ese nombre.</h3>
                  <p className="text-slate-400">Probá buscando por sector o usando palabras clave más simples.</p>
                </div>
              )}
            </div>
          </div>

        ) : (
          
          /* =========================================
             ESCENARIO B: PANTALLA DE INICIO (SECTORES)
             ========================================= */
          <div className="animate-in fade-in duration-500">
             <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
               <BookOpen size={24} className="text-slate-400" />
               Explorar por Sector
             </h2>
             
             {/* Grilla de tarjetas (Responsive: 1 col móvil, 2 en PC) */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
               
               {/* Mapeamos los sectores desde dataGlosario.js */}
               {sectores.map((sector) => (
                 <div key={sector.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
                   
                   {/* Cabecera de la Tarjeta (Icono y Título) */}
                   <div className={`px-6 py-4 flex items-center gap-3 border-b border-gray-50 ${sector.bgHeader}`}>
                     <div className={`p-2 bg-white rounded-lg shadow-sm ${sector.textHeader}`}>
                       <sector.Icono size={20} />
                     </div>
                     <h3 className={`font-bold text-lg ${sector.textHeader}`}>{sector.titulo}</h3>
                   </div>
                   
                   {/* Lista de Items (El Acordeón) */}
                   <div className="p-2">
                     <ul className="flex flex-col gap-1">
                       {sector.items.map((item, index) => {
                         
                         // Chequeamos si este item específico está abierto
                         const isOpen = itemAbierto === `${sector.id}-${index}`;
                         
                         return (
                           <li key={index} className="rounded-xl overflow-hidden transition-all duration-300">
                             
                             {/* BOTÓN DEL ITEM (Lo que se ve siempre) */}
                             <button 
                               onClick={() => toggleItem(sector.id, index)}
                               className={`w-full flex items-center justify-between p-3 text-sm font-bold transition-colors
                                 ${isOpen ? 'bg-slate-50 text-slate-900' : 'text-slate-600 hover:bg-gray-50 hover:text-slate-900'}
                               `}
                             >
                               <span>{item.nombre}</span>
                               {/* Cambiamos la flechita si está abierto o cerrado */}
                               {isOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-gray" />}
                             </button>

                             {/* CONTENIDO OCULTO (Solo se muestra si isOpen es true) */}
                             {isOpen && (
                               <div className="px-4 pb-5 pt-2 bg-white animate-in slide-in-from-top-2 duration-200">
                                 
                                 {/* Definición */}
                                 <div className="mb-4">
                                   <span className="inline-block px-2 py-0.5 rounded-full border border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-2">Definición</span>
                                   <p className="text-sm text-slate-600 leading-relaxed">{item.definicion}</p>
                                 </div>
                                 
                                 {/* Fórmula */}
                                 <div className="mb-4">
                                   <span className="inline-block px-2 py-0.5 rounded-full bg-gray-100 text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-2">Fórmula</span>
                                   <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 font-mono text-xs text-slate-700">{item.formula}</div>
                                 </div>
                                 
                                 {/* Importancia */}
                                 <div>
                                   <span className="inline-block px-2 py-0.5 rounded-full bg-blue-100 text-[10px] font-bold text-blue-700 uppercase tracking-wide mb-2">Importancia</span>
                                   <p className="text-sm text-blue-600/80 font-medium leading-relaxed">{item.importancia}</p>
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

        {/* --- SECCIÓN 3: FÓRMULAS AL PIE (SIEMPRE VISIBLES) --- */}
        <div>
          <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
            <Calculator size={24} className="text-blue-500" />
            Fórmulas de Cálculo Avanzadas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {calculos.map((calc, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:border-blue-300 transition-colors group">
                <h3 className="font-bold text-slate-800 mb-4">{calc.titulo}</h3>
                
                {/* Caja de código para la fórmula */}
                <div className="bg-slate-800 rounded-xl p-4 mb-4 font-mono text-xs text-emerald-400 overflow-x-auto border border-slate-700 shadow-inner">
                  {calc.formula}
                </div>
                
                {/* Ejemplo práctico */}
                <div className="flex gap-3 items-start text-xs text-slate-500 bg-gray-50 p-3 rounded-lg">
                  <span className="font-bold text-slate-700 uppercase tracking-wider shrink-0 mt-0.5 text-[10px]">Ejemplo:</span>
                  <p>{calc.ejemplo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- SECCIÓN 4: NOTAS METODOLÓGICAS (Final de página) --- */}
        <div className="mt-16 bg-white rounded-3xl p-8 md:p-10 border border-gray-200 shadow-sm relative overflow-hidden">
          
          {/* Decoración de fondo */}
          <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
             <BookOpen size={150} />
          </div>

          <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3 relative z-10">
            <div className="p-2.5 bg-slate-100 text-slate-600 rounded-xl">
               <Info size={22} />
            </div>
            Notas Metodológicas
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 relative z-10">
            
            {/* 1. Fuente de Datos */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wide border-l-4 border-emerald-500 pl-3">
                Fuente de Datos
              </h4>
              <p className="text-sm text-slate-500 leading-relaxed pl-4">
                Todos los datos provienen de la API oficial del Banco Central de la República Argentina (BCRA) y se actualizan automáticamente según la frecuencia de publicación de cada variable.
              </p>
            </div>

            {/* 2. Periodicidad */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wide border-l-4 border-blue-500 pl-3">
                Periodicidad
              </h4>
              <p className="text-sm text-slate-500 leading-relaxed pl-4">
                Las variables tienen diferentes frecuencias: diarias (tipo de cambio), semanales (LELIQ), mensuales (agregados monetarios) y trimestrales (algunas variables fiscales).
              </p>
            </div>

            {/* 3. Valores Reales vs Nominales */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wide border-l-4 border-purple-500 pl-3">
                Valores Reales vs Nominales
              </h4>
              <p className="text-sm text-slate-500 leading-relaxed pl-4">
                Los valores monetarios están expresados en pesos corrientes. Para análisis temporales se recomienda deflactar por IPC para obtener valores reales.
              </p>
            </div>

            {/* 4. Estacionalidad */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wide border-l-4 border-orange-500 pl-3">
                Estacionalidad
              </h4>
              <p className="text-sm text-slate-500 leading-relaxed pl-4">
                Algunas variables presentan patrones estacionales (ej: recaudación en diciembre). Se recomienda comparar con el mismo período del año anterior.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}