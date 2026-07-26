import React, { useState, useMemo } from 'react';
import { Banknote, CalendarDays, Percent } from 'lucide-react';
import { ToolLayout } from '../../../components/ToolLayout';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function DescuentoCheques() {
  const [valorNominal, setValorNominal] = useState(1000000); 
  const [dias, setDias] = useState(30); 
  const [tna, setTna] = useState(45); 
  const [gastosFijos, setGastosFijos] = useState(1.2); 

  const analisis = useMemo(() => {
    const interes = valorNominal * (tna / 100) * (dias / 365);
    const comisiones = valorNominal * (gastosFijos / 100);
    const totalDescuentos = interes + comisiones;
    const valorNeto = valorNominal - totalDescuentos;
    
    // Cálculo TEA (Tasa Efectiva Anual)
    const tea = (Math.pow(valorNominal / valorNeto, 365 / dias) - 1) * 100;

    const chartData = [
      { name: 'Valor Neto (Bolsillo)', value: valorNeto, color: '#10b981' }, 
      { name: 'Intereses', value: interes, color: '#3b82f6' }, 
      { name: 'Gastos/Impuestos', value: comisiones, color: '#64748b' } 
    ];

    return { valorNeto, interes, comisiones, totalDescuentos, tea, chartData };
  }, [valorNominal, dias, tna, gastosFijos]);

  const formatMoney = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);

  return (
    <ToolLayout 
      title="Descuento de Cheques (E-qCheck)" 
      description="Calculadora de tesorería para descuento de documentos. Obtiene el valor neto de liquidación y el Costo Financiero Total (TEA)."
      icon={Banknote}
      color="slate"
    >
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* INPUTS */}
        <div className="lg:col-span-5 space-y-6">
           <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-md">
              <div className="mb-4">
                 <label className="text-xs font-bold text-slate-500 uppercase mb-1">Valor Nominal del Cheque</label>
                 <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-400 font-bold">$</span>
                    <input type="number" value={valorNominal} onChange={e => setValorNominal(Number(e.target.value))} className="w-full pl-8 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xl font-black dark:text-white outline-none focus:ring-2 focus:ring-slate-500" />
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1"><CalendarDays size={12}/> Plazo (Días)</label>
                    <input type="number" value={dias} onChange={e => setDias(Number(e.target.value))} className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg font-bold dark:text-white" />
                 </div>
                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1"><Percent size={12}/> TNA Descuento</label>
                    <input type="number" value={tna} onChange={e => setTna(Number(e.target.value))} className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg font-bold dark:text-white" />
                 </div>
              </div>

              <div>
                 <label className="text-xs font-bold text-slate-500 uppercase mb-1">Comisiones + Sellos (%)</label>
                 <div className="flex items-center gap-3">
                    <input type="range" min="0" max="5" step="0.1" value={gastosFijos} onChange={e => setGastosFijos(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg accent-slate-600 cursor-pointer" />
                    <span className="font-bold text-slate-700 dark:text-slate-300 w-12 text-right">{gastosFijos}%</span>
                 </div>
              </div>
           </div>
        </div>

        {/* RESULTADOS */}
        <div className="lg:col-span-7 flex flex-col gap-6">
           <div className="bg-slate-900 p-8 rounded-2xl text-white relative overflow-hidden flex flex-col justify-center items-center shadow-2xl">
               <div className="absolute top-0 right-0 p-24 bg-blue-500/20 blur-3xl rounded-full"></div>
               <p className="text-slate-400 font-bold uppercase text-xs mb-2 tracking-widest">Valor Neto a Recibir</p>
               <p className="text-5xl font-black mb-4 z-10">{formatMoney(analisis.valorNeto)}</p>
               <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700 backdrop-blur-sm z-10">
                  <span className="text-xs text-slate-300 uppercase font-bold">Costo Financiero Total (TEA):</span>
                  <span className="text-sm font-black text-rose-400">{analisis.tea.toFixed(1)}%</span>
               </div>
           </div>

           <div className="flex-1 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-md min-h-[300px] grid sm:grid-cols-2 gap-6 items-center">
             <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={analisis.chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                      {analisis.chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(val) => formatMoney(val)} contentStyle={{backgroundColor: '#0f172a', borderRadius: '8px', border:'none', color:'#fff'}} />
                    <Legend verticalAlign="bottom" height={36} iconSize={8} wrapperStyle={{fontSize: '10px'}}/>
                  </PieChart>
                </ResponsiveContainer>
             </div>
             <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                   <span className="text-slate-500 font-medium">Descuento Intereses</span>
                   <span className="font-bold text-rose-500">-{formatMoney(analisis.interes)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                   <span className="text-slate-500 font-medium">Gastos / Comisiones</span>
                   <span className="font-bold text-rose-500">-{formatMoney(analisis.comisiones)}</span>
                </div>
             </div>
           </div>
        </div>

      </div>
    </ToolLayout>
  );
}