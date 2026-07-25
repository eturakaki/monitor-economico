import React, { useState, useMemo } from 'react';
import { Layers, Plus, Trash2, ArrowRight } from 'lucide-react';
import { ToolLayout } from '../../../components/ToolLayout';
import { financial } from '../../../utils/formulas';

export function ConsolidadorDeudas() {
  // Lista de deudas actuales
  const [deudas, setDeudas] = useState([
    { id: 1, nombre: 'Tarjeta Visa', saldo: 150000, cuota: 35000 },
    { id: 2, nombre: 'Préstamo Personal', saldo: 300000, cuota: 45000 },
  ]);
  const [newDeuda, setNewDeuda] = useState({ nombre: '', saldo: '', cuota: '' });

  // Condiciones del Nuevo Préstamo Consolidador
  const [nuevaTNA, setNuevaTNA] = useState(75); // Tasa de mercado
  const [nuevoPlazo, setNuevoPlazo] = useState(24); // Meses

  // --- CÁLCULOS ---
  const analisis = useMemo(() => {
    // Situación Actual
    const totalDeuda = deudas.reduce((acc, d) => acc + d.saldo, 0);
    const totalCuotaActual = deudas.reduce((acc, d) => acc + d.cuota, 0);

    // Situación Nueva (Simulada)
    // Calculamos la cuota de un préstamo por el totalDeuda con la nuevaTNA
    const nuevaCuota = financial.credit.frenchAmortization(totalDeuda, nuevaTNA, nuevoPlazo);
    
    const ahorroMensual = totalCuotaActual - nuevaCuota;
    const conviene = ahorroMensual > 0;

    return { totalDeuda, totalCuotaActual, nuevaCuota, ahorroMensual, conviene };
  }, [deudas, nuevaTNA, nuevoPlazo]);

  const agregarDeuda = () => {
    if (!newDeuda.nombre || !newDeuda.saldo || !newDeuda.cuota) return;
    setDeudas([...deudas, { ...newDeuda, id: Date.now(), saldo: Number(newDeuda.saldo), cuota: Number(newDeuda.cuota) }]);
    setNewDeuda({ nombre: '', saldo: '', cuota: '' });
  };

  const eliminarDeuda = (id) => setDeudas(deudas.filter(d => d.id !== id));
  const formatMoney = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);

  return (
    <ToolLayout 
      title="Consolidador de Deudas" 
      description="¿Te conviene sacar un préstamo nuevo para cancelar todas tus deudas viejas? Compara tu flujo de caja mensual."
      icon={Layers}
      color="indigo"
    >
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* PANEL IZQUIERDO: TUS DEUDAS */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
           <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Tus Deudas Actuales</h3>
           
           <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto">
              {deudas.map((item) => (
                 <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-950 rounded-lg border border-gray-100 dark:border-slate-800">
                    <div>
                       <p className="font-bold text-gray-800 dark:text-white text-sm">{item.nombre}</p>
                       <p className="text-xs text-gray-500">Saldo: {formatMoney(item.saldo)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                       <span className="text-sm font-bold text-rose-500">{formatMoney(item.cuota)}/mes</span>
                       <button onClick={() => eliminarDeuda(item.id)} className="text-gray-400 hover:text-rose-500"><Trash2 size={16}/></button>
                    </div>
                 </div>
              ))}
           </div>

           {/* Agregar Deuda */}
           <div className="grid grid-cols-12 gap-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
              <div className="col-span-4">
                 <input type="text" placeholder="Nombre" value={newDeuda.nombre} onChange={e => setNewDeuda({...newDeuda, nombre: e.target.value})} className="w-full p-2 rounded bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs" />
              </div>
              <div className="col-span-3">
                 <input type="number" placeholder="Saldo Total" value={newDeuda.saldo} onChange={e => setNewDeuda({...newDeuda, saldo: e.target.value})} className="w-full p-2 rounded bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs" />
              </div>
              <div className="col-span-3">
                 <input type="number" placeholder="Cuota Mensual" value={newDeuda.cuota} onChange={e => setNewDeuda({...newDeuda, cuota: e.target.value})} className="w-full p-2 rounded bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs" />
              </div>
              <div className="col-span-2">
                 <button onClick={agregarDeuda} className="w-full h-full bg-indigo-600 hover:bg-indigo-700 text-white rounded flex items-center justify-center"><Plus size={16}/></button>
              </div>
           </div>
        </div>

        {/* PANEL DERECHO: COMPARACIÓN */}
        <div className="lg:col-span-6 flex flex-col gap-6">
           
           {/* Configuración Nuevo Préstamo */}
           <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Nuevo Préstamo Unificado</h3>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1">Monto a Solicitar</label>
                    <div className="text-xl font-black text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700 pb-1">
                       {formatMoney(analisis.totalDeuda)}
                    </div>
                 </div>
                 <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1">Nueva TNA (%)</label>
                    <input type="number" value={nuevaTNA} onChange={e => setNuevaTNA(Number(e.target.value))} className="w-full font-bold bg-transparent outline-none border-b border-gray-200 dark:border-slate-700 pb-1 dark:text-white" />
                 </div>
                 <div className="col-span-2">
                    <label className="text-xs font-bold text-gray-500 block mb-1">Plazo (Meses): {nuevoPlazo}</label>
                    <input type="range" min="12" max="60" step="6" value={nuevoPlazo} onChange={e => setNuevoPlazo(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-indigo-600" />
                 </div>
              </div>
           </div>

           {/* Resultado Final */}
           <div className={`flex-1 p-6 rounded-2xl border-2 flex flex-col justify-center items-center text-center ${analisis.conviene ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-500' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'}`}>
              
              <div className="flex items-center gap-8 mb-6 w-full justify-center">
                 <div>
                    <p className="text-xs font-bold uppercase text-gray-500">Pagas Hoy</p>
                    <p className="text-2xl font-black text-gray-900 dark:text-white">{formatMoney(analisis.totalCuotaActual)}</p>
                 </div>
                 <ArrowRight className="text-gray-400" />
                 <div>
                    <p className="text-xs font-bold uppercase text-gray-500">Nueva Cuota</p>
                    <p className={`text-2xl font-black ${analisis.conviene ? 'text-emerald-600' : 'text-indigo-600'}`}>{formatMoney(analisis.nuevaCuota)}</p>
                 </div>
              </div>

              {analisis.conviene ? (
                 <div className="bg-white dark:bg-slate-900 px-6 py-2 rounded-full shadow-sm border border-emerald-200 dark:border-emerald-800">
                    <p className="text-emerald-700 dark:text-emerald-400 font-bold">
                       Ahorras {formatMoney(analisis.ahorroMensual)} por mes
                    </p>
                 </div>
              ) : (
                 <p className="text-sm text-gray-500">
                    No hay ahorro mensual. Revisa si puedes conseguir una mejor tasa o extender el plazo.
                 </p>
              )}

           </div>

        </div>
      </div>
    </ToolLayout>
  );
}