import React, { useState, useMemo } from 'react';
import { Laptop } from 'lucide-react';
import { ToolLayout } from '../../../components/ToolLayout';
// Eliminamos la dependencia de 'financial' si no la usas para evitar errores, calculamos directo aquí.

export function ExportacionServicios() {
  const [honorariosUsd, setHonorariosUsd] = useState(2000);
  const [dolarOficial, setDolarOficial] = useState(1050);
  const [dolarCCL, setDolarCCL] = useState(1180);
  const [comisionPlat, setComisionPlat] = useState(1); // % (Ej: Payoneer/Bitwage)

  const analisis = useMemo(() => {
    // 1. Blend: 80% Oficial + 20% CCL (Esquema vigente 2024/25)
    // Nota: El blend se liquida en el MULC por el 80% y el 20% queda en dólares o se liquida al CCL.
    // Simplificación matemática:
    const blendPesos = (honorariosUsd * 0.8 * dolarOficial) + (honorariosUsd * 0.2 * dolarCCL);
    
    // 2. Tipo de Cambio Efectivo (Blend Implícito)
    const tcEfectivo = blendPesos / honorariosUsd;

    // 3. Descuento Comisiones Plataforma
    // Asumimos que la comisión se descuenta en USD antes de liquidar o del total en pesos.
    // Generalmente te quitan el 1% de los USD.
    const netoPesos = blendPesos * (1 - (comisionPlat / 100));

    // 4. Comparativa vs Blue (Brecha)
    // Asumimos Blue similar a CCL para referencia rápida
    const valorBlue = honorariosUsd * dolarCCL;
    const perdidaBrecha = valorBlue - netoPesos;

    return { blendPesos, tcEfectivo, netoPesos, perdidaBrecha };
  }, [honorariosUsd, dolarOficial, dolarCCL, comisionPlat]);

  const formatMoney = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);

  return (
    <ToolLayout 
      title="Calculadora Freelancer (Blend)" 
      description="Calcula tu liquidación de exportación de servicios bajo el esquema 80/20 (Dólar Blend) y descubre tu tipo de cambio efectivo."
      icon={Laptop}
      color="indigo"
    >
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* INPUTS */}
        <div className="lg:col-span-5 space-y-6">
           <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-md">
              <div className="mb-4">
                 <label className="text-xs font-bold text-slate-500 uppercase mb-1">Honorarios (USD)</label>
                 <input type="number" value={honorariosUsd} onChange={e => setHonorariosUsd(Number(e.target.value))} className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg font-bold dark:text-white" />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1">Dólar Oficial</label>
                    <input type="number" value={dolarOficial} onChange={e => setDolarOficial(Number(e.target.value))} className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg font-bold dark:text-white" />
                 </div>
                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1">Dólar CCL</label>
                    <input type="number" value={dolarCCL} onChange={e => setDolarCCL(Number(e.target.value))} className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg font-bold dark:text-white" />
                 </div>
              </div>

              <div>
                 <label className="text-xs font-bold text-slate-500 uppercase mb-1">Comisión Plataforma (%)</label>
                 <input type="range" min="0" max="5" step="0.1" value={comisionPlat} onChange={e => setComisionPlat(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg accent-indigo-500" />
                 <p className="text-right text-xs font-bold text-indigo-500">{comisionPlat}%</p>
              </div>
           </div>
        </div>

        {/* RESULTADOS */}
        <div className="lg:col-span-7 space-y-6">
           <div className="bg-indigo-900 p-8 rounded-2xl text-white text-center relative overflow-hidden">
               <div className="absolute top-0 right-0 p-20 bg-emerald-500/20 blur-3xl rounded-full"></div>
               <p className="text-indigo-300 font-bold uppercase text-xs mb-2">Recibes en tu Banco</p>
               <p className="text-5xl font-black mb-2">{formatMoney(analisis.netoPesos)}</p>
               <div className="inline-block bg-white/10 px-3 py-1 rounded-lg border border-white/20">
                  <p className="text-sm font-medium">TC Efectivo: <span className="font-bold text-emerald-300">${analisis.tcEfectivo.toFixed(2)}</span></p>
               </div>
           </div>

           <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-800">
                 <p className="text-xs font-bold text-slate-500 uppercase">Composición Blend</p>
                 <div className="flex items-center gap-2 mt-2">
                    <div className="h-2 flex-1 bg-slate-200 rounded-full overflow-hidden flex">
                       <div className="w-[80%] bg-blue-500"></div>
                       <div className="w-[20%] bg-emerald-500"></div>
                    </div>
                 </div>
                 <div className="flex justify-between text-[10px] text-slate-600 dark:text-slate-400 mt-1">
                    <span>80% Oficial</span>
                    <span>20% CCL</span>
                 </div>
              </div>

              <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-800">
                 <p className="text-xs font-bold text-slate-500 uppercase">Costo de la Brecha</p>
                 <p className="text-xl font-bold text-rose-500">-{formatMoney(analisis.perdidaBrecha)}</p>
                 <p className="text-[10px] text-slate-600 dark:text-slate-400">vs. cobrar todo en CCL/Blue</p>
              </div>
           </div>
        </div>

      </div>
    </ToolLayout>
  );
}