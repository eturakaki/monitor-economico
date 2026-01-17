// src/data/dataGlosario.js
import { 
  Coins, Landmark, PieChart, ShoppingCart, TrendingUp, 
  Users, Activity, Building2, Globe, Wallet, 
  ScrollText, CreditCard, Scale
} from 'lucide-react';

/* ========================================================================
   1. SECTORES ECONÓMICOS (9 CATEGORÍAS TOTALES)
   ======================================================================== */
export const sectores = [
  // 1. MERCADO CAMBIARIO
  { 
    titulo: "Mercado Cambiario", 
    id: "cambiario",
    color: "emerald", 
    bgHeader: "bg-emerald-50",
    textHeader: "text-emerald-700",
    Icono: Coins, 
    items: [
      {
        nombre: "Dólar Blue",
        definicion: "Tipo de cambio informal que se opera fuera del sistema bancario ('cuevas'). Su valor depende puramente de la oferta y demanda entre privados.",
        formula: "Precio de mercado libre (Oferta vs Demanda)",
        importancia: "Es el termómetro de la incertidumbre y la referencia de precios para muchos comercios y servicios."
      },
      {
        nombre: "Dólar MEP (Bolsa)",
        definicion: "Tipo de cambio legal que se obtiene comprando un bono en pesos (ej: AL30) y vendiéndolo en dólares (AL30D) dentro de Argentina.",
        formula: "Precio Bono Pesos / Precio Bono Dólares",
        importancia: "Permite dolarizarse de forma legal y blanca a empresas y particulares."
      },
      {
        nombre: "Dólar CCL (Contado con Liqui)",
        definicion: "Similar al MEP pero permite transferir los dólares a una cuenta en el exterior. Es el dólar de las empresas.",
        formula: "Precio Activo Local / Precio Activo Exterior (ADR)",
        importancia: "Es la referencia para fijar precios de productos transables y grandes movimientos de capital."
      },
      {
        nombre: "Brecha Cambiaria",
        definicion: "Diferencia porcentual entre el dólar oficial (mayorista) y los dólares paralelos (Blue, MEP o CCL).",
        formula: "((Dólar Paralelo - Oficial) / Oficial) * 100",
        importancia: "Una brecha alta genera expectativas de devaluación e incentiva a no liquidar exportaciones."
      },
      {
        nombre: "Carry Trade",
        definicion: "Estrategia ('Bicicleta') de vender dólares, invertir en pesos a tasa alta y recomprar divisas luego, buscando ganar en moneda dura.",
        formula: "Tasa en Pesos vs Devaluación del Dólar",
        importancia: "Genera estabilidad cambiaria a corto plazo ('veranito'), pero riesgo de salto si se desarma rápido."
      }
    ] 
  },

  // 2. INVERSIONES Y BOLSA (NUEVO)
  { 
    titulo: "Inversiones y Bolsa", 
    id: "inversiones",
    color: "slate", 
    bgHeader: "bg-slate-100",
    textHeader: "text-slate-700",
    Icono: ScrollText, 
    items: [
      {
        nombre: "TIR (Tasa Interna de Retorno)",
        definicion: "Rentabilidad anual promedio de un bono si se mantiene hasta el final (Finish), reinvirtiendo todos los cupones.",
        formula: "Tasa que iguala precio actual con flujos futuros",
        importancia: "Es el dato clave para comparar bonos. A mayor riesgo país, los bonos rinden más (TIR alta)."
      },
      {
        nombre: "Paridad (Bonos)",
        definicion: "Porcentaje del valor técnico que se paga por un bono. Si vale 100% está 'a la par'.",
        formula: "(Precio de Mercado / Valor Técnico) * 100",
        importancia: "Una paridad baja (ej: 40%) implica descuento y potencial de suba si la economía mejora."
      },
      {
        nombre: "CEDEARs",
        definicion: "Certificados que representan acciones extranjeras (Apple, Coca-Cola) y cotizan en pesos en la bolsa local.",
        formula: "Precio Acción EEUU x CCL x Ratio",
        importancia: "Permiten invertir en Wall Street desde Argentina y cubrirse de la suba del dólar (CCL)."
      },
      {
        nombre: "Dividend Yield",
        definicion: "Rentabilidad que paga una empresa a sus accionistas en forma de dividendos anuales.",
        formula: "(Dividendos por acción / Precio acción) * 100",
        importancia: "Clave para estrategias de ingresos pasivos (Flujo de fondos)."
      }
    ] 
  },

  // 3. CRÉDITO Y FINANCIAMIENTO (NUEVO)
  { 
    titulo: "Crédito y Deuda", 
    id: "credito",
    color: "rose", 
    bgHeader: "bg-rose-50",
    textHeader: "text-rose-700",
    Icono: CreditCard, 
    items: [
      {
        nombre: "CFT (Costo Financiero Total)",
        definicion: "El costo REAL de un préstamo. Incluye Tasa (TNA) + Seguros + Gastos + Impuestos.",
        formula: "TNA + IVA + Seguros + Administrativos",
        importancia: "Es el único número que importa al pedir un préstamo. La TNA suele ser engañosa."
      },
      {
        nombre: "TNA vs TEA",
        definicion: "TNA es la tasa nominal. TEA es la tasa efectiva que incluye el interés compuesto (interés sobre interés).",
        formula: "TEA siempre es mayor a TNA en pagos mensuales",
        importancia: "Si financiás la tarjeta, la deuda crece a velocidad TEA (exponencial)."
      },
      {
        nombre: "Sistema Francés",
        definicion: "Método de amortización donde la cuota es constante, pero al principio se pagan muchos intereses y poco capital.",
        formula: "Cuota Fija = Interés decreciente + Capital creciente",
        importancia: "Es el sistema estándar de préstamos personales e hipotecas en Argentina."
      }
    ] 
  },

  // 4. SECTOR MONETARIO (ORIGINAL + ENRIQUECIDO)
  { 
    titulo: "Sector Monetario", 
    id: "monetario",
    color: "blue", 
    bgHeader: "bg-blue-50",
    textHeader: "text-blue-700",
    Icono: Landmark, 
    items: [
      {
        nombre: "Base Monetaria",
        definicion: "Dinero de alta potencia: Billetes en la calle + Reservas de los bancos en el BCRA.",
        formula: "Circulante + Encajes",
        importancia: "Variable que controla el BCRA. Si crece más rápido que la demanda, genera inflación."
      },
      {
        nombre: "Pasivos Remunerados (Leliq/Pases/LeCap)",
        definicion: "Deuda que emite el BCRA o Tesoro para retirar pesos del mercado y evitar que vayan a precios.",
        formula: "Stock de Letras + Pases Pasivos",
        importancia: "Generan 'emisión futura' (endógena) por el pago de intereses."
      },
      {
        nombre: "Reservas Netas",
        definicion: "Dólares que realmente son propiedad del BCRA, descontando préstamos (Swap China, Encajes de ahorristas).",
        formula: "Reservas Brutas - Pasivos en Moneda Extranjera",
        importancia: "Indica el verdadero poder de fuego del Banco Central para intervenir."
      }
    ] 
  },

  // 5. SECTOR FINANCIERO (ORIGINAL)
  { 
    titulo: "Sector Financiero", 
    id: "financiero",
    color: "indigo", 
    bgHeader: "bg-indigo-50",
    textHeader: "text-indigo-700",
    Icono: Building2, 
    items: [
      {
        nombre: "Tasa BADLAR",
        definicion: "Tasa promedio que pagan los bancos por plazos fijos mayoristas (> $1 millón).",
        formula: "Promedio ponderado de tasas pasivas grandes",
        importancia: "Referencia para créditos corporativos y grandes inversores."
      },
      {
        nombre: "Préstamos al Sector Privado",
        definicion: "Volumen total de crédito que los bancos otorgan a empresas y familias.",
        formula: "Stock de préstamos (Pesos + Dólares)",
        importancia: "Motor de la economía real. Si crece, hay inversión y consumo."
      },
      {
        nombre: "Depósitos en Pesos",
        definicion: "Dinero del sector privado dentro de los bancos (Plazos Fijos, Cajas de Ahorro).",
        formula: "Depósitos a la vista + A plazo",
        importancia: "Mide la confianza en el sistema y la demanda de dinero."
      }
    ] 
  },

  // 6. PRECIOS E INFLACIÓN (ORIGINAL + ENRIQUECIDO)
  { 
    titulo: "Precios e Inflación", 
    id: "precios",
    color: "orange", 
    bgHeader: "bg-orange-50",
    textHeader: "text-orange-700",
    Icono: TrendingUp, 
    items: [
      {
        nombre: "IPC (Índice de Precios al Consumidor)",
        definicion: "Mide la variación mensual de una canasta de bienes y servicios representativa.",
        formula: "Variación % mensual",
        importancia: "Medida oficial de la inflación que afecta el bolsillo."
      },
      {
        nombre: "Inflación Núcleo (Core)",
        definicion: "Inflación 'pura', excluyendo precios regulados (tarifas) y estacionales. Muestra la tendencia real.",
        formula: "IPC - (Regulados + Estacionales)",
        importancia: "Es la métrica que mira el Banco Central para la tasa de interés."
      },
      {
        nombre: "UVA / CER",
        definicion: "Unidad que se ajusta diariamente según la inflación pasada (Coeficiente CER).",
        formula: "Ajuste por IPC del mes anterior",
        importancia: "Permite créditos y contratos de largo plazo en contextos de alta inflación."
      }
    ] 
  },

  // 7. SECTOR FISCAL (ORIGINAL + ENRIQUECIDO)
  { 
    titulo: "Sector Fiscal", 
    id: "fiscal",
    color: "purple", 
    bgHeader: "bg-purple-50",
    textHeader: "text-purple-700",
    Icono: PieChart, 
    items: [
      {
        nombre: "Resultado Primario",
        definicion: "Diferencia entre ingresos y gastos del Estado, ANTES de pagar intereses de deuda.",
        formula: "Ingresos - Gastos Operativos",
        importancia: "Indica si el Estado es solvente en su funcionamiento diario."
      },
      {
        nombre: "Resultado Financiero",
        definicion: "Resultado final de las cuentas públicas ('la línea de abajo'), incluyendo pago de intereses.",
        formula: "Resultado Primario - Intereses de Deuda",
        importancia: "Determina cuánto dinero real necesita pedir prestado el país."
      },
      {
        nombre: "Presión Tributaria",
        definicion: "Porcentaje del PBI que el Estado se lleva en impuestos.",
        formula: "(Recaudación Total / PBI) * 100",
        importancia: "Mide el peso del Estado sobre el sector privado."
      }
    ] 
  },

  // 8. ACTIVIDAD ECONÓMICA (ORIGINAL)
  { 
    titulo: "Actividad Económica", 
    id: "actividad",
    color: "cyan", 
    bgHeader: "bg-cyan-50",
    textHeader: "text-cyan-700",
    Icono: Activity, 
    items: [
      {
        nombre: "EMAE",
        definicion: "Estimador Mensual de Actividad Económica. Anticipo mensual del PBI.",
        formula: "Índice de volumen físico (Base 2004=100)",
        importancia: "Permite ver mes a mes si la economía crece o entra en recesión."
      },
      {
        nombre: "Capacidad Instalada",
        definicion: "Porcentaje de la infraestructura industrial (fábricas) que se está usando.",
        formula: "(Producción Actual / Potencial) * 100",
        importancia: "Si es baja hay desempleo. Si es muy alta puede haber inflación por cuellos de botella."
      },
      {
        nombre: "ISAC (Construcción)",
        definicion: "Indicador de actividad de la construcción (cemento, hierro, ladrillos).",
        formula: "Despachos de insumos",
        importancia: "La construcción es gran generadora de empleo rápido."
      }
    ] 
  },

  // 9. SECTOR EXTERNO (ORIGINAL)
  { 
    titulo: "Sector Externo", 
    id: "externo",
    color: "rose", 
    bgHeader: "bg-rose-50",
    textHeader: "text-rose-700",
    Icono: Globe, 
    items: [
      {
        nombre: "Balanza Comercial",
        definicion: "Saldo neto de dólares por intercambio de bienes (Exportaciones vs Importaciones).",
        formula: "Expo (FOB) - Impo (CIF)",
        importancia: "Principal fuente genuina de divisas para el país."
      },
      {
        nombre: "Términos de Intercambio",
        definicion: "Relación de precios: ¿Cuánto compramos con lo que vendemos?",
        formula: "(Precios Expo / Precios Impo) * 100",
        importancia: "Si mejora, al país le entran más dólares por el mismo esfuerzo ('Viento de cola')."
      },
      {
        nombre: "Exportaciones Agrícolas",
        definicion: "Ventas al exterior del complejo agro (Soja, Maíz, Trigo).",
        formula: "Volumen x Precio Internacional",
        importancia: "Generan la mayor parte de los dólares de la economía."
      }
    ] 
  }
];

/* ========================================================================
   2. FÓRMULAS METODOLÓGICAS (Fusión de Originales + Nuevas)
   ======================================================================== */
export const calculos = [
  {
    titulo: "Interés Compuesto",
    formula: "VF = VI x (1 + r)^n",
    ejemplo: "La base de la riqueza: Invertir u$s 1.000 al 10% anual por 30 años se convierte en u$s 17.449."
  },
  {
    titulo: "Tasa de Interés Real",
    formula: "Tasa Real = ((1 + Tasa Nominal) / (1 + Inflación)) - 1",
    ejemplo: "Si Plazo Fijo paga 10% y la inflación es 8%, ganaste 1.8% real."
  },
  {
    titulo: "Brecha Cambiaria",
    formula: "((Dólar Paralelo - Oficial) / Oficial) x 100",
    ejemplo: "Si Blue = 1200 y Oficial = 800, la brecha es 50%."
  },
  {
    titulo: "Base Monetaria en Dólares",
    formula: "BM en U$D = Base Monetaria (Pesos) / Dólar CCL",
    ejemplo: "Muestra cuántos dólares 'de verdad' respaldan a todos los pesos circulantes."
  },
  {
    titulo: "Rentabilidad de Alquiler",
    formula: "(Alquiler Anual / Valor Propiedad) x 100",
    ejemplo: "Un depto de u$s 100k alquilado a u$s 400/mes rinde 4.8% bruto anual."
  },
  {
    titulo: "Resultado Primario vs Financiero",
    formula: "Financiero = Primario - Intereses de Deuda",
    ejemplo: "Podés tener superávit operativo pero déficit final si pagás muchos intereses."
  }
];

/* ========================================================================
   3. DICCIONARIO GENERAL (Buscador: Originales + Nuevos)
   ======================================================================== */
export const terminos = [
  { id: 'leliq', titulo: 'Leliq', definicion: 'Letras de Liquidez del BCRA. Instrumento de regulación monetaria exclusivo para bancos.' },
  { id: 'base', titulo: 'Base Monetaria', definicion: 'Dinero de alta potencia: Billetes en la calle + Reservas de los bancos en el BCRA.' },
  { id: 'mep', titulo: 'Dólar MEP', definicion: 'Dólar Bolsa. Se consigue comprando y vendiendo bonos legalmente en el mercado local.' },
  { id: 'ccl', titulo: 'Dólar CCL', definicion: 'Contado con Liqui. Similar al MEP pero permite transferir los dólares al exterior.' },
  { id: 'emae', titulo: 'EMAE', definicion: 'Estimador Mensual de Actividad Económica. Anticipo mensual del PBI.' },
  { id: 'riesgo', titulo: 'Riesgo País', definicion: 'Sobretasa que paga Argentina para endeudarse comparado con los bonos de EE.UU.' },
  
  // Nuevos términos agregados
  { id: 'tir', titulo: 'TIR (Bono)', definicion: 'Tasa Interna de Retorno. Rendimiento anualizado esperado de un bono si se mantiene a finish.' },
  { id: 'cft', titulo: 'CFT', definicion: 'Costo Financiero Total. El verdadero precio de un préstamo (Tasa + Gastos + Impuestos).' },
  { id: 'cedear', titulo: 'CEDEAR', definicion: 'Certificado de acciones extranjeras que cotiza en pesos en Argentina.' },
  { id: 'carry', titulo: 'Carry Trade', definicion: 'Bicicleta financiera: ganar tasa en pesos apostando a un dólar estable.' },
  { id: 'uva', titulo: 'UVA', definicion: 'Unidad de Valor Adquisitivo que ajusta diariamente por inflación (CER).' },
  { id: 'stoploss', titulo: 'Stop Loss', definicion: 'Orden automática para vender un activo si baja de cierto precio y limitar pérdidas.' },
  { id: 'bullmarket', titulo: 'Bull Market', definicion: 'Mercado alcista. Tendencia general de suba de precios en la bolsa.' }
];