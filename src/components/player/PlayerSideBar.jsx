/**
 * @file PlayerSideBar.jsx
 * @description Componente de navegación puro. Delega el control total a la URL.
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; 
import { ChevronDown, PlayCircle, FileText, CheckCircle, X, Play } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

// --- SUB-COMPONENT: LESSON ITEM (Sin cambios lógicos, solo visuales) ---
const LessonItem = React.memo(({ lesson, isActive, isCompleted, onClick }) => {
  // ... (Mismo código visual que tenías, sin cambios)
  const statusColorClass = isActive 
    ? 'text-emerald-700 dark:text-emerald-400 font-semibold' 
    : isCompleted 
      ? 'text-gray-500 dark:text-gray-400 line-through decoration-emerald-500/30' 
      : 'text-gray-600 dark:text-gray-300 font-medium';

  const containerClass = `
    w-full flex items-start gap-3 p-3 pl-6 text-sm transition-all border-l-2 text-left relative group outline-none focus-visible:bg-gray-100
    ${isActive 
      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10' 
      : 'border-transparent hover:bg-gray-100 dark:hover:bg-gray-800'
    }
  `;

  return (
    <button onClick={() => onClick(lesson)} className={containerClass}>
      <div className="mt-0.5 shrink-0 transition-colors duration-300">
        {isCompleted ? (
          <CheckCircle className="w-4 h-4 text-emerald-500" />
        ) : lesson.type === 'quiz' ? (
          <FileText className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
        ) : isActive ? (
          <Play className="w-4 h-4 text-emerald-600 fill-current" />
        ) : (
          <PlayCircle className="w-4 h-4 text-gray-400 group-hover:text-emerald-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`line-clamp-2 transition-colors ${statusColorClass}`}>{lesson.title}</p>
        <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
          {lesson.duration}
          {isCompleted && <span className="text-emerald-500 font-bold ml-1 text-[9px]">COMPLETADO</span>}
        </span>
      </div>
    </button>
  );
});

export const PlayerSidebar = ({ content, activeLessonId, isOpen, onClose }) => {
  const { isLessonCompleted, user } = useAuth();
  const [openModules, setOpenModules] = useState([]);
  const navigate = useNavigate();
  const params = useParams();
  
  // Normalización de ID de curso
  const currentCourseId = params.courseId || params.id;

  // 1. AUTO-EXPAND (Mantenemos tu lógica, funciona bien)
  useEffect(() => {
    if (!content?.modules || !activeLessonId) return;
    const activeModule = content.modules.find(m => m.lessons.some(l => l.id === activeLessonId));
    if (activeModule) {
        setOpenModules(prev => prev.includes(activeModule.id) ? prev : [...prev, activeModule.id]);
    }
  }, [content, activeLessonId]);

  // 2. PROGRESS CALC (Mantenemos lógica)
  const courseProgress = useMemo(() => {
    if (!content?.modules || !user) return 0;
    const allLessons = content.modules.flatMap(m => m.lessons);
    if (!allLessons.length) return 0;
    const completedCount = allLessons.reduce((acc, l) => acc + (isLessonCompleted(l.id) ? 1 : 0), 0);
    return Math.round((completedCount / allLessons.length) * 100);
  }, [content, user, isLessonCompleted]);

  const handleToggleModule = useCallback((modId) => {
    setOpenModules(prev => prev.includes(modId) ? prev.filter(id => id !== modId) : [...prev, modId]);
  }, []);

  // --- 🔥 CORE FIX: NAVEGACIÓN PURA ---
  const handleLessonClick = useCallback((lesson) => {
    if (window.innerWidth < 1024 && onClose) onClose();

    // SOLO Navegamos. No llamamos a "onLessonSelect" del padre.
    // La URL es la única fuente de verdad.
    if (currentCourseId && lesson.id) {
        navigate(`/curso/${currentCourseId}/leccion/${lesson.id}`);
    }
  }, [navigate, currentCourseId, onClose]);

  if (!content) return null;

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <aside className={`flex flex-col bg-white dark:bg-[#0B1121] border-r border-gray-200 dark:border-gray-800 lg:relative lg:translate-x-0 lg:w-96 lg:h-full lg:z-0 fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] shadow-2xl transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* HEADER (Progreso) */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-[#0f1629]/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex justify-between items-start mb-4">
             <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Tu Progreso</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{courseProgress}%</span>
                </div>
             </div>
             <button onClick={onClose} className="lg:hidden p-1 text-gray-400 hover:text-red-500"><X size={20} /></button>
          </div>
          <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700 relative" style={{ width: `${courseProgress}%` }} />
          </div>
        </div>

        {/* LIST */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-10">
          {content.modules.map((module) => {
            const isModOpen = openModules.includes(module.id);
            return (
              <div key={module.id} className="border-b border-gray-100 dark:border-gray-800/50">
                <button onClick={() => handleToggleModule(module.id)} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors text-left group">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200 group-hover:text-emerald-600">{module.title}</h4>
                    <span className="text-xs text-gray-400 mt-0.5">{module.lessons.length} lecciones</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isModOpen ? 'rotate-180' : ''}`} />
                </button>
                <div className={`overflow-hidden transition-[max-height] duration-300 ${isModOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                   <div className="bg-gray-50/50 dark:bg-[#0f1629]/50 py-2">
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