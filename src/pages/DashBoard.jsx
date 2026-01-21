import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { misIndicadores } from '../data/monitores'; 
import { 
  TrendingUp, Activity, Newspaper, ArrowUpRight, ArrowDownRight, 
  Plus, X, Layout, Save, MoreHorizontal, Calculator, ChevronRight, 
  Flame, Search, Briefcase, LineChart, Layers, FolderPlus, 
  Trash2, Check, ChevronDown, Home, Plane, Building2, Scale, Zap 
} from 'lucide-react';

/**
 * ---------------------------------------------------------------------
 * 1. DB MAESTRA DE HERRAMIENTAS (Full Update)
 * ---------------------------------------------------------------------
 */
const TOOLS_DB = [
  // --- MÓDULO I: INFLACIÓN (Naranja) ---
  { id: 'tool-inf-ajuste', title: 'Ajuste x Inflación', icon: Calculator, link: '/calculadoras/inflacion/ajuste', color: 'orange', cat: 'Inflación' },
  { id: 'tool-inf-salario', title: 'Salario Real', icon: TrendingUp, link: '/calculadoras/inflacion/salario-real', color: 'orange', cat: 'Inflación' },
  { id: 'tool-inf-stock', title: 'Stockeo vs Plazo Fijo', icon: Layers, link: '/calculadoras/inflacion/stockeo', color: 'orange', cat: 'Inflación' },
  { id: 'tool-inf-ipc', title: 'Mi IPC Personal', icon: Activity, link: '/calculadoras/inflacion/mi-ipc', color: 'orange', cat: 'Inflación' },
  { id: 'tool-inf-tarifas', title: 'Proyector Tarifas', icon: Zap, link: '/calculadoras/inflacion/tarifas', color: 'orange', cat: 'Inflación' },

  // --- MÓDULO II: INVERSIONES (Emerald/Green) ---
  { id: 'tool-inv-liquidez', title: 'Radar Liquidez', icon: Activity, link: '/calculadoras/inversiones/liquidez', color: 'emerald', cat: 'Inversión' },
  { id: 'tool-inv-bonos', title: 'Calculadora Bonos', icon: LineChart, link: '/calculadoras/inversiones/bonos', color: 'emerald', cat: 'Inversión' },
  { id: 'tool-inv-cedears', title: 'Arbitraje Cedears', icon: ArrowUpRight, link: '/calculadoras/inversiones/cedears', color: 'emerald', cat: 'Inversión' },
  { id: 'tool-inv-pfuva', title: 'Plazo Fijo vs UVA', icon: TrendingUp, link: '/calculadoras/inversiones/plazo-fijo-uva', color: 'emerald', cat: 'Inversión' },
  { id: 'tool-inv-carry', title: 'Carry Trade', icon: ArrowDownRight, link: '/calculadoras/inversiones/carry-trade', color: 'emerald', cat: 'Inversión' },
  { id: 'tool-inv-dolar', title: 'Rutas Dolarización', icon: Activity, link: '/calculadoras/inversiones/dolarizacion', color: 'emerald', cat: 'Inversión' },
  { id: 'tool-inv-retiro', title: 'Calc. Retiro FIRE', icon: Plane, link: '/calculadoras/inversiones/retiro', color: 'emerald', cat: 'Inversión' },
  
  // --- MÓDULO III: CRÉDITO (Azul/Indigo) ---
  { id: 'tool-cred-cft', title: 'Decodificador CFT', icon: Search, link: '/calculadoras/credito/cft', color: 'blue', cat: 'Crédito' },
  { id: 'tool-cred-bola', title: 'Bola de Nieve', icon: Layers, link: '/calculadoras/credito/bola-nieve', color: 'blue', cat: 'Crédito' },
  { id: 'tool-cred-capacidad', title: 'Capacidad Endeud.', icon: Scale, link: '/calculadoras/credito/capacidad', color: 'blue', cat: 'Crédito' },
  { id: 'tool-cred-cuota', title: 'Cuota Simple', icon: Calculator, link: '/calculadoras/credito/cuota-simple', color: 'blue', cat: 'Crédito' },

  // --- MÓDULO IV: INMOBILIARIO (Cyan) ---
  { id: 'tool-inm-compra', title: 'Comprar vs Alquilar', icon: Home, link: '/calculadoras/inmobiliario/comprar-alquilar', color: 'cyan', cat: 'Inmobiliario' },
  { id: 'tool-inm-uva', title: 'Hipotecario UVA', icon: Home, link: '/calculadoras/inmobiliario/hipotecario-uva', color: 'cyan', cat: 'Inmobiliario' },
  { id: 'tool-inm-alquiler', title: 'Actualiz. Alquiler', icon: Activity, link: '/calculadoras/inmobiliario/alquiler', color: 'cyan', cat: 'Inmobiliario' },
  { id: 'tool-inm-renta', title: 'Rentabilidad Real', icon: LineChart, link: '/calculadoras/inmobiliario/rentabilidad', color: 'cyan', cat: 'Inmobiliario' },
  { id: 'tool-inm-const', title: 'Costo Construcción', icon: Building2, link: '/calculadoras/inmobiliario/construccion', color: 'cyan', cat: 'Inmobiliario' },

  // --- MÓDULO V: FISCAL (Rose/Red) ---
  { id: 'tool-fisc-courier', title: 'Calc. Importación', icon: Plane, link: '/calculadoras/fiscal/importaciones', color: 'rose', cat: 'Fiscal' },
  { id: 'tool-fisc-gross', title: 'Grossing Up', icon: Calculator, link: '/calculadoras/fiscal/grossing-up', color: 'rose', cat: 'Fiscal' },
  { id: 'tool-fisc-gan', title: 'Imp. Ganancias', icon: Scale, link: '/calculadoras/fiscal/ganancias', color: 'rose', cat: 'Fiscal' },
  { id: 'tool-fisc-mono', title: 'Categor. Monotributo', icon: Briefcase, link: '/calculadoras/fiscal/monotributo', color: 'rose', cat: 'Fiscal' },
  { id: 'tool-fisc-expo', title: 'Expo Servicios', icon: Plane, link: '/calculadoras/fiscal/exportacion', color: 'rose', cat: 'Fiscal' },

  // --- MÓDULO VI: VIDA (Purple) ---
  { id: 'tool-vida-tarjeta', title: 'Dólar Tarjeta', icon: Activity, link: '/calculadoras/vida/dolar-tarjeta', color: 'purple', cat: 'Vida' },
  { id: 'tool-vida-viaje', title: 'Presupuesto Viaje', icon: Plane, link: '/calculadoras/vida/viajes', color: 'purple', cat: 'Vida' },
  
  // --- MÓDULO VII: CORPORATIVO (Slate) ---
  { id: 'tool-corp-cheques', title: 'Desc. Cheques', icon: Briefcase, link: '/calculadoras/corporativo/cheques', color: 'slate', cat: 'Corporativo' },
  { id: 'tool-corp-monte', title: 'Sim. Montecarlo', icon: LineChart, link: '/calculadoras/corporativo/montecarlo', color: 'slate', cat: 'Corporativo' },
];

// --- MOCK COTIZACIONES (Ejemplo) ---
const MARKET_DB = [
  { id: 'market-ggal', title: 'Galicia (GGAL)', valor: '$ 4.250', variacion: 2.4, tipo: 'accion' },
  { id: 'market-ypf', title: 'YPF (YPFD)', valor: '$ 28.100', variacion: -1.2, tipo: 'accion' },
  { id: 'market-spy', title: 'S&P 500 (SPY)', valor: 'US$ 510', variacion: 0.1, tipo: 'cedear' },
];

const SIZE_CONFIG = {
  'dolar-blue': 'large',
  'inflacion-mensual': 'wide',
  'noticias-flash': 'tall',
  'market-ggal': 'small',
};

// --- COMPONENTE BENTO ITEM (Solo para Herramientas y Noticias) ---
const BentoItem = ({ children, className, title, icon: Icon, isEditing, color, link }) => {
  const Wrapper = (link && !isEditing) ? Link : 'div';
  const wrapperProps = (link && !isEditing) ? { to: link } : {};

  return (
    <Wrapper {...wrapperProps} className={`
      relative flex flex-col 
      bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 
      shadow-sm transition-all duration-300 overflow-hidden
      ${className} 
      ${isEditing ? 'border-dashed border-emerald-500 bg-emerald-50/10' : 'hover:shadow-md hover:border-emerald-500/30'}
      ${link && !isEditing ? 'cursor-pointer group' : ''}
    `}>
      {/* HEADER */}
      <div className="p-5 pb-0 flex items-center justify-between mb-2 opacity-80">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          {Icon && <Icon size={18} className={color ? `text-${color}-500` : ''} />}
          <span className="text-xs font-bold uppercase tracking-wider truncate max-w-[140px]">{title}</span>
        </div>
        {!isEditing && (
           link 
            ? <ArrowUpRight size={16} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
            : <MoreHorizontal size={16} className="text-slate-300" />
        )}
      </div>
      {/* CONTENT */}
      <div className="flex-1 min-h-0 relative z-0 p-5 pt-2 flex flex-col justify-center">
        {children}
      </div>
    </Wrapper>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [openSection, setOpenSection] = useState('macro'); 
  const [isCollectionMenuOpen, setIsCollectionMenuOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [showNewInput, setShowNewInput] = useState(false);

  // --- LOGICA TICKER ---
  const topMovers = useMemo(() => {
    return [...misIndicadores]
      .sort((a, b) => Math.abs(b.variacion) - Math.abs(a.variacion))
      .slice(0, 10);
  }, []);

  // --- GESTIÓN DE COLECCIONES ---
  const [collections, setCollections] = useState(() => {
    if (!user || !user.email) return [{ id: 'default', name: 'Resumen Principal', widgets: ['dolar-blue', 'riesgo-pais', 'inflacion-mensual', 'tool-inv-pfuva'] }];
    try {
      const saved = localStorage.getItem(`monitorEco_collections_${user.email}`);
      return saved ? JSON.parse(saved) : [{ id: 'default', name: 'Resumen Principal', widgets: ['dolar-blue', 'riesgo-pais', 'inflacion-mensual'] }];
    } catch { 
      return [{ id: 'default', name: 'Resumen Principal', widgets: ['dolar-blue'] }]; 
    }
  });

  const [activeCollectionId, setActiveCollectionId] = useState(() => {
    return localStorage.getItem(`monitorEco_activeId_${user?.email}`) || 'default';
  });

  useEffect(() => {
    if (user?.email) {
      localStorage.setItem(`monitorEco_collections_${user.email}`, JSON.stringify(collections));
      localStorage.setItem(`monitorEco_activeId_${user.email}`, activeCollectionId);
    }
  }, [collections, activeCollectionId, user]);

  const currentCollection = collections.find(c => c.id === activeCollectionId) || collections[0];
  const activeWidgets = currentCollection.widgets;

  // --- CRUD COLECCIONES ---
  const handleCreateCollection = () => {
    if (!newCollectionName.trim()) return;
    const newId = `col-${Date.now()}`;
    const newCol = { id: newId, name: newCollectionName, widgets: [] };
    setCollections([...collections, newCol]);
    setActiveCollectionId(newId);
    setNewCollectionName('');
    setShowNewInput(false);
    setIsCollectionMenuOpen(false);
    setIsEditing(true);
  };

  const handleDeleteCollection = (id) => {
    if (collections.length === 1) return alert("Debes tener al menos una colección.");
    const newCols = collections.filter(c => c.id !== id);
    setCollections(newCols);
    if (activeCollectionId === id) setActiveCollectionId(newCols[0].id);
  };

  const toggleWidget = (widgetId) => {
    const updatedCols = collections.map(col => {
      if (col.id === activeCollectionId) {
        const exists = col.widgets.includes(widgetId);
        return {
          ...col,
          widgets: exists ? col.widgets.filter(w => w !== widgetId) : [...col.widgets, widgetId]
        };
      }
      return col;
    });
    setCollections(updatedCols);
  };

  // --- GET DATA ---
  const getWidgetData = (id) => {
    const macro = misIndicadores.find(i => i.id === id);
    if (macro) return { ...macro, type: 'macro', size: SIZE_CONFIG[id] || 'small' };

    const tool = TOOLS_DB.find(t => t.id === id);
    if (tool) return { ...tool, type: 'tool', size: SIZE_CONFIG[id] || 'small' };

    const market = MARKET_DB.find(m => m.id === id);
    if (market) return { ...market, type: 'market', size: SIZE_CONFIG[id] || 'small', Icono: LineChart };

    if (id === 'noticias-flash') return { title: 'Flash News', type: 'special', size: 'tall' };
    return null;
  };

  const getSizeClass = (size) => {
    switch(size) {
      case 'large': return 'md:col-span-2 md:row-span-2'; 
      case 'tall': return 'md:col-span-1 md:row-span-2 lg:row-span-3';  
      case 'wide': return 'md:col-span-2 md:row-span-1';  
      default: return 'md:col-span-1 md:row-span-1';      
    }
  };

  // --- FILTROS PARA EL MENÚ DE EDICIÓN ---
  const filteredMacro = misIndicadores.filter(i => i.titulo.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredTools = TOOLS_DB.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredMarket = MARKET_DB.filter(m => m.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1121] transition-colors duration-300 pb-24">
      
      {/* TICKER */}
      <style>{`
        @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-scroll { display: flex; animation: scroll 40s linear infinite; }
        .animate-scroll:hover { animation-play-state: paused; }
      `}</style>
      
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 h-10 relative flex items-center overflow-hidden z-20">
        <div className="absolute left-0 z-20 h-full flex items-center bg-white dark:bg-slate-900 pr-6 pl-4 shadow-lg">
           <div className="bg-orange-100 dark:bg-orange-900/30 p-1 rounded-md mr-2"><Flame size={12} className="text-orange-600 dark:text-orange-500 animate-pulse" /></div>
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 whitespace-nowrap">Market Movers</span>
        </div>
        <div className="animate-scroll pl-40">
           {[...topMovers, ...topMovers].map((mover, idx) => (
             <div key={`${mover.id}-${idx}`} className="flex items-center gap-2 shrink-0 mx-6">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{mover.titulo}</span>
                <span className={`text-[10px] font-mono font-bold px-1 py-0.5 rounded ${mover.variacion >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>{mover.variacion > 0 ? '+' : ''}{mover.variacion}%</span>
             </div>
           ))}
        </div>
      </div>

      <div className="p-4 md:p-8 max-w-[1920px] mx-auto">
        
        {/* HEADER & COLECCIONES */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="relative">
             <h1 className="text-xl font-medium text-slate-500 dark:text-slate-400 mb-1">Tablero de Control</h1>
             <div className="relative inline-block">
                <button 
                  onClick={() => setIsCollectionMenuOpen(!isCollectionMenuOpen)}
                  className="flex items-center gap-3 text-3xl font-black text-slate-900 dark:text-white hover:text-emerald-600 transition-colors"
                >
                  {currentCollection.name} <ChevronDown size={24} className={`transition-transform duration-300 ${isCollectionMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {isCollectionMenuOpen && (
                  <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-2 z-50 animate-in fade-in zoom-in-95">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-2">Mis Colecciones</div>
                      {collections.map(col => (
                        <div key={col.id} className="flex items-center justify-between group rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 p-1">
                           <button onClick={() => { setActiveCollectionId(col.id); setIsCollectionMenuOpen(false); }} className={`flex-1 text-left px-2 py-2 text-sm font-bold flex items-center gap-2 ${activeCollectionId === col.id ? 'text-emerald-600' : 'text-slate-700 dark:text-slate-200'}`}>
                              {activeCollectionId === col.id && <Check size={14}/>}{col.name}
                           </button>
                           {collections.length > 1 && (<button onClick={() => handleDeleteCollection(col.id)} className="p-2 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>)}
                        </div>
                      ))}
                      <div className="border-t border-slate-100 dark:border-slate-700 my-2"></div>
                      {!showNewInput ? (
                        <button onClick={() => setShowNewInput(true)} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"><FolderPlus size={16} /> Nueva Colección</button>
                      ) : (
                        <div className="p-2">
                           <input autoFocus type="text" placeholder="Nombre (ej: Crypto)" className="w-full text-sm p-2 rounded border mb-2 dark:bg-slate-900 dark:text-white dark:border-slate-600" value={newCollectionName} onChange={(e) => setNewCollectionName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCreateCollection()} />
                           <div className="flex gap-2"><button onClick={handleCreateCollection} className="flex-1 bg-emerald-600 text-white text-xs font-bold py-1.5 rounded">Crear</button><button onClick={() => setShowNewInput(false)} className="flex-1 bg-slate-200 text-slate-600 text-xs font-bold py-1.5 rounded">Cancelar</button></div>
                        </div>
                      )}
                  </div>
                )}
             </div>
          </div>
          
          <button onClick={() => setIsEditing(!isEditing)} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm ${isEditing ? 'bg-emerald-600 text-white ring-2 ring-emerald-600 ring-offset-2 dark:ring-offset-[#0B1121]' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50'}`}>
            {isEditing ? <Save size={18} /> : <Layout size={18} />} {isEditing ? 'Finalizar Edición' : 'Editar Colección'}
          </button>
        </div>

        {/* 3. MENU EDICION */}
        {isEditing && (
          <div className="mb-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-700 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 z-10 relative">
             <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-3">
               <Search className="text-slate-400" size={20} />
               <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white w-full text-sm font-medium h-full outline-none" autoFocus />
            </div>
            <div className="flex flex-col md:flex-row h-[400px]">
                <div className="w-full md:w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <button onClick={() => setOpenSection('macro')} className={`w-full text-left p-4 flex items-center justify-between font-bold text-sm border-b border-slate-100 dark:border-slate-800 ${openSection === 'macro' ? 'bg-white dark:bg-slate-800 text-emerald-600 border-l-4 border-l-emerald-600' : 'text-slate-500 hover:bg-slate-100'}`}><span className="flex items-center gap-2"><Activity size={16}/> Datos Macro</span></button>
                    <button onClick={() => setOpenSection('market')} className={`w-full text-left p-4 flex items-center justify-between font-bold text-sm border-b border-slate-100 dark:border-slate-800 ${openSection === 'market' ? 'bg-white dark:bg-slate-800 text-blue-600 border-l-4 border-l-blue-600' : 'text-slate-500 hover:bg-slate-100'}`}><span className="flex items-center gap-2"><LineChart size={16}/> Cotizaciones</span></button>
                    <button onClick={() => setOpenSection('tools')} className={`w-full text-left p-4 flex items-center justify-between font-bold text-sm border-b border-slate-100 dark:border-slate-800 ${openSection === 'tools' ? 'bg-white dark:bg-slate-800 text-purple-600 border-l-4 border-l-purple-600' : 'text-slate-500 hover:bg-slate-100'}`}><span className="flex items-center gap-2"><Calculator size={16}/> Herramientas</span></button>
                </div>
                <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-slate-100/50 dark:bg-black/20">
                    {openSection === 'macro' && (<div className="grid grid-cols-2 md:grid-cols-3 gap-3">{filteredMacro.map(item => (<button key={item.id} onClick={() => toggleWidget(item.id)} className={`p-3 rounded-xl border text-left flex flex-col gap-1 hover:shadow-md ${activeWidgets.includes(item.id) ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}><span className="text-[10px] font-bold opacity-70 uppercase">{item.categoria}</span><span className="font-bold text-xs truncate w-full">{item.titulo}</span></button>))}</div>)}
                    {openSection === 'market' && (<div className="grid grid-cols-2 md:grid-cols-3 gap-3">{filteredMarket.map(item => (<button key={item.id} onClick={() => toggleWidget(item.id)} className={`p-3 rounded-xl border text-left flex flex-col gap-1 hover:shadow-md ${activeWidgets.includes(item.id) ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}><span className="text-[10px] font-bold opacity-70 uppercase">{item.tipo}</span><span className="font-bold text-xs truncate w-full">{item.title}</span></button>))}</div>)}
                    {openSection === 'tools' && (<div className="grid grid-cols-2 md:grid-cols-3 gap-3">{filteredTools.map(item => (<button key={item.id} onClick={() => toggleWidget(item.id)} className={`p-3 rounded-xl border text-left flex flex-col gap-1 hover:shadow-md ${activeWidgets.includes(item.id) ? 'bg-purple-600 text-white' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}><div className="flex justify-between mb-1"><item.icon size={16} /><span className="text-[9px] font-bold opacity-70 uppercase">{item.cat}</span></div><span className="font-bold text-xs truncate w-full">{item.title}</span></button>))}</div>)}
                </div>
            </div>
          </div>
        )}

        {/* 4. GRILLA PRINCIPAL */}
        <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[200px] gap-4">
          {activeWidgets.map(widgetId => {
            const data = getWidgetData(widgetId);
            if (!data) return null;

            const isDataWidget = data.type === 'macro' || data.type === 'market';

            return (
              <div key={widgetId} className={`${getSizeClass(data.size)} relative group`}>
                
                {/* --- CAPA DE EDICIÓN (OVERLAY) --- */}
                {isEditing && (
                  <>
                    {/* Botón Eliminar Flotante */}
                    <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWidget(widgetId); }}
                      className="absolute -top-3 -right-3 z-50 bg-rose-500 text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
                    >
                      <X size={16} strokeWidth={3} />
                    </button>
                    {/* Escudo transparente para prevenir clicks en los enlaces internos */}
                    <div className="absolute inset-0 z-40 bg-white/10 dark:bg-black/20 backdrop-blur-[1px] rounded-3xl border-2 border-dashed border-emerald-500 animate-pulse cursor-grab" />
                  </>
                )}

                {/* --- RENDERIZADO DEL WIDGET --- */}
                {isDataWidget ? (
                   // A. DATOS FINANCIEROS -> USAMOS TU 'StatCard'
                   <div className="h-full">
                      <StatCard 
                        id={widgetId}
                        titulo={data.titulo || data.title}
                        valor={data.valor}
                        variacion={data.variacion}
                        historial={data.historial}
                        // Mapeamos propiedades de StatCard con tus datos
                        Icono={data.Icono || Activity}
                        esInverso={data.esInverso}
                        subtexto={data.subtexto}
                        descripcion={data.descripcion}
                        insight={data.insight}
                        datoAnterior={data.datoAnterior}
                        cambioAbsoluto={data.cambioAbsoluto}
                        tipo={data.tipo}
                      />
                   </div>
                ) : (
                   // B. HERRAMIENTAS / NOTICIAS -> USAMOS 'BentoItem'
                   <BentoItem 
                      className="h-full"
                      title={data.title}
                      icon={data.icon}
                      color={data.color}
                      isEditing={isEditing}
                      // En BentoItem pasamos isEditing pero el click se maneja en el overlay de arriba para uniformidad
                      link={data.link}
                   >
                      {data.type === 'tool' ? (
                        <div className="flex flex-col items-center justify-center text-center h-full gap-2 group-hover:-translate-y-1 transition-transform">
                            <div className={`p-4 rounded-2xl bg-${data.color}-50 dark:bg-${data.color}-900/20 text-${data.color}-600 dark:text-${data.color}-400 group-hover:scale-110 transition-transform duration-300`}>
                               <data.icon size={32} strokeWidth={1.5} />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 group-hover:text-emerald-600 transition-colors">Iniciar App</span>
                        </div>
                      ) : (
                        // SPECIAL (NOTICIAS)
                        <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar h-full text-sm mask-linear-fade">
                          {[1,2,3].map(i => (
                            <div key={i} className="border-b border-slate-100 dark:border-slate-800 pb-2 last:border-0">
                               <span className="text-[10px] text-emerald-600 font-bold">Hace {i*15} min</span>
                               <p className="font-medium text-slate-700 dark:text-slate-300 mt-1 leading-snug">El mercado reacciona positivamente.</p>
                            </div>
                          ))}
                        </div>
                      )}
                   </BentoItem>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}