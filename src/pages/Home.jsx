import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

// 1. IMPORTACIÓN DE ICONOS (Lucide React)
// Linter Hygiene: Eliminados iconos no utilizados (Coins, PieChart)
import { 
  ArrowRight, 
  TrendingUp, 
  Activity, 
  Clock, 
  Calculator,    
  BrainCircuit,  
  FileText,      
  Download,       
  Landmark,      
  Banknote,      
  Search,        
  Zap,
  Database 
} from 'lucide-react'; 

import { StatCard } from '../components/StatCard';
import { misIndicadores } from '../data/monitores';
import { sectores } from '../data/sectores';
import { ResumenIA } from '../components/ResumenIA';
import { toolsRegistry } from '../data/toolsRegistry';

// --- MICRO-COMPONENTE: ActionCard ---
// Arquitectura: Componente puro visual para accesos directos.
const ActionCard = ({ icon: Icon, title, desc, to, accentColor = "blue" }) => {
  
  const colorMap = {
    emerald: "group-hover:border-emerald-500/50 group-hover:text-emerald-400",
    indigo: "group-hover:border-indigo-500/50 group-hover:text-indigo-400",
    blue: "group-hover:border-blue-500/50 group-hover:text-blue-400",
  };

  const activeColorClass = colorMap[accentColor] ?? colorMap.blue;

  return (
    <Link 
      to={to}
      className={`
        group relative flex flex-col p-5 rounded-xl h-full
        bg-white dark:bg-slate-900 
        border border-slate-200 dark:border-slate-800
        transition-all duration-300
        hover:shadow-lg hover:-translate-y-1 hover:shadow-black/20
        ${activeColorClass}
      `}
    >
      <div className="flex justify-between items-start mb-3">
        <div className={`
          p-2.5 rounded-lg 
          bg-slate-100 dark:bg-slate-800 
          text-slate-600 dark:text-slate-400
          transition-colors duration-300
          ${activeColorClass.replace('border-', 'bg-').replace('/50', '/10')}
        `}>
          {Icon && <Icon size={20} strokeWidth={2} />}
        </div>
        
        <ArrowRight 
          size={16} 
          className="text-slate-300 dark:text-slate-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
        />
      </div>

      <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base mb-1 tracking-tight">
        {title}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
        {desc}
      </p>
    </Link>
  );
};

export function Home() {
  
  // --- 1. LÓGICA DE NEGOCIO (Watchlist) ---
  const WATCHLIST = [
    "dolar-blue", "dolar-mep", "dolar-ccl", "riesgo-pais", "merval", "reservas-bcra"
  ];

  const destacadosFinancieros = useMemo(() => {
    return misIndicadores
      .filter(item => WATCHLIST.includes(item.id))
      .sort((a, b) => WATCHLIST.indexOf(a.id) - WATCHLIST.indexOf(b.id));
  }, []); // Memoized para evitar re-cálculos en re-renders

  // Fallback defensivo
  const datosParaMostrar = destacadosFinancieros.length > 0 
    ? destacadosFinancieros 
    : misIndicadores.filter(i => i.categoria === "financiero").slice(0, 6);


  // --- 2. DATA BINDING (Herramientas) ---
  const featuredTools = toolsRegistry.filter(t => t.featured).slice(0, 4);

  const FINANCIAL_TOOLS = featuredTools.map(tool => ({
     icon: tool.icon,
     title: tool.title,
     desc: tool.desc,
     to: tool.path,
     color: tool.color
  }));

  const MACRO_METRICS = [
    { icon: Zap, title: "Velocidad del Dinero", desc: "Rotación de la base monetaria.", to: "/macro/velocidad", color: "indigo" },
    { icon: Landmark, title: "Encajes Bancarios", desc: "Liquidez del sistema financiero.", to: "/macro/encajes", color: "indigo" },
    { icon: Database, title: "Base Monetaria", desc: "Evolución de pasivos del BCRA.", to: "/macro/base", color: "indigo" },
    { icon: TrendingUp, title: "Reservas Netas", desc: "Poder de fuego real del central.", to: "/macro/reservas", color: "indigo" },
  ];


  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#0B1121] transition-colors duration-300 pb-20">
      
      {/* --- SECTION 1: HERO (Branding) --- */}
      <section className="w-full relative overflow-hidden bg-slate-950 py-16 sm:py-24 border-b border-white/5 mb-10">
          <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-96 h-96 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none"></div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-sm mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                  Mercado en Tiempo Real
                </span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter mb-4">
                Monitor<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">Eco</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto">
                Inteligencia de mercado, cotizaciones en vivo y herramientas de simulación financiera.
            </p>
          </div>
      </section>

      {/* --- SECTION 2: MERCADO PRIORITARIO (Data) --- */}
      <div className="max-w-7xl mx-auto px-4 mt-8 mb-12">
         <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Activity className="text-emerald-500" size={18} />
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                  Pulso de Mercado
                </span>
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Indicadores Clave
              </h2>
            </div>
            
           <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-sm font-medium">
               <Clock size={16} />
               <span>Actualización automática</span>
            </div>
         </div>

         <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {datosParaMostrar.map((item) => (
              <StatCard key={item.id} {...item} />
            ))}
         </div>
      </div>

      {/* --- SECTION 3: RESUMEN IA (Insight) --- */}
      <div className="max-w-7xl mx-auto px-4 mb-16">
        <ResumenIA />
      </div>

      {/* --- SECTION 4: CENTRO DE OPERACIONES (Action) --- 
          MOVIMIENTOS TÉCNICOS:
          - Subido de posición para mayor visibilidad.
          - Colocado justo después del Resumen IA para capitalizar la intención del usuario.
      */}
      <div className="max-w-7xl mx-auto px-4 mb-20">
        
        <div className="flex items-center gap-3 mb-8">
            <div className="h-8 w-1 bg-gradient-to-b from-emerald-400 to-indigo-500 rounded-full"></div>
            <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Centro de Operaciones
                </h2>
                <p className="text-slate-500 text-sm mt-0.5">Simuladores técnicos y análisis fundamental.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* COLUMNA 1: Financiero (Herramientas) */}
          <div className="flex flex-col h-full">
             <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                    <Calculator size={18} className="text-emerald-500" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Calculadoras Destacadas</span>
                </div>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                {FINANCIAL_TOOLS.map((tool, idx) => (
                    <ActionCard key={idx} {...tool} accentColor="emerald" />
                ))}
             </div>

             <Link to="/herramientas" className="mt-4 flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-slate-700 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all text-sm font-medium group">
                <Search size={16} className="group-hover:scale-110 transition-transform"/>
                Explorar catálogo completo (40+)
             </Link>
          </div>

          {/* COLUMNA 2: Macro (Métricas) */}
          <div className="flex flex-col h-full">
             <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                    <Activity size={18} className="text-indigo-500" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tableros Macro</span>
                </div>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                {MACRO_METRICS.map((metric, idx) => (
                    <ActionCard key={idx} {...metric} accentColor="indigo" />
                ))}
             </div>

             <Link to="/macro-data" className="mt-4 flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-slate-700 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all text-sm font-medium group">
                <Database size={16} className="group-hover:scale-110 transition-transform"/>
                Ver base de datos histórica
             </Link>
          </div>

        </div>
      </div>

      {/* --- SECTION 5: SECTORES (Navigation) --- */}
      <div className="max-w-7xl mx-auto px-4 mb-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-4 border-b border-slate-200/60 dark:border-slate-800">
           <div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1 block">
                Exploración Vertical
              </span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Sectores Económicos
              </h2>
           </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {sectores.slice(0, 8).map((sector) => { 
             const Icono = sector.Icono;
             return (
                <Link 
                    key={sector.id} 
                    to={`/categoria/${sector.id}`} 
                    className="
                        bg-white dark:bg-slate-900 
                        p-4 rounded-xl 
                        border border-slate-200 dark:border-slate-800 
                        flex items-center gap-3 
                        hover:border-emerald-500/50 dark:hover:border-emerald-500/50 
                        transition-all hover:shadow-md group
                    "
                >
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                        <Icono size={18}/>
                    </div>
                    <span className="font-semibold text-sm text-slate-700 dark:text-slate-200">{sector.titulo}</span>
                </Link>
             )
          })}
        </div>
      </div>

      {/* --- SECTION 6: ANALYTICS TEASER (Upsell) --- */}
      <div className="max-w-7xl mx-auto px-4 mb-20">
        <Link 
            to="/analytics"
            className="
                group relative block w-full overflow-hidden rounded-2xl
                bg-gradient-to-r from-[#0f172a] to-[#1e293b]
                border border-slate-800 hover:border-indigo-500/50
                p-6 sm:p-8 transition-all duration-300 shadow-xl
            "
        >
            {/* Ambient Glow */}
            <div className="absolute top-0 right-0 p-32 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-500"></div>
            
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 shrink-0">
                        <BrainCircuit size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">
                            Analytics & Proyecciones
                        </h3>
                        <p className="text-slate-400 text-sm max-w-xl">
                            Accedé a modelos predictivos, correlaciones monetarias (M2 vs Inflación) y análisis de sentimiento automatizado.
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2 px-5 py-3 bg-slate-800 border border-slate-700 hover:bg-indigo-600 hover:border-indigo-500 text-white rounded-lg font-semibold text-sm transition-all shadow-lg whitespace-nowrap">
                    Abrir Dashboard IA
                    <ArrowRight size={16} />
                </div>
            </div>
        </Link>
      </div>

      {/* --- SECTION 7: FOOTER NAV --- */}
      <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/30 py-12">
         <div className="max-w-7xl mx-auto px-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Accesos Rápidos</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                <Link to="/glosario" className="group flex items-center gap-4 p-4 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 transition-colors">
                    <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition-colors">
                        <FileText size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">Glosario Económico</h4>
                        <p className="text-sm text-slate-500">Diccionario de términos técnicos.</p>
                    </div>
                </Link>

                <Link to="/exportar" className="group flex items-center gap-4 p-4 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-500 transition-colors">
                    <div className="p-3 bg-amber-500/10 text-amber-500 rounded-lg group-hover:bg-amber-500 group-hover:text-white transition-colors">
                        <Download size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">Centro de Descargas</h4>
                        <p className="text-sm text-slate-500">Series históricas en CSV/Excel.</p>
                    </div>
                </Link>

            </div>
         </div>
      </div>

    </div>
  );
}