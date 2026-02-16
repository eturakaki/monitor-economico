import React, { useState, useMemo } from 'react';
import { Home, AlertTriangle, CheckCircle } from 'lucide-react';
import { ToolLayout } from '../../../components/ToolLayout';
import { financial } from '../../../utils/formulas';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

export function HipotecarioUVA() {
  const [propiedad, setPropiedad] = useState(100000); // Valor Propiedad
  const [ltv, setLtv] = useState(80); // % Financiado (Loan To Value)
  const [anios, setAnios] = useState(20);
  const [tnaUva, setTnaUva] = useState(5.5); // Tasa del Banco (Spread)
  const [inflacionMensual, setInflacionMensual] = useState(4); // Escenario Pesimista
  const [ajusteSalarial, setAjusteSalarial] = useState(3.5); // Tu sueldo sube menos que la inflación?

  const analisis = useMemo(() => {
    const montoPrestamo = propiedad * (ltv / 100);
    const meses = anios * 12;
    const data = [];

    // Cuota Inicial en UVAs (fija)
    // Calculamos la primera cuota en pesos simulada
    const cuotaInicialPesos = financial.credit.frenchAmortization(montoPrestamo, tnaUva, meses);
    
    let cuotaActual = cuotaInicialPesos;
    let sueldoIndex = 1000; // Base índice sueldo

    // Proyección simplificada a 5 años (60 meses) para no saturar el gráfico
    // Mostramos la tendencia de "descalce"
    for (let mes = 1; mes <= 60; mes++) {
      if (mes > 1) {
         cuotaActual = cuotaActual * (1 + (inflacionMensual / 100));
         sueldoIndex = sueldoIndex * (1 + (ajusteSalarial / 100));
      }

      // Ratio de Esfuerzo relativo (Si empezó siendo 100, cómo evoluciona)
      // Si la cuota sube 5% y sueldo 3%, el esfuerzo aumenta.
      
      data.push({
        mes: mes,
        cuota: Math.round(cuotaActual),
        // Proyección teórica de "Cuota si ajustara por sueldo" para comparar
        cuotaSalarial: Math.round(cuotaInicialPesos * (sueldoIndex/1000))
      });
    }

    // Alerta de Riesgo
    const descalce = inflacionMensual - ajusteSalarial; // Si es positivo, peligro.

    return { montoPrestamo, cuotaInicialPesos, data, descalce };
  }, [propiedad, ltv, anios, tnaUva, inflacionMensual, ajusteSalarial]);

  const formatMoney = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);

  return (
    <ToolLayout 
      title="Simulador Hipotecario UVA" 
      description="Proyección de cuotas bajo estrés. Analiza qué pasa si la inflación supera a tus aumentos de sueldo."
      icon={Home}
      color="indigo"
    >
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* INPUTS */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
              <div className="mb-4">
                 <label className="text-xs font-bold text-gray-500 uppercase mb-1">Valor Propiedad (USD)</label>
                 {/* Asumimos tipo de cambio 1:1 para simplificar o inputs en pesos */}
                 <input type="number" value={propiedad} onChange={e => setPropiedad(Number(e.target.value))} className="w-full p-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg font-bold dark:text-white" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1">% Financiado</label>
                    <input type="number" value={ltv} onChange={e => setLtv(Number(e.target.value))} className="w-full p-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg font-bold dark:text-white" />
                 </div>
                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1">Años</label>
                    <input type="number" value={anios} onChange={e => setAnios(Number(e.target.value))} className="w-full p-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg font-bold dark:text-white" />
                 </div>
              </div>

              <div className="border-t border-gray-100 dark:border-slate-800 pt-4 space-y-4">
                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Tasa Banco (UVA + %)</label>
                    <input type="range" min="3" max="15" step="0.5" value={tnaUva} onChange={e => setTnaUva(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg accent-indigo-500" />
                    <p className="text-right text-xs font-bold text-indigo-500">{tnaUva}%</p>
                 </div>
                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Inflación Proyectada</label>
                    <input type="range" min="1" max="15" step="0.5" value={inflacionMensual} onChange={e => setInflacionMensual(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg accent-rose-500" />
                    <p className="text-right text-xs font-bold text-rose-500">{inflacionMensual}% mensual</p>
                 </div>
                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Ajuste de Tu Sueldo</label>
                    <input type="range" min="1" max="15" step="0.5" value={ajusteSalarial} onChange={e => setAjusteSalarial(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg accent-emerald-500" />
                    <p className="text-right text-xs font-bold text-emerald-500">{ajusteSalarial}% mensual</p>
                 </div>
              </div>
           </div>
        </div>

        {/* RESULTADOS */}
        <div className="lg:col-span-8 flex flex-col gap-6">
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-indigo-900 p-5 rounded-xl text-white">
                 <p className="text-xs font-bold uppercase text-indigo-300">Cuota Inicial Estimada</p>
                 <p className="text-3xl font-black">{formatMoney(analisis.cuotaInicialPesos)}</p>
                 <p className="text-xs mt-1 text-indigo-300">Préstamo de {formatMoney(analisis.montoPrestamo)}</p>
              </div>
              <div className={`p-5 rounded-xl border-2 flex flex-col justify-center ${analisis.descalce > 0 ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/10' : 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10'}`}>
                 <div className="flex items-center gap-2 mb-1">
                    {analisis.descalce > 0 ? <AlertTriangle size={18} className="text-rose-500"/> : <CheckCircle size={18} className="text-emerald-500"/>}
                    <p className={`text-xs font-bold uppercase ${analisis.descalce > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                       {analisis.descalce > 0 ? 'Riesgo de Licuación' : 'Salario Protegido'}
                    </p>
                 </div>
                 <p className="text-sm text-gray-600 dark:text-slate-300 leading-tight">
                    {analisis.descalce > 0 
                       ? `La cuota sube ${analisis.descalce.toFixed(1)}% más rápido que tu sueldo cada mes.` 
                       : `Tu sueldo le gana a la cuota por ${Math.abs(analisis.descalce).toFixed(1)}% mensual.`}
                 </p>
              </div>
           </div>

           <div className="flex-1 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm min-h-[350px]">
             <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Proyección a 5 Años (Estrés)</h4>
             <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analisis.data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
                    <XAxis dataKey="mes" tickFormatter={(v) => `M${v}`} tick={{fill:'#64748b', fontSize:10}} />
                    <YAxis tickFormatter={(val) => `$${val/1000}k`} tick={{fill:'#64748b', fontSize:12}} width={70} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff' }} formatter={(val) => formatMoney(val)} />
                    <Legend />
                    <Line type="monotone" dataKey="cuota" name="Valor Cuota UVA" stroke="#f43f5e" strokeWidth={3} dot={false} />
                    <Line type="monotone" dataKey="cuotaSalarial" name="Poder de Pago (Sueldo)" stroke="#10b981" strokeWidth={3} dot={false} strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
             </div>
           </div>
        </div>
      </div>
    </ToolLayout>
  );
}