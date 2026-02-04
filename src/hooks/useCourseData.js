import { useState, useEffect } from 'react';
import { courseService } from '../services/learning/course.service';

/**
 * Hook personalizado para gestionar la obtención de datos del curso.
 * Centraliza la lógica de Carga (Loading), Error y Éxito.
 */
export const useCourseData = (courseId) => {
  const [course, setCourse] = useState(null); // Aquí guardaremos la data unificada
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Si no hay ID, no hacemos nada (o reseteamos)
    if (!courseId) return;

    const fetchData = async () => {
      // 1. Iniciamos estado de carga
      setIsLoading(true);
      setError(null);

      try {
        // 2. Pedimos los datos al Servicio (que internamente decide si usa Mock o Real)
        const data = await courseService.getCourseById(courseId);
        
        // 3. Guardamos el éxito
        setCourse(data);
      } catch (err) {
        // 4. Manejamos el error
        console.error("[useCourseData] Error:", err);
        setError(err.message || "Error al cargar el curso");
      } finally {
        // 5. Finalizamos la carga (sea éxito o error)
        setIsLoading(false);
      }
    };

    fetchData();

  }, [courseId]); // Se re-ejecuta si cambias de curso (ej: del curso 1 al curso 2)

  // Retornamos lo que la UI necesita para dibujar
  return { course, isLoading, error };
};