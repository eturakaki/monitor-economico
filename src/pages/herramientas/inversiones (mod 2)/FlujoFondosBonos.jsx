import React, { useState, useMemo } from 'react';
import { 
  CalendarCheck, 
  Filter, 
  Info,
  ChevronRight
} from 'lucide-react';
// ✅ CORRECCIÓN 1: Import con llaves
import { ToolLayout } from '../../../components/ToolLayout';

// ============================================================================
// DATOS MOCK
// ============================================================================
const PAYMENT_EVENTS = [
  { ticker: 'CS38O', type: 'ON', date: '2026-01-03', event: 'Renta', amount: 3.50 },
  { ticker: 'AE38', type: 'Bono', date: '2026-01-09', event: 'Renta', amount: 2.15 },
  { ticker: 'AL30', type: 'Bono', date: '2026-01-09', event: 'Amortización + Renta', amount: 4.00 },
  { ticker: 'GD30', type: 'Bono', date: '2026-01-09', event: 'Renta', amount: 0.50 },
  { ticker: 'ARC1O', type: 'ON', date: '2026-02-01', event: 'Renta', amount: 2.25 },
  { ticker: 'T13F6', type: 'BONCAP', date: '2026-02-13', event: 'Vencimiento', amount: 105.00 },
  { ticker: 'CS49O', type: 'ON', date: '2026-03-02', event: 'Renta', amount: 2.00 },
  { ticker: 'TTM26', type: 'Bono Dual', date: '2026-03-12', event: 'Vencimiento', amount: 100.00 },
];

const MONTHS = [
  { id: 0, name: 'Enero' },
  { id: 1, name: 'Febrero' },
  { id: 2, name: 'Marzo' }
];

// ✅ CORRECCIÓN 2: Exportación Nombrada (sin default)
export const FlujoFondosBonos = () => {
  const [filters, setFilters] = useState({ bonos: true, ons: true, lecaps: true });

  const toggleFilter = (key) => setFilters(prev => ({ ...prev, [key]: !prev[key] }));

  const filteredEvents = useMemo(() => {
    return PAYMENT_EVENTS.filter(ev => {
      if (ev.type === 'Bono' && !filters.bonos) return false;
      if (ev.type === 'Bono Dual' && !filters.bonos) return false;
      if (ev.type === 'ON' && !filters.ons) return false;
      if ((ev.type === 'LECAP' || ev.type === 'BONCAP') && !filters.lecaps) return false;
      return true;
    });
  }, [filters]);

  const eventsByMonth = (monthIndex) => filteredEvents.filter(ev => new Date(ev.date).getMonth() === monthIndex);

  const getTypeStyle = (type) => {
    switch (type) {
      case 'ON': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Bono': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Bono Dual': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'BONCAP': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <ToolLayout
      title="Calendario de Pagos 2026"
      description="Cronograma mensual de cobro de cupones y amortizaciones de tu cartera."
      icon={CalendarCheck}
      category="Inversiones"
    >
      <div className="flex flex-wrap gap-4 mb-8 items-center bg-slate-800/50 p-4 rounded-xl border border-slate-700 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-slate-400 text-sm font-bold uppercase mr-4">
          <Filter className="w-4 h-4" /> Filtrar:
        </div>
        <FilterButton label="Bonos" active={filters.bonos} onClick={() => toggleFilter('bonos')} colorClass="bg-emerald-500" />
        <FilterButton label="ONs" active={filters.ons} onClick={() => toggleFilter('ons')} colorClass="bg-blue-500" />
        <FilterButton label="LECAPs" active={filters.lecaps} onClick={() => toggleFilter('lecaps')} colorClass="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MONTHS.map((month) => {
          const events = eventsByMonth(month.id);
          return (
            <div key={month.id} className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-full">
              <div className="bg-slate-950/80 p-4 border-b border-slate-800 flex justify-between items-center">
                <h3 className="font-bold text-slate-100">{month.name}</h3>
                <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded-full">{events.length} Eventos</span>
              </div>
              <div className="p-2 flex-1 space-y-2">
                {events.length > 0 ? (
                  events.map((ev, idx) => (
                    <div key={idx} className="bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 rounded-xl p-3 transition-colors group">
                      <div className="flex justify-between items-start mb-2">
                         <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm bg-slate-700 px-1.5 rounded">{new Date(ev.date).getDate()}</span>
                            <span className="font-bold text-slate-200">{ev.ticker}</span>
                         </div>
                         <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${getTypeStyle(ev.type)}`}>{ev.type}</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <p className="text-xs text-slate-400">{ev.event}</p>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs text-emerald-400 cursor-pointer">
                           Ver detalle <ChevronRight className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-32 flex items-center justify-center text-slate-600 text-sm italic">Sin cobros</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </ToolLayout>
  );
};

const FilterButton = ({ label, active, onClick, colorClass }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
      active ? `${colorClass} text-white border-transparent shadow-lg` : 'bg-slate-900 text-slate-500 border-slate-700 hover:text-slate-300'
    }`}
  >
    <div className={`w-2 h-2 rounded-full ${active ? 'bg-white' : colorClass}`} />
    {label}
  </button>
);