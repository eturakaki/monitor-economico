import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { UserStatusService } from '../services/userStatus';
import { AuthContext } from './AuthContext.jsx';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Inicialización de Sesión
  useEffect(() => {
    const initSession = async () => {
      try {
        const storedUser = await UserStatusService.fetchUser();
        if (storedUser) setUser(storedUser);
      } catch (err) {
        console.error('Session restore failed', err);
      } finally {
        setLoading(false);
      }
    };
    initSession();
  }, []);

  // 2. Login Asíncrono
  const login = useCallback(async (credentials) => {
    return toast.promise(
      UserStatusService.login(credentials).then((newUser) => {
        setUser(newUser);
        return newUser;
      }),
      {
        loading: 'Verificando credenciales...',
        success: (data) => `Hola de nuevo, ${data.name}`,
        error: (err) => `Error: ${err.message}`
      }
    );
  }, []);

  const logout = useCallback(async () => {
    await UserStatusService.logout();
    setUser(null);
  }, []);

  const updateUserPlan = useCallback(async (newPlan) => {
    if (!user) return;
    toast.promise(
      UserStatusService.updatePlan(newPlan).then(u => { setUser(u); return u; }),
      { loading: 'Actualizando...', success: '¡Plan mejorado!', error: 'Error en pago' }
    );
  }, [user]);
  
  const updateUserProfile = useCallback(async (data) => {
      if (!user) return;
      toast.promise(
        UserStatusService.updateProfile(data).then(u => { setUser(u); return u; }),
        { loading: 'Guardando...', success: 'Perfil actualizado', error: 'Error al guardar' }
      );
  }, [user]);

  const value = useMemo(() => ({
    user,
    loading,
    login,
    logout,
    updateUserPlan,
    updateUserProfile,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isPremium: user ? ['pro', 'unlimited'].includes(user.plan) : false
  }), [user, loading, login, logout, updateUserPlan, updateUserProfile]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};