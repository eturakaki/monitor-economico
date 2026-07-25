import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Search, 
  Info
} from 'lucide-react';
// CORRECCIÓN AQUÍ: Agregamos llaves { }
import { ToolLayout } from '../../../components/ToolLayout';

// ============================================================================
// DATOS MOCK: CEDEARS Y CRONOGRAMAS DE PAGO
// ============================================================================
const DIVIDEND_DATA = [
  { ticker: 'SPY', name: 'S&P 500 ETF', yield: 1.3, months: [2, 5, 8, 11] }, 
  { ticker: 'QQQ', name: 'Nasdaq 100 ETF', yield: 0.6, months: [2, 5, 8, 11] },
  { ticker: 'KO', name: 'Coca-Cola', yield: 3.1, months: [3, 6, 9, 11] }, 
  { ticker: 'JNJ', name: 'Johnson & Johnson', yield: 2.9, months: [2, 5, 8, 11] },
  { ticker: 'AAPL', name: 'Apple Inc.', yield: 0.5, months: [1, 4, 7, 10] }, 
  { ticker: 'O', name: 'Realty Income', yield: 5.5, months: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] }, 
  { ticker: 'XOM', name: 'Exxon Mobil', yield: 3.3, months: [2, 5, 8, 11] },
  { ticker: 'MSFT', name: 'Microsoft', yield: 0.7, months: [2, 5, 8, 11] },
  { ticker: 'PG', name: 'Procter & Gamble', yield: 2.4, months: [1, 4, 7, 10] },
  { ticker: 'JPM', name: 'JPMorgan Chase', yield: 2.1, months: [0, 3, 6, 9] }, 
  { ticker: 'VZ', name: 'Verizon', yield: 6.5, months: [1, 4, 7, 10] },
];

const MONTHS_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

/**
 * Componente: Calendario de Dividendos
 * Objetivo: Visualizar flujo de ingresos pasivos por CEDEARs.
 */
export const CalendarioDividendos = () => {
  // --- STATE ---
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'current'
  const [searchTerm, setSearchTerm] = useState('');
  
  // Obtenemos el mes actual real (0-11)
  const currentMonthIndex = new Date().getMonth();

  // --- LOGIC: Filtering ---
  const filteredData = useMemo(() => {
    return DIVIDEND_DATA.filter(item => {
      // 1. Filtro de Texto
      const matchesSearch = 
        item.ticker.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase());

      // 2. Filtro de Mes
      const matchesMonth = filterMode === 'current' 
        ? item.months.includes(currentMonthIndex)
        : true;

      return matchesSearch && matchesMonth;
    }).sort((a, b) => b.yield - a.yield);
  }, [searchTerm, filterMode, currentMonthIndex]);

  return (
    <ToolLayout
      title="Calendario de Dividendos"
      description="Arma tu cartera de ingresos pasivos. Conoce las fechas de pago y rendimientos de CEDEARs."
      icon={Calendar}
      category="Inversiones"
    >
      {/* --- CONTROL BAR --- */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-end md:items-center bg-slate-800/50 p-4 rounded-xl border border-slate-700 backdrop-blur-sm">
        
        {/* Toggle */}
        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700">
          <button
            onClick={() => setFilterMode('current')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
              filterMode === 'current'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Mes Actual ({MONTHS_LABELS[currentMonthIndex]})
          </button>
          <button
            onClick={() => setFilterMode('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              filterMode === 'all'
                ? 'bg-slate-700 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Todos los meses
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text"
            placeholder="Buscar Ticker (ej: KO)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>
      </div>

      {/* --- DATA GRID --- */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {/* Header */}
        <div className="grid grid-cols-12 gap-4 p-4 bg-slate-950/80 border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <div className="col-span-4 md:col-span-3">Empresa / Ticker</div>
          <div className="col-span-3 md:col-span-2 text-right md:text-left">Yield (Anual)</div>
          <div className="hidden md:block md:col-span-7">Cronograma de Pagos</div>
        </div>

        {/* Filas */}
        <div className="divide-y divide-slate-800">
          {filteredData.length > 0 ? (
            filteredData.map((asset) => (
              <div key={asset.ticker} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-800/30 transition-colors group">
                
                {/* Info Empresa */}
                <div className="col-span-4 md:col-span-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300 border border-slate-700">
                      {asset.ticker[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-white flex items-center gap-2">
                        {asset.ticker}
                        <span className="md:hidden text-[10px] bg-slate-800 px-1 rounded text-slate-400">CEDEAR</span>
                      </h4>
                      <p className="text-xs text-slate-500 truncate max-w-[120px]">{asset.name}</p>
                    </div>
                  </div>
                </div>

                {/* Yield */}
                <div className="col-span-3 md:col-span-2 flex items-center justify-end md:justify-start">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    asset.yield > 4 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : asset.yield > 2 
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {asset.yield.toFixed(1)}%
                  </div>
                </div>

                {/* Grilla Meses Desktop */}
                <div className="hidden md:grid col-span-7 grid-cols-12 gap-1">
                  {MONTHS_LABELS.map((mes, idx) => {
                    const isPaying = asset.months.includes(idx);
                    const isCurrent = idx === currentMonthIndex;
                    
                    return (
                      <div 
                        key={idx}
                        className={`
                          text-[10px] font-mono py-2 rounded flex items-center justify-center border transition-all
                          ${isPaying 
                            ? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_10px_rgba(37,99,235,0.3)] font-bold' 
                            : 'bg-slate-900/50 text-slate-600 border-transparent'
                          }
                          ${isCurrent && !isPaying ? 'border-slate-500 text-slate-400' : ''}
                          ${isCurrent && isPaying ? 'ring-2 ring-white ring-offset-1 ring-offset-slate-900' : ''}
                        `}
                      >
                        {mes}
                      </div>
                    );
                  })}
                </div>

                {/* Vista Móvil */}
                <div className="md:hidden col-span-5 flex flex-wrap gap-1 justify-end">
                   {asset.months
                      .filter(m => m >= currentMonthIndex)
                      .slice(0, 2)
                      .map(m => (
                        <span key={m} className="text-[10px] bg-blue-900/30 text-blue-300 px-1.5 py-0.5 rounded border border-blue-800">
                           {MONTHS_LABELS[m]}
                        </span>
                      ))
                   }
                </div>

              </div>
            ))
          ) : (
            <div className="p-12 text-center text-slate-500">
              <p>No se encontraron empresas con esos criterios.</p>
            </div>
          )}
        </div>
      </div>

      {/* --- INFO BOX --- */}
      <div className="mt-6 flex gap-4 bg-indigo-900/10 border border-indigo-900/30 p-4 rounded-xl">
        <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h5 className="text-sm font-bold text-indigo-400">Estrategia de Dividendos</h5>
          <p className="text-xs text-slate-400 leading-relaxed">
            Combinando empresas que pagan en diferentes meses (ej: <strong>KO</strong> paga en Abr/Jul/Oct/Dic y <strong>MO</strong> en Ene/Abr/Jul/Oct) podés armar un flujo de ingresos mensual constante.
          </p>
        </div>
      </div>

    </ToolLayout>
  );
};