import React from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, Receipt, ExternalLink, Clock } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

/**
 * COMPONENTE: WIDGET DE FACTURACIÓN (Resumen)
 * Muestra solo los últimos 3 movimientos para no saturar el perfil.
 * Redirige a /compras para el historial completo.
 */
export const BillingHistoryTab = () => {
  const { orders } = useShop();

  // ⚡ Performance: Solo tomamos las 3 más recientes (suponiendo orden descendente)
  const recentOrders = orders.slice(0, 3);

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString('es-AR', {
      day: 'numeric', month: 'short'
    });
  };

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency', currency: 'ARS', minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Receipt size={20} className="text-slate-600 dark:text-slate-400" />
                Últimos Movimientos
            </h2>
            <p className="text-sm text-slate-500">Resumen rápido de tu actividad reciente.</p>
        </div>
        {/* Link directo a la página completa */}
        <Link 
            to="/compras" 
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
        >
            Ver todo <ChevronRight size={14} />
        </Link>
      </div>

      {recentOrders.length === 0 ? (
        <div className="py-12 text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">No hay transacciones recientes.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recentOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl hover:border-indigo-200 transition-colors group">
                
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        order.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                        <Package size={18} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                            Compra #{order.id.slice(-6)}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="flex items-center gap-1"><Clock size={10} /> {formatDate(order.date)}</span>
                            <span>•</span>
                            <span>{order.items.length} ítems</span>
                        </div>
                    </div>
                </div>

                <div className="text-right">
                    <p className="text-sm font-black text-slate-900 dark:text-white">{formatPrice(order.total)}</p>
                    <span className={`text-[10px] font-bold uppercase ${
                        order.status === 'approved' ? 'text-emerald-500' : 'text-slate-600 dark:text-slate-400'
                    }`}>
                        {order.status}
                    </span>
                </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer del Widget */}
      {recentOrders.length > 0 && (
          <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-xl p-4 flex items-center justify-between">
              <div className="flex gap-3">
                  <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg text-indigo-600">
                      <ExternalLink size={18} />
                  </div>
                  <div>
                      <p className="text-xs font-bold text-indigo-900 dark:text-indigo-200">¿Buscas una factura antigua?</p>
                      <p className="text-[10px] text-indigo-700 dark:text-indigo-400">Todo el historial está en la sección de Compras.</p>
                  </div>
              </div>
              <Link 
                to="/mis-compras" 
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
              >
                Ir a Mis Compras
              </Link>
          </div>
      )}
    </div>
  );
};