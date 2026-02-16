import React from 'react';
import { Camera, MapPin, Briefcase } from 'lucide-react';
import { toast } from 'sonner';

/**
 * COMPONENTE: HEADER DE PERFIL
 * Responsabilidad: Mostrar identidad visual, avatar y badges de plan.
 * Estado: Recibe datos vía props (Dumb Component).
 */
export const ProfileHeader = ({ user, onAvatarChange }) => {
  
  // Función auxiliar para generar avatar random (si no tiene uno)
  const handleRegenerateAvatar = () => {
    const randomSeed = Math.floor(Math.random() * 5000);
    const newAvatar = `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random&size=200&seed=${randomSeed}`;
    onAvatarChange(newAvatar);
    toast.info('Avatar generado. Recuerda guardar cambios.');
  };

  return (
    <div className="relative mb-20 group">
      {/* 1. Cover Background (Abstracto) */}
      <div className="h-48 w-full rounded-3xl bg-gradient-to-r from-slate-800 to-slate-900 overflow-hidden relative shadow-2xl border border-slate-700/50">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-slate-900/90 to-transparent"></div>
      </div>

      {/* 2. Avatar & Info Area */}
      <div className="absolute -bottom-12 left-6 md:left-10 flex items-end gap-6">
        {/* Avatar Wrapper */}
        <div className="relative group/avatar">
          <img 
            src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}`} 
            alt="Profile" 
            className="w-32 h-32 rounded-2xl border-4 border-slate-900 shadow-2xl object-cover bg-slate-800"
          />
          <button 
            onClick={handleRegenerateAvatar}
            type="button"
            className="absolute bottom-2 right-2 p-2 bg-slate-900/90 text-white rounded-lg shadow-lg opacity-0 group-hover/avatar:opacity-100 transition-all hover:bg-indigo-600"
            title="Generar nuevo Avatar"
          >
            <Camera size={16} />
          </button>
        </div>

        {/* User Identity */}
        <div className="mb-1 pb-1">
          <h1 className="text-3xl font-black text-white tracking-tight leading-none mb-1 drop-shadow-md">
            {user?.name || 'Usuario Sin Nombre'}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-slate-400 text-sm">
            <span className="font-medium text-slate-300">@{user?.username || 'usuario'}</span>
            
            {/* Metadata Chips */}
            {user?.jobTitle && (
              <span className="flex items-center gap-1 bg-slate-800/50 px-2 py-0.5 rounded-full border border-slate-700/50">
                <Briefcase size={12} /> {user.jobTitle}
              </span>
            )}
            {user?.location && (
              <span className="flex items-center gap-1 bg-slate-800/50 px-2 py-0.5 rounded-full border border-slate-700/50">
                <MapPin size={12} /> {user.location}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};