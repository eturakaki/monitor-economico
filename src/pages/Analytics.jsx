import React, { useMemo, useState, useEffect, useRef } from 'react'; 
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area, BarChart, Bar, Legend 
} from 'recharts';
import { 
  BrainCircuit, TrendingUp, Activity, DollarSign, Scale, AlertTriangle 
} from 'lucide-react';

/**
 * ============================================================================
 * 1. CONFIGURACIÓN REACTIVA (CSS VARIABLES STRATEGY)
 * ============================================================================
 * En lugar de colores fijos, usamos variables CSS que Recharts leerá del DOM.
 * Definimos los colores base aquí para las líneas (stroke/fill) que no cambian,
 * pero los textos y grillas usarán 'var(--chart-text)' definido en el JSX.
 */
const CHART_COLORS = {
  inflation: { stroke: '#f43f5e', fill: '#f43f5e' }, // Rose-500
  rate: { stroke: '#10b981', fill: '#10b981' },      // Emerald-500
  m2: { fill: '#3b82f6' },                            // Blue-500
  // Tooltip siempre oscuro para contraste estilo Bloomberg
  tooltipBg: '#0f172a',
  tooltipBorder: '#1e293b'
};

const generateHistoricalData = () => {
  return Array.from({ length: 12 }, (_, i) => ({
    name: `Mes ${i + 1}`,
    inflacion: Math.floor(Math.random() * 10) + 4,
    tasaInteres: Math.floor(Math.random() * 8) + 5,
    m2: Math.floor(Math.random() * 5000) + 20000 + (i * 1500), 
    reservas: 25000 + (Math.random() * 2000 - 1000),
  }));
};

/**
 * ============================================================================
 * 2. HOOKS (Titanium Protocol)
 * ============================================================================
 */
const useChartDimensions = () => {
  const ref = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!ref.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });
    resizeObserver.observe(ref.current);
    return () => resizeObserver.disconnect();
  }, []);

  return [ref, dimensions];
};

// ============================================================================
// 3. MICRO-COMPONENTES (UI High Contrast)
// ============================================================================
// eslint-disable-next-line no-unused-vars
const MetricCard = ({ title, value, change, isPositive, icon: Icon, description }) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-lg hover:border-slate-400 dark:hover:border-slate-700 transition-all duration-300 group">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-blue-500/10 group-hover:text-blue-500 transition-colors">
        <Icon size={20} strokeWidth={1.5} />
      </div>
      
      <span className={`text-xs font-bold px-2 py-1 rounded-full border tabular-nums ${
        isPositive 
          ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
          : 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
      }`}>
        {change > 0 ? '+' : ''}{change}%
      </span>
    </div>
    
    {/* FIX: text-slate-600 en Light Mode (más oscuro) vs slate-400 en Dark */}
    <h3 className="text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">
      {title}
    </h3>
    <div className="text-2xl font-black text-slate-900 dark:text-white mb-2 font-mono tabular-nums tracking-tight">
      {value}
    </div>
    <p className="text-xs text-slate-500 dark:text-slate-500 leading-relaxed">
      {description}
    </p>
  </div>
);

const AiInsight = () => (
  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-900 dark:to-[#0f1526] border border-indigo-200 dark:border-indigo-500/30 rounded-xl p-6 relative overflow-hidden shadow-sm">
    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
    <div className="flex items-center gap-3 mb-4 relative z-10">
      <div className="bg-indigo-600 text-white p-2 rounded-lg shadow-lg shadow-indigo-500/20">
        <BrainCircuit size={20} />
      </div>
      <h3 className="font-bold text-indigo-900 dark:text-indigo-200">MonitorEco AI Analysis</h3>
    </div>
    <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed relative z-10">
      <p>
        <strong className="text-indigo-700 dark:text-indigo-400">Divergencia Detectada:</strong> Mientras la base monetaria (M2) se expande, la inflación proyectada muestra una desaceleración técnica.
      </p>
      <p>
        <strong className="text-indigo-700 dark:text-indigo-400">Alerta de Carry Trade:</strong> La tasa real se mantiene positiva. Vigilando el <span className="font-mono font-bold mx-1 text-emerald-600 dark:text-emerald-400">CCL</span>.
      </p>
    </div>
  </div>
);

// ============================================================================
// 4. PÁGINA PRINCIPAL
// ============================================================================

const AnalyticsPage = () => {
  const data = useMemo(() => generateHistoricalData(), []);

  const m2Stats = useMemo(() => {
    if (!data || data.length < 2) return { current: 0, change: '0.0', isGrowing: false };
    const last = data[data.length - 1];
    const prev = data[data.length - 2];
    const change = ((last.m2 - prev.m2) / prev.m2) * 100;
    return { current: last.m2, change: change.toFixed(1), isGrowing: change > 0 };
  }, [data]);

  const [areaChartRef, areaDims] = useChartDimensions();
  const [barChartRef, barDims] = useChartDimensions();

  return (
    // INYECCIÓN DE VARIABLES CSS:
    // Definimos --chart-text y --chart-grid usando clases arbitrarias de Tailwind.
    // Light Mode: Texto Slate-600 (#475569) | Grid Slate-200 (#e2e8f0)
    // Dark Mode:  Texto Slate-400 (#94a3b8) | Grid Slate-700 (#334155)
    <div className="min-h-screen bg-slate-100 dark:bg-[#0B1121] p-4 lg:p-8 transition-colors duration-300 font-sans 
      [--chart-text:#475569] dark:[--chart-text:#94a3b8] 
      [--chart-grid:#e2e8f0] dark:[--chart-grid:#334155]"
    >
      
      {/* HEADER */}
      <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
          Analytics & Modelos IA
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl">
          Tablero de control macroeconómico. Simulaciones, correlaciones monetarias y análisis predictivo.
        </p>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard title="Velocidad del Dinero (V)" value="14.2x" change={-2.4} isPositive={true} icon={Activity} description="Rotación del circulante sobre PIB." />
        <MetricCard title="Tasa Real (Ex-Post)" value="+1.8%" change={0.5} isPositive={true} icon={Scale} description="Rendimiento plazo fijo vs inflación." />
        <MetricCard title="Cobertura M2/Reservas" value="$1,240" change={5.2} isPositive={false} icon={DollarSign} description="Tipo de cambio teórico de conversión." />
        <MetricCard title="Riesgo País (EMBI+)" value="1,420 bps" change={-12} isPositive={true} icon={AlertTriangle} description="Spread de bonos soberanos." />
      </div>

      {/* DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* === A. CHART PRINCIPAL === */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col h-[450px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-600 dark:text-emerald-400" />
              Dinámica Monetaria
            </h3>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs font-bold rounded-md bg-slate-900 text-white dark:bg-white dark:text-slate-900 transition-colors">1Y</button>
            </div>
          </div>

          <div ref={areaChartRef} className="flex-grow w-full relative">
            {areaDims.width > 0 && (
              <AreaChart 
                width={areaDims.width} 
                height={areaDims.height} 
                data={data}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorInflacion" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.inflation.stroke} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={CHART_COLORS.inflation.stroke} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTasa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.rate.stroke} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={CHART_COLORS.rate.stroke} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                {/* TRUCO MAGIA: fill='var(--chart-text)' 
                   Recharts leerá la variable CSS del contenedor padre.
                */}
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'var(--chart-text)', fontSize: 11, fontWeight: 500}} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'var(--chart-text)', fontSize: 11, fontWeight: 500}} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: CHART_COLORS.tooltipBg, borderColor: CHART_COLORS.tooltipBorder, color: '#f8fafc', borderRadius: '8px' }} 
                  itemStyle={{ color: '#e2e8f0', fontSize: '12px' }} 
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Area type="monotone" dataKey="inflacion" name="Inflación Mensual" stroke={CHART_COLORS.inflation.stroke} fillOpacity={1} fill="url(#colorInflacion)" strokeWidth={2} />
                <Area type="monotone" dataKey="tasaInteres" name="Tasa Interés (TEM)" stroke={CHART_COLORS.rate.stroke} fillOpacity={1} fill="url(#colorTasa)" strokeWidth={2} />
              </AreaChart>
            )}
          </div>
        </div>

        {/* === B. SIDEBAR === */}
        <div className="space-y-6 flex flex-col h-full">
          <AiInsight />

          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col flex-grow min-h-[250px]">
            <div className="mb-4">
              <h3 className="font-bold text-slate-800 dark:text-white mb-1 text-sm flex items-center gap-2">
                <DollarSign size={18} className="text-blue-500" />
                Base Monetaria (M2)
              </h3>
              <div className="flex items-end justify-between mt-2">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Total Circulante</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white font-mono tabular-nums tracking-tight">
                    ${(m2Stats.current / 1000).toFixed(2)}B
                  </p>
                </div>
                <div className={`text-right ${m2Stats.isGrowing ? 'text-rose-500' : 'text-emerald-500'}`}>
                  <span className="text-xs font-bold bg-rose-100 dark:bg-rose-500/10 px-2 py-1 rounded-md border border-rose-200 dark:border-rose-500/20 flex items-center gap-1">
                    <TrendingUp size={12} />
                    +{m2Stats.change}%
                  </span>
                </div>
              </div>
            </div>

            <div ref={barChartRef} className="flex-grow w-full relative mt-2">
               {barDims.width > 0 && (
                <BarChart width={barDims.width} height={barDims.height} data={data}>
                  <Tooltip 
                    cursor={{fill: 'var(--chart-grid)', opacity: 0.3}}
                    contentStyle={{ backgroundColor: CHART_COLORS.tooltipBg, borderColor: CHART_COLORS.tooltipBorder, borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                  />
                  <Bar dataKey="m2" name="Base Monetaria" fill={CHART_COLORS.m2.fill} radius={[4, 4, 0, 0]} />
                </BarChart>
               )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AnalyticsPage;