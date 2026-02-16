import React, { useState } from 'react';
import { Banknote, ArrowDown, Bitcoin, Building2, User } from 'lucide-react';
import { ToolLayout } from '../../../components/ToolLayout';

export function RutasDolar() {
  const [montoUSD, setMontoUSD] = useState(1000);
  
  // Cotizaciones MOCK (En el futuro esto vendrá de tu API 'monitores.js')
  // Le agregamos un "spread" simulado para hacer el cálculo realista
  const precios = {
    mep: { compra: 1140, comision: 1.5 }, // Comision Broker
    blue: { compra: 1180, comision: 0 },
    cripto: { compra: 1165, comision: 0.1 } // Comision Exchange
  };

  const calcularCosto = (tipo) => {
    const precioBase = precios[tipo].compra;
    const costoBruto = montoUSD * precioBase;
    const costoComision = costoBruto * (precios[tipo].comision / 100);
    return costoBruto + costoComision;
  };

  const opciones = [
    {
       id: 'mep',
       titulo: 'Dólar MEP (Bolsa)',
       icon: Building2,
       color: 'indigo',
       precio: precios.mep.compra,
       total: calcularCosto('mep'),
       detalle: `Incluye ${precios.mep.comision}% de comisión broker`
    },
    {
       id: 'cripto',
       titulo: 'Dólar Cripto (USDT)',
       icon: Bitcoin,
       color: 'emerald',
       precio: precios.cripto.compra,
       total: calcularCosto('cripto'),
       detalle: 'Cotización P2P / Exchange promedio'
    },
    {
       id: 'blue',
       titulo: 'Dólar Blue (Informal)',
       icon: User,
       color: 'slate',
       precio: precios.blue.compra,
       total: calcularCosto('blue'),
       detalle: 'Mercado paralelo (Efectivo)'
    }
  ].sort((a,b) => a.total - b.total); // Ordenar del más barato al más caro

  const mejorOpcion = opciones[0];

  return (
    <ToolLayout title="Comparador de Dolarización" description="Encuentra la ruta más eficiente para comprar dólares hoy." icon={Banknote} color="emerald">
       
       <div className="max-w-3xl mx-auto space-y-8">
          {/* Input Principal */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm text-center">
             <label className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 block">Quiero comprar</label>
             <div className="flex justify-center items-center gap-2">
                <span className="text-4xl font-black text-gray-300">US$</span>
                <input type="number" value={montoUSD} onChange={e => setMontoUSD(Number(e.target.value))} className="w-48 text-5xl font-black text-center bg-transparent outline-none text-gray-900 dark:text-white border-b-2 border-gray-200 dark:border-slate-700 focus:border-emerald-500 transition-colors" />
             </div>
          </div>

          {/* Lista de Opciones (Ranking) */}
          <div className="space-y-4">
             {opciones.map((opcion, index) => (
                <div key={opcion.id} className={`relative p-6 rounded-2xl border-2 transition-all flex items-center gap-4 ${index === 0 ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10 shadow-lg scale-[1.02]' : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900'}`}>
                   
                   {index === 0 && (
                      <div className="absolute -top-3 left-6 bg-emerald-500 text-white text-[10px] font-black uppercase px-2 py-1 rounded-full">
                         Mejor Precio
                      </div>
                   )}

                   <div className={`p-4 rounded-xl ${index === 0 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-gray-100 dark:bg-slate-800 text-gray-400'}`}>
                      <opcion.icon size={24} />
                   </div>

                   <div className="flex-1">
                      <h4 className="font-bold text-gray-900 dark:text-white text-lg">{opcion.titulo}</h4>
                      <p className="text-xs text-gray-500">{opcion.detalle}</p>
                   </div>

                   <div className="text-right">
                      <p className="text-2xl font-black text-gray-900 dark:text-white">${new Intl.NumberFormat('es-AR').format(Math.round(opcion.total))}</p>
                      <p className="text-xs font-bold text-gray-400">Tipo de cambio: ${opcion.precio}</p>
                   </div>
                </div>
             ))}
          </div>

          <div className="text-center text-sm text-gray-400">
             <p>* Las cotizaciones incluyen comisiones estimadas y pueden variar según tu operador.</p>
          </div>
       </div>

    </ToolLayout>
  );
}
