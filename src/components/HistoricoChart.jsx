import { useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

// ==========================================
// 1. COMPONENTE AUXILIAR: TOOLTIP (La etiqueta flotante)
// ==========================================
// Este componente define cómo se ve el cuadrito cuando pasás el mouse por el gráfico.
const CustomTooltip = ({ active, payload, label, esPorcentaje }) => {
  // 'active': true si el usuario tiene el mouse encima.
  // 'payload': array con los datos de ese punto específico (precio, fecha).
  if (active && payload && payload.length) {
    const valor = payload[0].value;
    
    // TRUCO PRO: Usamos Intl.NumberFormat
    // Es la forma nativa de JS para formatear plata. Pone solo los puntos y signos.
    // 'es-AR' le dice que use el formato de Argentina (puntos para miles, coma para decimales).
    const valorFormateado = esPorcentaje 
      ? `${valor}%`
      : new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(valor);

    return (
      <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-xl">
        {/* La fecha en chiquito arriba */}
        <p className="text-gray-500 text-xs font-bold mb-1 uppercase tracking-wider">{label}</p>
        {/* El precio grande y en negrita */}
        <p className="text-gray-900 text-lg font-black font-mono">
          {valorFormateado}
        </p>
      </div>
    );
  }
  return null;
};

// ==========================================
// 2. COMPONENTE PRINCIPAL DEL GRÁFICO
// ==========================================
export function HistoricoChart({ datos, color = "#10b981", esPorcentaje = false }) {
  
  // --- A. EL SILENCIADOR NUCLEAR (Gestión de Logs) ---
  // Este useEffect intercepta CUALQUIER mensaje de la consola.
  // IMPORTANTE: Ahora filtramos tanto console.ERROR como console.WARN (Advertencias).
  useEffect(() => {
    // 1. Guardamos las funciones originales del navegador.
    const originalWarn = console.warn;
    const originalError = console.error;

    // 2. Función filtro: Decide si el mensaje pasa o se bloquea.
    const filterConsole = (originalFunc, args) => {
      const msg = args[0];
      // Si el mensaje es texto y menciona "width" Y "height"...
      if (typeof msg === 'string' && msg.includes('width') && msg.includes('height')) {
        return; // ...¡Lo bloqueamos! (No se muestra nada) 🤫
      }
      // Si es otro error, lo dejamos pasar.
      originalFunc(...args);
    };

    // 3. Reemplazamos las funciones globales por las nuestras filtradas.
    console.warn = (...args) => filterConsole(originalWarn, args);
    console.error = (...args) => filterConsole(originalError, args);

    // 4. Limpieza: Cuando salimos de la pantalla, devolvemos todo a la normalidad.
    return () => {
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, []);

  // --- B. ESTADO DE CARGA (Estabilidad Visual) ---
  // Usamos esto para darle 100ms al navegador para que calcule los tamaños antes de dibujar.
  const [estaListo, setEstaListo] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setEstaListo(true); // ¡Listo para dibujar!
    }, 100); 
    return () => clearTimeout(timer);
  }, []);

  // --- C. VALIDACIONES (Guard Clauses) ---
  
  // Si no hay datos, mostramos un aviso en vez de romper la app.
  if (!datos || datos.length === 0) {
    return (
      <div className="h-[350px] flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-gray-100 text-gray-400">
        <p>Sin datos históricos disponibles 📉</p>
      </div>
    );
  }

  // Si todavía estamos en los 100ms de espera, mostramos un espacio vacío transparente.
  if (!estaListo) {
    return <div className="w-full h-[350px] bg-transparent" />;
  }

  // Helper para decidir si mostrar "%" o nada en el eje Y
  const formatYAxis = (tick) => {
    if (esPorcentaje) return `${tick}%`;
    return tick; 
  };

  // --- D. RENDERIZADO (El Dibujo) ---
  return (
    // Forzamos style={{ width: '100%', height: 350 }} para asegurar que el contenedor tenga medidas físicas.
    // 'min-w-0' evita desbordes en Flexbox.
    <div style={{ width: '100%', height: 350 }} className="min-w-0">
      
      {/* ResponsiveContainer hace que el gráfico sea elástico.
          debounce={1} ayuda a que no se vuelva loco si redimensionás la ventana rápido. */}
      <ResponsiveContainer width="100%" height="100%" debounce={1}>
        
        <AreaChart data={datos} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
           
           {/* DEFS: Aquí definimos el degradado de color (Gradient) */}
           <defs>
              <linearGradient id="colorGradiente" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/> {/* Arriba: Color suave */}
                <stop offset="95%" stopColor={color} stopOpacity={0}/>   {/* Abajo: Transparente */}
              </linearGradient>
           </defs>
           
           {/* La grilla de fondo (líneas punteadas) */}
           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
           
           {/* Eje X (Fechas) */}
           <XAxis 
              dataKey="fecha" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 500 }}
              dy={10} // Separación vertical
              minTickGap={30} // Evita que los textos se encimen
           />
           
           {/* Eje Y (Valores) */}
           <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 500 }}
              domain={['auto', 'auto']} // Escala automática según max y min
              tickFormatter={formatYAxis}
              width={45} 
           />
           
           {/* El tooltip personalizado que definimos arriba */}
           <Tooltip content={<CustomTooltip esPorcentaje={esPorcentaje} />} />
           
           {/* La curva propiamente dicha */}
           <Area 
              type="monotone" // 'monotone' hace la curva suave.
              dataKey="valor" 
              stroke={color} // El color de la línea (verde o rojo)
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#colorGradiente)" // Relleno con el degradado
              animationDuration={1500} // Animación de entrada
           />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}