/**
 * @file course.service.js
 * @description SERVICIO DE CATÁLOGO Y CONTENIDO (Learning Domain)
 * Gestiona la obtención de cursos, libros y planes.
 * * @version 2.0.1 (Player Ready)
 * * @path src/services/learning/course.service.js
 */

// CORRECCIÓN: Ajuste de ruta a '../core/api.client'
import apiClient, { IS_MOCK_MODE } from '../core/api.client';

// --- MOCK CATALOG (Datos Ligeros para Tarjetas) ---
const MOCK_CATALOG = [
  {
    id: 'course_macro_101',
    type: 'curso',
    title: 'Fundamentos de Macroeconomía',
    description: 'Entiende cómo funcionan las tasas de interés, inflación y el PBI real.',
    price: 45000,
    rating: 4.8,
    estudiantes: 1240,
    duracion: '12h 30m',
    badge: 'Best Seller',
    color: 'emerald',
    image: null, 
    lessonsCount: 24
  },
  {
    id: 'course_trading_adv',
    type: 'curso',
    title: 'Trading Institucional Avanzado',
    description: 'Estrategias de liquidez y order blocks para operar como los bancos.',
    price: 89000,
    rating: 4.9,
    estudiantes: 850,
    duracion: '18h 15m',
    badge: 'NUEVO',
    color: 'violet',
    lessonsCount: 32
  },
  {
    id: 'book_financial_history',
    type: 'libro',
    title: 'Historia de las Crisis Financieras',
    description: 'Edición física tapa dura. Envío a todo el país.',
    price: 25000,
    rating: 5.0,
    estudiantes: 300, 
    duracion: null, 
    badge: 'Envío Gratis',
    color: 'amber',
    image: null
  },
  {
    id: 'plan_pro_anual',
    type: 'plan', 
    title: 'Suscripción PRO Anual',
    description: 'Acceso total a todos los cursos, reportes y la terminal financiera.',
    price: 150000,
    rating: 5.0,
    estudiantes: 2100,
    duracion: '1 Año',
    badge: 'Recomendado',
    color: 'blue',
    image: null
  }
];

// --- HELPER: GENERADOR DE CONTENIDO PROFUNDO (Para el Player) ---
const _getMockContent = (courseId) => {
    // Estructura estándar que espera el componente <CoursePlayerPage />
    // USAMOS 'courseId' para generar IDs únicos y evitar colisiones
    return {
        modules: [
            {
                id: `${courseId}_mod_1`, // <--- AHORA LO USAMOS AQUÍ
                title: 'Módulo 1: Introducción y Contexto',
                lessons: [
                    { 
                        id: `${courseId}_l_101`, 
                        title: 'Bienvenida al Curso', 
                        duration: '05:00', 
                        videoSrc: 'https://www.youtube.com/embed/dQw4w9WgXcQ', 
                        isFree: true,
                        isCompleted: true 
                    },
                    { 
                        id: `${courseId}_l_102`, 
                        title: 'Configuración del Entorno', 
                        duration: '12:30', 
                        videoSrc: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                        isFree: false,
                        isCompleted: false 
                    }
                ]
            },
            {
                id: `${courseId}_mod_2`,
                title: 'Módulo 2: Conceptos Nucleares',
                lessons: [
                    { 
                        id: `${courseId}_l_201`, 
                        title: 'La Teoría del Dinero', 
                        duration: '25:15', 
                        videoSrc: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                        isFree: false 
                    },
                    { 
                        id: `${courseId}_l_202`, 
                        title: 'Bancos Centrales', 
                        duration: '45:00', 
                        videoSrc: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                        isFree: false 
                    }
                ]
            }
        ]
    };
};

const _simulateDelay = () => new Promise(resolve => setTimeout(resolve, 800));

export const courseService = {

  /**
   * Obtiene el catálogo completo (Ligero).
   */
  async getAllCourses() {
    if (IS_MOCK_MODE) {
      await _simulateDelay();
      return MOCK_CATALOG;
    }
    return apiClient.get('/courses');
  },

  /**
   * Obtiene el detalle COMPLETO de un curso (Incluye Módulos y Videos).
   * @param {string} id 
   */
  async getCourseById(id) {
    if (IS_MOCK_MODE) {
      await _simulateDelay();
      const course = MOCK_CATALOG.find(c => c.id === id);
      
      if (!course) {
        throw new Error(`Curso con ID ${id} no encontrado.`);
      }

      // 💉 INYECCIÓN DE CONTENIDO:
      // Si es un curso, le pegamos los módulos simulados para que el Player funcione.
      if (course.type === 'curso' || course.type === 'course') {
          return {
              ...course,
              ..._getMockContent(id) // <--- AQUÍ ESTÁ LA MAGIA QUE PEDISTE
          };
      }

      // Si es libro o plan, devolvemos tal cual
      return course;
    }
    
    // Modo Real
    return apiClient.get(`/courses/${id}`);
  },

  /**
   * Búsqueda simple.
   */
  async searchCourses(query) {
    if (IS_MOCK_MODE) {
        await _simulateDelay();
        if (!query) return MOCK_CATALOG;
        const lowerQ = query.toLowerCase();
        return MOCK_CATALOG.filter(c => 
            c.title.toLowerCase().includes(lowerQ) || 
            c.description.toLowerCase().includes(lowerQ)
        );
    }
    return apiClient.get('/courses/search', { params: { q: query } });
  }
};