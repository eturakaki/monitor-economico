import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import ReactPlayer from 'react-player'; // [CORE] Motor de video
import { toast } from 'sonner';
import { 
  Loader2, Play, Download, MessageCircle, Menu, 
  ChevronRight, CheckCircle, FileText 
} from 'lucide-react';

// Contexts & Data
import { useAuth } from '../hooks/useAuth'; // [CHANGE] Migramos de Shop a Auth para el progreso
import { cursos } from '../data/cursos'; 
import { courseContentMock } from '../data/courseContentMock'; 
import { PlayerSidebar } from '../components/player/PlayerSidebar';

// --- HELPER COMPONENT: RESOURCE PANEL ---
// Mantenemos tu componente UI intacto para preservar la identidad visual.
const ResourcesPanel = ({ activeTab }) => (
  <div className="p-6">
     {activeTab === 'resources' ? (
          <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Descargas</h3>
              <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-emerald-500 transition-colors cursor-pointer group bg-white dark:bg-gray-800/50">
                  <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 transition-colors">
                          <Download className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-emerald-500" />
                      </div>
                      <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Diapositivas</p>
                          <p className="text-[10px] text-gray-500">PDF - 2.4 MB</p>
                      </div>
                  </div>
              </div>
          </div>
      ) : (
          <div className="text-center py-8">
              <MessageCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Notas personales</p>
              <button className="mt-2 text-xs text-emerald-500 font-medium">Crear nota</button>
          </div>
      )}
  </div>
);

/**
 * ------------------------------------------------------------------
 * PAGE: COURSE PLAYER (SMART COMPONENT)
 * ------------------------------------------------------------------
 * Orquestador principal de la experiencia de aprendizaje.
 * Responsabilidades:
 * 1. Gestión del Reproductor de Video (ReactPlayer).
 * 2. Sincronización de Progreso (Trigger onEnded).
 * 3. Gestión del Layout Adaptativo (Mobile/Desktop).
 */
const CoursePlayerPage = () => {
  const { id } = useParams();
  
  // [ARCH] Inyectamos dependencias de Auth para escribir progreso
  const { markLessonAsCompleted, isLessonCompleted } = useAuth(); 

  // --- STATE ---
  const [activeLesson, setActiveLesson] = useState(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('resources'); 
  
  // Estados del Player
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef(null);

  // --- DATA FETCHING (Memoized) ---
  const courseMetadata = useMemo(() => cursos.find(c => c.id === id), [id]);
  const courseContent = useMemo(() => courseContentMock[id] || courseContentMock['default'], [id]);

  // --- INITIALIZATION ---
  useEffect(() => {
    // [ARCH CHECK] Eliminada la validación de seguridad (verifyAccess).
    // Ahora confiamos en el GuardedCourseRoute. Esto evita doble redirección y limpia el código.
    
    // Auto-select primera lección si no hay ninguna activa
    if (!activeLesson && courseContent?.modules?.[0]?.lessons?.length > 0) {
      // [FIX] Envolvemos en setTimeout para convertir la actualización en asíncrona (Macrotask).
      // Esto evita el error "Synchronous setState" y permite que el componente termine de montarse primero.
      const timer = setTimeout(() => {
          setActiveLesson(courseContent.modules[0].lessons[0]);
      }, 0);
      
      return () => clearTimeout(timer); // Limpieza preventiva
    }
  }, [courseContent, activeLesson]);

  // --- PLAYER LOGIC HANDLERS ---

  const handleLessonChange = (lesson) => {
    setActiveLesson(lesson);
    setIsPlaying(true); // Autoplay UX al cambiar lección
    
    // UX: Scroll reset para móviles
    if (window.innerWidth < 1024) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /**
   * [CORE LOGIC] Trigger de finalización.
   * Se ejecuta cuando el video termina naturalmente.
   */
  const handleVideoEnded = () => {
    if (!activeLesson) return;

    // Solo disparamos la escritura si la lección NO estaba completada previamente.
    // Esto ahorra llamadas innecesarias al "backend".
    if (!isLessonCompleted(activeLesson.id)) {
        
        // 1. Llamada al Servicio (vía Context)
        markLessonAsCompleted(id, activeLesson.id);
        
        // 2. Feedback Visual Inmediato
        toast.success("¡Lección completada!", {
            description: `Has terminado "${activeLesson.title}"`,
            icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
            duration: 3000,
        });
    }
  };

  // Fail-safe visual si los datos no cargan (aunque ProtectedRoute debería prevenir esto)
  if (!courseMetadata) {
    return (
      <div className="flex-1 bg-[#0B1121] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden">
      
      {/* 1. PLAYER HEADER */}
      <div className="h-14 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f1629] flex items-center justify-between px-4 shrink-0">
         <div className="flex items-center gap-3 overflow-hidden">
            {/* Mobile Menu Trigger */}
            <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-emerald-500 active:bg-gray-100 dark:active:bg-gray-800 rounded-md transition-colors"
            >
                <Menu size={20} />
            </button>
            
            <div className="flex flex-col">
                <h1 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-md flex items-center gap-2">
                    {activeLesson?.title || "Cargando..."}
                    {/* Indicador visual en el header si ya está vista */}
                    {isLessonCompleted(activeLesson?.id) && (
                        <CheckCircle size={14} className="text-emerald-500" />
                    )}
                </h1>
                <div className="flex items-center gap-1 text-[10px] text-gray-500">
                    <span className="truncate max-w-[150px]">{courseMetadata?.title}</span>
                    <ChevronRight size={10} />
                    <span>Reproduciendo ahora</span>
                </div>
            </div>
         </div>

         {/* Desktop Controls */}
         <div className="hidden sm:flex gap-2">
             <span className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded border border-emerald-500/20 font-medium">
                Modo Alumno
             </span>
         </div>
      </div>

      {/* 2. MAIN WORKSPACE */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* A. SIDEBAR / DRAWER */}
        <PlayerSidebar 
            content={courseContent} 
            activeLessonId={activeLesson?.id}
            onLessonSelect={handleLessonChange}
            isOpen={isSidebarOpen}
            onClose={() => setSidebarOpen(false)}
        />

        {/* B. CENTER STAGE */}
        <main className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-black overflow-y-auto">
            
            {/* VIDEO PLAYER CONTAINER */}
            {/* Wrapper aspect-video para mantener 16:9 responsivo */}
            <div className="w-full bg-black sticky top-0 z-10 shadow-lg aspect-video">
                {activeLesson ? (
                    <ReactPlayer
                        ref={playerRef}
                        // [FALLBACK] URL de prueba profesional si el mock no tiene videoUrl
                        url={activeLesson.videoUrl || "https://www.youtube.com/watch?v=lxS89zZ8JVE"} 
                        width="100%"
                        height="100%"
                        playing={isPlaying}
                        controls={true}
                        // [HOOK] El evento clave para tu lógica de progreso
                        onEnded={handleVideoEnded} 
                        // Configuración limpia para YouTube (sin sugerencias externas)
                        config={{
                            youtube: { playerVars: { showinfo: 1, modestbranding: 1, rel: 0 } }
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <Loader2 className="animate-spin mr-2" /> Cargando contenido...
                    </div>
                )}
            </div>

            {/* [MÓVIL] TABS */}
            <div className="block 2xl:hidden flex-1 bg-white dark:bg-[#0B1121]">
                <div className="flex border-b border-gray-200 dark:border-gray-800">
                    <button 
                        onClick={() => setActiveTab('resources')}
                        className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'resources' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-gray-500'}`}
                    >
                        Recursos
                    </button>
                    <button 
                        onClick={() => setActiveTab('notes')}
                        className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'notes' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-gray-500'}`}
                    >
                        Notas
                    </button>
                </div>
                <ResourcesPanel activeTab={activeTab} />
            </div>
        </main>

        {/* C. RIGHT COLUMN (Desktop Resources) */}
        <aside className="hidden 2xl:flex w-80 flex-col bg-white dark:bg-[#0f1629] border-l border-gray-200 dark:border-gray-800 shrink-0 z-10">
            <div className="flex border-b border-gray-200 dark:border-gray-800">
                <button 
                    onClick={() => setActiveTab('resources')}
                    className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'resources' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500'}`}
                >
                    Recursos
                </button>
                <button 
                    onClick={() => setActiveTab('notes')}
                    className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'notes' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500'}`}
                >
                    Notas
                </button>
            </div>
            <div className="flex-1 overflow-y-auto">
                <ResourcesPanel activeTab={activeTab} />
            </div>
        </aside>

      </div>
    </div>
  );
};

export default CoursePlayerPage;