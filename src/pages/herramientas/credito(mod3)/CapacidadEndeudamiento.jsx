import React, { useState } from 'react';
import { ShieldCheck, CheckCircle, AlertTriangle } from 'lucide-react';
import { ToolLayout } from '../../../components/ToolLayout';
import { financial } from '../../../utils/formulas';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export function CapacidadEndeudamiento() {
  const [ingresoNeto, setIngresoNeto] = useState(850000);
  const [gastosFijos, setGastosFijos] = useState(400000); 
  const [limiteSano, setLimiteSano] = useState(30); 

  // Cálculos
  const capacidadCuota = financial.credit.borrowingCapacity(ingresoNeto, limiteSano);
  const ingresoDisponible = ingresoNeto - gastosFijos;
  const remanente = ingresoDisponible - capacidadCuota;

  // Estado (CORREGIDO: Ahora los textos están aquí y se usan abajo)
  const situacion = remanente > 0 ? 'Finanzas Equilibradas' : 'Estás al límite';
  const colorSituacion = remanente > 0 ? '#10b981' : '#f43f5e';

  const dataChart = [
    { name: 'Gastos Fijos', value: gastosFijos, color: '#64748b' },
    { name: 'Capacidad Cuota', value: capacidadCuota, color: '#3b82f6' },
    { name: 'Libre / Ahorro', value: Math.max(0, remanente), color: '#10b981' }
  ];

  const formatMoney = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);

  return (
    <ToolLayout 
      title="Capacidad de Endeudamiento" 
      description="Calcula la cuota máxima que deberías afrontar según tus ingresos para mantener tus finanzas saludables."
      icon={ShieldCheck}
      color="blue"
    >
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* INPUTS */}
        <div className="lg:col-span-5 space-y-6">
           <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
              <div className="mb-4">
                 <label className="text-xs font-bold text-gray-500 uppercase mb-1">Ingreso Neto Mensual</label>
                 <input type="number" value={ingresoNeto} onChange={e => setIngresoNeto(Number(e.target.value))} className="w-full p-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg font-bold dark:text-white" />
              </div>
              <div className="mb-4">
                 <label className="text-xs font-bold text-gray-500 uppercase mb-1">Gastos Fijos Ineludibles</label>
                 <input type="number" value={gastosFijos} onChange={e => setGastosFijos(Number(e.target.value))} className="w-full p-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg font-bold dark:text-white" />
              </div>
              <div className="mb-2">
                 <div className="flex justify-between mb-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Límite Sano (%)</label>
                    <span className="text-xs font-bold text-blue-600">{limiteSano}%</span>
                 </div>
                 <input type="range" min="10" max="50" step="5" value={limiteSano} onChange={e => setLimiteSano(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-blue-500" />
                 <p className="text-[10px] text-gray-400 mt-1">Los expertos recomiendan no superar el 30% de tus ingresos.</p>
              </div>
           </div>
        </div>

        {/* RESULTADOS */}
        <div className="lg:col-span-7 flex flex-col gap-6">
           <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm text-center relative overflow-hidden">
               <div className="relative z-10">
                  <p className="text-slate-500 font-bold uppercase text-xs mb-2">Cuota Máxima Sugerida</p>
                  <p className="text-5xl font-black text-slate-900 dark:text-white mb-2">{formatMoney(capacidadCuota)}</p>
                  
                  {/* AQUÍ ESTABA EL ERROR: Ahora usamos la variable 'situacion' */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border" style={{borderColor: colorSituacion, color: colorSituacion, backgroundColor: `${colorSituacion}15`}}>
                     {remanente > 0 ? <CheckCircle size={14}/> : <AlertTriangle size={14}/>}
                     <span className="text-xs font-bold">{situacion}</span>
                  </div>

               </div>
           </div>

           <div className="flex-1 bg-slate-50 dark:bg-black p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center">
              <div className="w-full md:w-1/2 h-[200px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie data={dataChart} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                          {dataChart.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                       </Pie>
                       <Tooltip formatter={(val) => formatMoney(val)} contentStyle={{backgroundColor: '#0f172a', borderRadius: '8px', border:'none', color:'#fff'}} />
                    </PieChart>
                 </ResponsiveContainer>
              </div>
              <div className="w-full md:w-1/2 space-y-3">
                 {dataChart.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></div>
                          <span className="text-sm text-gray-600 dark:text-slate-400">{item.name}</span>
                       </div>
                       <span className="font-bold text-gray-900 dark:text-white text-sm">{formatMoney(item.value)}</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>

      </div>
    </ToolLayout>
  );
}