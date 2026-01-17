import { useMemo, useState, useEffect, useRef } from 'react';
import { AreaChart, Area } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Minus, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * COMPONENTE: StatCard v9.6 (Lint Free & UX Enhanced)
 * ---------------------------------------------------
 * Architect Notes:
 * 1. Fix Linter: La prop 'Icono' ahora se renderiza dinámicamente tanto en el header 
 * como en el estado vacío del gráfico.
 * 2. Performance: Mantiene el motor ResizeObserver para gráficos fluidos.
 * 3. Theme: Mantiene la lógica de colores semánticos (Bullish/Bearish).
 */
export function StatCard({ 
  id, 
  titulo, 
  valor, 
  variacion, 
  historial, 
  esInverso = false,
  Icono = Activity, // eslint-disable-line no-unused-vars
  subtexto,
  datoAnterior,
  cambioAbsoluto
}) {

  // --- 1. LÓGICA DE ICONOS DE TENDENCIA ---
  // Determinamos qué flecha mostrar según si sube o baja
  let FlechaTendencia = Minus;
  if (variacion > 0) FlechaTendencia = ArrowUpRight;
  if (variacion < 0) FlechaTendencia = ArrowDownRight;

  // --- 2. MOTOR DE TEMAS (Semántica Financiera) ---
  const theme = useMemo(() => {
    // Matemática financiera: En indicadores "inversos" (ej: Dólar, Riesgo),
    // una baja (variacion < 0) es algo BUENO (verde).
    const esNegativoMatematicamente = variacion < 0;
    const esNeutro = variacion === 0;
    const esBuenaNoticia = esInverso ? esNegativoMatematicamente : !esNegativoMatematicamente;

    // Caso: Sin variación (Neutro)
    if (esNeutro) return {
      color: "text-slate-500",
      bgBody: "bg-white dark:bg-slate-900", 
      bgBadge: "bg-slate-200 dark:bg-slate-800",
      stroke: "#94a3b8", // Slate-400
      fill: "url(#grad-neutral)",
      hoverBorder: "hover:border-slate-500",
      titleHover: "group-hover:text-slate-800 dark:group-hover:text-slate-200" 
    };

    // Caso: Tendencia Positiva/Negativa
    return esBuenaNoticia ? {
      color: "text-emerald-600 dark:text-emerald-400",
      bgBody: "bg-gradient-to-b from-emerald-50/80 to-white dark:bg-none dark:bg-slate-900",
      bgBadge: "bg-emerald-100 dark:bg-emerald-500/10",
      stroke: "#10b981", // Emerald-500
      fill: "url(#grad-up)",
      hoverBorder: "hover:border-emerald-500/50",
      titleHover: "group-hover:text-emerald-700 dark:group-hover:text-emerald-400"
    } : {
      color: "text-rose-600 dark:text-rose-400",
      bgBody: "bg-gradient-to-b from-rose-50/80 to-white dark:bg-none dark:bg-slate-900",
      bgBadge: "bg-rose-100 dark:bg-rose-500/10",
      stroke: "#f43f5e", // Rose-500
      fill: "url(#grad-down)",
      hoverBorder: "hover:border-rose-500/50",
      titleHover: "group-hover:text-rose-700 dark:group-hover:text-rose-400"
    };
  }, [variacion, esInverso]);

  // --- 3. DIMENSION ENGINE (Direct Dimension Injection) ---
  // Soluciona el error de width: -1 en Recharts usando un observador real del DOM.
  const chartContainerRef = useRef(null);
  const [chartDims, setChartDims] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // Si no hay historial o referencia, no observamos nada.
    if (!historial || historial.length === 0 || !chartContainerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        // Solo actualizamos si hay dimensiones válidas
        if (width > 0 && height > 0) {
            // requestAnimationFrame evita errores de "ResizeObserver loop limit exceeded"
            requestAnimationFrame(() => {
                setChartDims({ 
                    width: Math.floor(width), 
                    height: Math.floor(height) 
                });
            });
        }
      }
    });

    resizeObserver.observe(chartContainerRef.current);
    return () => resizeObserver.disconnect(); // Cleanup al desmontar
  }, [historial]);

  // --- 4. FORMATO DE MONEDA ---
  const formatoDinero = new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS', minimumFractionDigits: 0, maximumFractionDigits: 0
  });
  // Si el valor ya viene formateado (string), lo usamos tal cual; si es número, lo formateamos.
  const valorMostrado = typeof valor === 'number' ? formatoDinero.format(valor) : valor;

  return (
    <Link to={`/indicador/${id}`} className="block group h-full">
      <div className={`
        relative h-full flex flex-col justify-between overflow-hidden
        ${theme.bgBody}
        border border-slate-400 dark:border-slate-700/80 rounded-2xl
        shadow-sm hover:shadow-xl ${theme.hoverBorder}
        transition-all duration-300
      `}>
        
        <div className="p-4 sm:p-5 flex-1">
            
            {/* --- HEADER --- */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    {/* Badge del Icono */}
                    <div className={`
                      p-1.5 rounded-lg shadow-sm backdrop-blur-sm transition-colors duration-300
                      bg-white/80 dark:bg-slate-800 
                      text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200
                      group-hover:ring-1 group-hover:ring-slate-200 dark:group-hover:ring-slate-700
                    `}>
                        {/* ✅ FIX LINTER: Usamos la prop Icono dinámica */}
                        <Icono size={18} strokeWidth={2} />
                    </div>
                    
                    <div>
                        <h3 className={`
                          text-xs font-black uppercase tracking-wider
                          text-slate-600 dark:text-slate-300
                          transition-colors duration-300
                          ${theme.titleHover}
                        `}>
                            {titulo}
                        </h3>
                        {subtexto && <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{subtexto}</p>}
                    </div>
                </div>
            </div>

            {/* --- BODY & CHART --- */}
            <div className="flex items-center justify-between gap-4">
                {/* Valor Principal */}
                <div>
                    <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">
                        {valorMostrado}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                        <div className={`
                            flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-bold
                            ${theme.bgBadge} ${theme.color}
                        `}>
                            <FlechaTendencia size={14} strokeWidth={2.5} />
                            <span className="tabular-nums">{Math.abs(variacion)}%</span>
                        </div>
                    </div>
                </div>

                {/* Contenedor del Gráfico */}
                <div 
                    ref={chartContainerRef}
                    className="w-24 h-12 sm:w-28 sm:h-14 opacity-60 group-hover:opacity-100 transition-opacity mix-blend-multiply dark:mix-blend-normal relative"
                >
                    {historial && historial.length > 0 ? (
                        chartDims.width > 0 && chartDims.height > 0 && (
                            <AreaChart width={chartDims.width} height={chartDims.height} data={historial}>
                                <defs>
                                    <linearGradient id="grad-up" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="grad-down" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="grad-neutral" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#64748b" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#64748b" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <Area 
                                    type="monotone" 
                                    dataKey="valor" 
                                    stroke={theme.stroke} 
                                    strokeWidth={2} 
                                    fill={theme.fill}
                                    isAnimationActive={false} 
                                />
                            </AreaChart>
                        )
                    ) : (
                        // Estado Vacío (Sin historial)
                        <div className="w-full h-full flex items-center justify-center border border-dashed border-slate-300 dark:border-slate-700 rounded">
                            {/* ✅ FIX LINTER: Usamos el Icono dinámico en lugar de Activity hardcodeado */}
                            <Icono size={16} className="text-slate-300 dark:text-slate-600" />
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* --- FOOTER --- */}
        {(datoAnterior || cambioAbsoluto) && (
            <div className="px-4 py-3 bg-slate-100 dark:bg-slate-800/60 border-t border-slate-300 dark:border-slate-700/80 flex justify-between items-center text-xs">
                <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Anterior</span>
                    <span className="font-mono font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                        {datoAnterior || '-'}
                    </span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Cambio</span>
                    <span className={`font-mono font-bold tabular-nums ${theme.color}`}>
                        {variacion > 0 ? '+' : ''}{cambioAbsoluto || '-'}
                    </span>
                </div>
            </div>
        )}

      </div>
    </Link>
  );
}