import React, { useState, useMemo } from 'react';
import { AlertTriangle, TrendingDown, Snowflake } from 'lucide-react';
import { ToolLayout } from '../../../components/ToolLayout';
import { financial } from '../../../utils/formulas';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

export function BolaNieve() {
  const [deudaTotal, setDeudaTotal] = useState(200000);
  const [pagoMinimo, setPagoMinimo] = useState(15000);
  const [tna, setTna] = useState(120); // Tasa de refinanciación altísima (típico tarjetas)
  
  const proyeccion = useMemo(() => {
    // Usamos el helper de formulas.js
    return financial.credit.snowballProjection(deudaTotal, pagoMinimo, tna, 12);
  }, [deudaTotal, pagoMinimo, tna]);

  const saldoFinal = proyeccion[proyeccion.length - 1].balance;
  const interesesTotales = proyeccion.reduce((acc, curr) => acc + curr.interest, 0);
  const crecimiento = ((saldoFinal - deudaTotal) / deudaTotal) * 100;

  const formatMoney = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);

  return (
    <ToolLayout 
      title="Efecto Bola de Nieve" 
      description="Simula el peligroso crecimiento de tu deuda si solo realizas el pago mínimo de tu tarjeta de crédito."
      icon={Snowflake}
      color="cyan"
    >
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* INPUTS */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-md">
              <div className="mb-4">
                 <label className="text-xs font-bold text-slate-500 uppercase mb-1">Deuda Total Tarjeta</label>
                 <input type="number" value={deudaTotal} onChange={e => setDeudaTotal(Number(e.target.value))} className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg font-bold dark:text-white" />
              </div>
              <div className="mb-4">
                 <label className="text-xs font-bold text-slate-500 uppercase mb-1">Pago Mínimo Realizado</label>
                 <input type="number" value={pagoMinimo} onChange={e => setPagoMinimo(Number(e.target.value))} className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg font-bold dark:text-white" />
              </div>
              <div className="mb-2">
                 <label className="text-xs font-bold text-slate-500 uppercase mb-1">TNA Refinanciación (%)</label>
                 <input type="number" value={tna} onChange={e => setTna(Number(e.target.value))} className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg font-bold dark:text-white" />
                 <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1">*Suele ser mucho más alta que un préstamo personal.</p>
              </div>
           </div>
        </div>

        {/* VISUALIZACIÓN */}
        <div className="lg:col-span-8 flex flex-col gap-6">
           
           <div className="bg-cyan-900 p-6 rounded-2xl text-white flex flex-col md:flex-row justify-between items-center relative overflow-hidden">
               <div className="absolute -left-4 -bottom-4 text-cyan-800 opacity-20"><Snowflake size={120} /></div>
               <div className="relative z-10">
                  <p className="text-cyan-200 font-bold uppercase text-xs mb-1">En 12 meses deberás</p>
                  <p className="text-4xl font-black">{formatMoney(saldoFinal)}</p>
                  <p className="text-sm mt-2 opacity-90">Pagando el mínimo, tu deuda creció un <span className="font-bold text-white bg-rose-500 px-1 rounded">{crecimiento.toFixed(0)}%</span></p>
               </div>
               <div className="text-right relative z-10 mt-4 md:mt-0">
                  <p className="text-xs font-bold uppercase text-cyan-200">Intereses Regalados</p>
                  <p className="text-2xl font-bold">{formatMoney(interesesTotales)}</p>
               </div>
           </div>

           <div className="flex-1 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-md min-h-[300px]">
             <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-6">Proyección de Crecimiento de Deuda</h4>
             <div className="w-full h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={proyeccion} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorDeuda" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" tickFormatter={(val) => `Mes ${val}`} tick={{fill:'#64748b', fontSize:12}} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff' }} formatter={(val) => formatMoney(val)} labelFormatter={(val) => `Mes ${val}`} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
                    <Area type="monotone" dataKey="balance" stroke="#0891b2" fillOpacity={1} fill="url(#colorDeuda)" name="Saldo Deuda" />
                  </AreaChart>
                </ResponsiveContainer>
             </div>
           </div>

        </div>
      </div>
    </ToolLayout>
  );
}