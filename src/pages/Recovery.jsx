import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export const Recovery = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');

    // Simulación de llamada a API (Endpoint: /auth/forgot-password)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Delay dramático

      // Validación simulada: Si el email es inválido o no existe (para pruebas)
      if (!email.includes('@') || email.length < 5) {
        throw new Error('Por favor, ingresa un email válido.');
      }

      setStatus('success');
      toast.success('¡Correo enviado!', {
        description: `Hemos enviado las instrucciones a ${email}`
      });
    } catch (error) {
      setStatus('idle'); // Volvemos a permitir intentar
      toast.error('Error', { description: error.message });
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B1121] px-4 transition-colors">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl text-center border border-slate-200 dark:border-slate-800">
          <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">¡Revisa tu bandeja!</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Hemos enviado un enlace de recuperación seguro a <span className="font-bold text-slate-900 dark:text-slate-200">{email}</span>.
          </p>
          <div className="space-y-4">
            <button 
              onClick={() => window.open('https://gmail.com', '_blank')}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all"
            >
              Abrir Correo
            </button>
            <Link to="/login" className="block text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
              Volver a Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B1121] px-4 transition-colors">
      
      {/* Botón Volver Flotante */}
      <div className="absolute top-6 left-6">
        <Link 
          to="/login" 
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-600 dark:text-slate-400 hover:border-emerald-500 hover:text-emerald-500 transition-all shadow-sm"
        >
          <ArrowLeft size={16} /> <span className="hidden sm:inline">Volver</span>
        </Link>
      </div>

      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="inline-flex p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-lg mb-6">
            <Mail className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
            ¿Olvidaste tu contraseña?
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            No te preocupes, nos pasa a todos. Ingresa tu email y te ayudaremos a recuperarla.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Email Registrado</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@monitoreco.com"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium dark:text-white"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={status === 'loading'}
              className="w-full py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Enviando instrucciones...
                </>
              ) : (
                'Enviar Enlace de Recuperación'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              ¿Todavía tienes problemas? <a href="#" className="text-emerald-500 font-bold hover:underline">Contactar Soporte</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recovery;