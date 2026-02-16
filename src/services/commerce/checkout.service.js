/**
 * @file checkout.service.js
 * @description SERVICIO DE PAGOS (The Gateway)
 * Gestiona la comunicación con procesadores de pago (Stripe/MercadoPago).
 * En modo Mock, simula la latencia y validación de tarjetas.
 * * @architecture Service Layer (Hybrid: Mock/Real)
 */

// 1. IMPORTACIÓN DE LA ADUANA
import apiClient, { IS_MOCK_MODE } from '../core/api.client';

const _simulateProcessing = () => new Promise(resolve => setTimeout(resolve, 2000)); // 2s de tensión

export const checkoutService = {

  /**
   * Procesa un pago único o suscripción.
   * @param {Object} paymentData - Datos de facturación y tarjeta.
   * @returns {Promise<Object>} Resultado de la transacción.
   */
  async processPayment(paymentData) {
    // paymentData espera: { amount, currency, items, paymentMethodId, userEmail }

    // --- MODO MOCK (Simulación) ---
    if (IS_MOCK_MODE) {
      console.info('💳 [Checkout] Iniciando transacción simulada...', paymentData);
      
      await _simulateProcessing();

      // VALIDACIÓN SIMULADA
      // Si el monto es 0 o negativo, fallamos (Regla básica)
      if (paymentData.amount <= 0) {
        throw new Error("El monto a pagar es inválido.");
      }

      // SIMULACIÓN DE ÉXITO
      // En un entorno de pruebas real, aquí podrías poner lógica para 
      // simular tarjetas rechazadas (ej: si el nombre es 'REJECT_ME')
      return {
        success: true,
        transactionId: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        status: 'approved',
        timestamp: new Date().toISOString(),
        receiptUrl: '#'
      };
    }

    // --- MODO REAL (Stripe / MercadoPago) ---
    try {
      // Normalmente aquí se envía un token de tarjeta, no los números raw.
      return await apiClient.post('/payments/process', paymentData);
    } catch (error) {
      // Estandarizamos el error de pago para que la UI sepa qué mostrar
      const errorMessage = error.response?.data?.message || "La transacción fue rechazada por el banco.";
      throw new Error(errorMessage);
    }
  },

  /**
   * Valida un cupón de descuento.
   * @param {string} code 
   */
  async validateCoupon(code) {
    if (IS_MOCK_MODE) {
      await new Promise(r => setTimeout(r, 600));
      if (code === 'PROMO2026') {
        return { valid: true, discountPercent: 20, type: 'percent' };
      }
      throw new Error("Cupón inválido o expirado");
    }
    return apiClient.post('/payments/coupon/validate', { code });
  }
};