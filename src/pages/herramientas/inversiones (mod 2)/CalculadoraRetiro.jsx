import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
  // Eliminado: ResponsiveContainer (Prohibido por Protocolo Titanium en este contexto)
} from 'recharts';
import { 
  Landmark, 
  TrendingUp, 
  DollarSign, 
  Percent,
  PiggyBank
  // Eliminados: Calendar, ArrowRight (No se usaban en el JSX)
} from 'lucide-react';
import { ToolLayout } from '../../../components/ToolLayout';

/**
 * Componente: Calculadora de Retiro / Interés Compuesto
 * Arquitectura: Principal Frontend Architect
 * Corrección: Named Export implementado para compatibilidad con App.jsx
 */
export const CalculadoraRetiro = () => {
  // --- STATE: Inputs del Usuario ---
  const [initialDeposit, setInitialDeposit] = useState(1000); // Depósito inicial
  const [monthlyContrib, setMonthlyContrib] = useState(200);  // Aporte mensual
  const [years, setYears] = useState(30);                     // Plazo
  const [annualRate, setAnnualRate] = useState(10);           // Tasa anual (SPY avg)

  // --- REFS: Protocolo Titanium (ResizeObserver) ---
  // Rationale: Calculamos dimensiones exactas para inyectar a Recharts y evitar glitches en Grids.
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });

    resizeObserver.observe(containerRef.current);
    
    // Cleanup para evitar memory leaks
    return () => resizeObserver.disconnect();
  }, []);

  // --- LOGIC: Cálculo de Proyección (Memoized) ---
  const projectionData = useMemo(() => {
    const data = [];
    let currentBalance = initialDeposit ?? 0; // Nullish Coalescing por seguridad
    let totalInvested = initialDeposit ?? 0;
    
    // Safety Net: Evitar loop infinito o crash si years/rate son inválidos
    const safeYears = Math.max(1, Math.min(years, 60)); 
    const safeRate = Math.max(0, annualRate);
    
    const monthlyRate = safeRate / 100 / 12;

    for (let year = 0; year <= safeYears; year++) {
      // Snapshot anual
      data.push({
        year: `Año ${year}`,
        balance: Math.round(currentBalance),
        invested: Math.round(totalInvested),
        interest: Math.round(currentBalance - totalInvested)
      });

      // Simulación mes a mes para el siguiente ciclo
      if (year < safeYears) {
        for (let month = 0; month < 12; month++) {
          currentBalance = (currentBalance + monthlyContrib) * (1 + monthlyRate);
          totalInvested += monthlyContrib;
        }
      }
    }
    return data;
  }, [initialDeposit, monthlyContrib, years, annualRate]);

  // --- METRICS ---
  const finalBalance = projectionData[projectionData.length - 1]?.balance ?? 0;
  const finalInvested = projectionData[projectionData.length - 1]?.invested ?? 0;
  const totalInterest = finalBalance - finalInvested;
  const multiplier = finalInvested > 0 ? (finalBalance / finalInvested).toFixed(1) : 0;

  // Formateador
  const formatUSD = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <ToolLayout
      title="Simulador de Jubilación"
      description="Descubre el poder del interés compuesto y proyecta tu libertad financiera."
      icon={Landmark}
      category="Inversiones"
    >
      {/* --- GRID PRINCIPAL --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* PANEL IZQUIERDO: Inputs (Col 4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-slate-100 mb-6 flex items-center gap-2">
              <ListFilterIcon className="w-5 h-5 text-emerald-400" /> Parámetros
            </h3>

            {/* Input: Inversión Inicial */}
            <div className="mb-5">
              <label className="text-sm font-medium text-slate-400 mb-2 block">Inversión Inicial (USD)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="number"
                  value={initialDeposit}
                  onChange={(e) => setInitialDeposit(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all tabular-nums"
                />
              </div>
            </div>

            {/* Input: Aporte Mensual */}
            <div className="mb-5">
              <label className="text-sm font-medium text-slate-400 mb-2 block">Aporte Mensual (USD)</label>
              <div className="relative">
                <PiggyBank className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="number"
                  value={monthlyContrib}
                  onChange={(e) => setMonthlyContrib(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all tabular-nums"
                />
              </div>
            </div>

            {/* Input: Años */}
            <div className="mb-5">
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-slate-400">Plazo de Inversión</label>
                <span className="text-sm font-bold text-emerald-400 tabular-nums">{years} Años</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="1"
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Input: Tasa Anual */}
            <div className="mb-2">
              <label className="text-sm font-medium text-slate-400 mb-2 block">Rendimiento Anual Estimado (%)</label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="number"
                  value={annualRate}
                  onChange={(e) => setAnnualRate(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all tabular-nums"
                />
              </div>
              <p className="text-xs text-slate-500 mt-2 ml-1">
                *Histórico S&P 500: ~10% anual promedio.
              </p>
            </div>
          </div>

          {/* KPI RESUMEN MOVIL */}
          <div className="bg-emerald-900/10 border border-emerald-500/20 p-5 rounded-xl">
             <div className="flex items-start gap-3">
                <TrendingUp className="w-6 h-6 text-emerald-400 mt-1" />
                <div>
                  <p className="text-slate-400 text-sm">Resultado Final</p>
                  <p className="text-2xl font-bold text-emerald-300 font-mono tabular-nums">{formatUSD(finalBalance)}</p>
                  <p className="text-xs text-emerald-400/70 mt-1">Multiplicador de capital: {multiplier}x</p>
                </div>
             </div>
          </div>
        </div>

        {/* PANEL DERECHO: Gráfico y Análisis (Col 8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* GRÁFICO (Titanium Protocol) */}
          <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl h-[450px] relative" ref={containerRef}>
             <h4 className="text-slate-300 font-medium mb-6 absolute top-6 left-6 z-10">Proyección Patrimonial</h4>
             
             {dimensions.width > 0 && (
              <AreaChart
                width={dimensions.width}
                height={dimensions.height - 40}
                data={projectionData}
                margin={{ top: 40, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis 
                  dataKey="year" 
                  stroke="#94a3b8" 
                  tick={{fontSize: 12}} 
                  minTickGap={30}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  tick={{fontSize: 12}}
                  tickFormatter={(val) => `$${val/1000}k`} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#e2e8f0' }}
                  formatter={(value) => [formatUSD(value), '']}
                />
                <Area 
                  type="monotone" 
                  dataKey="balance" 
                  name="Patrimonio Total"
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorBalance)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="invested" 
                  name="Tu Aporte (Bolsillo)"
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fillOpacity={1} 
                  fill="url(#colorInvested)" 
                />
              </AreaChart>
             )}
          </div>

          {/* ANÁLISIS COMPARATIVO (Cards Inferiores) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Card: Ahorro Simple */}
            <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl relative overflow-hidden">
               <div className="relative z-10">
                 <p className="text-slate-400 text-sm mb-1 flex items-center gap-2">
                   <PiggyBank className="w-4 h-4 text-blue-400" /> Ahorro sin Invertir
                 </p>
                 <p className="text-2xl font-bold text-blue-400 font-mono mb-3 tabular-nums">{formatUSD(finalInvested)}</p>
                 <p className="text-xs text-slate-400 leading-relaxed">
                   Si guardaras ${monthlyContrib} bajo el colchón todos los meses durante {years} años, tendrías exactamente esta cantidad. La inflación probablemente habría destruido su valor.
                 </p>
               </div>
            </div>

            {/* Card: Interés Compuesto */}
            <div className="bg-emerald-950/20 border border-emerald-900/50 p-6 rounded-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
               <div className="relative z-10">
                 <p className="text-emerald-400 text-sm mb-1 flex items-center gap-2">
                   <TrendingUp className="w-4 h-4" /> Con Interés Compuesto
                 </p>
                 <p className="text-2xl font-bold text-emerald-400 font-mono mb-3 tabular-nums">{formatUSD(finalBalance)}</p>
                 <p className="text-xs text-slate-300 leading-relaxed">
                   Gracias al <strong>Interés Compuesto</strong>, generaste <span className="text-emerald-300">{formatUSD(totalInterest)}</span> de ganancia pura. Tu dinero trabajó por vos.
                 </p>
               </div>
            </div>

          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

// Pequeño helper para icono local si ListFilter no está
const ListFilterIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M7 12h10"/><path d="M10 18h4"/></svg>
);