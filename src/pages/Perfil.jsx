import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, CreditCard, Settings } from 'lucide-react';

const Perfil = () => {
  const { user, logout } = useAuth();
  // Fallback seguro por si user es null (aunque ProtectedRoute debería evitarlo)
  const userData = user || { name: 'Usuario', email: 'user@monitoreco.com', plan: 'free' };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1121] py-12 px-4 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Mi Perfil</h1>
          <p className="text-slate-600 dark:text-slate-400">Administra tu cuenta y suscripción.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* CARD PRINCIPAL (IZQUIERDA) */}
          <div className="md:col-span-2 space-y-6">
            
            {/* 1. Tarjeta de Identidad */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-2xl border-2 border-emerald-500/20">
                  {userData.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{userData.name}</h2>
                  <p className="text-sm text-slate-500 flex items-center gap-2">
                    <Mail size={14} /> {userData.email}
                  </p>
                </div>
              </div>
              
              <div className="grid gap-4">
                 <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                            <Shield size={18} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Plan Actual</p>
                            <p className="font-bold text-slate-900 dark:text-white capitalize">{userData.plan || 'Free'}</p>
                        </div>
                    </div>
                    {userData.plan === 'free' && (
                        <Link 
                            to="/planes" 
                            className="text-xs font-bold bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-500 transition-colors inline-flex items-center"
                        >
                            MEJORAR
                        </Link>
                    )}
                 </div>
              </div>
            </div>

            {/* 2. Preferencias (Placeholder) */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm opacity-60">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Settings size={18} /> Preferencias (Próximamente)
                </h3>
                <p className="text-sm text-slate-500">Pronto podrás configurar alertas personalizadas y notificaciones.</p>
            </div>

          </div>

          {/* SIDEBAR (DERECHA) */}
          <div className="space-y-6">
             <div className="bg-slate-900 dark:bg-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="font-bold text-lg mb-2">Cerrar Sesión</h3>
                    <p className="text-slate-400 text-xs mb-6">¿Deseas salir de MonitorEco?</p>
                    <button 
                        onClick={logout}
                        className="w-full py-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 font-bold text-sm hover:bg-red-500 hover:text-white transition-all"
                    >
                        Desconectar
                    </button>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Perfil;