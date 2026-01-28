import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, Play, Download, MessageCircle, FileText, Menu, ChevronRight } from 'lucide-react';

// Contexts & Data
import { useShop } from '../context/ShopContext';
import { cursos } from '../data/cursos'; 
import { courseContentMock } from '../data/courseContentMock'; 
import { PlayerSidebar } from '../components/player/PlayerSidebar'; // Verifica que el nombre del archivo sea PlayerSidebar (sin la 'B' mayúscula en Bar si así lo guardaste)

// --- HELPER COMPONENT: RESOURCE PANEL CONTENT ---
// CORRECCIÓN: Definido FUERA del componente principal para evitar recreación en cada render.
// Recibe 'activeTab' como prop porque ya no tiene acceso al closure del padre.
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

const CoursePlayerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPurchased } = useShop();

  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false); // [NUEVO] Estado del Menú Móvil
  const [activeTab, setActiveTab] = useState('resources'); 

  // --- DATA ---
  const courseMetadata = useMemo(() => cursos.find(c => c.id === id), [id]);
  const courseContent = useMemo(() => courseContentMock[id] || courseContentMock['default'], [id]);

  // --- SECURITY & INIT ---
  useEffect(() => {
    const verifyAccess = async () => {
      setLoading(true);
      // await new Promise(r => setTimeout(r, 500)); // Delay opcional

      if (!courseMetadata) {
        toast.error("Curso no encontrado");
        navigate('/mis-cursos');
        return;
      }

      // Validación de compra
      if (!hasPurchased(id, 'curso')) {
        toast.error("Requiere acceso", { description: "Redirigiendo a opciones de compra..." });
        navigate(`/curso/${id}/venta`);
        return;
      }

      // Cargar primera lección
      if (courseContent?.modules?.[0]?.lessons?.length > 0) {
        setActiveLesson(courseContent.modules[0].lessons[0]);
      }
      
      setLoading(false);
    };

    verifyAccess();
  }, [id, hasPurchased, navigate, courseMetadata, courseContent]);

  const handleLessonChange = (lesson) => {
    setActiveLesson(lesson);
    // Auto-scroll al top en móvil cuando cambia lección
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex-1 bg-[#0B1121] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  // (La definición de ResourcesPanel fue removida de aquí)

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden">
      
      {/* 1. PLAYER HEADER (Barra de título interna) */}
      <div className="h-14 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f1629] flex items-center justify-between px-4 shrink-0">
         <div className="flex items-center gap-3 overflow-hidden">
            {/* [MÓVIL] TRIGGER DEL MENÚ LATERAL */}
            <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-emerald-500 active:bg-gray-100 dark:active:bg-gray-800 rounded-md transition-colors"
            >
                <Menu size={20} />
            </button>
            
            <div className="flex flex-col">
                <h1 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-md">
                    {activeLesson?.title || "Cargando..."}
                </h1>
                <div className="flex items-center gap-1 text-[10px] text-gray-500">
                    <span className="truncate max-w-[150px]">{courseMetadata?.title}</span>
                    <ChevronRight size={10} />
                    <span>Lección Actual</span>
                </div>
            </div>
         </div>

         {/* Botones de acción (Solo desktop para limpiar visual móvil) */}
         <div className="hidden sm:flex gap-2">
             <span className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded border border-emerald-500/20">
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
            isOpen={isSidebarOpen} // [Estado]
            onClose={() => setSidebarOpen(false)} // [Control]
        />

        {/* B. CENTER STAGE (Video + Mobile Tabs) */}
        <main className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-black overflow-y-auto">
            
            {/* VIDEO PLAYER CONTAINER */}
            {/* Usamos aspect-video para mantener proporción 16:9 siempre */}
            <div className="w-full bg-black sticky top-0 z-10 shadow-lg">
                <div className="aspect-video w-full max-h-[70vh] mx-auto bg-zinc-900 flex flex-col items-center justify-center text-gray-500 relative group cursor-pointer">
                    <Play className="w-12 h-12 sm:w-16 sm:h-16 text-white/80 group-hover:text-emerald-500 group-hover:scale-110 transition-all duration-300" />
                    <p className="text-xs mt-4 font-mono opacity-60">SIMULADOR DE VIDEO</p>
                </div>
            </div>

            {/* [MÓVIL/TABLET] TABS DE RECURSOS (Debajo del video) */}
            {/* Solo visible en pantallas < 2xl (donde la columna derecha desaparece) */}
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
                {/* CORRECCIÓN: Pasamos activeTab como prop */}
                <ResourcesPanel activeTab={activeTab} />
            </div>

        </main>

        {/* C. RIGHT COLUMN (Recursos Desktop) */}
        {/* Solo visible en pantallas gigantes (2xl) */}
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
                {/* CORRECCIÓN: Pasamos activeTab como prop */}
                <ResourcesPanel activeTab={activeTab} />
            </div>
        </aside>

      </div>
    </div>
  );
};

export default CoursePlayerPage;