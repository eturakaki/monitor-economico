/**
 * @file CoursePlayerPage.jsx
 * @description Controlador Principal: Layout estilo Udemy con Sidebar Izquierdo.
 * @architecture Smart Container / Event-Driven
 * @version 3.3.0 (Async Smart Resume)
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactPlayer from 'react-player';
import { toast } from 'sonner';
import { 
  Loader2, Download, MessageCircle, Menu, 
  CheckCircle, Play, ChevronRight, FileText
} from 'lucide-react';

// --- SERVICE LAYER ---
import { useAuth } from '../hooks/useAuth'; 
import { useCourseData } from '../hooks/useCourseData';

// --- COMPONENTS ---
import { PlayerSidebar } from '../components/player/PlayerSideBar';
import VideoErrorBoundary from '../components/player/VideoErrorBoundary';

// --- DOMAIN LOGIC ---
// [PATCH 1] Eliminado 'getStoredProgress' (Ya no existe, ahora es fetchStoredTime del hook)
import { useVideoProgress } from '../hooks/useVideoProgress';

// ==========================================
// ⚙️ CONFIGURATION
// ==========================================
const PLAYER_CONFIG = {
  youtube: { 
    playerVars: { showinfo: 0, modestbranding: 1, rel: 0, origin: window.location.origin } 
  },
  file: { 
    attributes: { controlsList: 'nodownload', disablePictureInPicture: false } 
  }
};

const UI_TABS = { OVERVIEW: 'overview', RESOURCES: 'resources', NOTES: 'notes' };
const AUTO_ADVANCE_DELAY_MS = 5000;

// ==========================================
// 🧩 UI COMPONENTS (Udemy Style)
// ==========================================

/**
 * TabButton: Botón de pestaña estilo Udemy (Texto + Subrayado activo)
 */
const TabButton = ({ label, isActive, onClick, icon: Icon }) => (
  <button 
    onClick={onClick}
    className={`
      flex items-center gap-2 px-4 py-4 text-sm font-bold border-b-2 transition-all
      ${isActive 
        ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white' 
        : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'}
    `}
  >
    {Icon && <Icon size={16} className={isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400'} />}
    {label}
  </button>
);

const ContentPanel = React.memo(({ activeTab, course, activeLesson }) => {
    // 1. Vista General (Descripción)
    if (activeTab === UI_TABS.OVERVIEW) {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="prose dark:prose-invert max-w-none">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Sobre esta lección</h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {activeLesson?.description || "No hay descripción disponible para esta lección. Concéntrate en el video y toma notas de los puntos clave."}
                    </p>
                </div>
                
                {/* Metadatos del Curso */}
                <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/10">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Acerca del curso</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{course?.description}</p>
                </div>
            </div>
        );
    }

    // 2. Recursos (Descargas)
    if (activeTab === UI_TABS.RESOURCES) {
        return (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-xs mb-4">
                    Material Descargable
                </h3>
                
                <div className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-emerald-500 hover:shadow-sm transition-all bg-white dark:bg-gray-800/50 cursor-pointer group">
                    <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded text-gray-500 group-hover:text-emerald-600 transition-colors">
                        <Download size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-emerald-500 transition-colors">
                            Guía de Estudio: {activeLesson?.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">PDF Document • 2.4 MB</p>
                    </div>
                </div>
            </div>
        );
    }

    // 3. Notas (Placeholder)
    return (
        <div className="text-center py-12 animate-in fade-in duration-300 bg-gray-50 dark:bg-white/5 rounded-xl border-dashed border-2 border-gray-200 dark:border-gray-700">
            <div className="bg-white dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <MessageCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-gray-900 dark:text-white font-bold mb-1">Tus Notas Personales</h3>
            <p className="text-sm text-gray-500 mb-4 max-w-xs mx-auto">
                Captura tus ideas clave en este momento exacto del video.
            </p>
            <button className="text-sm font-bold text-white bg-gray-900 hover:bg-black px-6 py-2.5 rounded-lg transition-all shadow-lg hover:shadow-xl">
                Crear nueva nota
            </button>
        </div>
    );
});

// ==========================================
// 🚀 MAIN CONTROLLER
// ==========================================
const CoursePlayerPage = () => {
  // 1. ROUTING & DATA
  const params = useParams();
  const navigate = useNavigate();

  const courseId = params.courseId || params.id;
  const srcLessonId = params.lessonId;
  
  // Data Fetching
  const { course, isLoading, error: courseError } = useCourseData(courseId);
  const { markLessonAsCompleted, isLessonCompleted } = useAuth();
  
  // 2. LOCAL STATE
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(UI_TABS.OVERVIEW);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false); 
  
  const playerRef = useRef(null);
  const autoAdvanceTimerRef = useRef(null);

  // 3. COMPUTED DATA
  const flatLessons = useMemo(() => {
    if (!course?.modules) return [];
    return course.modules.flatMap(m => m.lessons);
  }, [course]);

  const activeLesson = useMemo(() => {
    if (!flatLessons.length) return null;
    return flatLessons.find(l => l.id === srcLessonId) || flatLessons[0];
  }, [flatLessons, srcLessonId]);

  const nextLesson = useMemo(() => {
    if (!activeLesson || !flatLessons.length) return null;
    const currentIndex = flatLessons.findIndex(l => l.id === activeLesson.id);
    return flatLessons[currentIndex + 1] || null;
  }, [activeLesson, flatLessons]);

 // 4. FALLBACK ROUTING
  useEffect(() => {
    if (course && !srcLessonId && flatLessons.length > 0) {
        navigate(`/curso/${courseId}/leccion/${flatLessons[0].id}`, { replace: true });
    }
  }, [course, srcLessonId, flatLessons, courseId, navigate]);

  // ==========================================
  // 🕹️ LOGIC: AUTO-ADVANCE
  // ==========================================

  const cancelAutoAdvance = () => {
    if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current = null;
        toast.dismiss("auto-advance-toast");
    }
  };

  const triggerAutoAdvance = useCallback(() => {
    if (!nextLesson) return;

    // Toast Interactivo
    toast.custom((t) => (
      <div className="bg-gray-900 text-white p-4 rounded-lg shadow-2xl flex items-center gap-4 border border-gray-700 min-w-[300px]">
         <Loader2 className="animate-spin text-emerald-500 w-5 h-5" />
         <div className="flex-1">
            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Siguiente lección en 5s</p>
            <p className="text-sm font-semibold truncate max-w-[200px]">{nextLesson.title}</p>
         </div>
         <button 
           onClick={() => {
             toast.dismiss(t);
             cancelAutoAdvance();
           }}
           className="text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded text-gray-200 transition-colors"
         >
           Cancelar
         </button>
      </div>
    ), { id: "auto-advance-toast", duration: 5000 });

    // Ejecución
    autoAdvanceTimerRef.current = setTimeout(() => {
        navigate(`/curso/${courseId}/leccion/${nextLesson.id}`);
        setIsPlaying(true); 
    }, AUTO_ADVANCE_DELAY_MS);

  }, [nextLesson, courseId, navigate]);

  const handleLessonCompleted = useCallback(() => {
      if (!activeLesson?.id) return;
      
      markLessonAsCompleted(courseId, activeLesson.id);
      
      if (nextLesson) {
          triggerAutoAdvance();
      } else {
          toast.success("¡Curso Completado!", {
              description: "Has finalizado todas las lecciones.",
              icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
          });
      }
  }, [courseId, activeLesson, nextLesson, markLessonAsCompleted, triggerAutoAdvance]);

  // [PATCH 2] Destructuring: Obtenemos 'fetchStoredTime' del Hook
  const { handleProgress, handleDuration, fetchStoredTime } = useVideoProgress({
      activeLessonId: activeLesson?.id,
      onComplete: handleLessonCompleted
  });

  // ==========================================
  // 🎮 PLAYER HANDLERS
  // ==========================================

  // [PATCH 3] Async Handler: Esperamos la promesa de fetchStoredTime
  const handlePlayerReady = useCallback(async () => {
      setIsReady(true);
      
      if (activeLesson?.id && playerRef.current) {
          try {
              // Obtenemos tiempo de forma asíncrona (Soporte API/Mock)
              const savedTime = await fetchStoredTime();
              
              // Smart Resume Lógica
              if (savedTime > 5 && !isLessonCompleted(activeLesson.id)) {
                  console.log(`[SmartResume] Restaurando en: ${savedTime}s`);
                  // Buscamos el segundo exacto
                  playerRef.current.seekTo(savedTime, 'seconds');
              }
          } catch (error) {
              console.warn("[Player] Error recuperando tiempo:", error);
          }
      }
  }, [activeLesson, isLessonCompleted, fetchStoredTime]);

  // Limpieza
  useEffect(() => {
      return () => cancelAutoAdvance();
  }, [srcLessonId]);


  // ==========================================
  // 🖼️ RENDER
  // ==========================================

  if (isLoading) {
    return (
      <div className="flex-1 bg-white dark:bg-[#0B1121] flex items-center justify-center h-screen">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (courseError || !course) {
    return (
      <div className="flex-1 bg-white dark:bg-[#0B1121] flex items-center justify-center h-screen">
         <p className="text-gray-500">No se pudo cargar el curso.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden bg-white dark:bg-[#0B1121]">
      
      {/* 1. TOP NAVBAR */}
      <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f1629] flex items-center px-4 lg:px-6 shrink-0 z-20">
         <div className="flex items-center gap-4 w-full">
            <button 
                onClick={() => setSidebarOpen(true)} 
                className="lg:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
            >
                <Menu size={20} />
            </button>
            
            <div className="flex flex-col">
                <h1 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="truncate max-w-[200px] sm:max-w-md">{activeLesson?.title || "Cargando..."}</span>
                </h1>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                    <span className="truncate max-w-[150px]">{course.title}</span>
                    <ChevronRight size={12} />
                    <span>Lección {srcLessonId?.split('_')[1] || 'Actual'}</span>
                </div>
            </div>
         </div>
      </header>

      {/* 2. MAIN LAYOUT */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* A. SIDEBAR */}
        <PlayerSidebar 
            content={course}
            activeLessonId={activeLesson?.id} 
            isOpen={isSidebarOpen}
            onClose={() => setSidebarOpen(false)}
        />

        {/* B. CONTENT AREA */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar bg-white dark:bg-[#0B1121]">           
            
            {/* VIDEO CONTAINER (Sticky) */}
            <div className="w-full bg-black sticky top-0 z-10 shadow-lg">
                <div className="aspect-video w-full max-h-[70vh] mx-auto relative group">
                    
                    {!isReady && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-900">
                            <Loader2 className="animate-spin text-emerald-500 w-10 h-10" />
                        </div>
                    )}

                    <VideoErrorBoundary onRetry={() => setIsPlaying(true)}>
                        {activeLesson ? (
                            <ReactPlayer
                                key={activeLesson.id} 
                                ref={playerRef}
                                src={activeLesson.videoSrc || ''} 
                                width="100%"
                                height="100%"
                                playing={isPlaying} 
                                controls={true}
                                config={PLAYER_CONFIG}
                                style={{ backgroundColor: '#000' }} 
                                
                                onReady={handlePlayerReady}
                                onProgress={handleProgress}
                                onDurationChange={handleDuration}
                                onEnded={handleLessonCompleted} 
                                onPlay={() => {
                                    setIsPlaying(true);
                                    cancelAutoAdvance(); 
                                }}
                                onPause={() => setIsPlaying(false)}
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                                <Play size={48} className="text-gray-700 opacity-50" />
                            </div>
                        )}
                    </VideoErrorBoundary>
                </div>
            </div>

            {/* TABS & INFO */}
            <div className="flex-1 max-w-5xl mx-auto w-full px-4 lg:px-8 py-6">
                
                <div className="flex items-center border-b border-gray-200 dark:border-gray-800 mb-6 overflow-x-auto no-scrollbar">
                    <TabButton 
                        label="Descripción general" 
                        isActive={activeTab === UI_TABS.OVERVIEW} 
                        onClick={() => setActiveTab(UI_TABS.OVERVIEW)} 
                    />
                    <TabButton 
                        label="Recursos" 
                        icon={Download}
                        isActive={activeTab === UI_TABS.RESOURCES} 
                        onClick={() => setActiveTab(UI_TABS.RESOURCES)} 
                    />
                    <TabButton 
                        label="Notas" 
                        icon={FileText}
                        isActive={activeTab === UI_TABS.NOTES} 
                        onClick={() => setActiveTab(UI_TABS.NOTES)} 
                    />
                </div>

                <div className="min-h-[200px] pb-20">
                    <ContentPanel 
                        activeTab={activeTab} 
                        course={course}
                        activeLesson={activeLesson}
                    />
                </div>

            </div>
        </main>

      </div>
    </div>
  );
};

export default CoursePlayerPage;