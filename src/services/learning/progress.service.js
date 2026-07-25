/**
 * @file progress.service.js
 * @description SERVICIO DE PROGRESO (Learning Core)
 * Gestiona el "Smart Resume" y el cálculo de avance.
 * Implementa patrón "Batching" para evitar N+1 requests en el Dashboard.
 * @version 2.1.0 (Audited)
 */

import apiClient, { IS_MOCK_MODE } from '../core/api.client';
import { buildLessonProgressId } from '../../utils/progressId';

// --- MOCK DB HELPERS ---
const MOCK_PROGRESS_KEY = 'monitor_learning_progress_db';

const _getMockDb = () => {
  try {
    return JSON.parse(localStorage.getItem(MOCK_PROGRESS_KEY) || '{"watchTime": {}, "completed": []}');
  } catch {
    return { watchTime: {}, completed: [] };
  }
};

const _saveMockDb = (data) => {
  localStorage.setItem(MOCK_PROGRESS_KEY, JSON.stringify(data));
};

const _simulateNetwork = () => new Promise(resolve => setTimeout(resolve, 300));

export const progressService = {

  /**
   * SMART RESUME: Guarda el segundo exacto.
   * lessonId se namespacea por curso (ver buildLessonProgressId) porque los
   * IDs de lección se repiten entre cursos distintos.
   */
  async saveWatchTime(courseId, lessonId, seconds) {
    const progressId = buildLessonProgressId(courseId, lessonId);
    if (IS_MOCK_MODE) {
      const db = _getMockDb();
      db.watchTime[progressId] = seconds;
      _saveMockDb(db);
      return { success: true, savedAt: seconds };
    }
    return apiClient.post('/progress/watch-time', { lessonId: progressId, seconds });
  },

  /**
   * Recupera el tiempo guardado.
   */
  async getWatchTime(courseId, lessonId) {
    const progressId = buildLessonProgressId(courseId, lessonId);
    if (IS_MOCK_MODE) {
      const db = _getMockDb();
      return db.watchTime[progressId] || 0;
    }
    try {
      const response = await apiClient.get(`/progress/watch-time/${progressId}`);
      return response.seconds || 0;
    } catch  {
      return 0;
    }
  },

  /**
   * Marca lección como completada.
   */
  async markLessonAsCompleted(courseId, lessonId) {
    const progressId = buildLessonProgressId(courseId, lessonId);
    if (IS_MOCK_MODE) {
      await _simulateNetwork();
      const db = _getMockDb();
      const completedSet = new Set(db.completed || []);
      completedSet.add(progressId);
      db.completed = Array.from(completedSet);
      _saveMockDb(db);
      return { success: true, status: 'completed' };
    }
    return apiClient.post('/progress/complete', { courseId, lessonId });
  },

  /**
   * BATCH RETRIEVAL: Obtiene TODO el historial de lecciones completadas del usuario.
   * Optimizado para cargar el Dashboard con 1 solo request.
   * @returns {Promise<string[]>} Array de IDs de todas las lecciones completadas.
   */
  async getAllCompletedLessons() {
    if (IS_MOCK_MODE) {
      // await _simulateNetwork(); // Comentado para velocidad en UI
      const db = _getMockDb();
      return db.completed || [];
    }
    
    try {
      // Endpoint optimizado que devuelve array plano de IDs
      const response = await apiClient.get('/progress/me/completed'); 
      return response.ids || [];
    } catch (error) {
      console.warn("[ProgressService] Error fetching batch progress:", error);
      return [];
    }
  },

  /**
   * UTILITY: Calcula el porcentaje de avance de un curso en memoria (CPU).
   * Evita "Magic Strings" en la UI.
   * @param {object} course - Objeto del curso (debe tener id y lessonsCount).
   * @param {string[]} allCompletedIds - Array plano de IDs completados.
   * @returns {number} Porcentaje entero (0-100).
   */
  calculateCourseProgress(course, allCompletedIds) {
    if (!course || !course.id || !allCompletedIds) return 0;
    
    // Denominador: Si no viene definido, asumimos 1 para evitar división por cero
    const totalLessons = course.lessonsCount || 10;

    // Numerador: Contamos cuántas lecciones de ESTE curso están en la lista global
    // (IDs con formato "${courseId}_${lessonId}", ver buildLessonProgressId)
    const coursePrefix = `${course.id}_`;
    const completedCount = allCompletedIds.filter(id => id.startsWith(coursePrefix)).length;

    const percent = Math.round((completedCount / totalLessons) * 100);
    return Math.min(percent, 100); // Cap en 100%
  }
};