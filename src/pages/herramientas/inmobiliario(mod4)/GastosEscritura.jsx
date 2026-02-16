import React, { useState } from 'react';
import { FileSignature, ScrollText } from 'lucide-react';
import { ToolLayout } from '../../../components/ToolLayout';

export function GastosEscritura() {
  const [valorPropiedad, setValorPropiedad] = useState(100000);
  const [tipoCambio, setTipoCambio] = useState(1050); // Para pesificar sellos
  
  // Porcentajes estimados (CABA/GBA Promedio)
  const honorarios = 2.0; // % + IVA
  const sellos = 3.5; // % (CABA)
  const otros = 0.5; // % (Gestoria, informes)

  const costoHonorarios = valorPropiedad * (honorarios / 100) * 1.21; // Con IVA
  const costoSellos = valorPropiedad * (sellos / 100);
  const costoOtros = valorPropiedad * (otros / 100);
  
  const totalGastos = costoHonorarios + costoSellos + costoOtros;

  const formatUSD = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <ToolLayout 
      title="Gastos de Escrituración" 
      description="Estimador de costos notariales e impositivos al momento de escriturar una propiedad (Sellos, Honorarios, ITI/Ganancias)."
      icon={FileSignature}
      color="slate"
    >
      <div className="grid lg:grid-cols-12 gap-8">
        
         <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm space-y-6">
            <div>
               <label className="text-xs font-bold text-gray-500 uppercase mb-1">Valor Escritura (USD)</label>
               <input type="number" value={valorPropiedad} onChange={e => setValorPropiedad(Number(e.target.value))} className="w-full p-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg font-bold dark:text-white" />
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
               <p className="text-xs font-bold text-gray-500 uppercase mb-2">Parámetros Estimados</p>
               <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                     <span>Honorarios Escribano (+IVA)</span>
                     <span className="font-bold">~{honorarios}%</span>
                  </div>
                  <div className="flex justify-between">
                     <span>Impuesto de Sellos (CABA)</span>
                     <span className="font-bold">{sellos}%</span>
                  </div>
               </div>
            </div>
         </div>

         <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900 p-6 rounded-2xl text-white flex justify-between items-center">
               <div>
                  <p className="text-slate-400 font-bold uppercase text-xs">Total Gastos Aprox.</p>
                  <p className="text-4xl font-black">{formatUSD(totalGastos)}</p>
               </div>
               <ScrollText size={40} className="text-slate-600" />
            </div>

            <div className="grid gap-3">
               {[
                  { lbl: 'Honorarios (+IVA)', val: costoHonorarios },
                  { lbl: 'Impuesto Sellos', val: costoSellos },
                  { lbl: 'Gestoría / Varios', val: costoOtros },
               ].map((item) => (
                  <div key={item.lbl} className="flex justify-between items-center p-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl">
                     <span className="font-medium text-gray-700 dark:text-slate-300">{item.lbl}</span>
                     <span className="font-bold text-gray-900 dark:text-white">{formatUSD(item.val)}</span>
                  </div>
               ))}
            </div>
            
            <p className="text-xs text-gray-400 text-center">* Los valores son indicativos. El escribano puede ajustar honorarios y el tipo de cambio oficial aplica a sellos.</p>
         </div>

      </div>
    </ToolLayout>
  );
}