import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react'; // <--- 1. Importamos icono

export const Login = () => {
  const [email, setEmail] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    login({ name: 'Usuario Pro', email }); 
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0B1121] transition-colors duration-300 px-4">
      
      {/* 2. BOTÓN "VOLVER" (Fuera del Card para jerarquía) */}
      <div className="w-full max-w-md mb-6">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors font-medium"
        >
          <ArrowLeft size={16} />
          Volver al inicio
        </Link>
      </div>

      {/* Card Principal (Sin cambios estructurales) */}
      <div className="w-full max-w-md px-8 py-10 bg-white dark:bg-slate-900 shadow-2xl rounded-2xl border border-slate-200 dark:border-slate-800">
        
        <div className="text-center mb-10">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 mb-4">
            <span className="text-2xl">📊</span>
          </div>
          
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Bienvenido a MonitorEco
          </h2>
          
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 tracking-wide">
            Accedé a tu panel de control macroeconómico
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Contraseña
              </label>
              <a href="#" className="text-xs font-medium text-emerald-600 hover:text-emerald-500">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <input
              id="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all transform hover:scale-[1.01]"
          >
            Iniciar Sesión
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            ¿No tenés una cuenta?{' '}
            <Link to="/register" className="font-semibold text-emerald-600 hover:text-emerald-500 transition-colors">
              Registrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};