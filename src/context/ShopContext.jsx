import React, { createContext, useContext, useState, useEffect } from 'react';

// 1. CREAMOS EL CONTEXTO
const ShopContext = createContext();

// 2. EL PROVEEDOR (The Brain)
export const ShopProvider = ({ children }) => {
  
  // --- ESTADOS CON PERSISTENCIA (LocalStorage) ---
  
  // A. CARRITO
  const [cart, setCart] = useState(() => {
    // Verificamos si window existe (para evitar errores en algunos entornos de build)
    if (typeof window !== 'undefined') {
        const savedCart = localStorage.getItem('monitor_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    }
    return [];
  });

  // B. FAVORITOS (WISHLIST)
  const [wishlist, setWishlist] = useState(() => {
    if (typeof window !== 'undefined') {
        const savedWishlist = localStorage.getItem('monitor_wishlist');
        return savedWishlist ? JSON.parse(savedWishlist) : [];
    }
    return [];
  });

  // --- EFECTOS (Guardar cambios automáticamente) ---
  useEffect(() => {
    localStorage.setItem('monitor_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('monitor_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // --- LÓGICA DEL NEGOCIO (Actions) ---

  // 1. AGREGAR AL CARRITO
  const addToCart = (product) => {
    setCart((prevCart) => {
      // ¿Ya existe el producto?
      const existingItem = prevCart.find((item) => item.id === product.id);

      if (existingItem) {
        // Si es curso, no sumamos cantidad (lógica de negocio)
        if (product.type === 'curso') return prevCart;
        
        // Si es libro, sumamos +1
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
    // Aquí podrías poner un console.log o conectar una notificación real
    console.log(`Producto agregado: ${product.title}`);
  };

  // 2. ELIMINAR DEL CARRITO
  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  // 3. MANEJAR FAVORITOS (Toggle)
  const toggleWishlist = (product) => {
    setWishlist((prevWish) => {
      const exists = prevWish.find((p) => p.id === product.id);
      if (exists) {
        return prevWish.filter((p) => p.id !== product.id); // Quitar
      } else {
        return [...prevWish, product]; // Agregar
      }
    });
  };

  // 4. VERIFICAR SI ESTÁ EN FAVORITOS
  const isInWishlist = (productId) => wishlist.some((p) => p.id === productId);

  // 5. CALCULAR TOTALES
  const cartTotal = cart.reduce((total, item) => {
    const price = item.discountPrice ?? item.price;
    return total + price * item.quantity;
  }, 0);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // --- EXPORTAR PODERES ---
  return (
    <ShopContext.Provider
      value={{
        cart,
        wishlist,
        addToCart,
        removeFromCart,
        toggleWishlist,
        isInWishlist,
        cartTotal,
        cartCount
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

// 3. HOOK PERSONALIZADO
// eslint-disable-next-line react-refresh/only-export-components
export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) throw new Error('useShop debe usarse dentro de un ShopProvider');
  return context;
};