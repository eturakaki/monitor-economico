import React, { useState, useMemo } from 'react';
import { PieChart, CheckCircle2, AlertTriangle, TrendingDown } from 'lucide-react';
import { ToolLayout } from '../../../components/ToolLayout';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

export function CuotaSimple() {
  // --- STATE ---
  const [precioContado, setPrecioContado] = useState(100000);
  const [precioLista, setPrecioLista] = useState(120000); // Precio en cuotas
  const [cuotas, setCuotas] = useState(6);
  const [inflacionMensual, setInflacionMensual] = useState(4.5); // REM esperado

  // --- CÁLCULO FINANCIERO (VAN) ---
  const analisis = useMemo(() => {
    // 1. Datos Nominales
    const valorCuota = precioLista / cuotas;
    const recargo = ((precioLista - precioContado) / precioContado) * 100;
    
    // 2. Cálculo de Valor Presente (La magia financiera)
    // Traemos cada cuota futura a plata de hoy usando la inflación como tasa de descuento.
    // Fórmula: VP = Cuota / (1 + i)^n
    let sumaValorPresente = 0;
    
    for (let i = 1; i <= cuotas; i++) {
      const vpCuota = valorCuota / Math.pow(1 + (inflacionMensual / 100), i);
      sumaValorPresente += vpCuota;
    }

    // 3. Decisión
    // Si la suma de las cuotas "licuadas" es MENOR al precio contado, convienen las cuotas.
    const ahorroReal = precioContado - sumaValorPresente;
    const convieneCuotas = sumaValorPresente < precioContado;
    const tasaRealImplícita = ((sumaValorPresente - precioContado) / precioContado) * 100;

    // 4. Data para Gráfico
    const chartData = [
      {
        name: 'Pago Contado',
        valor: precioContado,
        color: '#64748b' // Slate-500
      },
      {
        name: 'Cuotas (Valor Real)',
        valor: sumaValorPresente,
        color: convieneCuotas ? '#10b981' : '#f43f5e' // Emerald o Rose
      }
    ];

    return { 
      valorCuota, 
      recargo, 
      sumaValorPresente, 
      ahorroReal, 
      convieneCuotas, 
      tasaRealImplícita,
      chartData 
    };
  }, [precioContado, precioLista, cuotas, inflacionMensual]);

  const formatMoney = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);

  return (
    <ToolLayout 
      title="Cuota Simple vs. Contado" 
      description="¿Te conviene pagar 'cash' con descuento o financiarte en cuotas licuadas por la inflación? Analiza el costo financiero real."
      icon={PieChart}
      color="blue"
    >
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* --- PANEL DE INPUTS --- */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-md">

            {/* Precios */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Precio Contado</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-400">$</span>
                  <input 
                    type="number" value={precioContado} onChange={(e) => setPrecioContado(Number(e.target.value))}
                    className="w-full pl-6 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Precio en Cuotas</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-400">$</span>
                  <input 
                    type="number" value={precioLista} onChange={(e) => setPrecioLista(Number(e.target.value))}
                    className="w-full pl-6 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Sliders */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Cantidad de Cuotas</label>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded">{cuotas} pagos</span>
              </div>
              <input
                type="range" min="3" max="24" step="3" value={cuotas} onChange={(e) => setCuotas(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-blue-600"
              />
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mt-1">
                <span>3</span><span>6</span><span>12</span><span>18</span><span>24</span>
              </div>
            </div>

            <div className="mb-2">
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Inflación Mensual Est.</label>
                <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-xs font-bold rounded">{inflacionMensual}%</span>
              </div>
              <input
                type="range" min="1" max="15" step="0.1" value={inflacionMensual} onChange={(e) => setInflacionMensual(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-rose-500"
              />
              <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-2">
                Usamos la inflación estimada para descontar el valor futuro de las cuotas.
              </p>
            </div>

          </div>

          {/* Tarjeta de Resumen Nominal */}
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 flex justify-between items-center">
            <div>
              <p className="text-xs text-slate-500 uppercase">Valor de Cuota</p>
              <p className="text-xl font-black text-slate-900 dark:text-white">{formatMoney(analisis.valorCuota)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase">Recargo Nominal</p>
              <p className={`text-lg font-bold ${analisis.recargo > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                {analisis.recargo > 0 ? '+' : ''}{analisis.recargo.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* --- PANEL DE RESULTADOS --- */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Veredicto */}
          <div className={`
            p-6 rounded-2xl border-2 transition-all duration-300 flex items-center gap-5
            ${analisis.convieneCuotas 
              ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-500' 
              : 'bg-rose-50 dark:bg-rose-900/10 border-rose-500'}
          `}>
            <div className={`
              p-4 rounded-full shrink-0
              ${analisis.convieneCuotas ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}
            `}>
              {analisis.convieneCuotas ? <CheckCircle2 size={32} /> : <AlertTriangle size={32} />}
            </div>
            <div>
              <h3 className={`text-xl font-black uppercase tracking-wide ${analisis.convieneCuotas ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                {analisis.convieneCuotas ? '¡TE CONVIENEN LAS CUOTAS!' : 'MEJOR PAGA DE CONTADO'}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mt-1 text-sm">
                {analisis.convieneCuotas 
                  ? `Aunque pagues más pesos nominalmente, la inflación licúa la deuda. En términos reales te ahorras ${formatMoney(analisis.ahorroReal)}.`
                  : `El recargo que te cobran supera a la inflación esperada. En términos reales estás perdiendo ${formatMoney(Math.abs(analisis.ahorroReal))}.`
                }
              </p>
            </div>
          </div>

          {/* Gráfico Comparativo */}
          <div className="flex-1 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-md min-h-[300px]">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-6">Comparativa en Valor Presente (Dinero de Hoy)</h4>
            <div className="w-full h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analisis.chartData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={120}
                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} 
                  />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px', backgroundColor: '#0f172a', border: 'none', color: '#fff' }}
                    formatter={(value) => formatMoney(value)}
                  />
                  <Bar dataKey="valor" radius={[0, 4, 4, 0]} barSize={40}>
                     {analisis.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>
    </ToolLayout>
  );
}