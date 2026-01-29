// src/components/auth/ProtectedRoute.jsx
import { useLocation, Navigate, Outlet } from 'react-router-dom';
import { Loader2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

/**
 * ------------------------------------------------------------------
 * COMPONENTE: PROTECTED ROUTE (SECURITY GATEWAY V3)
 * ------------------------------------------------------------------
 * Arquitectura: HOC (Higher-Order Component) / Wrapper Híbrido.
 * Propósito: Actúa como middleware de seguridad en el cliente.
 * * Responsabilidades:
 * 1. Autenticación: ¿El usuario existe?
 * 2. Autorización (RBAC): ¿El usuario tiene el plan requerido?
 * 3. UX: Feedback visual durante la validación de sesión.
 * * @param {string[]} allowedPlans - (Opcional) Lista de planes permitidos ['pro', 'unlimited'].
 * @param {ReactNode} children - (Opcional) Componentes hijos si se usa como Wrapper directo.
 * @param {string} redirectPath - (Opcional) Ruta de fallback si falla la auth.
 */
const ProtectedRoute = ({ 
  allowedPlans = null, 
  children, 
  redirectPath = '/login' 
}) => {
  // Hook de autenticación (SSOT - Single Source of Truth)
  const { user, loading } = useAuth();
  const location = useLocation();

  // ----------------------------------------------------------------
  // 1. ESTADO DE CARGA (Loading State)
  // ----------------------------------------------------------------
  // Prevenimos "Flashes of Unauthorized Content" manteniendo el loader
  // hasta que la promesa de sesión se resuelva definitivamente.
  if (loading) {
    return (
      <div className="flex h-[100dvh] w-full flex-col items-center justify-center bg-slate-50 dark:bg-[#0B1121] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600 dark:text-emerald-400" />
        <span className="text-sm font-medium text-slate-500 animate-pulse tracking-wide">
          Verificando credenciales...
        </span>
      </div>
    );
  }

  // ----------------------------------------------------------------
  // 2. CHECK DE IDENTIDAD (Authentication)
  // ----------------------------------------------------------------
  // Si no hay usuario tras la carga, expulsamos inmediatamente.
  if (!user) {
    // Patrón "ReturnUrl": Guardamos la ubicación actual en el state
    // para redirigir al usuario de vuelta aquí tras loguearse.
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // ----------------------------------------------------------------
  // 3. CHECK DE ROLES/PLANES (Authorization / RBAC)
  // ----------------------------------------------------------------
  // Solo ejecutamos esta lógica si la ruta exige planes específicos.
  // Usamos Optional Chaining y Array methods para robustez.
  if (allowedPlans?.length > 0) {
    const hasValidPlan = allowedPlans.includes(user.plan);
    const isAdmin = user.role === 'admin'; // Admin Bypass (Superuser pattern)

    if (!hasValidPlan && !isAdmin) {
      // Si el usuario existe pero no paga lo suficiente, upsell táctico.
      // Redirigimos a la landing de precios.
      return <Navigate to="/planes" replace />;
    }
  }

  // ----------------------------------------------------------------
  // 4. ACCESO CONCEDIDO (Render Strategy)
  // ----------------------------------------------------------------
  // Soporte dual:
  // A. Como Wrapper: <ProtectedRoute><Dashboard /></ProtectedRoute>
  // B. Como Layout Route: <Route element={<ProtectedRoute />} > ... </Route>
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
