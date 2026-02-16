import React, { useState, useMemo } from 'react';
import { Plane, Map, Hotel, Utensils } from 'lucide-react';
import { ToolLayout } from '../../../components/ToolLayout';

export function PresupuestoViaje() {
  const [dias, setDias] = useState(10);
  const [vuelo, setVuelo] = useState(1200); // USD
  const [hotelNoche, setHotelNoche] = useState(80); // USD
  const [comidaDia, setComidaDia] = useState(50); // USD
  const [tipoCambio, setTipoCambio] = useState(1150); // Dólar Turista/Blue promedio

  const presupuesto = useMemo(() => {
    const totalHotel = hotelNoche * dias;
    const totalComida = comidaDia * dias;
    const totalUSD = vuelo + totalHotel + totalComida;
    const totalPesos = totalUSD * tipoCambio;

    return { totalUSD, totalPesos, totalHotel, totalComida };
  }, [dias, vuelo, hotelNoche, comidaDia, tipoCambio]);

  const formatUSD = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  const formatARS = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);

  return (
    <ToolLayout 
      title="Planificador de Viajes" 
      description="Calcula el presupuesto total de tus vacaciones (Vuelos + Hotel + Viáticos) y conviértelo a moneda local."
      icon={Plane}
      color="indigo"
    >
      <div className="grid lg:grid-cols-12 gap-8">
         
         <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
               <div className="mb-4">
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1">Duración (Días)</label>
                  <input type="number" value={dias} onChange={e => setDias(Number(e.target.value))} className="w-full p-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg font-bold dark:text-white" />
               </div>
               <div className="mb-4">
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1">Costo Vuelo (Total)</label>
                  <input type="number" value={vuelo} onChange={e => setVuelo(Number(e.target.value))} className="w-full p-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg font-bold dark:text-white" />
               </div>
               <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                     <label className="text-xs font-bold text-gray-500 uppercase mb-1">Hotel x Noche</label>
                     <input type="number" value={hotelNoche} onChange={e => setHotelNoche(Number(e.target.value))} className="w-full p-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg font-bold dark:text-white" />
                  </div>
                  <div>
                     <label className="text-xs font-bold text-gray-500 uppercase mb-1">Gastos Diarios</label>
                     <input type="number" value={comidaDia} onChange={e => setComidaDia(Number(e.target.value))} className="w-full p-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg font-bold dark:text-white" />
                  </div>
               </div>
               <div>
                   <label className="text-xs font-bold text-gray-500 uppercase mb-1">Tipo de Cambio ($)</label>
                   <input type="number" value={tipoCambio} onChange={e => setTipoCambio(Number(e.target.value))} className="w-full p-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg font-bold dark:text-white" />
               </div>
            </div>
         </div>

         <div className="lg:col-span-7 flex flex-col gap-6">
             <div className="bg-indigo-600 p-8 rounded-2xl text-white text-center shadow-lg shadow-indigo-500/30">
                <Plane className="mx-auto mb-4 opacity-50" size={48} />
                <p className="text-indigo-200 font-bold uppercase text-sm mb-2">Presupuesto Total</p>
                <p className="text-5xl font-black mb-2">{formatUSD(presupuesto.totalUSD)}</p>
                <p className="text-lg font-medium opacity-80">≈ {formatARS(presupuesto.totalPesos)}</p>
             </div>

             <div className="grid gap-3">
                <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded"><Plane size={20} className="text-slate-500"/></div>
                      <span className="font-bold text-gray-700 dark:text-white">Aéreos</span>
                   </div>
                   <span className="font-black text-gray-900 dark:text-white">{formatUSD(vuelo)}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded"><Hotel size={20} className="text-slate-500"/></div>
                      <span className="font-bold text-gray-700 dark:text-white">Alojamiento ({dias} noches)</span>
                   </div>
                   <span className="font-black text-gray-900 dark:text-white">{formatUSD(presupuesto.totalHotel)}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded"><Utensils size={20} className="text-slate-500"/></div>
                      <span className="font-bold text-gray-700 dark:text-white">Viáticos y Comida</span>
                   </div>
                   <span className="font-black text-gray-900 dark:text-white">{formatUSD(presupuesto.totalComida)}</span>
                </div>
             </div>
         </div>

      </div>
    </ToolLayout>
  );
}