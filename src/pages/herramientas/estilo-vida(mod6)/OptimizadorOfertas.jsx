import React, { useState, useMemo } from 'react';
import { Tag, ShoppingBag, Trophy, ArrowRightLeft } from 'lucide-react';
import { ToolLayout } from '../../../components/ToolLayout';

export function OptimizadorOfertas() {
  const [precioLista, setPrecioLista] = useState(5000);
  const [promoA, setPromoA] = useState('70_2da');
  const [promoB, setPromoB] = useState('3x2');

  // Constante de Tipos de Promoción
  const TIPOS_PROMO = useMemo(() => [
    { id: 'sin_promo', label: 'Precio de Lista (Sin Desc.)', factor: 1, unidades: 1 },
    { id: '2x1', label: '2x1 (Llevas 2, Pagas 1)', factor: 0.5, unidades: 2 },
    { id: '3x2', label: '3x2 (Llevas 3, Pagas 2)', factor: 0.6666, unidades: 3 }, 
    { id: '4x3', label: '4x3 (Llevas 4, Pagas 3)', factor: 0.75, unidades: 4 }, 
    { id: '50_2da', label: '50% en la 2da Unidad', factor: 0.75, unidades: 2 }, 
    { id: '70_2da', label: '70% en la 2da Unidad', factor: 0.65, unidades: 2 }, 
    { id: '80_2da', label: '80% en la 2da Unidad', factor: 0.60, unidades: 2 }, 
    { id: '35_off', label: '35% de Descuento Directo', factor: 0.65, unidades: 1 },
    { id: '25_off', label: '25% de Descuento Directo', factor: 0.75, unidades: 1 },
  ], []);

  // Función de cálculo pura
  const calcularMetricas = (idPromo, precioBase, listaPromos) => {
    const promo = listaPromos.find(p => p.id === idPromo) || listaPromos[0];
    
    const precioUnitarioFinal = precioBase * promo.factor;
    const descuentoReal = (1 - promo.factor) * 100;
    const totalTicket = precioUnitarioFinal * promo.unidades;

    return { ...promo, precioUnitarioFinal, descuentoReal, totalTicket };
  };

  const resultadoA = useMemo(() => calcularMetricas(promoA, precioLista, TIPOS_PROMO), [promoA, precioLista, TIPOS_PROMO]);
  const resultadoB = useMemo(() => calcularMetricas(promoB, precioLista, TIPOS_PROMO), [promoB, precioLista, TIPOS_PROMO]);

  const diferencia = resultadoA.precioUnitarioFinal - resultadoB.precioUnitarioFinal;
  const ganador = Math.abs(diferencia) < 0.1 ? 'Empate' : (diferencia < 0 ? 'A' : 'B');

  const formatMoney = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);

  return (
    <ToolLayout 
      title="Optimizador de Ofertas" 
      description="¿Qué conviene más? ¿3x2 o 70% en la segunda unidad? Compara promociones de supermercado y descubre el precio unitario real."
      icon={Tag}
      color="orange"
    >
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* PANEL DE CONTROL */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
              <div className="mb-6">
                 <label className="text-xs font-bold text-gray-500 uppercase mb-1">Precio de Lista (x Unidad)</label>
                 <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                    <input 
                      type="number" 
                      value={precioLista} 
                      onChange={e => setPrecioLista(Number(e.target.value))} 
                      className="w-full pl-8 p-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl text-xl font-black dark:text-white outline-none focus:ring-2 focus:ring-orange-500" 
                    />
                 </div>
              </div>

              <div className="space-y-4">
                 <div className={`p-4 rounded-xl border-2 transition-colors ${ganador === 'A' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' : 'border-gray-200 dark:border-slate-800'}`}>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 flex justify-between items-center">
                       Opción A {ganador === 'A' && <Trophy size={16} className="text-emerald-500"/>}
                    </label>
                    <select value={promoA} onChange={e => setPromoA(e.target.value)} className="w-full p-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-sm font-bold dark:text-white outline-none">
                       {TIPOS_PROMO.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                    </select>
                 </div>

                 <div className="flex justify-center -my-3 relative z-10">
                    <div className="bg-gray-100 dark:bg-slate-800 p-2 rounded-full text-gray-400 border border-gray-200 dark:border-slate-700">
                       <ArrowRightLeft size={16} />
                    </div>
                 </div>

                 <div className={`p-4 rounded-xl border-2 transition-colors ${ganador === 'B' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' : 'border-gray-200 dark:border-slate-800'}`}>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 flex justify-between items-center">
                       Opción B {ganador === 'B' && <Trophy size={16} className="text-emerald-500"/>}
                    </label>
                    <select value={promoB} onChange={e => setPromoB(e.target.value)} className="w-full p-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-sm font-bold dark:text-white outline-none">
                       {TIPOS_PROMO.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                    </select>
                 </div>
              </div>
           </div>
        </div>

        {/* COMPARACIÓN VISUAL (TARJETAS) */}
        <div className="lg:col-span-8 grid sm:grid-cols-2 gap-6">
           <PromoCard 
              titulo="Opción A" 
              datos={resultadoA} 
              esGanador={ganador === 'A'} 
              formatMoney={formatMoney} 
           />
           <PromoCard 
              titulo="Opción B" 
              datos={resultadoB} 
              esGanador={ganador === 'B'} 
              formatMoney={formatMoney} 
           />
        </div>
      </div>
    </ToolLayout>
  );
}

function PromoCard({ titulo, datos, esGanador, formatMoney }) {
   return (
      <div className={`relative p-6 rounded-2xl border-2 transition-all flex flex-col justify-between ${esGanador ? 'border-emerald-500 bg-white dark:bg-slate-900 shadow-xl shadow-emerald-500/10 scale-[1.02]' : 'border-transparent bg-gray-50 dark:bg-slate-900/40 opacity-70 hover:opacity-100'}`}>
         
         {esGanador && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
               Mejor Precio
            </div>
         )}
         
         <div>
            {/* AQUI MOSTRAMOS EL TÍTULO QUE ANTES FALTABA */}
            <div className="mb-4 flex justify-between items-center">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{titulo}</span>
            </div>

            <div className="flex justify-between items-start mb-6">
               <div className={`p-3 rounded-xl ${esGanador ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : 'bg-gray-200 text-gray-500 dark:bg-slate-800'}`}>
                  <ShoppingBag size={24} />
               </div>
               <span className="text-xs font-bold bg-gray-200 dark:bg-slate-800 px-3 py-1 rounded-full text-gray-600 dark:text-gray-300">
                  Llevas {datos.unidades} u.
               </span>
            </div>

            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Precio Real x Unidad</p>
            <p className={`text-4xl font-black mb-2 ${esGanador ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
               {formatMoney(datos.precioUnitarioFinal)}
            </p>
            
            <div className="flex items-center gap-2">
               <span className={`text-sm font-bold px-2 py-0.5 rounded ${esGanador ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-200 text-gray-600 dark:bg-slate-800 dark:text-gray-400'}`}>
                  -{datos.descuentoReal.toFixed(1)}% OFF
               </span>
               <span className="text-xs text-gray-400">Real</span>
            </div>
         </div>

         <div className="mt-8 pt-4 border-t border-gray-200 dark:border-slate-800 flex justify-between items-center">
            <span className="text-xs font-bold text-gray-500 uppercase">Total Ticket</span>
            <span className="font-black text-gray-900 dark:text-white text-lg">{formatMoney(datos.totalTicket)}</span>
         </div>
      </div>
   );
}