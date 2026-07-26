import { useEffect, useState, useCallback } from 'react';
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
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '../hooks/useAuth';
import { courseService } from '../services/learning/course.service';
// ✅ IMPORTACIÓN DEL SERVICIO DE PROGRESO OPTIMIZADO
import { progressService } from '../services/learning/progress.service';

/**
 * -----------------------------------------------------------------------------
 * HOOK: USE STUDENT LIBRARY (Logic Extraction)
 * -----------------------------------------------------------------------------
 * Responsabilidad: Cruzar los permisos del usuario (IDs) con el catálogo (Data)
 * e hidratar con el progreso real (User Data) en una sola pasada.
 */
const useStudentLibrary = (user) => {
  const [library, setLibrary] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // CORRECCIÓN LÓGICA: Determinar acceso global
    const hasGlobalAccess = user?.plan === 'unlimited' || user?.role === 'admin';
    const hasPurchases = user?.purchasedCourses?.length > 0;

    // Si no hay usuario, o no tiene acceso global Y no tiene compras, terminamos.
    if (!user || (!hasGlobalAccess && !hasPurchases)) {
      setLibrary([]);
      setIsLoading(false);
      return;
    }

    let mounted = true;

    const fetchLibrary = async () => {
      try {
        // 🚀 PERFORMANCE FIX: PATRÓN "BATCHING"
        // Traemos TODO lo necesario en paralelo. 
        // Request 1: Catálogo (pesado, cacheable)
        // Request 2: Historial de lecciones completadas (ligero, user-specific)
        const [allCourses, allCompletedIds] = await Promise.all([
          courseService.getAllCourses(),
          progressService.getAllCompletedLessons()
        ]);
        
        // 1. CORRECCIÓN DE FILTRADO:
        // Si es 'unlimited', tiene acceso a TODO el catálogo.
        // Si no, filtramos por IDs comprados.
        const ownedCourses = hasGlobalAccess 
          ? allCourses 
          : allCourses.filter(course => user.purchasedCourses?.includes(course.id));

        // 2. HIDRATACIÓN "IN-MEMORY" (CPU vs NETWORK)
        // Calculamos el % de cada curso cruzando arrays en memoria.
        // Esto evita hacer N llamadas a la API dentro de un loop.
        const hydratedLibrary = ownedCourses.map(course => ({
          ...course,
          // Calculamos el % real (0-100) usando la lógica del servicio
          progress: progressService.calculateCourseProgress(course, allCompletedIds)
        }));

        if (mounted) setLibrary(hydratedLibrary);
      } catch (error) {
        console.error("Error hidratando librería:", error);
        toast.error("Error cargando tus cursos");
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchLibrary();

    return () => { mounted = false; };
  }, [user]); 

  return { library, isLoading };
};

/**
 * -----------------------------------------------------------------------------
 * UTILITIES
 * -----------------------------------------------------------------------------
 */
const normalizeCourseData = (course) => ({
  id: course.id,
  title: course.title || course.titulo || "Curso Sin Título",
  image: course.image || null,
  category: course.category || "Finanzas",
  duration: course.duracion || "A tu ritmo",
  modulesCount: course.lessonsCount ? Math.ceil(course.lessonsCount / 4) : 4,
  // ✅ Pasamos el progreso real calculado en el hook
  progress: course.progress || 0 
});

/**
 * -----------------------------------------------------------------------------
 * MAIN COMPONENT: MyCoursesPage
 * -----------------------------------------------------------------------------
 */
export default function MyCoursesPage() {
  const { user } = useAuth();
  
  // Hook inteligente que ya devuelve la data con % real
  const { library, isLoading } = useStudentLibrary(user);
  
  // State: UX Perceived Performance
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = requestAnimationFrame(() => setIsReady(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  const handleDownloadResources = useCallback((courseTitle) => {
    toast.promise(new Promise((resolve) => setTimeout(resolve, 2000)), {
      loading: 'Preparando material...',
      success: `Recursos de "${courseTitle}" descargados`,
      error: 'Error al descargar',
    });
  }, []);

  // LOADING SKELETON
  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

  // EMPTY STATE
  if (!library || library.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 transition-opacity duration-700 ease-out ${isReady ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* --- HEADER SECTION --- */}
      <HeaderSection user={user} coursesCount={library.length} />

      {/* --- CONTENT GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
        
        {library.map((rawCourse, index) => (
          <CourseCard 
            key={rawCourse.id} 
            course={normalizeCourseData(rawCourse)} 
            index={index}
            onDownload={handleDownloadResources}
          />
        ))}
        
        {/* Upsell Card */}
        <CertificationPromoCard />

      </div>
    </div>
  );
}

/**
 * -----------------------------------------------------------------------------
 * SUB-COMPONENTS
 * -----------------------------------------------------------------------------
 */

const HeaderSection = ({ user, coursesCount }) => (
  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-slate-200 dark:border-slate-800 pb-8">
    <div>
      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider text-xs mb-3">
        <LayoutDashboard size={14} /> 
        <span>Panel del Estudiante</span>
      </div>
      <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">
        Hola, {user?.name?.split(' ')[0] || 'Trader'}
      </h1>
      <p className="text-slate-500 dark:text-slate-400 text-lg">
        Gestiona tu progreso en <strong className="text-slate-900 dark:text-white font-bold">{coursesCount} {coursesCount === 1 ? 'programa' : 'programas'}</strong>.
      </p>
    </div>
    
    <div className="flex gap-4">
      <StatsCard label="Nivel" value={user?.plan === 'pro' ? 'PRO' : 'Starter'} icon={<Award size={16} />} />
      <StatsCard label="Certificaciones" value="0" icon={<CheckCircle2 size={16} />} />
    </div>
  </div>
);

const CourseCard = ({ course, index, onDownload }) => {
  // ✅ Usamos el dato real inyectado
  const { progress } = course; 
  const animationDelay = `${index * 100}ms`;

  return (
    <article 
      className="group flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-black/50 transition-all duration-300 hover:-translate-y-1 relative animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards"
      style={{ animationDelay }} 
    >
      {/* -- Cover Image -- */}
      <div className="relative h-52 overflow-hidden bg-slate-100 dark:bg-slate-800">
        {course.image ? (
          <img 
            src={course.image} 
            alt={course.title} 
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50/50 dark:from-slate-900 dark:to-emerald-900/20">
            <BookOpen size={48} className="text-emerald-200 dark:text-emerald-800 mb-2" />
            <span className="text-xs font-bold text-emerald-800/20 dark:text-emerald-200/20 uppercase tracking-widest">MonitorEco</span>
          </div>
        )}
        
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1.5 rounded-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-wider shadow-sm border border-slate-200/50">
            {course.category}
          </span>
        </div>

        <Link 
          to={`/curso/${course.id}`} 
          className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px] cursor-pointer focus:outline-none focus:opacity-100"
        >
          <div className="bg-white text-slate-900 rounded-full p-4 shadow-xl transform scale-75 group-hover:scale-100 transition-all duration-300 hover:text-emerald-600">
            <PlayCircle size={32} fill="currentColor" />
          </div>
        </Link>
      </div>

      {/* -- Card Body -- */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 mb-3">
          {course.duration && (
            <div className="flex items-center gap-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
              <Clock size={12} /> {course.duration}
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
            <BookOpen size={12} /> {course.modulesCount} Módulos
          </div>
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
          {course.title}
        </h3>
        
        {/* Progress Bar (Ahora Real) */}
        <div className="mt-4 mb-6">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            <span>Tu Avance</span>
            <span className={progress > 0 ? "text-emerald-600 dark:text-emerald-400" : ""}>{progress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-100 dark:border-slate-700/50">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out relative overflow-hidden" 
              style={{ width: `${progress}%` }}
            >
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-auto grid grid-cols-[1fr,auto] gap-3">
          <Link 
            to={`/curso/${course.id}`}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold uppercase tracking-wide hover:bg-emerald-600 dark:hover:bg-emerald-400 hover:text-white transition-all shadow-lg shadow-slate-900/10 active:scale-95"
          >
            <PlayCircle size={16} /> 
            {progress > 0 ? 'Reanudar' : 'Comenzar'}
          </Link>
          
          <button 
            onClick={() => onDownload(course.title)}
            className="flex items-center justify-center p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all active:scale-95"
          >
            <Download size={18} />
          </button>
        </div>
      </div>
    </article>
  );
};

const CertificationPromoCard = () => (
  <div className="flex flex-col justify-center items-center p-8 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-center hover:bg-white dark:hover:bg-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all cursor-pointer group h-full min-h-[400px]">
    <div className="p-5 bg-white dark:bg-slate-900 rounded-full shadow-sm mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 border border-slate-100 dark:border-slate-700">
      <Award size={40} className="text-emerald-500" strokeWidth={1.5} />
    </div>
    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Sigue Aprendiendo</h3>
    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-[200px] leading-relaxed">
      Explora nuevos cursos para potenciar tu portafolio de inversión.
    </p>
    <Link to="/academia" className="text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider flex items-center gap-2 group-hover:gap-3 transition-all">
      Ver Catálogo <ArrowRight size={14} />
    </Link>
  </div>
);

const EmptyState = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 animate-in fade-in zoom-in duration-500">
    <div className="relative group mb-8">
      <div className="absolute inset-0 bg-emerald-500/30 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      <div className="relative bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-black/50 ring-1 ring-slate-900/5">
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

const StatsCard = ({ label, value, icon }) => (
  <div className="flex flex-col justify-center items-center px-5 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-md min-w-[100px]">
    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-1">
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </div>
    <span className="block text-xl font-black text-slate-900 dark:text-white uppercase">{value}</span>
  </div>
);