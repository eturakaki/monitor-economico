// src/pages/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // <--- Importamos el cerebro
import { LineChart, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth(); // <--- Extraemos la función mágica
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // SIMULACIÓN DE BACKEND (Esto se reemplazará por Firebase/Node luego)
    try {
      // Simulamos espera de red de 1.5 segundos
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (formData.email === 'error@monitoreco.com') {
        throw new Error('Credenciales inválidas');
      }

      // 1. DEFINIMOS EL USUARIO SIMULADO
      // Aquí decidimos qué rol darle según el email (truco para testear)
      const mockUser = {
        name: 'Iñaki Etura',
        email: formData.email,
        plan: formData.email.includes('pro') ? 'premium' : 'free', // Si el mail dice "pro", es premium
        role: 'user',
        avatar: null // El AuthContext generará uno automático
      };

      // 2. EJECUTAMOS EL LOGIN DEL CONTEXTO
      login(mockUser);

      // 3. REDIRIGIMOS AL DASHBOARD
      navigate('/'); 
      
    } catch (err) {
      // ✅ SOLUCIÓN: Usamos la variable para imprimir el error real en la consola
      console.error('Error de inicio de sesión:', err); //Si no queremos ver esto. Lo borramos
      
      setError('Email o contraseña incorrectos. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B1121] py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-md w-full space-y-8">
        
        {/* Header del Formulario */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
             <div className="bg-emerald-600 p-2 rounded-lg shadow-lg group-hover:scale-110 transition-transform">
                <LineChart className="text-white" size={24} />
             </div>
          </Link>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Bienvenido de nuevo
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Ingresa a tu terminal de inteligencia financiera
          </p>
        </div>

        {/* Tarjeta del Formulario */}
        <div className="bg-white dark:bg-slate-900 py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-slate-200 dark:border-slate-800">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* Input Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Email Profesional
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pl-10 sm:text-sm border-slate-300 dark:border-slate-700 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-800 dark:text-white h-10"
                  placeholder="ejemplo@monitoreco.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            {/* Input Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Contraseña
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  className="block w-full pl-10 sm:text-sm border-slate-300 dark:border-slate-700 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-800 dark:text-white h-10"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            {/* Mensaje de Error */}
            {error && (
              <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-400">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            {/* Botón de Acción */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Validando credenciales...
                  </>
                ) : (
                  <>
                    Ingresar a MonitorEco
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer del Formulario */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-slate-900 text-slate-500">
                  ¿No tienes cuenta?
                </span>
              </div>
            </div>
            <div className="mt-6 text-center">
              <Link to="/register" className="font-medium text-emerald-600 hover:text-emerald-500">
                Crear cuenta gratuita
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}