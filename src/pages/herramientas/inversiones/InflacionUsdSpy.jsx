import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  Calendar,
  Info
} from 'lucide-react';
import { ToolLayout } from '../../../components/ToolLayout';

// ============================================================================
// DATOS HISTÓRICOS (MOCK) - APROXIMACIÓN DE INFLACIÓN ACUMULADA USA & SPY
// ============================================================================
const HISTORICAL_DATA_FULL = [
  { year: 2000, inflationFactor: 1.00, spyFactor: 1.00 },
  { year: 2001, inflationFactor: 0.97, spyFactor: 0.88 },
  { year: 2002, inflationFactor: 0.95, spyFactor: 0.68 },
  { year: 2003, inflationFactor: 0.93, spyFactor: 0.87 },
  { year: 2004, inflationFactor: 0.90, spyFactor: 0.96 },
  { year: 2005, inflationFactor: 0.87, spyFactor: 1.00 },
  { year: 2006, inflationFactor: 0.84, spyFactor: 1.15 },
  { year: 2007, inflationFactor: 0.81, spyFactor: 1.21 },
  { year: 2008, inflationFactor: 0.78, spyFactor: 0.76 }, 
  { year: 2009, inflationFactor: 0.78, spyFactor: 0.96 },
  { year: 2010, inflationFactor: 0.76, spyFactor: 1.11 },
  { year: 2011, inflationFactor: 0.74, spyFactor: 1.13 },
  { year: 2012, inflationFactor: 0.72, spyFactor: 1.29 },
  { year: 2013, inflationFactor: 0.71, spyFactor: 1.68 },
  { year: 2014, inflationFactor: 0.70, spyFactor: 1.87 },
  { year: 2015, inflationFactor: 0.70, spyFactor: 1.85 },
  { year: 2016, inflationFactor: 0.69, spyFactor: 2.07 },
  { year: 2017, inflationFactor: 0.67, spyFactor: 2.52 },
  { year: 2018, inflationFactor: 0.65, spyFactor: 2.38 },
  { year: 2019, inflationFactor: 0.64, spyFactor: 3.13 },
  { year: 2020, inflationFactor: 0.63, spyFactor: 3.64 },
  { year: 2021, inflationFactor: 0.59, spyFactor: 4.63 },
  { year: 2022, inflationFactor: 0.55, spyFactor: 3.78 },
  { year: 2023, inflationFactor: 0.53, spyFactor: 4.77 },
  { year: 2024, inflationFactor: 0.51, spyFactor: 5.80 },
];

/**
 * Componente: Inflación USD vs SPY
 * Rol: Arquitecto Frontend - Implementación de Gráfico Resiliente
 */
export const InflacionUsdSpy = () => {
  // --- STATE ---
  const [amount, setAmount] = useState(100); 
  const [startYear, setStartYear] = useState(2000); 

  // --- REFS (Titanium Protocol: ResizeObserver) ---
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
    return () => resizeObserver.disconnect();
  }, []);

  // --- MEMO: DATA PROCESSING ---
  const chartData = useMemo(() => {
    const filtered = HISTORICAL_DATA_FULL.filter(d => d.year >= startYear);
    
    if (filtered.length === 0) return [];

    const baseInflation = filtered[0].inflationFactor;

    return filtered.map(item => {
      const relativeFactor = item.inflationFactor / baseInflation;
      return {
        year: item.year,
        value: amount * relativeFactor, 
        loss: amount - (amount * relativeFactor) 
      };
    });
  }, [amount, startYear]);

  // --- METRICS CALCULATION ---
  const currentVal = chartData[chartData.length - 1]?.value ?? 0;
  const lostVal = amount - currentVal;
  const lostPercentage = amount > 0 ? (lostVal / amount) * 100 : 0;
  
  // Cálculo SPY
  const spyStart = HISTORICAL_DATA_FULL.find(d => d.year === startYear)?.spyFactor ?? 1;
  const spyEnd = HISTORICAL_DATA_FULL[HISTORICAL_DATA_FULL.length - 1]?.spyFactor ?? 1;
  const spyGrowth = spyEnd / spyStart;
  const spyResult = amount * spyGrowth;

  return (
    <ToolLayout
      title="¿Por qué NO sirve guardar dólares?"
      description="Visualiza cómo la inflación de EE.UU. destruye tu poder de compra silenciosamente."
      icon={TrendingDown}
      category="Inversiones"
    >
      {/* --- CONTROL PANEL --- */}
      <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl mb-8 backdrop-blur-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          
          {/* Input: Cantidad */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> Cantidad Inicial (USD)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-4 py-3 text-lg font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
            />
          </div>

          {/* Selector: Periodo */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Periodo de análisis
            </label>
            <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700">
              {[2000, 2010, 2020].map((year) => (
                <button
                  key={year}
                  onClick={() => setStartYear(year)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    startYear === year
                      ? 'bg-slate-700 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {year}-2024
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* --- KPI HERO SECTION --- */}
      <div className="bg-rose-950/20 border border-rose-900/50 rounded-2xl p-6 mb-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <h3 className="text-rose-400 font-semibold mb-6 flex items-center gap-2 relative z-10">
          <TrendingDown className="w-5 h-5" /> Tu pérdida por guardar efectivo ({startYear}-2024)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          <div>
            <p className="text-slate-400 text-sm mb-1">Tenías:</p>
            <p className="text-3xl font-bold text-slate-100 font-mono">
              ${new Intl.NumberFormat('en-US').format(amount)}
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-1">Hoy vale (Poder de Compra):</p>
            <p className="text-3xl font-bold text-rose-300 font-mono">
              ${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(currentVal)}
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-1">Perdiste (Efecto Inflación):</p>
            <p className="text-3xl font-bold text-rose-500 font-mono flex items-center gap-2">
              -${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(lostVal)}
              <span className="text-lg bg-rose-500/10 px-2 py-1 rounded-lg">
                ({lostPercentage.toFixed(1)}%)
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* --- CHART SECTION (Titanium Protocol) --- */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 mb-8 h-[400px]" ref={containerRef}>
        <h4 className="text-slate-300 font-medium mb-4">Erosión del Poder de Compra</h4>
        
        {dimensions.width > 0 && (
          <AreaChart
            width={dimensions.width}
            height={dimensions.height - 50} 
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey="year" 
              stroke="#94a3b8" 
              tick={{ fontSize: 12 }} 
              tickMargin={10}
            />
            <YAxis 
              stroke="#94a3b8" 
              tick={{ fontSize: 12 }}
              tickFormatter={(val) => `$${val}`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#0f172a', 
                borderColor: '#334155', 
                borderRadius: '8px',
                color: '#f8fafc' 
              }}
              formatter={(value) => [`$${value.toFixed(2)}`, 'Poder de Compra']}
              labelStyle={{ color: '#94a3b8' }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#f43f5e" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorLoss)" 
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </AreaChart>
        )}
      </div>

      {/* --- INSIGHTS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* Card: La Cruda Realidad */}
        <div className="bg-rose-900/10 border border-rose-900/30 p-6 rounded-xl">
          <div className="flex items-center gap-2 mb-3 text-rose-400 font-semibold">
            <AlertTriangle className="w-5 h-5" />
            La cruda realidad
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            ${amount} dólares del año {startYear} hoy valen solo <strong className="text-rose-300">${currentVal.toFixed(0)}</strong>. 
            Perdiste <strong className="text-rose-300">{lostPercentage.toFixed(1)}%</strong> de tu poder de compra solo por guardar dólares "debajo del colchón" debido a la inflación acumulada de EE.UU.
          </p>
        </div>

        {/* Card: La Solución (SPY) */}
        <div className="bg-emerald-900/10 border border-emerald-900/30 p-6 rounded-xl">
          <div className="flex items-center gap-2 mb-3 text-emerald-400 font-semibold">
            <TrendingUp className="w-5 h-5" />
            La solución: Invertir
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            Esos mismos ${amount} invertidos en el S&P 500 (SPY) desde {startYear} hoy valdrían aproximadamente <strong className="text-emerald-300">${Math.round(spyResult)}</strong>. 
            No solo le ganaste a la inflación, sino que multiplicaste tu dinero por <strong className="text-emerald-300">{(spyResult/amount).toFixed(1)}x</strong>.
          </p>
        </div>
      </div>

      {/* --- CONCLUSION BOX --- */}
      <div className="bg-amber-950/20 border border-amber-900/40 p-5 rounded-xl flex gap-4">
        <Info className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
        <div>
          <h5 className="text-amber-500 font-semibold mb-2">Conclusión Clave</h5>
          <p className="text-slate-400 text-sm">
            Guardar dólares es una pérdida segura. La inflación de Estados Unidos (promedio histórico 2-3% anual, con picos recientes de 8%) hace que tu dinero valga menos cada año. 
            Por eso es fundamental invertir en activos productivos (Bonos, Acciones, Propiedades) que generen flujos de fondos superiores a la inflación.
          </p>
        </div>
      </div>
    </ToolLayout>
  );
};
