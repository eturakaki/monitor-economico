// src/pages/Register.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  ArrowLeft, 
  UserPlus, 
  AlertCircle, 
  Loader2, 
  Eye, 
  EyeOff, 
  Check, 
  X 
} from 'lucide-react'; 
import { toast } from 'sonner';

// --- CONSTANTES DE CONFIGURACIÓN ---
const PASSWORD_MIN_LENGTH = 8; // Estándar 2026 más seguro
const INITIAL_FORM_STATE = {
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
};

/**
 * 🛠️ Hook Personalizado: useRegisterForm
 * Separa la lógica de negocio de la UI. Facilita testing y mantenimiento.
 */
const useRegisterForm = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);

  // ... (useMemo de passwordStrength queda igual) ...
  const passwordStrength = useMemo(() => {
    const pass = formData.password;
    let score = 0;
    if (!pass) return 0;
    if (pass.length >= PASSWORD_MIN_LENGTH) score++;
    if (pass.length > 10) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  }, [formData.password]);

  // CORRECCIÓN 1: Estabilizamos validateField
  // Solo se recrea si cambia el password (necesario para comparar confirmPassword)
  const validateField = useCallback((name, value) => {
    let error = null;
    switch (name) {
      case 'name':
        if (!value.trim()) error = 'El nombre es obligatorio';
        else if (value.split(' ').length < 2) error = 'Ingresa nombre y apellido';
        break;
      case 'email':
        if (!/^\S+@\S+\.\S+$/.test(value)) error = 'Formato de email inválido';
        break;
      case 'password':
        if (value.length < PASSWORD_MIN_LENGTH) error = `Mínimo ${PASSWORD_MIN_LENGTH} caracteres`;
        break;
      case 'confirmPassword':
        // Aquí accedemos a formData.password, por eso es dependencia
        if (value !== formData.password) error = 'Las contraseñas no coinciden';
        break;
    }
    
    // Usamos functional update para setErrors para evitar depender de 'errors' estado completo
    setErrors(prev => ({ ...prev, [name]: error }));
    return error;
  }, [formData.password]); // <--- Dependencia explícita y mínima

  // Handler universal de cambios (useCallback Standard)
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [errors]); // Depende de errors para saber si limpiar

  // CORRECCIÓN 2: handleBlur ahora recibe validateField estable
  const handleBlur = useCallback((e) => {
    const { name, value } = e.target; // Leemos value directo del evento (más seguro)
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  }, [validateField]); // <--- Ahora el linter estará feliz

  // ... (validateAll y submitRegister quedan igual, solo asegúrate de usar validateField dentro de validateAll) ...
  
  // Para validateAll, como usa validateField en un loop, no necesita cambios mayores
  // pero validateField debe ser llamado con los valores actuales.
  const validateAll = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      // OJO: validateField es estable, pero aquí le pasamos el valor fresco
      const error = validateField(key, formData[key]); 
      if (error) newErrors[key] = error;
    });
    setTouched(Object.keys(formData).reduce((acc, key) => ({...acc, [key]: true}), {}));
    return Object.keys(newErrors).every(k => !newErrors[k]);
  };

  const submitRegister = async () => {
     // ... (código igual al anterior) ...
     if (!validateAll()) {
      toast.error('Revisa los campos destacados', { position: 'top-center' });
      return false;
    }

    setLoading(true);
    try {
      await login({ 
        name: formData.name, 
        email: formData.email, 
        plan: 'starter' 
      });
      toast.success('¡Bienvenido a MonitorEco!');
      return true;
    } catch (err) {
      console.error(err);
      toast.error('Error en el registro', { description: err.message || 'Intenta nuevamente.' });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    errors,
    touched,
    loading,
    passwordStrength,
    handleChange,
    handleBlur,
    submitRegister
  };
};
/**
 * 🎨 Componente Reutilizable: FormInput
 * Estandariza el diseño de los inputs y maneja estados de error/éxito visualmente.
 */
const FormInput = ({ 
  label, 
  name, 
  type = "text", 
  value, 
  onChange, 
  onBlur, 
  error, 
  touched, 
  placeholder,
  rightIcon = null 
}) => {
  const hasError = touched && error;
  const isSuccess = touched && !error && value.length > 0;

  return (
    <div className="group">
      <div className="flex justify-between items-center mb-1.5">
        <label htmlFor={name} className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400 transition-colors">
          {label}
        </label>
        {/* Feedback visual inline (opcional, estilo premium) */}
        {isSuccess && <Check size={14} className="text-emerald-500 animate-in fade-in zoom-in" />}
      </div>
      
      <div className="relative">
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`
            w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 
            border-2 text-slate-900 dark:text-white placeholder-slate-400 
            outline-none transition-all duration-200
            ${hasError 
              ? 'border-red-500 bg-red-50/50 dark:bg-red-900/10 focus:ring-red-200' 
              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10'
            }
          `}
        />
        {/* Espacio para íconos (como el ojo de password) */}
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            {rightIcon}
          </div>
        )}
      </div>
      
      {/* Mensaje de Error con animación y accesibilidad */}
      <div className="min-h-[20px] mt-1">
        {hasError && (
          <p role="alert" className="text-red-500 text-xs font-bold flex items-center gap-1.5 animate-in slide-in-from-top-1">
            <AlertCircle size={12} strokeWidth={3} /> {error}
          </p>
        )}
      </div>
    </div>
  );
};

/**
 * 🔐 Register Page V2.5 (Senior Edition)
 */
export const Register = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false); // UI State local

  // Usamos nuestro hook de lógica
  const { 
    formData, 
    errors, 
    touched, 
    loading, 
    passwordStrength, 
    handleChange, 
    handleBlur, 
    submitRegister 
  } = useRegisterForm();

  // Redirección inteligente si ya está logueado
  useEffect(() => {
    if (isAuthenticated) {
      const origin = location.state?.from?.pathname || '/dashboard';
      navigate(origin, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitRegister();
    // La navegación la maneja el useEffect al cambiar isAuthenticated
  };

  // Helper visual para barra de fuerza
  const getStrengthStyles = () => {
    const styles = [
      { color: 'bg-slate-200 dark:bg-slate-700', label: 'Vacía' },
      { color: 'bg-red-500', label: 'Muy Débil' },
      { color: 'bg-orange-500', label: 'Débil' },
      { color: 'bg-yellow-500', label: 'Regular' },
      { color: 'bg-blue-500', label: 'Buena' },
      { color: 'bg-emerald-500', label: 'Excelente' },
    ];
    return styles[passwordStrength] || styles[0];
  };

  const strengthInfo = getStrengthStyles();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0B1121] transition-colors duration-300 px-4 py-8 sm:px-6 lg:px-8">
      
      {/* HEADER DE NAVEGACIÓN */}
      <div className="w-full max-w-[440px] mb-8 flex justify-between items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Link 
          to="/" 
          className="group inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors"
        >
          <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800 shadow-sm group-hover:shadow-md transition-all border border-slate-200 dark:border-slate-700">
            <ArrowLeft size={16} />
          </div>
          <span className="tracking-wide">Volver</span>
        </Link>
      </div>

      {/* MAIN CARD */}
      <main className="w-full max-w-[440px] bg-white dark:bg-slate-900 shadow-2xl shadow-slate-200/50 dark:shadow-black/50 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-500">
        
        {/* Header Decorativo */}
        <div className="px-8 pt-10 pb-6 text-center relative overflow-hidden">
           {/* Efecto de luz de fondo (Glow) */}
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-emerald-500/20 blur-[50px] rounded-full pointer-events-none" />
           
           <div className="relative z-10 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 mb-5 shadow-inner">
            <UserPlus className="text-emerald-600 dark:text-emerald-400" size={32} strokeWidth={1.5} />
          </div>
          
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
            Crear Cuenta
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            Accedé a herramientas de nivel institucional
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="px-8 pb-10 space-y-2" noValidate>
          
          <FormInput
            label="Nombre Completo"
            name="name"
            placeholder="Ej. Iñaki Etura"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.name}
            touched={touched.name}
          />

          <FormInput
            label="Correo Profesional"
            name="email"
            type="email"
            placeholder="usuario@empresa.com"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.email}
            touched={touched.email}
          />

          {/* Password Wrapper para Toggle */}
          <div className="relative">
            <FormInput
              label="Contraseña"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.password}
              touched={touched.password}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 hover:text-emerald-500 transition-colors focus:outline-none focus:text-emerald-500"
                  tabIndex="-1" // Evita que el tabulador se detenga aquí si no se desea
                  title={showPassword ? "Ocultar" : "Mostrar"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />
          </div>

          {/* Medidor de Fuerza Visual Mejorado */}
          <div className="mb-4 -mt-1 px-1">
            <div className="flex gap-1 h-1.5 w-full mb-1.5">
              {[1, 2, 3, 4, 5].map((level) => (
                <div 
                  key={level}
                  className={`h-full flex-1 rounded-full transition-all duration-500 ${
                    passwordStrength >= level ? strengthInfo.color : 'bg-slate-100 dark:bg-slate-800'
                  }`}
                />
              ))}
            </div>
            {formData.password && (
              <div className="flex justify-end">
                <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${
                    passwordStrength < 2 ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'
                }`}>
                  Seguridad: {strengthInfo.label}
                </span>
              </div>
            )}
          </div>

          <FormInput
            label="Confirmar Contraseña"
            name="confirmPassword"
            type={showPassword ? "text" : "password"} // Sincronizamos visibilidad
            placeholder="••••••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.confirmPassword}
            touched={touched.confirmPassword}
          />

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center items-center py-4 px-4 rounded-xl shadow-lg shadow-emerald-500/30 text-sm font-black text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:focus:ring-offset-slate-900 transition-all transform hover:-translate-y-0.5 active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                   <Loader2 className="animate-spin" size={20} />
                   <span>PROCESANDO...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                   <span>CREAR CUENTA GRATUITA</span>
                   {/* Flecha animada en hover */}
                   <ArrowLeft className="rotate-180 group-hover:translate-x-1 transition-transform" size={18} />
                </div>
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-800/50 py-5 text-center border-t border-slate-100 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            ¿Ya tenés cuenta en MonitorEco?
            <br className="sm:hidden"/>
            <Link to="/login" className="ml-1 font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline transition-all">
              Iniciar Sesión
            </Link>
          </p>
        </div>
      </main>

      {/* Footer Legal (Toque Premium) */}
      <footer className="mt-8 text-center opacity-60 hover:opacity-100 transition-opacity">
        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
          © 2026 MonitorEco Financial Intelligence
        </p>
      </footer>
    </div>
  );
};