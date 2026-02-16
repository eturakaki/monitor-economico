import React, { useState, useMemo } from 'react';
import { ShoppingCart, Wallet, Banknote } from 'lucide-react';
import { ToolLayout } from '../../../components/ToolLayout';
import { financial } from '../../../utils/formulas';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

export function Stockeo() {
  const [gastoTotal, setGastoTotal] = useState(100000);
  const [descuento, setDescuento] = useState(15);
  const [tna, setTna] = useState(32);
  const [dias, setDias] = useState(30);

  const analisis = useMemo(() => {
    // 1. Opción A: Stockearse
    const ahorroPorStockeo = gastoTotal * (descuento / 100);
    const costoStockeo = gastoTotal - ahorroPorStockeo; // <--- AHORA LO USAMOS

    // 2. Opción B: Invertir
    const tasaEfectiva = financial.utils.proportionalRate(tna, dias);
    const gananciaInversion = gastoTotal * tasaEfectiva;

    // 3. Decisión
    const convieneStockear = ahorroPorStockeo > gananciaInversion;
    const diferencia = Math.abs(ahorroPorStockeo - gananciaInversion);

    // 4. Data Chart
    const chartData = [
      { name: 'Ahorro Stockeo', valor: ahorroPorStockeo, color: '#3b82f6' },
      { name: 'Ganancia Inversión', valor: gananciaInversion, color: '#8b5cf6' }
    ];

    return { 
      ahorroPorStockeo, 
      costoStockeo, // <--- Retornamos la variable
      gananciaInversion, 
      convieneStockear, 
      diferencia, 
      chartData 
    };
  }, [gastoTotal, descuento, tna, dias]);

  const formatMoney = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);

  return (
    <ToolLayout 
      title="Stockeo vs. Inversión" 
      description="Decisión financiera: ¿Descuento inmediato por compra mayorista/efectivo o rendimiento financiero en billetera virtual?"
      icon={ShoppingCart}
      color="blue"
    >
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* INPUTS */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Monto Total (Sin Descuento)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input 
                  type="number" value={gastoTotal} onChange={(e) => setGastoTotal(Number(e.target.value))}
                  className="w-full pl-6 pr-3 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Descuento Ofrecido</label>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded">{descuento}%</span>
                </div>
                <input type="range" min="0" max="50" step="1" value={descuento} onChange={(e) => setDescuento(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-blue-600" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-slate-300">TNA Billetera</label>
                  <span className="px-2 py-0.5 bg-violet-100 text-violet-700 text-xs font-bold rounded">{tna}%</span>
                </div>
                <input type="range" min="10" max="100" step="1" value={tna} onChange={(e) => setTna(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-violet-600" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Días de Inversión</label>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded">{dias} días</span>
                </div>
                <input type="range" min="1" max="60" step="1" value={dias} onChange={(e) => setDias(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-slate-500" />
              </div>
            </div>
          </div>
          
          {/* INFO EXTRA: Monto a Pagar */}
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-dashed border-gray-300 dark:border-slate-700 flex justify-between items-center">
            <div className="flex items-center gap-2">
               <Banknote size={18} className="text-slate-400" />
               <p className="text-xs text-gray-500 uppercase font-bold">Monto final a pagar</p>
            </div>
            <p className="text-xl font-black text-gray-900 dark:text-white">
               {formatMoney(analisis.costoStockeo)}
            </p>
          </div>
        </div>

        {/* RESULTADOS */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className={`p-6 rounded-2xl border-2 transition-all flex items-center gap-5 ${analisis.convieneStockear ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-500' : 'bg-violet-50 dark:bg-violet-900/10 border-violet-500'}`}>
            <div className={`p-4 rounded-full shrink-0 ${analisis.convieneStockear ? 'bg-emerald-500 text-white' : 'bg-violet-500 text-white'}`}>
              {analisis.convieneStockear ? <ShoppingCart size={32} /> : <Wallet size={32} />}
            </div>
            <div>
              <h3 className={`text-xl font-black uppercase tracking-wide ${analisis.convieneStockear ? 'text-emerald-700 dark:text-emerald-400' : 'text-violet-700 dark:text-violet-400'}`}>
                {analisis.convieneStockear ? '¡CONVIENE STOCKEARSE!' : 'MEJOR INVERTIR EL DINERO'}
              </h3>
              <p className="text-gray-600 dark:text-slate-300 mt-1 text-sm">
                Ganancia neta de la decisión: <span className="font-bold">{formatMoney(analisis.diferencia)}</span>
              </p>
            </div>
          </div>

          <div className="flex-1 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm min-h-[300px]">
             <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-6">Comparativa de Beneficio ($)</h4>
             <div className="w-full h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analisis.chartData} barSize={60}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                    <YAxis hide />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', backgroundColor: '#0f172a', border: 'none', color: '#fff' }} formatter={(val) => formatMoney(val)} />
                    <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
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