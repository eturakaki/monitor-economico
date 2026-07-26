import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // ✅ Importando desde el nuevo hook
import { LineChart, Lock, Mail, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import { getSafeRedirectPath } from '../utils/safeRedirect';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  
  // 👇 ESTO ES LO QUE FALTABA (Tus estados locales)
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 🔥 1. NAVIGATOR REACTIVO (Senior Pattern)
  // Este efecto vigila si 'isAuthenticated' cambia a true.
  // Si lo hace, te redirige automáticamente.
  useEffect(() => {
    if (isAuthenticated) {
      const origin = getSafeRedirectPath(location.state?.from?.pathname);
      navigate(origin, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // 🔥 2. HANDLER LIMPIO
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Solo ejecutamos la acción de login.
      // NO navegamos aquí. Dejamos que el useEffect de arriba haga su trabajo.
      await login({ 
        email: formData.email,
        name: 'Iñaki Etura', // En un futuro esto vendría del backend real
        plan: formData.email.includes('pro') ? 'pro' : 'starter'
      });
      
      // Si el login es exitoso, no hacemos nada más.
      // El estado 'loading' se queda en true visualmente mientras el useEffect redirige.
      
    } catch (err) {
      console.error('Login error:', err);
      // El toast ya lo mostró el Context, pero actualizamos el estado local para feedback extra si quieres
      setError('No se pudo iniciar sesión. Verifique sus credenciales.');
      setLoading(false); // Solo quitamos el spinner si falló
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-200 dark:bg-[#0B1121] py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      
      {/* Botón Volver */}
      <div className="absolute top-6 left-6 sm:top-10 sm:left-10 z-10">
        <Link 
          to="/" 
          className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-md text-sm font-bold text-slate-600 dark:text-slate-400 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="hidden sm:inline">Volver al Inicio</span>
        </Link>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-20">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-6">
             <div className="bg-emerald-600 p-2 rounded-lg shadow-lg">
                <LineChart className="text-white" size={24} />
             </div>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Bienvenido de nuevo
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Ingresa a tu terminal de inteligencia financiera
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-slate-300 dark:border-slate-800">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* Input Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Email Profesional
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-600 dark:text-slate-400" />
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
            
            {/* Input Password CON LINK DE RECUPERACIÓN ✅ */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Contraseña
                </label>
                <Link 
                  to="/recovery" 
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-600 dark:text-slate-400" />
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

            {/* Error Message */}
            {error && (
              <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-400">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Validando...
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
              <Link 
                to="/register" 
                state={location.state}
                className="font-medium text-emerald-600 hover:text-emerald-500"
              >
                Crear cuenta gratuita
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}