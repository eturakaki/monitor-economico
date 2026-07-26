import React, { useState, useMemo } from 'react';
import { Truck, Package, AlertCircle } from 'lucide-react';
import { ToolLayout } from '../../../components/ToolLayout';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function CalculadoraCourier() {
  const [valorProducto, setValorProducto] = useState(150); // USD
  const [costoEnvio, setCostoEnvio] = useState(30); // USD
  const [usarFranquicia, setUsarFranquicia] = useState(true); 

  // --- LÓGICA DE NEGOCIO ---
  const analisis = useMemo(() => {
    const baseImponible = valorProducto + costoEnvio;
    
    let montoGravable = baseImponible;
    let descuentoFranquicia = 0; // <--- VARIABLE PREVIAMENTE SIN USO

    if (usarFranquicia) {
       if (baseImponible > 50) {
          montoGravable = baseImponible - 50;
          descuentoFranquicia = 50;
       } else {
          montoGravable = 0;
          descuentoFranquicia = baseImponible;
       }
    }

    const impuestosAduana = montoGravable * 0.50; 
    const totalPagar = baseImponible + impuestosAduana;

    const chartData = [
      { name: 'Producto + Envío', value: baseImponible, color: '#3b82f6' }, 
      { name: 'Impuestos Aduana', value: impuestosAduana, color: '#f43f5e' } 
    ];

    // AHORA RETORNAMOS descuentoFranquicia PARA USARLO EN EL JSX
    return { baseImponible, impuestosAduana, totalPagar, chartData, descuentoFranquicia };
  }, [valorProducto, costoEnvio, usarFranquicia]);

  const formatUSD = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <ToolLayout 
      title="Calculadora Courier" 
      description="Estima los impuestos de importación para compras en el exterior vía Courier Privado (Amazon, DHL, etc)."
      icon={Truck}
      color="slate"
    >
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* INPUTS */}
        <div className="lg:col-span-5 space-y-6">
           <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-md">
              <div className="mb-4">
                 <label className="text-xs font-bold text-slate-500 uppercase mb-1">Valor Producto (FOB)</label>
                 <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-400 font-bold">USD</span>
                    <input type="number" value={valorProducto} onChange={e => setValorProducto(Number(e.target.value))} className="w-full pl-12 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg font-bold dark:text-white" />
                 </div>
              </div>

              <div className="mb-6">
                 <label className="text-xs font-bold text-slate-500 uppercase mb-1">Costo de Envío (Shipping)</label>
                 <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-400 font-bold">USD</span>
                    <input type="number" value={costoEnvio} onChange={e => setCostoEnvio(Number(e.target.value))} className="w-full pl-12 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg font-bold dark:text-white" />
                 </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                 <div>
                    <p className="font-bold text-sm text-slate-800 dark:text-white">Aplicar Franquicia</p>
                    <p className="text-xs text-slate-500">Descuenta USD 50 de la base</p>
                 </div>
                 <input type="checkbox" checked={usarFranquicia} onChange={e => setUsarFranquicia(e.target.checked)} className="w-5 h-5 accent-blue-600 rounded" />
              </div>
           </div>

           <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800/30 flex gap-3 text-amber-800 dark:text-amber-300 text-xs">
              <AlertCircle className="shrink-0" size={16}/>
              <p>El límite por envío es de USD 1.000 y 50kg. Si superas estos límites, pasa a Régimen General (Despachante).</p>
           </div>
        </div>

        {/* RESULTADOS */}
        <div className="lg:col-span-7 flex flex-col gap-6">
           <div className="bg-slate-900 p-6 rounded-2xl text-white flex justify-between items-center relative overflow-hidden">
               <div className="absolute -left-4 -bottom-4 opacity-10 rotate-12">
                  <Package size={120} />
               </div>
               <div className="relative z-10">
                  <p className="text-slate-400 font-bold uppercase text-xs mb-1">Costo Total Final</p>
                  <p className="text-4xl font-black">{formatUSD(analisis.totalPagar)}</p>
               </div>
               <div className="text-right relative z-10">
                  <p className="text-xs font-bold uppercase text-rose-400">Impuestos</p>
                  <p className="text-2xl font-bold">+{formatUSD(analisis.impuestosAduana)}</p>
                  
                  {/* AQUI MOSTRAMOS EL DESCUENTO SI EXISTE */}
                  {analisis.descuentoFranquicia > 0 && (
                     <p className="text-[10px] font-bold text-emerald-400 mt-1">
                        Ahorro Franquicia: -{formatUSD(analisis.descuentoFranquicia)}
                     </p>
                  )}
               </div>
           </div>

           <div className="flex-1 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-md min-h-[300px]">
             <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 text-center">Composición del Costo</h4>
             <div className="w-full h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={analisis.chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {analisis.chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(val) => formatUSD(val)} contentStyle={{backgroundColor: '#0f172a', borderRadius: '8px', border:'none', color:'#fff'}} />
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
