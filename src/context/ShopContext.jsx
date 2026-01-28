// src/context/ShopContext.jsx
import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';

/**
 * ------------------------------------------------------------------
 * SHOP CONTEXT - SSOT (Single Source of Truth)
 * ------------------------------------------------------------------
 * Refactorizado para manejar Lógica de Planes Dinámica y Limpieza Estricta.
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

  // B. STATE: FAVORITOS (Legacy Support - Sincronizado con WishlistContext)
  const [wishlist, setWishlist] = useState(() => {
    if (typeof window !== 'undefined') {
        try {
            const savedWishlist = localStorage.getItem('monitor_wishlist');
            return savedWishlist ? JSON.parse(savedWishlist) : [];
        } catch { 
            // CORRECCIÓN 1: Eliminada variable 'error' no utilizada (Optional Catch Binding)
            return [];
        }
    }
    return [];
  });

  // C. STATE: HISTORIAL DE ÓRDENES
  const [orders, setOrders] = useState(() => {
    if (typeof window !== 'undefined') {
        try {
            const savedOrders = localStorage.getItem('monitor_orders');
            return savedOrders ? JSON.parse(savedOrders) : [];
        } catch {
            // CORRECCIÓN 2: Eliminada variable 'error' no utilizada
            return [];
        }
    }
    return [];
  });

  // --- CLEANUP DE SEGURIDAD ---
  const clearShopState = () => {
    console.info("🔒 [ShopSystem] Purgando datos locales por seguridad.");
    
    localStorage.removeItem('monitor_cart');
    localStorage.removeItem('monitor_wishlist');
    localStorage.removeItem('monitor_orders');

    setCart([]);
    setWishlist([]);
    setOrders([]); 
  };

  useEffect(() => {
    if (loading) return;
    
    const prevUser = prevUserRef.current;
    
    // CASO 1: Logout Explicito (Transición de User -> Null)
    const isLoggingOut = prevUser && !user;

    // CASO 2: Estado "Zombie" (Carga inicial sin usuario pero con datos en memoria/LS)
    // Esto soluciona que los datos persistan al recargar la página sin sesión.
    const hasDanglingData = !user && (cart.length > 0 || wishlist.length > 0 || orders.length > 0);

    if (isLoggingOut || hasDanglingData) {
        clearShopState();
    }
    
    prevUserRef.current = user;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]); // Dependencias estrictas

  // --- PERSISTENCIA ---
  useEffect(() => {
    if (user) localStorage.setItem('monitor_cart', JSON.stringify(cart));
  }, [cart, user]);

  useEffect(() => {
    if (user) localStorage.setItem('monitor_wishlist', JSON.stringify(wishlist));
  }, [wishlist, user]);

  useEffect(() => {
    if (user) localStorage.setItem('monitor_orders', JSON.stringify(orders));
  }, [orders, user]);

  // =================================================================
  //  LAYER 3: BUSINESS LOGIC (Refactorizada)
  // =================================================================
  /**
  * VERIFICACIÓN DE PROPIEDAD DIGITAL INTELIGENTE
   * @param {string} productId - ID del producto a verificar
   * @param {string} category - 'course', 'subscription', 'plan', etc.
   */
  // LÓGICA DE PROPIEDAD REFINADA
  const hasPurchased = (productId, category = 'course') => {
    // CHECK 1: ESTADO ACTUAL (Solo para Planes)
    // Si la categoría se pasa explícitamente como 'plan', validamos contra el usuario actual.
    if (category === 'subscription' || category === 'plan') {
        if (!user) return false;
        // Solo devuelve TRUE si este es tu plan ACTUAL y VIGENTE.
        return user.plan === productId;
    }

    // CHECK 2: HISTORIAL (Para Cursos y Fallback)
    // Buscamos si el ID existe en órdenes pasadas.
    if (!orders || orders.length === 0) return false;

    return orders.some(order => 
        order.items && order.items.some(item => {
            // Si el ID no coincide, seguimos buscando...
            if (item.id !== productId) return false;

            // [FIX CRÍTICO] INTELIGENCIA DE TIPO
            // Si encontramos el item en el historial, verificamos su tipo.
            // Si es un 'plan' o 'subscription', IGNORAMOS el historial (return false).
            // Esto permite volver a comprar un plan que tuviste en el pasado.
            const type = item.type || item.category; // Aseguramos leer el tipo guardado
            if (type === 'subscription' || type === 'plan') return false;

            // Si es curso, libro o recurso, el historial MANDA (return true).
            return true;
        })
    );
  };

  const addToCart = (product) => {
    // Definir tipo para la validación
    const productType = product.type || 'course';
    const isSinglePurchaseItem = ['curso', 'recurso', 'subscription', 'plan'].includes(productType);
    
    // Usamos la nueva lógica de hasPurchased pasando la categoría
    if (isSinglePurchaseItem && hasPurchased(product.id, productType)) {
        const message = productType === 'subscription' 
            ? 'Ya tienes este plan activo.' 
            : 'Ya tienes acceso a este contenido.';
            
        toast.info('Acceso existente', { description: message });
        return; 
    }

    setCart((prevCart) => {
      const isIncomingSubscription = product.type === 'subscription' || product.type === 'plan';
      const hasExistingSubscription = prevCart.some(item => item.type === 'subscription' || item.type === 'plan');
      
      // CORRECCIÓN 3: Eliminada la definición de 'productName' que no se utilizaba.

      // Regla de Negocio: Solo una suscripción por checkout
      if (isIncomingSubscription) {
        if (prevCart.length > 0) {
            toast.info('Carrito actualizado', {
                description: 'Se ha priorizado tu nueva suscripción.'
            });
        }
        // Reemplaza todo el carrito con la nueva suscripción
        return [{ ...product, quantity: 1 }];
      }

      // Regla de Negocio: No mezclar suscripciones con cursos si ya hay una suscripción
      if (hasExistingSubscription) {
         toast.warning('Conflicto de ítems', {
            description: `Completa tu suscripción antes de agregar cursos.`,
         });
         return prevCart;
      }

      const existingItem = prevCart.find((item) => item.id === product.id);

      if (existingItem) {
        if (product.type === 'curso') {
            toast.info('El curso ya está en el carrito');
            return prevCart;
        }
        
        toast.success('Cantidad actualizada');
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        toast.success('Agregado al carrito');
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  // ... (Resto de funciones: removeFromCart, clearCart, etc. se mantienen igual)
  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]); 
  };

  const toggleWishlist = (product) => {
    setWishlist((prevWish) => {
      const exists = prevWish.find((p) => p.id === product.id);
      if (exists) return prevWish.filter((p) => p.id !== product.id); 
      return [...prevWish, product]; 
    });
  };

  const removeFromWishlist = (itemId) => {
    setWishlist((prev) => prev.filter((item) => item.id !== itemId));
  };

  const isInWishlist = (productId) => wishlist.some((p) => p.id === productId);

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + (Number(item.price) || 0) * item.quantity, 0);
  }, [cart]);

  const cartCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);


  // ACCIÓN: Confirmar Compra
  const confirmPurchase = () => {
    if (cart.length === 0) return null; // Retornamos null si no hay nada

    const newOrder = {
        id: `ORD-${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString(),
        items: [...cart],
        total: cartTotal,
        status: 'approved',
        paymentMethod: 'Credit Card (Simulación)'
    };

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    
    console.log("✅ [ShopSystem] Orden guardada:", newOrder);
    
    return newOrder; // <--- FIX CRÍTICO: Retornamos la orden para que el Checkout la lea
  };

  // Selector MyCourses (Sin cambios)
  const myCourses = useMemo(() => {
    const courses = [];
    orders.forEach(order => {
        order.items.forEach(item => {
            if (item.type === 'curso' || item.type === 'course') {
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
        orders,
        myCourses,
        addToCart,
        removeFromCart,
        clearCart,
        toggleWishlist,
        removeFromWishlist, 
        isInWishlist,
        confirmPurchase,
        hasPurchased, 
        cartTotal,
        cartCount
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

// CORRECCIÓN 4: Bypass estricto para evitar refactorizar la estructura de archivos
// eslint-disable-next-line react-refresh/only-export-components
export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) throw new Error('useShop debe ser utilizado dentro de un <ShopProvider />');
  return context;
};