/**
 * @file order.service.js
 * @description SERVICIO DE ÓRDENES (The Ledger)
 * Gestiona el historial de compras y la validación de propiedad de activos.
 * * @architecture Service Layer (Hybrid: Mock/Real)
 */

// 1. IMPORTACIÓN DE LA ADUANA
import apiClient, { IS_MOCK_MODE } from '../core/api.client';

// --- MOCK DB HELPERS ---
const MOCK_KEY = 'monitor_orders_mock_db';
const _getMockOrders = () => JSON.parse(localStorage.getItem(MOCK_KEY) || '[]');
const _saveMockOrders = (orders) => localStorage.setItem(MOCK_KEY, JSON.stringify(orders));
const _simulateDelay = () => new Promise(resolve => setTimeout(resolve, 500));

export const orderService = {

  /**
   * Obtiene el historial completo de compras del usuario.
   */
  async getOrders() {
    if (IS_MOCK_MODE) {
      await _simulateDelay();
      // Ordenamos por fecha descendente (lo más nuevo primero)
      const orders = _getMockOrders();
      return orders.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    return apiClient.get('/orders');
  },

  /**
   * Genera una nueva orden tras un pago exitoso.
   * @param {Array} items - Items del carrito.
   * @param {number} total - Total pagado.
   * @param {string} method - Método de pago (ej: 'Credit Card').
   */
  async createOrder(items, total, method = 'Credit Card') {
    if (IS_MOCK_MODE) {
      await _simulateDelay();
      const newOrder = {
        id: `ORD-${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString(),
        items: items, // Guardamos snapshot de los items
        total: total,
        status: 'approved',
        paymentMethod: method
      };

      const currentOrders = _getMockOrders();
      _saveMockOrders([newOrder, ...currentOrders]);
      
      console.info(`[OrderService] Orden creada: ${newOrder.id}`);
      return newOrder;
    }

    return apiClient.post('/orders', { items, total, method });
  },

  /**
   * 🔍 CRÍTICO: Verifica si el usuario ya posee un producto.
   * @param {string} productId - ID del curso o plan.
   * @param {string} type - 'course', 'subscription', etc. (Opcional pero recomendado).
   * @returns {Promise<boolean>}
   */
  async hasPurchased(productId, type = 'course') {
    // Nota: En una app real, esto podría ser un endpoint dedicado /entitlements/check/{id}
    // Para el Mock, recorremos el historial localmente.
    
    let orders = [];
    
    if (IS_MOCK_MODE) {
       orders = _getMockOrders();
    } else {
       // Si estamos en backend real, idealmente usamos un endpoint ligero
       // Pero si no existe, traemos las órdenes y filtramos.
       try {
         orders = await apiClient.get('/orders');
       } catch (e) {
         console.warn("Fallo al verificar propiedad:", e);
         return false;
       }
    }

    // LÓGICA DE NEGOCIO "LEGACY":
    const found = orders.some(order => 
      order.status === 'approved' && // Solo órdenes pagadas
      order.items.some(item => item.id === productId)
    );

    if (!found) return false;

    // REGLA DE SUSCRIPCIONES (PLANS):
    // Si encontró el plan en el historial, en el Mock asumimos que sigue activo.
    // En producción, el backend validaría la fecha de expiración ('expires_at').
    if (type === 'plan' || type === 'subscription') {
       // Mock: Asumimos 'true' si lo compraste alguna vez.
       // TODO: En Fase 3 (Auth), cruzaremos esto con user.plan para mayor precisión.
       return true; 
    }

    // REGLA DE CURSOS (LIFETIME):
    // Si lo compraste, es tuyo para siempre.
    return true;
  }
};