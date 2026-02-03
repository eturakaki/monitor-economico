/**
 * @file cart.service.js
 * @description SERVICIO DE CARRITO (Commerce Core)
 * Implementa la lógica de negocio para la gestión del carrito de compras.
 * Soporta modo híbrido (Mock/Real) y gestiona reglas de exclusividad de productos.
 * * @version 2.0.0 - Permissive Monogamy Strategy
 * @author Lead Architect
 */

import apiClient, { IS_MOCK_MODE } from '../core/api.client';

// --- CONFIGURACIÓN DE PERSISTENCIA MOCK ---
const MOCK_DB_KEY = 'monitor_cart_mock_db';

// Helpers internos puros (Pure Functions) para manejo de Mock DB
const _getMockCart = () => {
  try {
    return JSON.parse(localStorage.getItem(MOCK_DB_KEY) || '[]');
  } catch {
    return [];
  }
};

const _saveMockCart = (cart) => {
  localStorage.setItem(MOCK_DB_KEY, JSON.stringify(cart));
};

const _simulateNetworkLatency = () => new Promise(resolve => setTimeout(resolve, 600));

export const cartService = {

  /**
   * Recupera el estado actual del carrito.
   * @returns {Promise<Array>} Lista de ítems en el carrito.
   */
  async getCart() {
    if (IS_MOCK_MODE) {
      await _simulateNetworkLatency();
      return _getMockCart();
    }
    return apiClient.get('/cart');
  },

  /**
   * Agrega un ítem al carrito aplicando reglas de negocio estrictas pero amigables (UX).
   * * ESTRATEGIA: MONOGAMIA BIDIRECCIONAL PERMISIVA
   * 1. Las Suscripciones (Planes) son exclusivas. No conviven con nada más.
   * 2. Si entra una Suscripción -> Se limpia el carrito y entra la suscripción.
   * 3. Si hay una Suscripción y entra un Curso -> Se limpia la suscripción y entra el curso.
   * * @param {Object} item - El producto a agregar.
   */
  async addToCart(item) {
    // Normalización de tipos para evitar errores por inconsistencia de datos
    const itemType = item.type || item.category || 'course';
    const isIncomingSubscription = ['plan', 'subscription'].includes(itemType);

    // --- ESCENARIO MOCK (Lógica Cliente) ---
    if (IS_MOCK_MODE) {
      await _simulateNetworkLatency();
      
      const currentCart = _getMockCart();
      const hasExistingSubscription = currentCart.some(i => 
        ['plan', 'subscription'].includes(i.type || i.category)
      );

     // DETECCIÓN DE CONFLICTO DE EXCLUSIVIDAD
      // Si entra un plan, o si ya hay uno presente, activamos el reemplazo total.
      const isConflictScenario = isIncomingSubscription || hasExistingSubscription; // <--- CORREGIDO (CamelCase junto)

      if (isConflictScenario) {
        // ESTRATEGIA DE REEMPLAZO (Permissive Wipe)
        console.info('[CartService] Conflicto de exclusividad resuelto: Reemplazando carrito.');
        
        const newCart = [{ ...item, quantity: 1, type: itemType }];
        _saveMockCart(newCart);
        return newCart;
      }

      // LÓGICA ESTÁNDAR (Acumulación de Cursos)
      const existingItemIndex = currentCart.findIndex(i => i.id === item.id);
      
      if (existingItemIndex >= 0) {
        // Regla: No permitir duplicar el mismo curso digital
        if (['course', 'curso'].includes(itemType)) {
            throw new Error("Este curso ya se encuentra en tu carrito.");
        }
        // Para productos consumibles/físicos, incrementamos cantidad
        currentCart[existingItemIndex].quantity += 1;
      } else {
        currentCart.push({ ...item, quantity: 1, type: itemType });
      }

      _saveMockCart(currentCart);
      return currentCart;
    }

    // --- ESCENARIO REAL (API) ---
    // Delegamos la lógica transaccional al backend.
    return await apiClient.post('/cart', { item });
  },

  /**
   * Elimina un ítem específico del carrito.
   */
  async removeFromCart(itemId) {
    if (IS_MOCK_MODE) {
      await _simulateNetworkLatency();
      const newCart = _getMockCart().filter(i => i.id !== itemId);
      _saveMockCart(newCart);
      return newCart;
    }
    return apiClient.delete(`/cart/${itemId}`);
  },

  /**
   * Purga el carrito completo.
   */
  async clearCart() {
    if (IS_MOCK_MODE) {
      // Sin latencia artificial para que la UI se sienta instantánea al limpiar
      _saveMockCart([]);
      return [];
    }
    return apiClient.delete('/cart');
  }
};