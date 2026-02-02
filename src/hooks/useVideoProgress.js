import { useRef, useCallback, useEffect } from 'react';

const CONFIG = {
  COMPLETION_THRESHOLD: 0.9, 
  SAVE_THROTTLE_MS: 2000,    
  STORAGE_KEY_PREFIX: 'monitor_progress_'
};

export const getStoredProgress = (lessonId) => {
  if (!lessonId) return 0;
  try {
    const key = `${CONFIG.STORAGE_KEY_PREFIX}${lessonId}`;
    const saved = localStorage.getItem(key);
    const parsed = parseFloat(saved);
    return Number.isFinite(parsed) ? parsed : 0;
  } catch {
    // [FIX] Eliminado el argumento (e) no utilizado.
    // Si falla el parsing, simplemente retornamos 0 sin capturar la variable.
    return 0;
  }
};

export const useVideoProgress = ({ activeLessonId, onComplete }) => {
  const state = useRef({
    duration: 0,
    hasMarked: false,
    lastSaveTime: 0
  });

  // Reset al cambiar de lección
  useEffect(() => {
    state.current = { duration: 0, hasMarked: false, lastSaveTime: 0 };
  }, [activeLessonId]);

  // --- 1. MANEJADOR DE DURACIÓN (Híbrido) ---
  const handleDuration = useCallback((input) => {
    let duration = 0;
    
    // Caso A: ReactPlayer/YouTube (Número directo)
    if (typeof input === 'number') {
        duration = input;
    } 
    // Caso B: HTML5 Nativo
    else if (input?.target?.duration) {
        duration = input.target.duration;
    }
    // Caso C: Fallback Evento Nativo profundo
    else if (input?.nativeEvent?.target?.duration) {
        duration = input.nativeEvent.target.duration;
    }

    // Guardamos solo si es válido
    if (Number.isFinite(duration) && duration > 0) {
        state.current.duration = duration;
    }
  }, []);

  // --- 2. MANEJADOR DE PROGRESO (Híbrido) ---
  const handleProgress = useCallback((progress) => {
    if (!progress) return;

    let currentSeconds = 0;
    let currentPercent = 0;

    // ESTRATEGIA DE EXTRACCIÓN
    // ---------------------------------------------------------
    // Caso A: Objeto estándar de ReactPlayer
    if (typeof progress.playedSeconds === 'number') {
        currentSeconds = progress.playedSeconds;
        currentPercent = progress.played;
    } 
    // Caso B: Evento Nativo (TU CASO)
    // El evento nativo NO trae porcentaje, hay que calcularlo: (tiempo / duración)
    else if (progress.target && typeof progress.target.currentTime === 'number') {
        currentSeconds = progress.target.currentTime;
        const totalDuration = state.current.duration;
        
        if (totalDuration > 0) {
            currentPercent = currentSeconds / totalDuration;
        }
    }
    else {
        return; // Datos desconocidos, abortamos para evitar crash
    }
    // ---------------------------------------------------------

    // 1. COMPLETITUD
    const isThresholdMet = currentPercent >= CONFIG.COMPLETION_THRESHOLD;

    if (!state.current.hasMarked && isThresholdMet) {
      state.current.hasMarked = true;
      if (onComplete) onComplete();
    }

    // 2. PERSISTENCIA
    const now = Date.now();
    if (now - state.current.lastSaveTime > CONFIG.SAVE_THROTTLE_MS) {
        const key = `${CONFIG.STORAGE_KEY_PREFIX}${activeLessonId}`;
        // Doble check de seguridad
        if (typeof currentSeconds === 'number' && !isNaN(currentSeconds)) {
            localStorage.setItem(key, currentSeconds.toString());
            state.current.lastSaveTime = now;
        }
    }

  }, [activeLessonId, onComplete]);

  return { handleDuration, handleProgress, getStoredProgress };
};