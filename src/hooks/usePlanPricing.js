import { useMemo } from 'react';
import { planes } from '../data/planes';

/**
 * HOOK: USE PLAN PRICING
 * ------------------------------------------------------------------
 * Motor de cálculo financiero para transiciones de planes (SaaS Logic).
 * * ESTRATEGIA DE NEGOCIO:
 * - Upgrade: Se cobra la diferencia (Prorrateo simplificado). PayNow = true.
 * - Downgrade: Se agenda el cambio. Precio $0. PayNow = false.
 * * @param {string} currentPlanId - ID del plan actual del usuario (ej: 'pro')
 * @param {string} targetPlanId - ID del plan que quiere comprar (ej: 'unlimited')
 */
export const usePlanPricing = (currentPlanId, targetPlanId) => {
  return useMemo(() => {
    // 1. Normalización y Búsqueda Segura (SSOT: planes.js)
    // Si el usuario no tiene plan, asumimos 'starter'
    const currentId = currentPlanId || 'starter';
    const currentPlan = planes.find(p => p.id === currentId) || planes.find(p => p.id === 'starter');
    const targetPlan = planes.find(p => p.id === targetPlanId);

    // Guard Clause: Si el plan destino no existe (Seguridad)
    if (!targetPlan) {
      return { type: 'ERROR', price: 0, payNow: false };
    }
    
    // Guard Clause: Si intenta comprar lo que ya tiene
    if (currentPlan.id === targetPlan.id) {
      return { type: 'CURRENT', price: 0, payNow: false };
    }

    // 2. Cálculo Financiero (Core Logic)
    // Upgrade si el nuevo cuesta más que el viejo
    const isUpgrade = targetPlan.price > currentPlan.price;
    
    // Diferencial: Cuánto más cuesta el nuevo plan
    // Math.max(0, ...) es un seguro para no dar precios negativos
    const priceDifference = Math.max(0, targetPlan.price - currentPlan.price);

    // 3. Definición de Estrategia
    if (isUpgrade) {
      return {
        type: 'UPGRADE',
        plan: targetPlan, // Devolvemos el objeto completo para usar sus datos
        price: priceDifference, // COBRAR ESTO (Diferencia)
        fullPrice: targetPlan.price, // Precio de lista (para tachar)
        payNow: true,
        effectiveDate: 'Inmediata',
        description: `Abonas solo la diferencia.`
      };
    } 
    
    // Caso DOWNGRADE (Precio menor)
    else {
      return {
        type: 'DOWNGRADE',
        plan: targetPlan,
        price: 0, // No se cobra nada ahora
        payNow: false,
        effectiveDate: 'Próximo ciclo',
        description: 'Mantienes tus beneficios actuales hasta fin de mes.'
      };
    }

  }, [currentPlanId, targetPlanId]);
};