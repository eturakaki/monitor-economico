import React, { useState, useMemo } from 'react';
import { Search, AlertCircle, ShieldCheck } from 'lucide-react';
import { ToolLayout } from '../../../components/ToolLayout';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

export function DecodificadorCFT() {
  const [tna, setTna] = useState(85); // Tasa Nominal Anual
  const [iva, setIva] = useState(21); // IVA sobre intereses
  const [seguro, setSeguro] = useState(3.5); // Seguros de vida/otros
  const [gastos, setGastos] = useState(1.5); // Gastos administrativos

  // --- CÁLCULO ---
  const analisis = useMemo(() => {
    // Cálculo manual del CFT para desglose visual
    // CFT Básico = TNA * (1 + IVA) + Seguros + Gastos
    // Nota: El TEA (Efectiva) sería aún mayor por la capitalización, 
    // pero nos enfocamos en el Costo Financiero Total Nominal para simplificar la comparación.
    
    const impactoIva = tna * (iva / 100);
    const cftReal = tna + impactoIva + seguro + gastos;
    const diferencia = cftReal - tna;
    const sobreprecio = (diferencia / tna) * 100;

    const chartData = [
      { name: 'TNA (Lo que ves)', valor: tna, color: '#94a3b8' },
      { name: 'CFT (Lo que pagas)', valor: cftReal, color: '#f43f5e' }
    ];

    return { impactoIva, cftReal, diferencia, sobreprecio, chartData };
  }, [tna, iva, seguro, gastos]);

  return (
    <ToolLayout 
      title="Decodificador de CFT" 
      description="Descubre el 'Costo Oculto' de tus préstamos. Transforma la Tasa Nominal (TNA) en el Costo Financiero Total (CFT) real incluyendo impuestos y gastos."
      icon={Search}
      color="rose"
    >
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* INPUTS */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-md">

             <div className="mb-6">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-2">TNA Publicitada (%)</label>
                <div className="relative">
                   <input type="number" value={tna} onChange={e => setTna(Number(e.target.value))} className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-3xl font-black text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500" />
                   <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-400 font-bold">%</span>
                </div>
             </div>

             <div className="space-y-4">
                <div>
                   <div className="flex justify-between mb-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">IVA s/ Intereses</label>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{iva}%</span>
                   </div>
                   <input type="range" min="0" max="21" step="10.5" value={iva} onChange={e => setIva(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-slate-500" />
                </div>
                <div>
                   <div className="flex justify-between mb-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Seguros y Otros</label>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{seguro}%</span>
                   </div>
                   <input type="range" min="0" max="10" step="0.1" value={seguro} onChange={e => setSeguro(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-slate-500" />
                </div>
                <div>
                   <div className="flex justify-between mb-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Gastos Admin.</label>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{gastos}%</span>
                   </div>
                   <input type="range" min="0" max="10" step="0.1" value={gastos} onChange={e => setGastos(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-slate-500" />
                </div>
             </div>
          </div>

          <div className="bg-rose-50 dark:bg-rose-900/10 p-4 rounded-xl border border-rose-200 dark:border-rose-800/30 flex items-start gap-3">
             <AlertTriangle className="text-rose-500 shrink-0 mt-1" size={20} />
             <p className="text-xs text-rose-800 dark:text-rose-300">
                <span className="font-bold block mb-1">¡Cuidado!</span>
                Estás pagando un <span className="font-black">+{analisis.sobreprecio.toFixed(1)}% extra</span> sobre la tasa que te prometieron debido a los costos ocultos.
             </p>
          </div>
        </div>

        {/* VISUALIZACIÓN */}
        <div className="lg:col-span-7 flex flex-col gap-6">
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-100 dark:bg-slate-800 p-5 rounded-2xl text-center border border-slate-200 dark:border-slate-700">
                 <p className="text-xs font-bold text-slate-500 uppercase">TNA Prometida</p>
                 <p className="text-3xl font-black text-slate-700 dark:text-slate-300">{tna}%</p>
              </div>
              <div className="bg-slate-900 dark:bg-black p-5 rounded-2xl text-center border border-slate-800 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/20 blur-xl rounded-full"></div>
                 <p className="text-xs font-bold text-slate-400 uppercase">CFT Real</p>
                 <p className="text-3xl font-black text-white">{analisis.cftReal.toFixed(2)}%</p>
              </div>
           </div>

           <div className="flex-1 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-md min-h-[300px]">
             <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-6">Desglose de Costo Real</h4>
             <div className="w-full h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analisis.chartData} barSize={60}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }} axisLine={false} tickLine={false} dy={10} />
                    <YAxis hide />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', backgroundColor: '#0f172a', border: 'none', color: '#fff' }} />
                    <Bar dataKey="valor" radius={[8, 8, 0, 0]}>
                      {analisis.chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
             </div>
           </div>
        </div>

      </div>
    </ToolLayout>
  );
}
