import { z } from 'zod';

/**
 * ESQUEMAS DE VALIDACIÓN DE CHECKOUT
 * Estrategia: Polimorfismo.
 * - Base: Datos que SIEMPRE necesitamos (Facturación/Fraude).
 * - Shipping: Datos que SOLO necesitamos para físicos.
 */

// 1. Esquema Base (Facturación + Pago)
// Estos datos son obligatorios SIEMPRE para procesar la tarjeta y facturar.
export const billingSchema = z.object({
  fullName: z.string().min(3, "El nombre completo es obligatorio"),
  email: z.string().email("Ingresa un email válido"),
  // Datos Fiscales / Billing Address simplificada
  dni: z.string().min(6, "DNI/CUIT necesario para facturación").optional(), // Opcional según tu rigor
  billingAddress: z.string().min(5, "La dirección de facturación es obligatoria"), 
  billingCity: z.string().min(2, "Ciudad requerida"),
  billingZip: z.string().min(3, "CP requerido"),
  
  // Datos de Tarjeta (Validación básica de formato, el procesador hace el resto)
  cardNumber: z.string().min(15, "Número de tarjeta inválido").max(19),
  expiry: z.string().length(5, "Formato MM/AA requerido"), // Ej: 12/25
  cvc: z.string().min(3, "Código de 3 o 4 dígitos").max(4),
});

// 2. Esquema de Envío (Logística)
// Solo se activa si requiresShipping === true
export const shippingSchema = z.object({
  shippingAddress: z.string().min(5, "Calle y altura requeridas para el envío"),
  shippingCity: z.string().min(2, "Ciudad de envío requerida"),
  shippingZip: z.string().min(3, "Código postal de envío requerido"),
  shippingNotes: z.string().optional() // "Dejar en portería", etc.
});

// Helper para fusionar condicionalmente
export const getCheckoutSchema = (requiresShipping) => {
  if (requiresShipping) {
    return billingSchema.merge(shippingSchema);
  }
  return billingSchema;
};