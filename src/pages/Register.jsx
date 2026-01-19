import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, UserPlus } from 'lucide-react'; 

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0B1121] transition-colors duration-300 px-4 py-12">
      
      {/* BOTÓN "VOLVER" - Protocolo V2.3 (Alto Contraste) */}
      <div className="w-full max-w-md mb-6">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors font-bold"
        >
          <ArrowLeft size={18} />
          Volver al inicio
        </Link>
      </div>

      {/* Card Principal - Borde Reforzado (border-2) */}
      <div className="w-full max-w-md px-8 py-10 bg-white dark:bg-slate-900 shadow-2xl rounded-2xl border-2 border-gray-300 dark:border-slate-700">
        
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 mb-4">
            <UserPlus className="text-emerald-600 dark:text-emerald-400" size={28} />
          </div>
          
          <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
            Crear Cuenta
          </h2>
          
          <p className="mt-2 text-sm text-gray-600 dark:text-slate-300 tracking-wide font-medium">
            Unite a la red de inteligencia financiera
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Campo: Nombre Completo */}
          <div>
            <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-400 mb-2">
              Nombre Completo
            </label>
            <input
              id="name"
              type="text"
              required
              placeholder="Juan Pérez"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            />
          </div>

          {/* Campo: Email */}
          <div>
            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-400 mb-2">
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="tu@email.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            />
          </div>

          {/* Campo: Contraseña */}
          <div>
            <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-400 mb-2">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            />
          </div>

          {/* Campo: Confirmar Contraseña */}
          <div>
            <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-400 mb-2">
              Confirmar Contraseña
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-4 px-4 rounded-xl shadow-lg text-sm font-black text-white bg-emerald-600 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-[#0B1121] focus:ring-emerald-500 transition-all transform hover:scale-[1.02] active:scale-[0.98] mt-4"
          >
            CREAR CUENTA GRATIS
          </button>
        </form>

        <div className="mt-8 pt-6 border-t-2 border-gray-100 dark:border-slate-800 text-center">
          <p className="text-sm text-gray-600 dark:text-slate-400">
            ¿Ya tenés una cuenta?{' '}
            <Link to="/login" className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
              Iniciá sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};