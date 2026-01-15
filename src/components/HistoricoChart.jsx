import { useLayoutEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

/**
 * HOOK: useSuppressRechartsWarnings
 * Rationale: Recharts tiene un bug conocido con ResizeObserver en React 18 strict mode.
 * Mantenemos este hook porque es vital para evitar ruido en la consola en desarrollo.
 */
const useSuppressRechartsWarnings = () => {
  useLayoutEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      if (/defaultProps/.test(args[0]) || /ResizeObserver/.test(args[0])) return;
      originalError.call(console, ...args);
    };
    return () => {
      console.error = originalError;
    };
  }, []);
};

/**
 * COMPONENTE: CustomTooltip
 * Rationale: Diseño "Bloomberg". Mantenemos la estética Glassmorphism y tabular-nums.
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
          <p className="text-[10px] text-slate-400 font-medium">Cierre</p>
          <p className="text-slate-900 dark:text-slate-50 text-xl font-black font-mono tracking-tight tabular-nums">
            {formatter.format(valor)}{esPorcentaje ? '%' : ''}
          </p>
        </div>
      </div>
    </div>
  );
};

export function HistoricoChart({ datos, color = "#10b981", esPorcentaje = false }) {
  // 1. Aplicamos el silenciador de logs
  useSuppressRechartsWarnings();

  // ELIMINADO: const [mounted, setMounted]...
  // Rationale: En Vite (CSR), el componente se monta directamente en el cliente.
  // No hay riesgo de "Hydration Mismatch" severo como en Next.js.
  // Esto elimina el "Cascading Render" y satisface al linter.

  if (!datos || datos.length === 0) {
    return (
      // Usamos h-full o una altura fija consistente para evitar saltos de layout
      <div className="h-[350px] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400">
        <span className="text-3xl mb-2">📉</span>
        <p className="font-medium text-sm">Sin datos históricos</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[350px] select-none transition-all duration-300">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={datos} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          
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
      </ResponsiveContainer>
    </div>
  );
}