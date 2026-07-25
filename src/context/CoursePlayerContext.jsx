/**
 * @file CoursePlayerContext.jsx
 * @description CONTEXTO DE ESTADO GLOBAL (Smart Layer)
 * Centraliza la lógica de negocio, navegación entre lecciones y persistencia de progreso.
 * @version 1.0.1 (Bugfix: Method naming sync)
 * @path src/context/CoursePlayerContext.jsx
 */

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';

// --- SERVICIOS ---
import { courseService } from '../services/learning/course.service';
import { progressService } from '../services/learning/progress.service';
import { buildLessonProgressId } from '../utils/progressId';

// --- HOOKS ---
import { useAuth } from '../hooks/useAuth';

// Crear Contexto
const CoursePlayerContext = createContext(null);

/**
 * Provider que envuelve al Reproductor.
 * @param {string} courseId - ID del curso (desde URL)
 * @param {string} lessonId - ID de la lección actual (desde URL)
 */
export const CoursePlayerProvider = ({ children, courseId, lessonId }) => {
    // 1. ESTADO LOCAL
    const [course, setCourse] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    // Set de IDs compuestos (`${courseId}_${lessonId}`) de lecciones completadas.
    // progressService es la ÚNICA fuente de verdad del progreso: no se depende
    // de flags embebidos en el contenido del curso (course.service.js nunca los setea).
    const [completedLessonIds, setCompletedLessonIds] = useState(new Set());

    const { user } = useAuth();

    // 2. CARGA DE DATOS (Data Fetching)
    useEffect(() => {
        let isMounted = true;

        const initPlayer = async () => {
            if (!courseId) return;

            setIsLoading(true);
            try {
                // A. Cargar metadata/contenido del curso y el progreso real en paralelo
                const [courseData, allCompletedIds] = await Promise.all([
                    courseService.getCourseById(courseId),
                    progressService.getAllCompletedLessons()
                ]);

                if (isMounted) {
                    setCourse(courseData);

                    // B. Filtramos el progreso global a las lecciones de ESTE curso
                    const coursePrefix = `${courseId}_`;
                    const initialCompleted = new Set(
                        allCompletedIds.filter((id) => id.startsWith(coursePrefix))
                    );
                    setCompletedLessonIds(initialCompleted);
                }
            } catch (err) {
                console.error("Error loading course:", err);
                if (isMounted) setError(err.message);
                toast.error("Error al cargar el curso");
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        initPlayer();

        return () => { isMounted = false; };
    }, [courseId]);

    // 3. LOGICA DERIVADA (Computed Selectors)
    
    // Aplanar estructura (Módulos -> Lecciones) para navegación lineal
    const flatLessons = useMemo(() => {
        if (!course?.modules) return [];
        return course.modules.flatMap(module => module.lessons);
    }, [course]);

    // Lección Activa:
    // Si hay lessonId en URL, busca esa. Si no, devuelve la primera del curso (Fallback).
    const activeLesson = useMemo(() => {
        if (!flatLessons.length) return null;
        if (!lessonId) return flatLessons[0]; // Regla de Oro: Auto-selección
        return flatLessons.find(l => l.id === lessonId) || flatLessons[0];
    }, [flatLessons, lessonId]);

    // Navegación (Next / Prev)
    const { nextLesson, previousLesson } = useMemo(() => {
        if (!activeLesson || !flatLessons.length) return { nextLesson: null, previousLesson: null };
        
        const currentIndex = flatLessons.findIndex(l => l.id === activeLesson.id);
        
        return {
            previousLesson: currentIndex > 0 ? flatLessons[currentIndex - 1] : null,
            nextLesson: currentIndex < flatLessons.length - 1 ? flatLessons[currentIndex + 1] : null
        };
    }, [activeLesson, flatLessons]);

    // Progreso General
    const progressPercentage = useMemo(() => {
        if (!flatLessons.length) return 0;
        const total = flatLessons.length;
        const completed = completedLessonIds.size;
        return Math.round((completed / total) * 100);
    }, [flatLessons, completedLessonIds]);


    // 4. ACCIONES (Actions)

    const toggleSidebar = useCallback(() => {
        setSidebarOpen(prev => !prev);
    }, []);

    /**
     * Marca la lección actual como completada.
     * Usa Optimistic UI para actualizar visualmente antes de la respuesta del servidor.
     */
    const markCurrentAsCompleted = useCallback(async () => {
        if (!activeLesson || !user) return;

        const progressId = buildLessonProgressId(courseId, activeLesson.id);

        // 1. Optimistic Update (UI Instantánea)
        setCompletedLessonIds(prev => {
            const newSet = new Set(prev);
            newSet.add(progressId);
            return newSet;
        });

        // 2. Persistencia (API Call)
        try {
            await progressService.markLessonAsCompleted(courseId, activeLesson.id);
        } catch (error) {
            console.error("Error saving progress:", error);
            // Rollback en caso de error
            setCompletedLessonIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(progressId);
                return newSet;
            });
            toast.error("No se pudo guardar el progreso.");
        }
    }, [activeLesson, courseId, user]);

    /**
     * Verifica si una lección específica (por su ID crudo, ej. "l_101") está completada.
     */
    const isLessonCompleted = useCallback((id) => {
        return completedLessonIds.has(buildLessonProgressId(courseId, id));
    }, [completedLessonIds, courseId]);


    // 5. EXPORTAR VALORES
    const value = {
        // State
        course,
        courseId,
        activeLesson,
        isLoading,
        error,
        isSidebarOpen,
        
        // Computed
        flatLessons,
        nextLesson,
        previousLesson,
        progressPercentage,
        
        // Actions
        toggleSidebar,
        markCurrentAsCompleted,
        isLessonCompleted, // Helper para UI
    };

    return (
        <CoursePlayerContext.Provider value={value}>
            {children}
        </CoursePlayerContext.Provider>
    );
};

// Hook personalizado para consumo rápido
// eslint-disable-next-line react-refresh/only-export-components
export const useCoursePlayer = () => {
    const context = useContext(CoursePlayerContext);
    if (!context) {
        throw new Error('useCoursePlayer must be used within a CoursePlayerProvider');
    }
    return context;
};