
import React, { useState, useMemo } from 'react';
import { Calculator, UserMinus, Users, HelpCircle } from 'lucide-react';
import { ToolLayout } from '../../../components/ToolLayout';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function CalculadoraGanancias() {
  const [bruto, setBruto] = useState(3500000);
  const [conyuge, setConyuge] = useState(false);
  const [hijos, setHijos] = useState(0);

  // VALORES FISCALES SIMULADOS (Ajustar según ley vigente)
  // Nota: Estos valores cambian seguido en Argentina. Usamos estimados.
  const PISO_MENSUAL = 2800000; // Piso mensual estimado para empezar a tributar

  const analisis = useMemo(() => {
    // 1. Calcular Neto antes de impuesto (Descuentos sociales 17%)
    const cargasSociales = bruto * 0.17;
    const netoAntesGanancias = bruto - cargasSociales;

    // 2. Base Imponible
    let impuesto = 0;
    
    // Ajuste del piso por cargas de familia (Deducciones)
    let pisoAjustado = PISO_MENSUAL;
    if (conyuge) pisoAjustado += 200000; // Deducción extra estimada
    if (hijos > 0) pisoAjustado += (hijos * 100000); // Deducción por hijo

    // Cálculo del Impuesto (Sobre el excedente del piso)
    if (bruto > pisoAjustado) {
      const excedente = bruto - pisoAjustado;
      
      // Escala progresiva simulada (Tasas efectivas promedio)
      let alicuota = 0;
      if (excedente < 500000) alicuota = 0.05;       // 5%
      else if (excedente < 1000000) alicuota = 0.15; // 15%
      else if (excedente < 2000000) alicuota = 0.25; // 25%
      else alicuota = 0.35;                          // 35% (Tope)

      impuesto = excedente * alicuota;
    }

    const netoFinal = netoAntesGanancias - impuesto;
    const tasaEfectiva = (impuesto / bruto) * 100;

    const dataChart = [
      { name: 'De Bolsillo', value: netoFinal, color: '#10b981' }, // Emerald
      { name: 'Cargas Sociales (17%)', value: cargasSociales, color: '#64748b' }, // Slate
      { name: 'Imp. Ganancias', value: impuesto, color: '#f43f5e' } // Rose
    ];

    return { cargasSociales, impuesto, netoFinal, tasaEfectiva, pisoAjustado, dataChart };
  }, [bruto, conyuge, hijos]);

  const formatMoney = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);

  return (
    <ToolLayout 
      title="Estimador Impuesto a las Ganancias" 
      description="Calculadora de 4ta Categoría (Empleados). Estima tu retención mensual basada en el piso vigente y cargas de familia."
      icon={Calculator}
      color="red"
    >
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* INPUTS */}
        <div className="lg:col-span-5 space-y-6">
           <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
              <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Sueldo Bruto Mensual</label>
              <input 
                type="number" 
                value={bruto} 
                onChange={e => setBruto(Number(e.target.value))} 
                className="w-full p-4 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl text-2xl font-black dark:text-white focus:ring-2 focus:ring-red-500 outline-none" 
              />
              
              <div className="mt-6 space-y-4">
                 <p className="text-xs font-bold text-gray-500 uppercase">Deducciones Familiares</p>
                 
                 <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-950 rounded-xl border border-gray-200 dark:border-slate-700 cursor-pointer hover:border-red-400 transition-colors">
                    <div className="flex items-center gap-3">
                       <UserMinus className="text-gray-400" size={20}/>
                       <span className="font-bold text-sm text-gray-700 dark:text-white">Cónyuge a cargo</span>
                    </div>
                    <input type="checkbox" checked={conyuge} onChange={e => setConyuge(e.target.checked)} className="w-5 h-5 accent-red-500 rounded" />
                 </label>

                 <div className="p-3 bg-gray-50 dark:bg-slate-950 rounded-xl border border-gray-200 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-2">
                       <div className="flex items-center gap-3">
                          <Users className="text-gray-400" size={20}/>
                          <span className="font-bold text-sm text-gray-700 dark:text-white">Hijos menores (18 años)</span>
                       </div>
                       <span className="font-bold text-red-500">{hijos}</span>
                    </div>
                    <input type="range" min="0" max="5" step="1" value={hijos} onChange={e => setHijos(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg accent-red-500" />
                 </div>
              </div>
           </div>
           
           <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30 flex gap-3 text-red-800 dark:text-red-300 text-xs">
              <HelpCircle className="shrink-0" size={16}/>
              <p>El cálculo es estimativo y se basa en un esquema simplificado del impuesto cedular o régimen vigente. Consulta siempre a un contador para la liquidación final exacta.</p>
           </div>
        </div>

        {/* RESULTADOS */}
        <div className="lg:col-span-7 flex flex-col gap-6">
           <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-slate-900 p-5 rounded-2xl text-white text-center">
                 <p className="text-slate-400 font-bold uppercase text-xs">Sueldo Neto (Bolsillo)</p>
                 <p className="text-3xl font-black">{formatMoney(analisis.netoFinal)}</p>
              </div>
              <div className="bg-red-500 p-5 rounded-2xl text-white text-center relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 blur-2xl rounded-full"></div>
                 <p className="text-red-100 font-bold uppercase text-xs">Retención Ganancias</p>
                 <p className="text-3xl font-black">{formatMoney(analisis.impuesto)}</p>
                 <p className="text-xs text-red-100 mt-1">Alicuota efectiva: {analisis.tasaEfectiva.toFixed(1)}%</p>
              </div>
           </div>

           <div className="flex-1 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm min-h-[300px]">
             <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 text-center">¿A dónde va tu sueldo bruto?</h4>
             <div className="w-full h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={analisis.dataChart} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {analisis.dataChart.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(val) => formatMoney(val)} contentStyle={{backgroundColor: '#0f172a', borderRadius: '8px', border:'none', color:'#fff'}} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
             </div>
           </div>
        </div>

      </div>
    </ToolLayout>
  );
}