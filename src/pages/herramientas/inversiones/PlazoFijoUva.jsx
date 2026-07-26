import React, { useState, useMemo } from 'react';
import { Clock, TrendingUp, DollarSign, CalendarClock } from 'lucide-react';
import { ToolLayout } from '../../../components/ToolLayout';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

export function PlazoFijoUVA() {
  const [capital, setCapital] = useState(100000);
  const [inflacionMensual, setInflacionMensual] = useState(7); // Inflación promedio proyectada
  const [tnaTradicional, setTnaTradicional] = useState(35); // TNA PF Tradicional
  const [tnaPrecancelable] = useState(1); // El +1% del UVA

  // Análisis a 6 meses (180 días, mínimo UVA)
  const proyeccion = useMemo(() => {
    const data = [];
    let acumuladoUVA = capital;
    let acumuladoTradicional = capital;
    
    // Tasa efectiva mensual del tradicional
    const temTradicional = (tnaTradicional / 100) / 12; 

    for (let mes = 1; mes <= 6; mes++) {
      // 1. Crecimiento UVA (Capital ajustado por inflacion + 1% TNA anual prorrateado)
      // Ajuste CER:
      acumuladoUVA = acumuladoUVA * (1 + (inflacionMensual / 100));
      // Interés real (el +1%):
      acumuladoUVA = acumuladoUVA * (1 + ((tnaPrecancelable/100)/12));

      // 2. Crecimiento Tradicional (Interés Compuesto mensual)
      acumuladoTradicional = acumuladoTradicional * (1 + temTradicional);

      data.push({
        mes: `Mes ${mes}`,
        uva: Math.round(acumuladoUVA),
        tradicional: Math.round(acumuladoTradicional),
      });
    }

    const finalUVA = data[5].uva;
    const finalTrad = data[5].tradicional;
    const ganador = finalUVA > finalTrad ? 'Plazo Fijo UVA' : 'Plazo Fijo Tradicional';
    const diferencia = Math.abs(finalUVA - finalTrad);

    return { data, finalUVA, finalTrad, ganador, diferencia };
  }, [capital, inflacionMensual, tnaTradicional, tnaPrecancelable]);

  const formatMoney = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);

  return (
    <ToolLayout 
      title="Simulador Plazo Fijo UVA" 
      description="Proyección a 180 días. ¿Le gana la inflación (UVA + 1%) a la tasa fija tradicional?"
      icon={Clock}
      color="violet"
    >
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* INPUTS */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-md">

            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Capital Inicial</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-400">$</span>
                <input type="number" value={capital} onChange={(e) => setCapital(Number(e.target.value))} className="w-full pl-6 pr-3 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg font-bold dark:text-white focus:ring-2 focus:ring-violet-500 outline-none" />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="flex justify-between text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Inflación Mensual Promedio
                  <span className="text-rose-500 font-bold">{inflacionMensual}%</span>
                </label>
                <input type="range" min="1" max="20" step="0.5" value={inflacionMensual} onChange={(e) => setInflacionMensual(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-rose-500" />
              </div>

              <div>
                <label className="flex justify-between text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  TNA Tradicional
                  <span className="text-violet-500 font-bold">{tnaTradicional}%</span>
                </label>
                <input type="range" min="20" max="150" step="1" value={tnaTradicional} onChange={(e) => setTnaTradicional(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-violet-500" />
              </div>
            </div>

            <div className="mt-6 p-4 bg-violet-50 dark:bg-violet-900/10 rounded-xl text-xs text-violet-800 dark:text-violet-300">
              <p className="font-bold mb-1">Nota Técnica:</p>
              <p>El PF UVA tiene un plazo mínimo de 180 días. Este simulador compara renovar un PF Tradicional cada 30 días durante 6 meses vs. 1 PF UVA.</p>
            </div>
          </div>
        </div>

        {/* RESULTADOS */}
        <div className="lg:col-span-8 flex flex-col gap-6">
           <div className="grid sm:grid-cols-2 gap-4">
              <div className={`p-5 rounded-2xl border-2 transition-all ${proyeccion.ganador === 'Plazo Fijo UVA' ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10' : 'border-slate-300 dark:border-slate-800 opacity-60'}`}>
                 <div className="text-sm text-slate-500 font-bold uppercase mb-1">Resultado UVA (6 meses)</div>
                 <div className="text-3xl font-black text-slate-900 dark:text-white">{formatMoney(proyeccion.finalUVA)}</div>
                 <div className="text-xs text-emerald-600 font-bold mt-1">Ajustado por Inflación</div>
              </div>

              <div className={`p-5 rounded-2xl border-2 transition-all ${proyeccion.ganador === 'Plazo Fijo Tradicional' ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10' : 'border-slate-300 dark:border-slate-800 opacity-60'}`}>
                 <div className="text-sm text-slate-500 font-bold uppercase mb-1">Resultado Tradicional</div>
                 <div className="text-3xl font-black text-slate-900 dark:text-white">{formatMoney(proyeccion.finalTrad)}</div>
                 <div className="text-xs text-violet-600 font-bold mt-1">Tasa Fija Compuesta</div>
              </div>
           </div>

           <div className="flex-1 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-md min-h-[300px]">
             <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-6">Carrera de Rendimientos (Proyección)</h4>
             <div className="w-full h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={proyeccion.data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="mes" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ borderRadius: '8px', backgroundColor: '#0f172a', border: 'none', color: '#fff' }} formatter={(val) => formatMoney(val)} />
                    <Legend />
                    <Line type="monotone" dataKey="uva" name="PF UVA" stroke="#f43f5e" strokeWidth={3} dot={{r:4}} />
                    <Line type="monotone" dataKey="tradicional" name="PF Tradicional" stroke="#8b5cf6" strokeWidth={3} dot={{r:4}} />
                  </LineChart>
                </ResponsiveContainer>
             </div>
           </div>
        </div>

      </div>
    </ToolLayout>
  );
}
