/**
 * @file useVideoProgress.js
 * @version 3.9.0-Persistent
 * @description Hook defensivo para rastrear y persistir el progreso de video.
 * @strategy Direct DOM Access + LocalStorage Persistence
 */

import { useEffect, useRef } from 'react';

// Constantes de Configuración
const CONFIG = {
    COMPLETION_THRESHOLD: 0.9, // 90%
    HEARTBEAT_MS: 500,         // 500ms
    STORAGE_KEY_PREFIX: 'mel_progress_' // "Monitor-Economico Learning"
};

/**
 * Helper para generar la clave de almacenamiento única por lección
 */
export const getStoredProgress = (lessonId) => {
    if (!lessonId) return 0;
    try {
        const saved = localStorage.getItem(`${CONFIG.STORAGE_KEY_PREFIX}${lessonId}`);
        return saved ? parseFloat(saved) : 0;
    } catch {
        return 0;
    }
};

export const useVideoProgress = ({ isPlaying, activeLessonId, onComplete }) => {
    /**
     * @ref metrics
     * Source of Truth interna. Mantiene el estado sin provocar re-renders.
     */
    const metrics = useRef({
        totalDuration: 0,
        hasMarked: false,
    });

    // 1. RESET LOGIC
    // Cuando cambia la lección, reseteamos las métricas internas.
    useEffect(() => {
        metrics.current = {
            totalDuration: 0,
            hasMarked: false,
        };
    }, [activeLessonId]);

    // 2. NUCLEAR HEARTBEAT & PERSISTENCE
    useEffect(() => {
        // Guard Clauses: Si no hay lección o no se reproduce, pausa.
        if (!activeLessonId || !isPlaying || metrics.current.hasMarked) return;

        const intervalId = setInterval(() => {
            // --- DOM ACCESS (Direct Strategy) ---
            const nativeVideo = document.querySelector('video');

            if (!nativeVideo) return;

            try {
                const { currentTime, duration } = nativeVideo;

                // Validación de integridad de datos
                if (!Number.isFinite(duration) || duration <= 0) return;

                metrics.current.totalDuration = duration;
                const percentage = currentTime / duration;

                // A) PERSISTENCIA: Guardamos el progreso exacto (segundos)
                // Solo guardamos si el video no ha terminado
                if (percentage < CONFIG.COMPLETION_THRESHOLD) {
                    localStorage.setItem(
                        `${CONFIG.STORAGE_KEY_PREFIX}${activeLessonId}`, 
                        currentTime.toString()
                    );
                }

                // B) COMPLETION CHECK
                if (percentage > CONFIG.COMPLETION_THRESHOLD) {
                    metrics.current.hasMarked = true; 
                    
                    // Limpieza: Si ya terminó, borramos el progreso guardado para que
                    // la próxima vez empiece de 0 (o se mantenga como "visto").
                    localStorage.removeItem(`${CONFIG.STORAGE_KEY_PREFIX}${activeLessonId}`);

                    // Notificamos al padre
                    if (onComplete) onComplete();
                }

            } catch {
                // Silencio intencional
            }
        }, CONFIG.HEARTBEAT_MS);

        return () => clearInterval(intervalId);
    }, [isPlaying, activeLessonId, onComplete]);
};