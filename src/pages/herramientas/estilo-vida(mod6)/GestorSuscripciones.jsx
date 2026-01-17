import React, { useState } from 'react';
import { Tv, Plus, Trash2 } from 'lucide-react';
import { ToolLayout } from '../../../components/ToolLayout';

export function GestorSuscripciones() {
  const [items, setItems] = useState([
    { id: 1, nombre: 'Netflix Premium', precio: 15.99, moneda: 'USD' },
    { id: 2, nombre: 'Spotify Individual', precio: 5990, moneda: 'ARS' },
    { id: 3, nombre: 'Google Drive', precio: 2.99, moneda: 'USD' },
  ]);

  const [newItem, setNewItem] = useState({ nombre: '', precio: '', moneda: 'USD' });
  const [dolarTarjeta, setDolarTarjeta] = useState(1350);
  
  // Impuestos Digitales (PAIS 8% + IVA 21% + Ganancias 30% = ~59-60%)
  // Nota: Si es en pesos pero servicio extranjero, también aplica impuestos muchas veces.
  const TAX_DIGITAL = 0.59; 

  const calcularTotal = () => {
    return items.reduce((acc, item) => {
       let costoFinal = 0;
       if (item.moneda === 'USD') {
          // USD se pesifica al tarjeta
          costoFinal = item.precio * dolarTarjeta; 
       } else {
          // ARS (Lista) + Impuestos (Si el proveedor es del exterior cobrando en pesos)
          // Asumimos que el precio de lista NO incluye impuestos (ej: Spotify)
          costoFinal = item.precio * (1 + TAX_DIGITAL);
       }
       return acc + costoFinal;
    }, 0);
  };

  const totalMensual = calcularTotal();
  const totalAnual = totalMensual * 12;

  const agregarItem = () => {
     if(!newItem.nombre || !newItem.precio) return;
     setItems([...items, { ...newItem, id: Date.now(), precio: Number(newItem.precio) }]);
     setNewItem({ nombre: '', precio: '', moneda: 'USD' });
  };

  const eliminarItem = (id) => setItems(items.filter(i => i.id !== id));

  const formatMoney = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);

  return (
    <ToolLayout 
      title="Gestor de Suscripciones" 
      description="El 'Efecto Hormiga'. Calcula el costo real final (con impuestos del 59%) de tus servicios digitales."
      icon={Tv}
      color="rose"
    >
       <div className="grid lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
             <div className="mb-6 flex gap-4 items-center p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                <label className="text-xs font-bold text-gray-500 uppercase">Dólar Tarjeta:</label>
                <input type="number" value={dolarTarjeta} onChange={e => setDolarTarjeta(Number(e.target.value))} className="bg-transparent font-bold border-b border-gray-300 dark:border-slate-600 w-20 outline-none dark:text-white" />
             </div>

             <div className="space-y-2 mb-6">
                {items.map(item => (
                   <div key={item.id} className="flex justify-between items-center p-3 bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-800 rounded-lg">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 font-bold text-xs">
                            {item.nombre.charAt(0)}
                         </div>
                         <div>
                            <p className="font-bold text-sm dark:text-white">{item.nombre}</p>
                            <p className="text-xs text-gray-500">{item.moneda} {item.precio}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-4">
                         <span className="font-bold text-sm text-gray-700 dark:text-gray-300">
                            {formatMoney(item.moneda === 'USD' ? item.precio * dolarTarjeta : item.precio * (1 + TAX_DIGITAL))}
                         </span>
                         <button onClick={() => eliminarItem(item.id)} className="text-gray-300 hover:text-rose-500"><Trash2 size={16}/></button>
                      </div>
                   </div>
                ))}
             </div>

             {/* Formulario Add */}
             <div className="grid grid-cols-12 gap-2">
                <div className="col-span-5">
                   <input type="text" placeholder="Servicio (ej: HBO)" value={newItem.nombre} onChange={e => setNewItem({...newItem, nombre: e.target.value})} className="w-full p-2 text-sm bg-gray-50 dark:bg-slate-800 rounded-lg border-none" />
                </div>
                <div className="col-span-3">
                   <input type="number" placeholder="Precio" value={newItem.precio} onChange={e => setNewItem({...newItem, precio: e.target.value})} className="w-full p-2 text-sm bg-gray-50 dark:bg-slate-800 rounded-lg border-none" />
                </div>
                <div className="col-span-2">
                   <select value={newItem.moneda} onChange={e => setNewItem({...newItem, moneda: e.target.value})} className="w-full p-2 text-sm bg-gray-50 dark:bg-slate-800 rounded-lg border-none dark:text-white">
                      <option value="USD">USD</option>
                      <option value="ARS">ARS</option>
                   </select>
                </div>
                <div className="col-span-2">
                   <button onClick={agregarItem} className="w-full h-full bg-rose-600 hover:bg-rose-700 text-white rounded-lg flex items-center justify-center"><Plus size={18}/></button>
                </div>
             </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
             <div className="bg-rose-500 p-8 rounded-2xl text-white text-center shadow-lg shadow-rose-500/30">
                <p className="text-rose-100 font-bold uppercase text-xs mb-2">Gasto Mensual Total</p>
                <p className="text-5xl font-black mb-2">{formatMoney(totalMensual)}</p>
                <p className="text-sm text-rose-100 opacity-80">Incluye ~60% Impuestos</p>
             </div>
             
             <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 text-center">
                <p className="text-gray-500 font-bold uppercase text-xs mb-2">Proyección Anual</p>
                <p className="text-3xl font-black text-gray-900 dark:text-white">{formatMoney(totalAnual)}</p>
                <p className="text-xs text-gray-400 mt-2">¿Vale la pena ese gasto?</p>
             </div>
          </div>

       </div>
    </ToolLayout>
  );
}