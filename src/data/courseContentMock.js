/**
 * MOCK DATA LAYER - UPDATED (HTTPS SECURE)
 * * @version 2.1.0 - ID Synchronization (course_macro_101)
 */

export const courseContentMock = {
  // [FIX] CORRECCIÓN DE LLAVE: De 'course_1' a 'course_macro_101'
  // Esto sincroniza la data con el userStatus.js y el course.service.js
  'course_macro_101': { 
    introVideo: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', 
    title: 'Master en Análisis Técnico',
    modules: [
      {
        id: 'mod_1',
        title: 'Módulo 1: Fundamentos del Análisis Técnico',
        lessons: [
          { 
            id: 'l_101', 
            title: 'Teoría de Dow y Ciclos de Mercado', 
            duration: '10:34', 
            type: 'video', 
            isFree: true,
            videoSrc: 'https://www.w3schools.com/html/mov_bbb.mp4'
          },
          { 
            id: 'l_102', 
            title: 'Velas Japonesas: Lectura Institucional', 
            duration: '12:00', 
            type: 'video', 
            isFree: false,
            videoSrc: 'https://www.w3schools.com/html/mov_bbb.mp4' 
          },
          { 
            id: 'l_103', 
            title: 'Soportes y Resistencias Dinámicos', 
            duration: '08:45', 
            type: 'video', 
            isFree: false,
            videoSrc: 'https://www.youtube.com/watch?v=uEtORunWh5I&list=RDMMuEtORunWh5I&index=1&pp=8AUB'
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
            duration: '15:00', 
            type: 'video', 
            isFree: false, 
            videoSrc: 'https://www.w3schools.com/html/mov_bbb.mp4'
          }
        ]
      }
    ]
  },
  
  'default': {
    introVideo: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
    title: "Curso Demo",
    modules: []
  }
};