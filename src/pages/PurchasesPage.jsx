import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Calendar, CreditCard, ChevronRight, ShoppingBag } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export default function PurchasesPage() {
  const { orders } = useShop();

  // Helper: Formatear Fecha
  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString('es-AR', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  // Helper: Formatear Moneda
  const formatPrice = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency', currency: 'ARS', minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-slate-200 dark:bg-[#0B1121] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Historial de Compras
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Gestiona tus recibos y estados de envío.
            </p>
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 border-dashed">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                <ShoppingBag size={32} className="text-slate-600 dark:text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No tienes compras registradas</h3>
            <p className="text-slate-500 text-center max-w-sm mb-8">
              Tus suscripciones y libros aparecerán aquí una vez confirmes el pago.
            </p>
            <Link to="/libreria" className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all">
                Ir a la Tienda
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-800 p-6 transition-all hover:shadow-lg">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center shrink-0">
                            <Package size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-400">#{order.id}</span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                                    {order.status === 'approved' ? 'Aprobado' : order.status}
                                </span>
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                                {order.items.length} {order.items.length === 1 ? 'Producto' : 'Productos'}
                            </h3>
                            <div className="flex items-center gap-4 text-xs text-slate-500 mt-1 font-medium">
                                <span className="flex items-center gap-1"><Calendar size={12}/> {formatDate(order.date)}</span>
                                <span className="flex items-center gap-1"><CreditCard size={12}/> {order.paymentMethod}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                        <div className="text-right">
                            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Total</p>
                            <p className="font-mono text-xl font-black text-slate-900 dark:text-white">
                                {formatPrice(order.total)}
                            </p>
                        </div>
                        <button className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition-colors">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}