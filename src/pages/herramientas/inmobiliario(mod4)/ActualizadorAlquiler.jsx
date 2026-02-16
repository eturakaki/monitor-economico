import React, { useState } from 'react';
import { Key, RefreshCw, CalendarClock } from 'lucide-react';
import { ToolLayout } from '../../../components/ToolLayout';

export function ActualizadorAlquiler() {
  const [alquilerActual, setAlquilerActual] = useState(150000);
  const [metodo, setMetodo] = useState('ICL'); 
  const [frecuencia, setFrecuencia] = useState(12); // <--- AHORA SÍ LA USAREMOS
  const [indiceVariacion, setIndiceVariacion] = useState(240); 

  const nuevoAlquiler = alquilerActual * (1 + (indiceVariacion / 100));
  const diferencia = nuevoAlquiler - alquilerActual;

  const formatMoney = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);

  return (
    <ToolLayout 
      title="Actualizador de Alquiler" 
      description="Calcula el nuevo valor de tu alquiler según el índice pactado (ICL, IPC o Casa Propia)."
      icon={Key}
      color="emerald"
    >
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 items-center">
         
         <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm space-y-6">
            <div>
               <label className="text-xs font-bold text-gray-500 uppercase mb-1">Alquiler Actual</label>
               <input type="number" value={alquilerActual} onChange={e => setAlquilerActual(Number(e.target.value))} className="w-full p-4 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl text-2xl font-black dark:text-white" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Índice</label>
                   <div className="flex flex-col gap-2">
                      {['ICL', 'IPC', 'Casa Propia'].map(m => (
                         <button 
                            key={m} 
                            onClick={() => setMetodo(m)}
                            className={`py-2 px-3 rounded-lg text-xs font-bold transition-colors text-left ${metodo === m ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-500'}`}
                         >
                            {m}
                         </button>
                      ))}
                   </div>
                </div>
                <div>
                   <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Frecuencia</label>
                   <div className="flex flex-col gap-2">
                      {[12, 6, 3].map(m => (
                         <button 
                            key={m} 
                            onClick={() => setFrecuencia(m)} // <--- USO DEL SETTER
                            className={`py-2 px-3 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${frecuencia === m ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-500'}`}
                         >
                            <CalendarClock size={14} />
                            Cada {m} meses
                         </button>
                      ))}
                   </div>
                </div>
            </div>

            <div>
               <label className="text-xs font-bold text-gray-500 uppercase mb-1">Variación Acumulada (%)</label>
               <input type="number" value={indiceVariacion} onChange={e => setIndiceVariacion(Number(e.target.value))} className="w-full p-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl font-bold dark:text-white" />
               <p className="text-xs text-gray-400 mt-2">
                  *Ingresa el % acumulado del índice <strong>{metodo}</strong> para el período de <strong>{frecuencia} meses</strong>.
               </p>
            </div>
         </div>

         <div className="space-y-6">
            <div className="bg-emerald-900 p-8 rounded-2xl text-white relative overflow-hidden text-center">
               <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
               <p className="text-emerald-300 font-bold uppercase text-sm mb-2">Nuevo Valor Mensual</p>
               <p className="text-5xl font-black mb-4">{formatMoney(nuevoAlquiler)}</p>
               <div className="inline-block bg-white/10 px-4 py-1 rounded-full text-sm font-medium">
                  A partir del próximo mes
               </div>
            </div>

            <div className="bg-gray-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 flex justify-between items-center">
               <div className="flex items-center gap-3">
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-lg text-emerald-500 shadow-sm"><RefreshCw size={24}/></div>
                  <div>
                     <p className="text-sm font-bold text-gray-900 dark:text-white">Aumento Neto</p>
                     <p className="text-xs text-gray-500">Diferencia de bolsillo</p>
                  </div>
               </div>
               <p className="text-xl font-black text-emerald-600">+{formatMoney(diferencia)}</p>
            </div>
         </div>

      </div>
    </ToolLayout>
  );
}