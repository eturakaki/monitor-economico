import React from 'react';
import { 
  TrendingUp, 
  Activity,
  ArrowUpRight
} from 'lucide-react';
import { ToolLayout } from '../../../components/ToolLayout';

// ============================================================================
// DATOS MOCK (Simulación de Mercado)
// ============================================================================
const TOP_ACCIONES = [
  { ticker: 'IRS2W', price: 3445.00, variation: 7.65 },
  { ticker: 'EDSH', price: 420.00, variation: 5.00 },
  { ticker: 'GRIM', price: 2770.00, variation: 4.52 },
  { ticker: 'CGPA2', price: 2695.00, variation: 3.45 },
  { ticker: 'AGRO', price: 57.80, variation: 3.21 },
  { ticker: 'COME', price: 51.60, variation: 3.20 },
];

const TOP_CEDEARS = [
  { ticker: 'ASTS', price: 11790.00, variation: 14.57 },
  { ticker: 'RIOT', price: 9440.00, variation: 9.95 },
  { ticker: 'NUC', price: 8.91, variation: 6.07 },
  { ticker: 'RKLB', price: 12170.00, variation: 5.73 },
  { ticker: 'FXIC', price: 9.08, variation: 5.58 },
  { ticker: 'MU', price: 108150.00, variation: 5.33 },
];

/**
 * Componente: Monitor de Mercado
 * Objetivo: Dashboard visual de cotizaciones en tiempo real.
 */
export const MonitorMercado = () => {
  return (
    <ToolLayout
      title="Monitor de Mercado"
      description="Tablero de cotizaciones en tiempo real. Acciones, CEDEARs y Bonos."
      icon={Activity}
      category="Inversiones"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Panel: Acciones */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          {/* Header Panel */}
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50 backdrop-blur-sm">
             <h3 className="font-bold text-white flex items-center gap-2">
               <Activity className="w-4 h-4 text-emerald-400" /> Mejores Acciones (Merval)
             </h3>
             <span className="text-[10px] text-emerald-400 bg-emerald-900/20 px-2 py-0.5 rounded border border-emerald-900/50 animate-pulse">
               EN VIVO
             </span>
          </div>
          
          {/* Lista de Acciones */}
          <div className="divide-y divide-slate-800/50">
             {TOP_ACCIONES.map((acc) => (
               <div key={acc.ticker} className="p-4 flex justify-between items-center hover:bg-slate-800/40 transition-colors group">
                  <div className="flex items-center gap-3">
                     <span className="bg-slate-800 text-slate-200 font-bold px-2 py-1 rounded text-xs w-14 text-center border border-slate-700 group-hover:border-emerald-500/50 group-hover:text-emerald-400 transition-colors">
                       {acc.ticker}
                     </span>
                  </div>
                  <div className="text-right">
                     <p className="text-white font-mono font-bold tracking-tight">${acc.price.toLocaleString('es-AR')}</p>
                     <p className="text-emerald-400 text-xs font-bold flex items-center justify-end gap-1">
                        <ArrowUpRight className="w-3 h-3" /> {acc.variation}%
                     </p>
                  </div>
               </div>
             ))}
          </div>
        </div>

        {/* Panel: CEDEARs */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          {/* Header Panel */}
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50 backdrop-blur-sm">
             <h3 className="font-bold text-white flex items-center gap-2">
               <TrendingUp className="w-4 h-4 text-blue-400" /> Mejores CEDEARs
             </h3>
             <span className="text-[10px] text-blue-400 bg-blue-900/20 px-2 py-0.5 rounded border border-blue-900/50 animate-pulse">
               EN VIVO
             </span>
          </div>
          
          {/* Lista de CEDEARs */}
          <div className="divide-y divide-slate-800/50">
             {TOP_CEDEARS.map((ced) => (
               <div key={ced.ticker} className="p-4 flex justify-between items-center hover:bg-slate-800/40 transition-colors group">
                  <div className="flex items-center gap-3">
                     <span className="bg-slate-800 text-slate-200 font-bold px-2 py-1 rounded text-xs w-14 text-center border border-slate-700 group-hover:border-blue-500/50 group-hover:text-blue-400 transition-colors">
                       {ced.ticker}
                     </span>
                  </div>
                  <div className="text-right">
                     <p className="text-white font-mono font-bold tracking-tight">${ced.price.toLocaleString('es-AR')}</p>
                     <p className="text-emerald-400 text-xs font-bold flex items-center justify-end gap-1">
                        <ArrowUpRight className="w-3 h-3" /> {ced.variation}%
                     </p>
                  </div>
               </div>
             ))}
          </div>
        </div>

      </div>
      
      {/* Banner de Disclaimer */}
      <div className="mt-6 p-4 bg-slate-800/30 rounded-xl border border-slate-700 flex justify-center text-center">
         <p className="text-slate-500 text-xs">
           * Los datos mostrados tienen un delay de 20 minutos. (Fuente: Mercado Simulado para MonitorEco).
         </p>
      </div>
    </ToolLayout>
  );
};