/**
 * ============================================================================
 * ARCHIVO: Analytics.jsx
 * ============================================================================
 * * DESCRIPCIÓN:
 * Dashboard de Inteligencia Financiera.
 * * * CAMBIOS RECIENTES (v2.0):
 * - Mejora del módulo "Base Monetaria". Ahora calcula automáticamente la
 * variación intermensual (MoM) y muestra el total circulante.
 * - Se optimizó el espacio visual en la columna lateral derecha.
 * - Comentarios educativos sobre "Derived State" (Estado Derivado).
 */

import React, { useMemo } from 'react'; 

// --- LIBRERÍAS EXTERNAS (Charts & Icons) ---
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar, Legend, Cell 
} from 'recharts';

import { 
  BrainCircuit, TrendingUp, TrendingDown, Activity, DollarSign, Scale, AlertTriangle 
} from 'lucide-react';

/**
 * --- 1. GENERADOR DE DATOS (MOCKUP) ---
 * Simula la respuesta de una API Backend.
 */
const generateHistoricalData = () => {
  const data = [];
  for (let i = 0; i < 12; i++) {
    const month = `Mes ${i + 1}`;
    data.push({
      name: month,
      inflacion: Math.floor(Math.random() * 10) + 4,
      tasaInteres: Math.floor(Math.random() * 8) + 5,
      // M2 (Base Monetaria) crece progresivamente para simular inflación monetaria
      m2: Math.floor(Math.random() * 5000) + 20000 + (i * 1500), 
      reservas: 25000 + (Math.random() * 2000 - 1000),
    });
  }
  return data;
};

// ============================================================================
// COMPONENTES DE UI (Micro-Componentes)
// ============================================================================

/**
 * KPI CARD (Tarjeta de Métricas Superiores)
 * Muestra un indicador clave con su variación.
 */
const MetricCard = ({ title, value, change, isPositive, icon, description }) => {
  const IconComponent = icon; // Asignamos a Mayúscula para renderizar

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group">
      
      <div className="flex justify-between items-start mb-4">
        {/* Icono con efecto hover */}
        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-blue-500/10 group-hover:text-blue-500 transition-colors">
          <IconComponent size={20} />
        </div>
        
        {/* Badge de Variación % */}
        <span className={`text-xs font-bold px-2 py-1 rounded-full border ${
          isPositive 
            ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
            : 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
        }`}>
          {change > 0 ? '+' : ''}{change}%
        </span>
      </div>
      
      <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1 uppercase tracking-wider">
        {title}
      </h3>
      <div className="text-2xl font-black text-slate-900 dark:text-white mb-2 font-mono tracking-tight">
        {value}
      </div>
      <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
        {description}
      </p>
    </div>
  );
};

/**
 * PANEL IA (Simulación de Análisis)
 * Componente visual puramente estético por ahora.
 */
const AiInsight = () => (
  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-900 dark:to-slate-900 border border-indigo-200 dark:border-indigo-500/30 rounded-xl p-6 relative overflow-hidden">
    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
    
    <div className="flex items-center gap-3 mb-4">
      <div className="bg-indigo-600 text-white p-2 rounded-lg shadow-lg shadow-indigo-500/20">
        <BrainCircuit size={20} />
      </div>
      <h3 className="font-bold text-indigo-900 dark:text-indigo-300">MonitorEco AI Analysis</h3>
    </div>
    
    <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
      <p>
        <strong className="text-indigo-700 dark:text-indigo-400">Divergencia Detectada:</strong> Mientras la base monetaria (M2) se expande, la inflación proyectada muestra una desaceleración técnica.
      </p>
      <p>
        <strong className="text-indigo-700 dark:text-indigo-400">Alerta de Carry Trade:</strong> La tasa real se mantiene positiva. Vigilando el <span className="font-mono font-bold mx-1 text-emerald-600">CCL</span>.
      </p>
    </div>
    
    <div className="mt-4 pt-4 border-t border-indigo-100 dark:border-slate-800 flex justify-between items-center">
      <span className="text-xs text-slate-400">Modelo: Macro-Llama-3 (v2.1) • 5m ago</span>
      <button className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors">
        Ver reporte →
      </button>
    </div>
  </div>
);

// ============================================================================
// PÁGINA PRINCIPAL
// ============================================================================

const AnalyticsPage = () => {
  
  // 1. OBTENCIÓN DE DATOS (Memoized)
  const data = useMemo(() => generateHistoricalData(), []);

  // 2. ESTADÍSTICAS DERIVADAS (Lógica de Negocio en Frontend)
  // Calculamos la variación del M2 aquí mismo para no ensuciar el JSX.
  const m2Stats = useMemo(() => {
    // Obtenemos los dos últimos meses del array
    const lastMonth = data[data.length - 1];
    const prevMonth = data[data.length - 2];
    
    // Calculamos el porcentaje de cambio: ((Actual - Anterior) / Anterior) * 100
    const change = ((lastMonth.m2 - prevMonth.m2) / prevMonth.m2) * 100;
    
    return {
      current: lastMonth.m2,
      change: change.toFixed(1), // Redondeamos a 1 decimal (ej: 4.2)
      isGrowing: change > 0
    };
  }, [data]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1121] p-4 lg:p-8 transition-colors duration-300">
      
      {/* HEADER PRINCIPAL */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
          Analytics & Modelos IA
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl">
          Tablero de control macroeconómico avanzado. Simulaciones, correlaciones monetarias y análisis predictivo.
        </p>
      </div>

      {/* GRID SUPERIOR DE KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard title="Velocidad del Dinero (V)" value="14.2x" change={-2.4} isPositive={true} icon={Activity} description="Rotación del circulante sobre PIB mensual." />
        <MetricCard title="Tasa Real (Ex-Post)" value="+1.8%" change={0.5} isPositive={true} icon={Scale} description="Rendimiento plazo fijo ajustado por inflación." />
        <MetricCard title="Cobertura M2/Reservas" value="$1,240" change={5.2} isPositive={false} icon={DollarSign} description="Tipo de cambio teórico de conversión." />
        <MetricCard title="Riesgo País (EMBI+)" value="1,420 bps" change={-12} isPositive={true} icon={AlertTriangle} description="Spread de bonos soberanos sobre Treasuries." />
      </div>

      {/* GRID PRINCIPAL (GRÁFICOS + BARRA LATERAL) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* A. GRÁFICO PRINCIPAL DE ÁREAS (2/3 del ancho) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-500" />
              Dinámica Monetaria: Inflación vs Tasa
            </h3>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs font-medium rounded-md bg-blue-600 text-white">6M</button>
              <button className="px-3 py-1 text-xs font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700">1Y</button>
            </div>
          </div>

          <div className="h-[350px] w-full"> {/* Aumenté un poco la altura para mejor visualización */}
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInflacion" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTasa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }} itemStyle={{ color: '#e2e8f0' }} />
                <Legend iconType="circle" />
                <Area type="monotone" dataKey="inflacion" name="Inflación Mensual" stroke="#f43f5e" fillOpacity={1} fill="url(#colorInflacion)" strokeWidth={2} />
                <Area type="monotone" dataKey="tasaInteres" name="Tasa Interés (TEM)" stroke="#10b981" fillOpacity={1} fill="url(#colorTasa)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* B. BARRA LATERAL (IA + BASE MONETARIA MEJORADA) */}
        {/* space-y-6 separa los componentes verticales automáticamente */}
        <div className="space-y-6 flex flex-col h-full">
          
          {/* 1. Módulo de IA */}
          <div className="flex-shrink-0">
             <AiInsight />
          </div>

          {/* 2. Módulo Base Monetaria (RENOVADO) */}
          {/* flex-grow hace que este cuadro ocupe todo el espacio sobrante si es necesario */}
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-6 shadow-sm flex flex-col flex-grow">
            
            {/* HEADER DEL GRÁFICO (Info contextual añadida) */}
            <div className="mb-4">
              <h3 className="font-bold text-slate-800 dark:text-white mb-1 text-sm flex items-center gap-2">
                <DollarSign size={18} className="text-blue-500" />
                Base Monetaria (M2)
              </h3>
              
              {/* Bloque de Estadística Derivada (Calculada en m2Stats) */}
              <div className="flex items-end justify-between mt-2">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Total Circulante (Billones)</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white font-mono tabular-nums">
                    ${(m2Stats.current / 1000).toFixed(2)}B
                  </p>
                </div>
                
                {/* Badge de Variación Intermensual */}
                <div className={`text-right ${m2Stats.isGrowing ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {/* Nota: En economía, si la base monetaria sube mucho es inflacionario (color rose/rojo) */}
                  <span className="text-xs font-bold bg-rose-100 dark:bg-rose-500/10 px-2 py-1 rounded-md border border-rose-200 dark:border-rose-500/20 flex items-center gap-1">
                    <TrendingUp size={12} />
                    +{m2Stats.change}% MoM
                  </span>
                </div>
              </div>
            </div>

            {/* GRÁFICO DE BARRAS MEJORADO */}
            <div className="flex-grow min-h-[150px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <Tooltip 
                    cursor={{fill: 'transparent'}} // Quitamos el fondo gris feo al pasar el mouse
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                  />
                  {/* Barras con color sólido azul */}
                  <Bar dataKey="m2" name="Base Monetaria" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <p className="text-[10px] text-slate-400 mt-3 text-center">
              * Datos expresados en miles de millones (ARS). Actualización BCRA diaria.
            </p>

          </div>
        </div>

      </div>
    </div>
  );
};

export default AnalyticsPage;