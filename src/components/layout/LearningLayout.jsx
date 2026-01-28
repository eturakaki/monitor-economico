import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';

/**
 * ------------------------------------------------------------------
 * LEARNING LAYOUT (ZONA C - INMERSIVA)
 * ------------------------------------------------------------------
 * Marco arquitectónico para el entorno de aprendizaje.
 * Optimizado para Mobile Safari/Chrome usando 'dvh' (Dynamic Viewport Height).
 */
export const LearningLayout = () => {
  const navigate = useNavigate();

  return (
    // [OPTIMIZACIÓN MOBILE] Usamos 'h-[100dvh]' para evitar problemas con 
    // las barras de navegación nativas de iOS/Android.
    <div className="flex flex-col h-[100dvh] bg-slate-950 text-white overflow-hidden">
      
      {/* HEADER TÁCTICO GLOBAL */}
      {/* Mantiene la navegación de "Escape" siempre visible pero discreta */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 shrink-0 z-40">
        
        {/* A. NAVEGACIÓN DE RETORNO */}
        <button 
          onClick={() => navigate('/mis-cursos')}
          className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors group"
          aria-label="Volver a mis cursos"
        >
          <div className="p-1.5 rounded-md group-hover:bg-slate-800 transition-colors">
            <ArrowLeft size={18} />
          </div>
          <span className="text-xs sm:text-sm font-medium hidden sm:inline">Volver</span>
        </button>

        {/* B. CONTEXTO DE MARCA */}
        <div className="flex items-center gap-2 opacity-50 select-none pointer-events-none">
            <BookOpen size={14} className="hidden sm:block" />
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest">MonitorEco Learning</span>
        </div>

        {/* C. AVATAR / INDICADOR DE ESTADO */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center shadow-lg shadow-emerald-900/20">
            <span className="text-xs font-bold text-white">ME</span>
        </div>
      </header>

      {/* RENDERIZADO DEL PLAYER (Outlet) */}
      {/* 'relative' es clave para posicionar modales/drawers absolutos dentro del player */}
      <div className="flex-1 relative overflow-hidden flex flex-col">
        <Outlet />
      </div>
    </div>
  );
};