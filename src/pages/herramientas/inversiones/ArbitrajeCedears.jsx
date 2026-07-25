import React, { useState, useMemo } from 'react';
import { Globe, TrendingDown, TrendingUp, RefreshCw } from 'lucide-react';
import { ToolLayout } from '../../../components/ToolLayout';
import { financial } from '../../../utils/formulas';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell 
} from 'recharts';

export function ArbitrajeCedears() {
  const [ticker, setTicker] = useState('AAPL');
  const [precioLocal, setPrecioLocal] = useState(11500); // Pesos
  const [precioUSA, setPrecioUSA] = useState(185); // Dólares
  const [ratio, setRatio] = useState(20); // 20:1 (Ejemplo viejo, ajustar según ratio real)
  const [cclMercado, setCclMercado] = useState(1190); // Referencia

  // --- CÁLCULO ---
  const analisis = useMemo(() => {
    // 1. Calcular CCL Implícito del Cedear
    // Fórmula: (PrecioLocal * Ratio) / PrecioUSA
    // Nota: A veces es (PrecioLocal / PrecioUSA) * Ratio dependiendo cómo lo expreses.
    // Usaremos la fórmula estándar de conversión:
    // Valor en Pesos de 1 acción entera = PrecioLocal * Ratio
    // CCL = (PrecioLocal * Ratio) / PrecioUSA
    
    // CORRECCIÓN FÓRMULA COMÚN DE MERCADO:
    // Si Ratio es 10:1 significa 10 Cedears = 1 Acción USA.
    // Precio 1 Acción en Pesos = PrecioCedear * Ratio
    // Tipo de Cambio = (PrecioCedear * Ratio) / PrecioUSA
    
    const cclImplícito = financial.investments.cedearImpliedCCL(precioLocal, precioUSA, ratio);
    
    // 2. Comparación (Arbitraje)
    const desarbitraje = ((cclImplícito - cclMercado) / cclMercado) * 100;
    
    // Si el CCL del Cedear es MENOR al mercado, el Cedear está BARATO (Oportunidad de compra).
    const oportunidad = cclImplícito < cclMercado;
    
    const chartData = [
       { name: 'CCL Mercado', valor: cclMercado, color: '#64748b' },
       { name: `CCL ${ticker}`, valor: cclImplícito, color: oportunidad ? '#10b981' : '#f43f5e' }
    ];

    return { cclImplícito, desarbitraje, oportunidad, chartData };
  }, [precioLocal, precioUSA, ratio, cclMercado, ticker]);

  const formatCurrency = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(val);

  return (
    <ToolLayout 
      title="Escáner de Arbitraje CEDEARs" 
      description="Detecta oportunidades de compra comparando el Dólar Implícito de un activo (CCL) contra la cotización general del mercado."
      icon={Globe}
      color="indigo"
    >
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* INPUTS */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
             
             <div className="mb-4">
               <label className="text-xs font-bold text-gray-500 uppercase mb-1">Ticker</label>
               <input type="text" value={ticker} onChange={e => setTicker(e.target.value.toUpperCase())} className="w-full p-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg font-bold dark:text-white" />
             </div>

             <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                   <label className="text-xs font-bold text-gray-500 uppercase mb-1">Precio Local ($)</label>
                   <input type="number" value={precioLocal} onChange={e => setPrecioLocal(Number(e.target.value))} className="w-full p-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg font-bold dark:text-white" />
                </div>
                <div>
                   <label className="text-xs font-bold text-gray-500 uppercase mb-1">Precio USA (US$)</label>
                   <input type="number" value={precioUSA} onChange={e => setPrecioUSA(Number(e.target.value))} className="w-full p-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg font-bold dark:text-white" />
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                   <label className="text-xs font-bold text-gray-500 uppercase mb-1">Ratio (X:1)</label>
                   <input type="number" value={ratio} onChange={e => setRatio(Number(e.target.value))} className="w-full p-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg font-bold dark:text-white" />
                </div>
                <div>
                   <label className="text-xs font-bold text-gray-500 uppercase mb-1">CCL Referencia</label>
                   <input type="number" value={cclMercado} onChange={e => setCclMercado(Number(e.target.value))} className="w-full p-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg font-bold dark:text-white" />
                </div>
             </div>
          </div>
        </div>

        {/* ANALYTICS */}
        <div className="lg:col-span-8 flex flex-col gap-6">
           <div className={`p-6 rounded-2xl border-2 transition-all flex items-center justify-between ${analisis.oportunidad ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-500' : 'bg-rose-50 dark:bg-rose-900/10 border-rose-500'}`}>
              <div>
                 <h3 className={`text-xl font-black uppercase ${analisis.oportunidad ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                    {analisis.oportunidad ? '¡OPORTUNIDAD DE COMPRA!' : 'CEDEAR CARO (SOBREVALUADO)'}
                 </h3>
                 <p className="text-gray-600 dark:text-slate-300 mt-1">
                    El dólar implícito de {ticker} está un <span className="font-bold">{Math.abs(analisis.desarbitraje).toFixed(2)}%</span> {analisis.oportunidad ? 'debajo' : 'encima'} del mercado.
                 </p>
              </div>
              <div className="text-right">
                 <p className="text-xs font-bold text-gray-500 uppercase">CCL Implícito</p>
                 <p className={`text-4xl font-black ${analisis.oportunidad ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {formatCurrency(analisis.cclImplícito)}
                 </p>
              </div>
           </div>

           <div className="flex-1 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm min-h-[300px]">
             <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-6">Comparativa de Tipos de Cambio</h4>
             <div className="w-full h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analisis.chartData} layout="vertical" margin={{left: 20}}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#334155" opacity={0.2} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', backgroundColor: '#0f172a', border: 'none', color: '#fff' }} formatter={(val) => formatCurrency(val)} />
                    <ReferenceLine x={cclMercado} stroke="#64748b" strokeDasharray="3 3" />
                    <Bar dataKey="valor" radius={[0, 4, 4, 0]} barSize={40}>
                      {analisis.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
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