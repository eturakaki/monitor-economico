import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Importamos el cerebro

export const UserMenu = () => {
  const { user, logout } = useAuth(); // Hook para obtener datos
  const [isOpen, setIsOpen] = useState(false);

  // ESTADO 1: NO LOGUEADO (GUEST)
  if (!user) {
    return (
      <div className="flex items-center gap-3">
        {/* Login: Discreto, opacidad media */}
        <Link 
          to="/login" 
          className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          Ingresar
        </Link>
        
        {/* Registro: CTA Principal, tracking amplio */}
        <Link 
          to="/register" 
          className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 hover:scale-105 transition-all"
        >
          Crear Cuenta
        </Link>
      </div>
    );
  }

  // ESTADO 2: LOGUEADO (USER)
  return (
    <div className="relative">
      {/* Trigger del Menú (Avatar + Nombre) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 group focus:outline-none"
      >
        <div className="text-right hidden md:block">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-emerald-500 transition-colors">
            {user.name}
          </p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500/80">
            {user.plan || 'Free'} {/* Muestra el plan o Free por defecto */}
          </p>
        </div>
        
        <img 
          src={user.avatar} 
          alt="Avatar" 
          className="h-9 w-9 rounded-full ring-2 ring-slate-100 dark:ring-slate-800 group-hover:ring-emerald-500 transition-all"
        />
      </button>

      {/* Dropdown Menu (Flotante) */}
      {isOpen && (
        <>
          {/* Overlay invisible para cerrar al hacer click afuera */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl z-50 py-1 animation-fade-in-down">
            <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-400">Logueado como</p>
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.email}</p>
            </div>
            
            <Link to="/planes" className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
              Mejorar Plan
            </Link>
            
            <button 
              onClick={() => { logout(); setIsOpen(false); }}
              className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </>
      )}
    </div>
  );
};