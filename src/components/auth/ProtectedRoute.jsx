import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * 🛡️ ProtectedRoute V2 (Role Based)
 * @param {Array} allowedPlans - (Opcional) Lista de planes permitidos ej: ['premium', 'plus']
 */
const ProtectedRoute = ({ allowedPlans }) => {
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

  // 2. CHECK DE AUTENTICACIÓN (¿Existe el usuario?)
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. CHECK DE AUTORIZACIÓN (¿Tiene el plan correcto?)
  // Si la ruta exige planes específicos Y el plan del usuario no está en la lista...
  if (allowedPlans && !allowedPlans.includes(user.plan)) {
    // 🚨 ALERTA DE UPSELL: Lo mandamos a ver los precios porque no le alcanza el nivel
    return <Navigate to="/planes" replace />;
  }

  // 4. ACCESO CONCEDIDO
  return <Outlet />;
};

export default ProtectedRoute;