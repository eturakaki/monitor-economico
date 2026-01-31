/**
 * @file CoursePlayerPage.jsx
 * @version 4.0.0-Production
 * @description Core LMS Player Controller. Implementa arquitectura URL-Driven y Smart Resume V2.
 * @architectural_decisions
 * - URL as Single Source of Truth: Evita race conditions en F5.
 * - Video Error Boundary: Aísla fallos críticos del reproductor.
 * - Key-Based Remounting: Fuerza limpieza de memoria en cambios de lección.
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import ReactPlayer from 'react-player';
import { toast } from 'sonner';
import { 
  Loader2, Download, MessageCircle, Menu, 
  CheckCircle, AlertCircle, History, AlertTriangle, RefreshCcw 
} from 'lucide-react';

// --- SERVICE LAYER ---
import { useAuth } from '../hooks/useAuth'; 
import { useCourseData } from '../hooks/useCourseData';
import { PlayerSidebar } from '../components/player/PlayerSideBar';

// --- DOMAIN LOGIC ---
import { useVideoProgress, getStoredProgress } from '../hooks/useVideoProgress';

// ==========================================
// 🛡️ ERROR BOUNDARIES (Safety Layer)
// ==========================================

/**
 * @class VideoErrorBoundary
 * @description Captura errores fatales dentro del árbol de ReactPlayer para evitar 
 * que toda la aplicación colapse (White Screen of Death).
 */
class VideoErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
  
    static getDerivedStateFromError(error) {
        return { hasError: true };
    }
  
    componentDidCatch(error, errorInfo) {
        console.error("🔥 [VideoCrash] Critical Player Failure:", error, errorInfo);
    }
  
    handleRetry = () => {
        this.setState({ hasError: false });
        if (this.props.onRetry) this.props.onRetry();
    };
  
    render() {
        if (this.state.hasError) {
            return (
                <div className="absolute inset-0 bg-gray-900 z-50 flex flex-col items-center justify-center text-white space-y-4 animate-in fade-in">
                    <AlertTriangle className="w-12 h-12 text-amber-500" />
                    <div className="text-center px-4">
                        <h3 className="font-bold text-lg">Error del Reproductor</h3>
                        <p className="text-gray-400 text-sm max-w-xs mx-auto mt-1">
                            El motor de video ha encontrado un problema irrecuperable.
                        </p>
                    </div>
                    <button 
                        onClick={this.handleRetry}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors font-medium text-sm shadow-lg hover:shadow-emerald-500/20"
                    >
                        <RefreshCcw size={16} />
                        Reiniciar Motor
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

// ==========================================
// ⚙️ CONFIGURATION
// ==========================================

const PLAYER_CONFIG = Object.freeze({
  youtube: { 
    playerVars: { showinfo: 0, modestbranding: 1, rel: 0, origin: typeof window !== 'undefined' ? window.location.origin : '' } 
  },
  file: { 
    attributes: { controlsList: 'nodownload', disablePictureInPicture: false } 
  }
});

const UI_TABS = Object.freeze({ RESOURCES: 'resources', NOTES: 'notes' });

// ==========================================
// 🧩 PURE UI COMPONENTS (Memoized)
// ==========================================

const ResourcesPanel = React.memo(({ activeTab }) => {
    // Mantenemos tu lógica de UI intacta, solo encapsulada limpiamente.
    const content = useMemo(() => {
        if (activeTab === UI_TABS.RESOURCES) {
            return (
                <div className="space-y-4 animate-in fade-in duration-300">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Descargas Disponibles</h3>
                    <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-emerald-500 transition-colors cursor-pointer group bg-white dark:bg-gray-800/50 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 transition-colors">
                                <Download className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Material Complementario</p>
                                <p className="text-[10px] text-gray-500">PDF - 2.4 MB</p>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        return (
            <div className="text-center py-8 animate-in fade-in duration-300">
                <div className="bg-gray-100 dark:bg-gray-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MessageCircle className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 mb-2">Tus notas son privadas</p>
                <button className="text-xs font-semibold text-emerald-600 hover:text-emerald-500 transition-colors border border-emerald-200 px-4 py-2 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                    + Crear nueva nota
                </button>
            </div>
        );
    }, [activeTab]);

    return <div className="p-6 h-full">{content}</div>;
});

// ==========================================
// 🚀 MAIN CONTROLLER
// ==========================================

const CoursePlayerPage = () => {
  // 1. ROUTING CONTEXT
  const params = useParams();
  const courseId = params.courseId || params.id; // Soporte Legacy/New URL
  const urlLessonId = params.lessonId;           

  // 2. DATA LAYER (Hooks)
  const { course, isLoading, error } = useCourseData(courseId);
  const { markLessonAsCompleted, isLessonCompleted } = useAuth(); 
  
  // 3. UI LOCAL STATE
  const [isMounted, setIsMounted] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(UI_TABS.RESOURCES);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Refs
  const playerRef = useRef(null);

  // Hydration Fix
  useEffect(() => { setIsMounted(true); }, []);

  // ==========================================
  // 🧠 DERIVED STATE (The "Gold Standard")
  // ==========================================
  /**
   * Calculamos la lección activa al vuelo.
   * Eliminamos el `useEffect` de sincronización que causaba flickering y race conditions.
   * Ahora, si la URL cambia, `activeLesson` cambia instantáneamente en el mismo render cycle.
   */
  const activeLesson = useMemo(() => {
    if (!course || !course.modules) return null;

    // Prioridad 1: URL explícita
    if (urlLessonId) {
        for (const module of course.modules) {
            const found = module.lessons.find(l => l.id === urlLessonId);
            if (found) return found;
        }
    }

    // Prioridad 2: Fallback a la primera lección (Default state)
    return course.modules[0]?.lessons[0] || null;
  }, [course, urlLessonId]);

  // ==========================================
  // ⚡ SMART RESUME & PROGRESS
  // ==========================================
  
  const handleLessonCompleted = useCallback(() => {
      if (!activeLesson?.id) return;

      markLessonAsCompleted(courseId, activeLesson.id);
      
      toast.success("¡Lección completada!", {
          description: "Progreso guardado exitosamente.",
          icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
      });
  }, [courseId, activeLesson, markLessonAsCompleted]);

  // Facade Pattern Hook
  useVideoProgress({
      isPlaying: isPlaying,
      activeLessonId: activeLesson?.id,
      onComplete: handleLessonCompleted
  });

  // ==========================================
  // 🎮 PLAYER EVENT HANDLERS
  // ==========================================

  const handlePlayerReady = useCallback(() => {
      // SMART RESUME LOGIC V2
      // Se ejecuta solo cuando el player confirma "Ready State"
      if (activeLesson?.id && playerRef.current) {
          const savedTime = getStoredProgress(activeLesson.id);
          
          // Umbral de 5s para evitar resume en introducciones
          if (savedTime > 5) {
              // Pequeño defer para asegurar que el motor interno de YT/HTML5 responda
              setTimeout(() => {
                  try {
                    playerRef.current.seekTo(savedTime, 'seconds');
                    toast.info("Reanudando reproducción", {
                        description: `Desde ${new Date(savedTime * 1000).toISOString().substr(14, 5)}`,
                        icon: <History className="w-4 h-4 text-blue-500" />,
                        duration: 2000
                    });
                  } catch (e) {
                      console.warn("[SmartResume] Seek failed silently:", e);
                  }
              }, 500);
          }
      }
      setIsPlaying(true); // Auto-play en navegación
  }, [activeLesson]);

  const handleVideoError = useCallback((e) => {
      console.warn("⚠️ [MediaError] Non-Fatal:", e);
      toast.error("No se pudo cargar el video", {
          description: "Verifica tu conexión o intenta más tarde."
      });
  }, []);

  // ==========================================
  // 🖼️ RENDER PHASES
  // ==========================================

  // PHASE 1: LOADING (Blocking)
  // Bloqueamos renderizado hasta tener datos para evitar cálculos erróneos de activeLesson
  if (isLoading) {
    return (
      <div className="flex-1 bg-[#0B1121] flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4 animate-pulse">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
            <span className="text-emerald-500/80 text-xs font-mono tracking-widest uppercase">Cargando Entorno LMS...</span>
        </div>
      </div>
    );
  }

  // PHASE 2: ERROR STATE
  if (error || !course) {
    return (
      <div className="flex-1 bg-[#0B1121] flex items-center justify-center h-screen">
         <div className="text-center space-y-4 max-w-md px-6">
            <div className="bg-red-500/10 p-4 rounded-full inline-block">
                <AlertCircle className="w-12 h-12 text-red-500 opacity-90" />
            </div>
            <h2 className="text-white font-bold text-xl">Error de Carga</h2>
            <p className="text-gray-400 text-sm">No pudimos recuperar el contenido del curso.</p>
            <button 
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
                Reintentar Conexión
            </button>
         </div>
      </div>
    );
  }

  // PHASE 3: MAIN APP
  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden bg-gray-50 dark:bg-black">
      {/* HEADER */}
      <header className="h-14 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f1629] flex items-center justify-between px-4 shrink-0 z-20 shadow-sm">
         <div className="flex items-center gap-3 overflow-hidden">
            <button 
                onClick={() => setSidebarOpen(true)} 
                className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Abrir menú de lecciones"
            >
                <Menu size={20} />
            </button>
            <div className="flex flex-col min-w-0">
                <h1 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate flex items-center gap-2">
                    {activeLesson?.title || "Cargando Lección..."}
                    {isLessonCompleted(activeLesson?.id) && (
                        <CheckCircle size={14} className="text-emerald-500 shrink-0" aria-label="Lección completada" />
                    )}
                </h1>
                <span className="text-[10px] text-gray-500 truncate">{course.title}</span>
            </div>
         </div>
      </header>

      {/* WORKSPACE LAYOUT */}
      <div className="flex flex-1 overflow-hidden relative">
        <PlayerSidebar 
            content={course}
            activeLessonId={activeLesson?.id} 
            // Nota: Ya no pasamos onLessonSelect porque el Sidebar usa routing (Deep Linking)
            isOpen={isSidebarOpen}
            onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar bg-white dark:bg-[#0B1121]">           
            {/* THEATER MODE CONTAINER */}
            <div className="w-full bg-black sticky top-0 z-10 shadow-2xl aspect-video group relative">
                
                {/* Fallback Loader while mounting */}
                {(!isMounted) && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-900">
                        <Loader2 className="animate-spin text-emerald-500" />
                    </div>
                )}

                {/* 🛡️ SAFETY BOUNDARY: Envuelve solo el player */}
                <VideoErrorBoundary onRetry={() => setIsPlaying(true)}>
                    {activeLesson && isMounted ? (
                        <ReactPlayer
                            // 🔥 KEY STRATEGY: Forzamos re-mount completo al cambiar ID.
                            // Esto previene memory leaks y estados zombies del player anterior.
                            key={activeLesson.id} 
                            ref={playerRef}
                            src={activeLesson.videoSrc || activeLesson.videoUrl || ''} 
                            width="100%"
                            height="100%"
                            playing={isPlaying} 
                            controls={true}
                            
                            // Callbacks
                            onReady={handlePlayerReady}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            onEnded={() => setIsPlaying(false)}
                            onError={handleVideoError}
                            
                            config={PLAYER_CONFIG}
                            style={{ backgroundColor: '#000' }} 
                        />
                    ) : null}
                </VideoErrorBoundary>
            </div>

            {/* MOBILE NAVIGATION TABS */}
            <div className="block 2xl:hidden flex-1 bg-white dark:bg-[#0B1121]">
                <nav className="flex border-b border-gray-200 dark:border-gray-800">
                    {Object.values(UI_TABS).map(tab => (
                        <button 
                            key={tab} 
                            onClick={() => setActiveTab(tab)} 
                            className={`flex-1 py-4 text-sm font-medium border-b-2 transition-all capitalize ${
                                activeTab === tab 
                                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/10' 
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                            {tab === UI_TABS.RESOURCES ? 'Recursos' : 'Notas'}
                        </button>
                    ))}
                </nav>
                <ResourcesPanel activeTab={activeTab} />
            </div>
        </main>

        {/* DESKTOP SIDE PANEL (Right) */}
        <aside className="hidden 2xl:flex w-96 flex-col bg-white dark:bg-[#0f1629] border-l border-gray-200 dark:border-gray-800 shrink-0 z-10">
            <nav className="flex border-b border-gray-200 dark:border-gray-800">
                 {Object.values(UI_TABS).map(tab => (
                    <button 
                        key={tab} 
                        onClick={() => setActiveTab(tab)} 
                        className={`flex-1 py-4 text-sm font-medium border-b-2 transition-all capitalize ${
                            activeTab === tab 
                            ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10' 
                            : 'border-transparent text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                        }`}
                    >
                        {tab === UI_TABS.RESOURCES ? 'Recursos' : 'Notas'}
                    </button>
                ))}
            </nav>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <ResourcesPanel activeTab={activeTab} />
            </div>
        </aside>

      </div>
    </div>
  );
};

export default CoursePlayerPage;