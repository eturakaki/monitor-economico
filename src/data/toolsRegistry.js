import { 
  TrendingUp, 
  TrendingDown, // Agregado para Inflación USD
  PieChart, 
  ArrowRightLeft, 
  Banknote, 
  Calculator, 
  Landmark,
  Plane,
  ShoppingCart,
  Building,
  Briefcase,
  FileText,
  Truck,
  Globe,
  Zap,
  ShieldCheck,
  Scale,
  Percent,
  CreditCard,
  Home,
  Key,
  HardHat,
  Users,
  Map as MapIcon,
  Wallet,
  Clock,
  Recycle,
  ScrollText,
  Search,
  AlertTriangle,
  Layers,
  Car,
  LogIn,
  FileSignature,
  Laptop,
  ArrowUpCircle,
  Scissors,
  Gamepad2,
  CarFront,
  ShoppingBag,
  BrainCircuit,
  BarChart4,
  // --- NUEVOS ICONOS AGREGADOS ---
  Calendar,
  CalendarCheck,
  Activity,
  ListFilter
} from 'lucide-react';

/**
 * TOOLS REGISTRY (MASTER LIST)
 * Catálogo centralizado de las herramientas de MonitorEco.
 */

export const toolsRegistry = [
  
  // ===========================================================================
  // MÓDULO I: GESTIÓN DE INFLACIÓN Y PODER ADQUISITIVO
  // ===========================================================================
  {
    id: 'ajuste-inflacion',
    category: 'inflacion',
    title: 'Ajuste por Inflación',
    desc: 'La "Máquina del Tiempo". Trae valores históricos a moneda de hoy usando CER/UVA.',
    path: '/calculadoras/inflacion/ajuste',
    icon: TrendingUp,
    color: 'emerald',
    featured: true,
    badge: 'Esencial'
  },
  {
    id: 'mi-ipc',
    category: 'inflacion',
    title: 'Mi Inflación Personal',
    desc: 'Calcula tu propia tasa de inflación ponderando tus gastos reales vs INDEC.',
    path: '/calculadoras/inflacion/mi-ipc',
    icon: Percent,
    color: 'rose',
    featured: false
  },
  {
    id: 'salario-real',
    category: 'inflacion',
    title: 'Poder de Compra Salarial',
    desc: 'Proyecta tu sueldo neto real descontando cargas sociales e inflación futura (REM).',
    path: '/calculadoras/inflacion/salario-real',
    icon: Wallet,
    color: 'emerald',
    featured: false
  },
  {
    id: 'stockeo',
    category: 'inflacion',
    title: 'Stockearse vs. Invertir',
    desc: '¿Conviene comprar mercadería hoy o poner la plata en MercadoPago?',
    path: '/calculadoras/inflacion/stockeo',
    icon: ShoppingCart,
    color: 'blue',
    featured: true,
    badge: 'Ahorro'
  },
  {
    id: 'proyector-tarifas',
    category: 'inflacion',
    title: 'Proyector de Tarifas',
    desc: 'Estimación de aumentos en Luz/Gas según cuadros tarifarios y consumo.',
    path: '/calculadoras/inflacion/tarifas',
    icon: Zap,
    color: 'amber',
    featured: false
  },
  {
    id: 'canasta-regional',
    category: 'inflacion',
    title: 'Canasta Básica Regional',
    desc: 'Comparador de costo de vida entre provincias (Geo-arbitraje).',
    path: '/calculadoras/inflacion/canasta-regional',
    icon: MapIcon,
    color: 'cyan',
    featured: false
  },

  // ===========================================================================
  // MÓDULO II: INVERSIONES, TASAS Y ARBITRAJE (EXPANDIDO)
  // ===========================================================================
  {
    id: 'perfil-inversor',
    category: 'inversiones',
    title: 'Test del Inversor',
    desc: 'Descubrí tu perfil de riesgo y cómo debería conformarse tu cartera ideal.',
    path: '/test-inversor', // Ruta especial fuera de /calculadoras
    icon: BrainCircuit,
    color: 'indigo',
    featured: true,
    badge: 'Empezar acá'
  },
  {
    id: 'monitor-mercado',
    category: 'inversiones',
    title: 'Monitor de Mercado',
    desc: 'Tablero en tiempo real: Acciones, CEDEARs y Bonos (Panel de Cotizaciones).',
    path: '/calculadoras/inversiones/monitor',
    icon: Activity,
    color: 'violet',
    featured: true
  },
  {
    id: 'inflacion-usd',
    category: 'inversiones',
    title: 'Dólar Colchón vs. SPY',
    desc: 'Visualizá la erosión del poder de compra del dólar billete vs. inflación USA.',
    path: '/calculadoras/inversiones/inflacion-usd',
    icon: TrendingDown,
    color: 'rose',
    featured: false
  },
  {
    id: 'calculadora-retiro',
    category: 'inversiones',
    title: 'Simulador de Jubilación',
    desc: 'El poder del interés compuesto: Proyectá tu libertad financiera a largo plazo.',
    path: '/calculadoras/inversiones/retiro',
    icon: Landmark,
    color: 'emerald',
    featured: true
  },
  {
    id: 'bandas-cambiarias',
    category: 'inversiones',
    title: 'Bandas del Dólar',
    desc: 'Zonas de equilibrio teórico (Caro/Barato) del tipo de cambio según inflación.',
    path: '/calculadoras/inversiones/bandas',
    icon: BarChart4,
    color: 'cyan',
    featured: false,
    badge: 'Advanced'
  },
  {
    id: 'scanner-bonos',
    category: 'inversiones',
    title: 'Buscador de Bonos y ONs',
    desc: 'Filtrá por TIR, Paridad y Ley. Encontrá la mejor opción de renta fija.',
    path: '/calculadoras/inversiones/scanner-bonos',
    icon: ListFilter,
    color: 'slate',
    featured: false
  },
  {
    id: 'flujo-bonos',
    category: 'inversiones',
    title: 'Calendario de Bonos',
    desc: 'Cronograma mensual de cobro de cupones y amortizaciones de tu cartera.',
    path: '/calculadoras/inversiones/flujo-bonos',
    icon: CalendarCheck,
    color: 'blue',
    featured: false
  },
  {
    id: 'dividendos-cedears',
    category: 'inversiones',
    title: 'Calendario Dividendos',
    desc: 'Fechas de corte (Ex-Date), pago y Yield estimado de empresas (CEDEARs).',
    path: '/calculadoras/inversiones/dividendos',
    icon: Calendar,
    color: 'sky',
    featured: false
  },
  // --- Herramientas Anteriores del Módulo II ---
  {
    id: 'radar-liquidez',
    category: 'inversiones',
    title: 'Radar de Liquidez',
    desc: 'Billeteras Virtuales vs Plazo Fijo. ¿Costo de oportunidad de la liquidez?',
    path: '/calculadoras/inversiones/liquidez',
    icon: ArrowRightLeft,
    color: 'violet',
    featured: false
  },
  {
    id: 'plazo-fijo-uva',
    category: 'inversiones',
    title: 'Simulador PF UVA',
    desc: 'Análisis de Plazo Fijo UVA Precancelable vs Tradicional vs Inflación.',
    path: '/calculadoras/inversiones/plazo-fijo-uva',
    icon: Clock,
    color: 'violet',
    featured: false
  },
  {
    id: 'carry-trade',
    category: 'inversiones',
    title: 'Monitor de Carry Trade',
    desc: 'La "Bicicleta Financiera". Calcula el retorno en USD de inversiones en pesos.',
    path: '/calculadoras/inversiones/carry-trade',
    icon: Recycle,
    color: 'emerald',
    featured: false,
    badge: 'Riesgo'
  },
  {
    id: 'calculadora-bonos',
    category: 'inversiones',
    title: 'Calculadora de Bonos (Individual)',
    desc: 'TIR (YTM), Paridad y Cashflow de un bono específico.',
    path: '/calculadoras/inversiones/bonos',
    icon: ScrollText,
    color: 'slate',
    featured: false
  },
  {
    id: 'arbitraje-cedears',
    category: 'inversiones',
    title: 'Arbitraje de CEDEARs',
    desc: 'Detecta oportunidades comparando el CCL Implícito vs Mercado.',
    path: '/calculadoras/inversiones/cedears',
    icon: Globe,
    color: 'indigo',
    featured: false
  },
  {
    id: 'rutas-dolar',
    category: 'inversiones',
    title: 'Rutas de Dolarización',
    desc: 'Comparador de cotización final: MEP vs Cripto vs Blue vs Tarjeta.',
    path: '/calculadoras/inversiones/dolarizacion',
    icon: Banknote,
    color: 'emerald',
    featured: true
  },

  // ===========================================================================
  // MÓDULO III: CRÉDITO, DEUDA Y CONSUMO
  // ===========================================================================
  {
    id: 'simulador-cuotas',
    category: 'credito',
    title: 'Infleta: Cuotas vs Contado', // Actualizado título para reflejar "Infleta"
    desc: 'Calculadora de Costo Financiero Total. ¿Conviene cuotas con interés o cash?',
    path: '/calculadoras/credito/cuota-simple',
    icon: PieChart,
    color: 'blue',
    featured: true
  },
  {
    id: 'decodificador-cft',
    category: 'credito',
    title: 'Decodificador de CFT',
    desc: 'Revela el costo real oculto de préstamos y tarjetas (TNA vs CFT).',
    path: '/calculadoras/credito/cft',
    icon: Search,
    color: 'rose',
    featured: false
  },
  {
    id: 'bola-nieve',
    category: 'credito',
    title: 'Bola de Nieve (Tarjetas)',
    desc: 'Simula el impacto de pagar solo el mínimo de la tarjeta de crédito.',
    path: '/calculadoras/credito/bola-nieve',
    icon: AlertTriangle,
    color: 'rose',
    featured: false
  },
  {
    id: 'capacidad-endeudamiento',
    category: 'credito',
    title: 'Capacidad de Crédito',
    desc: 'Calcula tu límite máximo de cuota basado en tus ingresos netos.',
    path: '/calculadoras/credito/capacidad',
    icon: ShieldCheck,
    color: 'blue',
    featured: false
  },
  {
    id: 'consolidador-deudas',
    category: 'credito',
    title: 'Consolidador de Deudas',
    desc: 'Evalúa si conviene unificar varios préstamos en uno solo a mejor tasa.',
    path: '/calculadoras/credito/consolidacion',
    icon: Layers,
    color: 'indigo',
    featured: false
  },
  {
    id: 'simulador-prendario',
    category: 'credito',
    title: 'Simulador Prendario',
    desc: 'Comparativa UVA vs Tasa Fija para compra de automotores.',
    path: '/calculadoras/credito/prendarios',
    icon: Car,
    color: 'blue',
    featured: false
  },

  // ===========================================================================
  // MÓDULO IV: REAL ESTATE Y VIVIENDA
  // ===========================================================================
  {
    id: 'hipotecario-uva',
    category: 'inmobiliario',
    title: 'Simulador Hipotecario UVA',
    desc: 'Proyección de cuotas a 20/30 años bajo distintos escenarios de inflación.',
    path: '/calculadoras/inmobiliario/hipotecario-uva',
    icon: Home,
    color: 'cyan',
    featured: true,
    badge: 'Hot'
  },
  {
    id: 'comprar-alquilar',
    category: 'inmobiliario',
    title: '¿Comprar o Alquilar?',
    desc: 'Análisis financiero a 10 años comparando flujos de fondos.',
    path: '/calculadoras/inmobiliario/comprar-alquilar',
    icon: Scale,
    color: 'cyan',
    featured: false
  },
  {
    id: 'actualizador-alquiler',
    category: 'inmobiliario',
    title: 'Actualizador de Alquiler',
    desc: 'Calculadora oficial para contratos ICL, Casa Propia o IPC.',
    path: '/calculadoras/inmobiliario/alquiler',
    icon: Key,
    color: 'emerald',
    featured: true
  },
  {
    id: 'costos-ingreso',
    category: 'inmobiliario',
    title: 'Costos de Ingreso',
    desc: 'Calcula el total necesario para entrar: Mes, depósito, garantía, comisiones.',
    path: '/calculadoras/inmobiliario/inicio-alquiler',
    icon: LogIn,
    color: 'slate',
    featured: false
  },
  {
    id: 'rentabilidad-inmueble',
    category: 'inmobiliario',
    title: 'Rentabilidad Real (ROI)',
    desc: 'Calcula el retorno neto anual de una propiedad en alquiler.',
    path: '/calculadoras/inmobiliario/rentabilidad',
    icon: BarChart4,
    color: 'emerald',
    featured: false
  },
  {
    id: 'costo-construccion',
    category: 'inmobiliario',
    title: 'Índice Costo Construcción',
    desc: 'Actualización de valor m² y presupuesto de obra (CAC).',
    path: '/calculadoras/inmobiliario/construccion',
    icon: HardHat,
    color: 'orange',
    featured: false
  },
  {
    id: 'gastos-escritura',
    category: 'inmobiliario',
    title: 'Gastos de Escrituración',
    desc: 'Estimador de costos notariales, sellos e impuestos al comprar.',
    path: '/calculadoras/inmobiliario/escrituracion',
    icon: FileSignature,
    color: 'slate',
    featured: false
  },

  // ===========================================================================
  // MÓDULO V: FISCALIDAD, COMEX Y FREELANCING
  // ===========================================================================
  {
    id: 'monotributo',
    category: 'fiscal',
    title: 'Categorizador Monotributo',
    desc: 'Calcula tu categoría y cuota exacta según facturación y escalas vigentes.',
    path: '/calculadoras/fiscal/monotributo',
    icon: Users,
    color: 'orange',
    featured: true
  },
  {
    id: 'impuesto-ganancias',
    category: 'fiscal',
    title: 'Impuesto a las Ganancias',
    desc: 'Simulador de retenciones de 4ta categoría para empleados.',
    path: '/calculadoras/fiscal/ganancias',
    icon: Calculator,
    color: 'red',
    featured: false
  },
  {
    id: 'exportacion-servicios',
    category: 'fiscal',
    title: 'El Blend Freelancer',
    desc: 'Calculadora de tipo de cambio efectivo para exportadores de servicios.',
    path: '/calculadoras/fiscal/exportacion',
    icon: Laptop,
    color: 'indigo',
    featured: false
  },
  {
    id: 'importaciones-courier',
    category: 'fiscal',
    title: 'Calculadora Courier',
    desc: 'Estima impuestos de Aduana para compras puerta a puerta.',
    path: '/calculadoras/fiscal/importaciones',
    icon: Truck,
    color: 'slate',
    featured: false
  },
  {
    id: 'grossing-up',
    category: 'fiscal',
    title: 'Calculadora Inversa (Grossing Up)',
    desc: '¿Cuánto facturar para recibir un monto neto específico?',
    path: '/calculadoras/fiscal/grossing-up',
    icon: ArrowUpCircle,
    color: 'emerald',
    featured: false
  },
  {
    id: 'retenciones-sircreb',
    category: 'fiscal',
    title: 'Predictor SIRCREB',
    desc: 'Estima las retenciones bancarias automáticas de IIBB.',
    path: '/calculadoras/fiscal/sircreb',
    icon: Scissors,
    color: 'red',
    featured: false
  },

  // ===========================================================================
  // MÓDULO VI: ECONOMÍA DOMÉSTICA Y ESTILO DE VIDA
  // ===========================================================================
  {
    id: 'dolar-tarjeta',
    category: 'vida',
    title: 'Dólar Tarjeta & Qatar',
    desc: 'Detecta si te pasas del cupo de 300 USD y calcula impuestos PAIS/Ganancias.',
    path: '/calculadoras/vida/dolar-tarjeta',
    icon: CreditCard,
    color: 'cyan',
    featured: true,
    badge: 'Nuevo'
  },
  {
    id: 'planificador-viajes',
    category: 'vida',
    title: 'Presupuesto de Viaje',
    desc: 'Calculadora de vacaciones: Vuelos + Hotel + Comida a pesos hoy.',
    path: '/calculadoras/vida/viajes',
    icon: Plane,
    color: 'sky',
    featured: false
  },
  {
    id: 'suscripciones',
    category: 'vida',
    title: 'Suscripciones Digitales',
    desc: 'Calcula el precio final con 59% de impuestos (Netflix, Spotify, Steam).',
    path: '/calculadoras/vida/suscripciones',
    icon: Gamepad2,
    color: 'violet',
    featured: false
  },
  {
    id: 'optimizador-ofertas',
    category: 'vida',
    title: 'Optimizador de Ofertas',
    desc: 'Comparador real: ¿Conviene 3x2, 2x1 o 80% en la 2da unidad?',
    path: '/calculadoras/vida/ofertas',
    icon: ShoppingBag,
    color: 'pink',
    featured: false
  },

  // ===========================================================================
  // MÓDULO VII: HERRAMIENTAS CORPORATIVAS
  // ===========================================================================
  {
    id: 'descuento-cheques',
    category: 'corporativo',
    title: 'Descuento de Cheques',
    desc: 'Calculadora de valor neto al descontar un E-qCheck en mercado o banco.',
    path: '/calculadoras/corporativo/cheques',
    icon: FileText,
    color: 'slate',
    featured: false
  },
  {
    id: 'simulador-montecarlo',
    category: 'corporativo',
    title: 'Simulador Montecarlo',
    desc: 'Proyección probabilística de portafolios de inversión (Avanzado).',
    path: '/calculadoras/corporativo/montecarlo',
    icon: BrainCircuit,
    color: 'indigo',
    featured: false,
    badge: 'Beta'
  }
];

// Helper para obtener etiquetas de categorías legibles
export const categoryLabels = {
  inflacion: 'Inflación y Precios',
  inversiones: 'Inversiones y Tasas',
  credito: 'Financiamiento y Deuda',
  inmobiliario: 'Real Estate y Propiedades',
  fiscal: 'Impuestos y Freelancing',
  vida: 'Estilo de Vida y Viajes',
  corporativo: 'Tesorería PyME'
};