import React, { useState, useMemo } from 'react';
import { Wallet, TrendingDown, AlertTriangle } from 'lucide-react';
import { ToolLayout } from '../../../components/ToolLayout';
import { financial } from '../../../utils/formulas';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

export function SalarioReal() {
  const [salario, setSalario] = useState(800000);
  const [inflacionMensual, setInflacionMensual] = useState(5.5); // Inflación esperada
  const [meses, setMeses] = useState(6);

  // --- PROYECCIÓN ---
  const dataProyeccion = useMemo(() => {
    const data = [];
    let salarioRealActual = salario;

    for (let i = 0; i <= meses; i++) {
      // Usamos la fórmula de Salario Real de formulas.js
      // En cada iteración, aplicamos la inflación acumulada compuesta
      // Nota: Para simplificar la visualización mensual, aplicamos la tasa mes a mes
      if (i > 0) {
        salarioRealActual = financial.inflation.realSalaryProjected(salarioRealActual, inflacionMensual);
      }
      
      data.push({
        mes: i === 0 ? 'Hoy' : `Mes ${i}`,
        nominal: salario, // El billete sigue diciendo lo mismo
        real: Math.round(salarioRealActual), // Lo que realmente compra
        perdida: salario - Math.round(salarioRealActual)
      });
    }
    return data;
  }, [salario, inflacionMensual, meses]);

  const perdidaTotal = dataProyeccion[dataProyeccion.length - 1].perdida;
  const porcentajePerdida = (perdidaTotal / salario) * 100;

  const formatMoney = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);

  return (
    <ToolLayout 
      title="Erosión del Salario Real" 
      description="Visualiza cómo la inflación devora tu poder de compra si tu sueldo se mantiene fijo en los próximos meses."
      icon={Wallet}
      color="rose"
    >
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* INPUTS */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
            
            <div className="mb-6">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Sueldo Neto Actual</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input 
                  type="number" value={salario} onChange={(e) => setSalario(Number(e.target.value))}
                  className="w-full pl-6 pr-3 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Inflación Mensual Esperada</label>
                <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-xs font-bold rounded">{inflacionMensual}%</span>
              </div>
              <input type="range" min="1" max="20" step="0.1" value={inflacionMensual} onChange={(e) => setInflacionMensual(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-rose-500" />
            </div>

            <div className="mb-2">
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Meses a Proyectar</label>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded">{meses} meses</span>
              </div>
              <input type="range" min="1" max="12" step="1" value={meses} onChange={(e) => setMeses(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-slate-500" />
            </div>

          </div>

          <div className="bg-rose-50 dark:bg-rose-900/10 p-4 rounded-xl border border-rose-200 dark:border-rose-800/30">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-rose-500 mt-1" size={20} />
              <div>
                <p className="text-rose-700 dark:text-rose-400 font-bold text-sm uppercase">Pérdida de Poder</p>
                <p className="text-xs text-rose-600/80 dark:text-rose-400/70 mt-1">
                  En {meses} meses, tu sueldo de {formatMoney(salario)} comprará lo mismo que {formatMoney(salario - perdidaTotal)} hoy.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* VISUALIZACIÓN */}
        <div className="lg:col-span-8 flex flex-col h-full min-h-[400px]">
          <div className="flex-1 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Erosión Monetaria</h3>
            <p className="text-sm text-gray-500 mb-6">Comparativa Nominal vs. Real</p>
            
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dataProyeccion} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorNominal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{fill:'#64748b', fontSize:12}} />
                  <YAxis hide />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff' }}
                    formatter={(val) => formatMoney(val)}
                  />
                  <Area type="monotone" dataKey="nominal" stroke="#94a3b8" fillOpacity={1} fill="url(#colorNominal)" strokeDasharray="5 5" name="Sueldo Nominal" />
                  <Area type="monotone" dataKey="real" stroke="#f43f5e" fillOpacity={1} fill="url(#colorReal)" name="Poder de Compra" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 flex items-center justify-between text-sm font-medium">
                <span className="text-gray-500">Pérdida acumulada:</span>
                <span className="text-rose-500 font-bold">-{porcentajePerdida.toFixed(1)}%</span>
            </div>
          </div>
        </div>

      </div>
    </ToolLayout>
  );
}