import { useMemo, useRef, useState, useLayoutEffect, useId } from 'react';
import { AreaChart, Area, YAxis } from 'recharts';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Minus, 
  Activity, 
  Database, 
  Calculator,
  Info,
} from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * COMPONENTE: StatCard v12.9 (Stable)
 * ---------------------------------------------------
 * Fixes:
 * 1. LINTER DIRECTIVE: Se aplica supresión explícita para la prop 'Icono'.
 * Motivo: El entorno de ESLint no detecta uso de variables en JSX.
 */
export function StatCard({ 
  id, 
  titulo, 
  valor, 
  variacion, 
  historial, 
  esInverso = false,
  // ⚠️ DIRECTIVA DE SEGURIDAD: Silenciamos el falso positivo aquí mismo.
  // eslint-disable-next-line no-unused-vars
  Icono = Activity, 
  subtexto,      
  descripcion,
  insight,
  datoAnterior,
  cambioAbsoluto,
  tipo 
}) {

  // 1. GENERACIÓN DE ID ESTABLE
  const internalId = useId();
  const cardId = id || internalId;

  const infoTexto = subtexto || descripcion || "";

  // 2. MOTOR DE TEMA
  const { theme, FlechaTendencia, variacionNum } = useMemo(() => {
    const varNum = typeof variacion === 'number' ? variacion : parseFloat(variacion) || 0;
    const esNegativo = varNum < 0;
    const esBuenaNoticia = esInverso ? esNegativo : !esNegativo;
    
    if (varNum === 0) {
        return {
            theme: {
                text: "text-slate-500",
                badge: "bg-slate-500/10 text-slate-500 border-slate-500/20",
                stroke: "#64748b",
                fill: "#64748b"
            },
            FlechaTendencia: Minus,
            variacionNum: 0
        };
    }

    const config = esBuenaNoticia ? {
        text: "text-emerald-400",
        badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        stroke: "#34d399",
        fill: "#34d399"
    } : {
        text: "text-rose-400",
        badge: "bg-rose-500/10 text-rose-400 border-rose-500/20",
        stroke: "#fb7185",
        fill: "#fb7185"
    };

    const Flecha = varNum > 0 ? ArrowUpRight : ArrowDownRight;
    return { theme: config, FlechaTendencia: Flecha, variacionNum: varNum };
  }, [variacion, esInverso]);

  // 3. BADGE LOGIC
  const isCalculated = (tipo || '').toLowerCase().includes('calcula');
  const BadgeIcon = isCalculated ? Calculator : Database;
  const badgeConfig = isCalculated
    ? { text: "CALCULADO", style: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20" }
    : { text: "OFICIAL", style: "bg-slate-800 text-slate-400 border-slate-700" };

  // 4. FORMATTERS
  const formatoDinero = useMemo(() => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency', currency: 'ARS', minimumFractionDigits: 0, maximumFractionDigits: 0
    });
  }, []);

  const valorDisplay = typeof valor === 'number' ? formatoDinero.format(valor) : (valor ?? '-');
  const anteriorDisplay = typeof datoAnterior === 'number' ? formatoDinero.format(datoAnterior) : (datoAnterior ?? '-');
  
  const cambioDisplay = useMemo(() => {
      if (cambioAbsoluto === undefined || cambioAbsoluto === null) return '-';
      if (typeof cambioAbsoluto === 'number') return formatoDinero.format(Math.abs(cambioAbsoluto));
      return cambioAbsoluto;
  }, [cambioAbsoluto, formatoDinero]);

  // 5. CHART RESIZER
  const chartContainerRef = useRef(null);
  const [dims, setDims] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (!chartContainerRef.current) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry && entry.contentRect) {
        setDims({ 
            width: Math.floor(entry.contentRect.width), 
            height: Math.floor(entry.contentRect.height) 
        });
      }
    });
    observer.observe(chartContainerRef.current);
    return () => observer.disconnect();
  }, []);

  const safeHistorial = useMemo(() => {
      if (!Array.isArray(historial) || historial.length < 2) return [];
      return historial.filter(h => typeof h.valor === 'number');
  }, [historial]);

  const showChart = safeHistorial.length > 0 && dims.width > 0;

  return (
    <Link to={`/indicador/${id}`} className="block h-full group outline-none focus:ring-2 focus:ring-indigo-500 rounded-2xl">
      <div className={`
        relative h-full flex flex-col justify-between overflow-hidden
        bg-[#0B1121] border border-slate-800 rounded-2xl
        group-hover:border-slate-600 group-hover:shadow-2xl group-hover:shadow-indigo-500/10 
        group-hover:-translate-y-1 transition-all duration-300 ease-out
      `}>
        
        {/* BACKGROUND CHART */}
        <div 
            ref={chartContainerRef} 
            className="absolute bottom-0 left-0 right-0 h-48 z-0 pointer-events-none opacity-20 group-hover:opacity-30 transition-opacity duration-500 mix-blend-screen"
        >
            {showChart && (
                <AreaChart width={dims.width} height={dims.height} data={safeHistorial} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id={`grad-${cardId}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={theme.stroke} stopOpacity={0.5}/>
                            <stop offset="100%" stopColor={theme.stroke} stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <Area 
                        type="monotone" 
                        dataKey="valor" 
                        stroke={theme.stroke} 
                        strokeWidth={2} 
                        fill={`url(#grad-${cardId})`}
                        isAnimationActive={false} 
                    />
                    <YAxis domain={['auto', 'auto']} hide />
                </AreaChart>
            )}
        </div>

        {/* CONTENT */}
        <div className="relative z-10 flex-1 flex flex-col p-6">
            
            {/* TOP BAR */}
            <div className="flex justify-between items-start mb-5">
                <div className={`
                    p-2.5 rounded-xl transition-colors duration-300
                    bg-slate-800/60 border border-slate-700/50 text-slate-400
                    group-hover:bg-slate-700 group-hover:text-slate-200 group-hover:border-slate-600
                `}>
                    {/* Renderizado Estándar */}
                    <Icono size={20} strokeWidth={1.5} />
                </div>

                <span className={`
                    flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border backdrop-blur-md
                    ${badgeConfig.style}
                `}>
                    <BadgeIcon size={10} strokeWidth={2.5} />
                    {badgeConfig.text}
                </span>
            </div>

            {/* DATA BLOCK */}
            <div className="mb-auto">
                <h3 className="text-sm font-medium text-slate-100 mb-1 tracking-wide">{titulo}</h3>
                <p 
                    title={infoTexto} 
                    className="text-xs text-slate-400 font-medium h-8 line-clamp-2 leading-tight mb-3"
                >
                    {infoTexto}
                </p>

                <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-black text-white tracking-tight font-mono tabular-nums">
                        {valorDisplay}
                    </span>
                    
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold tabular-nums border backdrop-blur-sm ${theme.badge}`}>
                        <FlechaTendencia size={12} strokeWidth={2.5} />
                        <span>{Math.abs(variacionNum)}%</span>
                    </div>
                </div>
            </div>

            {/* INSIGHT */}
            {insight && (
                <div className="mt-6 relative overflow-hidden rounded-lg bg-slate-800/40 border border-slate-700/30 backdrop-blur-sm p-3">
                    <div className="flex gap-2.5">
                        <Info className="text-indigo-400 shrink-0 mt-0.5" size={14} />
                        <p className="text-[11px] text-slate-300 leading-relaxed font-medium">{insight}</p>
                    </div>
                </div>
            )}
        </div>

        {/* FOOTER */}
        <div className="relative z-20 px-6 py-3 border-t border-slate-800/80 bg-slate-900/40 backdrop-blur-md flex justify-between items-center mt-2">
            <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Anterior</span>
                <span className="text-xs font-mono font-medium text-slate-400 tabular-nums">{anteriorDisplay}</span>
            </div>
            <div className="h-5 w-px bg-slate-800"></div>
            <div className="flex flex-col items-end">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Cambio Abs.</span>
                <span className={`text-xs font-mono font-bold tabular-nums ${theme.text}`}>
                    {variacionNum > 0 ? '+' : ''}{cambioDisplay}
                </span>
            </div>
        </div>

      </div>
    </Link>
  );
}