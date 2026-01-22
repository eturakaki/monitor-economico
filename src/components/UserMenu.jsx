import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Sparkles, ChevronDown } from 'lucide-react'; // Agregué iconos para darle toque pro

export const UserMenu = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  
  // 1. CREAMOS UNA REFERENCIA (El "Lazo")
  // Esto nos permite saber qué parte del DOM es nuestro menú
  const menuRef = useRef(null);

  // 2. DETECTOR DE CLICKS (El "Ojo que todo lo ve")
  useEffect(() => {
    function handleClickOutside(event) {
      // Si el menú existe Y el click NO fue adentro del menú...
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false); // ...Cierra el menú
      }
    }

    // Activamos el escucha cuando el componente se monta
    document.addEventListener("mousedown", handleClickOutside);
    
    // Limpiamos el escucha cuando se desmonta (Buena práctica vital)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  // ESTADO 1: NO LOGUEADO (GUEST)
  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link 
          to="/login" 
          className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          Ingresar
        </Link>
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
    // Asignamos la referencia al contenedor padre
    <div className="relative" ref={menuRef}> 
      
      {/* Trigger del Menú */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 group focus:outline-none p-1 rounded-full transition-all"
      >
        <div className="text-right hidden md:block">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-emerald-500 transition-colors">
            {user.name}
          </p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500/80">
            {user.plan || 'Free'}
          </p>
        </div>
        
        <div className="relative">
          <img 
            src={user.avatar} 
            alt="Avatar" 
            className={`h-9 w-9 rounded-full object-cover ring-2 transition-all ${isOpen ? 'ring-emerald-500' : 'ring-slate-100 dark:ring-slate-800 group-hover:ring-emerald-500'}`}
          />
          {/* Pequeño indicador de estado */}
          <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 ${isOpen ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            
            {/* Header del Dropdown */}
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <p className="text-xs text-slate-500 font-medium mb-0.5">Cuenta conectada</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate" title={user.email}>
                {user.email}
              </p>
            </div>
            
            <div className="p-1">
                {/* IMPORTANTE: Agregamos onClick={() => setIsOpen(false)} 
                   Esto fuerza el cierre al cambiar de página.
                */}
                <Link 
                  to="/perfil" 
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 rounded-lg hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-600 transition-colors"
                >
                  <User size={16} /> Mi Perfil
                </Link>

                <Link 
                  to="/planes" 
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 rounded-lg hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-600 transition-colors"
                >
                  <Sparkles size={16} /> Mejorar Plan
                </Link>
            </div>

            <div className="h-px bg-slate-100 dark:border-slate-800 my-1 mx-1"></div>
            
            <div className="p-1">
                <button 
                  onClick={() => { logout(); setIsOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut size={16} /> Cerrar Sesión
                </button>
            </div>
        </div>
      )}
    </div>
  );
};