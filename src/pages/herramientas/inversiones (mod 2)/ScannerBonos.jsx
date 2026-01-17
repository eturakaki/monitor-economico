import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ArrowUpDown, 
  ListFilter,
  Download
} from 'lucide-react';
import { ToolLayout } from '../../../components/ToolLayout';

// ============================================================================
// DATOS MOCK
// ============================================================================
const BOND_DATA = [
  { ticker: 'AL30', name: 'Bono Rep. Arg. USD 2030', type: 'Bono', ley: 'ARG', vencimiento: '2030-07-09', tasa: 0.75, paridad: 58.5, tir: 18.2, precio: 58.50 },
  { ticker: 'GD30', name: 'Global Rep. Arg. USD 2030', type: 'Bono', ley: 'NY', vencimiento: '2030-07-09', tasa: 0.75, paridad: 62.1, tir: 16.5, precio: 62.10 },
  { ticker: 'AE38', name: 'Bono Rep. Arg. USD 2038', type: 'Bono', ley: 'ARG', vencimiento: '2038-01-09', tasa: 4.25, paridad: 52.3, tir: 19.1, precio: 52.30 },
  { ticker: 'YMCQO', name: 'YPF Clase XX', type: 'ON', ley: 'NY', vencimiento: '2026-02-12', tasa: 8.50, paridad: 99.8, tir: 8.5, precio: 99.80 },
  { ticker: 'CS38O', name: 'Cresud Clase 38', type: 'ON', ley: 'ARG', vencimiento: '2026-01-03', tasa: 8.00, paridad: 101.2, tir: 7.2, precio: 101.20 },
  { ticker: 'T13F6', name: 'BONCAP Feb 26', type: 'BONCAP', ley: 'ARG', vencimiento: '2026-02-13', tasa: 0.00, paridad: 105.0, tir: 45.2, precio: 1.41 },
  { ticker: 'MRCAO', name: 'Genneia Clase 35', type: 'ON', ley: 'ARG', vencimiento: '2025-11-15', tasa: 6.50, paridad: 98.5, tir: 9.1, precio: 98.50 },
];

// ✅ CORRECCIÓN: Componente auxiliar definido AFUERA del componente principal
const SortIcon = ({ colKey, sortConfig }) => {
  if (sortConfig.key !== colKey) return <ArrowUpDown className="inline w-3 h-3 ml-1 opacity-30" />;
  return <ArrowUpDown className={`inline w-3 h-3 ml-1 ${sortConfig.direction === 'asc' ? 'text-emerald-400 rotate-180' : 'text-emerald-400'}`} />;
};

/**
 * Componente: Scanner de Bonos y ONs
 */
export const ScannerBonos = () => {
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'tir', direction: 'desc' });

  // Lógica de Filtrado y Ordenamiento
  const filteredData = useMemo(() => {
    let sortableItems = [...BOND_DATA];
    
    // 1. Filtrar
    if (search) {
      sortableItems = sortableItems.filter(item => 
        item.ticker.toLowerCase().includes(search.toLowerCase()) ||
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // 2. Ordenar
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [search, sortConfig]);

  // Handler para clicks en columnas
  const requestSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <ToolLayout
      title="Scanner de Bonos y ONs"
      description="Herramienta profesional de renta fija. Analiza TIR, Paridad y Vencimientos."
      icon={ListFilter}
      category="Inversiones"
    >
      {/* --- CONTROL BAR --- */}
      <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl mb-6 flex flex-col md:flex-row gap-4 justify-between items-center backdrop-blur-sm">
        
        {/* Buscador */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Buscar por Ticker (AL30, YPF...)" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none placeholder:text-slate-600"
          />
        </div>

        {/* Acciones */}
        <div className="flex gap-2">
           <button className="flex items-center gap-2 px-3 py-2 text-xs font-bold bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 border border-slate-600 transition-colors">
             <Download className="w-3 h-3" /> Exportar CSV
           </button>
        </div>
      </div>

      {/* --- TABLA DE DATOS --- */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-950 text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-800">
                <th className="p-4 font-bold cursor-pointer hover:text-white transition-colors" onClick={() => requestSort('ticker')}>
                  Ticker <SortIcon colKey="ticker" sortConfig={sortConfig} />
                </th>
                <th className="p-4 hidden md:table-cell">Descripción</th>
                <th className="p-4 cursor-pointer hover:text-white transition-colors" onClick={() => requestSort('type')}>
                  Tipo <SortIcon colKey="type" sortConfig={sortConfig} />
                </th>
                <th className="p-4">Ley</th>
                <th className="p-4 cursor-pointer hover:text-white transition-colors" onClick={() => requestSort('vencimiento')}>
                  Vencimiento <SortIcon colKey="vencimiento" sortConfig={sortConfig} />
                </th>
                <th className="p-4 text-right">Tasa (Cupón)</th>
                <th className="p-4 text-right cursor-pointer hover:text-white transition-colors" onClick={() => requestSort('precio')}>
                  Precio <SortIcon colKey="precio" sortConfig={sortConfig} />
                </th>
                <th className="p-4 text-right cursor-pointer hover:text-white transition-colors" onClick={() => requestSort('paridad')}>
                  Paridad % <SortIcon colKey="paridad" sortConfig={sortConfig} />
                </th>
                <th className="p-4 text-right cursor-pointer hover:text-emerald-400 text-emerald-500 transition-colors" onClick={() => requestSort('tir')}>
                  TIR Anual <SortIcon colKey="tir" sortConfig={sortConfig} />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm text-slate-300">
              {filteredData.map((bono) => (
                <tr key={bono.ticker} className="hover:bg-slate-800/50 transition-colors group">
                  <td className="p-4 font-bold text-white font-mono group-hover:text-emerald-400 transition-colors">{bono.ticker}</td>
                  <td className="p-4 hidden md:table-cell text-xs text-slate-500">{bono.name}</td>
                  <td className="p-4">
                    <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${
                      bono.type === 'ON' ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' : 
                      bono.type === 'BONCAP' ? 'border-purple-500/30 text-purple-400 bg-purple-500/10' :
                      'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                    }`}>
                      {bono.type}
                    </span>
                  </td>
                  <td className="p-4 text-xs font-mono">{bono.ley}</td>
                  <td className="p-4 font-mono text-xs text-slate-400">{bono.vencimiento}</td>
                  <td className="p-4 text-right font-mono text-xs">{bono.tasa}%</td>
                  <td className="p-4 text-right font-mono text-slate-200">${bono.precio}</td>
                  <td className="p-4 text-right font-mono">{bono.paridad}%</td>
                  <td className="p-4 text-right font-mono font-bold text-emerald-400 bg-emerald-900/10">{bono.tir}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredData.length === 0 && (
           <div className="p-8 text-center text-slate-500">
              No se encontraron activos con ese nombre.
           </div>
        )}
      </div>
    </ToolLayout>
  );
};