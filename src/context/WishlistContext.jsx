// src/context/WishlistContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth'; 
import { wishlistService } from '../services/wishlistService';
import { toast } from 'sonner';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Carga inicial
  useEffect(() => {
    let isMounted = true;

    const fetchWishlist = async () => {
      if (!isAuthenticated || !user?.email) {
        setWishlist([]); 
        return;
      }

      setLoading(true);
      try {
        const data = await wishlistService.getByUserId(user.email);
        if (isMounted) setWishlist(data);
      } catch (err) {
        // FIX 1: Usamos 'err' para debug
        console.error("Error cargando favoritos:", err);
        toast.error("No se pudieron cargar tus favoritos");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchWishlist();

    return () => { isMounted = false; };
  }, [isAuthenticated, user]);

  // 2. Acción: Agregar
  const addToWishlist = useCallback(async (item) => {
    if (!isAuthenticated) {
      toast.warning('Debes iniciar sesión para guardar favoritos');
      return;
    }

    const prevWishlist = [...wishlist];
    if (prevWishlist.some(i => i.id === item.id)) return;

    setWishlist(current => [...current, item]);
    toast.success('Guardado en favoritos');

    try {
      await wishlistService.addItem(user.email, item);
    } catch (err) {
      // FIX 2: Usamos 'err'
      console.error("Rollback error:", err);
      setWishlist(prevWishlist);
      toast.error('Error al guardar. Intenta nuevamente.');
    }
  }, [wishlist, isAuthenticated, user]);

  // 3. Acción: Remover
  const removeFromWishlist = useCallback(async (itemId) => {
    if (!isAuthenticated) return;

    const prevWishlist = [...wishlist];
    setWishlist(current => current.filter(item => item.id !== itemId));
    toast.info('Eliminado de favoritos');

    try {
      await wishlistService.removeItem(user.email, itemId);
    } catch (err) {
      // FIX 3: Usamos 'err'
      console.error("Remove error:", err);
      setWishlist(prevWishlist);
      toast.error('No se pudo eliminar el ítem.');
    }
  }, [wishlist, isAuthenticated, user]);

  const isInWishlist = useCallback((id) => {
    return wishlist.some(item => item.id === id);
  }, [wishlist]);

  const value = {
    wishlist,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

// FIX 4: Deshabilitamos la alerta de Fast Refresh para este export específico
// Esto es estándar cuando se exporta el Hook y el Provider juntos.
// eslint-disable-next-line react-refresh/only-export-components
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist debe usarse dentro de un WishlistProvider');
  }
  return context;
};