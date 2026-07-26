import React, { useState } from 'react';
import { HardHat, Ruler, Hammer } from 'lucide-react';
import { ToolLayout } from '../../../components/ToolLayout';

export function CostoConstruccion() {
  const [metros, setMetros] = useState(100);
  const [calidad, setCalidad] = useState('standard'); // standard | premium
  const [costoM2, setCostoM2] = useState(900); // USD

  // Presets de precios (Mock)
  const preciosReferencia = {
    economica: 650,
    standard: 900,
    premium: 1400
  };

  const cambiarCalidad = (tipo) => {
    setCalidad(tipo);
    setCostoM2(preciosReferencia[tipo]);
  };

  const totalObra = metros * costoM2;

  const formatUSD = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <ToolLayout 
      title="Índice Costo Construcción" 
      description="Estimador de presupuesto de obra basado en el valor del metro cuadrado de construcción actual (CAC)."
      icon={HardHat}
      color="orange"
    >
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 items-center">
         
         <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-md space-y-6">
            <div>
               <label className="text-xs font-bold text-slate-500 uppercase mb-1">Superficie a Construir (m²)</label>
               <div className="relative">
                  <input type="number" value={metros} onChange={e => setMetros(Number(e.target.value))} className="w-full pl-4 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white" />
                  <Ruler className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-400" size={20} />
               </div>
            </div>

            <div>
               <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Calidad de Terminaciones</label>
               <div className="grid grid-cols-3 gap-2">
                  {Object.keys(preciosReferencia).map(k => (
                     <button
                        key={k}
                        onClick={() => cambiarCalidad(k)}
                        className={`py-2 rounded-lg text-xs font-bold uppercase transition-all ${calidad === k ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
                     >
                        {k}
                     </button>
                  ))}
               </div>
            </div>

            <div>
               <label className="text-xs font-bold text-slate-500 uppercase mb-1">Costo m² (USD)</label>
               <input type="number" value={costoM2} onChange={e => setCostoM2(Number(e.target.value))} className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white" />
            </div>
         </div>

         <div className="space-y-6">
            <div className="bg-orange-600 p-8 rounded-2xl text-white relative overflow-hidden text-center">
               <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
               <Hammer className="mx-auto mb-4 opacity-50" size={48} />
               <p className="text-orange-200 font-bold uppercase text-sm mb-2">Presupuesto Estimado</p>
               <p className="text-5xl font-black">{formatUSD(totalObra)}</p>
               <p className="text-xs text-orange-200 mt-2 opacity-80">No incluye terreno ni honorarios profesionales</p>
            </div>
         </div>

      </div>
    </ToolLayout>
  );
}