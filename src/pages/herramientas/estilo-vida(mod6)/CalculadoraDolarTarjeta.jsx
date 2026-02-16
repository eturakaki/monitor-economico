import React, { useState, useMemo } from 'react';
import { CreditCard, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ToolLayout } from '../../../components/ToolLayout';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function CalculadoraDolarTarjeta() {
  const [consumoUSD, setConsumoUSD] = useState(350);
  const [cotizacionOficial, setCotizacionOficial] = useState(1050);
  const [cotizacionBlue, setCotizacionBlue] = useState(1180);

  // TASAS VIGENTES (Estimadas)
  const TASA_PAIS = 30;
  const TASA_GANANCIAS = 30;
  const TASA_BIENES = 25; // Extra por Qatar
  const LIMITE_QATAR = 300; 

  const analisis = useMemo(() => {
    const esQatar = consumoUSD >= LIMITE_QATAR;
    
    // Si supera 300, TODO el consumo paga Qatar
    const alicuotaBienes = esQatar ? TASA_BIENES : 0; 

    const basePesos = consumoUSD * cotizacionOficial;
    const montoPais = basePesos * (TASA_PAIS / 100);
    const montoGanancias = basePesos * (TASA_GANANCIAS / 100);
    const montoBienes = basePesos * (alicuotaBienes / 100);

    const totalTarjeta = basePesos + montoPais + montoGanancias + montoBienes;
    
    // Comparativa Blue
    const costoBlue = consumoUSD * cotizacionBlue;
    const diferencia = totalTarjeta - costoBlue;
    const convieneTarjeta = totalTarjeta < costoBlue;

    const chartData = [
      { name: 'Oficial Puro', value: basePesos, color: '#3b82f6' },
      { name: 'Imp. PAIS', value: montoPais, color: '#f59e0b' },
      { name: 'Ganancias', value: montoGanancias, color: '#10b981' },
      { name: 'Bienes Pers. (Qatar)', value: montoBienes, color: '#f43f5e' },
    ].filter(d => d.value > 0);

    return { esQatar, totalTarjeta, convieneTarjeta, diferencia, chartData };
  }, [consumoUSD, cotizacionOficial, cotizacionBlue]);

  const formatMoney = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);

  return (
    <ToolLayout 
      title="Dólar Tarjeta & Qatar" 
      description="Calcula cuánto pagarás en pesos por tus consumos en dólares. Detecta si aplica la percepción 'Qatar' (>300 USD)."
      icon={CreditCard}
      color="cyan"
    >
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* INPUTS */}
        <div className="lg:col-span-5 space-y-6">
           <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
              <div className="mb-6">
                 <label className="text-xs font-bold text-gray-500 uppercase mb-1">Consumo Mensual (USD)</label>
                 <input type="number" value={consumoUSD} onChange={e => setConsumoUSD(Number(e.target.value))} className="w-full p-4 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl font-black text-2xl dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none" />
                 <p className="text-xs text-gray-400 mt-2">
                    Límite Qatar: USD {LIMITE_QATAR}. {analisis.esQatar ? <span className="text-rose-500 font-bold">Te pasaste.</span> : <span className="text-emerald-500 font-bold">Estás cubierto.</span>}
                 </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1">Dólar Oficial</label>
                    <input type="number" value={cotizacionOficial} onChange={e => setCotizacionOficial(Number(e.target.value))} className="w-full p-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg font-bold dark:text-white" />
                 </div>
                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1">Dólar Blue</label>
                    <input type="number" value={cotizacionBlue} onChange={e => setCotizacionBlue(Number(e.target.value))} className="w-full p-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg font-bold dark:text-white" />
                 </div>
              </div>
           </div>

           <div className={`p-4 rounded-xl border-2 flex items-center gap-3 ${analisis.convieneTarjeta ? 'bg-emerald-50 border-emerald-500' : 'bg-slate-100 border-slate-300'}`}>
              {analisis.convieneTarjeta ? <CheckCircle2 className="text-emerald-600"/> : <AlertTriangle className="text-slate-500"/>}
              <div>
                 <p className="font-bold text-sm text-gray-900">{analisis.convieneTarjeta ? 'Paga con Tarjeta' : 'Paga con Billetes (Blue)'}</p>
                 <p className="text-xs text-gray-500">Te ahorras {formatMoney(Math.abs(analisis.diferencia))}</p>
              </div>
           </div>
        </div>

        {/* RESULTADOS */}
        <div className="lg:col-span-7 flex flex-col gap-6">
           <div className="bg-cyan-900 p-6 rounded-2xl text-white text-center relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-2 bg-cyan-400"></div>
               <p className="text-cyan-300 font-bold uppercase text-xs mb-2">Total a Pagar en Pesos</p>
               <p className="text-5xl font-black mb-2">{formatMoney(analisis.totalTarjeta)}</p>
               <p className="text-xs text-cyan-200">Tipo de Cambio Implícito: ${ (analisis.totalTarjeta / consumoUSD).toFixed(2) }</p>
           </div>

           <div className="flex-1 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm min-h-[300px]">
             <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 text-center">Impuestos Incluidos</h4>
             <div className="w-full h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={analisis.chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {analisis.chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(val) => formatMoney(val)} contentStyle={{backgroundColor: '#0f172a', borderRadius: '8px', border:'none', color:'#fff'}} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
             </div>
           </div>
        </div>

      </div>
    </ToolLayout>
  );
}
