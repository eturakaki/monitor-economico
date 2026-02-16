import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Car, TrendingUp, ChevronDown, Wallet, ShieldCheck, 
  Calculator, Coins, AlertTriangle, AlertCircle 
} from 'lucide-react';
import { ToolLayout } from '../../../components/ToolLayout';
// Nota: Eliminamos ResponsiveContainer de la importación para evitar tentaciones
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine 
} from 'recharts';

/**
 * 🛡️ SimuladorPrendario v6.0 (Titanium Fix - Direct Dimensions)
 * * ARCHITECT NOTE:
 * 1. [ROOT CAUSE FIXED] 'ResponsiveContainer' de Recharts genera falsos positivos (width -1)
 * durante el montaje en StrictMode, ensuciando la consola.
 * 2. [PATTERN CHANGE] Pasamos de "Responsive Wrapper" a "Direct Dimension Injection".
 * El componente calcula sus propias dimensiones físicas y se las pasa al gráfico.
 * Esto elimina la capa de abstracción que causaba el error.
 */

export function SimuladorPrendario() {
  // ==========================================
  // 1. STATE & DIMENSIONS (Single Source of Truth)
  // ==========================================
  
  const [valorAuto, setValorAuto] = useState(15000000);
  const [montoFinanciar, setMontoFinanciar] = useState(5000000); 
  const [plazo, setPlazo] = useState(24); 
  const [sueldoNeto, setSueldoNeto] = useState(1200000); 

  const [tnaFija, setTnaFija] = useState(65); 
  const [tnaUva, setTnaUva] = useState(9.5); 
  const [inflacionEst, setInflacionEst] = useState(4.5); 

  const [showTable, setShowTable] = useState(false);
  
  // 🛡️ DIMENSION ENGINE
  // Guardamos las dimensiones exactas en píxeles. 
  // Iniciamos en 0 para que la lógica 'if (width > 0)' impida el render prematuro.
  const chartRef = useRef(null);
  const [chartDims, setChartDims] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!chartRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        // Solo actualizamos si hay cambios reales y dimensiones válidas
        // Usamos Math.floor para evitar decimales que a veces molestan a Recharts
        if (width > 0 && height > 0) {
            requestAnimationFrame(() => {
                setChartDims({ 
                    width: Math.floor(width), 
                    height: Math.floor(height) 
                });
            });
        }
      }
    });

    resizeObserver.observe(chartRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // ==========================================
  // 2. LOGIC CORE
  // ==========================================
  const proyeccion = useMemo(() => {
    if ((plazo ?? 0) <= 0 || (montoFinanciar ?? 0) <= 0) return null;

    const calcularCuotaFrances = (capital, tnaAnual, meses) => {
      const i = (tnaAnual / 100) / 12;
      if (i === 0) return capital / meses;
      const factor = Math.pow(1 + i, meses);
      return capital * ( (i * factor) / (factor - 1) );
    };

    const cftFijoEstimado = tnaFija * 1.25; 
    const cuotaFijaFinal = calcularCuotaFrances(montoFinanciar, tnaFija, plazo);
    const cftUvaEstimado = tnaUva * 1.25; 
    const cuotaUvaInicial = calcularCuotaFrances(montoFinanciar, tnaUva, plazo);

    const data = [];
    let acumuladoFijo = 0;
    let acumuladoUva = 0;
    let mesCruce = null;
    let cuotaUvaCorriente = cuotaUvaInicial;

    for (let mes = 1; mes <= plazo; mes++) {
      if (mes > 1) cuotaUvaCorriente = cuotaUvaCorriente * (1 + (inflacionEst / 100));
      if (!mesCruce && cuotaUvaCorriente > cuotaFijaFinal) mesCruce = mes;

      const cFija = Math.round(cuotaFijaFinal);
      const cUva = Math.round(cuotaUvaCorriente);
      acumuladoFijo += cFija;
      acumuladoUva += cUva;

      data.push({ mes, fija: cFija, uva: cUva, diff: cFija - cUva });
    }

    const ratioFijo = (cuotaFijaFinal / sueldoNeto) * 100;
    const ratioUva = (cuotaUvaInicial / sueldoNeto) * 100;
    const sueldoFinalProyectado = sueldoNeto * Math.pow(1 + (inflacionEst * 0.8 / 100), plazo);
    const ratioUvaFinal = (data[data.length - 1].uva / sueldoFinalProyectado) * 100; 

    return {
      data,
      totales: { 
        fijo: acumuladoFijo, uva: acumuladoUva,
        interesFijo: acumuladoFijo - montoFinanciar,
        interesUva: acumuladoUva - montoFinanciar
      },
      kpis: {
        cuotaFija: cuotaFijaFinal, cuotaUva: cuotaUvaInicial,
        cftFijo: cftFijoEstimado, cftUva: cftUvaEstimado,
        ratioFijo, ratioUva, ratioUvaFinal
      },
      decision: {
        ganador: acumuladoFijo < acumuladoUva ? 'FIJA' : 'UVA',
        ahorro: Math.abs(acumuladoFijo - acumuladoUva),
        mesCruce
      }
    };
  }, [montoFinanciar, plazo, tnaFija, tnaUva, inflacionEst, sueldoNeto]);

  const money = (val) => new Intl.NumberFormat('es-AR', { 
    style: 'currency', currency: 'ARS', maximumFractionDigits: 0 
  }).format(val ?? 0);

  const ltvPercent = valorAuto > 0 ? (montoFinanciar / valorAuto) * 100 : 0;
  const isLtvHigh = ltvPercent > 80;
  const isLtvImpossible = ltvPercent > 100;

  return (
    <ToolLayout 
      title="Simulador de Crédito Prendario" 
      description="Calculadora comparativa de sistemas de amortización y riesgo inflacionario."
      icon={Calculator}
      color="indigo"
    >
      <div className="grid lg:grid-cols-12 gap-8 font-sans items-start">
        
        {/* === INPUTS === */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6 self-start">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
              <Car className="w-4 h-4 text-indigo-500" /> Datos del Vehículo
            </h3>
            <div className="space-y-6">
              <InputGroup label="Valor del Vehículo" value={valorAuto} onChange={setValorAuto} />
              <div>
                 <InputGroup label="Monto a Financiar" value={montoFinanciar} onChange={setMontoFinanciar} error={isLtvImpossible} />
                 <div className="flex justify-between mt-2 px-1 items-center">
                   <span className="text-[10px] uppercase font-bold text-slate-400">LTV (Cobertura)</span>
                   <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                     isLtvImpossible ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' :
                     isLtvHigh ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                     'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                   }`}>
                     {ltvPercent.toFixed(0)}%
                     {isLtvImpossible && <AlertTriangle size={10} />}
                   </span>
                 </div>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                 <InputGroup label="Ingreso Neto Mensual" value={sueldoNeto} onChange={setSueldoNeto} icon={Wallet} />
              </div>
              <div className="pt-2">
                <HybridInput label="Plazo (Meses)" value={plazo} setValue={setPlazo} min={12} max={60} step={6} suffix=" Meses" color="indigo" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" /> Mercado Financiero
            </h3>
            <div className="space-y-6">
              <HybridInput label="TNA Fija (Banco)" value={tnaFija} setValue={setTnaFija} min={40} max={200} step={1} suffix="%" color="indigo" extraInfo={`CFT Estimado: ${(tnaFija * 1.25).toFixed(0)}%`} />
              <HybridInput label="Spread UVA (Tasa)" value={tnaUva} setValue={setTnaUva} min={0} max={25} step={0.5} suffix="%" color="emerald" />
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                 <HybridInput label="Inflación Mensual" value={inflacionEst} setValue={setInflacionEst} min={1} max={20} step={0.1} suffix="%" color="rose" warning="Impacto exponencial" />
              </div>
            </div>
          </div>
        </div>

        {/* === RESULTADOS === */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="grid md:grid-cols-2 gap-6">
             <ResultCard title="Opción Tasa Fija" amount={proyeccion?.kpis.cuotaFija} cft={proyeccion?.kpis.cftFijo} ratio={proyeccion?.kpis.ratioFijo} color="indigo" details="Cuota Congelada Siempre" />
             <ResultCard title="Opción UVA (Inicial)" amount={proyeccion?.kpis.cuotaUva} cft={proyeccion?.kpis.cftUva} ratio={proyeccion?.kpis.ratioUva} color="emerald" details="Ajustable por Inflación" warning={proyeccion?.kpis.ratioUvaFinal > 35 ? "Riesgo Alto a Futuro" : null} />
          </div>

          {/* TOTALES */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
             <div className="p-4 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
                <Coins className="w-4 h-4 text-slate-500" />
                <h4 className="text-xs font-black uppercase text-slate-600 dark:text-slate-400">Total a Devolver (Capital + Intereses)</h4>
             </div>
             <div className="p-6 grid md:grid-cols-2 gap-8 relative">
                <div className="space-y-2">
                   <div className="flex justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                      <span>Total Plan Fijo</span>
                      <span>{montoFinanciar > 0 ? (proyeccion?.totales.fijo / montoFinanciar).toFixed(1) : 0}x Capital</span>
                   </div>
                   <div className="text-2xl font-mono font-black text-slate-900 dark:text-white">{money(proyeccion?.totales.fijo)}</div>
                </div>
                <div className="hidden md:block absolute left-1/2 top-4 bottom-4 w-px bg-slate-100 dark:bg-slate-800"></div>
                <div className="space-y-2">
                   <div className="flex justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                      <span>Total Estimado UVA</span>
                      <span>{montoFinanciar > 0 ? (proyeccion?.totales.uva / montoFinanciar).toFixed(1) : 0}x Capital</span>
                   </div>
                   <div className="text-2xl font-mono font-black text-slate-900 dark:text-white">{money(proyeccion?.totales.uva)}</div>
                </div>
             </div>
          </div>

          <div className={`p-6 rounded-2xl border flex flex-col sm:flex-row items-center gap-6 transition-all ${
             proyeccion?.decision.ganador === 'FIJA' ? 'bg-indigo-50/50 border-indigo-200 dark:bg-indigo-900/10 dark:border-indigo-800' : 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-800'
           }`}>
              <div className={`p-4 rounded-full shadow-sm shrink-0 ${proyeccion?.decision.ganador === 'FIJA' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                 <ShieldCheck size={32} />
              </div>
              <div className="flex-1 text-center sm:text-left">
                 <h4 className="font-black text-xl text-slate-900 dark:text-white mb-2 leading-tight">Análisis: Conviene {proyeccion?.decision.ganador === 'FIJA' ? 'Tasa Fija' : 'Crédito UVA'}</h4>
                 <p className="text-sm text-slate-600 dark:text-slate-300">Bajo estas condiciones, la opción {proyeccion?.decision.ganador} resulta en un menor costo total.</p>
                 {proyeccion?.decision.mesCruce && (
                    <div className="mt-3 text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-900/20 px-3 py-1.5 rounded inline-block border border-rose-100 dark:border-rose-800">
                       ⚠️ Cruce: Mes {proyeccion.decision.mesCruce}
                    </div>
                 )}
              </div>
          </div>

         {/* === GRÁFICO MANUAL (NO RESPONSIVE CONTAINER) === */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
             <div className="flex justify-between items-center mb-6">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Proyección de Pagos</h4>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Fija</div>
                  <div className="flex items-center gap-2 text-xs text-slate-500"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> UVA</div>
                </div>
             </div>
             
             {/* CONTENEDOR DE REFERENCIA:
                El ref 'chartRef' mide este div. NO renderizamos nada dentro hasta tener dimensiones.
             */}
             <div ref={chartRef} className="h-[350px] w-full min-w-0 relative">
                
                {/* 1. LOADING STATE */}
                {(chartDims.width === 0 || chartDims.height === 0) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-900/50 rounded animate-pulse">
                        <span className="text-xs font-mono text-slate-400">Calculando geometría...</span>
                    </div>
                )}

                {/* 2. MANUAL RENDER
                    Usamos las dimensiones calculadas. ResponsiveContainer NO es necesario.
                    Esto elimina el error width(-1).
                */}
                {chartDims.width > 0 && chartDims.height > 0 && proyeccion && (
                    <div className="absolute top-0 left-0 transition-opacity duration-300">
                        <LineChart 
                            width={chartDims.width} 
                            height={chartDims.height} 
                            data={proyeccion.data} 
                            margin={{top:10, right:10, left:-10, bottom:0}}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
                            <XAxis dataKey="mes" tick={{fontSize:11, fill:'#94a3b8'}} axisLine={false} tickLine={false} dy={10} tickFormatter={(v) => `M${v}`} />
                            <YAxis tick={{fontSize:11, fill:'#94a3b8'}} axisLine={false} tickLine={false} dx={-10} tickFormatter={(v)=>`$${(v/1000).toFixed(0)}k`} />
                            <Tooltip contentStyle={{backgroundColor:'#0f172a', borderColor:'#1e293b', color:'#f8fafc', borderRadius:'8px', fontSize:'12px'}} formatter={(val) => money(val)} labelFormatter={(l) => `Mes ${l}`} />
                            <Line type="monotone" dataKey="fija" stroke="#6366f1" strokeWidth={3} dot={false} activeDot={{r:6}} name="Cuota Fija" isAnimationActive={false} />
                            <Line type="monotone" dataKey="uva" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{r:6}} name="Cuota UVA" isAnimationActive={false} />
                            {proyeccion?.decision.mesCruce && (
                                <ReferenceLine x={proyeccion.decision.mesCruce} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Cruce', fill: '#ef4444', fontSize: 10, position: 'top' }} />
                            )}
                        </LineChart>
                    </div>
                )}
             </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
             <button onClick={() => setShowTable(!showTable)} className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                <span className="text-sm font-bold text-slate-500 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                    <ChevronDown size={16} className={`transition-transform duration-300 ${showTable ? 'rotate-180' : ''}`}/>
                    {showTable ? 'Ocultar Tabla' : 'Ver Tabla de amortización "Valor de Cuotas"'}
                </span>
             </button>
             {showTable && proyeccion?.data && (
                <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 max-h-[400px] shadow-inner bg-slate-50/50 dark:bg-black/20">
                   <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 dark:bg-slate-950 text-xs uppercase text-slate-500 font-bold sticky top-0 backdrop-blur-md">
                         <tr>
                            <th className="px-6 py-3">Mes</th>
                            <th className="px-6 py-3 text-indigo-600">Fija</th>
                            <th className="px-6 py-3 text-emerald-600">UVA</th>
                            <th className="px-6 py-3 text-right">Diff</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 bg-white dark:bg-slate-900">
                         {proyeccion.data.map((row) => (
                            <tr key={row.mes} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                               <td className="px-6 py-3 font-mono text-xs text-slate-400">{row.mes}</td>
                               <td className="px-6 py-3 font-mono font-medium text-slate-700 dark:text-slate-300">{money(row.fija)}</td>
                               <td className="px-6 py-3 font-mono font-medium text-slate-700 dark:text-slate-300">{money(row.uva)}</td>
                               <td className={`px-6 py-3 font-mono font-bold text-right ${row.diff > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{row.diff > 0 ? '+' : ''}{money(row.diff)}</td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}

// ==========================================
// SUB-COMPONENTES (MISMOS QUE ANTES)
// ==========================================
const InputGroup = ({ label, value, onChange, icon: Icon, error }) => (
  <div>
    <label className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1.5">
       {Icon && <Icon size={12} />} {label}
    </label>
    <div className="relative group">
       <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors font-mono">$</span>
       <input type="number" value={value ?? ''} onChange={(e) => onChange(Number(e.target.value))} className={`w-full pl-7 pr-3 py-3 bg-slate-50 dark:bg-slate-950 border rounded-xl font-mono font-bold focus:ring-2 outline-none transition-all shadow-sm ${error ? 'border-rose-300 text-rose-600 focus:ring-rose-500/20' : 'border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500'}`} />
    </div>
  </div>
);

const HybridInput = ({ label, value, setValue, min, max, step, suffix, color, extraInfo, warning }) => {
    const theme = {
        indigo: { accent: 'accent-indigo-600', text: 'text-indigo-600 dark:text-indigo-400', ring: 'focus:ring-indigo-500' },
        emerald: { accent: 'accent-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', ring: 'focus:ring-emerald-500' },
        rose: { accent: 'accent-rose-500', text: 'text-rose-600 dark:text-rose-400', ring: 'focus:ring-rose-500' }
    }[color ?? 'indigo'];
    return (
        <div>
            <div className="flex justify-between mb-3 items-center">
                <label className={`text-xs font-bold uppercase ${theme.text}`}>{label}</label>
                <input type="number" value={value ?? 0} onChange={(e) => setValue(Number(e.target.value))} step={step} className={`w-24 py-1 px-2 text-right text-sm font-mono font-bold bg-slate-100 dark:bg-slate-800 rounded border border-transparent focus:border-slate-300 dark:focus:border-slate-600 focus:outline-none focus:ring-2 ${theme.ring} transition-all text-slate-900 dark:text-white`} />
            </div>
            <input type="range" min={min} max={max} step={step} value={value ?? 0} onChange={(e) => setValue(Number(e.target.value))} className={`w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 ${theme.accent} focus:outline-none focus:ring-2 focus:ring-opacity-50`} />
            <div className="flex justify-between mt-2 h-4">
                <div className="flex gap-2"><span className="text-[10px] text-slate-400 font-medium font-mono">{min}{suffix}</span><span className="text-[10px] text-slate-400 font-medium font-mono">-</span><span className="text-[10px] text-slate-400 font-medium font-mono">{max}{suffix}</span></div>
                {extraInfo && <span className="text-[10px] text-slate-500 font-bold ml-auto">{extraInfo}</span>}
                {warning && <span className="text-[10px] text-rose-500 flex items-center gap-1 ml-auto font-bold animate-pulse"><AlertCircle size={10}/> {warning}</span>}
            </div>
        </div>
    );
};

const ResultCard = ({ title, amount, cft, ratio, color, details, warning }) => {
   let healthColor = 'bg-emerald-500';
   if ((ratio ?? 0) > 25) healthColor = 'bg-yellow-500';
   if ((ratio ?? 0) > 35) healthColor = 'bg-rose-500'; 
   const borderClass = color === 'indigo' ? 'border-l-indigo-500' : 'border-l-emerald-500';
   const textClass = color === 'indigo' ? 'text-indigo-600 dark:text-indigo-400' : 'text-emerald-600 dark:text-emerald-400';
   return (
      <div className={`relative p-6 bg-white dark:bg-slate-900 rounded-2xl border-l-4 ${borderClass} border-y border-r border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow`}>
         <div>
            <div className="flex justify-between items-start mb-3">
               <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{title}</p>
               <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-500 border border-slate-200 dark:border-slate-700">CFT {(cft ?? 0).toFixed(0)}%</span>
            </div>
            <p className={`text-3xl font-black ${textClass} tracking-tight mb-2 font-mono`}>{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount ?? 0)}</p>
            <p className="text-xs text-slate-400 font-medium mb-6">{details}</p>
         </div>
         <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500 mb-2"><span>Impacto en Ingresos</span><span className={(ratio ?? 0) > 30 ? 'text-rose-500' : 'text-emerald-500'}>{(ratio ?? 0).toFixed(1)}%</span></div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden"><div className={`h-full ${healthColor} transition-all duration-700 ease-out`} style={{ width: `${Math.min(ratio ?? 0, 100)}%` }} /></div>
            {warning && (<div className="mt-3 flex items-start gap-2 p-2 bg-rose-50 dark:bg-rose-900/10 rounded-lg"><AlertCircle size={12} className="text-rose-500 mt-0.5 shrink-0" /><p className="text-[10px] text-rose-600 dark:text-rose-400 font-bold leading-tight">{warning}</p></div>)}
         </div>
      </div>
   );
};