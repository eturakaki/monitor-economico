// 1. Importaciones del núcleo de React
import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

/**
 * ------------------------------------------------------------------
 * SHOP CONTEXT - SSOT (Single Source of Truth - English Standard)
 * ------------------------------------------------------------------
 */

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  
  // --- INTEGRACIÓN DE SEGURIDAD ---
  const { user, loading } = useAuth();
  const prevUserRef = useRef(user);
  
  // A. STATE: CARRITO
  const [cart, setCart] = useState(() => {
    if (typeof window !== 'undefined') {
        try {
            const savedCart = localStorage.getItem('monitor_cart');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            console.error("Error crítico parseando el carrito:", error);
            return [];
        }
    }
    return [];
  });

  // B. STATE: FAVORITOS
  const [wishlist, setWishlist] = useState(() => {
    if (typeof window !== 'undefined') {
        try {
            const savedWishlist = localStorage.getItem('monitor_wishlist');
            return savedWishlist ? JSON.parse(savedWishlist) : [];
        } catch (error) {
            console.error("Error crítico parseando wishlist:", error);
            return [];
        }
    }
    return [];
  });

  // [NUEVO] C. STATE: HISTORIAL DE ÓRDENES (Las "Facturas")
  const [orders, setOrders] = useState(() => {
    if (typeof window !== 'undefined') {
        try {
            const savedOrders = localStorage.getItem('monitor_orders');
            return savedOrders ? JSON.parse(savedOrders) : [];
        } catch (error) {
            console.error("Error cargando órdenes:", error);
            return [];
        }
    }
    return [];
  });

  // --- CLEANUP DE SEGURIDAD ---
  useEffect(() => {
    if (loading) return;
    const prevUser = prevUserRef.current;
    const currentUser = user;

    if (prevUser && !currentUser) {
        console.info("🔒 [ShopSystem] Logout detectado: Purgando datos locales.");
        setCart([]);
        setWishlist([]);
        setOrders([]); // [NUEVO] Limpiamos órdenes de la memoria
        localStorage.removeItem('monitor_cart');
        localStorage.removeItem('monitor_wishlist');
        localStorage.removeItem('monitor_orders'); // [NUEVO] Limpiamos del storage
    }
    prevUserRef.current = currentUser;
  }, [user, loading]);

  // --- PERSISTENCIA ---
  useEffect(() => {
    localStorage.setItem('monitor_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('monitor_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // [NUEVO] Persistencia de Órdenes
  useEffect(() => {
    localStorage.setItem('monitor_orders', JSON.stringify(orders));
  }, [orders]);

  // =================================================================
  //  LAYER 3: BUSINESS LOGIC
  // =================================================================

  const addToCart = (product) => {
    setCart((prevCart) => {
      const isIncomingSubscription = product.type === 'subscription';
      const hasExistingSubscription = prevCart.some(item => item.type === 'subscription');
      
      // [CLEAN CODE] Estandarización: Solo leemos 'title'.
      const productName = product.title || 'Ítem';

      // A: Suscripción (Prioridad)
      if (isIncomingSubscription) {
        if (prevCart.length > 0) {
            toast.info('Carrito actualizado', {
                description: 'Se vació el carrito para priorizar tu suscripción.'
            });
        }
        return [{ ...product, quantity: 1 }];
      }

      // B: Conflicto
      if (hasExistingSubscription) {
         toast.warning('Suscripción eliminada', {
            description: `Se eliminó el plan para poder agregar "${productName}".`,
            duration: 4000,
         });
         return [{ ...product, quantity: 1 }];
      }

      // C: Normal
      const existingItem = prevCart.find((item) => item.id === product.id);

      if (existingItem) {
        if (product.type === 'curso') {
            toast.error('Ya tienes este curso', {
                description: 'El acceso digital ya está en tu carrito.'
            });
            return prevCart;
        }
        
        toast.success('Cantidad actualizada', {
             description: `${productName}: ${existingItem.quantity + 1} unidades.`
        });

        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        toast.success('Agregado al carrito', {
             description: `${productName} se agregó correctamente.`
        });
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
    console.log(`[ShopSystem] Item procesado.`);
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]); 
    console.log("[ShopSystem] Carrito vaciado.");
  };

  const toggleWishlist = (product) => {
    setWishlist((prevWish) => {
      const exists = prevWish.find((p) => p.id === product.id);
      if (exists) {
        return prevWish.filter((p) => p.id !== product.id); 
      } else {
        return [...prevWish, product]; 
      }
    });
  };

  const removeFromWishlist = (itemId) => {
    setWishlist((prev) => prev.filter((item) => item.id !== itemId));
  };

  const isInWishlist = (productId) => wishlist.some((p) => p.id === productId);

  // COMPUTED VALUES (Clean Code)
  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => {
      const price = Number(item.price) || 0;
      return total + price * item.quantity;
    }, 0);
  }, [cart]);

  const cartCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  // [NUEVO] ACCIÓN: Confirmar Compra (Persistencia)
  const confirmPurchase = () => {
    if (cart.length === 0) return;

    const newOrder = {
        id: `ORD-${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString(),
        items: [...cart], // Snapshot inmutable
        total: cartTotal,
        status: 'approved',
        paymentMethod: 'Credit Card (Simulación)'
    };

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    
    console.log("✅ [ShopSystem] Orden guardada:", newOrder);
  };

  // [NUEVO] SELECTOR: Mis Cursos (Biblioteca)
  const myCourses = useMemo(() => {
    const courses = [];
    orders.forEach(order => {
        order.items.forEach(item => {
            if (item.type === 'curso') {
                if (!courses.find(c => c.id === item.id)) {
                    courses.push(item);
                }
            }
        });
    });
    return courses;
  }, [orders]);

  return (
    <ShopContext.Provider
      value={{
        cart,
        wishlist,
        orders,      // [NUEVO] Exponemos el historial
        myCourses,   // [NUEVO] Exponemos la biblioteca
        addToCart,
        removeFromCart,
        clearCart,
        toggleWishlist,
        removeFromWishlist, 
        isInWishlist,
        confirmPurchase, // [NUEVO] Exponemos la acción de compra
        cartTotal,
        cartCount
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('FATAL: useShop debe ser utilizado dentro de un <ShopProvider />');
  }
  return context;
};