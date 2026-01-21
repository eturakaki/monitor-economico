import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * 🛡️ ProtectedRoute V2.1 (Hybrid: Wrapper + Layout)
 * Soporta tanto envolver componentes individuales como grupos de rutas.
 */
const ProtectedRoute = ({ allowedPlans, children }) => { // <--- AGREGAMOS 'children' AQUÍ
  const { user, loading } = useAuth(); 
  const location = useLocation();

  // 1. ESTADO DE CARGA
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-[#0B1121]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-600 dark:text-emerald-400" />
        </div>
      </div>
    );
  }

  // 2. CHECK DE AUTENTICACIÓN
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. CHECK DE AUTORIZACIÓN (Planes)
  if (allowedPlans && !allowedPlans.includes(user.plan)) {
    return <Navigate to="/planes" replace />;
  }

  // 4. ACCESO CONCEDIDO (Lógica Híbrida)
  // Si se usó como wrapper (<ProtectedRoute><Dash/></ProtectedRoute>), renderiza 'children'.
  // Si se usó como Layout (<Route element={<ProtectedRoute />}>...), renderiza 'Outlet'.
  return children ? children : <Outlet />;
};

export default ProtectedRoute;