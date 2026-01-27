import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import { 
  User, Mail, Shield, CreditCard, Save, Camera, 
  MapPin, Briefcase, Globe, Lock, Crown, LogOut,
  Loader2, AlertTriangle, CheckCircle2, XCircle // ✅ AÑADIDO: Loader2 y otros iconos
} from 'lucide-react';

/**
 * ------------------------------------------------------------------
 * COMPONENTE: PERFIL DE USUARIO (User Hub) - SENIOR VERSION
 * ------------------------------------------------------------------
 * Gestión integral de identidad, suscripción y configuración.
 */

// 1. DICCIONARIO DE CONFIGURACIÓN DE PLANES (Single Source of Truth)
const PLAN_CONFIG = {
  starter: {
    label: 'Plan Gratuito',
    badgeColor: 'bg-slate-500',
    icon: <User className="text-slate-400" />,
    description: 'Acceso limitado a herramientas básicas.',
    canDowngrade: false,
    canUpgrade: true
  },
  pro: {
    label: 'Profesional',
    badgeColor: 'bg-emerald-600',
    icon: <Shield className="text-emerald-400" />,
    description: 'Acceso completo a calculadoras y descargas.',
    canDowngrade: true,
    canUpgrade: true
  },
  unlimited: {
    label: 'Unlimited (Empresas)',
    badgeColor: 'bg-purple-600',
    icon: <Crown className="text-yellow-400" />,
    description: 'API Access + Soporte Prioritario 24/7.',
    canDowngrade: true,
    canUpgrade: false
  }
};

const Perfil = () => {
  const { user, logout, updateUserProfile, updateUserPlan, isPremium, isUnlimited } = useAuth();
  const navigate = useNavigate();

  // 2. ESTADO LOCAL
  const [formData, setFormData] = useState({
    name: '',
    username: '', 
    email: '',
    bio: '',
    jobTitle: '',
    location: '',
    website: '',
    avatar: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isDowngrading, setIsDowngrading] = useState(false); // Estado para la acción de cancelar

  // Cargar datos al montar
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        username: user.username || user.email?.split('@')[0] || '',
        email: user.email || '',
        bio: user.bio || '',
        jobTitle: user.jobTitle || 'Inversor',
        location: user.location || '',
        website: user.website || '',
        avatar: user.avatar || ''
      });
    }
  }, [user]);

  // 3. HANDLERS
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    // Delay simulado para UX (feedback de guardado)
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
        await updateUserProfile(formData);
        // El toast de éxito ya lo maneja el AuthProvider con toast.promise
    } catch (err) { 
        console.error("Error saving profile:", err);
    } finally {
        setIsLoading(false);
    }
  };

  const handleChangeAvatar = () => {
    const randomSeed = Math.floor(Math.random() * 1000);
    const newAvatar = `https://ui-avatars.com/api/?name=${formData.name}&background=random&size=200&seed=${randomSeed}`;
    setFormData(prev => ({ ...prev, avatar: newAvatar }));
    toast.info('Vista previa de Avatar generada', { description: 'Recuerda "Guardar Cambios" para aplicar.' });
  };

  /**
   * FUNCIÓN DE DOWNGRADE (Volver a Free)
   * Esta función es crítica para dar libertad al usuario.
   */
  const handleDowngrade = async () => {
    if (!window.confirm("¿Estás seguro de que quieres cancelar tu suscripción y volver al plan Gratuito? Perderás acceso a las herramientas Premium.")) {
        return;
    }

    setIsDowngrading(true);
    try {
        await updateUserPlan('starter'); // Llamamos al servicio para bajar a 'starter'
        toast.success("Has vuelto al plan Gratuito", { description: "Esperamos verte pronto de regreso." });
    } catch (err) {
        toast.error("Error al cancelar suscripción", { description: err.message });
    } finally {
        setIsDowngrading(false);
    }
  };

  // 4. LÓGICA DE UI DEL PLAN ACTUAL
  // Usamos el diccionario PLAN_CONFIG para obtener los datos visuales
  const currentPlanKey = user?.plan || 'starter';
  const planDetails = PLAN_CONFIG[currentPlanKey] || PLAN_CONFIG.starter;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1121] py-12 px-4 transition-colors duration-300 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* === SECCIÓN A: HEADER & COVER === */}
        <div className="relative mb-24 group">
            <div className="h-48 w-full rounded-3xl bg-gradient-to-r from-slate-800 to-slate-900 overflow-hidden relative shadow-2xl">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-slate-900/90 to-transparent"></div>
            </div>
            
            <div className="absolute -bottom-16 left-6 md:left-10 flex items-end gap-6">
                <div className="relative group/avatar">
                    <img 
                        src={formData.avatar || user?.avatar} 
                        alt="Profile" 
                        className="w-32 h-32 rounded-2xl border-4 border-white dark:border-slate-900 shadow-2xl object-cover bg-slate-200"
                    />
                    <button 
                        onClick={handleChangeAvatar}
                        className="absolute bottom-2 right-2 p-2 bg-slate-900/80 backdrop-blur text-white rounded-lg shadow-lg opacity-0 group-hover/avatar:opacity-100 transition-all transform hover:scale-110"
                        title="Generar nuevo Avatar"
                    >
                        <Camera size={18} />
                    </button>
                </div>
                <div className="mb-2">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1 drop-shadow-sm">
                        {formData.name || 'Usuario MonitorEco'}
                    </h1>
                    <div className="flex items-center gap-3">
                        <p className="text-slate-500 dark:text-slate-400 font-medium">@{formData.username || 'usuario'}</p>
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] uppercase font-bold text-white shadow-sm ${planDetails.badgeColor}`}>
                            {planDetails.label}
                        </span>
                    </div>
                </div>
            </div>
            
            <div className="absolute -bottom-12 right-6 md:right-0 flex gap-3">
                <button 
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" /> : <Save size={18} />}
                    Guardar Cambios
                </button>
            </div>
        </div>

        {/* === SECCIÓN B: GRID PRINCIPAL === */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* COLUMNA IZQUIERDA: CONFIGURACIÓN (2/3 del ancho) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* CARD 1: IDENTIDAD PÚBLICA */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl">
                        <User size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Perfil Público</h2>
                        <p className="text-xs text-slate-500">Información visible para otros miembros de la comunidad.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Nombre Completo</label>
                        <input 
                            type="text" name="name" value={formData.name} onChange={handleChange}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                            placeholder="Tu nombre real"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Username (Alias)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-3.5 text-slate-400 font-bold">@</span>
                            <input 
                                type="text" name="username" value={formData.username} onChange={handleChange}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Título Profesional</label>
                        <div className="relative">
                            <Briefcase size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                            <input 
                                type="text" name="jobTitle" value={formData.jobTitle} onChange={handleChange} placeholder="Ej. Analista Financiero"
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Ubicación</label>
                        <div className="relative">
                            <MapPin size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                            <input 
                                type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Ej. Buenos Aires, AR"
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                            />
                        </div>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Bio / Acerca de mí</label>
                        <textarea 
                            name="bio" value={formData.bio} onChange={handleChange} rows="3" placeholder="Comparte tu experiencia, intereses o estrategias de inversión..."
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all resize-none"
                        />
                    </div>
                </div>
            </div>

            {/* CARD 2: CUENTA & SEGURIDAD */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm opacity-95">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-xl">
                        <Lock size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Credenciales de Acceso</h2>
                        <p className="text-xs text-slate-500">Gestiona tu seguridad y métodos de ingreso.</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Correo Electrónico</label>
                        <div className="relative group cursor-not-allowed">
                            <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                            <input 
                                type="email" value={formData.email} disabled
                                className="w-full bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-slate-500 cursor-not-allowed"
                            />
                            <div className="absolute top-0 right-0 h-full flex items-center pr-3 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                                <Lock size={14} className="text-slate-400" />
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 pl-1 flex items-center gap-1">
                            <Shield size={10} /> Datos protegidos por Auth0 provider.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Contraseña</label>
                        <button className="w-full flex justify-between items-center bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-slate-600 transition-colors group">
                            <span className="tracking-widest">••••••••••••</span>
                            <span className="text-indigo-600 dark:text-indigo-400 text-xs uppercase font-extrabold tracking-wider group-hover:underline">Cambiar</span>
                        </button>
                    </div>
                </div>
            </div>

          </div>

          {/* COLUMNA DERECHA: SUSCRIPCIÓN & ACCIONES (1/3 del ancho) */}
          <div className="space-y-6">
             
             {/* CARD DE SUSCRIPCIÓN (Data-Dense) */}
             <div className="bg-slate-900 dark:bg-slate-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group border border-slate-800/50">
                {/* Efecto de fondo dinámico según el plan */}
                <div className={`absolute top-0 right-0 p-40 rounded-full blur-3xl -mr-20 -mt-20 opacity-20 transition-all duration-700 group-hover:opacity-30 ${isUnlimited ? 'bg-yellow-500' : isPremium ? 'bg-emerald-500' : 'bg-slate-500'}`}></div>
                
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md shadow-inner border border-white/5">
                            {planDetails.icon}
                        </div>
                        <div className="flex flex-col items-end">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded mb-1 ${isPremium ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-300'}`}>
                                {isPremium ? 'Suscripción Activa' : 'Nivel Básico'}
                            </span>
                            {isPremium && <span className="text-[10px] text-slate-400">Renueva: 27 Feb 2026</span>}
                        </div>
                    </div>

                    <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Tu Membresía</h3>
                    <h2 className="text-2xl font-black mb-2 tracking-tight">{planDetails.label}</h2>
                    <p className="text-slate-400 text-xs leading-relaxed mb-6 border-l-2 border-slate-700 pl-3">
                        {planDetails.description}
                    </p>

                    <div className="space-y-3">
                        {/* Botón Principal (Upgrade o Gestionar) */}
                        <button 
                            onClick={() => navigate('/planes')}
                            className="w-full py-3.5 rounded-xl bg-white text-slate-900 font-bold text-sm hover:bg-emerald-50 hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-md flex items-center justify-center gap-2"
                        >
                            <CreditCard size={16} />
                            {isUnlimited ? 'Gestionar Facturación' : isPremium ? 'Mejorar a Unlimited' : 'Actualizar a Premium'}
                        </button>

                        {/* Botón Secundario (Downgrade) - SOLO SI ES PREMIUM */}
                        {planDetails.canDowngrade && (
                            <button 
                                onClick={handleDowngrade}
                                disabled={isDowngrading}
                                className="w-full py-2 rounded-xl border border-slate-700 text-slate-400 font-medium text-xs hover:bg-red-900/20 hover:text-red-400 hover:border-red-900/50 transition-colors flex items-center justify-center gap-2"
                            >
                                {isDowngrading ? <Loader2 className="animate-spin h-3 w-3" /> : <XCircle size={14} />}
                                Cancelar Suscripción
                            </button>
                        )}
                    </div>
                </div>
             </div>

             {/* PREVIEW CARD (Foro/Social) */}
             <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-3xl p-6 border border-indigo-100 dark:border-slate-700 border-dashed relative">
                <div className="absolute top-2 right-2">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase bg-indigo-50 dark:bg-slate-800 px-2 py-0.5 rounded-full">Preview</span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 text-sm">
                    <Globe size={16} className="text-indigo-500" /> Tarjeta de Comunidad
                </h3>
                <div className="bg-white dark:bg-slate-950 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex gap-3 items-center group cursor-pointer hover:border-indigo-200 transition-colors">
                    <div className="relative">
                        <img src={formData.avatar || user?.avatar} className="w-12 h-12 rounded-full bg-slate-200 object-cover" alt="Avatar" />
                        {isPremium && (
                            <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-900 rounded-full p-0.5">
                               <CheckCircle2 size={14} className="fill-emerald-500 text-white" /></div>
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-1">
                            <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">@{formData.username || 'usuario'}</p>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-tight">{formData.jobTitle || 'Miembro de MonitorEco'}</p>
                    </div>
                </div>
             </div>

             {/* ZONA DE SALIDA */}
             <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-6">
                 <button 
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 py-3 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all font-bold text-sm group"
                 >
                    <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Cerrar Sesión Segura
                 </button>
                 <p className="text-[10px] text-center text-slate-300 mt-4 opacity-50">
                    MonitorEco ID: {user?.id?.substring(0,8) || 'Unknown'} • v2.1.0
                 </p>
             </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Perfil;