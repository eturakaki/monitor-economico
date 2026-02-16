import React from 'react';
// 1. IMPORTACIONES DEL MOTOR DE FÍSICA (DND-KIT)
// useSortable: Es el cerebro. Nos da las coordenadas y el estado (si se está arrastrando o no).
import { useSortable } from '@dnd-kit/sortable';
// CSS: Utilidad para convertir los números matemáticos de dnd-kit a estilos CSS reales.
import { CSS } from '@dnd-kit/utilities';
// Icono para el botón de cambiar tamaño
import { Maximize2 } from 'lucide-react'; 

export function SortableWidget({ id, children, className, isEditing, onResize }) {
  
  // --- 2. EL HOOK DE FÍSICA (EL CORAZÓN) ---
  const {
    attributes,  // Atributos de accesibilidad (ARIA) para lectores de pantalla.
    listeners,   // Los eventos del mouse/touch (onMouseDown, onTouchStart, etc).
    setNodeRef,  // Función para conectar este componente con el sistema de dnd-kit.
    transform,   // Objeto con las coordenadas X e Y de cuánto se ha movido el widget.
    transition,  // Animación suave calculada automáticamente por la librería.
    isDragging   // Booleano: ¿Lo estoy agarrando ahora mismo? (true/false)
  } = useSortable({ 
    id, // Identificador único del widget (ej: 'dolar-blue').
    disabled: !isEditing // 🔒 CANDADO DE SEGURIDAD: Si no estamos en modo edición, desactivamos la física.
  });

  // --- 3. ESTILOS DINÁMICOS DE RENDIMIENTO ---
  const style = {
    // Usamos 'Translate' en lugar de 'Transform' puro.
    // Esto es vital en Grids: evita que el elemento se deforme visualmente al cambiar de posición.
    transform: CSS.Translate.toString(transform),
    
    transition, // Aplica la suavidad al soltar el elemento.
    
    // CAPAS (Z-INDEX):
    // Si arrastro (100): El elemento flota POR ENCIMA de todo lo demás.
    // Si está quieto ('auto'): Se comporta normal.
    zIndex: isDragging ? 100 : 'auto', 
    
    // FEEDBACK VISUAL: Lo hacemos un poco transparente al arrastrar para ver qué hay debajo.
    opacity: isDragging ? 0.9 : 1,
    
    // UX MÓVIL: Evita que el navegador haga scroll o refresh al intentar arrastrar el widget.
    touchAction: 'none',
    
    // Necesario para que el z-index funcione y para posicionar el botón de resize absoluto.
    position: 'relative'
  };

  return (
    <div 
      ref={setNodeRef} // Conectamos el div al sistema de dnd-kit
      style={style}    // Aplicamos los estilos calculados arriba
      {...attributes}  // Esparcimos los atributos de accesibilidad
      {...listeners}   // Esparcimos los eventos (hace que todo el div sea "agarrable")
      className={`
        ${className} 
        /* Transiciones suaves para todo cambio de estado */
        transition-all duration-300 ease-out
        
        /* ESTADO: ARRASTRANDO (Dragging) */
        ${isDragging ? 'scale-[1.02] shadow-2xl ring-2 ring-emerald-400 z-50 cursor-grabbing' : ''}
        
        /* ESTADO: MODO EDICIÓN (Quieto) */
        /* Mostramos un borde punteado (dashed) para indicar que es editable */
        ${isEditing && !isDragging ? 'ring-2 ring-dashed ring-slate-700/50 cursor-grab hover:ring-emerald-500/50' : ''}
      `}
    >
      {/* 4. CONTENEDOR DEL WIDGET REAL 
         Envolvemos el 'children' (StatCard) para poder bajarle la opacidad 
         independientemente del borde o el botón de resize.
      */}
      <div className={`h-full w-full transition-opacity duration-200 ${isDragging ? 'opacity-80' : 'opacity-100'}`}>
        {children}
      </div>

      {/* 5. CONTROL HOLOGRÁFICO (BOTÓN DE RESIZE)
         Solo se renderiza si isEditing es true.
      */}
      {isEditing && (
        <div 
            // Posicionamos el botón saliendo un poco por la esquina (-bottom-3 -right-3)
            className="absolute -bottom-3 -right-3 z-[60] animate-in fade-in zoom-in duration-300"
            
            // 🛑 CRÍTICO: Detenemos la propagación del evento.
            // Si no hacemos esto, al hacer click en el botón, el 'listeners' del padre
            // pensará que queremos arrastrar el widget en lugar de cambiarle el tamaño.
            onPointerDown={(e) => e.stopPropagation()} 
        >
            <div className="relative group">
              {/* EFECTO GLOW (Sombra de Luz):
                 Un div detrás del botón con blur y animate-pulse para simular energía.
              */}
              <div className="absolute inset-0 bg-emerald-500 rounded-full blur opacity-20 group-hover:opacity-60 animate-pulse transition-opacity duration-500"></div>
              
              <button
                onClick={(e) => {
                  e.preventDefault();  // Evita comportamientos raros del navegador
                  e.stopPropagation(); // Doble seguridad para no activar el Drag
                  if(onResize) onResize(id); // Ejecutamos la función que viene del Dashboard
                }}
                className="
                  /* Diseño Glassmorphism (Vidrio) */
                  relative flex items-center justify-center w-10 h-10
                  bg-slate-900/80 backdrop-blur-md 
                  border border-slate-700 group-hover:border-emerald-500/50
                  text-slate-400 group-hover:text-emerald-400
                  rounded-full shadow-lg 
                  
                  /* Animaciones de interacción */
                  transition-all duration-300 ease-out
                  group-hover:scale-110      /* Crece al pasar el mouse */
                  group-active:scale-90      /* Se achica al hacer click (efecto presión) */
                  group-active:bg-slate-800
                "
                title="Cambiar tamaño"
              >
                {/* El icono rota 90 grados al hacer hover para invitar a la acción */}
                <Maximize2 
                  size={18} 
                  strokeWidth={2.5} 
                  className="transition-transform duration-500 group-hover:rotate-90" 
                />
              </button>

              {/* TOOLTIP FLOTANTE 
                 Aparece a la izquierda del botón solo en hover.
              */}
              <span className="
                absolute right-full mr-2 top-1/2 -translate-y-1/2
                px-2 py-1 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider rounded-md
                opacity-0 group-hover:opacity-100   /* Fade In */
                -translate-x-2 group-hover:translate-x-0 /* Slide In */
                transition-all duration-300 pointer-events-none whitespace-nowrap shadow-xl border border-slate-800
              ">
                Cambiar Tamaño
              </span>
            </div>
        </div>
      )}
    </div>
  );
}