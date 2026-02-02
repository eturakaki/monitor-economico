import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, MapPin, Briefcase, Globe, Loader2, Save } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth'; // Ajusta la ruta si es necesario

/**
 * 🛡️ SCHEMA DE VALIDACIÓN (ZOD)
 * Definimos las reglas del juego aquí.
 */
const profileSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  username: z.string().min(3, "Usuario muy corto").regex(/^[a-zA-Z0-9_]+$/, "Solo letras, números y guión bajo"),
  jobTitle: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().max(160, "La bio no puede superar los 160 caracteres").optional(),
  website: z.string().url("Debe ser una URL válida (http://...)").optional().or(z.literal('')),
});

export const EditProfileTab = () => {
  const { user, updateUserProfile } = useAuth();

  // 1. Hook Form Config
  const { 
    register, 
    handleSubmit, 
    reset,
    formState: { errors, isSubmitting, isDirty } 
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '', username: '', jobTitle: '', location: '', bio: '', website: ''
    }
  });

  // 2. Sincronizar datos iniciales (Reset form when user loads)
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        username: user.username || '',
        jobTitle: user.jobTitle || '',
        location: user.location || '',
        bio: user.bio || '',
        website: user.website || ''
      });
    }
  }, [user, reset]);

  // 3. Submit Handler
  const onSubmit = async (data) => {
    // Solo enviamos si pasó la validación de Zod
    await updateUserProfile(data);
    // React Hook Form maneja el estado isSubmitting automáticamente
    // Resetemos el estado "dirty" con los nuevos valores
    reset(data); 
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in duration-500">
      
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Datos Personales</h2>
          <p className="text-sm text-slate-500">Actualiza tu información pública.</p>
        </div>
        {/* Botón de Guardar Contextual */}
        <button 
          type="submit" 
          disabled={isSubmitting || !isDirty}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : <Save size={18} />}
          {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Campo: Nombre */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nombre Completo</label>
          <div className="relative">
            <User className="absolute left-3 top-3 text-slate-400" size={18} />
            <input 
              {...register('name')}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white" 
              placeholder="Tu nombre"
            />
          </div>
          {errors.name && <p className="text-red-500 text-xs font-bold">{errors.name.message}</p>}
        </div>

        {/* Campo: Username */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Usuario</label>
          <div className="relative">
            <span className="absolute left-4 top-3 text-slate-400 font-bold">@</span>
            <input 
              {...register('username')}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
            />
          </div>
          {errors.username && <p className="text-red-500 text-xs font-bold">{errors.username.message}</p>}
        </div>

        {/* Campo: Job Title */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Profesión / Rol</label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-3 text-slate-400" size={18} />
            <input 
              {...register('jobTitle')}
              placeholder="Ej. Trader Intradía"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
            />
          </div>
        </div>

        {/* Campo: Location */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Ubicación</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
            <input 
              {...register('location')}
              placeholder="Ej. Madrid, ES"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
            />
          </div>
        </div>

        {/* Campo: Website */}
        <div className="md:col-span-2 space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Sitio Web (Opcional)</label>
          <div className="relative">
            <Globe className="absolute left-3 top-3 text-slate-400" size={18} />
            <input 
              {...register('website')}
              placeholder="https://..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
            />
          </div>
          {errors.website && <p className="text-red-500 text-xs font-bold">{errors.website.message}</p>}
        </div>

        {/* Campo: Bio */}
        <div className="md:col-span-2 space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Bio / Acerca de mí</label>
          <textarea 
            {...register('bio')}
            rows="3"
            placeholder="Cuéntanos brevemente sobre tu experiencia en los mercados..."
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none dark:text-white"
          />
          <div className="flex justify-end">
            <span className="text-[10px] text-slate-400">Máx 160 caracteres</span>
          </div>
          {errors.bio && <p className="text-red-500 text-xs font-bold">{errors.bio.message}</p>}
        </div>
        
      </div>
    </form>
  );
};