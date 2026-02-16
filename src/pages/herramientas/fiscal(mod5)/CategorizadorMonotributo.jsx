import React, { useState, useMemo } from 'react';
import { Users, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ToolLayout } from '../../../components/ToolLayout';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell 
} from 'recharts';

export function CategorizadorMonotributo() {
  const [facturacionAnual, setFacturacionAnual] = useState(12000000); // 12 Millones

  // Escalas Vigentes (Simuladas - Recuerda actualizar si cambian por ley)
  const escalas = useMemo(() => [
    { letra: 'A', tope: 2104000, cuota: 12100 },
    { letra: 'B', tope: 3133000, cuota: 13500 },
    { letra: 'C', tope: 4387000, cuota: 15500 },
    { letra: 'D', tope: 5449000, cuota: 19500 },
    { letra: 'E', tope: 6416000, cuota: 26000 },
    { letra: 'F', tope: 8020000, cuota: 33000 },
    { letra: 'G', tope: 9624000, cuota: 38000 },
    { letra: 'H', tope: 11916000, cuota: 66000 }, // Tope Servicios
    { letra: 'I', tope: 13337000, cuota: 81000 },
    { letra: 'J', tope: 15285000, cuota: 93000 },
    { letra: 'K', tope: 16957000, cuota: 106000 }, // Tope Bienes
  ], []);

  const analisis = useMemo(() => {
    let categoria = escalas.find(e => facturacionAnual <= e.tope);
    let excluider = false;

    if (!categoria) {
      categoria = { letra: 'EXCLUIDO', tope: Infinity, cuota: 0 };
      excluider = true;
    }

    // Calcular distancia al tope de la categoría actual
    const espacioRestante = excluider ? 0 : categoria.tope - facturacionAnual;
    const porcentajeUso = excluider ? 100 : (facturacionAnual / categoria.tope) * 100;

    return { categoria, excluider, espacioRestante, porcentajeUso };
  }, [facturacionAnual, escalas]);

  const formatMoney = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);

  return (
    <ToolLayout 
      title="Categorizador Monotributo" 
      description="Verifica tu categoría actual según tu facturación anual acumulada y controla qué tan cerca estás de la exclusión."
      icon={Users}
      color="orange"
    >
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* INPUTS */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
              <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Facturación Acumulada (Últimos 12 meses)</label>
              <input 
                type="number" 
                value={facturacionAnual} 
                onChange={e => setFacturacionAnual(Number(e.target.value))} 
                className="w-full p-4 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl text-2xl font-black dark:text-white focus:ring-2 focus:ring-orange-500 outline-none" 
              />
              <p className="text-xs text-gray-400 mt-2">Ingresa la suma de tus facturas "C" del último año móvil.</p>
           </div>

           <div className={`p-6 rounded-2xl border-2 flex items-center gap-4 ${analisis.excluider ? 'bg-rose-50 border-rose-500' : 'bg-orange-50 border-orange-500'}`}>
              <div className="text-center">
                 <p className="text-xs font-bold uppercase text-gray-500">Tu Categoría</p>
                 <p className={`text-6xl font-black ${analisis.excluider ? 'text-rose-600' : 'text-orange-600'}`}>{analisis.categoria.letra}</p>
              </div>
              <div className="border-l pl-4 border-gray-300">
                 <p className="text-sm font-bold text-gray-800 dark:text-gray-900">Cuota Mensual:</p>
                 <p className="text-xl font-black text-gray-900">{formatMoney(analisis.categoria.cuota)}</p>
              </div>
           </div>
        </div>

        {/* VISUALIZACIÓN */}
        <div className="lg:col-span-8 flex flex-col gap-6">
           
           {/* Barra de Progreso */}
           <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
              <div className="flex justify-between items-end mb-2">
                 <h3 className="text-sm font-bold text-gray-700 dark:text-white uppercase">Nivel de Facturación (Cat. {analisis.categoria.letra})</h3>
                 <span className={`text-sm font-bold ${analisis.porcentajeUso > 90 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {analisis.porcentajeUso.toFixed(1)}% del límite
                 </span>
              </div>
              
              <div className="w-full h-4 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden">
                 <div 
                    className={`h-full transition-all duration-500 ${analisis.porcentajeUso > 90 ? 'bg-rose-500' : 'bg-orange-500'}`} 
                    style={{width: `${Math.min(analisis.porcentajeUso, 100)}%`}}
                 ></div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                 {analisis.excluider ? (
                    <><AlertTriangle size={16} className="text-rose-500"/> Te pasaste del tope máximo. Deberías pasar a Responsable Inscripto.</>
                 ) : (
                    <><CheckCircle2 size={16} className="text-emerald-500"/> Puedes facturar <span className="font-bold text-gray-900 dark:text-white">{formatMoney(analisis.espacioRestante)}</span> más antes de subir de categoría.</>
                 )}
              </div>
           </div>

           {/* Gráfico de Escalas */}
           <div className="flex-1 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm min-h-[300px]">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-6">Mapa de Escalas Monotributo</h4>
              <div className="w-full h-[250px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={escalas} margin={{top: 20, right: 30, left: 20, bottom: 5}}>
                       <XAxis dataKey="letra" tick={{fontWeight:'bold'}} />
                       <YAxis hide />
                       <Tooltip 
                          cursor={{fill: 'transparent'}}
                          contentStyle={{backgroundColor: '#0f172a', borderRadius: '8px', border:'none', color:'#fff'}}
                          formatter={(value) => [formatMoney(value), 'Tope Anual']}
                       />
                       <Bar dataKey="tope" radius={[4, 4, 0, 0]}>
                          {escalas.map((entry, index) => (
                             <Cell 
                                key={`cell-${index}`} 
                                fill={entry.letra === analisis.categoria.letra ? '#f97316' : '#94a3b8'} 
                                opacity={entry.letra === analisis.categoria.letra ? 1 : 0.3}
                             />
                          ))}
                       </Bar>
                       <ReferenceLine y={facturacionAnual} stroke="#f43f5e" strokeDasharray="3 3" label={{ position: 'top', value: 'Vos', fill: '#f43f5e', fontSize: 12, fontWeight: 'bold' }} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>

      </div>
    </ToolLayout>
  );
}
