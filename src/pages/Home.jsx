import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

// 1. IMPORTACIÓN DE ICONOS (Lucide React)
import { 
  ArrowRight, 
  TrendingUp, 
  Activity, 
  Clock, 
  Calculator,    
  BrainCircuit,  
  FileText,      
  Download,       
  PieChart,      
  Landmark,      
  Banknote,      
  Coins,         
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
// Arquitectura: Componente puro visual.
// Diseño: Fondo oscuro (slate-900) sobre base profunda (#0B1121).
const ActionCard = ({ icon: Icon, title, desc, to, accentColor = "blue" }) => {
  
  // Mapa de colores para bordes y textos al hacer hover
  const colorMap = {
    emerald: "group-hover:border-emerald-500/50 group-hover:text-emerald-400",
    indigo: "group-hover:border-indigo-500/50 group-hover:text-indigo-400",
    blue: "group-hover:border-blue-500/50 group-hover:text-blue-400",
  };

  // Fallback defensivo por si pasamos un color que no existe
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
        ${activeColorClass} /* Clase dinámica del borde */
      `}
    >
      <div className="flex justify-between items-start mb-3">
        {/* Icono Container con fondo suave */}
        <div className={`
          p-2.5 rounded-lg 
          bg-slate-100 dark:bg-slate-800 
          text-slate-600 dark:text-slate-400
          transition-colors duration-300
          ${activeColorClass.replace('border-', 'bg-').replace('/50', '/10')}
        `}>
          {/* Renderizado condicional defensivo del icono */}
          {Icon && <Icon size={20} strokeWidth={2} />}
        </div>
        
        {/* Flecha que aparece al hover */}
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

  const destacadosFinancieros = misIndicadores
      .filter(item => WATCHLIST.includes(item.id))
      .sort((a, b) => WATCHLIST.indexOf(a.id) - WATCHLIST.indexOf(b.id));

  const datosParaMostrar = destacadosFinancieros.length > 0 
    ? destacadosFinancieros 
    : misIndicadores.filter(i => i.categoria === "financiero").slice(0, 6);


  // ===========================================================================
  // --- 2. CONFIGURACIÓN DE "TOP HITS" (DATA BINDING) ---
  // Conectamos el 'toolsRegistry' centralizado con la vista del Dashboard.
  // ===========================================================================

  // A. Filtrado Inteligente
  // Seleccionamos solo las herramientas marcadas como 'featured: true' en el registry.
  // Limitamos a 4 para mantener la simetría visual de la grilla (2x2 en desktop).
  const featuredTools = toolsRegistry.filter(t => t.featured).slice(0, 4);

  // B. Transformación de Datos (Mapping)
  // Adaptamos el objeto del registry a las props exactas que espera <ActionCard />.
  // Esto desacopla la base de datos de la interfaz visual.
  const FINANCIAL_TOOLS = featuredTools.map(tool => ({
     icon: tool.icon,
     title: tool.title,
     desc: tool.desc,  // Descripción corta para la tarjeta
     to: tool.path,    // IMPORTANTE: Mapeamos la propiedad 'path' del registry a 'to' del Link
     color: tool.color // Color semántico (emerald/violet/etc)
  }));

  // C. Métricas Macro (Estático)
  // Estas son navegaciones rápidas a secciones de indicadores, no calculadoras.
  const MACRO_METRICS = [
    { icon: Zap, title: "Velocidad del Dinero", desc: "Rotación de la base monetaria.", to: "/macro/velocidad", color: "indigo" },
    { icon: Landmark, title: "Encajes Bancarios", desc: "Liquidez del sistema financiero.", to: "/macro/encajes", color: "indigo" },
    { icon: Database, title: "Base Monetaria", desc: "Evolución de pasivos del BCRA.", to: "/macro/base", color: "indigo" },
    { icon: TrendingUp, title: "Reservas Netas", desc: "Poder de fuego real del central.", to: "/macro/reservas", color: "indigo" },
  ];


  return (
    // COLOR CHECK: bg-[#0B1121] es el Dark Mode profundo solicitado.
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#0B1121] transition-colors duration-300 pb-20">
      
      {/* --- SECTION: HERO --- */}
      <section className="w-full relative overflow-hidden bg-slate-950 py-20 sm:py-32 border-b border-white/5 mb-12">
          {/* Mantenemos tu código del Hero intacto aquí */}
          <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-96 h-96 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none"></div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-sm mb-6">
                <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                Datos en tiempo real
                </span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-black text-white tracking-tighter mb-6">
                El pulso de la <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">Economía</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
                Tablero de control macroeconómico profesional. Accedé a cotizaciones y variables clave con precisión financiera.
            </p>
          </div>
      </section>

      {/* --- SECTION: MERCADO PRIORITARIO --- */}
      <div className="max-w-7xl mx-auto px-4 mt-8 mb-16">
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

         <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {datosParaMostrar.map((item) => (
              <StatCard key={item.id} {...item} />
            ))}
         </div>
      </div>

      {/* --- SECTION: RESUMEN IA --- */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <ResumenIA />
      </div>

      {/* --- SECTION: ANALYTICS TEASER --- */}
      <div className="max-w-7xl mx-auto px-4 mb-16">
        <Link 
            to="/analytics"
            className="
                group relative block w-full overflow-hidden rounded-2xl
                bg-gradient-to-r from-[#1e1b4b] to-[#0f172a] /* Indigo profundo */
                border border-indigo-500/30 hover:border-indigo-400/50
                p-6 sm:p-8 transition-all duration-300 shadow-xl
            "
        >
            <div className="absolute top-0 right-0 p-32 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400 shrink-0">
                        <BrainCircuit size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-1">
                            Analytics & IA Dashboard
                        </h3>
                        <p className="text-indigo-200/70 text-sm max-w-xl">
                            Modelos predictivos, correlaciones monetarias (M2 vs Inflación) y análisis de sentimiento automatizado.
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold text-sm transition-colors shadow-lg shadow-indigo-900/50 whitespace-nowrap">
                    Abrir Dashboard
                    <ArrowRight size={16} />
                </div>
            </div>
        </Link>
      </div>


      {/* --- SECTION: SECTORES --- */}
      <div className="max-w-7xl mx-auto px-4 mb-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-slate-200/60 dark:border-slate-800">
           <div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2 block">
                Fundamental
              </span>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Sectores Económicos
              </h2>
           </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {sectores.slice(0, 7).map((sector) => { 
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
                        <Icono size={20}/>
                    </div>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{sector.titulo}</span>
                </Link>
             )
          })}
        </div>
      </div>


      {/* --- SECTION: CENTRO DE OPERACIONES --- */}
      <div className="max-w-7xl mx-auto px-4 mb-24">
        
        <div className="flex items-center gap-3 mb-8">
            <div className="h-8 w-1 bg-gradient-to-b from-emerald-400 to-indigo-500 rounded-full"></div>
            <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Centro de Operaciones
                </h2>
                <p className="text-slate-500 text-sm mt-0.5">Herramientas técnicas y datos de alta frecuencia.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* COLUMNA 1: Financiero (Operativo) - Tono Emerald */}
          <div className="flex flex-col h-full">
             <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                    <Calculator size={18} className="text-emerald-500" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Calculadoras</span>
                </div>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                {FINANCIAL_TOOLS.map((tool, idx) => (
                    <ActionCard key={idx} {...tool} accentColor="emerald" />
                ))}
             </div>

             <Link to="/herramientas" className="mt-4 flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-slate-700 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all text-sm font-medium">
                <Search size={16} />
                Ver catálogo completo
             </Link>
          </div>

          {/* COLUMNA 2: Macro (Estratégico) - Tono Indigo */}
          <div className="flex flex-col h-full">
             <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                    <Activity size={18} className="text-indigo-500" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Métricas Macro</span>
                </div>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                {MACRO_METRICS.map((metric, idx) => (
                    <ActionCard key={idx} {...metric} accentColor="indigo" />
                ))}
             </div>

             <Link to="/macro-data" className="mt-4 flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-slate-700 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all text-sm font-medium">
                <Search size={16} />
                Ver los 30+ indicadores
             </Link>
          </div>

        </div>
      </div>


      {/* --- SECTION: FOOTER NAV --- */}
      <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/30 py-12">
         <div className="max-w-7xl mx-auto px-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">Recursos Adicionales</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Glosario */}
                <Link to="/glosario" className="group flex items-center gap-4 p-4 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 transition-colors">
                    <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition-colors">
                        <FileText size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">Glosario Económico</h4>
                        <p className="text-sm text-slate-500">Definiciones técnicas oficiales.</p>
                    </div>
                </Link>

                {/* Exportar */}
                <Link to="/exportar" className="group flex items-center gap-4 p-4 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-500 transition-colors">
                    <div className="p-3 bg-amber-500/10 text-amber-500 rounded-lg group-hover:bg-amber-500 group-hover:text-white transition-colors">
                        <Download size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">Exportar Series</h4>
                        <p className="text-sm text-slate-500">Datasets en CSV/Excel.</p>
                    </div>
                </Link>

            </div>
         </div>
      </div>

    </div>
  );
}