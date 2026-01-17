import React, { useState, useMemo } from 'react';
import { Car, TrendingUp } from 'lucide-react';
import { ToolLayout } from '../../../components/ToolLayout';
import { financial } from '../../../utils/formulas';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

export function SimuladorPrendario() {
  const [valorAuto, setValorAuto] = useState(15000000); // <--- AHORA SÍ USAREMOS EL SETTER
  const [montoFinanciar, setMontoFinanciar] = useState(5000000); 
  const [plazo, setPlazo] = useState(24); 
  
  const [tnaFija, setTnaFija] = useState(65); 
  const [tnaUva, setTnaUva] = useState(10); 
  const [inflacionEst, setInflacionEst] = useState(5); 

  const proyeccion = useMemo(() => {
    const data = [];
    
    // Cuota Fija (Sistema Francés)
    const cuotaFija = financial.credit.frenchAmortization(montoFinanciar, tnaFija, plazo);
    
    // Cuota UVA Inicial (Sistema Francés con Tasa UVA baja)
    const cuotaUvaInicial = financial.credit.frenchAmortization(montoFinanciar, tnaUva, plazo);
    
    let cuotaUvaProyectada = cuotaUvaInicial;

    for (let mes = 1; mes <= plazo; mes++) {
      if (mes > 1) {
         cuotaUvaProyectada = cuotaUvaProyectada * (1 + (inflacionEst / 100));
      }

      data.push({
        mes: mes,
        fija: Math.round(cuotaFija),
        uva: Math.round(cuotaUvaProyectada),
      });
    }

    // Totales
    const totalFijo = cuotaFija * plazo;
    const totalUva = data.reduce((acc, curr) => acc + curr.uva, 0);

    return { data, totalFijo, totalUva, cuotaFija, cuotaUvaInicial };
  }, [montoFinanciar, plazo, tnaFija, tnaUva, inflacionEst]);

  const formatMoney = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);

  return (
    <ToolLayout 
      title="Simulador Prendario" 
      description="¿Crédito Prendario UVA o Tasa Fija? Proyecta la evolución de las cuotas de tu auto frente a la inflación."
      icon={Car}
      color="blue"
    >
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* INPUTS */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
              
              {/* NUEVO INPUT: VALOR DEL AUTO */}
              <div className="mb-4">
                 <label className="text-xs font-bold text-gray-500 uppercase mb-1">Valor del Vehículo</label>
                 <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input 
                      type="number" 
                      value={valorAuto} 
                      onChange={e => setValorAuto(Number(e.target.value))} 
                      className="w-full pl-6 pr-3 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg font-bold dark:text-white" 
                    />
                 </div>
              </div>

              <div className="mb-4">
                 <label className="text-xs font-bold text-gray-500 uppercase mb-1">Monto a Financiar</label>
                 <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input 
                      type="number" 
                      value={montoFinanciar} 
                      onChange={e => setMontoFinanciar(Number(e.target.value))} 
                      className="w-full pl-6 pr-3 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg font-bold dark:text-white" 
                    />
                 </div>
                 {/* Feedback visual de porcentaje financiado */}
                 <p className="text-xs text-blue-500 mt-1 font-medium">
                    Financias el {((montoFinanciar / valorAuto) * 100).toFixed(0)}% del valor
                 </p>
              </div>

              <div className="mb-4">
                 <label className="text-xs font-bold text-gray-500 uppercase mb-1">Plazo: {plazo} meses</label>
                 <input type="range" min="12" max="60" step="12" value={plazo} onChange={e => setPlazo(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-blue-600" />
              </div>

              <div className="border-t border-gray-100 dark:border-slate-800 pt-4 space-y-4">
                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase flex justify-between">
                       TNA Fija <span>{tnaFija}%</span>
                    </label>
                    <input type="range" min="40" max="150" step="1" value={tnaFija} onChange={e => setTnaFija(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg accent-indigo-500" />
                 </div>
                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase flex justify-between">
                       TNA UVA (Spread) <span>{tnaUva}%</span>
                    </label>
                    <input type="range" min="0" max="20" step="0.5" value={tnaUva} onChange={e => setTnaUva(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg accent-emerald-500" />
                 </div>
                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase flex justify-between">
                       Inflación Mensual Est. <span>{inflacionEst}%</span>
                    </label>
                    <input type="range" min="1" max="15" step="0.5" value={inflacionEst} onChange={e => setInflacionEst(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg accent-rose-500" />
                 </div>
              </div>

           </div>
        </div>

        {/* GRÁFICO */}
        <div className="lg:col-span-8 flex flex-col gap-6">
           <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
                 <p className="text-xs font-bold text-indigo-800 dark:text-indigo-300 uppercase">Cuota Fija (Constante)</p>
                 <p className="text-2xl font-black text-gray-900 dark:text-white">{formatMoney(proyeccion.cuotaFija)}</p>
              </div>
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                 <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase">Cuota UVA (Inicial)</p>
                 <p className="text-2xl font-black text-gray-900 dark:text-white">{formatMoney(proyeccion.cuotaUvaInicial)}</p>
              </div>
           </div>

           <div className="flex-1 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm min-h-[350px]">
             <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Evolución de Cuotas ($)</h4>
             <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={proyeccion.data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
                    <XAxis dataKey="mes" tickFormatter={(v) => `Mes ${v}`} tick={{fill:'#64748b', fontSize:12}} axisLine={false} tickLine={false} />
                    <YAxis width={80} tickFormatter={(val) => `$${val/1000}k`} tick={{fill:'#64748b', fontSize:12}} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff' }} formatter={(val) => formatMoney(val)} labelFormatter={(v) => `Mes ${v}`} />
                    <Legend verticalAlign="top" height={36}/>
                    <Line type="monotone" dataKey="fija" name="Tasa Fija" stroke="#6366f1" strokeWidth={3} dot={false} />
                    <Line type="monotone" dataKey="uva" name="UVA + Inflación" stroke="#10b981" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
             </div>
           </div>
        </div>

      </div>
    </ToolLayout>
  );
}