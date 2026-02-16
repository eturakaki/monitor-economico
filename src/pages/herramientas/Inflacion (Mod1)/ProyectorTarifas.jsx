import React, { useState } from 'react';
import { Zap, ArrowRight, Lightbulb } from 'lucide-react';
import { ToolLayout } from '../../../components/ToolLayout';

export function ProyectorTarifas() {
  const [facturaActual, setFacturaActual] = useState(15000);
  const [aumentoEsperado, setAumentoEsperado] = useState(25); // %
  
  const facturaProyectada = facturaActual * (1 + (aumentoEsperado / 100));
  const diferencia = facturaProyectada - facturaActual;

  return (
    <ToolLayout title="Proyector de Tarifas" description="Estima el impacto de los próximos aumentos anunciados en tus facturas de servicios públicos." icon={Zap} color="amber">
      <div className="grid md:grid-cols-2 gap-8 items-center">
        
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm space-y-8">
           <div>
              <label className="block text-sm font-bold text-gray-500 uppercase mb-2">Valor Última Factura</label>
              <div className="relative">
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                 <input type="number" value={facturaActual} onChange={e => setFacturaActual(Number(e.target.value))} className="w-full pl-8 p-4 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-xl font-bold dark:text-white focus:ring-2 focus:ring-amber-500 outline-none" />
              </div>
           </div>

           <div>
              <div className="flex justify-between mb-2">
                 <label className="text-sm font-bold text-gray-500 uppercase">Aumento Anunciado</label>
                 <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded">{aumentoEsperado}%</span>
              </div>
              <input type="range" min="0" max="300" step="5" value={aumentoEsperado} onChange={e => setAumentoEsperado(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-amber-500" />
           </div>
        </div>

        <div className="space-y-4">
           <div className="bg-slate-900 dark:bg-black p-6 rounded-2xl border border-slate-800 relative overflow-hidden">
              <div className="flex items-center gap-4 relative z-10">
                 <div className="p-3 bg-slate-800 rounded-lg text-slate-400"><Zap size={24}/></div>
                 <div>
                    <p className="text-slate-500 text-xs uppercase font-bold">Nueva Factura Estimada</p>
                    <p className="text-4xl font-black text-white">${new Intl.NumberFormat('es-AR').format(facturaProyectada)}</p>
                 </div>
              </div>
           </div>

           <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-2xl border border-amber-200 dark:border-amber-800/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-full"><ArrowRight size={20} className="-rotate-45"/></div>
                 <span className="text-amber-800 dark:text-amber-200 font-bold">Incremento Neto</span>
              </div>
              <span className="text-xl font-black text-amber-600 dark:text-amber-400">+${new Intl.NumberFormat('es-AR').format(diferencia)}</span>
           </div>
           
           <div className="flex items-start gap-3 p-4 text-sm text-gray-500">
              <Lightbulb size={18} className="mt-0.5 shrink-0" />
              <p>Este cálculo es estimativo y no contempla cambios en tu categoría de consumo ni quita de subsidios escalonada.</p>
           </div>
        </div>

      </div>
    </ToolLayout>
  );
}