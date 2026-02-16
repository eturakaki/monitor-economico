import React, { useState, useMemo } from 'react';
import { ScrollText, TrendingUp, AlertCircle, Percent } from 'lucide-react';
import { ToolLayout } from '../../../components/ToolLayout';
import { financial } from '../../../utils/formulas';
import { 
  RadialBarChart, RadialBar, Legend, ResponsiveContainer, Tooltip 
} from 'recharts';

export function CalculadoraBonos() {
  const [ticker, setTicker] = useState('AL30');
  const [precioMercado, setPrecioMercado] = useState(62500); // Precio cada 100 nominales
  const [valorTecnico, setValorTecnico] = useState(105); // USD valor técnico (lámina)
  const [dolarMEP, setDolarMEP] = useState(1140);
  
  // --- CÁLCULOS ---
  const analisis = useMemo(() => {
    // 1. Convertir Precio Pesos a USD (Si el bono es en pesos)
    // Precio suele cotizar cada 100 nominales
    const precioUsd = (precioMercado / dolarMEP); // Precio en USD de 100 nominales
    
    // 2. Paridad: (Precio Mercado / Valor Técnico) * 100
    // Ajustamos porque precioMercado suele ser x100 láminas
    // Paridad = (PrecioUSD_Unitario / ValorTecnico_Unitario)
    // Si precioUsd es por 100, valorTecnico es por 1 (usualmente). Normalizamos.
    
    // Simplificación para UI: Asumimos input VT por 100 nominales o ajustamos mentalmente.
    // Fórmula Standard: Paridad % = (Precio / VT)
    // Usamos el helper de formulas.js
    
    // Escenario: Precio Mercado = $62500 (pesos por 100 nom)
    // Dólar = $1140
    // Precio USD = $54.82 (por 100 nom)
    // VT = $100 (por 100 nom, lámina limpia sin intereses corridos para el ejemplo)
    
    const paridad = financial.investments.parity(precioUsd, valorTecnico);
    
    // Estado del Bono
    let estado = 'Bajo la Par (Oportunidad/Riesgo)';
    let color = '#10b981'; // Emerald
    
    if (paridad > 98 && paridad < 102) {
      estado = 'A la Par (Equilibrado)';
      color = '#3b82f6'; // Blue
    } else if (paridad >= 102) {
      estado = 'Sobre la Par (Caro)';
      color = '#f43f5e'; // Rose
    }

    const chartData = [
      { name: 'Potencial Suba', value: 100, fill: '#334155' }, // Fondo gris (target 100%)
      { name: 'Paridad Actual', value: paridad, fill: color }
    ];

    return { precioUsd, paridad, estado, color, chartData };
  }, [precioMercado, valorTecnico, dolarMEP]);

  return (
    <ToolLayout 
      title="Calculadora de Bonos" 
      description="Analiza la Paridad Técnica de títulos soberanos (AL30, GD30) para determinar si están baratos (under par) o caros (over par)."
      icon={ScrollText}
      color="slate"
    >
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* INPUTS */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
             
             <div className="mb-6">
                <label className="text-xs font-bold text-gray-500 uppercase mb-1">Ticker / Nombre</label>
                <input type="text" value={ticker} onChange={e => setTicker(e.target.value.toUpperCase())} className="w-full p-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl font-black text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-slate-500" />
             </div>

             <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                   <label className="text-xs font-bold text-gray-500 uppercase mb-1">Precio ($)</label>
                   <input type="number" value={precioMercado} onChange={e => setPrecioMercado(Number(e.target.value))} className="w-full p-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl font-bold dark:text-white" />
                   <p className="text-[10px] text-gray-400 mt-1">Cada 100 nominales</p>
                </div>
                <div>
                   <label className="text-xs font-bold text-gray-500 uppercase mb-1">Dólar MEP</label>
                   <input type="number" value={dolarMEP} onChange={e => setDolarMEP(Number(e.target.value))} className="w-full p-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl font-bold dark:text-white" />
                </div>
             </div>

             <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1">Valor Técnico (VT) USD</label>
                <input type="number" value={valorTecnico} onChange={e => setValorTecnico(Number(e.target.value))} className="w-full p-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl font-bold dark:text-white" />
                <p className="text-[10px] text-gray-400 mt-1">VT por cada 100 nominales (Capital + Intereses corridos)</p>
             </div>
          </div>
        </div>

        {/* VISUALIZACIÓN */}
        <div className="lg:col-span-7 flex flex-col gap-6">
           <div className="flex-1 bg-slate-900 dark:bg-black p-6 rounded-2xl border border-slate-800 relative overflow-hidden flex flex-col md:flex-row items-center justify-between">
              
              {/* Radial Chart */}
              <div className="w-full h-[250px] relative">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="100%" barSize={20} data={analisis.chartData} startAngle={180} endAngle={0}>
                       <RadialBar background dataKey="value" cornerRadius={10} />
                       <Legend iconSize={10} layout="vertical" verticalAlign="middle" wrapperStyle={{top: '50%', right: 0, transform: 'translate(0, -50%)', lineHeight: '24px'}} />
                       <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#0f172a', borderRadius: '8px', border:'none', color:'#fff'}} />
                    </RadialBarChart>
                 </ResponsiveContainer>
                 {/* Centro del Radial */}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center transform -mt-4">
                    <p className="text-4xl font-black text-white">{analisis.paridad.toFixed(1)}%</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">Paridad</p>
                 </div>
              </div>

              {/* Stats Side */}
              <div className="w-full md:w-1/2 space-y-4">
                 <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                    <p className="text-slate-400 text-xs font-bold uppercase">Precio en Hard Dollar</p>
                    <p className="text-2xl font-black text-white">US$ {analisis.precioUsd.toFixed(2)}</p>
                 </div>
                 
                 <div className="flex items-start gap-2">
                    <div style={{color: analisis.color}}><AlertCircle size={20} /></div>
                    <div>
                       <p className="text-white font-bold text-sm" style={{color: analisis.color}}>{analisis.estado}</p>
                       <p className="text-slate-500 text-xs mt-1">
                          {analisis.paridad < 100 
                             ? `Upside potencial hasta valor técnico: +${(100 - analisis.paridad).toFixed(1)}%`
                             : 'El bono cotiza con prima sobre su valor técnico.'}
                       </p>
                    </div>
                 </div>
              </div>

           </div>
        </div>

      </div>
    </ToolLayout>
  );
}