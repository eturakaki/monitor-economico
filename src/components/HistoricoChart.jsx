import { useState, useEffect, useRef } from 'react';
// 1. RECHARTS: Eliminamos ResponsiveContainer. Importamos lo necesario.
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

/**
 * COMPONENTE: CustomTooltip
 * Rationale: Diseño "Bloomberg". Mantenemos la estética Glassmorphism y tabular-nums.
 * (Sin cambios visuales, solo validaciones de seguridad).
 */
const CustomTooltip = ({ active, payload, label, esPorcentaje }) => {
  if (!active || !payload || !payload.length) return null;

  const valor = payload[0].value;
  const color = payload[0].stroke;

  const formatter = new Intl.NumberFormat('es-AR', {
    style: esPorcentaje ? 'decimal' : 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });

  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-3 border border-slate-200 dark:border-slate-700 shadow-xl rounded-lg min-w-[140px]">
      <p className="text-slate-500 dark:text-slate-400 text-xs font-bold mb-1 uppercase tracking-wider">
        {label}
      </p>
      <div className="flex items-center gap-2">
        <div className="w-1 h-8 rounded-full" style={{ backgroundColor: color }}></div>
        <div>
          <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">Cierre</p>
          <p className="text-slate-900 dark:text-slate-50 text-xl font-black font-mono tracking-tight tabular-nums">
            {formatter.format(valor)}{esPorcentaje ? '%' : ''}
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * COMPONENTE: HistoricoChart v10.0 (Titanium Fix)
 * * ARCHITECT NOTE:
 * Se reemplazó el uso de ResponsiveContainer por el patrón "Direct Dimension Injection"
 * usando ResizeObserver. Esto elimina los errores de consola "width(-1)" durante
 * las transiciones de página y garantiza un renderizado estable.
 */
export function HistoricoChart({ datos, color = "#10b981", esPorcentaje = false }) {
  
  // 🛡️ DIMENSION ENGINE
  const chartRef = useRef(null);
  const [chartDims, setChartDims] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // Si no hay referencia, abortamos.
    if (!chartRef.current) return;

    // Instanciamos el Observador de Geometría
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        // Solo renderizamos si el contenedor tiene existencia física (>0)
        if (width > 0 && height > 0) {
          requestAnimationFrame(() => {
            setChartDims({ 
              width: Math.floor(width), 
              height: Math.floor(height) 
            });
          });
        }
      }
    });

    // Empezamos a vigilar
    resizeObserver.observe(chartRef.current);

    // Limpieza al desmontar
    return () => resizeObserver.disconnect();
  }, []); // Array vacío: Solo se monta el observer una vez

  // --- Renderizado de Estado Vacío ---
  if (!datos || datos.length === 0) {
    return (
      <div className="h-[350px] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
        <span className="text-3xl mb-2">📉</span>
        <p className="font-medium text-sm">Sin datos históricos</p>
      </div>
    );
  }

  return (
    // Asignamos la ref al contenedor padre
    // Importante: 'relative' crea el contexto para posicionamiento si fuera necesario.
    <div 
      ref={chartRef} 
      className="w-full h-[350px] select-none transition-all duration-300 relative"
    >
      {/* Zero Trust Rendering:
        El AreaChart solo nace cuando chartDims tiene valores válidos.
        Esto evita que Recharts intente dibujar en el vacío (width 0/-1).
      */}
      {chartDims.width > 0 && chartDims.height > 0 && (
        <AreaChart 
          width={chartDims.width} 
          height={chartDims.height} 
          data={datos} 
          margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
        >
          
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.4} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={false} 
            stroke="#334155"
            strokeOpacity={0.2}
          />

          <XAxis 
            dataKey="fecha" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
            dy={10}
            minTickGap={40}
          />

          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600, fontFamily: 'monospace' }} 
            domain={['auto', 'auto']}
            tickFormatter={(val) => esPorcentaje ? `${val}%` : val}
            width={40}
          />

          <Tooltip 
            content={<CustomTooltip esPorcentaje={esPorcentaje} />} 
            cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }}
          />

          <Area 
            type="monotone" 
            dataKey="valor" 
            stroke={color} 
            strokeWidth={3} 
            fillOpacity={1} 
            fill="url(#colorGradient)" 
            animationDuration={1500}
            isAnimationActive={true}
          />
        </AreaChart>
      )}
      
      {/* Loader Opcional: Podrías poner un spinner aquí si quisieras 
         mientras (chartDims.width === 0), pero es tan rápido (<16ms) 
         que suele ser imperceptible.
      */}
    </div>
  );
}