// 1. Agrega 'useRef' y 'useMemo' a la importación de React
import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';

// 2. Importa el AuthContext
import { useAuth } from './AuthContext';

/**
 * ------------------------------------------------------------------
 * SHOP CONTEXT - GLOBAL STATE MANAGEMENT ARCHITECTURE
 * ------------------------------------------------------------------
 * Arquitectura: React Context API + LocalStorage Persistence Pattern
 * Propósito: Centralizar la lógica de negocio (Business Logic) y el estado
 * global para el Carrito de Compras y la Lista de Deseos (Wishlist).
 */

// 1. Context Initialization
const ShopContext = createContext();

// 2. Provider Component (The Brain)
export const ShopProvider = ({ children }) => {
  
  // =================================================================
  //  LAYER 1: PERSISTENCE & STATE HYDRATION
  // =================================================================
  
  // --- INTEGRACIÓN DE SEGURIDAD ---
  const { user, loading } = useAuth(); // Traemos al usuario del contexto de Auth
  const prevUserRef = useRef(user);    // Creamos una "memoria" para comparar
  
  // A. STATE: CARRITO DE COMPRAS
  const [cart, setCart] = useState(() => {
    if (typeof window !== 'undefined') {
        try {
            const savedCart = localStorage.getItem('monitor_cart');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            console.error("Error crítico parseando el carrito:", error);
            return []; // Fallback seguro ante datos corruptos
        }
    }
    return [];
  });

  // B. STATE: FAVORITOS (WISHLIST)
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

  // =================================================================
  //  LAYER 1.5: SECURITY & SESSION CLEANUP
  // =================================================================
  
  /**
   * EFECTO: DETECCIÓN DE LOGOUT
   * Propósito: Limpiar datos sensibles INMEDIATAMENTE al cerrar sesión.
   */
  useEffect(() => {
    if (loading) return; // Si está cargando, esperamos

    const prevUser = prevUserRef.current;
    const currentUser = user;

    // Si antes había usuario Y ahora no (Logout explícito)
    if (prevUser && !currentUser) {
        console.info("🔒 [ShopSystem] Logout detectado: Purgando datos locales.");
        
        // --- SENIOR NOTE ---
        // Deshabilitamos la regla 'set-state-in-effect' aquí porque este re-render
        // es INTENCIONAL y NECESARIO por seguridad (Session Cleanup).
        
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCart([]);
        
        
        setWishlist([]);
        
        // Limpiar LocalStorage
        localStorage.removeItem('monitor_cart');
        localStorage.removeItem('monitor_wishlist');
    }

    // Actualizamos la referencia
    prevUserRef.current = currentUser;

  }, [user, loading]);

  // =================================================================
  //  LAYER 2: SIDE EFFECTS (DATA SYNCHRONIZATION)
  // =================================================================
  
  // Persistencia Automática: Suscripción a cambios de estado
  useEffect(() => {
    localStorage.setItem('monitor_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('monitor_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // =================================================================
  //  LAYER 3: BUSINESS LOGIC (ACTIONS)
  // =================================================================

  /**
   * ACTION: Add Item to Cart
   */
  const addToCart = (product) => {
    setCart((prevCart) => {
      // Check for existence (Idempotency check)
      const existingItem = prevCart.find((item) => item.id === product.id);

      if (existingItem) {
        // REGLA DE NEGOCIO: Los cursos no pueden tener cantidad > 1
        if (product.type === 'curso') return prevCart;
        
        // REGLA DE NEGOCIO: Incremento de cantidad para items físicos
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        // Nuevo item: Inicializamos cantidad
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
    console.log(`[ShopSystem] Producto agregado: ${product.title}`);
  };

  /**
   * ACTION: Remove Item from Cart
   */
  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  /**
   * ACTION: Toggle Wishlist Status
   */
  const toggleWishlist = (product) => {
    setWishlist((prevWish) => {
      const exists = prevWish.find((p) => p.id === product.id);
      if (exists) {
        return prevWish.filter((p) => p.id !== product.id); // Remove operation
      } else {
        return [...prevWish, product]; // Add operation
      }
    });
  };

  /**
   * ACTION: Remove from Wishlist (Explicit)
   */
  const removeFromWishlist = (itemId) => {
    setWishlist((prev) => prev.filter((item) => item.id !== itemId));
  };

  // HELPER: Check Wishlist Status (Boolean)
  const isInWishlist = (productId) => wishlist.some((p) => p.id === productId);

  // =================================================================
  //  LAYER 4: COMPUTED VALUES (SELECTORS)
  // =================================================================
  
  // Derivamos datos directamente del estado para asegurar "Single Source of Truth".
  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => {
      const price = item.discountPrice ?? item.price; // Nullish coalescing para precio seguro
      return total + price * item.quantity;
    }, 0);
  }, [cart]);

  const cartCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  // =================================================================
  //  EXPOSE PUBLIC API
  // =================================================================
  return (
    <ShopContext.Provider
      value={{
        // State Snapshots
        cart,
        wishlist,
        
        // Actions (Mutators)
        addToCart,
        removeFromCart,
        toggleWishlist,
        removeFromWishlist, 
        
        // Helpers & Computed
        isInWishlist,
        cartTotal,
        cartCount
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

// 3. Custom Hook (Consumer Abstraction)
// eslint-disable-next-line react-refresh/only-export-components
export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('FATAL: useShop debe ser utilizado dentro de un <ShopProvider />');
  }
  return context;
};