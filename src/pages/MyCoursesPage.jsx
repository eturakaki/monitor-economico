import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlayCircle, 
  BookOpen, 
  Clock, 
  Award, 
  Download, 
  ArrowRight,
  GraduationCap,
  LayoutDashboard,
  MoreVertical,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner'; // Feedback visual indispensable

import { useShop } from '../context/ShopContext';
import { useAuth } from '../hooks/useAuth';

/**
 * MyCoursesPage (The Learning Hub)
 * ----------------------------------------------------
 * Arquitectura: Dashboard de consumo de contenido.
 * Nivel: Fintech/EdTech Production Grade.
 * * Mejoras aplicadas:
 * 1. Defensive Rendering: Normalización de campos (title vs titulo).
 * 2. Simulated Progress: Visualización de datos mock para UX "viva".
 * 3. Interactive Feedback: Toasts para acciones secundarias.
 * 4. Stripe-ui Inspiration: Sombras difusas y bordes sutiles.
 */

export default function MyCoursesPage() {
  const { myCourses } = useShop(); 
  const { user } = useAuth();
  
  // Estado local para simular carga inicial progresiva (UX Perceived Performance)
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    // Pequeño delay para suavizar la entrada de elementos
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // --- HANDLERS ---

  const handleDownloadResources = (courseTitle) => {
    // Simulación de descarga con feedback inmediato
    toast.promise(new Promise((resolve) => setTimeout(resolve, 2000)), {
      loading: 'Preparando material...',
      success: `Recursos de "${courseTitle}" descargados`,
      error: 'Error al descargar',
    });
  };

  // --- EMPTY STATE (Si no hay compras) ---
  // Mantenemos la estructura original pero con clases refinadas
  if (myCourses.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 animate-in fade-in zoom-in duration-500">
        <div className="relative group mb-8">
          <div className="absolute inset-0 bg-emerald-500/30 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <div className="relative bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-black/50 ring-1 ring-slate-900/5">
             <GraduationCap size={48} className="text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
          </div>
        </div>
        
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight text-center">
          Tu Aula Virtual está esperando
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md text-center text-lg leading-relaxed">
          Aún no tienes cursos activos. Invierte en tu futuro financiero hoy mismo.
        </p>
        
        <Link 
          to="/academia"
          className="group flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 dark:bg-white hover:bg-emerald-600 dark:hover:bg-emerald-400 text-white dark:text-slate-900 font-bold rounded-2xl transition-all duration-300 shadow-xl shadow-slate-900/20 hover:shadow-emerald-500/30 hover:-translate-y-1"
        >
          <span>Explorar Catálogo</span>
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    );
  }

  // --- MAIN DASHBOARD ---
  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 transition-opacity duration-500 ${isReady ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* HEADER: Personalización y Contexto */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div>
           <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider text-xs mb-3">
              <LayoutDashboard size={14} /> 
              <span>Panel del Estudiante</span>
           </div>
           <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">
             Hola, {user?.name?.split(' ')[0] || 'Inversor'}
           </h1>
           <p className="text-slate-500 dark:text-slate-400 text-lg">
             Gestiona tu progreso en <strong className="text-slate-900 dark:text-white font-bold">{myCourses.length} {myCourses.length === 1 ? 'programa' : 'programas'}</strong>.
           </p>
        </div>
        
        {/* Stats Rápidos: Visualmente más integrados */}
        <div className="flex gap-4">
            <StatsCard label="Progreso Global" value="0%" icon={<CheckCircle2 size={16} />} />
            <StatsCard label="Certificaciones" value="0" icon={<Award size={16} />} />
        </div>
      </div>

      {/* GRID DE CURSOS: Layout Responsivo Mejorado */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
        
        {myCourses.map((course, index) => {
          // Normalización de datos para evitar errores si la API es inconsistente
          const title = course.title || course.titulo || "Curso Sin Título";
          const courseId = course.id;
          // Simulación de progreso aleatorio para demo (Esto vendría del backend en el futuro)
          const simulatedProgress = ((index + 3) * 7) % 45 + 5;
          
          return (
            <article 
              key={courseId} 
              className="group flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-black/50 transition-all duration-300 hover:-translate-y-1 relative"
              style={{ animationDelay: `${index * 100}ms` }} // Staggered animation
            >
              {/* COVER IMAGE AREA */}
              <div className="relative h-52 overflow-hidden bg-slate-100 dark:bg-slate-800">
                  {course.image ? (
                      <img 
                        src={course.image} 
                        alt={title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      />
                  ) : (
                      // Fallback elegante si no hay imagen
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50/50 dark:from-slate-900 dark:to-emerald-900/20">
                          <BookOpen size={48} className="text-emerald-200 dark:text-emerald-800 mb-2" />
                          <span className="text-xs font-bold text-emerald-800/20 dark:text-emerald-200/20 uppercase tracking-widest">MonitorEco</span>
                      </div>
                  )}
                  
                  {/* Badge Tipo */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1.5 rounded-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-wider shadow-sm border border-slate-200/50">
                        {course.category || "Finanzas"}
                    </span>
                  </div>

                  {/* Play Overlay Button */}
                  <Link to={`/curso/${courseId}`} className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px] cursor-pointer">
                      <div className="bg-white text-slate-900 rounded-full p-4 shadow-xl transform scale-75 group-hover:scale-100 transition-all duration-300 hover:text-emerald-600">
                          <PlayCircle size={32} fill="currentColor" />
                      </div>
                  </Link>
              </div>

              {/* CARD BODY */}
              <div className="p-6 flex-1 flex flex-col">
                  {/* Meta Info */}
                  <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 mb-3">
                      {course.duracion && (
                          <div className="flex items-center gap-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                              <Clock size={12} /> {course.duracion}
                          </div>
                      )}
                      <div className="flex items-center gap-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                          <BookOpen size={12} /> {course.modulesCount || 4} Módulos
                      </div>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                      {title}
                  </h3>
                  
                  {/* Progress Bar System */}
                  <div className="mt-4 mb-6">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                          <span>Tu Avance</span>
                          <span className={simulatedProgress > 0 ? "text-emerald-600 dark:text-emerald-400" : ""}>{simulatedProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-100 dark:border-slate-700/50">
                          <div 
                            className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out relative overflow-hidden" 
                            style={{ width: `${simulatedProgress}%` }}
                          >
                             {/* Shimmer effect on progress bar */}
                             <div className="absolute inset-0 bg-white/30 w-full -translate-x-full animate-[shimmer_2s_infinite]"></div>
                          </div>
                      </div>
                  </div>

                  {/* Actions Area */}
                  <div className="mt-auto grid grid-cols-[1fr,auto] gap-3">
                      <Link 
                        to={`/curso/${courseId}`}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold uppercase tracking-wide hover:bg-emerald-600 dark:hover:bg-emerald-400 hover:text-white transition-all shadow-lg shadow-slate-900/10 active:scale-95"
                      >
                          <PlayCircle size={16} /> 
                          {simulatedProgress > 0 ? 'Reanudar' : 'Comenzar'}
                      </Link>
                      
                      <button 
                        onClick={() => handleDownloadResources(title)}
                        className="flex items-center justify-center p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all active:scale-95 tooltip-trigger"
                        aria-label="Descargar recursos"
                      >
                          <Download size={18} />
                      </button>
                  </div>
              </div>
            </article>
          );
        })}
        
        {/* CARD PROMO: CERTIFICATION UPSELL (Diseño refinado) */}
        <div className="flex flex-col justify-center items-center p-8 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-center hover:bg-white dark:hover:bg-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all cursor-pointer group h-full min-h-[400px]">
            <div className="p-5 bg-white dark:bg-slate-900 rounded-full shadow-sm mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 border border-slate-100 dark:border-slate-700">
                <Award size={40} className="text-emerald-500" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Obtener Certificación</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-[200px] leading-relaxed">
                Completa tus cursos al 100% y rinde el examen final para validar tus conocimientos.
            </p>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider flex items-center gap-2 group-hover:gap-3 transition-all">
                Ver Requisitos <ArrowRight size={14} />
            </span>
        </div>

      </div>
    </div>
  );
}

// --- SUBCOMPONENTES (Para mantener el código limpio) ---

function StatsCard({ label, value, icon }) {
  return (
    <div className="flex flex-col justify-center items-start px-5 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm min-w-[120px]">
      <div className="flex items-center gap-2 text-slate-400 mb-1">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <span className="block text-2xl font-black text-slate-900 dark:text-white tabular-nums">{value}</span>
    </div>
  );
}