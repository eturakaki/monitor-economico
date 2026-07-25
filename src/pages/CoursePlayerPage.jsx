/**
 * @file CoursePlayerPage.jsx
 * @description PÁGINA PRINCIPAL DEL REPRODUCTOR (Smart Consumer)
 * Implementa el patrón Provider-Consumer y UX refinada (Auto-Scroll).
 * @version 4.1.0 (UX Polish: Scroll Reset)
 * @path src/pages/CoursePlayerPage.jsx
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactPlayer from 'react-player';
import {
  Loader2, Menu, ChevronLeft, ChevronRight,
  PlayCircle, CheckCircle, Download, FileText, Info
} from 'lucide-react';

// --- CONTEXT ---
import { CoursePlayerProvider, useCoursePlayer } from '../context/CoursePlayerContext';

// --- HOOKS ---
import { useVideoProgress } from '../hooks/useVideoProgress';

// --- COMPONENTS ---
import { PlayerSidebar } from '../components/player/PlayerSideBar';
import VideoErrorBoundary from '../components/player/VideoErrorBoundary';

// ==========================================
// 🧩 SUB-COMPONENTS (UI Only)
// ==========================================

const TabButton = ({ label, isActive, onClick, icon: Icon }) => (
  <button 
    onClick={onClick}
    className={`
      flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all
      ${isActive 
        ? 'border-emerald-500 text-gray-900 dark:text-white' 
        : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'}
    `}
  >
    {Icon && <Icon size={16} className={isActive ? 'text-emerald-500' : 'text-gray-400'} />}
    {label}
  </button>
);

// ==========================================
// 🎨 LAYOUT INTERNO (Consumer)
// ==========================================
const CoursePlayerLayout = () => {
    // 1. CONSUMIR CONTEXTO
    const {
        course,
        courseId,
        activeLesson,
        isLoading,
        error,
        isSidebarOpen,
        toggleSidebar,
        markCurrentAsCompleted,
        nextLesson,
        previousLesson,
        isLessonCompleted
    } = useCoursePlayer();

    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [isPlaying, setIsPlaying] = useState(false);

    // Referencia al contenedor principal para manipular el scroll
    const contentRef = useRef(null);
    // Referencia al reproductor, para poder buscar (seek) al retomar una lección
    const playerRef = useRef(null);
    const resumeTimeRef = useRef(0);
    const resumeAppliedRef = useRef(false);

    // 2. TELEMETRÍA DE VIDEO: detección de 90%, guardado de watch time y resume.
    // Hooks van siempre antes de cualquier return condicional (Rules of Hooks).
    const { handleDuration, handleProgress, fetchStoredTime } = useVideoProgress({
        courseId,
        activeLessonId: activeLesson?.id,
        onComplete: markCurrentAsCompleted,
    });

    // Al cambiar de lección, buscamos el segundo guardado para retomar ahí.
    useEffect(() => {
        resumeAppliedRef.current = false;
        resumeTimeRef.current = 0;

        if (!activeLesson?.id) return;

        let cancelled = false;
        fetchStoredTime().then((seconds) => {
            if (!cancelled) resumeTimeRef.current = seconds;
        });

        return () => { cancelled = true; };
    }, [activeLesson?.id, fetchStoredTime]);

    // Cuando el player conoce la duración (metadata lista), aplicamos el seek
    // de resume una única vez por lección.
    const handleLoadedDuration = useCallback((event) => {
        handleDuration(event);
        if (!resumeAppliedRef.current && resumeTimeRef.current > 0 && playerRef.current) {
            playerRef.current.currentTime = resumeTimeRef.current;
        }
        resumeAppliedRef.current = true;
    }, [handleDuration]);

    // 3. UX: SCROLL TO TOP ON LESSON CHANGE
    // Detectamos cambio de lección y reseteamos el scroll del contenedor <main>
    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollTop = 0;
        }
    }, [activeLesson?.id]);

    // 4. ESTADOS DE CARGA Y ERROR
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-white dark:bg-[#0B1121]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                    <p className="text-sm text-gray-500 animate-pulse">Cargando contenido...</p>
                </div>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="flex items-center justify-center h-screen bg-white dark:bg-[#0B1121]">
                <div className="text-center p-8 max-w-md">
                    <h2 className="text-xl font-bold text-red-500 mb-2">Error al cargar el curso</h2>
                    <p className="text-gray-500 mb-6">{error || "No se pudo encontrar el contenido solicitado."}</p>
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        Volver al Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // 4. HANDLERS DE NAVEGACIÓN
    const handleNext = () => {
        if (nextLesson) navigate(`/curso/${course.id}/leccion/${nextLesson.id}`);
    };

    const handlePrev = () => {
        if (previousLesson) navigate(`/curso/${course.id}/leccion/${previousLesson.id}`);
    };

    const handleVideoEnd = () => {
        markCurrentAsCompleted(); // ✅ Check verde instantáneo
    };

    // 5. RENDER PRINCIPAL
    return (
        <div className="flex flex-col h-screen bg-white dark:bg-[#0B1121] overflow-hidden">
            
            {/* A. HEADER MÓVIL / TITLE BAR */}
            <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f1629] flex items-center px-4 shrink-0 z-20 justify-between">
                <div className="flex items-center gap-4 overflow-hidden">
                    <button 
                        onClick={toggleSidebar} 
                        className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 rounded-md lg:hidden transition-colors"
                    >
                        <Menu size={20} />
                    </button>
                    
                    <div className="flex flex-col min-w-0">
                        <h1 className="text-sm md:text-base font-bold text-gray-900 dark:text-white truncate">
                            {activeLesson?.title || "Selecciona una lección"}
                        </h1>
                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {course.title}
                        </span>
                    </div>
                </div>

                <button 
                    onClick={() => navigate('/dashboard')}
                    className="hidden sm:flex text-xs font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                >
                    Salir
                </button>
            </header>

            {/* B. WORKSPACE */}
            <div className="flex flex-1 overflow-hidden relative">
                
                {/* SIDEBAR */}
                <PlayerSidebar 
                    content={course}
                    activeLessonId={activeLesson?.id}
                    isOpen={isSidebarOpen}
                    onClose={toggleSidebar}
                />

                {/* AREA DE CONTENIDO (Con referencia para scroll) */}
                <main 
                    ref={contentRef}
                    className="flex-1 flex flex-col overflow-y-auto custom-scrollbar relative w-full"
                >
                    
                    {/* 1. REPRODUCTOR DE VIDEO (Sticky) */}
                    <div className="w-full bg-black z-10 shadow-xl">
                        <div className="aspect-video w-full max-h-[75vh] mx-auto relative bg-black">
                            <VideoErrorBoundary onRetry={() => window.location.reload()}>
                                {activeLesson?.videoSrc ? (
                                    <ReactPlayer
                                        ref={playerRef}
                                        key={activeLesson.id}
                                        src ={activeLesson.videoSrc}
                                        width="100%"
                                        height="100%"
                                        controls
                                        playing={isPlaying}
                                        onPlay={() => setIsPlaying(true)}
                                        onPause={() => setIsPlaying(false)}
                                        onEnded={handleVideoEnd}
                                        onTimeUpdate={handleProgress}
                                        onDurationChange={handleLoadedDuration}
                                        config={{
                                            youtube: { playerVars: { showinfo: 0, modestbranding: 1 } }
                                        }}
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                                        <PlayCircle size={48} className="opacity-50 mb-2" />
                                        <p>Selecciona una lección para comenzar</p>
                                    </div>
                                )}
                            </VideoErrorBoundary>
                        </div>
                    </div>

                    {/* 2. BARRA DE NAVEGACIÓN */}
                    <div className="bg-white dark:bg-[#0f1629] border-b border-gray-200 dark:border-gray-800 p-4 flex flex-wrap items-center justify-between gap-4">
                        
                        <div className="flex items-center gap-2">
                             {activeLesson && isLessonCompleted(activeLesson.id) ? (
                                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-900/50">
                                    <CheckCircle size={14} /> Completada
                                </span>
                             ) : (
                                <span className="text-xs text-gray-500 font-medium px-2">
                                    No vista
                                </span>
                             )}
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                                onClick={handlePrev}
                                disabled={!previousLesson}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-300"
                            >
                                <ChevronLeft size={16} /> Anterior
                            </button>
                            <button
                                onClick={handleNext}
                                disabled={!nextLesson}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-gray-900 text-white hover:bg-black dark:bg-emerald-600 dark:hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                            >
                                Siguiente <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>

                    {/* 3. TABS Y DETALLES */}
                    <div className="max-w-5xl mx-auto w-full px-4 lg:px-8 py-8">
                        <div className="flex border-b border-gray-200 dark:border-gray-800 mb-6 overflow-x-auto">
                            <TabButton 
                                label="Descripción" 
                                icon={Info}
                                isActive={activeTab === 'overview'} 
                                onClick={() => setActiveTab('overview')} 
                            />
                            <TabButton 
                                label="Recursos" 
                                icon={Download}
                                isActive={activeTab === 'resources'} 
                                onClick={() => setActiveTab('resources')} 
                            />
                            <TabButton 
                                label="Notas" 
                                icon={FileText}
                                isActive={activeTab === 'notes'} 
                                onClick={() => setActiveTab('notes')} 
                            />
                        </div>

                        <div className="animate-in fade-in duration-300 min-h-[200px] pb-10">
                            {activeTab === 'overview' && (
                                <div className="prose dark:prose-invert max-w-none">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Sobre esta clase</h3>
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                        {activeLesson?.description || "Sin descripción disponible para esta lección."}
                                    </p>
                                </div>
                            )}
                            {activeTab === 'resources' && (
                                <div className="text-center py-8 text-gray-500 border border-dashed border-gray-200 rounded-lg">
                                    <Download className="mx-auto w-8 h-8 mb-2 opacity-50" />
                                    <p>No hay recursos descargables para esta lección.</p>
                                </div>
                            )}
                            {activeTab === 'notes' && (
                                <div className="text-center py-8 text-gray-500 border border-dashed border-gray-200 rounded-lg">
                                    <FileText className="mx-auto w-8 h-8 mb-2 opacity-50" />
                                    <p>Tus notas aparecerán aquí.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

// ==========================================
// 🚀 MAIN ENTRY POINT
// ==========================================
const CoursePlayerPage = () => {
    const params = useParams();
    const courseId = params.courseId || params.id;
    const lessonId = params.lessonId;

    return (
        <CoursePlayerProvider courseId={courseId} lessonId={lessonId}>
            <CoursePlayerLayout />
        </CoursePlayerProvider>
    );
};

export default CoursePlayerPage;