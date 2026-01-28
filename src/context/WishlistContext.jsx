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

  // EFECTO 1: LIMPIEZA INMEDIATA
  // Separa la lógica de limpieza para que sea instantánea al logout
  useEffect(() => {
    if (!isAuthenticated || !user) {
        setWishlist([]);
    }
  }, [isAuthenticated, user]);

  // EFECTO 2: CARGA DE DATOS
  useEffect(() => {
    let isMounted = true;

    const fetchWishlist = async () => {
      // Si no hay usuario, el Efecto 1 ya limpió. No hacemos nada.
      if (!isAuthenticated || !user?.email) return;

      setLoading(true);
      try {
        const data = await wishlistService.getByUserId(user.email);
        if (isMounted) setWishlist(data);
      } catch (err) {
        console.error("Error cargando favoritos:", err);
        // Fallback silencioso para no molestar al usuario en cada carga
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchWishlist();

    return () => { isMounted = false; };
  }, [isAuthenticated, user]);

  // ... (El resto de funciones addToWishlist, removeFromWishlist, isInWishlist se mantienen IGUAL)
  
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
      console.error("Rollback error:", err);
      setWishlist(prevWishlist);
      toast.error('Error al guardar.');
    }
  }, [wishlist, isAuthenticated, user]);

  const removeFromWishlist = useCallback(async (itemId) => {
    if (!isAuthenticated) return;

    const prevWishlist = [...wishlist];
    setWishlist(current => current.filter(item => item.id !== itemId));
    toast.info('Eliminado de favoritos');

    try {
      await wishlistService.removeItem(user.email, itemId);
    } catch (err) {
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

// eslint-disable-next-line react-refresh/only-export-components
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist debe usarse dentro de un WishlistProvider');
  }
  return context;
};