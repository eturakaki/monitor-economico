import { useMemo } from 'react';

/**
 * HOOK: USE CART ANALYSIS
 * ------------------------------------------------------------------
 * "El Cerebro del Checkout"
 * Analiza el contenido del carrito (o una orden pasada) para determinar
 * qué tipo de checkout debemos mostrar (Físico, Digital o Híbrido).
 * * @param {Array} items - Array de productos (del carrito o de una orden)
 */
export const useCartAnalysis = (items = []) => {
  return useMemo(() => {
    // 1. Si no hay items, reseteamos todo a falso
    if (!items || items.length === 0) {
      return {
        hasPhysical: false,
        hasDigital: false,
        hasSubscription: false,
        requiresShipping: false,
        isMixed: false
      };
    }

    // 2. Detectores de Categoría
    // Un item es 'Físico' si NO es 'plan', 'subscription' o 'course'
    const hasPhysical = items.some(item => {
      const type = item.type || item.category;
      return !['plan', 'subscription', 'course', 'curso'].includes(type);
    });

    // Un item es 'Suscripción' si tiene el flag explícito
    const hasSubscription = items.some(item => 
      ['plan', 'subscription'].includes(item.type || item.category)
    );

    // Un item es 'Digital' (Curso o Plan)
    const hasDigital = items.some(item => 
      ['plan', 'subscription', 'course', 'curso'].includes(item.type || item.category)
    );

    // 3. Reglas de Negocio Derivadas
    
    // REQUIRES SHIPPING: Solo si hay al menos un producto físico.
    // (Incluso si es híbrido, si hay 1 libro, necesitamos la dirección).
    const requiresShipping = hasPhysical;

    // IS MIXED: Para mostrar mensajes de feedback complejos (ej: "Tu plan está activo y tu libro en camino")
    const isMixed = hasPhysical && hasDigital;

    return {
      hasPhysical,
      hasDigital,
      hasSubscription,
      requiresShipping,
      isMixed
    };

  }, [items]);
};