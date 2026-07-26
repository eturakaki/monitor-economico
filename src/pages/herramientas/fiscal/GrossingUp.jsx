import React, { useState, useMemo } from 'react';
import { ArrowUpCircle, Calculator, Wallet } from 'lucide-react';
import { ToolLayout } from '../../../components/ToolLayout';

export function GrossingUp() {
  const [netoDeseado, setNetoDeseado] = useState(500000);
  const [alicuotaIIBB, setAlicuotaIIBB] = useState(3.5); // % Ingresos Brutos
  const [otrosImpuestos, setOtrosImpuestos] = useState(0); // % Otros descuentos

  const analisis = useMemo(() => {
    // Fórmula Grossing Up: Neto / (1 - Tasa)
    const tasaTotal = (alicuotaIIBB + otrosImpuestos) / 100;
    
    // Evitar división por cero o negativos
    if (tasaTotal >= 1) return { facturacionNecesaria: 0, impuestos: 0 };

    const facturacionNecesaria = netoDeseado / (1 - tasaTotal);
    const impuestos = facturacionNecesaria - netoDeseado;

    return { facturacionNecesaria, impuestos };
  }, [netoDeseado, alicuotaIIBB, otrosImpuestos]);

  const formatMoney = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);

  return (
    <ToolLayout 
      title="Calculadora Inversa (Grossing Up)" 
      description="Calcula el monto exacto que debes facturar para recibir un neto de bolsillo específico, cubriendo impuestos y retenciones."
      icon={ArrowUpCircle}
      color="emerald"
    >
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 items-center">
         
         <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-md space-y-6">
            <div>
               <label className="text-xs font-bold text-slate-500 uppercase mb-1">Neto Deseado (En mano)</label>
               <input type="number" value={netoDeseado} onChange={e => setNetoDeseado(Number(e.target.value))} className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-2xl font-black dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
               <div>
                  <div className="flex justify-between mb-1">
                     <label className="text-xs font-bold text-slate-500 uppercase">Ingresos Brutos (%)</label>
                     <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{alicuotaIIBB}%</span>
                  </div>
                  <input type="range" min="0" max="10" step="0.1" value={alicuotaIIBB} onChange={e => setAlicuotaIIBB(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg accent-emerald-500" />
               </div>
               <div>
                  <div className="flex justify-between mb-1">
                     <label className="text-xs font-bold text-slate-500 uppercase">Otros Descuentos (%)</label>
                     <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{otrosImpuestos}%</span>
                  </div>
                  <input type="range" min="0" max="20" step="0.5" value={otrosImpuestos} onChange={e => setOtrosImpuestos(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg accent-emerald-500" />
               </div>
            </div>
         </div>

         <div className="space-y-6">
            <div className="bg-emerald-900 p-8 rounded-2xl text-white text-center relative overflow-hidden shadow-lg shadow-emerald-500/10">
               <div className="absolute top-0 right-0 p-20 bg-white/5 blur-3xl rounded-full"></div>
               <p className="text-emerald-300 font-bold uppercase text-sm mb-2">Debes Facturar</p>
               <p className="text-5xl font-black mb-4">{formatMoney(analisis.facturacionNecesaria)}</p>
               <div className="inline-flex items-center gap-2 bg-black/20 px-4 py-2 rounded-lg">
                  <Wallet size={16} className="text-emerald-400"/>
                  <span className="text-sm font-medium text-emerald-100">Para recibir {formatMoney(netoDeseado)}</span>
               </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-300 dark:border-slate-800 flex justify-between items-center">
               <div className="flex items-center gap-3">
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-lg text-rose-500 shadow-sm"><Calculator size={24}/></div>
                  <div>
                     <p className="text-sm font-bold text-slate-900 dark:text-white">Costo Impositivo</p>
                     <p className="text-xs text-slate-500">Lo que se lleva el fisco</p>
                  </div>
               </div>
               <p className="text-xl font-black text-rose-500">-{formatMoney(analisis.impuestos)}</p>
            </div>
         </div>

      </div>
    </ToolLayout>
  );
}