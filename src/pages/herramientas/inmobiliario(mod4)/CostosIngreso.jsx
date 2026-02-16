import React, { useState, useMemo } from 'react';
import { LogIn, Truck, ShieldCheck, Banknote } from 'lucide-react';
import { ToolLayout } from '../../../components/ToolLayout';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function CostosIngreso() {
  const [alquiler, setAlquiler] = useState(250000);
  const [expensas, setExpensas] = useState(40000); // <--- AHORA SÍ LO USAREMOS
  const [mesesDeposito, setMesesDeposito] = useState(1);
  const [comision, setComision] = useState(4.15); 
  const [garantia, setGarantia] = useState(200000); 
  const [mudanza, setMudanza] = useState(150000); 

  const analisis = useMemo(() => {
    const costoDeposito = alquiler * mesesDeposito;
    const costoComision = (alquiler * 36) * (comision / 100); 
    
    // Sumamos expensas al total (Primer mes de gasto)
    const total = alquiler + expensas + costoDeposito + garantia + mudanza + costoComision;

    const chartData = [
      { name: 'Mes Adelanto', value: alquiler, color: '#10b981' },
      { name: 'Expensas (1° Mes)', value: expensas, color: '#6366f1' }, // <--- Nuevo en Gráfico
      { name: 'Depósito', value: costoDeposito, color: '#3b82f6' },
      { name: 'Comisión', value: costoComision, color: '#f59e0b' },
      { name: 'Garantía', value: garantia, color: '#8b5cf6' },
      { name: 'Mudanza', value: mudanza, color: '#64748b' },
    ];

    return { total, chartData };
  }, [alquiler, expensas, mesesDeposito, comision, garantia, mudanza]);

  const formatMoney = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);

  return (
    <ToolLayout 
      title="Costos de Ingreso" 
      description="Calculadora integral para mudanzas. Estima el capital total necesario para firmar contrato y entrar a tu nuevo hogar."
      icon={LogIn}
      color="slate"
    >
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* INPUTS */}
        <div className="lg:col-span-5 space-y-6">
           <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
              
              <div className="mb-4">
                 <label className="text-xs font-bold text-gray-500 uppercase mb-1">Valor Alquiler Mensual</label>
                 <input type="number" value={alquiler} onChange={e => setAlquiler(Number(e.target.value))} className="w-full p-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg font-bold dark:text-white" />
              </div>

              {/* NUEVO INPUT: EXPENSAS */}
              <div className="mb-4">
                 <label className="text-xs font-bold text-gray-500 uppercase mb-1">Expensas Ordinarias</label>
                 <input type="number" value={expensas} onChange={e => setExpensas(Number(e.target.value))} className="w-full p-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg font-bold dark:text-white" />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1">Meses Depósito</label>
                    <input type="number" value={mesesDeposito} onChange={e => setMesesDeposito(Number(e.target.value))} className="w-full p-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg font-bold dark:text-white" />
                 </div>
                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1">Comisión (%)</label>
                    <input type="number" value={comision} onChange={e => setComision(Number(e.target.value))} className="w-full p-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg font-bold dark:text-white" />
                 </div>
              </div>
              <div className="mb-4">
                 <label className="text-xs font-bold text-gray-500 uppercase mb-1">Costo Garantía / Caución</label>
                 <input type="number" value={garantia} onChange={e => setGarantia(Number(e.target.value))} className="w-full p-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg font-bold dark:text-white" />
              </div>
              <div className="mb-4">
                 <label className="text-xs font-bold text-gray-500 uppercase mb-1">Flete y Mudanza</label>
                 <input type="number" value={mudanza} onChange={e => setMudanza(Number(e.target.value))} className="w-full p-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg font-bold dark:text-white" />
              </div>
           </div>
        </div>

        {/* RESULTADOS */}
        <div className="lg:col-span-7 flex flex-col gap-6">
           <div className="bg-slate-900 p-6 rounded-2xl text-white text-center relative overflow-hidden">
               <div className="absolute top-0 right-0 p-16 bg-slate-700/30 blur-3xl rounded-full"></div>
               <p className="text-slate-400 font-bold uppercase text-xs mb-2">Capital Total Requerido</p>
               <p className="text-5xl font-black mb-2">{formatMoney(analisis.total)}</p>
               <p className="text-xs text-slate-400">Equivale a aprox. {(analisis.total / alquiler).toFixed(1)} alquileres</p>
           </div>

           <div className="flex-1 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm min-h-[300px]">
             <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 text-center">Estructura de Costos</h4>
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