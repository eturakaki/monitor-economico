import { useState, useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { 
  ArrowLeft, ArrowUpRight, ArrowDownRight, Minus, 
  Download, Info, TrendingUp, TrendingDown, 
  Activity, FileText
} from 'lucide-react';
import { misIndicadores } from '../data/monitores';
import { HistoricoChart } from '../components/HistoricoChart';

export function DetalleIndicador() {
  const { id } = useParams();
  const [rangoSeleccionado, setRangoSeleccionado] = useState('6M');

  const indicador = misIndicadores.find(i => i.id === id);

  const { 
    titulo, valor, variacion = 0, descripcion, historial = [], 
    esInverso = false, categoria, cambioAbsoluto, subtexto, datoAnterior 
  } = indicador || {};

  let FlechaTendencia = Minus;
  if (variacion > 0) FlechaTendencia = ArrowUpRight;
  if (variacion < 0) FlechaTendencia = ArrowDownRight;

  /**
   * THEME LOGIC: Aplicación de Semántica de Mercado v2.2
   */
  const theme = useMemo(() => {
    const esNegativoMatematicamente = variacion < 0;
    const esNeutro = variacion === 0;
    const esBuenaNoticia = esInverso ? esNegativoMatematicamente : !esNegativoMatematicamente;

    if (esNeutro) return {
      color: "text-slate-600 dark:text-slate-400",
      bgBadge: "bg-slate-200 dark:bg-slate-800",
      textBadge: "text-slate-700 dark:text-slate-300",
      chartColor: "#64748b"
    };

    // Protocolo v2.2: Light requiere tonos más oscuros (600) vs Dark tonos brillantes (400)
    return esBuenaNoticia ? {
      color: "text-emerald-600 dark:text-emerald-400",
      bgBadge: "bg-emerald-100 dark:bg-emerald-500/10",
      textBadge: "text-emerald-700 dark:text-emerald-400",
      chartColor: "#10b981"
    } : {
      color: "text-rose-600 dark:text-rose-500",
      bgBadge: "bg-rose-100 dark:bg-rose-500/10",
      textBadge: "text-rose-700 dark:text-rose-400",
      chartColor: "#f43f5e"
    };
  }, [variacion, esInverso]);

  const stats = useMemo(() => {
    if (!historial?.length) return null;
    const valores = historial.map(d => d.valor);
    const fmt = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
    
    return {
      min: fmt.format(Math.min(...valores)),
      max: fmt.format(Math.max(...valores)),
      avg: fmt.format(valores.reduce((a, b) => a + b, 0) / valores.length)
    };
  }, [historial]);

  if (!indicador) return <Navigate to="/" replace />;

  return (
    /* Canvas Global: bg-slate-100 para Light Mode */
    <div className="min-h-screen bg-slate-100 dark:bg-[#0B1121] pb-20 transition-colors duration-300">
      
      {/* NAVBAR: Glassmorphism refinado */}
      <nav className="sticky top-0 z-30 bg-white/90 dark:bg-[#0B1121]/80 backdrop-blur-md border-b border-slate-300 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link 
            to="/" 
            className="group flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <div className="p-1.5 rounded-lg group-hover:bg-slate-200 dark:group-hover:bg-slate-800 transition-colors">
                <ArrowLeft size={18} />
            </div>
            <span className="font-bold text-sm">Dashboard</span>
          </Link>

          <div className="flex gap-2">
             <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                <Download size={16} />
                <span className="hidden sm:inline uppercase">Exportar</span>
             </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* HERO SECTION */}
        <div className="mb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <span className="px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                            {categoria}
                        </span>
                        <div className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">En Vivo</span>
                        </div>
                    </div>
                    
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter">
                        {titulo}
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-base max-w-2xl leading-relaxed">
                        {descripcion}
                    </p>
                </div>

                {/* PRICING DATA: Tabular Nums Mandatory */}
                <div className="text-left md:text-right bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-sm">
                    <div className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums mb-2">
                        {valor}
                    </div>
                    
                    <div className="flex items-center justify-start md:justify-end gap-3">
                        <div className={`
                            flex items-center gap-1 px-3 py-1 rounded-full font-bold text-base
                            ${theme.bgBadge} ${theme.textBadge}
                        `}>
                            <FlechaTendencia size={18} strokeWidth={3} />
                            <span className="tabular-nums">{Math.abs(variacion)}%</span>
                        </div>
                        <span className={`text-lg font-bold tabular-nums ${theme.color}`}>
                           {variacion > 0 ? '+' : ''}{cambioAbsoluto || '-'}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
            {/* GRÁFICO PRINCIPAL */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                        <div className="flex items-center gap-2">
                             <Activity size={18} className="text-slate-500" />
                             <span className="text-xs font-black text-slate-700 dark:text-slate-400 uppercase tracking-widest">Evolución Histórica</span>
                        </div>
                        <div className="flex bg-slate-200 dark:bg-slate-800 rounded-xl p-1">
                            {['1M', '6M', 'YTD', '1Y', 'ALL'].map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setRangoSeleccionado(range)}
                                    className={`
                                        px-3 py-1.5 rounded-lg text-[10px] font-black transition-all
                                        ${rangoSeleccionado === range 
                                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}
                                    `}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 h-[420px]">
                        <HistoricoChart 
                            datos={historial} 
                            color={theme.chartColor} 
                            esPorcentaje={titulo?.includes('Tasa') || titulo?.includes('Inflación')} 
                        />
                    </div>
                </div>

                {/* INFO BOX: Colores Fintech Blue */}
                <div className="bg-blue-100/50 dark:bg-blue-900/10 border border-blue-300 dark:border-blue-800/30 rounded-2xl p-5 flex gap-4">
                    <Info className="text-blue-600 dark:text-blue-400 shrink-0" size={24} />
                    <div className="space-y-1">
                        <h4 className="text-sm font-black text-blue-900 dark:text-blue-300 uppercase tracking-wider">Análisis MonitorEco</h4>
                        <p className="text-sm text-blue-800/80 dark:text-blue-400/80 leading-relaxed font-medium">
                            Se observa una tendencia {variacion > 0 ? 'alcista' : 'bajista'} consolidada. 
                            La volatilidad actual se mantiene en rangos aceptables para {subtexto || 'la dinámica de mercado actual'}.
                        </p>
                    </div>
                </div>
            </div>

            {/* BARRA LATERAL: Estadísticas */}
            <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-sm p-6">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 mb-6 uppercase tracking-wider">
                        <FileText size={18} className="text-slate-500" />
                        Estadísticas Clave
                    </h3>
                    
                    <div className="space-y-4">
                        {[
                            { label: 'Cierre Anterior', value: datoAnterior },
                            { label: 'Máximo Período', value: stats?.max },
                            { label: 'Mínimo Período', value: stats?.min },
                            { label: 'Promedio', value: stats?.avg }
                        ].map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800 border-dashed">
                                <span className="text-xs text-slate-600 dark:text-slate-400 font-bold uppercase">{item.label}</span>
                                <span className="text-sm font-bold text-slate-900 dark:text-white font-mono tabular-nums">{item.value || '-'}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* SUMMARY CARDS */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-sm">
                        <p className="text-[10px] text-slate-500 font-black uppercase mb-2 tracking-widest">Tendencia</p>
                        <div className={`flex items-center gap-2 font-black text-sm ${theme.color}`}>
                            {variacion > 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                            {variacion > 0 ? 'ALCISTA' : 'BAJISTA'}
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-sm">
                        <p className="text-[10px] text-slate-500 font-black uppercase mb-2 tracking-widest">Riesgo</p>
                        <div className="flex items-center gap-2 font-black text-sm text-slate-900 dark:text-slate-200">
                            <Activity size={18} className="text-orange-500" />
                            MODERADO
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}