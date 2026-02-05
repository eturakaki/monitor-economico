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
// Asumimos existencia de este servicio
import { progressService } from '../services/learning/progress.service'; 

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
    
    // Estado para "Optimistic UI" del progreso (Ids de lecciones completadas)
    const [completedLessonIds, setCompletedLessonIds] = useState(new Set());

    const { user } = useAuth();

    // 2. CARGA DE DATOS (Data Fetching)
    useEffect(() => {
        let isMounted = true;

        const initPlayer = async () => {
            if (!courseId) return;
            
            setIsLoading(true);
            try {
                // A. Cargar metadata del curso + contenido
                const courseData = await courseService.getCourseById(courseId);
                
                if (isMounted) {
                    setCourse(courseData);
                    
                    // B. Sincronizar progreso inicial
                    const initialCompleted = new Set();
                    
                    // Si el curso ya trae flags isCompleted (del merge en backend/servicio)
                    if (courseData.modules) {
                        courseData.modules.forEach(m => {
                            m.lessons.forEach(l => {
                                if (l.isCompleted) initialCompleted.add(l.id);
                            });
                        });
                    }
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
        
        const targetId = activeLesson.id;

        // 1. Optimistic Update (UI Instantánea)
        setCompletedLessonIds(prev => {
            const newSet = new Set(prev);
            newSet.add(targetId);
            return newSet;
        });

        // 2. Persistencia (API Call)
        try {
            // [FIX] Validamos y llamamos al método con el nombre correcto: markLessonAsCompleted
            if (progressService && typeof progressService.markLessonAsCompleted === 'function') {
                await progressService.markLessonAsCompleted(courseId, targetId);
            }
        } catch (error) {
            console.error("Error saving progress:", error);
            // Rollback en caso de error
            setCompletedLessonIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(targetId);
                return newSet;
            });
            toast.error("No se pudo guardar el progreso.");
        }
    }, [activeLesson, courseId, user]);

    /**
     * Verifica si una lección específica está completada
     */
    const isLessonCompleted = useCallback((id) => {
        return completedLessonIds.has(id);
    }, [completedLessonIds]);


    // 5. EXPORTAR VALORES
    const value = {
        // State
        course,
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