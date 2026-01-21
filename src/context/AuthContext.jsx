import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

// 1. CREACIÓN DEL CONTEXTO
// Creamos el "contenedor" de datos que será accesible desde cualquier parte de la app.
const AuthContext = createContext();

/**
 * 2. HOOK PERSONALIZADO: useAuth
 * Para no tener que importar 'useContext' y 'AuthContext' en cada archivo,
 * creamos este acceso directo. Incluye una validación para asegurar que el
 * componente que lo usa esté envuelto en el Provider.
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de un AuthProvider');
  return context;
};

/**
 * 3. COMPONENTE PROVEEDOR (AuthProvider)
 * Este componente envuelve a toda tu aplicación (<App />).
 */
export const AuthProvider = ({ children }) => {
  // Estado para los datos del usuario (nombre, email, plan, etc.)
  const [user, setUser] = useState(null);
  // Estado para evitar que la app "parpadee" mientras verifica si había una sesión iniciada
  const [loading, setLoading] = useState(true);

  /**
   * 4. VERIFICACIÓN DE SESIÓN (checkAuthStatus)
   * Usamos 'useCallback' para que la función sea estable y no se recree innecesariamente.
   * Aquí buscamos si hay un usuario guardado en el navegador al abrir la página.
   */
  const checkAuthStatus = useCallback(async () => {
    try {
      const storedUser = localStorage.getItem('monitorEco_user');
      if (storedUser) {
        // Transformamos el texto del localStorage a un objeto JS
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Error de autenticación:", error);
      localStorage.removeItem('monitorEco_user');
    } finally {
      // Importante: quitamos el estado de carga siempre, haya usuario o no
      setLoading(false);
    }
  }, []);

  // Ejecuta la verificación una sola vez cuando la aplicación se monta
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  /**
   * 5. FUNCIÓN LOGIN
   * Recibe los datos que vienen de tu backend/formulario.
   */
  const login = useCallback((userData) => {
    const userToSave = {
      ...userData,
      // Generamos un avatar por defecto basado en su nombre si no tiene uno
      avatar: userData.avatar || `https://ui-avatars.com/api/?name=${userData.name}&background=10b981&color=fff`,
      lastLogin: new Date().toISOString() // Registro de cuándo entró
    };
    
    setUser(userToSave);
    // Persistencia: para que si refresca la página, no se cierre la sesión
    localStorage.setItem('monitorEco_user', JSON.stringify(userToSave));
  }, []);

  /**
   * 6. FUNCIÓN LOGOUT
   * Limpia el estado global y el almacenamiento local.
   */
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('monitorEco_user');
  }, []);

  /**
   * 7. OPTIMIZACIÓN CON useMemo (Vital para eficiencia)
   * React re-renderiza todo lo que consume este contexto cada vez que el valor cambia.
   * 'useMemo' asegura que el objeto solo cambie si 'user' o 'loading' cambian de verdad.
   */
  const value = useMemo(() => ({
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user, // Helper booleano: true si hay usuario
    isAdmin: user?.role === 'admin', // Control de acceso para MonitorEco
    isPremium: user?.plan === 'premium' // Control de monetización
  }), [user, loading, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {/* Si estamos cargando, no mostramos la app para evitar que se vea 
         contenido privado por un milisegundo.
      */}
      {!loading && children}
    </AuthContext.Provider>
  );
};