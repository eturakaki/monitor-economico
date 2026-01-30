import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import ReactPlayer from 'react-player'; // [ARCH] Soporte híbrido: Archivos nativos y Streaming (YouTube)
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

// --- INGENIERÍA DE CONFIGURACIÓN ---

/**
 * Configuración estática del reproductor para evitar recreación de objetos en el Render Cycle.
 * Define comportamientos de seguridad y UI para diferentes proveedores.
 */
const PLAYER_CONFIG = {
  youtube: { 
    playerVars: { 
      showinfo: 1, 
      modestbranding: 1, 
      rel: 0, 
      origin: window.location.origin // Seguridad: Restricción de dominio
    } 
  },
  file: { 
    attributes: { 
      controlsList: 'nodownload', // UX/Seguridad: Desincentiva la descarga directa
      disablePictureInPicture: false
    } 
  }
};

/**
 * [FALLBACK ASSET]
 * Video de seguridad garantizado. Se usa cuando la fuente principal falla o es inexistente.
 * NOTA: Al estar en 'public', se sirve desde la raíz del servidor.
 */
const LOCAL_TEST_VIDEO = "/demo-video.mp4"; 

const TABS = { RESOURCES: 'resources', NOTES: 'notes' };

// --- COMPONENTES DE UI (Presentational Components) ---

/**
 * ResourcesPanel
 * Componente puro desacoplado para manejar la visualización de recursos laterales.
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
 * Arquitectura: Smart Container.
 * Responsabilidad: Orquestación de estado, resolución de rutas y lógica de progreso.
 */
const CoursePlayerPage = () => {
  const { id } = useParams();
  
  // [DEPENDENCIES] Inyección de servicios
  const { markLessonAsCompleted, isLessonCompleted } = useAuth(); 

  // [UI STATE]
  const [activeLesson, setActiveLesson] = useState(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(TABS.RESOURCES); 
  
  // [PLAYER STATE]
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef(null);

  // [DATA LAYER] Memoización para evitar búsquedas costosas en cada render
  const courseMetadata = useMemo(() => cursos.find(c => c.id === id), [id]);
  const courseContent = useMemo(() => courseContentMock[id] || courseContentMock['default'], [id]);

  // --- LIFECYCLE: INICIALIZACIÓN ---
  useEffect(() => {
    const hasContent = courseContent?.modules?.[0]?.lessons?.length > 0;

    if (hasContent) {
      // Patrón de actualización funcional para garantizar atomicidad
      setActiveLesson(current => {
        if (current) return current; // Preservar estado si ya existe (evita rebotes)

        console.log(`🚀 [Player System] Inicializando contexto: ${courseMetadata?.title}`);
        return courseContent.modules[0].lessons[0];
      });
    }
  }, [courseContent, courseMetadata]); 
  
  // --- BUSINESS LOGIC: HANDLERS ---

  const handleLessonChange = useCallback((lesson) => {
    setActiveLesson(lesson);
    setIsPlaying(true); // UX: Autoplay implícito al cambiar lección manualmente
    
    // UX Mobile: Reset del viewport para priorizar el video
    if (window.innerWidth < 1024) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  /**
   * Manejador de Progreso:
   * Solo dispara la llamada al backend (simulado) cuando el media se consume totalmente.
   * Implementa verificación de idempotencia para evitar llamadas duplicadas a la API.
   */
  const handleVideoEnded = useCallback(() => {
    if (!activeLesson) return;

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
   * [CORE ARCHITECTURE] RESOLUTOR DE FUENTE DE VIDEO INTELIGENTE (ADAPTER PATTERN)
   * * Problema: La data puede venir "sucia" (rutas relativas ../public) o vacía.
   * Solución: Normalizar cualquier input a una URL válida para el navegador.
   */
  const resolveVideoSource = useCallback(() => {
    // 1. Guard Clause: Sin lección, no hay render.
    if (!activeLesson) return null;

    let { videoUrl } = activeLesson;

    // 2. Fallback Strategy (Defensive Programming):
    // Si la URL es nula, indefinida o vacía, inyectamos el asset local de seguridad.
    if (!videoUrl || videoUrl.trim() === '') {
        console.warn(`[Player Warning] URL no provista para lección "${activeLesson.id}". Usando Fallback.`);
        return LOCAL_TEST_VIDEO;
    }

    // 3. External Source Pass-through:
    // Si es YouTube, Vimeo o CDN externo, permitimos el paso directo.
    if (videoUrl.startsWith('http') || videoUrl.startsWith('www.') || videoUrl.includes('youtu')) {
        return videoUrl;
    }

    // 4. Local Path Sanitization (La lógica crítica):
    // El navegador no ve carpetas físicas como 'public' ni entiende '../'.
    // Transformamos rutas relativas de sistema de archivos en Rutas Absolutas de Servidor Web.
    
    // Eliminamos referencias a carpetas padres (../../) y la mención explícita a 'public'
    // Ejemplo entrada: "../../public/demo-video.mp4" -> Salida intermedia: "/demo-video.mp4"
    videoUrl = videoUrl.replace(/(\.\.\/)+public\//g, '').replace('public/', '');
    
    // Aseguramos que sea una ruta absoluta (Root Relative)
    if (!videoUrl.startsWith('/')) {
        videoUrl = `/${videoUrl}`;
    }

    return videoUrl;

  }, [activeLesson]);

  // --- SAFEGUARDS (Loading UI) ---
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
                aria-label="Abrir menú de lecciones"
            >
                <Menu size={20} />
            </button>
            
            {/* Info de Lección Actual */}
            <div className="flex flex-col">
                <h1 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-md flex items-center gap-2">
                    {activeLesson?.title || "Cargando lección..."}
                    {isLessonCompleted(activeLesson?.id) && (
                        <span title="Lección completada">
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
            <div className="w-full bg-black sticky top-0 z-10 shadow-2xl aspect-video group">
                {activeLesson ? (
                    <ReactPlayer
                        // [CRITICAL] Key fuerza la recreación del componente si cambia el ID, 
                        // necesario para limpiar buffers internos entre tipos de video (YouTube vs File).
                        key={activeLesson.id} 
                        ref={playerRef}
                        
                        // Inyección de URL sanitizada y resuelta
                        url={resolveVideoSource()} 
                        
                        width="100%"
                        height="100%"
                        playing={isPlaying} 
                        controls={true}
                        onEnded={handleVideoEnded}
                        config={PLAYER_CONFIG}
                        style={{ backgroundColor: '#000' }} 
                        
                        // [ERROR HANDLING] Manejo robusto de fallos de red o decodificación
                        onError={(e) => {
                            console.error("Error reproduciendo video:", e);
                            toast.error("Error al cargar el video", {
                                description: "Verifica tu conexión o el formato del archivo.",
                            });
                        }} 
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