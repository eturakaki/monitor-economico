/**
 * @file course.service.js
 * @description SERVICIO DE CATÁLOGO Y CONTENIDO (Learning Domain)
 * UNIFIED VERSION: Actúa como puente entre Marketing Data (cursos.js) y Content Data (courseContentMock.js).
 * @version 3.0.0 (Unified Data Source)
 * @path src/services/learning/course.service.js
 */

import apiClient, { IS_MOCK_MODE } from '../core/api.client';

// --- IMPORTACIÓN DE FUENTES DE DATOS (SINGLE SOURCE OF TRUTH) ---
// Importamos los datos estáticos desde la capa de datos compartida
import { cursos } from '../../data/cursos';
import { courseContentMock } from '../../data/courseContentMock';

// --- HELPER: SIMULACIÓN DE LATENCIA ---
const _simulateDelay = () => new Promise(resolve => setTimeout(resolve, 800));

export const courseService = {

  /**
   * Obtiene el catálogo completo.
   * En modo MOCK, retorna directamente el array maestro de marketing.
   */
  async getAllCourses() {
    if (IS_MOCK_MODE) {
      await _simulateDelay();
      return cursos;
    }
    return apiClient.get('/courses');
  },

  /**
   * Obtiene el detalle COMPLETO de un curso (Marketing + Módulos + Videos).
   * Realiza un MERGE estratégico entre el catálogo (info venta) y el mock (info player).
   * @param {string} id 
   */
  async getCourseById(id) {
    if (IS_MOCK_MODE) {
      await _simulateDelay();

      // 1. Buscamos en la capa de Marketing (Catálogo General)
      // Esto nos da Título, Precio, Imagen, Descripción, etc.
      const courseCatalog = cursos.find(c => c.id === id);
      
      if (!courseCatalog) {
        throw new Error(`Curso con ID ${id} no encontrado en el catálogo.`);
      }

      // 2. Buscamos en la capa de Contenido (Videos/Módulos/Lecciones)
      // Usamos el ID como clave en el objeto courseContentMock
      const courseContent = courseContentMock[id];

      // 3. MERGE / FUSIÓN DE DATOS
      if (courseContent) {
          // Si existe contenido específico, lo mezclamos con la info del catálogo.
          // El contenido tiene prioridad en caso de propiedades duplicadas.
          return {
              ...courseCatalog,
              ...courseContent
          };
      }

      // 4. Fallback: Si el curso existe en marketing pero no tiene contenido definido en el mock.
      // Devolvemos el curso con un array modules vacío para evitar crash en el Frontend.
      return {
          ...courseCatalog,
          modules: [] 
      };
    }
    
    // Modo Real (API)
    return apiClient.get(`/courses/${id}`);
  },

  /**
   * Búsqueda simple sobre el array de marketing.
   */
  async searchCourses(query) {
    if (IS_MOCK_MODE) {
        await _simulateDelay();
        if (!query) return cursos;
        const lowerQ = query.toLowerCase();
        
        return cursos.filter(c => 
            c.title.toLowerCase().includes(lowerQ) || 
            c.description.toLowerCase().includes(lowerQ)
        );
    }
    return apiClient.get('/courses/search', { params: { q: query } });
  }
};