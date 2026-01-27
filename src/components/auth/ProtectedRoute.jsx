// src/components/auth/ProtectedRoute.jsx
import { Navigate, useLocation, Outlet } from 'react-router-dom';
// 👇 CAMBIO CRÍTICO: Importamos desde la nueva ubicación del hook
import { useAuth } from '../../hooks/useAuth'; 
import { Loader2 } from 'lucide-react';

/**
 * 🛡️ ProtectedRoute V2.1 (Hybrid: Wrapper + Layout)
 * Soporta tanto envolver componentes individuales como grupos de rutas.
 */
const ProtectedRoute = ({ allowedPlans, children }) => {
  const { user, loading } = useAuth(); 
  const location = useLocation();

  // 1. ESTADO DE CARGA
  // Vital para que no te expulse mientras el 'userStatus.js' simula los 800ms
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-[#0B1121]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-600 dark:text-emerald-400" />
          <p className="text-sm text-slate-500 animate-pulse">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // 2. CHECK DE AUTENTICACIÓN
  if (!user) {
    // Redirige al Login y recuerda de dónde venías
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. CHECK DE AUTORIZACIÓN (Planes)
  // Tu lógica es perfecta aquí. Mantenemos 'allowedPlans'.
  if (allowedPlans && !allowedPlans.includes(user.plan)) {
    // Si es usuario Free y quiere entrar a una ruta Pro -> Lo mandamos a comprar
    return <Navigate to="/planes" replace />;
  }

  // 4. ACCESO CONCEDIDO (Lógica Híbrida)
  return children ? children : <Outlet />;
};

export default ProtectedRoute;