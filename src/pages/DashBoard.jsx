import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import { StatCard } from '../components/StatCard';
import { misIndicadores } from '../data/monitores';

import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors 
} from '@dnd-kit/core';

import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  rectSortingStrategy 
} from '@dnd-kit/sortable';

import { SortableWidget } from '../components/SortableWidget';

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

// --- COMPONENTE BENTO ITEM (Para Herramientas/Noticias) ---
const BentoItem = ({ children, className, title, icon: Icon, isEditing, color, link }) => {
  const Wrapper = (link && !isEditing) ? Link : 'div';
  const wrapperProps = (link && !isEditing) ? { to: link } : {};

  return (
    <Wrapper {...wrapperProps} className={`
      relative flex flex-col h-full w-full
      bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800
      shadow-md transition-all duration-300 overflow-hidden
      ${className} 
      ${isEditing ? 'border-dashed border-emerald-500 bg-emerald-50/10' : 'hover:shadow-lg hover:border-emerald-500/30'}
      ${link && !isEditing ? 'cursor-pointer group' : ''}
    `}>
      <div className="p-5 pb-0 flex items-center justify-between mb-2 opacity-80 shrink-0">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          {Icon && <Icon size={18} className={color ? `text-${color}-500` : ''} />}
          <span className="text-xs font-bold uppercase tracking-wider truncate max-w-[140px]">{title}</span>
        </div>
        {!isEditing && (
           link 
            ? <ArrowUpRight size={16} className="text-slate-600 dark:text-slate-300 group-hover:text-emerald-500 transition-colors" />
            : <MoreHorizontal size={16} className="text-slate-600 dark:text-slate-300" />
        )}
      </div>
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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Tienes que moverlo 8px para empezar a arrastrar
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    // Si no soltamos sobre nada o soltamos sobre el mismo ítem, no hacemos nada
    if (!over || active.id === over.id) return;

    // Actualizamos el estado de las colecciones
    setCollections((prevCollections) => {
      return prevCollections.map((col) => {
        if (col.id === activeCollectionId) {
          const oldIndex = col.widgets.indexOf(active.id);
          const newIndex = col.widgets.indexOf(over.id);
          
          return {
            ...col,
            widgets: arrayMove(col.widgets, oldIndex, newIndex)
          };
        }
        return col;
      });
    });
  };


  // --- TICKER ---
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
      return saved ? JSON.parse(saved) : [{ id: 'default', name: 'Resumen Principal', widgets: ['dolar-blue', 'riesgo-pais', 'inflacion-mensual', 'tool-inv-pfuva'] }];
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

  // --- ACCIONES DE COLECCIÓN ---
 const handleCreateCollection = () => {
    if (!newCollectionName.trim()) return;
    
    // eslint-disable-next-line react-hooks/purity
    const newId = `col-${Date.now()}`;
    const newCol = { id: newId, name: newCollectionName, widgets: [] };
    setCollections([...collections, newCol]);
    setActiveCollectionId(newId);
    setNewCollectionName('');
    setShowNewInput(false);
    setIsCollectionMenuOpen(false);
    setIsEditing(true);
  };

  const handleDeleteCurrentCollection = () => {
    if (collections.length === 1) return alert("No puedes eliminar la última colección. Debes tener al menos una.");
    if (!window.confirm(`¿Estás seguro de eliminar "${currentCollection.name}"?`)) return;

    const newCols = collections.filter(c => c.id !== activeCollectionId);
    setCollections(newCols);
    setActiveCollectionId(newCols[0].id); // Volver a la primera
    setIsEditing(false); // Salir de edición
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
  // --- LÓGICA DE CAMBIO DE TAMAÑO ---
  const handleResizeWidget = (widgetId) => {
    // 1. Definimos el orden del ciclo: Small -> Wide -> Large -> Tall -> (vuelta a empezar)
    const sizeCycle = {
      'small': 'wide',
      'wide': 'large',
      'large': 'tall',
      'tall': 'small'
    };

    // 2. Actualizamos la colección activa
    setCollections(prev => prev.map(col => {
      if (col.id !== activeCollectionId) return col;

      // Obtenemos tamaños actuales o un objeto vacío
      const currentSizes = col.sizes || {};
      
      // Buscamos el tamaño actual del widget (si no tiene, buscamos su default, si no, es small)
      // Nota: Necesitamos una forma rápida de saber el default sin llamar a getWidgetData recursivamente
      // Por simplicidad, asumimos 'small' si no hay dato, el usuario lo ajustará rápido.
      const currentSize = currentSizes[widgetId] || 'small'; 
      
      const nextSize = sizeCycle[currentSize];

      return {
        ...col,
        sizes: { ...currentSizes, [widgetId]: nextSize } // Guardamos el nuevo tamaño
      };
    }));
  };


  // --- RESOLVER DATOS ---
  // Helper para leer el tamaño guardado en la colección actual
  const getUserSize = (id) => {
     // currentCollection se define al inicio del componente
     if (!currentCollection || !currentCollection.sizes) return null;
     return currentCollection.sizes[id];
  };

  const getWidgetData = (id) => {
    // 1. Buscamos si el usuario guardó un tamaño específico
    const userSize = getUserSize(id);
    
    // 2. Definimos el default según la constante global
    const defaultSize = SIZE_CONFIG[id] || 'small';
    
    // 3. El tamaño final: Preferencia Usuario > Default Config
    const finalSize = userSize || defaultSize;

    // --- MAPPERS ---
    const macro = misIndicadores.find(i => i.id === id);
    if (macro) return { ...macro, type: 'macro', size: finalSize };

    const tool = TOOLS_DB.find(t => t.id === id);
    if (tool) return { ...tool, type: 'tool', size: finalSize };

    const market = MARKET_DB.find(m => m.id === id);
    if (market) return { ...market, type: 'market', size: finalSize, Icono: LineChart };

    if (id === 'noticias-flash') return { title: 'Flash News', type: 'special', size: finalSize };
    
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
  
  // --- FILTROS ---
  const filteredMacro = misIndicadores.filter(i => i.titulo.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredTools = TOOLS_DB.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredMarket = MARKET_DB.filter(m => m.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-200 dark:bg-[#0B1121] transition-colors duration-300 pb-24">
      
      {/* Ticker Animation */}
      <style>{`
        @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-scroll { display: flex; animation: scroll 40s linear infinite; }
        .animate-scroll:hover { animation-play-state: paused; }
      `}</style>
      
      {/* 1. TICKER SUPERIOR */}
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
        
        {/* 2. HEADER Y CONTROLES */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="relative">
             <h1 className="text-xl font-medium text-slate-500 dark:text-slate-400 mb-1">Tablero de Control</h1>
             
             {/* Dropdown de Colecciones */}
             <div className="relative inline-block">
                <button onClick={() => setIsCollectionMenuOpen(!isCollectionMenuOpen)} className="flex items-center gap-3 text-3xl font-black text-slate-900 dark:text-white hover:text-emerald-600 transition-colors">
                  {currentCollection.name} <ChevronDown size={24} className={`transition-transform duration-300 ${isCollectionMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isCollectionMenuOpen && (
                  <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-300 dark:border-slate-700 p-2 z-50 animate-in fade-in zoom-in-95">
                      <div className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest px-3 py-2">Mis Colecciones</div>
                      {collections.map(col => (
                        <div key={col.id} className="flex items-center justify-between group rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 p-1">
                           <button onClick={() => { setActiveCollectionId(col.id); setIsCollectionMenuOpen(false); }} className={`flex-1 text-left px-2 py-2 text-sm font-bold flex items-center gap-2 ${activeCollectionId === col.id ? 'text-emerald-600' : 'text-slate-700 dark:text-slate-200'}`}>
                              {activeCollectionId === col.id && <Check size={14}/>}{col.name}
                           </button>
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
          
          <button onClick={() => setIsEditing(!isEditing)} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md ${isEditing ? 'bg-emerald-600 text-white ring-2 ring-emerald-600 ring-offset-2 dark:ring-offset-[#0B1121]' : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50'}`}>
            {isEditing ? <Save size={18} /> : <Layout size={18} />} {isEditing ? 'Finalizar Edición' : 'Editar Colección'}
          </button>
        </div>

        {/* 3. MENU DE EDICIÓN */}
        {isEditing && (
          <div className="mb-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-700 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 z-10 relative">
             {/* Header del Menú */}
             <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                <div className="flex items-center gap-3 flex-1">
                   <Search className="text-slate-600 dark:text-slate-400" size={20} />
                   <input type="text" placeholder="Buscar widget..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white w-full text-sm font-medium outline-none" autoFocus />
                </div>
                {/* BOTÓN ELIMINAR COLECCIÓN (VISIBLE AHORA) */}
                {collections.length > 1 && (
                  <button 
                    onClick={handleDeleteCurrentCollection}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-900/20 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
                  >
                    <Trash2 size={14} /> Eliminar esta Colección
                  </button>
                )}
             </div>

             <div className="flex flex-col md:flex-row h-[400px]">
                <div className="w-full md:w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <button onClick={() => setOpenSection('macro')} className={`w-full text-left p-4 flex items-center justify-between font-bold text-sm border-b border-slate-100 dark:border-slate-800 ${openSection === 'macro' ? 'bg-white dark:bg-slate-800 text-emerald-600 border-l-4 border-l-emerald-600' : 'text-slate-500 hover:bg-slate-100'}`}><span className="flex items-center gap-2"><Activity size={16}/> Datos Macro</span></button>
                    <button onClick={() => setOpenSection('market')} className={`w-full text-left p-4 flex items-center justify-between font-bold text-sm border-b border-slate-100 dark:border-slate-800 ${openSection === 'market' ? 'bg-white dark:bg-slate-800 text-blue-600 border-l-4 border-l-blue-600' : 'text-slate-500 hover:bg-slate-100'}`}><span className="flex items-center gap-2"><LineChart size={16}/> Cotizaciones</span></button>
                    <button onClick={() => setOpenSection('tools')} className={`w-full text-left p-4 flex items-center justify-between font-bold text-sm border-b border-slate-100 dark:border-slate-800 ${openSection === 'tools' ? 'bg-white dark:bg-slate-800 text-purple-600 border-l-4 border-l-purple-600' : 'text-slate-500 hover:bg-slate-100'}`}><span className="flex items-center gap-2"><Calculator size={16}/> Herramientas</span></button>
                </div>
                <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-slate-100/50 dark:bg-black/20">
                    {/* Render de botones de selección */}
                    {openSection === 'macro' && (<div className="grid grid-cols-2 md:grid-cols-3 gap-3">{filteredMacro.map(item => (<button key={item.id} onClick={() => toggleWidget(item.id)} className={`p-3 rounded-xl border text-left flex flex-col gap-1 shadow-md hover:shadow-lg ${activeWidgets.includes(item.id) ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700'}`}><span className="text-[10px] font-bold opacity-70 uppercase">{item.categoria}</span><span className="font-bold text-xs truncate w-full">{item.titulo}</span></button>))}</div>)}
                    {openSection === 'market' && (<div className="grid grid-cols-2 md:grid-cols-3 gap-3">{filteredMarket.map(item => (<button key={item.id} onClick={() => toggleWidget(item.id)} className={`p-3 rounded-xl border text-left flex flex-col gap-1 shadow-md hover:shadow-lg ${activeWidgets.includes(item.id) ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700'}`}><span className="text-[10px] font-bold opacity-70 uppercase">{item.tipo}</span><span className="font-bold text-xs truncate w-full">{item.title}</span></button>))}</div>)}
                    {openSection === 'tools' && (<div className="grid grid-cols-2 md:grid-cols-3 gap-3">{filteredTools.map(item => (<button key={item.id} onClick={() => toggleWidget(item.id)} className={`p-3 rounded-xl border text-left flex flex-col gap-1 shadow-md hover:shadow-lg ${activeWidgets.includes(item.id) ? 'bg-purple-600 text-white' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700'}`}><div className="flex justify-between mb-1"><item.icon size={16} /><span className="text-[9px] font-bold opacity-70 uppercase">{item.cat}</span></div><span className="font-bold text-xs truncate w-full">{item.title}</span></button>))}</div>)}
                </div>
            </div>
          </div>
        )}

        {/* 4. GRILLA PRINCIPAL CON DND */}
        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCenter} 
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={activeWidgets} 
            strategy={rectSortingStrategy} // Estrategia optimizada para Grids
          >
            <div className="grid grid-cols-1 md:grid-cols-4 auto-rows gap-4 grid-flow-row-dense pb-20">
              
              {activeWidgets.map((widgetId) => {
                const data = getWidgetData(widgetId);
                if (!data) return null;
                const isDataWidget = data.type === 'macro' || data.type === 'market';
                const sizeClass = getSizeClass(data.size); // Calculamos el tamaño aquí para pasárselo al Wrapper

                return (
                  <SortableWidget 
                    key={widgetId} 
                    id={widgetId} 
                    sizeClass={sizeClass} 
                    className={`${sizeClass} relative group h-full w-full`} // Pasamos las clases de Grid al Wrapper
                    isEditing={isEditing}
                    onResize={handleResizeWidget}
                  >
                    {/* --- CONTENIDO DEL WIDGET (TU CÓDIGO ACTUAL) --- */}
                    <div className="h-full w-full relative"> {/* Contenedor interno para asegurar altura */}
                      {isEditing && (
                        <>
                          {/* El botón de eliminar NO debe activar el drag, por eso usamos activationConstraint en los sensores */}
                          <button 
                            onPointerDown={(e) => e.stopPropagation()} // Detiene la propagación para que el click no inicie drag
                            onClick={(e) => { 
                              e.preventDefault(); 
                              e.stopPropagation(); 
                              toggleWidget(widgetId); 
                            }} 
                            className="absolute -top-3 -right-3 z-[60] bg-rose-500 text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer"
                          >
                            <X size={16} strokeWidth={3} />
                          </button>
                          
                          {/* Overlay visual de edición */}
                          <div className="absolute inset-0 z-40 bg-white/10 dark:bg-black/20 backdrop-blur-[1px] rounded-3xl border-2 border-dashed border-emerald-500 animate-pulse pointer-events-none" />
                        </>
                      )}

                      {isDataWidget ? (
                        <StatCard 
                          {...data}
                          // IMPORTANTE: StatCard ya maneja sus propios estilos internos
                          // Aseguramos que llene el contenedor
                          className="h-full w-full"
                          Icono={data.Icono || Activity}
                        />
                      ) : (
                        <BentoItem 
                          className="h-full w-full" 
                          title={data.title} 
                          icon={data.icon} 
                          color={data.color} 
                          isEditing={isEditing} 
                          link={data.link}
                        >
                          {data.type === 'tool' ? (
                            <div className="flex flex-col items-center justify-center text-center h-full gap-2 group-hover:-translate-y-1 transition-transform">
                                <div className={`p-4 rounded-2xl bg-${data.color}-50 dark:bg-${data.color}-900/20 text-${data.color}-600 dark:text-${data.color}-400 group-hover:scale-110 transition-transform duration-300`}><data.icon size={32} strokeWidth={1.5} /></div>
                                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mt-2 group-hover:text-emerald-600 transition-colors">Iniciar App</span>
                            </div>
                          ) : (
                            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar h-full text-sm mask-linear-fade">
                              {[1,2,3].map(i => (<div key={i} className="border-b border-slate-100 dark:border-slate-800 pb-2 last:border-0"><span className="text-[10px] text-emerald-600 font-bold">Hace {i*15} min</span><p className="font-medium text-slate-700 dark:text-slate-300 mt-1 leading-snug">El mercado reacciona positivamente.</p></div>))}
                            </div>
                          )}
                        </BentoItem>
                      )}
                    </div>
                  </SortableWidget>
                );
              })}
              
              {activeWidgets.length === 0 && (
                 <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center text-slate-600 dark:text-slate-400">
                    <Layers size={48} className="mb-4 opacity-50" />
                    <p>Colección vacía. ¡Agrega tus primeros widgets!</p>
                    <button onClick={() => setIsEditing(true)} className="text-emerald-500 font-bold hover:underline mt-2">Personalizar Ahora</button>
                 </div>
              )}
            </div>
          </SortableContext>
        </DndContext>

      </div>
    </div>
  );
}