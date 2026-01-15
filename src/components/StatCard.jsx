import { useMemo } from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Minus, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * COMPONENTE: StatCard v9.1 (Title Enhanced)
 * * Objetivo: Mejorar la distinción del título sin tocar el resto del diseño.
 * * Cambios:
 * - Título: font-black (más grueso) + color base más oscuro.
 * - Interacción: El título cambia de color (Verde/Rojo) al hacer hover (group-hover).
 */
export function StatCard({ 
  id, 
  titulo, 
  valor, 
  variacion, 
  historial, 
  esInverso = false, 
  Icono = Activity, 
  subtexto,
  datoAnterior,
  cambioAbsoluto
}) {

  let FlechaTendencia = Minus;
  if (variacion > 0) FlechaTendencia = ArrowUpRight;
  if (variacion < 0) FlechaTendencia = ArrowDownRight;

  const theme = useMemo(() => {
    const esNegativoMatematicamente = variacion < 0;
    const esNeutro = variacion === 0;
    const esBuenaNoticia = esInverso ? esNegativoMatematicamente : !esNegativoMatematicamente;

    if (esNeutro) return {
      color: "text-slate-500",
      bgBody: "bg-white dark:bg-slate-900", 
      bgBadge: "bg-slate-200 dark:bg-slate-800",
      stroke: "#94a3b8",
      fill: "url(#grad-neutral)",
      hoverBorder: "hover:border-slate-500",
      // Título al hacer hover: Se pone negro oscuro (porque es neutro)
      titleHover: "group-hover:text-slate-800 dark:group-hover:text-slate-200" 
    };

    return esBuenaNoticia ? {
      color: "text-emerald-600 dark:text-emerald-400",
      bgBody: "bg-gradient-to-b from-emerald-50/80 to-white dark:bg-none dark:bg-slate-900",
      bgBadge: "bg-emerald-100 dark:bg-emerald-500/10",
      stroke: "#10b981", 
      fill: "url(#grad-up)",
      hoverBorder: "hover:border-emerald-500/50",
      // Título al hacer hover: Se pone VERDE
      titleHover: "group-hover:text-emerald-700 dark:group-hover:text-emerald-400"
    } : {
      color: "text-rose-600 dark:text-rose-400",
      bgBody: "bg-gradient-to-b from-rose-50/80 to-white dark:bg-none dark:bg-slate-900",
      bgBadge: "bg-rose-100 dark:bg-rose-500/10",
      stroke: "#f43f5e", 
      fill: "url(#grad-down)",
      hoverBorder: "hover:border-rose-500/50",
      // Título al hacer hover: Se pone ROJO
      titleHover: "group-hover:text-rose-700 dark:group-hover:text-rose-400"
    };
  }, [variacion, esInverso]);

  const formatoDinero = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });

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
        
        {/* --- HEADER & BODY --- */}
        <div className="p-4 sm:p-5 flex-1">
            
            {/* Título e Icono (MEJORADO) */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    {/* Icono: Un poco más grande el contenedor para dar aire */}
                    <div className={`
                      p-1.5 rounded-lg shadow-sm backdrop-blur-sm transition-colors duration-300
                      bg-white/80 dark:bg-slate-800 
                      text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200
                      /* Al hacer hover en la card, el icono también toma un tinte sutil del borde */
                      group-hover:ring-1 group-hover:ring-slate-200 dark:group-hover:ring-slate-700
                    `}>
                        <Icono size={18} strokeWidth={2} />
                    </div>
                    
                    <div>
                        {/* AQUÍ ESTÁ EL CAMBIO CLAVE:
                           1. font-black (Más grueso)
                           2. text-slate-600 (Más oscuro base)
                           3. theme.titleHover (Cambia de color con la interacción)
                        */}
                        <h3 className={`
                          text-xs font-black uppercase tracking-wider
                          text-slate-600 dark:text-slate-300
                          transition-colors duration-300
                          ${theme.titleHover}
                        `}>
                            {titulo}
                        </h3>
                        {/* Subtexto un poco más visible */}
                        {subtexto && <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{subtexto}</p>}
                    </div>
                </div>
            </div>

            {/* Valor y Gráfico (INTACTO) */}
            <div className="flex items-center justify-between gap-4">
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

                <div className="w-24 h-12 sm:w-28 sm:h-14 opacity-60 group-hover:opacity-100 transition-opacity mix-blend-multiply dark:mix-blend-normal">
                    {historial && historial.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={historial}>
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
                        </ResponsiveContainer>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center border border-dashed border-slate-300 dark:border-slate-700 rounded">
                            <Activity size={16} className="text-slate-300" />
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* --- FOOTER DE DATOS (INTACTO) --- */}
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