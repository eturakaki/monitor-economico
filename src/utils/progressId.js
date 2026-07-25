/**
 * Construye el ID compuesto de progreso de una lección.
 * Necesario porque los IDs de lección (ej. "l_101") se repiten entre cursos
 * distintos: sin el prefijo de curso, dos lecciones de cursos diferentes
 * colisionarían en progressService (watch time, completadas, cálculo de %).
 */
export const buildLessonProgressId = (courseId, lessonId) => `${courseId}_${lessonId}`;
