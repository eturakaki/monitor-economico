/**
 * @file PlayerSideBar.jsx
 * @description Sidebar estilo Udemy: Checkboxes de progreso, diseño limpio y UX "Zero-Lag".
 * @architecture Clean Architecture / Presentational Pattern
 * @version 3.0.0 (Udemy Style - Pay-per-Course)
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { 
  ChevronDown, Check, Play, X, BarChart3 
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

// --- CONSTANTS & STYLES ---
// Definimos tokens de diseño inspirados en interfaces de aprendizaje modernas
const STYLES = {
  sidebar: {
    overlay: "fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300",
    container: "flex flex-col bg-white dark:bg-[#0B1121] border-r border-gray-200 dark:border-gray-800 lg:relative lg:translate-x-0 lg:w-96 lg:h-full lg:z-0 fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] shadow-2xl transition-transform duration-300 ease-out",
  },
  lesson: {
    // Layout Grid para alineación perfecta: [Checkbox] [Titulo]
    base: "w-full flex items-start gap-4 p-4 text-sm transition-all border-l-[3px] text-left relative group outline-none focus-visible:bg-gray-100 dark:focus-visible:bg-gray-800 cursor-pointer",
    
    // Estados
    active: "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-900/10",
    inactive: "border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/30",
    
    // Tipografía
    textActive: "text-gray-900 dark:text-white font-semibold",
    textCompleted: "text-gray-500 dark:text-gray-500 line-through decoration-gray-300 dark:decoration-gray-700",
    textDefault: "text-gray-700 dark:text-gray-300 font-medium group-hover:text-gray-900 dark:group-hover:text-white"
  },
  checkbox: {
    base: "w-5 h-5 mt-0.5 shrink-0 rounded flex items-center justify-center border transition-all duration-200",
    completed: "bg-emerald-600 border-emerald-600 text-white shadow-sm",
    active: "border-emerald-500 bg-white dark:bg-transparent text-emerald-600 ring-2 ring-emerald-500/20",
    default: "border-gray-300 dark:border-gray-600 bg-transparent group-hover:border-gray-400"
  }
};

/**
 * @component LessonCheckbox
 * @description Micro-componente visual para el estado de la lección.
 */
const LessonCheckbox = ({ isCompleted, isActive }) => {
  if (isCompleted) {
    return (
      <div className={STYLES.checkbox.completed}>
        <Check size={12} strokeWidth={3} />
      </div>
    );
  }
  if (isActive) {
    return (
      <div className={STYLES.checkbox.active}>
        <Play size={8} fill="currentColor" />
      </div>
    );
  }
  return <div className={STYLES.checkbox.default} />;
};

/**
 * @component LessonItem
 * @description Item de lista optimizado con React.memo para evitar re-renders masivos.
 */
const LessonItem = React.memo(({ lesson, isActive, isCompleted, onClick }) => {
  const itemRef = useRef(null);

  // Auto-Scroll: Desplazamiento suave hacia la lección activa
  useEffect(() => {
    if (isActive && itemRef.current) {
      itemRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center'
      });
    }
  }, [isActive]);

  // Selección de estilos
  let textClass = STYLES.lesson.textDefault;
  let containerClass = STYLES.lesson.base;

  if (isActive) {
    textClass = STYLES.lesson.textActive;
    containerClass += ` ${STYLES.lesson.active}`;
  } else if (isCompleted) {
    textClass = STYLES.lesson.textCompleted;
    containerClass += ` ${STYLES.lesson.inactive}`;
  } else {
    containerClass += ` ${STYLES.lesson.inactive}`;
  }

  return (
    <button 
      ref={itemRef}
      onClick={() => onClick(lesson)} 
      className={containerClass}
      aria-current={isActive ? 'page' : undefined}
    >
      {/* Columna 1: Checkbox */}
      <LessonCheckbox isCompleted={isCompleted} isActive={isActive} />

      {/* Columna 2: Contenido */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <p className={`leading-snug transition-colors text-[13px] ${textClass}`}>
          {lesson.title}
        </p>
        
        <div className="flex items-center gap-2">
           <span className="text-[11px] text-gray-400 font-mono">
             {lesson.duration}
           </span>
           {/* Badge "En curso" sutil */}
           {isActive && !isCompleted && (
             <span className="text-[9px] font-bold text-emerald-600 tracking-wide uppercase">
               Reproduciendo
             </span>
           )}
        </div>
      </div>
    </button>
  );
});

export const PlayerSidebar = ({ content, activeLessonId, isOpen, onClose }) => {
  const { isLessonCompleted, user } = useAuth();
  const [openModules, setOpenModules] = useState([]);
  const navigate = useNavigate();

  // FIX: Lógica de Auto-Expansión optimizada
  useEffect(() => {
    if (!content?.modules || !activeLessonId) return;

    const activeModule = content.modules.find(m => 
      m.lessons.some(l => l.id === activeLessonId)
    );

    if (activeModule) {
      setOpenModules(prev => {
        if (prev.includes(activeModule.id)) return prev;
        return [...prev, activeModule.id];
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLessonId]); 

  // Cálculo de Progreso
  const courseProgress = useMemo(() => {
    if (!content?.modules || !user) return 0;
    const allLessons = content.modules.flatMap(m => m.lessons);
    if (!allLessons.length) return 0;

    const completedCount = allLessons.reduce((acc, l) => 
      acc + (isLessonCompleted(l.id) ? 1 : 0), 0
    );

    return Math.round((completedCount / allLessons.length) * 100);
  }, [content, user, isLessonCompleted]);

  const handleToggleModule = (modId) => {
    setOpenModules(prev => 
      prev.includes(modId) 
        ? prev.filter(id => id !== modId) 
        : [...prev, modId]
    );
  };

  const handleLessonClick = useCallback((lesson) => {
    if (window.innerWidth < 1024 && onClose) {
      onClose();
    }
    
    // Navegación robusta
    const currentPath = window.location.pathname.split('/');
    const courseId = content.id || currentPath[2]; 

    navigate(`/curso/${courseId}/leccion/${lesson.id}`);
  }, [navigate, onClose, content]);

  if (!content) return null;

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`${STYLES.sidebar.overlay} ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Main Container */}
      <aside className={`${STYLES.sidebar.container} ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* HEADER: Progress */}
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f1629] sticky top-0 z-10 shadow-sm">
          <div className="flex justify-between items-center mb-3">
             <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart3 size={16} className="text-emerald-500" />
                Contenido del curso
             </h3>
             
             {/* Mobile Close */}
             <button 
                onClick={onClose} 
                className="lg:hidden p-1 text-gray-400 hover:text-red-500 transition-colors"
                aria-label="Cerrar menú"
             >
               <X size={20} />
             </button>
          </div>
          
          <div className="flex items-center gap-3 mb-1">
             <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-700 ease-out" 
                  style={{ width: `${courseProgress}%` }} 
                />
             </div>
             <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 w-10 text-right">
                {courseProgress}%
             </span>
          </div>
        </div>

        {/* LISTA DE MÓDULOS (Accordion) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-10 bg-gray-50/50 dark:bg-[#0B1121]">
          {content.modules.map((module, index) => {
            const isModOpen = openModules.includes(module.id);
            
            return (
              <div key={module.id} className="border-b border-gray-200 dark:border-gray-800 last:border-0 bg-white dark:bg-[#0f1629]">
                <button 
                  onClick={() => handleToggleModule(module.id)} 
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left group"
                  aria-expanded={isModOpen}
                >
                  <div className="pr-2">
                    <h4 className="font-bold text-[13px] text-gray-800 dark:text-gray-200 group-hover:text-black dark:group-hover:text-white transition-colors">
                      Sección {index + 1}: {module.title}
                    </h4>
                    <span className="text-[11px] text-gray-400 mt-1 block">
                      {module.lessons.length} clases
                    </span>
                  </div>
                  <ChevronDown 
                    className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isModOpen ? 'rotate-180' : ''}`} 
                  />
                </button>

                <div 
                  className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${isModOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
                >
                   {/* Background sutil para diferenciar lecciones del header del módulo */}
                   <div className="bg-gray-50 dark:bg-[#0B1121]/50">
                      {module.lessons.map((lesson) => (
                        <LessonItem 
                          key={lesson.id}
                          lesson={lesson}
                          isActive={activeLessonId === lesson.id}
                          isCompleted={isLessonCompleted(lesson.id)}
                          onClick={handleLessonClick} 
                        />
                      ))}
                   </div>
                </div>
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
};