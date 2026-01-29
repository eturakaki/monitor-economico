import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import ReactPlayer from 'react-player'; // [ARCH] Universal Player (Soporta .MOV y YouTube)
import { toast } from 'sonner';
import { 
  Loader2, Download, MessageCircle, Menu, 
  ChevronRight, CheckCircle 
} from 'lucide-react';

// --- CORE SERVICES & CONTEXTS ---
import { useAuth } from '../hooks/useAuth'; 
import { cursos } from '../data/cursos'; 
import { courseContentMock } from '../data/courseContentMock'; 
import { PlayerSidebar } from '../components/player/PlayerSidebar';

// --- CONFIGURACIÓN DE INGENIERÍA ---
/**
 * Constantes de configuración del reproductor.
 * Se extraen para evitar la recreación de objetos en cada renderizado (Performance).
 */
const PLAYER_CONFIG = {
  youtube: { 
    playerVars: { showinfo: 1, modestbranding: 1, rel: 0, origin: window.location.origin } 
  },
  file: { 
    attributes: { 
      controlsList: 'nodownload', // Seguridad básica: dificulta la descarga directa
      disablePictureInPicture: false
    } 
  }
};

// [TESTING] Archivo local para pruebas cuando falla el streaming o no hay URL
// Vite sirve archivos de la carpeta 'public' directamente en la raíz '/'
const LOCAL_TEST_VIDEO = "/IMG_6217.MOV";

const TABS = { RESOURCES: 'resources', NOTES: 'notes' };

// --- COMPONENTES VISUALES (UI) ---
/**
 * ResourcesPanel: Panel lateral desacoplado.
 * Mantiene el principio de responsabilidad única (SRP) para la UI de recursos.
 */
const ResourcesPanel = ({ activeTab }) => (
  <div className="p-6">
     {activeTab === TABS.RESOURCES ? (
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
      ) : (
          <div className="text-center py-8 animate-in fade-in duration-300">
              <div className="bg-gray-100 dark:bg-gray-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 mb-2">Tus notas son privadas</p>
              <button className="text-xs font-semibold text-emerald-600 hover:text-emerald-500 transition-colors border border-emerald-200 px-4 py-2 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                  + Crear nueva nota
              </button>
          </div>
      )}
  </div>
);

/**
 * ------------------------------------------------------------------
 * PAGE: COURSE PLAYER (SMART CONTROLLER)
 * ------------------------------------------------------------------
 * Orquestador principal. Gestiona la lógica de reproducción híbrida (Local/Cloud).
 */
const CoursePlayerPage = () => {
  const { id } = useParams();
  
  // [INJECTION] Dependencias del Sistema
  const { markLessonAsCompleted, isLessonCompleted } = useAuth(); 

  // [STATE] Flujo de Datos UI
  const [activeLesson, setActiveLesson] = useState(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(TABS.RESOURCES); 
  
  // [STATE] Motor de Video
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef(null);

  // [DATA] Selectores Memoizados (Optimización de Lectura)
  const courseMetadata = useMemo(() => cursos.find(c => c.id === id), [id]);
  const courseContent = useMemo(() => courseContentMock[id] || courseContentMock['default'], [id]);

 // --- LÓGICA DE INICIALIZACIÓN ---
  useEffect(() => {
    const hasContent = courseContent?.modules?.[0]?.lessons?.length > 0;

    if (hasContent) {
      // SOLUCIÓN: Usamos el patrón de actualización funcional.
      // 'current' recibe el valor más fresco del estado sin añadir 'activeLesson' a las dependencias.
      setActiveLesson(current => {
        if (current) return current; // Si ya existe lección, no hacemos nada (evita re-render)

        console.log("🚀 [Player] Inicializando curso:", courseMetadata?.title);
        return courseContent.modules[0].lessons[0];
      });
    }
  }, [courseContent, courseMetadata]); // Ahora el array de dependencias es veraz y completo.
  
  // --- HANDLERS (CONTROLADORES DE EVENTOS) ---

  const handleLessonChange = useCallback((lesson) => {
    setActiveLesson(lesson);
    setIsPlaying(true); // UX: Si el usuario cambia manualmente, asumimos que quiere ver el video ya.
    
    // Mobile UX: Scroll suave hacia arriba para ver el video
    if (window.innerWidth < 1024) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  /**
   * Gatillo de Progreso: Se dispara SOLAMENTE cuando el video termina.
   * Conecta con el backend (simulado) para guardar el avance.
   */
  const handleVideoEnded = useCallback(() => {
    if (!activeLesson) return;

    // Patrón Idempotente: Evita llamadas duplicadas si ya estaba marcado.
    if (!isLessonCompleted(activeLesson.id)) {
        markLessonAsCompleted(id, activeLesson.id);
        
        toast.success("¡Lección completada!", {
            description: `Has terminado "${activeLesson.title}"`,
            icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
            duration: 4000,
        });
    }
  }, [activeLesson, id, isLessonCompleted, markLessonAsCompleted]);

  /**
   * [RESOLVER] Determina la fuente del video.
   * Prioridad: 
   * 1. URL específica de la lección (si existe).
   * 2. Video Local de Prueba (Fallback para desarrollo/test).
   */
  const getVideoSource = () => {
  if (!activeLesson) return null;
  
  // Lógica Senior: Confiamos en la data. 
  // Si hay videoUrl, la usamos (sea de YouTube o local).
  // Si no hay, podemos retornar null o una imagen de placeholder, 
  // pero NO un video hardcodeado oculto en el código.
  return activeLesson.videoUrl;
};

  // --- SAFEGUARDS (Pantallas de Carga/Error) ---
  if (!courseMetadata) {
    return (
      <div className="flex-1 bg-[#0B1121] flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
          <p className="text-gray-400 text-sm animate-pulse">Cargando entorno de aprendizaje...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden bg-gray-50 dark:bg-black">
      
      {/* 1. HEADER DE NAVEGACIÓN */}
      <header className="h-14 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f1629] flex items-center justify-between px-4 shrink-0 z-20 relative shadow-sm">
         <div className="flex items-center gap-3 overflow-hidden">
            {/* Trigger Menú Mobile */}
            <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-emerald-500 active:bg-gray-100 dark:active:bg-gray-800 rounded-md transition-colors"
            >
                <Menu size={20} />
            </button>
            
            {/* Info de Lección Actual */}
            <div className="flex flex-col">
                <h1 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-md flex items-center gap-2">
                    {activeLesson?.title || "Cargando lección..."}
                    {isLessonCompleted(activeLesson?.id) && (
                        <span title="Completada">
                          <CheckCircle size={14} className="text-emerald-500" />
                        </span>
                    )}
                </h1>
                <nav className="flex items-center gap-1 text-[10px] text-gray-500">
                    <span className="truncate max-w-[150px] font-medium">{courseMetadata?.title}</span>
                    <ChevronRight size={10} />
                    <span className="text-emerald-600 dark:text-emerald-400">Reproduciendo</span>
                </nav>
            </div>
         </div>

         {/* Badge Desktop */}
         <div className="hidden sm:flex gap-2">
             <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/20 text-xs font-semibold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Modo Alumno
             </div>
         </div>
      </header>

      {/* 2. ÁREA DE TRABAJO (GRID PRINCIPAL) */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* COMPONENTE: SIDEBAR DE NAVEGACIÓN */}
        <PlayerSidebar 
            content={courseContent} 
            activeLessonId={activeLesson?.id}
            onLessonSelect={handleLessonChange}
            isOpen={isSidebarOpen}
            onClose={() => setSidebarOpen(false)}
        />

        {/* COMPONENTE: ESCENARIO PRINCIPAL */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar bg-white dark:bg-[#0B1121]">
            
            {/* --- REPRODUCTOR DE VIDEO (CORE) --- */}
            {/* Aspect Ratio 16:9 forzado con aspect-video de Tailwind */}
            <div className="w-full bg-black sticky top-0 z-10 shadow-2xl aspect-video group">
                {activeLesson ? (
                    <ReactPlayer
                        // [ARCH] Key es vital para forzar re-render completo al cambiar entre tipos de fuente (YouTube <-> Archivo Local)
                        key={activeLesson.id} 
                        ref={playerRef}
                        // Usamos el resolver inteligente
                        url={getVideoSource()} 
                        width="100%"
                        height="100%"
                        playing={isPlaying} 
                        controls={true}
                        onEnded={handleVideoEnded}
                        config={PLAYER_CONFIG}
                        // Fallback de estilo
                        style={{ backgroundColor: '#000' }} 
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 bg-gray-900">
                        <Loader2 className="animate-spin mb-3 text-emerald-500" size={32} /> 
                        <span className="text-sm font-medium tracking-wide">Cargando contenido multimedia...</span>
                    </div>
                )}
            </div>

            {/* --- TABS (SOLO MOBILE) --- */}
            <div className="block 2xl:hidden flex-1 bg-white dark:bg-[#0B1121]">
                <div className="flex border-b border-gray-200 dark:border-gray-800">
                    {[
                        { id: TABS.RESOURCES, label: 'Recursos' },
                        { id: TABS.NOTES, label: 'Mis Notas' }
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 py-4 text-sm font-medium border-b-2 transition-all ${
                                activeTab === tab.id 
                                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10' 
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                <ResourcesPanel activeTab={activeTab} />
            </div>
        </main>

        {/* --- PANEL DERECHO (DESKTOP) --- */}
        <aside className="hidden 2xl:flex w-96 flex-col bg-white dark:bg-[#0f1629] border-l border-gray-200 dark:border-gray-800 shrink-0 z-10 shadow-xl shadow-gray-200/50 dark:shadow-none">
            <div className="flex border-b border-gray-200 dark:border-gray-800">
                 {[
                    { id: TABS.RESOURCES, label: 'Recursos' },
                    { id: TABS.NOTES, label: 'Mis Notas' }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 py-4 text-sm font-medium border-b-2 transition-all ${
                            activeTab === tab.id 
                            ? 'border-emerald-500 text-emerald-600 bg-emerald-50/30' 
                            : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <ResourcesPanel activeTab={activeTab} />
            </div>
        </aside>

      </div>
    </div>
  );
};

export default CoursePlayerPage;