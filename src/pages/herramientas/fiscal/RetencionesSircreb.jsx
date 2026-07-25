import React, { useState } from 'react';
import { Scissors, AlertTriangle } from 'lucide-react';
import { ToolLayout } from '../../../components/ToolLayout';

export function RetencionesSircreb() {
  const [monto, setMonto] = useState(100000);
  const [alicuota, setAlicuota] = useState(1.5); // % Promedio (va de 0.01 a 5.0)

  const retencion = monto * (alicuota / 100);
  const neto = monto - retencion;

  const formatMoney = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);

  return (
    <ToolLayout 
      title="Predictor SIRCREB" 
      description="Estima las retenciones bancarias automáticas de Ingresos Brutos (SIRCREB) sobre tus acreditaciones."
      icon={Scissors}
      color="red"
    >
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 items-center">
         
         <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm space-y-6">
            <div>
               <label className="text-xs font-bold text-gray-500 uppercase mb-1">Monto Acreditado</label>
               <input type="number" value={monto} onChange={e => setMonto(Number(e.target.value))} className="w-full p-4 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl text-2xl font-black dark:text-white outline-none focus:ring-2 focus:ring-red-500" />
            </div>

            <div>
               <div className="flex justify-between mb-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Alícuota de Riesgo (%)</label>
                  <span className="text-xs font-bold text-red-500">{alicuota}%</span>
               </div>
               <input type="range" min="0" max="5" step="0.1" value={alicuota} onChange={e => setAlicuota(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg accent-red-500" />
               <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>Bajo Riesgo (0.5%)</span>
                  <span>Alto Riesgo (5.0%)</span>
               </div>
            </div>
         </div>

         <div className="space-y-6">
            <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-2xl border border-red-200 dark:border-red-800/30 flex flex-col items-center text-center">
               <Scissors size={48} className="text-red-500 mb-4" />
               <p className="text-red-800 dark:text-red-300 font-bold uppercase text-xs mb-1">Retención Estimada</p>
               <p className="text-4xl font-black text-red-600 dark:text-red-400">{formatMoney(retencion)}</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 text-center">
               <p className="text-gray-500 font-bold uppercase text-xs mb-1">Te acreditan finalmente</p>
               <p className="text-2xl font-black text-gray-900 dark:text-white">{formatMoney(neto)}</p>
            </div>
         </div>

      </div>
    </ToolLayout>
  );
}