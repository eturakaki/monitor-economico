import { useState, useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { 
  ArrowLeft, ArrowUpRight, ArrowDownRight, Minus, 
  Download, Info, TrendingUp, TrendingDown, 
  Activity, FileText
} from 'lucide-react';
import { misIndicadores } from '../data/monitores';
import { HistoricoChart } from '../components/HistoricoChart';

/**
 * COMPONENTE: DetalleIndicador v2.0 (Hooks Fixed)
 * Corrección: Mueve la validación de existencia (!indicador) DESPUÉS de los hooks.
 * Usa valores por defecto (variacion = 0, historial = []) para que los hooks
 * tengan datos "dummy" con los que trabajar antes de que ocurra la redirección.
 */
export function DetalleIndicador() {
  const { id } = useParams();
  const [rangoSeleccionado, setRangoSeleccionado] = useState('6M');

  // 1. Buscamos el indicador
  const indicador = misIndicadores.find(i => i.id === id);

  // --- CORRECCIÓN CLAVE ---
  // Desestructuramos con valores por defecto (Safety Nets).
  // Si 'indicador' es undefined, usamos {} y los defaults evitan que explote el código
  // antes de llegar al 'return <Navigate />'.
  const { 
    titulo, valor, variacion = 0, descripcion, historial = [], 
    esInverso = false, subtexto, datoAnterior, categoria, cambioAbsoluto 
  } = indicador || {};

  // --- 2. LÓGICA DE SENTIMIENTO (Hooks Incondicionales) ---
  // Ahora esto se ejecuta SIEMPRE, incluso si el indicador no existe (usará variacion=0).
  let FlechaTendencia = Minus;
  if (variacion > 0) FlechaTendencia = ArrowUpRight;
  if (variacion < 0) FlechaTendencia = ArrowDownRight;

  const theme = useMemo(() => {
    const esNegativoMatematicamente = variacion < 0;
    const esNeutro = variacion === 0;
    const esBuenaNoticia = esInverso ? esNegativoMatematicamente : !esNegativoMatematicamente;

    if (esNeutro) return {
      color: "text-slate-500",
      bgBadge: "bg-slate-100 dark:bg-slate-800",
      textBadge: "text-slate-600 dark:text-slate-400",
      chartColor: "#64748b",
      border: "border-slate-200 dark:border-slate-700"
    };

    return esBuenaNoticia ? {
      color: "text-emerald-600 dark:text-emerald-400",
      bgBadge: "bg-emerald-500/10",
      textBadge: "text-emerald-700 dark:text-emerald-400",
      chartColor: "#10b981",
      border: "border-emerald-200 dark:border-emerald-500/30"
    } : {
      color: "text-rose-600 dark:text-rose-400",
      bgBadge: "bg-rose-500/10",
      textBadge: "text-rose-700 dark:text-rose-400",
      chartColor: "#f43f5e",
      border: "border-rose-200 dark:border-rose-500/30"
    };
  }, [variacion, esInverso]);

  // --- 3. ESTADÍSTICAS (Hooks Incondicionales) ---
  const stats = useMemo(() => {
    if (!historial || historial.length === 0) return null;
    const valores = historial.map(d => d.valor);
    const min = Math.min(...valores);
    const max = Math.max(...valores);
    const avg = valores.reduce((a, b) => a + b, 0) / valores.length;
    
    const fmt = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
    
    return {
      min: fmt.format(min),
      max: fmt.format(max),
      avg: fmt.format(avg),
      count: valores.length
    };
  }, [historial]);

  // --- 4. AHORA SÍ: VALIDACIÓN Y RETORNO ---
  // Una vez que React está feliz porque corrió sus hooks, verificamos si tenemos datos.
  // Si no, redirigimos.
  if (!indicador) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1121] pb-20 transition-colors duration-300 font-sans">
      
      {/* HEADER */}
      <nav className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link 
            to="/" 
            className="group flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <div className="p-1.5 rounded-lg group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-colors">
                <ArrowLeft size={18} />
            </div>
            <span className="font-semibold text-sm">Dashboard</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span className="uppercase tracking-wider">Inicio</span>
            <span>/</span>
            <span className="uppercase tracking-wider">{categoria}</span>
            <span>/</span>
            <span className="text-slate-900 dark:text-slate-200 uppercase tracking-wider">{id}</span>
          </div>

          <div className="flex gap-2">
             <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <Download size={16} />
                <span className="hidden sm:inline">Exportar Datos</span>
             </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* HERO */}
        <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                            {categoria}
                        </span>
                        <div className="flex items-center gap-1 text-emerald-500 animate-pulse">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                            <span className="text-[10px] font-bold uppercase tracking-wider">Mercado Abierto</span>
                        </div>
                    </div>
                    
                    <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                        {titulo}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm sm:text-base max-w-2xl">
                        {descripcion || "Indicador económico monitoreado en tiempo real."}
                    </p>
                </div>

                {/* PRECIO */}
                <div className="text-left sm:text-right">
                    <div className="flex items-baseline justify-start sm:justify-end gap-3 sm:gap-4">
                        <span className="text-5xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">
                            {valor}
                        </span>
                    </div>
                    
                    <div className="flex items-center justify-start sm:justify-end gap-3 mt-1">
                        <div className={`
                            flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-sm sm:text-base
                            ${theme.bgBadge} ${theme.textBadge}
                        `}>
                            <FlechaTendencia size={18} strokeWidth={3} />
                            <span className="tabular-nums">{Math.abs(variacion)}%</span>
                        </div>
                        <span className={`text-sm font-bold tabular-nums ${theme.color}`}>
                           {variacion > 0 ? '+' : ''}{cambioAbsoluto || '-'}
                        </span>
                        <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Hoy</span>
                    </div>
                </div>
            </div>
        </div>

        {/* GRID LAYOUT */}
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
            
            {/* IZQUIERDA: GRÁFICO */}
            <div className="lg:col-span-2 space-y-6">
                
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                        <div className="flex items-center gap-2">
                             <Activity size={16} className="text-slate-400" />
                             <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Evolución de Precio
                             </span>
                        </div>
                        <div className="flex bg-slate-200 dark:bg-slate-800 rounded-lg p-0.5">
                            {['1M', '6M', 'YTD', '1Y', 'ALL'].map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setRangoSeleccionado(range)}
                                    className={`
                                        px-3 py-1 rounded-md text-[10px] font-bold transition-all
                                        ${rangoSeleccionado === range 
                                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}
                                    `}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-2 sm:p-6 h-[400px]">
                        <HistoricoChart 
                            datos={historial} 
                            color={theme.chartColor} 
                            esPorcentaje={titulo?.includes('Tasa') || titulo?.includes('Inflación')} 
                        />
                    </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-xl p-4 flex gap-3">
                    <Info className="text-blue-600 dark:text-blue-400 shrink-0" size={20} />
                    <div className="space-y-1">
                        <h4 className="text-sm font-bold text-blue-800 dark:text-blue-300">Análisis del Indicador</h4>
                        <p className="text-xs text-blue-700/80 dark:text-blue-400/80 leading-relaxed">
                            Este activo muestra una tendencia {variacion > 0 ? 'alcista' : (variacion < 0 ? 'bajista' : 'neutral')} en la última jornada. 
                            Se recomienda monitorear la volatilidad en las próximas ruedas cambiarias debido a {subtexto || 'factores macroeconómicos'}.
                        </p>
                    </div>
                </div>
            </div>

            {/* DERECHA: DATOS DUROS */}
            <div className="space-y-6">
                
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                        <FileText size={16} className="text-slate-400" />
                        Estadísticas Clave
                    </h3>
                    
                    <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800 border-dashed">
                            <span className="text-xs text-slate-500 font-medium">Cierre Anterior</span>
                            <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">{datoAnterior || '-'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800 border-dashed">
                            <span className="text-xs text-slate-500 font-medium">Apertura</span>
                            <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">{datoAnterior || '-'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800 border-dashed">
                            <span className="text-xs text-slate-500 font-medium">Rango Diario</span>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
                                {datoAnterior} - {valor}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800 border-dashed">
                            <span className="text-xs text-slate-500 font-medium">Mínimo (Periodo)</span>
                            <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">{stats?.min || '-'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800 border-dashed">
                            <span className="text-xs text-slate-500 font-medium">Máximo (Periodo)</span>
                            <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">{stats?.max || '-'}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-5">
                    <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
                        Resumen de Mercado
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Tendencia</p>
                            <div className={`flex items-center gap-1 font-bold text-sm ${theme.color}`}>
                                {variacion > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                {variacion > 0 ? 'Alcista' : 'Bajista'}
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Volatilidad</p>
                            <div className="flex items-center gap-1 font-bold text-sm text-slate-700 dark:text-slate-200">
                                <Activity size={16} className="text-orange-500" />
                                Media
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

      </main>
    </div>
  );
}