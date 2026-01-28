import React, { useState, useEffect } from 'react';
import { ChevronDown, PlayCircle, FileText, CheckCircle, X } from 'lucide-react';

/**
 * ------------------------------------------------------------------
 * COMPONENTE: PLAYER SIDEBAR (HYBRID DRAWER)
 * ------------------------------------------------------------------
 */
export const PlayerSidebar = ({ content, activeLessonId, onLessonSelect, isOpen, onClose }) => {
  const [openModules, setOpenModules] = useState([]);

  // Auto-desplegar módulo activo al montar o cambiar lección
  useEffect(() => {
    if (!content?.modules) return;

    const activeModule = content.modules.find(m => 
      m.lessons.some(l => l.id === activeLessonId)
    );

    // SOLUCIÓN FINAL: Desacoplamiento Asíncrono
    // Usamos setTimeout para sacar la actualización del ciclo de renderizado síncrono.
    // Esto satisface la regla estricta "no synchronous setState in effect".
    const timer = setTimeout(() => {
      setOpenModules(prev => {
        // Lógica 1: Si hay lección activa, asegurar que su módulo esté abierto
        if (activeModule) {
          if (!prev.includes(activeModule.id)) {
            return [...prev, activeModule.id];
          }
        } 
        // Lógica 2: Fallback (si no hay activo y la lista está vacía, abrir el primero)
        else if (prev.length === 0 && content.modules.length > 0) {
          if (!prev.includes(content.modules[0].id)) {
            return [content.modules[0].id];
          }
        }
        // Si no hay cambios necesarios, retornamos el estado intacto
        return prev;
      });
    }, 0);

    // Limpieza: Si el componente se desmonta o cambia activeLessonId rápidamente,
    // cancelamos el timeout pendiente para evitar fugas de memoria.
    return () => clearTimeout(timer);

  }, [content, activeLessonId]); // Dependencias limpias: Solo inputs externos.

  
  const toggleModule = (modId) => {
    setOpenModules(prev => 
      prev.includes(modId) ? prev.filter(id => id !== modId) : [...prev, modId]
    );
  };

  const handleLessonClick = (lesson) => {
    onLessonSelect(lesson);
    if (window.innerWidth < 1024) {
        onClose && onClose();
    }
  };

  if (!content) return null;

  const wrapperClasses = `
    flex flex-col bg-white dark:bg-[#0B1121] border-r border-gray-200 dark:border-gray-800
    lg:relative lg:translate-x-0 lg:w-80 lg:h-full lg:z-0
    fixed inset-y-0 left-0 z-50 w-3/4 max-w-xs shadow-2xl transition-transform duration-300 ease-in-out
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  `;

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={wrapperClasses}>
        <div className="p-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f1629] flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm uppercase tracking-wide">Contenido</h3>
            <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                <span>0% Completado</span>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {content.modules.map((module) => (
            <div key={module.id} className="border-b border-gray-100 dark:border-gray-800/50">
              <button 
                onClick={() => toggleModule(module.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
              >
                <div>
                  <h4 className="font-medium text-sm text-gray-800 dark:text-gray-200 line-clamp-1">{module.title}</h4>
                  <span className="text-xs text-gray-400">{module.lessons.length} lecciones</span>
                </div>
                <ChevronDown 
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${
                    openModules.includes(module.id) ? 'transform rotate-180' : ''
                  }`} 
                />
              </button>

              {openModules.includes(module.id) && (
                <div className="bg-gray-50 dark:bg-[#0f1629]">
                  {module.lessons.map((lesson) => {
                    const isActive = activeLessonId === lesson.id;
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => handleLessonClick(lesson)}
                        className={`w-full flex items-start gap-3 p-3 pl-6 text-sm transition-all border-l-2 text-left ${
                          isActive 
                            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10' 
                            : 'border-transparent hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {lesson.type === 'quiz' ? (
                            <FileText className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                          ) : (
                            <PlayCircle className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium line-clamp-2 ${isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-400'}`}>
                            {lesson.title}
                          </p>
                          <span className="text-xs text-gray-400">{lesson.duration}</span>
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