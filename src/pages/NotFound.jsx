import { SearchX, ArrowLeft, LayoutGrid } from 'lucide-react';
import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center animate-in fade-in duration-500">
      
      {/* Ícono Ilustrativo Circular (Igual a tu imagen de referencia) */}
      <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-8 border border-gray-100 shadow-inner">
        <SearchX size={48} className="text-gray-300" strokeWidth={1.5} />
      </div>

      {/* Mensaje Principal */}
      <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
        Página no encontrada
      </h1>
      
      <p className="text-slate-500 max-w-md mx-auto mb-10 leading-relaxed font-medium">
        Parece que la dirección es incorrecta o la sección ha sido movida temporalmente.
      </p>

      {/* Botonera de Acción */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-sm sm:max-w-none">
        <Link 
          to="/" 
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-200 transition-all active:scale-95"
        >
          <ArrowLeft size={18} />
          Volver al Inicio
        </Link>

        <Link 
          to="/" 
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-emerald-50 text-emerald-700 font-bold rounded-2xl hover:bg-emerald-100 transition-all active:scale-95"
        >
          <LayoutGrid size={18} />
          Ver Sectores
        </Link>
      </div>

      {/* Decoración sutil 404 de fondo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 opacity-[0.02] pointer-events-none">
        <p className="text-[25rem] font-black select-none">404</p>
      </div>
    </div>
  );
}