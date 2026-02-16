import React, { useState } from 'react';
import { ArrowRightLeft, Wallet, Landmark, TrendingUp, AlertCircle } from 'lucide-react';
import { ToolLayout } from '../../../components/ToolLayout';

export function RadarLiquidez() {
  // Inputs (Valores por defecto basados en condiciones de mercado actuales)
  const [capital, setCapital] = useState('');
  const [dias, setDias] = useState(30);
  const [tnaBilletera, setTnaBilletera] = useState(29); // ~29% TNA (Billeteras líderes)
  const [tnaPlazoFijo, setTnaPlazoFijo] = useState(33); // ~33% TNA (Plazo Fijo promedio)

  // Resultados
  const [resultado, setResultado] = useState(null);

  const calcular = () => {
    const cap = parseFloat(capital) || 0;
    
    // Fórmulas de Interés Simple (TNA / 365 * días)
    const gananciaBilletera = cap * (tnaBilletera / 100) * (dias / 365);
    const gananciaPlazoFijo = cap * (tnaPlazoFijo / 100) * (dias / 365);

    // Lógica de decisión
    const diferencia = Math.abs(gananciaPlazoFijo - gananciaBilletera);
    const ganador = gananciaPlazoFijo > gananciaBilletera ? 'pf' : 'billetera';

    setResultado({
      billetera: gananciaBilletera,
      pf: gananciaPlazoFijo,
      diferencia: diferencia,
      ganador: ganador,
      // "Costo de la Liquidez": Cuánto me cuesta tener la plata disponible (si gana el PF)
      costoLiquidez: ganador === 'pf' ? diferencia : 0 
    });
  };

  return (
    <ToolLayout 
      title="Radar de Liquidez: Costo de Oportunidad" 
      description="Calcula el 'Costo de la Liquidez' comparando el rendimiento real de Billeteras Virtuales (MercadoPago, Ualá, NaranjaX) frente a la tasa de Plazo Fijo según los días de inmovilización."
      icon={ArrowRightLeft}
      color="violet"
    >
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* --- PANEL IZQUIERDO: INPUTS --- */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
            
            {/* Capital */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">Capital a Invertir</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">$</span>
                <input 
                  type="number" 
                  value={capital} 
                  onChange={(e) => setCapital(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none transition-all dark:text-white font-medium"
                  placeholder="Ej: 500000"
                />
              </div>
            </div>

            {/* Selector de Días (Range Slider) */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-600 dark:text-slate-400">Días de Inmovilización</label>
                <span className="px-2 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs font-bold rounded-lg">
                  {dias} días
                </span>
              </div>
              <input 
                type="range" min="1" max="60" value={dias} onChange={(e) => setDias(e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-violet-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1 día</span>
                <span>30 días</span>
                <span>60 días</span>
              </div>
            </div>

            {/* Tasas Comparativas */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">TNA Billeteras (%)</label>
                <div className="relative">
                  <input 
                    type="number" value={tnaBilletera} onChange={(e) => setTnaBilletera(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg text-sm dark:text-white focus:border-violet-500 transition-colors"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">TNA Plazo Fijo (%)</label>
                <div className="relative">
                  <input 
                    type="number" value={tnaPlazoFijo} onChange={(e) => setTnaPlazoFijo(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg text-sm dark:text-white focus:border-violet-500 transition-colors"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</div>
                </div>
              </div>
            </div>

            <button 
              onClick={calcular}
              className="w-full mt-6 bg-violet-600 hover:bg-violet-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-violet-600/20 active:scale-[0.98]"
            >
              Calcular Costo de Liquidez
            </button>
          </div>
        </div>

        {/* --- PANEL DERECHO: RESULTADOS --- */}
        <div className="lg:col-span-7">
          {resultado ? (
            <div className="flex flex-col h-full gap-4">
              
              {/* Tarjetas Comparativas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Billetera */}
                <div className={`relative p-5 rounded-2xl border-2 transition-all ${resultado.ganador === 'billetera' ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10' : 'border-transparent bg-white dark:bg-slate-900 opacity-75'}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600"><Wallet size={20} /></div>
                    <h3 className="font-bold text-gray-700 dark:text-slate-200 text-sm">Billetera Virtual</h3>
                  </div>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">
                    ${new Intl.NumberFormat('es-AR').format(Math.floor(resultado.billetera))}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Rendimiento neto</p>
                </div>

                {/* Plazo Fijo */}
                <div className={`relative p-5 rounded-2xl border-2 transition-all ${resultado.ganador === 'pf' ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10' : 'border-transparent bg-white dark:bg-slate-900 opacity-75'}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600"><Landmark size={20} /></div>
                    <h3 className="font-bold text-gray-700 dark:text-slate-200 text-sm">Plazo Fijo</h3>
                  </div>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">
                    ${new Intl.NumberFormat('es-AR').format(Math.floor(resultado.pf))}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Rendimiento neto</p>
                </div>
              </div>

              {/* ANÁLISIS DE COSTO DE LIQUIDEZ */}
              <div className="flex-1 bg-slate-100 dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-center">
                
                {resultado.ganador === 'pf' ? (
                  // Caso: Gana Plazo Fijo (Hay Costo de Liquidez)
                  <>
                    <div className="flex items-start gap-3 mb-4">
                      <AlertCircle className="text-amber-500 mt-1" size={24} />
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-lg">Costo de la Liquidez</h4>
                        <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed">
                          Si decides mantener el dinero líquido en la billetera en lugar de inmovilizarlo, estás "pagando" (dejando de ganar):
                        </p>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-700 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Pérdida neta estimada</span>
                      <span className="text-2xl font-black text-rose-500">
                        -${new Intl.NumberFormat('es-AR').format(Math.floor(resultado.costoLiquidez))}
                      </span>
                    </div>
                  </>
                ) : (
                  // Caso: Gana Billetera (Poco probable con tasas normales, pero posible a muy corto plazo o tasas invertidas)
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-600">
                      <TrendingUp size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">¡Conviene la Liquidez!</h4>
                      <p className="text-sm text-gray-600 dark:text-slate-400">
                        En este escenario, el rendimiento de la billetera supera o empata al Plazo Fijo. No hay costo de oportunidad por mantener tu dinero disponible.
                      </p>
                    </div>
                  </div>
                )}
              </div>

            </div>
          ) : (
            // Estado Vacío
            <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-slate-600 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-2xl bg-gray-50/50 dark:bg-slate-900/50">
              <ArrowRightLeft size={48} className="mb-4 opacity-20" />
              <p className="font-medium">Ingresa capital y días para analizar</p>
              <p className="text-sm opacity-60">Calcularemos el costo real de tu liquidez</p>
            </div>
          )}
        </div>

      </div>
    </ToolLayout>
  );
}