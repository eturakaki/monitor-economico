import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { UserStatusService } from '../services/userStatus';
import { AuthContext } from './AuthContext.jsx'; // Asegura que este archivo exporte createContext

/**
 * ------------------------------------------------------------------
 * AUTH PROVIDER - SECURITY CORE (SSOT)
 * ------------------------------------------------------------------
 * Gestiona la identidad, los permisos (ACL) y el estado de sincronización
 * del usuario. Actúa como la única fuente de verdad para el acceso.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- 1. BOOTSTRAP DE SESIÓN ---
  useEffect(() => {
    let mounted = true;

    const initSession = async () => {
      try {
        // Fetch silencioso para validar cookie/token simulado
        const storedUser = await UserStatusService.fetchUser();
        if (mounted && storedUser) {
          setUser(storedUser);
        }
      } catch (err) {
        console.warn('[Auth] Session invalid or expired:', err);
        // No hacemos toast aquí para no molestar al usuario en la carga inicial
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initSession();
    return () => { mounted = false; };
  }, []);

  // --- 2. ACCIONES DE IDENTIDAD (LOGIN/LOGOUT) ---
  
  const login = useCallback(async (credentials) => {
    // Patrón: Promise Toast para feedback inmediato UX
    return toast.promise(
      UserStatusService.login(credentials).then((newUser) => {
        setUser(newUser);
        return newUser;
      }),
      {
        loading: 'Verificando credenciales...',
        success: (data) => `Bienvenido a bordo, ${data.name}`,
        error: (err) => `Acceso denegado: ${err.message}`
      }
    );
  }, []);

  const logout = useCallback(async () => {
    try {
      await UserStatusService.logout();
      setUser(null);
      toast.info('Sesión cerrada correctamente');
    } catch (error) {
      console.error('Logout error', error);
      setUser(null); // Force logout en frontend aunque falle backend
    }
  }, []);

  // --- 3. ACCIONES DE NEGOCIO (WRITE OPERATIONS) ---

  /**
   * Fuerza una re-sincronización con el "Backend".
   * Útil para llamar desde ShopContext después de una compra exitosa.
   */
  const syncSession = useCallback(async () => {
    const freshUser = await UserStatusService.fetchUser();
    if (freshUser) setUser(freshUser);
    return freshUser;
  }, []);

  const updateUserPlan = useCallback(async (newPlan) => {
    if (!user) return;
    return toast.promise(
      UserStatusService.updatePlan(newPlan).then(updatedUser => {
        setUser(updatedUser);
        return updatedUser;
      }),
      { 
        loading: 'Procesando upgrade...', 
        success: '¡Membresía actualizada con éxito!', 
        error: 'Error en la transacción' 
      }
    );
  }, [user]);

  const updateUserProfile = useCallback(async () => {
    if (!user) return;
    // Nota: Asumimos que UserStatusService tiene un método updateProfile (si no, habría que crearlo o usar fetchUser tras update)
    // Por ahora simulamos la actualización optimista o re-fetch
    toast.success('Perfil actualizado (Simulado)');
    // setUser({ ...user, ...data }); // Optimistic update
  }, [user]);

  /**
   * [NUEVO] Lógica de Progreso de Aprendizaje.
   /**
   * [CORREGIDO] Lógica de Progreso de Aprendizaje.
   * Implementa Optimistic UI (Zero-Lag) y actualización defensiva.
   */
  const markLessonAsCompleted = useCallback(async (courseId, lessonId) => {
    if (!user) return;

    // 1. Check de duplicados: Si ya la tiene, abortamos para no ensuciar el estado.
    if (user.completedLessons?.includes(lessonId)) return;

    // 2. OPTIMISTIC UPDATE: Actualizamos la memoria INMEDIATAMENTE.
    // Usamos el patrón de "Functional State Update" para garantizar que no perdemos
    // datos si el usuario hace click muy rápido (concurrencia de React).
    setUser((prevUser) => {
        // Protección extra por si el usuario se deslogueó en el interin
        if (!prevUser) return null; 

        return {
            ...prevUser, // Mantenemos nombre, plan, email, etc. (Defensive Merge)
            completedLessons: [...(prevUser.completedLessons || []), lessonId]
        };
    });

    try {
      // 3. BACKGROUND SYNC: Persistencia asíncrona.
      // Ya no bloqueamos la UI esperando esto. El usuario ya vio su check verde.
      await UserStatusService.updateLessonProgress(courseId, lessonId);
      
      // Nota: No hacemos setUser(response) aquí para evitar sobrescribir
      // la versión optimista con datos viejos o parciales del backend.
      
    } catch (error) {
      console.error('[Auth] Sync error:', error);
      // UX Decision: No revertimos el estado (Rollback) para no frustrar al usuario.
      // Le avisamos que hubo un problema de red, pero mantenemos su "visto" localmente.
      toast.warning('Progreso guardado localmente (Sin conexión)');
    }
  }, [user]);

  // --- 4. SELECTORES DE ACCESO (READ OPERATIONS / ACL) ---
  
  // Memoizamos las reglas de negocio para evitar recálculos en renders
  const accessRules = useMemo(() => ({
    
    /**
     * Verifica si el usuario tiene derecho a entrar a un curso.
     * Regla: Es Admin O tiene plan Unlimited O compró el curso.
     */
    hasAccessToCourse: (courseId) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      if (user.plan === 'unlimited') return true;
      return user.purchasedCourses?.includes(courseId) ?? false;
    },

    /**
     * Verifica estado de una lección específica.
     */
    isLessonCompleted: (lessonId) => {
      return user?.completedLessons?.includes(lessonId) ?? false;
    },

    /**
     * Obtiene el ID de la última lección vista para un curso (Resume).
     */
    getLastViewedLesson: (courseId) => {
      return user?.lastActivity?.[courseId] || null;
    }

  }), [user]);

  // --- 5. CONTEXT COMPOSITION ---
  
  const value = useMemo(() => ({
    // State
    user,
    loading,
    
    // Auth Actions
    login,
    logout,
    syncSession,
    
    // Write Actions
    updateUserPlan,
    updateUserProfile,
    markLessonAsCompleted,
    
    // Read Selectors (ACLs)
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    // isPremium es relativo ahora, preferimos checkAccess, pero mantenemos compatibilidad:
    isPremium: user ? ['pro', 'unlimited'].includes(user.plan) : false,
    
    // Expose Rules
    ...accessRules

  }), [user, loading, login, logout, syncSession, updateUserPlan, updateUserProfile, markLessonAsCompleted, accessRules]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
