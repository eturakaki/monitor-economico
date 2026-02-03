/**
 * @file api.client.js
 * @description CLIENTE HTTP CENTRAL (La "Aduana")
 * Maneja la configuración global de Axios, interceptores de seguridad (Tokens)
 * y manejo centralizado de errores de red.
 * * @architecture Core Service
 * @version 1.0.0 (Foundation)
 */

import axios from 'axios';
import { toast } from 'sonner';

// 1. CONFIGURACIÓN DEL ENTORNO
// Detectamos si estamos en desarrollo o producción mediante variables de entorno.
// Si no hay variable definida, asumimos localhost por seguridad en dev.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Bandera global para que los Servicios sepan si deben usar mocks.
// Esto permite que el tree-shaking elimine los mocks en el build de producción si se configura bien.
export const IS_MOCK_MODE = import.meta.env.VITE_USE_MOCKS === 'true' || true; // Default true por ahora

// 2. CREACIÓN DE LA INSTANCIA (El "Camión" de transporte)
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 segundos (Regla general aprobada por Auditor)
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// 3. INTERCEPTOR DE SALIDA (Request) - "El Sellado de Seguridad"
apiClient.interceptors.request.use(
  (config) => {
    // A. Inyección de Token
    // Buscamos la sesión. NOTA: Usamos la key definida en tu userStatus.js
    // En el futuro, esto vendrá de un servicio de cookies más seguro.
    const sessionData = localStorage.getItem('monitoreco_session_v2');
    
    if (sessionData) {
      try {
        const parsedSession = JSON.parse(sessionData);
        // Asumimos que el objeto usuario tiene un campo 'token' (o simulamos uno)
        // Si no tienes token aún, el backend mock lo ignorará, pero la tubería ya está lista.
        const token = parsedSession.token || 'mock-token-placeholder';
        
        config.headers.Authorization = `Bearer ${token}`;
      } catch (e) {
        console.warn('Error al leer sesión para request', e);
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 4. INTERCEPTOR DE LLEGADA (Response) - "El Control de Calidad"
apiClient.interceptors.response.use(
  (response) => {
    // ✨ MICRO-OPTIMIZACIÓN APROBADA:
    // Devolvemos directamente la data. 
    // Los servicios recibirán { id: 1, ... } en lugar de { data: { id: 1, ... }, status: 200 }
    return response.data; 
  },
  async (error) => {
    // B. Manejo de Errores de Red (Sin conexión)
    if (!error.response) {
      toast.error('Error de Conexión', {
        description: 'No se pudo contactar con el servidor. Verifica tu internet.',
        duration: 5000,
      });
      return Promise.reject(error);
    }

    const { status } = error.response;

    // C. Manejo de Errores Específicos

    // CASO 401: Credencial Vencida (La puerta en la cara)
    if (status === 401) {
      console.error('[Seguridad] Sesión expirada o inválida');
      
      // Lógica de limpieza y redirección
      // Nota: Evitamos loops infinitos si ya estamos en login
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('monitoreco_session_v2'); // Borrado de seguridad
        toast.error('Sesión Expirada', {
          description: 'Por favor, inicia sesión nuevamente.'
        });
        // Redirección nativa para asegurar limpieza de estado de React
        setTimeout(() => {
            window.location.href = '/login'; 
        }, 1500);
      }
    }

    // CASO 500: Error del Servidor (Chaos Monkey)
    if (status >= 500) {
      toast.error('Error del Sistema', {
        description: 'Nuestros servidores tienen problemas momentáneos. Intenta en breve.',
      });
    }

    // CASO 403: Prohibido (Intentar acceder a curso sin pagar)
    if (status === 403) {
      // Dejamos que el componente maneje esto (ej: GuardedCourseRoute)
      // pero podríamos loguearlo aquí.
    }

    return Promise.reject(error);
  }
);

export default apiClient;
