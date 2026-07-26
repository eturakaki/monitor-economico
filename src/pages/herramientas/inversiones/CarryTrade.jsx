import React, { useState, useMemo } from 'react';
import { Recycle, TrendingUp, DollarSign, ArrowRight } from 'lucide-react';
import { ToolLayout } from '../../../components/ToolLayout';
import { financial } from '../../../utils/formulas';

export function CarryTrade() {
  const [capitalUSD, setCapitalUSD] = useState(1000);
  const [fxEntrada, setFxEntrada] = useState(1150); // Dólar Venta hoy
  const [tnaPesos, setTnaPesos] = useState(45); // Tasa Lecap/PF
  const [dias, setDias] = useState(30);
  const [fxSalidaEsperado, setFxSalidaEsperado] = useState(1180); // Dólar futuro estimado

  const analisis = useMemo(() => {
    // 1. Vendo USD -> Pesos
    const capitalPesos = capitalUSD * fxEntrada;
    
    // 2. Invierto Pesos (financial utils)
    // Reutilizamos la lógica del Carry Trade Yield de formulas.js
    const resultado = financial.investments.carryTradeYield(capitalPesos, tnaPesos, dias, fxEntrada, fxSalidaEsperado);
    
    // 3. Breakeven (Dólar de equilibrio)
    // Es el dólar máximo al que puedo recomprar para no perder plata
    const gananciaPesos = capitalPesos * (financial.utils.proportionalRate(tnaPesos, dias));
    const totalPesosFinal = capitalPesos + gananciaPesos;
    const breakevenFx = totalPesosFinal / capitalUSD;

    return { ...resultado, capitalPesos, totalPesosFinal, breakevenFx };
  }, [capitalUSD, fxEntrada, tnaPesos, dias, fxSalidaEsperado]);

  return (
    <ToolLayout 
      title="Monitor de Carry Trade" 
      description="Calculadora de 'Bicicleta Financiera'. Analiza si conviene vender dólares, invertir en pesos y recomprar divisa."
      icon={Recycle}
      color="emerald"
    >
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* INPUTS DE MERCADO */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-md">
              <h3 className="text-xs font-bold text-slate-500 uppercase mb-4">Paso 1: Entrada</h3>

              <div className="mb-4">
                 <label className="text-sm text-slate-700 dark:text-slate-300 font-medium">Capital (USD)</label>
                 <input type="number" value={capitalUSD} onChange={e => setCapitalUSD(Number(e.target.value))} className="w-full mt-1 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white outline-none focus:border-emerald-500 transition-colors" />
              </div>
              <div className="mb-4">
                 <label className="text-sm text-slate-700 dark:text-slate-300 font-medium">Cotización Venta ($)</label>
                 <input type="number" value={fxEntrada} onChange={e => setFxEntrada(Number(e.target.value))} className="w-full mt-1 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white outline-none focus:border-emerald-500 transition-colors" />
              </div>

              <h3 className="text-xs font-bold text-slate-500 uppercase mt-8 mb-4">Paso 2: Inversión en Pesos</h3>
              <div className="flex gap-4">
                 <div className="flex-1">
                    <label className="text-xs text-slate-500 font-bold block mb-1">TNA %</label>
                    <input type="number" value={tnaPesos} onChange={e => setTnaPesos(Number(e.target.value))} className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 dark:text-white" />
                 </div>
                 <div className="flex-1">
                    <label className="text-xs text-slate-500 font-bold block mb-1">Días</label>
                    <input type="number" value={dias} onChange={e => setDias(Number(e.target.value))} className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 dark:text-white" />
                 </div>
              </div>

              <h3 className="text-xs font-bold text-slate-500 uppercase mt-8 mb-4">Paso 3: Salida (Estimada)</h3>
              <div>
                 <label className="text-sm text-slate-700 dark:text-slate-300 font-medium">Dólar Futuro ($)</label>
                 <input type="number" value={fxSalidaEsperado} onChange={e => setFxSalidaEsperado(Number(e.target.value))} className="w-full mt-1 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white outline-none focus:border-emerald-500 transition-colors" />
                 <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">¿A cuánto crees que estará el dólar cuando termine la inversión?</p>
              </div>
           </div>
        </div>

        {/* FLOW CHART & RESULTADOS */}
        <div className="lg:col-span-8 space-y-6">
           
           {/* Diagrama de Flujo */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30 text-center">
                 <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase">Inicio</p>
                 <p className="text-xl font-black text-slate-900 dark:text-white">US$ {capitalUSD}</p>
                 <p className="text-xs text-slate-600 dark:text-slate-400">Capital Puro</p>
              </div>

              <div className="hidden md:flex items-center justify-center text-slate-300 dark:text-slate-700">
                 <ArrowRight size={32} />
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-300 dark:border-slate-800 text-center">
                 <p className="text-xs font-bold text-slate-500 uppercase">En Pesos</p>
                 <p className="text-xl font-black text-slate-700 dark:text-slate-200">${new Intl.NumberFormat('es-AR').format(Math.round(analisis.totalPesosFinal))}</p>
                 <p className="text-xs text-slate-600 dark:text-slate-400">Capital + Interés</p>
              </div>

              <div className="hidden md:flex items-center justify-center text-slate-300 dark:text-slate-700">
                 <ArrowRight size={32} />
              </div>

              <div className={`p-4 rounded-xl border-2 text-center ${analisis.yieldPercent > 0 ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-500' : 'bg-rose-50 dark:bg-rose-900/10 border-rose-500'}`}>
                 <p className={`text-xs font-bold uppercase ${analisis.yieldPercent > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>Resultado Final</p>
                 <p className="text-xl font-black text-slate-900 dark:text-white">US$ {analisis.finalUsd.toFixed(2)}</p>
                 <p className={`text-xs font-bold ${analisis.yieldPercent > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {analisis.yieldPercent > 0 ? '+' : ''}{analisis.yieldPercent.toFixed(2)}% en USD
                 </p>
              </div>
           </div>

           {/* Breakeven Analysis */}
           <div className="bg-slate-900 dark:bg-black p-8 rounded-2xl border border-slate-800 relative overflow-hidden">
               <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/20 blur-3xl rounded-full"></div>
               <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div>
                     <h4 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
                        <TrendingUp size={20} className="text-emerald-400"/>
                        Precio de Equilibrio (Breakeven)
                     </h4>
                     <p className="text-slate-400 text-sm max-w-md">
                        Para no perder dinero, el dólar no debe superar este valor al momento de la salida. Si el dólar futuro es menor a esto, ganas.
                     </p>
                  </div>
                  <div className="text-center md:text-right">
                     <p className="text-4xl font-black text-white">${analisis.breakevenFx.toFixed(2)}</p>
                     <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mt-1">Límite de Seguridad</p>
                  </div>
               </div>
           </div>

        </div>
      </div>
    </ToolLayout>
  );
}
