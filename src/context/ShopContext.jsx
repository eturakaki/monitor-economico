/**
 * @file ShopContext.jsx
 * @description CONTEXTO DE COMERCIO (The Manager)
 * Ya no almacena datos, solo orquesta los servicios de Cart, Order y Checkout.
 * Implementa patrón "In-Memory Cache" para orders y validación instantánea.
 * * @architecture Thin Context / Fat Service
 */

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';

// IMPORTACIÓN DE SERVICIOS (La nueva arquitectura Commerce)
import { cartService } from '../services/commerce/cart.service';
import { orderService } from '../services/commerce/order.service';
import { checkoutService } from '../services/commerce/checkout.service';

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();

  // --- ESTADO GLOBAL (Cache en Memoria) ---
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]); // Historial completo (Snapshot)
  const [isShopLoading, setShopLoading] = useState(true);

  // --- 1. FETCH-ON-MOUNT (Sincronización Inicial) ---
  useEffect(() => {
    let mounted = true;

    const initShop = async () => {
      // Esperamos a que Auth termine de cargar para saber quién es el usuario
      if (authLoading) return;
      
      // Si no hay usuario, limpiamos todo y cerramos el kiosco
      if (!user) {
        setCart([]);
        setOrders([]);
        setShopLoading(false);
        return;
      }

      setShopLoading(true);
      try {
        // PARALELISMO: Cargamos Carrito y Órdenes al mismo tiempo para velocidad
        const [serverCart, serverOrders] = await Promise.all([
            cartService.getCart(),
            orderService.getOrders()
        ]);

        if (mounted) {
            setCart(serverCart || []);
            setOrders(serverOrders || []);
        }
      } catch (error) {
        console.error("[Shop] Error de sincronización:", error);
        // Toast discreto, no queremos asustar al usuario nada más entrar
        toast.error("Error conectando con la tienda.", { 
            description: "Tus datos podrían no estar actualizados." 
        });
      } finally {
        if (mounted) setShopLoading(false);
      }
    };

    initShop();

    return () => { mounted = false; };
  }, [user, authLoading]);


  // --- 2. ACCIONES DEL CARRITO (Delegadas al Servicio) ---

  const addToCart = useCallback(async (product) => {
    try {
        // El servicio decide si entra (Reglas de Monogamia / Duplicados)
        const updatedCart = await cartService.addToCart(product);
        setCart(updatedCart); // Actualizamos la UI con la verdad del servicio
        
        const isSub = product.type === 'subscription' || product.type === 'plan';
        toast.success(isSub ? 'Plan seleccionado' : 'Agregado al carrito');

    } catch (error) {
        // El servicio lanzó un error de negocio (ej: "Ya tienes suscripción")
        toast.warning(error.message);
    }
  }, []);

  const removeFromCart = useCallback(async (productId) => {
    try {
        const updatedCart = await cartService.removeFromCart(productId);
        setCart(updatedCart);
        toast.info("Producto eliminado");
    } catch {
        toast.error("No se pudo eliminar el ítem.");
    }
  }, []);

  const clearCart = useCallback(async () => {
    try {
        await cartService.clearCart();
        setCart([]);
    } catch (error) {
        console.error("Error limpiando carrito:", error);
    }
  }, []);


  // --- 3. PROCESO DE PAGO (Orquestación) ---

  /**
   * ProcessCheckout: El Director de Orquesta.
   * Coordina: Checkout -> Order -> Clear Cart
   */
  const processCheckout = useCallback(async (paymentData) => {
    if (cart.length === 0) throw new Error("El carrito está vacío");

    // PASO A: Pasarela de Pago
    // Esto lanzará error si la tarjeta es rechazada (Chaos Monkey Friendly)
    await checkoutService.processPayment({
        ...paymentData,
        items: cart,
        userEmail: user?.email
    });

    // PASO B: Registro Contable (Ledger)
    // Solo si el pago pasó, creamos la orden.
    const newOrder = await orderService.createOrder(
        cart, 
        paymentData.amount, 
        'Credit Card' // Aquí podrías mapear el método real
    );

    // PASO C: Actualización Optimista (Cache Update)
    // Inyectamos la nueva orden al inicio del array para que aparezca YA en "Mis Cursos"
    setOrders(prev => [newOrder, ...prev]);
    
    // PASO D: Limpieza
    await clearCart();

    return newOrder;
  }, [cart, user, clearCart]);


  // --- 4. VERIFICACIÓN DE PROPIEDAD (In-Memory Check) ---
  
  /**
   * hasPurchased: La función de alto rendimiento.
   * Busca en la RAM (estado 'orders'), NO hace fetch.
   */
  const hasPurchased = useCallback((productId, type = 'course') => {
    if (!orders || orders.length === 0) return false;
    
    // 1. Buscamos en el historial de órdenes APROBADAS
    const found = orders.some(order => 
        order.status === 'approved' && 
        order.items.some(item => item.id === productId)
    );

    if (!found) return false;

    // 2. Validación de Planes (Simplificada para UI)
    // Si está en el historial, asumimos que tiene el plan (AuthService validará expiración real)
    if (type === 'plan' || type === 'subscription') {
        return true; 
    }

    return true; 
  }, [orders]);


  // --- 5. SELECTORES (Computed Values) ---

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + (Number(item.price) || 0) * item.quantity, 0);
  }, [cart]);

  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);

  // Helper para "Mis Cursos" derivado de las órdenes (SSOT)
  const myCourses = useMemo(() => {
    const coursesMap = new Map();
    orders.forEach(order => {
        if (order.status !== 'approved') return;
        order.items.forEach(item => {
            // Normalizamos tipos
            const type = item.type || item.category || 'course';
            if ((type === 'course' || type === 'curso') && !coursesMap.has(item.id)) {
                coursesMap.set(item.id, item);
            }
        });
    });
    return Array.from(coursesMap.values());
  }, [orders]);


  // --- EXPOSICIÓN DEL CONTEXTO ---
  return (
    <ShopContext.Provider
      value={{
        // Estado
        cart,
        orders,      // Exponemos el historial crudo por si acaso
        myCourses,   // Exponemos la lista limpia de cursos
        isShopLoading,
        
        // Acciones
        addToCart,
        removeFromCart,
        clearCart,
        processCheckout, // La nueva función estrella
        
        // Helpers
        hasPurchased,
        cartTotal,
        cartCount
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

// Hook de consumo
// eslint-disable-next-line react-refresh/only-export-components
export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) throw new Error('useShop debe ser utilizado dentro de un <ShopProvider />');
  return context;
};