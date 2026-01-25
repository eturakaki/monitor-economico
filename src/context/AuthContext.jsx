import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

// --- CONFIGURACIÓN DE CONSTANTES (Best Practice) ---
// Centralizamos las keys para evitar errores de dedo en el futuro.
const STORAGE_KEYS = {
  USER: 'monitorEco_user',
  TOKEN: 'monitorEco_token' // Preparado para cuando conectes Backend real
};

// Creación del Contexto
const AuthContext = createContext();

// --- HOOK PERSONALIZADO ---
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('FATAL: useAuth debe usarse dentro de un AuthProvider');
  return context;
};

// --- PROVIDER ---
export const AuthProvider = ({ children }) => {
  // Estado inicial perezoso (Lazy Initialization) para mejor performance
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error("[Auth] Error parsing storage:", error);
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // EFECTO DE MONTAJE: Simula validación de sesión
  useEffect(() => {
    // Aquí iría una llamada a API real: authService.validateToken()
    setLoading(false); 
  }, []);

  // --- ACTIONS (Lógica de Negocio) ---

  /**
   * Actualiza datos parciales del perfil (Bio, Nombre, Avatar)
   * NO afecta el plan ni el rol.
   */
  const updateUserProfile = useCallback((newData) => {
    if (!user) return;

    setUser((currentUser) => {
      const updatedUser = { ...currentUser, ...newData };
      // Persistencia Síncrona
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      return updatedUser;
    });
    console.log("[Auth] Perfil actualizado con éxito.");
  }, [user]);

  /**
   * Login: Crea la sesión y persiste datos.
   */
  const login = useCallback((userData) => {
    const userToSave = {
      ...userData,
      plan: userData.plan || 'starter', 
      avatar: userData.avatar || `https://ui-avatars.com/api/?name=${userData.name}&background=10b981&color=fff`,
      lastLogin: new Date().toISOString()
    };
    
    setUser(userToSave);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userToSave));
  }, []);

  /**
   * Logout: Limpieza total.
   */
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
    // window.location.href = '/login'; // Opcional: Forzar recarga si es necesario limpiar estados de memoria
  }, []);

  /**
   * Upgrade/Downgrade de Plan (Sin cerrar sesión)
   */
  const updateUserPlan = useCallback((newPlanId) => {
    if (!user) return;

    setUser((currentUser) => {
      const updatedUser = { ...currentUser, plan: newPlanId };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      return updatedUser;
    });
    
    console.log(`[Auth] Plan actualizado a: ${newPlanId}`);
  }, [user]);

  // --- MEMOIZATION (Performance Critical) ---
  // Construimos el objeto value solo cuando los datos cambian realmente.
  const value = useMemo(() => ({
    // Estado
    user,
    loading,
    
    // Actions
    login,
    logout,
    updateUserPlan,
    updateUserProfile, // ✅ AHORA SÍ ESTÁ INCLUIDO

    // Computed Properties (Getters)
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isPremium: ['pro', 'unlimited'].includes(user?.plan), // Tu lógica VIP
    isUnlimited: user?.plan === 'unlimited'
  }), [user, loading, login, logout, updateUserPlan, updateUserProfile]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};