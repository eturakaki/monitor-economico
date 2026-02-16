/**
 * @file useVideoProgress.js
 * @description HOOK DE TELEMETRÍA DE VIDEO
 * Gestiona la detección de progreso, throttling de guardado y completitud.
 * * @version 2.0.0 (Service-Connected)
 */

import { useRef, useCallback, useEffect } from 'react';
import { progressService } from '../services/learning/progress.service';

const CONFIG = {
  COMPLETION_THRESHOLD: 0.9, 
  SAVE_THROTTLE_MS: 5000, // Aumentado a 5s para reducir tráfico de red real
};

export const useVideoProgress = ({ courseId, activeLessonId, onComplete }) => {
  const state = useRef({
    duration: 0,
    hasMarked: false,
    lastSaveTime: 0
  });

  // Reset de estado interno al cambiar de lección
  useEffect(() => {
    state.current = { duration: 0, hasMarked: false, lastSaveTime: 0 };
  }, [activeLessonId]);

  // --- 1. MANEJADOR DE DURACIÓN (Híbrido) ---
  const handleDuration = useCallback((input) => {
    let duration = 0;
    
    // Extracción robusta de duración (HTML5 / ReactPlayer)
    if (typeof input === 'number') {
        duration = input;
    } else if (input?.target?.duration) {
        duration = input.target.duration;
    } else if (input?.nativeEvent?.target?.duration) {
        duration = input.nativeEvent.target.duration;
    }

    if (Number.isFinite(duration) && duration > 0) {
        state.current.duration = duration;
    }
  }, []);

  // --- 2. MANEJADOR DE PROGRESO (Core Logic) ---
  const handleProgress = useCallback((progress) => {
    if (!progress) return;

    let currentSeconds = 0;
    let currentPercent = 0;

    // A. Extracción de Tiempo
    if (typeof progress.playedSeconds === 'number') {
        currentSeconds = progress.playedSeconds;
        currentPercent = progress.played;
    } else if (progress.target && typeof progress.target.currentTime === 'number') {
        currentSeconds = progress.target.currentTime;
        const totalDuration = state.current.duration;
        if (totalDuration > 0) {
            currentPercent = currentSeconds / totalDuration;
        }
    } else {
        return; 
    }

    // B. Lógica de Completitud (Threshold)
    const isThresholdMet = currentPercent >= CONFIG.COMPLETION_THRESHOLD;

    if (!state.current.hasMarked && isThresholdMet) {
      state.current.hasMarked = true;
      
      // 1. Notificar al Servicio (Persistencia)
      progressService.markLessonAsCompleted(courseId, activeLessonId)
        .catch(err => console.warn("Fallo al marcar completado:", err));

      // 2. Notificar a la UI (Callback)
      if (onComplete) onComplete();
    }

    // C. Persistencia de "Watch Time" (Throttling)
    const now = Date.now();
    if (now - state.current.lastSaveTime > CONFIG.SAVE_THROTTLE_MS) {
        // Doble check de seguridad
        if (typeof currentSeconds === 'number' && !isNaN(currentSeconds)) {
            
            // Guardado Asíncrono (Fire and Forget)
            progressService.saveWatchTime(activeLessonId, currentSeconds)
                .catch(err => console.warn("Error guardando progreso:", err));
            
            state.current.lastSaveTime = now;
        }
    }

  }, [courseId, activeLessonId, onComplete]);

  // --- 3. HELPER DE RECUPERACIÓN (Async) ---
  // Nota: Ahora devuelve una Promesa, el componente debe esperarla.
  const fetchStoredTime = useCallback(async () => {
    if (!activeLessonId) return 0;
    return await progressService.getWatchTime(activeLessonId);
  }, [activeLessonId]);

  return { handleDuration, handleProgress, fetchStoredTime };
};