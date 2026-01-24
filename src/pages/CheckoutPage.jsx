// 1. IMPORTS
// Eliminamos 'useEffect' porque no se estaba usando en la lógica actual.
// Mantenemos 'useState' para el estado de carga (processing).
import { useState } from 'react'; 
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, CreditCard, Loader2 } from 'lucide-react';

export default function CheckoutPage() {
  
  // 2. HOOKS & CONTEXTOS
  // Eliminamos 'cart' de la desestructuración porque el JSX solo usa 'cartTotal'.
  // Si en el futuro quieres mostrar la lista de items aquí, vuelves a agregar 'cart'.
  const { cartTotal } = useShop(); 
  
  // Obtenemos datos del usuario para mostrar "Facturar a..."
  const { user } = useAuth();
  
  // 3. ESTADO LOCAL
  // Controla la UI de "Cargando" cuando el usuario hace clic en pagar.
  const [processing, setProcessing] = useState(false);

  // 4. CONDITIONAL RENDERING (EARLY RETURN)
  // Si estamos procesando el pago, mostramos esta pantalla de carga
  // y detenemos la ejecución del resto del componente.
  if (processing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        {/* Icono animado (spin) */}
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Procesando pago seguro...
        </h2>
        <p className="text-slate-500">No cierres esta ventana.</p>
      </div>
    );
  }

  // 5. RENDER PRINCIPAL
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      
      {/* HEADER DE LA PÁGINA */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 mb-4">
            <ShieldCheck size={32} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            Finalizar Compra
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Estás a un paso de acceder a tus herramientas.
        </p>
      </div>

      {/* TARJETA DE RESUMEN Y PAGO */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">
        
        {/* SECCIÓN 1: DATOS DEL CLIENTE (Read-only) */}
        <div className="flex items-center gap-4 mb-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
            {/* Renderizado condicional del avatar: solo si existe user.avatar */}
            {user?.avatar && (
                <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full" />
            )}
            <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Facturar a:</p>
                {/* Optional chaining (?.) para evitar crash si user es null */}
                <p className="font-bold text-slate-900 dark:text-white">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
        </div>

        {/* SECCIÓN 2: TOTAL A PAGAR */}
        <div className="flex justify-between items-center py-6 border-t border-b border-slate-100 dark:border-slate-800 mb-8">
            <span className="text-lg font-medium text-slate-700 dark:text-slate-300">
                Total a Pagar
            </span>
            {/* Formateador nativo de JavaScript para moneda Argentina */}
            <span className="text-3xl font-black text-emerald-600 font-mono">
                {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(cartTotal)}
            </span>
        </div>

        {/* SECCIÓN 3: ACCIÓN DE PAGO */}
        <button 
            onClick={() => setProcessing(true)} // Activa el loader
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2"
        >
            <CreditCard size={20} />
            Pagar con Tarjeta (Simulación)
        </button>
        
        {/* FOOTER DE SEGURIDAD */}
        <p className="text-center text-xs text-slate-400 mt-4">
            🔒 Transacción encriptada de extremo a extremo.
        </p>
      </div>
    </div>
  );
}