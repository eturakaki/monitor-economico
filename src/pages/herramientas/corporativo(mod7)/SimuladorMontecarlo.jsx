import React, { useState, useMemo } from 'react';
import { GitGraph, RefreshCw, TrendingUp } from 'lucide-react';
import { ToolLayout } from '../../../components/ToolLayout';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';

// ============================================================================
// COMPONENTE PRINCIPAL: SIMULADOR MONTECARLO
// ============================================================================
export function SimuladorMontecarlo() {
  // --- ESTADO ---
  const [capitalInicial, setCapitalInicial] = useState(10000); // USD
  const [anios, setAnios] = useState(10);
  const [retornoEsperado, setRetornoEsperado] = useState(8); // % Media
  const [volatilidad, setVolatilidad] = useState(15); // % Desviación Estándar
  const [seed, setSeed] = useState(1); // Para forzar re-render

  // --- LÓGICA ESTOCÁSTICA (Optimized) ---
  const simulacion = useMemo(() => {
    const caminos = [];
    const CANTIDAD_SIMULACIONES = 30; 
    const mu = retornoEsperado / 100;
    const sigma = volatilidad / 100;

    // Generamos N caminos posibles
    for (let sim = 0; sim < CANTIDAD_SIMULACIONES; sim++) {
      let trayectoria = [{ anio: 0, valor: capitalInicial }];
      let valorActual = capitalInicial;

      for (let t = 1; t <= anios; t++) {
        // Generador Box-Muller para distribución normal (Gaussiana)
        const u1 = Math.random();
        const u2 = Math.random();
        const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);

        // Fórmula Movimiento Browniano Geométrico (Discretizado)
        const retornoAleatorio = mu + sigma * z; 
        valorActual = valorActual * (1 + retornoAleatorio);
        
        trayectoria.push({ anio: t, valor: Math.round(valorActual) });
      }
      caminos.push(trayectoria);
    }

    // Calcular estadísticas
    const valoresFinales = caminos.map(c => c[anios].valor);
    const mejorEscenario = Math.max(...valoresFinales);
    const peorEscenario = Math.min(...valoresFinales);
    const promedio = valoresFinales.reduce((a, b) => a + b, 0) / CANTIDAD_SIMULACIONES;

    const chartData = [];
    for (let t = 0; t <= anios; t++) {
        let punto = { anio: t };
        caminos.forEach((camino, index) => {
            punto[`sim${index}`] = camino[t].valor;
        });
        chartData.push(punto);
    }

    return { chartData, mejorEscenario, peorEscenario, promedio, cantidadSimulaciones: CANTIDAD_SIMULACIONES };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [capitalInicial, anios, retornoEsperado, volatilidad, seed]);

  const formatUSD = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <ToolLayout 
      title="Simulador Montecarlo (BETA)" 
      description="Proyección estocástica de portafolios. Visualiza múltiples escenarios futuros basados en volatilidad y riesgo."
      icon={GitGraph}
      color="purple"
    >
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* --- INPUTS --- */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
              <div className="mb-4">
                 <label className="text-xs font-bold text-gray-500 uppercase mb-1">Capital Inicial (USD)</label>
                 <input type="number" value={capitalInicial} onChange={e => setCapitalInicial(Number(e.target.value))} className="w-full p-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg font-bold dark:text-white" />
              </div>
              <div className="mb-4">
                 <label className="text-xs font-bold text-gray-500 uppercase mb-1">Horizonte (Años)</label>
                 <input type="range" min="5" max="30" step="1" value={anios} onChange={e => setAnios(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg accent-purple-600" />
                 <p className="text-right text-xs font-bold text-purple-600">{anios} Años</p>
              </div>
              <div className="mb-4">
                 <label className="text-xs font-bold text-gray-500 uppercase mb-1">Retorno Esperado (Media)</label>
                 <input type="number" value={retornoEsperado} onChange={e => setRetornoEsperado(Number(e.target.value))} className="w-full p-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg font-bold dark:text-white" />
              </div>
              <div className="mb-6">
                 <label className="text-xs font-bold text-gray-500 uppercase mb-1">Volatilidad (Riesgo)</label>
                 <input type="range" min="1" max="50" step="1" value={volatilidad} onChange={e => setVolatilidad(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg accent-rose-500" />
                 <p className="text-right text-xs font-bold text-rose-500">{volatilidad}% Desviación Std.</p>
              </div>

              <button 
                onClick={() => setSeed(Math.random())}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
              >
                 <RefreshCw size={18} /> Ejecutar Nueva Simulación
              </button>
           </div>
        </div>

        {/* --- CHART --- */}
        <div className="lg:col-span-8 flex flex-col gap-6">
           
           {/* KPI Cards */}
           <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                 <p className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">Mejor Caso</p>
                 <p className="text-lg font-black text-gray-900 dark:text-white truncate">{formatUSD(simulacion.mejorEscenario)}</p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800/30">
                 <p className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400">Promedio</p>
                 <p className="text-lg font-black text-gray-900 dark:text-white truncate">{formatUSD(simulacion.promedio)}</p>
              </div>
              <div className="p-4 bg-rose-50 dark:bg-rose-900/10 rounded-xl border border-rose-100 dark:border-rose-800/30">
                 <p className="text-[10px] font-bold uppercase text-rose-600 dark:text-rose-400">Peor Caso</p>
                 <p className="text-lg font-black text-gray-900 dark:text-white truncate">{formatUSD(simulacion.peorEscenario)}</p>
              </div>
           </div>

           {/* Gráfico Multilinea */}
           <div className="flex-1 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm min-h-[350px]">
             <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                   <TrendingUp size={16} className="text-purple-500"/> {simulacion.cantidadSimulaciones} Escenarios Posibles
                </h4>
             </div>
             
             <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={simulacion.chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
                    <XAxis dataKey="anio" tick={{fill:'#64748b', fontSize:10}} tickFormatter={(v) => `A${v}`} />
                    <YAxis width={60} tickFormatter={(val) => `${val/1000}k`} tick={{fill:'#64748b', fontSize:10}} />
                    <Tooltip labelFormatter={(v) => `Año ${v}`} formatter={(val) => formatUSD(val)} contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff'}} />
                    
                    {Array.from({ length: simulacion.cantidadSimulaciones }).map((_, i) => (
                        <Line 
                            key={i} 
                            type="monotone" 
                            dataKey={`sim${i}`} 
                            stroke="#8b5cf6" 
                            strokeWidth={1} 
                            dot={false} 
                            opacity={0.2} 
                            activeDot={{ r: 4, opacity: 1 }}
                        />
                    ))}
                    
                    <ReferenceLine y={capitalInicial} stroke="#64748b" strokeDasharray="3 3" />
                  </LineChart>
                </ResponsiveContainer>
             </div>
           </div>
        </div>

      </div>
    </ToolLayout>
  );
}