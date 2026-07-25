import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  ComposedChart, 
  Line, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine,
  Legend
} from 'recharts';
import { 
  BarChart4, 
  TrendingUp, 
  TrendingDown, 
  RefreshCcw, 
  Calendar 
} from 'lucide-react';
import { ToolLayout } from '../../../components/ToolLayout';
/**
 * Componente: Bandas Cambiarias
 * Descripción: Proyección de zonas de equilibrio del dólar basado en Pass-Through de inflación.
 */
export const BandasCambiarias = () => {
  // --- STATE ---
  const [dolarHoy, setDolarHoy] = useState(1150);
  
  // Generamos 12 meses futuros dinámicamente para los inputs
  const [inflacionMensual, setInflacionMensual] = useState([
    { mes: 'Feb', valor: 2.5 },
    { mes: 'Mar', valor: 2.0 },
    { mes: 'Abr', valor: 2.0 },
    { mes: 'May', valor: 1.8 },
    { mes: 'Jun', valor: 1.5 },
    { mes: 'Jul', valor: 1.5 },
    { mes: 'Ago', valor: 1.2 },
    { mes: 'Sep', valor: 1.0 },
    { mes: 'Oct', valor: 1.0 },
    { mes: 'Nov', valor: 0.8 },
    { mes: 'Dic', valor: 0.8 },
    { mes: 'Ene', valor: 0.5 },
  ]);

  // --- REFS (Titanium Protocol) ---
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // --- LOGIC ---
  const dataProyeccion = useMemo(() => {
    let base = dolarHoy;
    const data = [];

    // Punto inicial (Hoy)
    data.push({
      mes: 'Hoy',
      equilibrio: base,
      techo: base * 1.05, // Banda +5%
      piso: base * 0.95,  // Banda -5%
      real: base
    });

    // Proyección
    inflacionMensual.forEach((inf) => {
      // Ajuste: El dólar "debería" acompañar a la inflación (teoría de paridad)
      // Usamos un factor de "Crawl" (ej: 80% de la inflación se va a precio)
      const factorAjuste = 1 + (inf.valor / 100); 
      
      base = base * factorAjuste;

      data.push({
        mes: inf.mes,
        equilibrio: Math.round(base),
        techo: Math.round(base * 1.15), // Banda Superior se amplia con el tiempo (incertidumbre)
        piso: Math.round(base * 0.85),  // Banda Inferior
        real: null // A futuro no sabemos el real
      });
    });

    return data;
  }, [dolarHoy, inflacionMensual]);

  const ultimoValor = dataProyeccion[dataProyeccion.length - 1];

  // Handler para editar inflación en la grilla
  const handleInflationChange = (index, val) => {
    const newArr = [...inflacionMensual];
    newArr[index].valor = parseFloat(val) || 0;
    setInflacionMensual(newArr);
  };

  return (
    <ToolLayout
      title="Bandas del Dólar"
      description="Proyección de zonas de equilibrio (Caro/Barato) según inflación estimada."
      icon={BarChart4}
      category="Inversiones"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUMNA IZQUIERDA: Inputs y Configuración */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Tarjeta Dólar Base */}
          <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl backdrop-blur-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Punto de Partida</h3>
            <div>
               <label className="text-sm text-slate-300 font-medium">Dólar Hoy ($)</label>
               <input 
                 type="number" 
                 value={dolarHoy} 
                 onChange={e => setDolarHoy(Number(e.target.value))} 
                 className="w-full mt-1 p-3 bg-slate-900 border border-slate-700 rounded-xl font-bold text-white outline-none focus:border-cyan-500 transition-colors" 
               />
            </div>
          </div>

          {/* Grilla de Inflación (Supuestos) */}
          <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl backdrop-blur-sm">
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-sm font-bold text-slate-400 uppercase">Inflación Esperada (REM)</h3>
               <button 
                 onClick={() => setInflacionMensual(inflacionMensual.map(i => ({...i, valor: 2})))}
                 className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
               >
                 <RefreshCcw size={12} /> Reset 2%
               </button>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {inflacionMensual.map((item, idx) => (
                <div key={idx} className="relative">
                  <label className="absolute top-1 left-2 text-[10px] text-slate-500 font-bold uppercase">{item.mes}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={item.valor}
                    onChange={(e) => handleInflationChange(idx, e.target.value)}
                    className="w-full pt-4 pb-1 px-2 bg-slate-900 border border-slate-700 rounded-lg text-right font-mono text-sm text-white focus:border-cyan-500 outline-none"
                  />
                  <span className="absolute bottom-1 right-8 text-[10px] text-slate-500">%</span>
                </div>
              ))}
            </div>
          </div>

          {/* KPI Resumen */}
          <div className="bg-cyan-900/10 border border-cyan-500/20 p-5 rounded-xl">
            <div className="flex justify-between items-end">
               <div>
                  <p className="text-slate-400 text-xs uppercase font-bold">Dólar Equilibrio (12 meses)</p>
                  <p className="text-3xl font-bold text-cyan-400 font-mono mt-1">${ultimoValor.equilibrio}</p>
               </div>
               <div className="text-right">
                  <p className="text-xs text-slate-500">Banda Sup.</p>
                  <p className="text-rose-400 font-mono font-bold">${ultimoValor.techo}</p>
                  <p className="text-xs text-slate-500 mt-1">Banda Inf.</p>
                  <p className="text-emerald-400 font-mono font-bold">${ultimoValor.piso}</p>
               </div>
            </div>
          </div>

        </div>

        {/* COLUMNA DERECHA: Gráfico */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl h-[500px] relative" ref={containerRef}>
             <h4 className="text-slate-300 font-medium mb-6 flex items-center gap-2">
               <BarChart4 className="w-4 h-4 text-cyan-400" /> Proyección de Escenarios
             </h4>

             {dimensions.width > 0 && (
               <ComposedChart
                 width={dimensions.width}
                 height={dimensions.height - 60}
                 data={dataProyeccion}
                 margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
               >
                 <defs>
                   <linearGradient id="colorBand" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.1}/>
                     <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                 <XAxis dataKey="mes" stroke="#94a3b8" tick={{fontSize: 12}} />
                 <YAxis 
                   stroke="#94a3b8" 
                   tick={{fontSize: 12}} 
                   domain={['auto', 'auto']}
                   tickFormatter={(val) => `$${val}`}
                 />
                 <Tooltip 
                   contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                   formatter={(value) => [`$${value}`, '']}
                 />
                 <Legend wrapperStyle={{ paddingTop: '20px' }} />

                 {/* Banda Superior (Techo) */}
                 <Line 
                   type="monotone" 
                   dataKey="techo" 
                   stroke="#f43f5e" 
                   strokeWidth={2} 
                   strokeDasharray="5 5" 
                   name="Banda Superior (Venta)"
                   dot={false}
                 />

                 {/* Equilibrio */}
                 <Line 
                   type="monotone" 
                   dataKey="equilibrio" 
                   stroke="#22d3ee" 
                   strokeWidth={3} 
                   name="Equilibrio Teórico"
                   dot={{ r: 4, fill: '#22d3ee', strokeWidth: 0 }}
                 />

                 {/* Banda Inferior (Piso) */}
                 <Line 
                   type="monotone" 
                   dataKey="piso" 
                   stroke="#10b981" 
                   strokeWidth={2} 
                   strokeDasharray="5 5" 
                   name="Banda Inferior (Compra)"
                   dot={false}
                 />

                 {/* Área de Relleno (Sombreado entre bandas - Truco visual) */}
                 <Area
                    type="monotone"
                    dataKey="techo"
                    fill="#1e293b" // Color oscuro para ocultar
                    stroke="none"
                    fillOpacity={0} // Invisible
                 />
               </ComposedChart>
             )}
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-start gap-4">
             <Calendar className="w-5 h-5 text-slate-500 mt-1" />
             <p className="text-xs text-slate-400 leading-relaxed">
               <strong>Nota metodológica:</strong> Las bandas se calculan aplicando el <i>Pass-Through</i> estimado de la inflación al tipo de cambio. 
               La banda superior representa un escenario de tensión (+15% sobre equilibrio) y la inferior un escenario de apreciación (-15%).
               No constituye una recomendación de compra/venta.
             </p>
          </div>
        </div>

      </div>
    </ToolLayout>
  );
};