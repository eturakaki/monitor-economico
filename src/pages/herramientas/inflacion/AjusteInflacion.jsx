import React, { useState } from 'react';
import { TrendingUp, Calculator, RotateCcw } from 'lucide-react';
import { ToolLayout } from '../../../components/ToolLayout';
import { financial } from '../../../utils/formulas';

export function AjusteInflacion() {
  const [monto, setMonto] = useState('');
  const [inflacionAcumulada, setInflacionAcumulada] = useState('');
  const [resultado, setResultado] = useState(null);

  const handleCalcular = () => {
    if (!monto || !inflacionAcumulada) return;
    
    // Usamos una lógica simple de Valor Futuro basada en porcentaje acumulado
    // VF = VP * (1 + i)
    const valor = parseFloat(monto);
    const tasa = parseFloat(inflacionAcumulada);
    
    // Reutilizamos la lógica de utils, adaptada
    // Si la inflación fue 100%, el índice pasó de 1 a 2.
    const indiceInicio = 1;
    const indiceFin = 1 + (tasa / 100);
    
    const ajustado = financial.inflation.historicalAdjust(valor, indiceInicio, indiceFin);
    setResultado(ajustado);
  };

  const limpiar = () => {
    setMonto('');
    setInflacionAcumulada('');
    setResultado(null);
  };

  return (
    <ToolLayout 
      title="Ajuste por Inflación (Manual)"
      description="Actualiza un valor histórico ingresando la inflación acumulada del período."
      icon={TrendingUp}
      color="emerald"
    >
      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* INPUTS */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
           <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Monto Histórico ($)</label>
                <input 
                  type="number" value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="Ej: 10000"
                  className="w-full p-4 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-lg font-bold dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Inflación Acumulada (%)</label>
                <input 
                  type="number" value={inflacionAcumulada} onChange={(e) => setInflacionAcumulada(e.target.value)} placeholder="Ej: 211.4"
                  className="w-full p-4 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-lg font-bold dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <p className="text-xs text-gray-500 mt-2">Ingresa el % total de inflación del período a analizar.</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={handleCalcular} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all">Calcular</button>
                <button onClick={limpiar} className="px-4 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 rounded-xl"><RotateCcw size={20}/></button>
              </div>
           </div>
        </div>

        {/* RESULTADO */}
        <div className="lg:col-span-6">
          <div className="h-full bg-slate-900 dark:bg-black p-8 rounded-2xl border border-slate-800 relative overflow-hidden flex flex-col justify-center items-center text-center">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-cyan-500"></div>
            
            {resultado !== null ? (
              <div className="relative z-10 animate-in zoom-in duration-300">
                <p className="text-slate-400 text-sm uppercase tracking-wider font-semibold mb-2">Valor Ajustado a Hoy</p>
                <p className="text-5xl font-black text-white mb-4 tracking-tight">
                  ${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(resultado)}
                </p>
                <div className="inline-block bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30">
                  Mantiene el poder adquisitivo original
                </div>
              </div>
            ) : (
              <div className="text-slate-600">
                <Calculator size={48} className="mx-auto mb-4 opacity-20" />
                <p>Completa los campos</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </ToolLayout>
  );
}