/**
 * SSOT: CATÁLOGO DE PRODUCTOS (Academia & Librería)
 * ----------------------------------------------------------------------
 * Centralizamos todo aquí para facilitar el Carrito de Compras y el Buscador.
 */

export const products = [
  // --- CURSOS ---
  {
    id: 'c-bonos-master',
    type: 'curso', // <--- ESTO ES LA CLAVE PARA FILTRAR
    title: 'Maestría en Bonos y Renta Fija',
    shortDescription: 'Estrategias avanzadas de curva de rendimientos y arbitraje.',
    author: 'Iñaki Etura',
    price: 45000,
    discountPrice: 38000, 
    rating: 4.9,
    reviewsCount: 1240,
    image: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?q=80&w=800&auto=format&fit=crop',
    tags: ['Renta Fija', 'Avanzado', 'MEP'],
    badge: 'Bestseller',
    meta: {
      duration: '12 Horas',
      level: 'Avanzado',
      modules: 24,
      access: 'De por vida',
      certificate: true
    }
  },
  {
    id: 'c-cedears-expert',
    type: 'curso',
    title: 'Analista de Cedears y Acciones',
    shortDescription: 'Aprende a valuar empresas (Valuation) y leer balances.',
    author: 'Equipo MonitorEco',
    price: 32000,
    discountPrice: null, 
    rating: 4.7,
    reviewsCount: 850,
    image: 'https://images.unsplash.com/photo-1611974765270-ca12586343bb?q=80&w=800&auto=format&fit=crop',
    tags: ['Renta Variable', 'Wall Street'],
    badge: 'Nuevo',
    meta: {
      duration: '8 Horas',
      level: 'Intermedio',
      modules: 12,
      access: 'De por vida',
      certificate: true
    }
  },
  
  // --- LIBROS ---
  {
    id: 'l-psicologia-dinero',
    type: 'libro', // <--- CLAVE PARA FILTRAR
    title: 'La Psicología del Dinero',
    shortDescription: 'Lecciones eternas sobre riqueza, codicia y felicidad.',
    author: 'Morgan Housel',
    price: 18500,
    discountPrice: null,
    rating: 5.0,
    reviewsCount: 3200,
    image: 'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?q=80&w=800&auto=format&fit=crop',
    tags: ['Mindset', 'Finanzas Personales'],
    meta: {
      pages: 240,
      format: 'Físico + Ebook',
      stock: 15,
      delivery: 'Envío Gratis',
    }
  },
  {
    id: 'l-inversor-inteligente',
    type: 'libro',
    title: 'El Inversor Inteligente',
    shortDescription: 'La biblia del Value Investing recomendada por Warren Buffett.',
    author: 'Benjamin Graham',
    price: 22000,
    discountPrice: 19500,
    rating: 4.8,
    reviewsCount: 5100,
    image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=800&auto=format&fit=crop',
    tags: ['Clásico', 'Value Investing'],
    meta: {
      pages: 600,
      format: 'Tapa Dura',
      stock: 5,
      delivery: 'Envío en 24hs',
    }
  }
];