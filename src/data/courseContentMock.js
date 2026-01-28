/**
 * MOCK DATA LAYER - CONTENT DELIVERY
 * Simula la respuesta de la API: GET /courses/:id/modules
 * Estructura jerárquica: Curso -> Módulos -> Lecciones
 */

export const courseContentMock = {
  'course_1': { // ID debe coincidir con cursos.js
    introVideo: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder
    modules: [
      {
        id: 'mod_1',
        title: 'Módulo 1: Fundamentos del Análisis Técnico',
        duration: '45 min',
        lessons: [
          { id: 'l_101', title: 'Teoría de Dow y Ciclos de Mercado', duration: '15:00', type: 'video', isFree: true },
          { id: 'l_102', title: 'Velas Japonesas: Lectura Institucional', duration: '20:00', type: 'video', isFree: false },
          { id: 'l_103', title: 'Soportes y Resistencias Dinámicos', duration: '10:00', type: 'video', isFree: false }
        ]
      },
      {
        id: 'mod_2',
        title: 'Módulo 2: Indicadores y Osciladores',
        duration: '1h 20m',
        lessons: [
          { id: 'l_201', title: 'RSI: Divergencias Ocultas', duration: '25:00', type: 'video', isFree: false },
          { id: 'l_202', title: 'MACD y Medias Móviles', duration: '30:00', type: 'video', isFree: false },
          { id: 'l_203', title: 'Quiz: Patrones de Reversión', duration: '15:00', type: 'quiz', isFree: false }
        ]
      }
    ]
  },
  // Fallback genérico para desarrollo si el ID no tiene contenido específico
  'default': {
    introVideo: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    modules: [
      {
        id: 'mod_def_1',
        title: 'Módulo Introductorio',
        lessons: [
          { id: 'l_def_1', title: 'Bienvenida al Curso', duration: '05:00', type: 'video' },
          { id: 'l_def_2', title: 'Configuración del Entorno', duration: '10:00', type: 'video' }
        ]
      }
    ]
  }
};