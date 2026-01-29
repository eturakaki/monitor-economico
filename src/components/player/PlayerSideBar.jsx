import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, PlayCircle, FileText, CheckCircle, X, Play, Lock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth'; // [INTEGRACIÓN] Conexión al estado global

/**
 * ------------------------------------------------------------------
 * COMPONENTE: PLAYER SIDEBAR (SMART NAVIGATION DRAWER)
 * ------------------------------------------------------------------
 * Drawer de navegación híbrido (Móvil/Desktop) que gestiona la estructura
 * del curso y visualiza el progreso del usuario en tiempo real.
 * * @param {Object} content - Estructura completa del curso (Módulos/Lecciones).
 * @param {string} activeLessonId - ID de la lección reproduciéndose actualmente.
 * @param {Function} onLessonSelect - Callback para cambiar de lección.
 * @param {boolean} isOpen - Estado de visibilidad (Mobile).
 * @param {Function} onClose - Setter para cerrar el drawer (Mobile).
 */
export const PlayerSidebar = ({ content, activeLessonId, onLessonSelect, isOpen, onClose }) => {
  // Hook de Autenticación para verificar progreso (Read-Only access)
  const { isLessonCompleted, user } = useAuth();
  const [openModules, setOpenModules] = useState([]);

  // ----------------------------------------------------------------
  // 1. LÓGICA DE AUTO-DESPLIEGUE (UX OPTIMIZATION)
  // ----------------------------------------------------------------
  // Mantenemos tu solución de "Desacoplamiento Asíncrono" ya que es
  // técnicamente correcta para evitar actualizaciones de estado durante el render.
  useEffect(() => {
    if (!content?.modules) return;

    const activeModule = content.modules.find(m => 
      m.lessons.some(l => l.id === activeLessonId)
    );

    const timer = setTimeout(() => {
      setOpenModules(prev => {
        // A. Prioridad: Abrir el módulo donde está el usuario
        if (activeModule && !prev.includes(activeModule.id)) {
          return [...prev, activeModule.id];
        } 
        // B. Fallback: Si nada está abierto, abrir el primero (Onboarding)
        if (prev.length === 0 && content.modules.length > 0) {
          return [content.modules[0].id];
        }
        return prev;
      });
    }, 0);

    return () => clearTimeout(timer);
  }, [content, activeLessonId]);

  // ----------------------------------------------------------------
  // 2. CÁLCULO DE PROGRESO (REAL-TIME METRICS)
  // ----------------------------------------------------------------
  // Calculamos el % solo para este curso, derivado del estado global del usuario.
  const courseProgress = useMemo(() => {
    if (!content?.modules || !user) return 0;

    let totalLessons = 0;
    let completedCount = 0;

    content.modules.forEach(mod => {
      mod.lessons.forEach(lesson => {
        totalLessons++;
        if (isLessonCompleted(lesson.id)) completedCount++;
      });
    });

    if (totalLessons === 0) return 0;
    return Math.round((completedCount / totalLessons) * 100);
  }, [content, user, isLessonCompleted]);


  // ----------------------------------------------------------------
  // 3. HANDLERS
  // ----------------------------------------------------------------
  const toggleModule = (modId) => {
    setOpenModules(prev => 
      prev.includes(modId) ? prev.filter(id => id !== modId) : [...prev, modId]
    );
  };

  const handleLessonClick = (lesson) => {
    onLessonSelect(lesson);
    // UX Mobile: Cerrar drawer automáticamente al seleccionar
    if (window.innerWidth < 1024) onClose && onClose();
  };

  // Defensive Check
  if (!content) return null;

  // Clases dinámicas para la animación del Drawer
  const wrapperClasses = `
    flex flex-col bg-white dark:bg-[#0B1121] border-r border-gray-200 dark:border-gray-800
    lg:relative lg:translate-x-0 lg:w-80 lg:h-full lg:z-0
    fixed inset-y-0 left-0 z-50 w-3/4 max-w-xs shadow-2xl transition-transform duration-300 ease-in-out
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  `;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={wrapperClasses}>
        
        {/* HEADER: Título y Progreso */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f1629] flex items-center justify-between shrink-0">
          <div className="w-full pr-4">
            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm uppercase tracking-wide">
                Contenido
            </h3>
            
            {/* Barra de Progreso Visual */}
            <div className="mt-2 w-full">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progreso del curso</span>
                    <span className="font-medium text-emerald-600">{courseProgress}%</span>
                </div>
                <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${courseProgress}%` }}
                    />
                </div>
            </div>
          </div>
          
          {/* Botón Cerrar (Solo Mobile) */}
          <button onClick={onClose} className="lg:hidden p-2 text-gray-400 hover:text-red-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* CONTENIDO: Lista de Módulos */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {content.modules.map((module) => (
            <div key={module.id} className="border-b border-gray-100 dark:border-gray-800/50">
              
              {/* Accordion Header */}
              <button 
                onClick={() => toggleModule(module.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left group"
              >
                <div>
                  <h4 className="font-medium text-sm text-gray-800 dark:text-gray-200 line-clamp-1 group-hover:text-emerald-500 transition-colors">
                    {module.title}
                  </h4>
                  <span className="text-xs text-gray-400">{module.lessons.length} lecciones</span>
                </div>
                <ChevronDown 
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${
                    openModules.includes(module.id) ? 'transform rotate-180' : ''
                  }`} 
                />
              </button>

              {/* Accordion Body (Lecciones) */}
              {openModules.includes(module.id) && (
                <div className="bg-gray-50 dark:bg-[#0f1629] py-1">
                  {module.lessons.map((lesson) => {
                    // Estados Lógicos
                    const isActive = activeLessonId === lesson.id;
                    const isCompleted = isLessonCompleted(lesson.id);
                    
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => handleLessonClick(lesson)}
                        className={`
                            w-full flex items-start gap-3 p-3 pl-6 text-sm transition-all border-l-2 text-left relative group
                            ${isActive 
                                ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10' 
                                : 'border-transparent hover:bg-gray-100 dark:hover:bg-gray-800'
                            }
                        `}
                      >
                        {/* Indicador Visual de Estado (Icono) */}
                        <div className="mt-0.5 shrink-0 transition-colors duration-300">
                          {isCompleted ? (
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                          ) : lesson.type === 'quiz' ? (
                            <FileText className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                          ) : isActive ? (
                            <Play className="w-4 h-4 text-emerald-600 fill-current" /> // Icono relleno para activo
                          ) : (
                            <PlayCircle className="w-4 h-4 text-gray-400 group-hover:text-emerald-400" />
                          )}
                        </div>

                        {/* Info Lección */}
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium line-clamp-2 transition-colors ${
                              isActive ? 'text-emerald-700 dark:text-emerald-400' 
                              : isCompleted ? 'text-gray-500 dark:text-gray-400 line-through decoration-emerald-500/30' 
                              : 'text-gray-600 dark:text-gray-300'
                          }`}>
                            {lesson.title}
                          </p>
                          <span className="text-[10px] text-gray-400 flex items-center gap-1">
                            {lesson.duration}
                            {isCompleted && <span className="text-emerald-500 font-medium ml-1">• Visto</span>}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>
    </>
  );
};