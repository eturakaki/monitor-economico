import axios from 'axios';
// Importamos tus mocks actuales para usarlos como "Base de Datos Local" temporal
import { courseContentMock } from '../data/courseContentMock';
import { cursos } from '../data/cursos';

// ------------------------------------------------------------------
// CONFIGURACIÓN (Aquí conectarás con el Backend real en el futuro)
// ------------------------------------------------------------------
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Creamos una instancia de Axios (El "Cliente HTTP")
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// INTERRUPTOR DE MODO:
// true = Usa tus mocks locales (Lo que tienes hoy).
// false = Intenta conectarse al Backend real (Lo que tendrás mañana).
const USE_MOCK_DATA = true; 

// ------------------------------------------------------------------
// SERVICIO DE CURSOS
// ------------------------------------------------------------------

export const courseService = {

  /**
   * Obtiene el curso completo con su temario y progreso.
   * @param {string} courseId - El ID del curso.
   * @returns {Promise<Object>} - El objeto unificado del curso.
   */
  getCourseById: async (courseId) => {
    // MODO MOCK (Simulación para desarrollo)
    if (USE_MOCK_DATA) {
      return new Promise((resolve, reject) => {
        // Simulamos un retraso de red de 800ms para probar tu Loader/Spinner
        setTimeout(() => {
          const content = courseContentMock[courseId] || courseContentMock['default'];
          const metadata = cursos.find(c => c.id == courseId);

          if (!content || !metadata) {
            reject(new Error("Curso no encontrado"));
            return;
          }

          // FUSIONAMOS LOS DATOS (Simulamos la respuesta "All-in-One" del Backend)
          // El backend ideal te devolverá todo esto en un solo objeto JSON.
          const unifiedData = {
            ...metadata,      // Título, autor, imagen...
            modules: content.modules, // Lista de módulos y lecciones
            // Aquí el backend inyectará tu progreso real:
            userProgress: { 
              completedLessons: ['l_101', 'l_102'] // Ejemplo simulado
            } 
          };

          resolve(unifiedData);
        }, 800); // Retraso artificial
      });
    }

    // MODO REAL (Esto se ejecutará cuando tengas Backend)
    try {
      // Cuando tengas token, aquí se inyectará automáticamente
      const response = await apiClient.get(`/courses/${courseId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching course:", error);
      throw error;
    }
  }
};