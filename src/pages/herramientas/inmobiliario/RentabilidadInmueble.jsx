import React, { useState } from 'react';
import { BarChart4, TrendingUp, AlertCircle } from 'lucide-react';
import { ToolLayout } from '../../../components/ToolLayout';

export function RentabilidadInmueble() {
  const [valorPropiedad, setValorPropiedad] = useState(100000); // USD
  const [alquilerMensual, setAlquilerMensual] = useState(500); // USD
  const [gastosMensuales, setGastosMensuales] = useState(50); // USD (Impuestos, expensas extraordinarias)
  const [vacancia, setVacancia] = useState(1); // Meses vacíos por año

  // Cálculos
  const ingresoBrutoAnual = alquilerMensual * 12;
  const ingresoNetoAnual = (alquilerMensual * (12 - vacancia)) - (gastosMensuales * 12);
  
  const roiBruto = (ingresoBrutoAnual / valorPropiedad) * 100;
  const roiNeto = (ingresoNetoAnual / valorPropiedad) * 100;
  const recuperoAnios = valorPropiedad / ingresoNetoAnual;

  return (
    <ToolLayout 
      title="Rentabilidad Real (ROI)" 
      description="Analiza el retorno de inversión de una propiedad. Calcula la rentabilidad bruta vs. neta descontando vacancia y gastos."
      icon={BarChart4}
      color="emerald"
    >
      <div className="grid lg:grid-cols-12 gap-8">
         {/* INPUTS */}
         <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm space-y-6">
            <div>
               <label className="text-xs font-bold text-gray-500 uppercase mb-1">Valor Propiedad (USD)</label>
               <input type="number" value={valorPropiedad} onChange={e => setValorPropiedad(Number(e.target.value))} className="w-full p-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg font-bold dark:text-white" />
            </div>
            <div>
               <label className="text-xs font-bold text-gray-500 uppercase mb-1">Alquiler Mensual (USD)</label>
               <input type="number" value={alquilerMensual} onChange={e => setAlquilerMensual(Number(e.target.value))} className="w-full p-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg font-bold dark:text-white" />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1">Gastos Mensuales (USD)</label>
                  <input type="number" value={gastosMensuales} onChange={e => setGastosMensuales(Number(e.target.value))} className="w-full p-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg font-bold dark:text-white" />
               </div>
               <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1">Meses Vacíos / Año</label>
                  <input type="number" value={vacancia} onChange={e => setVacancia(Number(e.target.value))} className="w-full p-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg font-bold dark:text-white" />
               </div>
            </div>
         </div>

         {/* RESULTADOS */}
         <div className="lg:col-span-7 space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
               <div className="bg-gray-100 dark:bg-slate-800 p-6 rounded-2xl text-center">
                  <p className="text-xs font-bold uppercase text-gray-500">Rentabilidad Bruta</p>
                  <p className="text-4xl font-black text-gray-700 dark:text-gray-300">{roiBruto.toFixed(2)}%</p>
                  <p className="text-xs text-gray-400">Anual</p>
               </div>
               <div className="bg-emerald-500 p-6 rounded-2xl text-center text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 blur-xl rounded-full"></div>
                  <p className="text-emerald-100 font-bold uppercase text-xs">Rentabilidad Neta</p>
                  <p className="text-4xl font-black">{roiNeto.toFixed(2)}%</p>
                  <p className="text-xs text-emerald-100">Anual (Real)</p>
               </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 flex items-start gap-4">
               <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                  <TrendingUp size={24} />
               </div>
               <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">Tiempo de Recupero</h4>
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                     Con este flujo de fondos neto, tardarías <span className="font-bold text-gray-900 dark:text-white">{recuperoAnios.toFixed(1)} años</span> en recuperar el valor de la propiedad (sin contar apreciación).
                  </p>
               </div>
            </div>
         </div>
      </div>
    </ToolLayout>
  );
}