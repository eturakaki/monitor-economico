/**
 * MOCK DATA LAYER - CONTENT DELIVERY
 * Estructura jerárquica: Curso -> Módulos -> Lecciones
 * UPDATED: Videos reales de YouTube para probar ReactPlayer
 */

export const courseContentMock = {
  'course_1': { // Master en Análisis Técnico
    introVideo: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 
    modules: [
      {
        id: 'mod_1',
        title: 'Módulo 1: Fundamentos del Análisis Técnico',
        lessons: [
          { 
            id: 'l_101', 
            title: 'Teoría de Dow y Ciclos de Mercado', 
            duration: '15:00', 
            type: 'video', 
            isFree: true,
          
            // En courseContentMock.js
            videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
          },
          { 
            id: 'l_102', 
            title: 'Velas Japonesas: Lectura Institucional', 
            duration: '20:00', 
            type: 'video', 
            isFree: false,

            // En la lección l_101
            videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
          },
          { 
            id: 'l_103', 
            title: 'Soportes y Resistencias Dinámicos', 
            duration: '10:00', 
            type: 'video', 
            isFree: false,
            // Sin URL para probar el Fallback (debería cargar el video por defecto)
          }
        ]
      },
      {
        id: 'mod_2',
        title: 'Módulo 2: Indicadores y Osciladores',
        lessons: [
          { 
            id: 'l_201', 
            title: 'RSI: Divergencias Ocultas', 
            duration: '25:00', 
            type: 'video', 
            isFree: false, 
            videoUrl: '/demo-video.mp4'
          },
          { 
            id: 'l_202', 
            title: 'MACD y Medias Móviles', 
            duration: '30:00', 
            type: 'video', 
            isFree: false 
          },
          { 
            id: 'l_203', 
            title: 'Quiz: Patrones de Reversión', 
            duration: '15:00', 
            type: 'quiz', 
            isFree: false 
          }
        ]
      }
    ]
  },
  
  // Fallback genérico para otros cursos sin contenido específico
  'default': {
    introVideo: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
    modules: [
      {
        id: 'mod_def_1',
        title: 'Módulo Introductorio',
        lessons: [
          { 
            id: 'l_def_1', 
            title: 'Bienvenida al Curso', 
            duration: '05:00', 
            type: 'video', 
            videoUrl: '/IMG_6217.MOV'
          },
          { 
            id: 'l_def_2', 
            title: 'Configuración del Entorno', 
            duration: '10:00', 
            type: 'video' 
          }
        ]
      }
    ]
  }
};