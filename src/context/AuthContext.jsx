import { createContext, useContext, useState, useEffect } from 'react';

// Creación del Contexto
// Esto genera un "espacio global" donde guardaremos la información del usuario
const AuthContext = createContext();

/**
 * HOOK PERSONALIZADO: useAuth
 * ---------------------------
 * Simplifica el acceso al contexto. En lugar de importar useContext y AuthContext
 * en cada componente, solo importamos useAuth().
 * * Validación de seguridad: Lanza un error si se intenta usar fuera del Provider.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de un AuthProvider');
  return context;
};

/**
 * COMPONENTE PROVIDER
 * -------------------
 * Envuelve toda la aplicación. Maneja el estado de autenticación (Login/Logout).
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  
  // Loading es CRÍTICO: Evita que la app muestre la pantalla de Login 
  // por un microsegundo si el usuario ya estaba logueado.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Inicialización segura: Verificamos si hay sesión guardada
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem('monitorEco_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Error al recuperar la sesión:", error);
        // Si hay error (ej: JSON corrupto), limpiamos para evitar bloqueos
        localStorage.removeItem('monitorEco_user');
      } finally {
        // Pase lo que pase, terminamos de cargar
        setLoading(false);
      }
    };

    initializeAuth();
  }, []); // Array vacío = Se ejecuta solo una vez al montar la app

  /**
   * FUNCIÓN LOGIN
   * Recibe los datos del usuario y los guarda en Estado + LocalStorage
   */
  const login = (userData) => {
    // Simulamos una mejora visual agregando un avatar automático
    const userToSave = {
      ...userData,
      avatar: `https://ui-avatars.com/api/?name=${userData.name}&background=10b981&color=fff`
    };
    
    setUser(userToSave);
    localStorage.setItem('monitorEco_user', JSON.stringify(userToSave));
  };

  /**
   * FUNCIÓN LOGOUT
   * Limpia todo rastro del usuario
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem('monitorEco_user');
  };

  // Objeto con los valores que exportamos al resto de la app
  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Solo renderizamos la app cuando terminamos de verificar la sesión */}
      {!loading && children}
    </AuthContext.Provider>
  );
};