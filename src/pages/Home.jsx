import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, BarChart3, Activity, Clock } from 'lucide-react'; // Agregué Iconos
import { Grid } from '../components/Grid';
import { StatCard } from '../components/StatCard';
import { misIndicadores } from '../data/monitores';
import { sectores } from '../data/sectores';
import { herramientas } from '../data/herramientas';
import { ResumenIA } from '../components/ResumenIA';

export function Home() {
  
  // --- 1. LÓGICA DE NEGOCIO: WATCHLIST ---
  // Definimos los IDs exactos que buscan los economistas/analistas y SU ORDEN.
  // IMPORTANTE: Asegúrate de que estos IDs coincidan con los de tu archivo 'monitores.js'
  const WATCHLIST = [
    "dolar-blue",       // 1. El más buscado (Calle)
    "dolar-mep",        // 2. Referencia financiera
    "dolar-ccl",        // 3. Referencia corporativa (Si lo tienes)
    "riesgo-pais",      // 4. Clima de inversión
    "merval",           // 5. Mercado accionario
    "reservas-bcra"     // 6. Solvencia del Central
  ];

  // Filtramos y ORDENAMOS según la lista de prioridad
  const destacadosFinancieros = misIndicadores
    .filter(item => WATCHLIST.includes(item.id))
    .sort((a, b) => WATCHLIST.indexOf(a.id) - WATCHLIST.indexOf(b.id));

  // Fallback: Si por alguna razón los IDs no coinciden y la lista queda vacía,
  // mostramos los primeros 6 financieros genéricos para no romper la UI.
  const datosParaMostrar = destacadosFinancieros.length > 0 
    ? destacadosFinancieros 
    : misIndicadores.filter(i => i.categoria === "financiero").slice(0, 6);


  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#0B1121] transition-colors duration-300 pb-20">
      
      {/* --- ENCABEZADO (HERO) --- */}
      <section className="w-full relative overflow-hidden bg-slate-950 py-20 sm:py-32 border-b border-white/5 mb-12">
          {/* ... (MANTENER TODO EL CÓDIGO DEL HERO INTACTO AQUÍ) ... */}
          {/* ... Solo estoy omitiendo el código repetido para no hacer spam, pero NO LO BORRES ... */}
          
          {/* Efectos de luz... */}
          <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-96 h-96 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none"></div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                    Datos en tiempo real
                  </span>
                </div>
                <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white tracking-tighter leading-none">
                  El pulso de la <br className="hidden lg:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
                    Economía Argentina
                  </span>
                </h1>
                <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  Tablero de control macroeconómico profesional. Accedé a cotizaciones del dólar, inflación, riesgo país y reservas con precisión financiera y sin ruido.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link 
                    to="/glosario"
                    className="group flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/25 transition-all hover:-translate-y-1"
                  >
                    Explorar Datos
                    <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link 
                    to="/planes"
                    className="flex items-center justify-center gap-2 px-8 py-4 bg-transparent border border-slate-700 text-slate-300 font-bold rounded-2xl hover:bg-white/5 hover:border-slate-500 hover:text-white transition-all"
                  >
                    Ver Planes
                  </Link>
                </div>
              </div>
              
              {/* COLUMNA DERECHA (Gráfico Abstracto) - MANTENER INTACTO */}
              <div className="hidden lg:flex justify-center relative perspective-1000">
                 <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-blue-500/20 blur-3xl rounded-full transform rotate-12 scale-75"></div>
                 <div className="relative w-full max-w-md aspect-[4/3] bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right-8 duration-700">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <div className="h-2 w-24 bg-slate-700 rounded-full mb-2"></div>
                            <div className="h-2 w-16 bg-slate-800 rounded-full"></div>
                        </div>
                        <div className="p-2 bg-emerald-500/20 rounded-lg">
                            <TrendingUp className="text-emerald-400" size={24} />
                        </div>
                    </div>
                    <div className="flex items-end justify-between h-32 gap-2">
                        {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                            <div key={i} className="w-full bg-emerald-500/20 rounded-t-lg relative group overflow-hidden" style={{ height: `${h}%` }}>
                                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-emerald-500/40 to-emerald-400/80 h-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                        ))}
                    </div>
                    <div className="absolute -bottom-6 -left-6 bg-slate-800/90 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-xl flex items-center gap-3">
                        <div className="bg-blue-500/20 p-2 rounded-lg">
                            <BarChart3 className="text-blue-400" size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Reservas</p>
                            <p className="text-lg font-bold text-white tracking-tight">+US$ 24MM</p>
                        </div>
                    </div>
                </div>
              </div>
            </div>
          </div>
      </section>

      {/* --- SECCIÓN 1: MERCADO PRIORITARIO --- */}
      <div className="max-w-7xl mx-auto px-4 mt-8 mb-16">
         
         {/* HEADER DE SECCIÓN */}
         <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Activity className="text-emerald-500" size={18} />
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                  Mercado en Vivo
                </span>
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Variables Principales
              </h2>
            </div>
            
           <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-sm font-medium">
               <Clock size={16} />
               <span>Actualizado hace instantes</span>
            </div>
         </div>

         {/* NUEVA ESTRUCTURA DE GRID:
            - grid-cols-2: Para que se vean 2 por fila en móvil.
            - gap-3: Espacio reducido en móvil para que entren bien.
         */}
         <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {datosParaMostrar.map((item) => (
              <StatCard key={item.id} {...item} />
            ))}
         </div>

      </div>

      {/* --- SECCIÓN 2: RESUMEN IA --- */}
      <div className="max-w-7xl mx-auto px-4 mb-16">
        <ResumenIA />
      </div>

      {/* --- SECCIÓN 3: NAVEGACIÓN POR SECTORES --- */}
      <div className="max-w-7xl mx-auto px-4 mb-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-slate-200/60 dark:border-slate-800">
           <div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2 block">
                Análisis Fundamental
              </span>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Explorar por Sectores
              </h2>
           </div>
           <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 sm:mt-0 max-w-xs text-right hidden sm:block">
             Desglose analítico de las principales variables macroeconómicas.
           </p>
        </div>

        {/* CAMBIO CLAVE: grid-cols-2 desde móvil.
            gap-3 en móvil (para ganar espacio), gap-6 en desktop.
        */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {sectores.map((sector) => {
            const Icono = sector.Icono;
            return (
              <Link 
                key={sector.id} 
                to={`/categoria/${sector.id}`}
                className="
                    group/card relative overflow-hidden
                    bg-white dark:bg-slate-900/50
                    p-4 sm:p-6 
                    rounded-2xl 
                    /* BORDES: Más visibles en modo claro (slate-300) */
                    border border-slate-400 dark:border-slate-700/60 
                    hover:border-emerald-500/50 dark:hover:border-emerald-500/50 
                    shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 
                    transition-all duration-300 hover:-translate-y-1
                "
              >
                {/* Decoración hover */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-${sector.color}-500/5 rounded-full blur-3xl -mr-16 -mt-16 transition-opacity opacity-0 group-hover/card:opacity-100 pointer-events-none`}></div>

                {/* LAYOUT INTERNO: 
                    flex-col (vertical) en móvil -> Icono arriba, texto abajo.
                    sm:flex-row (horizontal) en desktop -> Icono izquierda, texto derecha.
                */}
                <div className="relative flex flex-col sm:flex-row items-start gap-3 sm:gap-5">
                  <div className={`
                    shrink-0 p-3 rounded-xl transition-all duration-300
                    bg-${sector.color}-50 dark:bg-slate-800 text-${sector.color}-600 dark:text-${sector.color}-400
                    group-hover/card:bg-${sector.color}-500 group-hover/card:text-white group-hover/card:scale-110 shadow-sm
                  `}>
                    <Icono size={24} strokeWidth={1.5} className="group-hover/card:stroke-2" />
                  </div>

                  <div className="flex-1 min-w-0 pt-0 sm:pt-1">
                    <h3 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-slate-100 group-hover/card:text-emerald-700 dark:group-hover/card:text-emerald-400 transition-colors tracking-tight truncate">
                      {sector.titulo}
                    </h3>
                    {/* Ocultamos subtítulo en móvil muy pequeño si molesta, o usamos line-clamp-2 */}
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                      {sector.subtitulo}
                    </p>
                  </div>
                </div>

                {/* Footer Card */}
                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-400 dark:border-slate-800 flex items-center justify-between">
                    {/* El texto "Ver dashboard" se oculta en móvil para que entre todo bien */}
                    <span className="hidden sm:block text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider group-hover/card:text-${sector.color}-600 transition-colors">
                        Ver dashboard
                    </span>
                    {/* En móvil mostramos solo "Ver" o dejamos solo la flecha alineada a la derecha */}
                    <span className="block sm:hidden text-[10px] font-bold text-emerald-600">Ver</span>

                    <div className="bg-slate-50 dark:bg-slate-800 p-1 sm:p-1.5 rounded-lg group-hover/card:bg-emerald-500 group-hover/card:text-white transition-colors duration-300">
                        <ArrowRight size={14} className="sm:w-4 sm:h-4 transform group-hover/card:translate-x-0.5 transition-transform" />
                    </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* --- SECCIÓN 4: HERRAMIENTAS --- */}
      <div className="max-w-7xl mx-auto px-4 mb-24">
        <div className="flex items-center gap-3 mb-8">
            <div className="h-8 w-1 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
            <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Centro de Herramientas
                </h2>
                <p className="text-slate-500 text-sm mt-0.5">Recursos técnicos y calculadoras financieras</p>
            </div>
        </div>

        {/* Grid 2 columnas en móvil, 4 en desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {herramientas.map((herramienta) => {
            const Icono = herramienta.Icono;
            return (
              <Link 
                key={herramienta.id} 
                to={herramienta.ruta}
                className="
                    group relative flex flex-col justify-between h-full 
                    bg-white dark:bg-slate-900 
                    p-4 sm:p-5 
                    rounded-2xl 
                    /* BORDES FUERTES */
                    border border-slate-400 dark:border-slate-700/60 
                    hover:border-blue-400/50 dark:hover:border-blue-500/50 
                    shadow-sm hover:shadow-lg hover:shadow-blue-500/10 
                    transition-all duration-300
                "
              >
                 <div>
                    <div className="flex justify-between items-start mb-3 sm:mb-4">
                        <div className={`
                            p-2 sm:p-3 rounded-xl transition-colors duration-300
                            bg-${herramienta.color}-50 dark:bg-slate-800/80 text-${herramienta.color}-600 dark:text-${herramienta.color}-400
                            group-hover:bg-slate-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-slate-900
                        `}>
                            <Icono size={20} className="sm:w-[22px] sm:h-[22px]" />
                        </div>
                        {/* Dot indicador */}
                        <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-slate-200 dark:bg-slate-700 group-hover:bg-blue-500 transition-colors"></div>
                    </div>
                    
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-tight">
                        {herramienta.titulo}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 sm:mt-2 leading-relaxed line-clamp-2">
                        {herramienta.descripcion}
                    </p>
                 </div>

                 {/* Arrow */}
                 <div className="mt-3 sm:mt-4 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-300">
                    <ArrowRight size={16} className="text-blue-500 sm:w-[18px] sm:h-[18px]" />
                 </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}