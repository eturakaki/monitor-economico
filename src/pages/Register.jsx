import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft } from 'lucide-react'; // <--- 1. Importamos icono

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }
    login({ name: formData.name, email: formData.email, plan: 'Free' });
    navigate('/'); 
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0B1121] transition-colors duration-300 px-4">
      
      {/* 2. BOTÓN "VOLVER" (Consistente con Login) */}
      <div className="w-full max-w-md mb-6">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors font-medium"
        >
          <ArrowLeft size={16} />
          Volver al inicio
        </Link>
      </div>

      {/* Card Principal */}
      <div className="w-full max-w-md px-8 py-10 bg-white dark:bg-slate-900 shadow-2xl rounded-2xl border border-slate-200 dark:border-slate-800">
        
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 mb-4">
            <span className="text-2xl">🚀</span>
          </div>
          
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Crear cuenta
          </h2>
          
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 tracking-wide">
            Comenzá a monitorear la economía hoy mismo
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Nombre Completo
            </label>
            <input
              id="name"
              type="text"
              required
              placeholder="Juan Pérez"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="tu@email.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Confirmar Contraseña
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-lg shadow-emerald-500/20 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all transform hover:scale-[1.01] mt-6"
          >
            Crear Cuenta Gratis
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            ¿Ya tenés una cuenta?{' '}
            <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-500 transition-colors">
              Iniciar Sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};