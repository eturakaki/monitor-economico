/**
 * --------------------------------------------------------------------------
 * FINANCIAL MATH ENGINE (MonitorEco Core)
 * --------------------------------------------------------------------------
 * Biblioteca centralizada de algoritmos financieros.
 * Arquitectura: Funciones puras que reciben parámetros y devuelven números.
 * Sin efectos secundarios (No UI, No API calls).
 */

export const financial = {
  
  // =========================================================================
  // UTILS: Helpers Generales
  // =========================================================================
  utils: {
    // Calcula variación porcentual entre dos números
    percentChange: (initial, final) => {
      if (initial === 0) return 0;
      return ((final - initial) / initial) * 100;
    },
    // Normaliza tasas (TNA Anual -> Tasa Efectiva para X días)
    proportionalRate: (tna, days) => (tna / 100) * (days / 365),
  },

  // =========================================================================
  // MÓDULO I: INFLACIÓN
  // =========================================================================
  inflation: {
    // Máquina del Tiempo (Ajuste CER/UVA)
    historicalAdjust: (amount, indexStart, indexEnd) => {
      if (!indexStart || indexStart === 0) return amount;
      return amount * (indexEnd / indexStart);
    },

    // Mi IPC (Inflación Ponderada)
    // items: [{ gasto: 50000, inflacionCategoria: 10 }, ...]
    personalInflation: (items) => {
      const totalSpend = items.reduce((acc, item) => acc + item.gasto, 0);
      if (totalSpend === 0) return 0;
      
      const weightedSum = items.reduce((acc, item) => {
        return acc + (item.gasto * item.inflacionCategoria);
      }, 0);
      
      return weightedSum / totalSpend; // Inflación promedio ponderada
    },

    // Salario Real Futuro
    // salarioActual: Neto hoy
    // inflacionEsperada: % mensual acumulado proyectado
    realSalaryProjected: (salary, inflationRate) => {
      return salary / (1 + (inflationRate / 100));
    },

    // Stockeo vs Plazo Fijo (Costo de Oportunidad)
    // savings: Lo que ahorras comprando hoy vs mes que viene
    // capital: Lo que gastas hoy
    // rate: Tasa mensual del PF
    shouldStock: (savings, capital, monthlyRate) => {
      const opportunityCost = capital * (monthlyRate / 100);
      return {
        savings,
        opportunityCost,
        decision: savings > opportunityCost ? 'STOCK' : 'INVEST'
      };
    }
  },

  // =========================================================================
  // MÓDULO II: INVERSIONES
  // =========================================================================
  investments: {
    // Interés Compuesto
    compoundInterest: (principal, rate, timeInYears) => {
      return principal * Math.pow((1 + rate / 100), timeInYears);
    },

    // Tasa Real (Fisher Equation) -> (1+n) = (1+r)(1+i)
    realRate: (nominalRate, inflationRate) => {
      return (((1 + nominalRate / 100) / (1 + inflationRate / 100)) - 1) * 100;
    },

    // Arbitraje CEDEARs
    // ratio: Ej 10 (10:1)
    cedearImpliedCCL: (localPrice, usPrice, ratio) => {
      if (usPrice === 0) return 0;
      return (localPrice * ratio) / usPrice;
    },

    // Carry Trade (Retorno en USD)
    // capitalArs: Inversión inicial
    // tna: Tasa en pesos
    // days: Duración
    // fxStart: Dólar entrada
    // fxEnd: Dólar salida (esperado)
    carryTradeYield: (capitalArs, tna, days, fxStart, fxEnd) => {
      const interest = capitalArs * (tna / 100) * (days / 365);
      const totalArs = capitalArs + interest;
      const initialUsd = capitalArs / fxStart;
      const finalUsd = totalArs / fxEnd;
      const yieldUsd = finalUsd - initialUsd;
      const yieldPercent = (yieldUsd / initialUsd) * 100;
      
      return { finalUsd, yieldUsd, yieldPercent };
    },

    // Paridad de Bonos
    parity: (marketPrice, technicalValue) => {
      if (technicalValue === 0) return 0;
      return (marketPrice / technicalValue) * 100;
    }
  },

  // =========================================================================
  // MÓDULO III: CRÉDITO
  // =========================================================================
  credit: {
    // Sistema Francés (Cuota Fija)
    frenchAmortization: (principal, annualRate, months) => {
      if (annualRate === 0) return principal / months;
      const r = (annualRate / 100) / 12; // Tasa mensual
      const numerator = principal * r * Math.pow(1 + r, months);
      const denominator = Math.pow(1 + r, months) - 1;
      return numerator / denominator;
    },

    // Bola de Nieve (Pago Mínimo)
    // balance: Deuda total
    // minPayment: Pago mínimo realizado
    // tna: Tasa de refinanciación
    snowballProjection: (balance, minPayment, tna, months = 12) => {
      let currentBalance = balance;
      const monthlyRate = (tna / 100) / 12;
      const projection = [];

      for (let i = 1; i <= months; i++) {
        const interest = currentBalance * monthlyRate;
        // Si el pago mínimo no cubre intereses, la deuda crece exponencialmente
        const newBalance = currentBalance - minPayment + interest; 
        projection.push({ month: i, balance: newBalance, interest });
        currentBalance = newBalance;
      }
      return projection;
    },

    // CFT Real (Estimado)
    // Agrega IVA sobre intereses y seguros
    calculateCFT: (tna, vatRate = 21, insuranceRate = 3) => {
      const effectiveRate = tna * (1 + (vatRate / 100)) + insuranceRate;
      return effectiveRate; // Aproximación lineal
    },

    // Capacidad de Endeudamiento
    borrowingCapacity: (netIncome, limitPercent = 30) => {
      return netIncome * (limitPercent / 100);
    }
  },

  // =========================================================================
  // MÓDULO IV: REAL ESTATE
  // =========================================================================
  realEstate: {
    // Rentabilidad Bruta (ROI)
    grossYield: (annualRent, propertyPrice) => {
      if (propertyPrice === 0) return 0;
      return (annualRent / propertyPrice) * 100;
    },

    // Costo de Construcción
    constructionBudget: (areaM2, costM2) => {
      return areaM2 * costM2;
    },

    // Actualización Alquiler (ICL/IPC)
    updateRent: (baseRent, indexNow, indexStart) => {
      if (indexStart === 0) return baseRent;
      return baseRent * (indexNow / indexStart);
    },

    // Costos de Ingreso (Estimación)
    entryCosts: (rentValue, expenses = 0, warrantyCost = 0) => {
      return {
        monthAdvance: rentValue,
        deposit: rentValue, 
        warranty: warrantyCost,
        expenses: expenses, // <--- AHORA SE USA AQUÍ (Visualización)
        commission: rentValue * 0, // A revisar según Ley de Alquileres vigente
        total: (rentValue * 2) + warrantyCost + expenses // <--- Y SE SUMA AL TOTAL
      };
    }
  },

  // =========================================================================
  // MÓDULO V: FISCAL
  // =========================================================================
  fiscal: {
    // Grossing Up (Factura Inversa)
    // ¿Cuánto tengo que facturar para que me queden X pesos limpios?
    // taxRate: % total de descuentos (IIBB + Monotributo prorrateado)
    grossingUp: (netDesired, taxRate) => {
      return netDesired / (1 - (taxRate / 100));
    },

    // Importación Courier
    // FOB: Valor producto
    // Shipping: Envío
    importTaxes: (fob, shipping) => {
      const totalBase = fob + shipping;
      // Franquicia USD 50 (simplificada para ejemplo)
      // Si pasa de 50, paga 50% sobre excedente
      const taxable = Math.max(0, totalBase - 50); 
      const tax = taxable * 0.5;
      return { totalBase, tax, finalPrice: totalBase + tax };
    },

    // Blend Exportador (80/20)
    exportBlend: (amountUsd, officialFx, cclFx) => {
      return (amountUsd * 0.8 * officialFx) + (amountUsd * 0.2 * cclFx);
    }
  },

  // =========================================================================
  // MÓDULO VI: LIFESTYLE
  // =========================================================================
  lifestyle: {
    // Costo Suscripción (Netflix/Spotify)
    // baseUsd: Precio en dólares
    // officialFx: Cotización oficial
    // taxPercent: Suma de impuestos (PAIS, Ganancias, etc ~60%)
    subscriptionPrice: (baseUsd, officialFx, taxPercent = 60) => {
      return baseUsd * officialFx * (1 + (taxPercent / 100));
    },

    // Optimizador Supermercado
    // Promo "Llevá 3 pagá 2" -> Discount real 33.33%
    promo3x2: (unitPrice) => {
      const quantity = 3;
      const paid = 2;
      const total = unitPrice * paid;
      const realUnitPrice = total / quantity;
      const discount = ((unitPrice - realUnitPrice) / unitPrice) * 100;
      return { total, realUnitPrice, discount };
    },

    promo2nd70: (unitPrice) => {
      // 1ra al 100%, 2da al 30% -> Total 130% por 2 unidades
      const quantity = 2;
      const total = unitPrice * 1.3;
      const realUnitPrice = total / quantity;
      const discount = ((unitPrice - realUnitPrice) / unitPrice) * 100;
      return { total, realUnitPrice, discount };
    }
  },

  // =========================================================================
  // MÓDULO VII: CORPORATIVO
  // =========================================================================
  corporate: {
    // Descuento de Cheques
    // amount: Valor nominal
    // tna: Tasa de descuento
    // days: Días hasta vencimiento
    checkDiscount: (amount, tna, days, commissionPercent = 0) => {
      const discountFactor = (tna / 100) * (days / 365);
      const interest = amount * discountFactor;
      const commission = amount * (commissionPercent / 100);
      const netValue = amount - interest - commission;
      return { netValue, interest, commission, effectiveRate: (1 - (netValue/amount)) * 100 };
    }
  }
};