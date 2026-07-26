import React, { useState } from 'react';
import { Percent, Plus, Trash2 } from 'lucide-react';
import { ToolLayout } from '../../../components/ToolLayout';
import { financial } from '../../../utils/formulas';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function MiIPC() {
  const [items, setItems] = useState([
    { id: 1, categoria: 'Alimentos y Bebidas', gasto: 150000, inflacion: 6.0 },
    { id: 2, categoria: 'Vivienda y Servicios', gasto: 80000, inflacion: 4.5 },
    { id: 3, categoria: 'Transporte', gasto: 40000, inflacion: 8.0 },
  ]);

  const [newItem, setNewItem] = useState({ categoria: '', gasto: '', inflacion: '' });

  // --- CÁLCULOS ---
  // AHORA USAMOS ESTA VARIABLE EN EL RENDER (Línea 96 aprox)
  const totalGasto = items.reduce((acc, item) => acc + item.gasto, 0); 
  
  const miInflacion = financial.inflation.personalInflation(items.map(i => ({ gasto: i.gasto, inflacionCategoria: i.inflacion })));

  // Data para Gráfico
  const chartData = items.map(i => ({ name: i.categoria, value: i.gasto }));
  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f43f5e', '#f59e0b', '#64748b'];

  const agregarItem = () => {
    if(!newItem.categoria || !newItem.gasto || !newItem.inflacion) return;
    setItems([...items, { ...newItem, id: Date.now(), gasto: Number(newItem.gasto), inflacion: Number(newItem.inflacion) }]);
    setNewItem({ categoria: '', gasto: '', inflacion: '' });
  };

  const eliminarItem = (id) => setItems(items.filter(i => i.id !== id));
  
  const formatMoney = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);

  return (
    <ToolLayout title="Mi Inflación Personal" description="Calcula tu propia tasa de inflación ponderando tus gastos reales. El INDEC es un promedio; descubre tu realidad." icon={Percent} color="rose">
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* PANEL DE CARGA */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-md">
          <h3 className="text-sm font-bold text-slate-500 uppercase mb-4">Desglose de Gastos</h3>

          <div className="space-y-3 mb-6">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800">
                <div>
                  <p className="font-bold text-slate-800 dark:text-white">{item.categoria}</p>
                  <p className="text-xs text-slate-500">{formatMoney(item.gasto)} • Inflación: <span className="text-rose-500">{item.inflacion}%</span></p>
                </div>
                <button onClick={() => eliminarItem(item.id)} className="text-slate-600 dark:text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={18}/></button>
              </div>
            ))}
          </div>

          {/* Formulario Agregar */}
          <div className="grid grid-cols-12 gap-2 items-end bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
            <div className="col-span-5">
              <label className="text-xs text-slate-500 block mb-1">Categoría</label>
              <input type="text" placeholder="Ej: Educación" value={newItem.categoria} onChange={e => setNewItem({...newItem, categoria: e.target.value})} className="w-full p-2 rounded-lg text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700" />
            </div>
            <div className="col-span-3">
              <label className="text-xs text-slate-500 block mb-1">Gasto ($)</label>
              <input type="number" placeholder="50000" value={newItem.gasto} onChange={e => setNewItem({...newItem, gasto: e.target.value})} className="w-full p-2 rounded-lg text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700" />
            </div>
            <div className="col-span-2">
               <label className="text-xs text-slate-500 block mb-1">Infl. %</label>
               <input type="number" placeholder="5" value={newItem.inflacion} onChange={e => setNewItem({...newItem, inflacion: e.target.value})} className="w-full p-2 rounded-lg text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700" />
            </div>
            <div className="col-span-2">
              <button onClick={agregarItem} className="w-full p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex justify-center items-center transition-colors"><Plus size={20}/></button>
            </div>
          </div>
        </div>

        {/* RESULTADOS */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-slate-900 dark:bg-black p-6 rounded-2xl border border-slate-800 text-center relative overflow-hidden">
             <div className="absolute top-0 right-0 p-16 bg-rose-500/10 blur-3xl rounded-full"></div>
             
             <p className="text-slate-400 text-sm uppercase font-bold mb-2">Tu Inflación Ponderada</p>
             <p className="text-5xl font-black text-white">{miInflacion.toFixed(2)}%</p>
             <p className="text-slate-500 text-xs mt-2">Promedio mensual ponderado</p>

             {/* AQUÍ USAMOS LA VARIABLE PARA MOSTRAR EL TOTAL */}
             <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center">
                <span className="text-xs text-slate-400 font-bold uppercase">Gasto Analizado</span>
                <span className="text-lg font-bold text-white">{formatMoney(totalGasto)}</span>
             </div>
          </div>

          <div className="flex-1 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-md min-h-[300px]">
             <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 text-center">Composición de tu Gasto</h4>
             <div className="w-full h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
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