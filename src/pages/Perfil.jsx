import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogOut, User, CreditCard, FileText, MessageSquare } from 'lucide-react'; // Agregué MessageSquare para el futuro

// Importación de Componentes Modulares
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { EditProfileTab } from '../components/profile/EditProfileTab';
import { SubscriptionTab } from '../components/profile/SubscriptionTab';
import { BillingHistoryTab } from '../components/profile/BillingHistoryTab';

/**
 * ------------------------------------------------------------------
 * PÁGINA MAESTRA: PERFIL DE USUARIO (Identity Hub)
 * ------------------------------------------------------------------
 * Arquitectura: Tabs Sincronizadas (URL-First).
 * Visión: Preparado para integración con Foro/Comunidad.
 */
const Perfil = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  
  // 1. GESTIÓN DE ESTADO VÍA URL (Single Source of Truth)
  // Permite compartir enlaces tipo: monito-eco.com/perfil?tab=plan
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'general';

  // Redirección de seguridad
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading || !user) return null; 

  // 2. CONFIGURACIÓN DE PESTAÑAS
  const TABS = [
    { id: 'general', label: 'Datos Personales', icon: User },
    { id: 'plan', label: 'Mi Membresía', icon: CreditCard },
    { id: 'billing', label: 'Facturación', icon: FileText },
    // 🔮 FUTURO: Aquí activaremos la pestaña del Foro
    // { id: 'forum', label: 'Mis Aportes', icon: MessageSquare }, 
  ];

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1121] py-12 px-4 transition-colors duration-300 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* === SECCIÓN A: IDENTIDAD PÚBLICA (Future Forum Profile) === */}
        {/* Este Header será lo que vean otros usuarios al hacer click en tu nombre en el Foro */}
        <ProfileHeader 
            user={user} 
            onAvatarChange={(newAvatar) => {
                console.log("Avatar request:", newAvatar);
                // Aquí conectaremos updateProfile en el futuro si se hace desde el header
            }} 
        />

        {/* === SECCIÓN B: PANEL DE CONTROL (Privado) === */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* 1. MENÚ DE NAVEGACIÓN */}
            <div className="lg:col-span-1 space-y-2">
                <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 hide-scrollbar">
                    {TABS.map((tab) => {
                        const isActive = currentTab === tab.id;
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                                    isActive 
                                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-md border-l-4 border-indigo-600' 
                                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-700'
                                }`}
                            >
                                <Icon size={18} className={isActive ? 'text-indigo-600 dark:text-white' : 'text-slate-400'} />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>

                {/* Botón Logout (Desktop) */}
                <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-800 hidden lg:block">
                     <button 
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all font-bold text-sm group"
                     >
                        <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                        Cerrar Sesión
                     </button>
                </div>
            </div>

            {/* 2. CONTENIDO DINÁMICO */}
            <div className="lg:col-span-3">
                
                {/* Lazy Load condicional de componentes */}
                {currentTab === 'general' && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <EditProfileTab />
                    </div>
                )}
                
                {currentTab === 'plan' && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <SubscriptionTab />
                    </div>
                )}
                
                {currentTab === 'billing' && (
                     <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        {/* WIDGET DE RESUMEN: Muestra 3 últimas y link a /compras */}
                        <BillingHistoryTab />
                    </div>
                )}
                
                {/* Logout Móvil */}
                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 lg:hidden">
                    <button onClick={logout} className="w-full py-3 text-red-500 font-bold text-sm bg-red-50 dark:bg-red-900/10 rounded-xl">
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