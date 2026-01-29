import { useEffect, useRef } from 'react';
import { useParams, Navigate, Outlet, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, Lock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

/**
 * ------------------------------------------------------------------
 * COMPONENTE: GUARDED COURSE ROUTE (LEVEL 2 SECURITY)
 * ------------------------------------------------------------------
 * Middleware específico para rutas de contenido ("La Academia").
 * Verifica la propiedad del activo digital (Ownership) antes de renderizar.
 * * Flow:
 * 1. Extrae el ID del curso de la URL.
 * 2. Consulta al AuthProvider si el usuario tiene derechos (Pack, Individual o Plan).
 * 3. Si NO tiene derechos -> Redirige a la Landing de Venta.
 */
const GuardedCourseRoute = () => {
  const { id } = useParams(); // Capturamos :id de la URL (ej: 'course_1')
  // CORRECCIÓN: Eliminado 'user' que no se usaba
  const { loading, hasAccessToCourse } = useAuth();
  const location = useLocation();
  
  // Ref para evitar doble toast en React.StrictMode
  const toastShownRef = useRef(false);

  // 2. CHECK DE SEGURIDAD
  // Usamos el selector inteligente que creamos en AuthProvider
  const hasAccess = hasAccessToCourse(id);

  // CORRECCIÓN: Movemos el efecto secundario (Toast) dentro de useEffect
  useEffect(() => {
    if (!loading && !hasAccess && !toastShownRef.current) {
      toast.error('Contenido Bloqueado', {
        description: 'Necesitas adquirir este curso para acceder.',
        icon: <Lock className="w-4 h-4" />
      });
      toastShownRef.current = true;
    }
  }, [loading, hasAccess]);

  // 1. LOADING STATE (Evitar rebotes)
  if (loading) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-[#0B1121]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!hasAccess) {
    // REDIRECCIÓN ESTRATÉGICA:
    // Lo enviamos a la página de venta del curso específico para intentar la conversión.
    // Guardamos 'state' por si queremos volver tras la compra.
    return <Navigate to={`/curso/${id}/venta`} replace state={{ from: location }} />;
  }

  // 3. ACCESO CONCEDIDO
  return <Outlet />;
};

export default GuardedCourseRoute;