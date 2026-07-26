import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  AreaChart, Area, BarChart, Bar, Legend, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip 
} from 'recharts';
import { 
  BrainCircuit, TrendingUp, Activity, DollarSign, Scale, AlertTriangle, Lock, Download 
} from 'lucide-react';
import { toast } from 'sonner';

// [FIX] Importamos desde hooks
import { useAuth } from '../hooks/useAuth'; 

// --- CONFIGURACIÓN DE ESTILOS ---
const CHART_COLORS = {
  inflation: { stroke: '#f43f5e', fill: '#f43f5e' },
  rate: { stroke: '#10b981', fill: '#10b981' },
  m2: { fill: '#3b82f6' },
  tooltipBg: '#0f172a',
  tooltipBorder: '#1e293b'
};

// Generador de datos simulados
const generateHistoricalData = (months = 24) => {
  return Array.from({ length: months }, (_, i) => ({
    name: `Mes ${i + 1}`,
    inflacion: Math.floor(Math.random() * 10) + 4,
    tasaInteres: Math.floor(Math.random() * 8) + 5,
    m2: Math.floor(Math.random() * 5000) + 20000 + (i * 1500), 
    reservas: 25000 + (Math.random() * 2000 - 1000),
  }));
};

// [FIX LINTER] "Body Assignment Pattern"
// En lugar de renombrar en los argumentos ({ icon: Icon }), recibimos 'icon'
// y lo asignamos dentro. Esto elimina el falso positivo de "defined but never used".
const MetricCard = ({ title, value, change, isPositive, icon, description }) => {
  const Icon = icon; // Asignación explícita para que React lo renderice como componente

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
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
      <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{title}</h3>
      <div className="text-2xl font-black text-slate-900 dark:text-white mb-2 font-mono tabular-nums">{value}</div>
      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
};

// --- COMPONENTE: AI INSIGHTS ---
const AiInsight = ({ isPremium }) => (
  <div className="relative overflow-hidden rounded-xl border border-indigo-200 dark:border-indigo-500/30 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-900 dark:to-[#0f1526] p-6 shadow-md">
    <div className={!isPremium ? 'blur-sm select-none opacity-50' : ''}>
        <div className="flex items-center gap-3 mb-4">
        <div className="bg-indigo-600 text-white p-2 rounded-lg shadow-lg shadow-indigo-500/20">
            <BrainCircuit size={20} />
        </div>
        <h3 className="font-bold text-indigo-900 dark:text-indigo-200">MonitorEco AI Analysis</h3>
        </div>
        <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        <p><strong className="text-indigo-700 dark:text-indigo-400">Divergencia Detectada:</strong> Mientras la base monetaria (M2) se expande, la inflación proyectada desacelera.</p>
        <p><strong className="text-indigo-700 dark:text-indigo-400">Alerta de Carry Trade:</strong> La tasa real positiva sugiere entrada de capitales de corto plazo. <span className="font-mono font-bold mx-1 text-emerald-600">Recomendación:</span> Mantener posiciones en pesos indexados.</p>
        </div>
    </div>

    {!isPremium && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/30 dark:bg-slate-900/40 backdrop-blur-[2px]">
            <Lock className="w-8 h-8 text-slate-900 dark:text-white mb-2" />
            <p className="text-sm font-bold text-slate-900 dark:text-white mb-3">Análisis exclusivo Pro</p>
            <Link to="/planes" className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-lg hover:scale-105 transition-transform">
                Desbloquear IA
            </Link>
        </div>
    )}
  </div>
);

// --- PÁGINA PRINCIPAL ---
const AnalyticsPage = () => {
  const { isPremium } = useAuth();
  
  const fullData = useMemo(() => generateHistoricalData(24), []);
  
  const displayedData = useMemo(() => {
    return isPremium ? fullData : fullData.slice(-6); 
  }, [isPremium, fullData]);

  const m2Stats = useMemo(() => {
    const last = displayedData[displayedData.length - 1];
    const prev = displayedData[displayedData.length - 2];
    const change = ((last.m2 - prev.m2) / prev.m2) * 100;
    return { current: last.m2, change: change.toFixed(1), isGrowing: change > 0 };
  }, [displayedData]);

  const handleExport = () => {
    if (!isPremium) {
        toast.error('Función Premium', {
            description: 'Necesitas un plan Profesional para exportar datos históricos en CSV.',
            action: {
                label: 'Ver Planes',
                onClick: () => window.location.href = '/planes'
            }
        });
        return;
    }
    toast.success('Descarga iniciada', { description: 'El archivo CSV se está generando...' });
  };

  return (
    <div className="min-h-screen bg-slate-200 dark:bg-[#0B1121] p-4 lg:p-8 font-sans [--chart-text:#64748b] dark:[--chart-text:#94a3b8] [--chart-grid:#e2e8f0] dark:[--chart-grid:#334155]">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-1">
            Analytics & Modelos IA
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
            {!isPremium ? 'Vista limitada (Últimos 6 meses). Pásate a Pro para ver el histórico completo.' : 'Acceso completo a series históricas y modelos predictivos.'}
            </p>
        </div>

        <div className="flex gap-2">
            <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1">
                {['6M', '1Y', 'YTD', 'ALL'].map((range) => (
                    <button 
                        key={range}
                        disabled={!isPremium && range !== '6M'}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                            range === '6M' && !isPremium 
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' 
                                : isPremium && range === 'ALL'
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed'
                        }`}
                    >
                        {range} {(!isPremium && range !== '6M') && <Lock size={10} className="inline ml-0.5 mb-0.5" />}
                    </button>
                ))}
            </div>

            <button 
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500/50 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-lg transition-all"
            >
                <Download size={16} />
                <span className="hidden sm:inline">Exportar CSV</span>
            </button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard title="Velocidad del Dinero" value="14.2x" change={-2.4} isPositive={true} icon={Activity} description="Rotación del circulante sobre PIB." />
        <MetricCard title="Tasa Real (Ex-Post)" value="+1.8%" change={0.5} isPositive={true} icon={Scale} description="Rendimiento plazo fijo vs inflación." />
        <MetricCard title="Cobertura M2" value="$1,240" change={5.2} isPositive={false} icon={DollarSign} description="Tipo de cambio teórico de conversión." />
        <MetricCard title="Riesgo País" value="1,420" change={-12} isPositive={true} icon={AlertTriangle} description="Spread de bonos soberanos (bps)." />
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* CHART PRINCIPAL */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-6 shadow-md flex flex-col h-[450px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-600" />
              Dinámica Monetaria
            </h3>
            {!isPremium && (
                <span className="text-xs font-bold text-amber-500 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                    <Lock size={12} /> Modo Demo
                </span>
            )}
          </div>

          <div className="flex-grow w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displayedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--chart-text)', fontSize: 11}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--chart-text)', fontSize: 11}} />
                <Tooltip contentStyle={{ backgroundColor: CHART_COLORS.tooltipBg, borderColor: CHART_COLORS.tooltipBorder, color: '#f8fafc', borderRadius: '8px' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Area type="monotone" dataKey="inflacion" name="Inflación" stroke={CHART_COLORS.inflation.stroke} fillOpacity={1} fill="url(#colorInflacion)" strokeWidth={2} />
                <Area type="monotone" dataKey="tasaInteres" name="Tasa (TEM)" stroke={CHART_COLORS.rate.stroke} fillOpacity={1} fill="url(#colorTasa)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SIDEBAR CON IA Y BAR CHART */}
        <div className="space-y-6 flex flex-col h-full">
          <AiInsight isPremium={isPremium} />

          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-6 shadow-md flex flex-col flex-grow min-h-[250px]">
            <div className="mb-4">
              <h3 className="font-bold text-slate-800 dark:text-white mb-1 text-sm flex items-center gap-2">
                <DollarSign size={18} className="text-blue-500" />
                Base Monetaria (M2)
              </h3>
              <div className="flex items-end justify-between mt-2">
                <div>
                  <p className="text-xs text-slate-500">Circulante Total</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white font-mono tabular-nums">
                    ${(m2Stats.current / 1000).toFixed(2)}B
                  </p>
                </div>
                <div className={`text-right ${m2Stats.isGrowing ? 'text-rose-500' : 'text-emerald-500'}`}>
                  <span className="text-xs font-bold bg-rose-100 dark:bg-rose-500/10 px-2 py-1 rounded border border-rose-200 dark:border-rose-500/20 flex items-center gap-1">
                    <TrendingUp size={12} /> +{m2Stats.change}%
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-grow w-full min-h-0">
               <ResponsiveContainer width="100%" height="100%">
                <BarChart data={displayedData.slice(-6)}> 
                  <Tooltip cursor={{fill: 'var(--chart-grid)', opacity: 0.3}} contentStyle={{ backgroundColor: CHART_COLORS.tooltipBg, borderRadius: '8px', fontSize: '12px', color: '#fff' }} />
                  <Bar dataKey="m2" name="M2" fill={CHART_COLORS.m2.fill} radius={[4, 4, 0, 0]} />
                </BarChart>
               </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AnalyticsPage;