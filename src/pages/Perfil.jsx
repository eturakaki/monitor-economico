import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { 
  User, Mail, Shield, CreditCard, Save, Camera, 
  MapPin, Briefcase, Globe, Lock, Crown, LogOut 
} from 'lucide-react';

/**
 * ------------------------------------------------------------------
 * COMPONENTE: PERFIL DE USUARIO (User Hub)
 * ------------------------------------------------------------------
 * Gestión integral de identidad, suscripción y configuración.
 * Preparado para futura integración con Foro (Social Profile).
 */

const Perfil = () => {
  const { user, logout, updateUserProfile, isPremium, isUnlimited } = useAuth();
  const navigate = useNavigate();

  // 1. ESTADO LOCAL DEL FORMULARIO
  // Inicializamos con los datos del contexto o defaults vacíos
  const [formData, setFormData] = useState({
    name: '',
    username: '', // Alias para el foro
    email: '',
    bio: '',
    jobTitle: '',
    location: '',
    website: '',
    avatar: ''
  });

  const [isLoading, setIsLoading] = useState(false);

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

  // 2. HANDLERS
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    // Simulación de delay de red (UX)
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
        // Actualizamos en el Contexto y LocalStorage
        updateUserProfile(formData);
        
        toast.success('Perfil Actualizado', {
            description: 'Tus cambios se han guardado correctamente.',
            icon: <Save className="text-emerald-500" />
        });
    } catch (error) {
        toast.error('Error', { description: 'No se pudieron guardar los cambios.' });
    } finally {
        setIsLoading(false);
    }
  };

  const handleChangeAvatar = () => {
    // En un backend real, aquí abriríamos un input file.
    // Por ahora, simulamos cambiando el seed del avatar.
    const randomSeed = Math.floor(Math.random() * 1000);
    const newAvatar = `https://ui-avatars.com/api/?name=${formData.name}&background=random&size=200&seed=${randomSeed}`;
    setFormData(prev => ({ ...prev, avatar: newAvatar }));
    toast.info('Avatar regenerado', { description: 'Guarda los cambios para aplicar.' });
  };

  // 3. RENDERIZADO CONDICIONAL DEL PLAN
  const planColor = isUnlimited ? 'bg-purple-600' : isPremium ? 'bg-emerald-600' : 'bg-slate-500';
  const planName = isUnlimited ? 'Unlimited' : isPremium ? 'Profesional' : 'Plan Gratuito';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1121] py-12 px-4 transition-colors duration-300 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER & COVER */}
        <div className="relative mb-24">
            {/* Banner Abstracto */}
            <div className="h-48 w-full rounded-3xl bg-gradient-to-r from-slate-800 to-slate-900 overflow-hidden relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
            </div>
            
            {/* Tarjeta Flotante de Identidad */}
            <div className="absolute -bottom-16 left-6 md:left-10 flex items-end gap-6">
                <div className="relative group">
                    <img 
                        src={formData.avatar || user?.avatar} 
                        alt="Profile" 
                        className="w-32 h-32 rounded-2xl border-4 border-white dark:border-slate-900 shadow-xl object-cover bg-slate-200"
                    />
                    <button 
                        onClick={handleChangeAvatar}
                        className="absolute bottom-2 right-2 p-2 bg-slate-900 text-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-105"
                        title="Cambiar Avatar"
                    >
                        <Camera size={16} />
                    </button>
                </div>
                <div className="mb-2">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1">
                        {formData.name || 'Usuario'}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                        @{formData.username || 'usuario'} 
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold text-white ${planColor}`}>
                            {planName}
                        </span>
                    </p>
                </div>
            </div>
            
            {/* Botones de Acción Superior */}
            <div className="absolute -bottom-12 right-6 md:right-0 flex gap-3">
                <button 
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50"
                >
                    {isLoading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" /> : <Save size={18} />}
                    Guardar Cambios
                </button>
            </div>
        </div>

        {/* GRID PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* COLUMNA IZQUIERDA: CONFIGURACIÓN */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 1. SECCIÓN: IDENTIDAD PÚBLICA (Foro Ready) */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-lg">
                        <User size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Perfil Público</h2>
                        <p className="text-xs text-slate-500">Esta información será visible en la comunidad.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Nombre Completo</label>
                        <input 
                            type="text" name="name" value={formData.name} onChange={handleChange}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Username (Alias)</label>
                        <input 
                            type="text" name="username" value={formData.username} onChange={handleChange}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Título Profesional</label>
                        <div className="relative">
                            <Briefcase size={16} className="absolute left-3 top-3.5 text-slate-400" />
                            <input 
                                type="text" name="jobTitle" value={formData.jobTitle} onChange={handleChange} placeholder="Ej. Analista Financiero"
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Ubicación</label>
                        <div className="relative">
                            <MapPin size={16} className="absolute left-3 top-3.5 text-slate-400" />
                            <input 
                                type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Ej. Buenos Aires, AR"
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Bio / Acerca de mí</label>
                        <textarea 
                            name="bio" value={formData.bio} onChange={handleChange} rows="3" placeholder="Comparte tu experiencia o intereses..."
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                        />
                    </div>
                </div>
            </div>

            {/* 2. SECCIÓN: DATOS DE CUENTA (Privado) */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm opacity-90">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-lg">
                        <Lock size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Cuenta & Seguridad</h2>
                        <p className="text-xs text-slate-500">Datos privados de inicio de sesión.</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Correo Electrónico</label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-3 top-3.5 text-slate-400" />
                            <input 
                                type="email" value={formData.email} disabled
                                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-slate-500 cursor-not-allowed"
                            />
                        </div>
                        <p className="text-[10px] text-slate-400 pl-1">El email no se puede cambiar por seguridad.</p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Contraseña</label>
                        <button className="w-full flex justify-between items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                            <span>••••••••••••</span>
                            <span className="text-indigo-600 dark:text-indigo-400 text-xs uppercase tracking-wider">Cambiar</span>
                        </button>
                    </div>
                </div>
            </div>

          </div>

          {/* COLUMNA DERECHA: SUSCRIPCIÓN & ACCIONES */}
          <div className="space-y-6">
             
             {/* CARD DE PLAN */}
             <div className="bg-slate-900 dark:bg-slate-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-32 bg-emerald-500/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-500/30 transition-all duration-700"></div>
                
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md">
                            {isUnlimited ? <Crown className="text-yellow-400" /> : <Shield className="text-emerald-400" />}
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider bg-white/10 px-2 py-1 rounded">
                            {isPremium ? 'Activo' : 'Básico'}
                        </span>
                    </div>

                    <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Membresía Actual</h3>
                    <h2 className="text-2xl font-black mb-1">{planName}</h2>
                    <p className="text-slate-400 text-sm mb-6">
                        {isUnlimited ? 'Acceso total sin restricciones.' : isPremium ? 'Acceso a herramientas profesionales.' : 'Acceso limitado a demos.'}
                    </p>

                    <button 
                        onClick={() => navigate('/planes')}
                        className="w-full py-3 rounded-xl bg-white text-slate-900 font-bold text-sm hover:bg-emerald-50 transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                        <CreditCard size={16} />
                        {isUnlimited ? 'Gestionar Suscripción' : 'Mejorar Plan'}
                    </button>
                </div>
             </div>

             {/* PREVIEW FORO (Gamification) */}
             <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-3xl p-6 border border-indigo-100 dark:border-slate-700 border-dashed">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 text-sm">
                    <Globe size={16} className="text-indigo-500" /> Vista Previa en Foro
                </h3>
                {/* Mini Card Simulación */}
                <div className="bg-white dark:bg-slate-950 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex gap-3 items-center">
                    <img src={formData.avatar || user?.avatar} className="w-10 h-10 rounded-full bg-slate-200" alt="Avatar" />
                    <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white hover:text-indigo-500 cursor-pointer">@{formData.username || 'usuario'}</p>
                        <p className="text-[10px] text-slate-500">{formData.jobTitle || 'Miembro de la comunidad'}</p>
                    </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-3 text-center">Así te verán otros inversores cuando participes.</p>
             </div>

             {/* ZONA DE PELIGRO */}
             <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-6">
                 <button 
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 py-3 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all font-bold text-sm"
                 >
                    <LogOut size={16} />
                    Cerrar Sesión
                 </button>
             </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Perfil;