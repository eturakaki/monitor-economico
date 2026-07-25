import React, { useState } from 'react';
import { Map, ArrowRightLeft } from 'lucide-react';
import { ToolLayout } from '../../../components/ToolLayout';

export function CanastaRegional() {
  // Mock simple ya que no tenemos DB regional aún
  const [valorA, setValorA] = useState(500000);
  const [regionA, setRegionA] = useState('CABA');
  const [valorB, setValorB] = useState(420000);
  const [regionB, setRegionB] = useState('Córdoba');

  const diferencia = valorA - valorB;
  const gapPorcentual = ((valorA - valorB) / valorB) * 100;

  const format = (v) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(v);

  return (
    <ToolLayout title="Canasta Básica Regional" description="Compara el costo de vida teórico entre dos regiones para entender el arbitraje geográfico." icon={Map} color="cyan">
       <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
          
          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-slate-800">
             {/* REGION A */}
             <div className="p-8 space-y-4">
                <input type="text" value={regionA} onChange={e => setRegionA(e.target.value)} className="font-bold text-gray-500 uppercase tracking-widest bg-transparent outline-none w-full" />
                <div>
                   <label className="text-xs text-gray-400 block mb-1">Costo Canasta Total</label>
                   <input type="number" value={valorA} onChange={e => setValorA(Number(e.target.value))} className="text-3xl font-black text-gray-900 dark:text-white bg-transparent outline-none w-full placeholder-gray-300" />
                </div>
             </div>

             {/* REGION B */}
             <div className="p-8 space-y-4 bg-gray-50/50 dark:bg-slate-950/50">
                <input type="text" value={regionB} onChange={e => setRegionB(e.target.value)} className="font-bold text-gray-500 uppercase tracking-widest bg-transparent outline-none w-full text-right md:text-left" />
                <div className="text-right md:text-left">
                   <label className="text-xs text-gray-400 block mb-1">Costo Canasta Total</label>
                   <input type="number" value={valorB} onChange={e => setValorB(Number(e.target.value))} className="text-3xl font-black text-gray-900 dark:text-white bg-transparent outline-none w-full text-right md:text-left placeholder-gray-300" />
                </div>
             </div>
          </div>

          {/* ANÁLISIS DEL GAP */}
          <div className="bg-cyan-900 p-6 text-white flex flex-col md:flex-row items-center justify-between gap-4">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-full"><ArrowRightLeft size={20}/></div>
                <div>
                   <p className="font-bold text-lg">Brecha de Costo de Vida</p>
                   <p className="text-cyan-200 text-sm opacity-80">Diferencia nominal entre {regionA} y {regionB}</p>
                </div>
             </div>
             <div className="text-right">
                <p className="text-3xl font-black">{gapPorcentual > 0 ? '+' : ''}{gapPorcentual.toFixed(1)}%</p>
                <p className="text-sm text-cyan-200 opacity-80">{format(Math.abs(diferencia))} de diferencia</p>
             </div>
          </div>
       </div>
    </ToolLayout>
  );
}