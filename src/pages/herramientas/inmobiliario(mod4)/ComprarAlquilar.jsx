import React, { useState, useMemo } from 'react';
import { Scale, Building, TrendingUp } from 'lucide-react';
import { ToolLayout } from '../../../components/ToolLayout';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

export function ComprarAlquilar() {
  // Inputs
  const [precioPropiedad, setPrecioPropiedad] = useState(120000); // USD
  const [alquilerMensual, setAlquilerMensual] = useState(600); // USD
  const [expensasPropietario, setExpensasPropietario] = useState(100); // USD (Impuestos, mantenimiento que paga el dueño)
  const [rendimientoInversion, setRendimientoInversion] = useState(6); // % Anual (S&P500 / Obligaciones)
  const [apreciacionInmueble, setApreciacionInmueble] = useState(2); // % Anual
  const [anios, setAnios] = useState(20);

  // --- CÁLCULO DE PROYECCIÓN ---
  const analisis = useMemo(() => {
    const data = [];
    
    // Escenario A: COMPRAR (Cash)
    // Asumimos que tienes el capital (o lo pones todo). 
    // Tu patrimonio es la casa, que sube de valor.
    // Costo hundido: Mantenimiento e impuestos.
    let valorCasa = precioPropiedad;

    // Escenario B: ALQUILAR + INVERTIR
    // Asumimos que tienes el capital de la casa PERO decides invertirlo.
    // Pagas alquiler.
    let portafolio = precioPropiedad; 

    for (let i = 1; i <= anios; i++) {
      // 1. Evolución Casa
      valorCasa = valorCasa * (1 + (apreciacionInmueble/100));
      
      // Costos de ser dueño (restan al patrimonio o se asumen como gasto)
      // Para simplificar comparación patrimonial:
      // El dueño paga expensas/mantenimiento. El inquilino paga alquiler.
      
      // 2. Evolución Portafolio (Inquilino)
      // Ganancia financiera
      const gananciaInversion = portafolio * (rendimientoInversion/100);
      
      // El inquilino paga alquiler (Gasto anual)
      const costoAlquilerAnual = alquilerMensual * 12;
      
      // El dueño paga mantenimiento (Gasto anual)
      const costoMantenimientoAnual = expensasPropietario * 12;
      
      // Ajuste del Portafolio:
      // Portafolio crece por rendimiento, pero baja por pagar alquiler.
      // PERO comparativamente, el dueño también gastó dinero en mantenimiento.
      // Diferencia Neta de Flujo = (Alquiler - Mantenimiento)
      
      // En este modelo simplificado de "Costo de Oportunidad":
      // Portafolio = Portafolio + Rendimiento - Alquiler + Mantenimiento (lo que el dueño gastó y el inquilino no)
      // Es decir, al inquilino le restamos el alquiler, pero le "sumamos" no haber pagado los arreglos.
      
      portafolio = portafolio + gananciaInversion - costoAlquilerAnual + costoMantenimientoAnual;

      data.push({
        anio: i,
        patrimonioDuenio: Math.round(valorCasa),
        patrimonioInquilino: Math.round(portafolio)
      });
    }

    const finalDuenio = data[data.length-1].patrimonioDuenio;
    const finalInquilino = data[data.length-1].patrimonioInquilino;
    const ganador = finalInquilino > finalDuenio ? 'Alquilar e Invertir' : 'Comprar Propiedad';
    const diferencia = Math.abs(finalInquilino - finalDuenio);

    return { data, finalDuenio, finalInquilino, ganador, diferencia };
  }, [precioPropiedad, alquilerMensual, rendimientoInversion, apreciacionInmueble, anios, expensasPropietario]);

  const formatUSD = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <ToolLayout 
      title="¿Comprar o Alquilar?" 
      description="Análisis de costo de oportunidad a largo plazo. Compara la apreciación del ladrillo vs. el rendimiento financiero del capital invertido."
      icon={Scale}
      color="cyan"
    >
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* INPUTS */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
              
              <div className="mb-4">
                 <label className="text-xs font-bold text-gray-500 uppercase mb-1">Valor Propiedad (USD)</label>
                 <input type="number" value={precioPropiedad} onChange={e => setPrecioPropiedad(Number(e.target.value))} className="w-full p-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg font-bold dark:text-white" />
              </div>
              <div className="mb-4">
                 <label className="text-xs font-bold text-gray-500 uppercase mb-1">Alquiler Mensual (USD)</label>
                 <input type="number" value={alquilerMensual} onChange={e => setAlquilerMensual(Number(e.target.value))} className="w-full p-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg font-bold dark:text-white" />
              </div>
              
              <div className="border-t border-gray-100 dark:border-slate-800 pt-4 space-y-4">
                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase flex justify-between">
                       Retorno Inversión Anual <span>{rendimientoInversion}%</span>
                    </label>
                    <input type="range" min="0" max="15" step="0.5" value={rendimientoInversion} onChange={e => setRendimientoInversion(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg accent-emerald-500" />
                 </div>
                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase flex justify-between">
                       Apreciación Inmueble <span>{apreciacionInmueble}%</span>
                    </label>
                    <input type="range" min="0" max="10" step="0.5" value={apreciacionInmueble} onChange={e => setApreciacionInmueble(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg accent-cyan-500" />
                 </div>
                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase flex justify-between">
                       Horizonte (Años) <span>{anios}</span>
                    </label>
                    <input type="range" min="5" max="30" step="1" value={anios} onChange={e => setAnios(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg accent-slate-500" />
                 </div>
              </div>
           </div>
        </div>

        {/* GRÁFICO */}
        <div className="lg:col-span-8 flex flex-col gap-6">
           <div className={`p-6 rounded-2xl border-2 transition-all flex items-center gap-5 ${analisis.ganador.includes('Alquilar') ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-500' : 'bg-cyan-50 dark:bg-cyan-900/10 border-cyan-500'}`}>
              <div className={`p-4 rounded-full text-white ${analisis.ganador.includes('Alquilar') ? 'bg-emerald-500' : 'bg-cyan-500'}`}>
                 {analisis.ganador.includes('Alquilar') ? <TrendingUp size={32}/> : <Building size={32}/>}
              </div>
              <div>
                 <h3 className="text-xl font-black uppercase tracking-wide text-gray-900 dark:text-white">
                    Te conviene: <span className={analisis.ganador.includes('Alquilar') ? 'text-emerald-600' : 'text-cyan-600'}>{analisis.ganador}</span>
                 </h3>
                 <p className="text-gray-600 dark:text-slate-300 mt-1">
                    En {anios} años, tu patrimonio sería <strong>{formatUSD(analisis.diferencia)}</strong> mayor si eliges esta opción.
                 </p>
              </div>
           </div>

           <div className="flex-1 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm min-h-[350px]">
             <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Proyección de Patrimonio Neto (USD)</h4>
             <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analisis.data}>
                    <defs>
                      <linearGradient id="colorDuenio" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorInq" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
                    <XAxis dataKey="anio" tickFormatter={(v) => `Año ${v}`} tick={{fill:'#64748b', fontSize:12}} />
                    <YAxis tickFormatter={(val) => `$${val/1000}k`} tick={{fill:'#64748b', fontSize:12}} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff' }} formatter={(val) => formatUSD(val)} />
                    <Legend />
                    <Area type="monotone" dataKey="patrimonioDuenio" name="Patrimonio Dueño" stroke="#06b6d4" fill="url(#colorDuenio)" strokeWidth={3} />
                    <Area type="monotone" dataKey="patrimonioInquilino" name="Patrimonio Inquilino (Inversor)" stroke="#10b981" fill="url(#colorInq)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
             </div>
           </div>
        </div>
      </div>
    </ToolLayout>
  );
}
