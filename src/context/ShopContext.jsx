// 1. Importaciones del núcleo de React
import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';

/**
 * ------------------------------------------------------------------
 * SHOP CONTEXT - SSOT (Single Source of Truth)
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

  // C. STATE: HISTORIAL DE ÓRDENES
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
  const clearShopState = () => {
    console.info("🔒 [ShopSystem] Logout detectado: Purgando datos locales.");
    
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
    const currentUser = user;
    const isLoggingOut = prevUser && !currentUser;

    if (isLoggingOut) {
        setTimeout(() => {
            clearShopState();
        }, 0);
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

  useEffect(() => {
    localStorage.setItem('monitor_orders', JSON.stringify(orders));
  }, [orders]);

  // =================================================================
  //  LAYER 3: BUSINESS LOGIC
  // =================================================================

  // [NUEVO] VERIFICACIÓN DE PROPIEDAD DIGITAL
  // Esta función es vital para evitar compras duplicadas.
  const hasPurchased = (productId) => {
    if (!orders || orders.length === 0) return false;

    // Buscamos dentro de cada orden si existe el ítem
    return orders.some(order => 
        order.items && order.items.some(item => item.id === productId)
    );
  };

  const addToCart = (product) => {
    // 1. Check de Propiedad Inteligente 🧠
    // Definimos qué tipos de productos son de "compra única"
    const isSinglePurchaseItem = ['curso', 'recurso', 'subscription'].includes(product.type);
    
    // Solo bloqueamos si es un ítem único Y ya lo tiene. 
    // Si es 'libro', esta validación se salta y permite comprar más.
    if (isSinglePurchaseItem && hasPurchased(product.id)) {
        toast.info('Ya tienes acceso a este contenido', {
            description: 'Lo encontrarás en tu biblioteca personal.'
        });
        return; 
    }

    setCart((prevCart) => {
      const isIncomingSubscription = product.type === 'subscription';
      const hasExistingSubscription = prevCart.some(item => item.type === 'subscription');
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

      // B: Conflicto Suscripción existente
      if (hasExistingSubscription) {
         toast.warning('Suscripción eliminada', {
            description: `Se eliminó el plan para poder agregar "${productName}".`,
            duration: 4000,
         });
         return [{ ...product, quantity: 1 }];
      }

      // C: Flujo Normal (Aquí entran los Libros también)
      const existingItem = prevCart.find((item) => item.id === product.id);

      if (existingItem) {
        // Bloqueo extra solo para cursos en el carrito (por si acaso)
        if (product.type === 'curso') {
            toast.error('Ya está en el carrito', {
                description: 'Acceso digital único.'
            });
            return prevCart;
        }
        
        // Si es LIBRO, sumamos cantidad +1
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

  // COMPUTED VALUES
  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => {
      const price = Number(item.price) || 0;
      return total + price * item.quantity;
    }, 0);
  }, [cart]);

  const cartCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  // ACCIÓN: Confirmar Compra
  const confirmPurchase = () => {
    if (cart.length === 0) return;

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
  };

  // SELECTOR: Mis Cursos
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
        orders,
        myCourses,
        addToCart,
        removeFromCart,
        clearCart,
        toggleWishlist,
        removeFromWishlist, 
        isInWishlist,
        confirmPurchase,
        hasPurchased, // <--- EXPORTADO PÚBLICAMENTE
        cartTotal,
        cartCount
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('FATAL: useShop debe ser utilizado dentro de un <ShopProvider />');
  }
  return context;
};