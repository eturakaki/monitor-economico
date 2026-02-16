import { useAuth } from '../hooks/useAuth';
import React, { useMemo, useState } from 'react'; 
import { Link } from 'react-router-dom';

// 1. IMPORTACIÓN DE ICONOS
import { 
  ArrowRight, 
  Activity, 
  Clock, 
  Calculator,    
  BrainCircuit,      
  Download,       
  LayoutGrid,     
  ChevronRight,
  Terminal, 
  Globe,
  CheckCircle2,
  Sparkles,
  Layers,
  CreditCard,
  FileText
} from 'lucide-react'; 

// 2. COMPONENTES DEL SISTEMA
import { StatCard } from '../components/StatCard';
import { MonitorGrid } from '../components/MonitorGrid'; 
import { ResumenIA } from '../components/ResumenIA';

// 3. DATOS
import { misIndicadores } from '../data/monitores';
import { toolsRegistry } from '../data/toolsRegistry';
import { sectores } from '../data/sectores';
import { planes } from '../data/planes';

// ---------------------------------------------------------------------------
// CONFIGURACIÓN ESTÁTICA
// ---------------------------------------------------------------------------
const WATCHLIST_IDS = [
  "dolar-blue", "dolar-mep", "dolar-ccl", "riesgo-pais", "merval", "reservas-bcra"
];

// ---------------------------------------------------------------------------
// MICRO-COMPONENTE: ActionCard (ALTO CONTRASTE)
// ---------------------------------------------------------------------------
const ActionCard = ({ icon: Icon, title, desc, to, accentColor = "blue" }) => {
  const colorMap = {
    emerald: {
      border: "hover:border-emerald-500",
      icon: "bg-emerald-100 text-emerald-800 group-hover:bg-emerald-600 group-hover:text-white",
      top: "border-t-emerald-600"
    },
    indigo: {
      border: "hover:border-indigo-500",
      icon: "bg-indigo-100 text-indigo-800 group-hover:bg-indigo-600 group-hover:text-white",
      top: "border-t-indigo-600"
    },
    blue: {
      border: "hover:border-blue-500",
      icon: "bg-blue-100 text-blue-800 group-hover:bg-blue-600 group-hover:text-white",
      top: "border-t-blue-600"
    },
  };

  const theme = colorMap[accentColor] ?? colorMap.blue;

  return (
    <Link 
      to={to}
      className={`
        group relative flex flex-col p-6 h-full
        bg-white dark:bg-slate-900 
        
        /* 🎨 ALTO CONTRASTE: Borde slate-300 (no 200) para definir límites claros */
        border border-slate-300 dark:border-slate-700
        border-t-[4px] ${theme.top}
        
        /* Sombra sólida para separarlo del fondo */
        shadow-sm hover:shadow-xl
        
        rounded-xl
        transition-all duration-300 ease-out
        hover:-translate-y-1 ${theme.border}
      `}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`
          p-3 rounded-lg 
          transition-colors duration-300 font-bold
          ${theme.icon}
        `}>
          {Icon && <Icon size={24} strokeWidth={2} />}
        </div>
        
        <div className="p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
             <ArrowRight size={16} className="text-slate-500 dark:text-slate-300" />
        </div>
      </div>

      <h3 className="font-extrabold text-lg text-slate-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
        {desc}
      </p>
    </Link>
  );
};

// ---------------------------------------------------------------------------
// VIEW PRINCIPAL: Home
// ---------------------------------------------------------------------------
export function Home() {
  const { user } = useAuth();
  const [activeSector, setActiveSector] = useState('cambiario');

  const destacadosFinancieros = useMemo(() => {
    if (!misIndicadores) return [];
    return misIndicadores
      .filter(item => WATCHLIST_IDS.includes(item.id))
      .sort((a, b) => WATCHLIST_IDS.indexOf(a.id) - WATCHLIST_IDS.indexOf(b.id));
  }, []);

  const datosParaMostrar = destacadosFinancieros.length > 0 
    ? destacadosFinancieros 
    : (misIndicadores || []).filter(i => i.categoria === "financiero").slice(0, 6);

  const { financialTools } = useMemo(() => {
    const tools = (toolsRegistry ?? [])
        .filter(t => t.featured)
        .slice(0, 4)
        .map(tool => ({
            icon: tool.icon, title: tool.title, desc: tool.desc, to: tool.path, color: tool.color
        }));

    return { financialTools: tools };
  }, []);

  return (
    /* 🎨 FONDO GLOBAL: bg-slate-100 (Gris Oficia).
       Esto asegura que cualquier elemento blanco (bg-white) resalte inmediatamente. */
    <div className="min-h-screen bg-slate-100 dark:bg-[#0B1121] transition-colors duration-500 pb-24">
      
     {/* === SECTION 1: HERO BANNER (REFACTORIZADO - SENIOR LEVEL) === */}
<section className="relative w-full overflow-hidden bg-white dark:bg-[#050914] pt-24 pb-20 lg:pt-32 lg:pb-28 border-b border-slate-300 dark:border-slate-800">
    
    {/* 1. BACKGROUND COMPLEX: (Mantenemos tu fondo, está excelente) */}
    <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-emerald-500/10 dark:bg-emerald-500/20 blur-[80px] rounded-full mix-blend-multiply dark:mix-blend-screen"></div>
        <div className="absolute inset-0 opacity-50 dark:opacity-20"
             style={{
                 backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)',
                 backgroundSize: '24px 24px'
             }}>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-white/50 dark:from-[#050914] dark:via-transparent dark:to-[#050914]/80"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,white_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_0%,#050914_100%)] opacity-80"></div>
    </div>

    <div className="relative z-10 max-w-7xl mx-auto px-6">
      <div className="flex flex-col items-center text-center">
          
          {/* 2. BADGE (Glassmorphism + Live Pulse) */}
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-emerald-200/50 dark:border-emerald-900/50 mb-8 shadow-sm ring-1 ring-emerald-100 dark:ring-emerald-900/30 animate-in fade-in slide-in-from-top-4 duration-700">
              <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest font-mono">
                      Mercado Operativo
                  </span>
              </div>
          </div>

          {/* 3. HEADLINE (Tight & Impactful) */}
          <h1 className="text-5xl sm:text-7xl font-black text-slate-900 dark:text-white tracking-tighter mb-6 drop-shadow-sm animate-in fade-in zoom-in-95 duration-700 delay-100">
              Monitor<span className="text-transparent bg-clip-text bg-gradient-to-br from-emerald-600 to-teal-400 dark:from-emerald-400 dark:to-teal-300">Eco</span>
              <span className="text-slate-300 dark:text-slate-700">.</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              Inteligencia financiera para la toma de decisiones. 
              <span className="block mt-2 text-slate-900 dark:text-slate-200 font-bold">
                 Datos en tiempo real, sin ruido.
              </span>
          </p>

          {/* 4. BUTTON GROUP (La Joya de la Corona) */}
          <div className="flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
                 
                 {/* BOTÓN PRIMARIO: Acción Directa */}
                 <Link to={user ? "/dashboard" : "/register"}>
                    <button className="group relative flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm shadow-xl hover:shadow-2xl hover:shadow-emerald-900/20 hover:-translate-y-1 transition-all duration-300 overflow-hidden min-w-[200px]">
                        
                        {/* Efecto de brillo al hacer hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
                        
                        {user ? (
                            <>
                                <Terminal size={18} className="text-slate-400 dark:text-slate-400 group-hover:text-emerald-400 dark:group-hover:text-emerald-600 transition-colors" />
                                <span>Abrir Terminal</span>
                            </>
                        ) : (
                            <>
                                <span>Comenzar Gratis</span>
                                <ArrowRight size={18} className="text-slate-400 dark:text-slate-400 group-hover:translate-x-1 group-hover:text-emerald-400 dark:group-hover:text-emerald-600 transition-all" />
                            </>
                        )}
                    </button>
                 </Link>
                 
                 {/* BOTÓN SECUNDARIO: Siempre Explorar Mercados */}
                 <Link to="/mercados"> 
                    <button className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl 
                        bg-white/50 dark:bg-slate-900/50 
                        backdrop-blur-sm
                        border-2 border-slate-200 dark:border-slate-800 
                        text-slate-700 dark:text-slate-300 font-bold text-sm 
                        hover:border-slate-400 dark:hover:border-slate-600 
                        hover:bg-white dark:hover:bg-slate-800
                        transition-all duration-200 min-w-[200px]">
                      
                      <Activity size={18} className="text-slate-400" />
                      Explorar Mercados
                      
                    </button>
                 </Link>
          </div>
          
          {/* Social Proof / Trust Badge (Opcional pero muy Pro) */}
          {!user && (
            <p className="mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-in fade-in delay-500">
                Sin tarjeta de crédito requerida • Datos Oficiales
            </p>
          )}

      </div>
    </div>
</section>
      {/* === SECTION 2: PULSO DE MERCADO (Separación clara fondo gris vs card blanca) === */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
         <div className="flex justify-between items-end mb-6 px-1">
            <h2 className="text-sm font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Activity size={16} className="text-emerald-700 dark:text-emerald-500" />
                Indicadores Más buscados
            </h2>
            <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-slate-700 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 px-3 py-1.5 rounded-lg shadow-sm">
               <Clock size={12} />
               <span>AUTO-UPDATE: ON</span>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {datosParaMostrar.map((item) => (
              /* CONTRASTE: border-slate-300 (Gris medio) en lugar de 200.
                 Esto dibuja una caja clara alrededor del dato.
              */
              <div key={item.id} className=" rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-sm overflow-hidden hover:shadow-lg transition-all">
                 <StatCard {...item} />
              </div>
            ))}
         </div>
      </div>

      {/* === SECTION 3: IA === */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 mb-20">
        <ResumenIA />
      </div>

      {/* === SECTION 4: CENTRO DE OPERACIONES === */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-slate-300 dark:border-slate-800">
            <div className="flex items-center gap-4">
                <div className="h-10 w-2 bg-emerald-600 rounded-sm"></div>
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        Centro de Operaciones
                    </h2>
                    <p className="text-slate-600 dark:text-slate-500 text-sm font-bold mt-1">
                        Suite de análisis técnico e inversión.
                    </p>
                </div>
            </div>
            
            <Link 
                to="/herramientas" 
                className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-sm hover:shadow-lg hover:border-emerald-600 transition-all duration-300"
            >
               <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                 Ver todas
               </span>
               <ArrowRight size={16} className="text-slate-500 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all duration-300" />
            </Link>
        </div>

        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
             <div className="flex items-center gap-2 mb-4 px-1">
                <Calculator size={16} className="text-emerald-700 dark:text-emerald-500" />
                <span className="text-xs font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Herramientas Destacadas
                </span>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {financialTools.map((tool, idx) => (
                    <ActionCard 
                        key={idx} 
                        {...tool} 
                        accentColor="emerald" 
                    />
                ))}
             </div>
        </div>
      </div>

      {/* === SECTION 5: TABLERO INTERACTIVO (Fondo BLANCO para cortar el GRIS) === */}
      <div className="w-full bg-white dark:bg-[#090e1a] border-y border-slate-300 dark:border-slate-800 py-20 mb-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
               <div>
                   <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest mb-2 block">
                     Exploración de Mercado
                   </span>
                   <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                     Cotizaciones por Sector
                   </h2>
               </div>
            </div>

            {/* --- NAV: TABS DE ALTO CONTRASTE --- */}
            <div className="relative mb-10 group">
                <div 
                    className="flex items-center gap-3 overflow-x-auto pb-4 pt-2 snap-x scroll-smooth no-scrollbar"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {sectores?.map((sector) => {
                        const SectorIcon = sector.Icono || Layers;
                        const isActive = activeSector === sector.id;

                        return (
                            <button 
                                key={sector.id} 
                                onClick={() => setActiveSector(sector.id)}
                                className={`
                                    relative flex items-center gap-2.5 px-6 py-3 rounded-lg font-bold text-xs whitespace-nowrap transition-all duration-300 snap-start border
                                    ${isActive 
                                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 shadow-xl' 
                                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:border-slate-400 hover:bg-white'
                                    }
                                `}
                            >
                                <SectorIcon size={16} className={isActive ? "animate-pulse" : "opacity-70"} />
                                <span>{sector.titulo}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className="relative min-h-[400px] p-1"> 
                <div key={activeSector} className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out fill-mode-both">
                    <MonitorGrid 
                        limit={4} 
                        category={activeSector} 
                    />
                </div>
            </div>

            <div className="mt-16 flex justify-center ">
                <Link 
                    to="/mercados" 
                    className="group flex items-center gap-3 px-8 py-4 rounded-full border-2 border-slate-300 hover:border-emerald-600 dark:bg-slate-800 dark:border-slate-700 text-slate-800 dark:text-slate-300 font-bold text-sm shadow-sm hover:shadow-xl transition-all duration-300 bg-slate-50"
                >
                    <LayoutGrid size={18} className="group-hover:scale-110 transition-transform text-slate-500 group-hover:text-emerald-600" />
                    <span>Explorar el Tablero Completo</span>
                    <ArrowRight size={16} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-emerald-600" />
                </Link>
            </div>

        </div>
      </div>

      {/* === SECTION 6: ANALYTICS TEASER === */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <Link 
            to="/analytics"
            className="
                group relative block w-full overflow-hidden rounded-3xl
                bg-[#0F172A] border border-slate-800 
                hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-900/20
                p-8 sm:p-12 transition-all duration-500
            "
        >
            <div className="absolute top-0 right-0 p-40 bg-indigo-600/20 blur-[100px] rounded-full pointer-events-none group-hover:bg-indigo-500/30 transition-all duration-500"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-start gap-6">
                    <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400 shrink-0 shadow-inner">
                        <BrainCircuit size={32} strokeWidth={1.5} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                            Analytics & Proyecciones IA
                        </h3>
                        <p className="text-slate-400 text-base max-w-xl leading-relaxed">
                            Accede a modelos predictivos avanzados y correlaciones monetarias históricas.
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2 px-6 py-3 bg-slate-800 border border-slate-700 hover:bg-indigo-600 hover:border-indigo-500 text-white rounded-xl font-bold text-sm transition-all shadow-xl whitespace-nowrap">
                    Abrir Dashboard
                    <ArrowRight size={16} />
                </div>
            </div>
        </Link>
      </div>
    {/* === SECTION 7 [PRO]: PLANES DE COMPRA INTELIGENTES === */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600">
                        <CreditCard size={20} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                            Tu Suscripción
                        </h3>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Gestiona tu nivel de acceso a datos.
                        </p>
                    </div>
                </div>
                {/* Enlace directo a la página de precios completa */}
                <Link to="/planes" className="hidden sm:flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                    Ver comparativa completa <ArrowRight size={14} />
                </Link>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {planes
                    .slice(0, 3) 
                    .map((plan) => {
                    const isCurrentPlan = user?.plan === plan.id;
                    // Detectamos si este plan es "mejor" que el actual (suponiendo que precio = nivel)
                    // Nota: Esto es visual, la lógica real está en /planes
                    const isUpgrade = !isCurrentPlan && plan.price > 0; 
                    
                    return (
                        <div 
                            key={plan.id} 
                            className={`
                                relative flex flex-col p-6 rounded-2xl border transition-all duration-300 group
                                ${isCurrentPlan 
                                    ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-500/50 ring-1 ring-emerald-500/50' 
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xl hover:-translate-y-1'
                                }
                            `}
                        >
                            {/* Header del Card */}
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className={`font-bold text-lg ${isCurrentPlan ? 'text-emerald-800 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                                        {plan.name}
                                    </h4>
                                    {isCurrentPlan && (
                                        <span className="inline-flex items-center gap-1 mt-1 text-[10px] uppercase tracking-wider font-black text-emerald-600 dark:text-emerald-400">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            Activo Ahora
                                        </span>
                                    )}
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold tabular-nums ${isCurrentPlan ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                                    {plan.price === 0 ? 'Free' : `${plan.currency}${plan.price.toLocaleString()}`}
                                </span>
                            </div>
                            
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 flex-1 leading-relaxed">
                                {plan.description}
                            </p>
                            
                            {/* ÁREA DE ACCIÓN (BOTONES MEJORADOS) */}
                            <div className="mt-auto">
                                {isCurrentPlan ? (
                                    // 1. ESTADO: PLAN ACTUAL (Validación positiva, no es clickeable)
                                    <div className="w-full py-3 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center gap-2 cursor-default transition-colors">
                                        <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />
                                        <span className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Plan Habilitado</span>
                                    </div>
                                ) : (
                                    // 2. ESTADO: OTRO PLAN (Call to Action)
                                    <Link 
                                        to="/planes"
                                        className={`
                                            flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm transition-all duration-300
                                            ${isUpgrade 
                                                ? 'bg-slate-900 text-white hover:bg-emerald-600 shadow-lg hover:shadow-emerald-500/30 dark:bg-white dark:text-slate-900 dark:hover:bg-emerald-400' 
                                                : 'border border-slate-300 dark:border-slate-700 text-slate-600 hover:border-slate-800 dark:hover:border-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                                            }
                                        `}
                                    >
                                        {isUpgrade ? (
                                            <>
                                                <span>Subir de Nivel</span>
                                                <Sparkles size={16} className={isUpgrade ? "text-yellow-300 dark:text-yellow-600" : ""} />
                                            </>
                                        ) : (
                                            <span>Ver detalles</span>
                                        )}
                                    </Link>
                                )}
                            </div>
                        </div>
                    );
                })}
             </div>
        </div>
      {/* === FOOTER NAV (MÁS CONTRASTE EN LIGHT MODE) === */}
      <div className="border-t border-slate-300 dark:border-slate-800 bg-white dark:bg-[#080C17] py-16">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-6">Recursos Adicionales</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link to="/glosario" className="group flex items-center gap-4 p-5 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#0B1121] shadow-sm hover:border-blue-500 hover:shadow-xl transition-all">
                    <div className="p-3 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-500 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors border border-blue-100 dark:border-transparent">
                        <FileText size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-base">Glosario Económico</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-500 mt-0.5">Diccionario de términos.</p>
                    </div>
                    <ChevronRight size={16} className="ml-auto text-slate-400 group-hover:text-blue-600 transition-colors" />
                </Link>

                <Link to="/exportar" className="group flex items-center gap-4 p-5 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#0B1121] shadow-sm hover:border-amber-500 hover:shadow-xl transition-all">
                    <div className="p-3 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-500 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-colors border border-amber-100 dark:border-transparent">
                        <Download size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-base">Centro de Descargas</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-500 mt-0.5">Series históricas CSV.</p>
                    </div>
                    <ChevronRight size={16} className="ml-auto text-slate-400 group-hover:text-amber-600 transition-colors" />
                </Link>
            </div>
         </div>
      </div>

    </div>
  );
}