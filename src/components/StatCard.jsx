import { ArrowUpRight, ArrowDownRight, Minus, Activity } from 'lucide-react';

export function StatCard({ titulo, valor, variacion, esInverso = false, Icono = Activity , subtexto }) {
  
  // 1. LÓGICA
  const esNegativo = variacion < 0;
  
  // Lógica inteligente: ¿Es buena noticia?
  const esBuenaNoticia = esInverso ? esNegativo : !esNegativo;

  // 2. COLORES
  const colorBase = esBuenaNoticia ? 'text-emerald-600' : 'text-red-600';
  const colorBarra = esBuenaNoticia ? 'bg-emerald-500' : 'bg-red-500';
  
  // Fondo del encabezado (fijo)
  const bgHeader = esBuenaNoticia ? 'bg-emerald-50' : 'bg-red-50';

  // --- EL NUEVO EFECTO DE HOVER ---
  // Cuando pasás el mouse, toda la tarjeta toma un tinte suave
  const bgHover = esBuenaNoticia ? 'hover:bg-emerald-50/80' : 'hover:bg-red-50/80';
  const bordeHover = esBuenaNoticia ? 'hover:border-emerald-200' : 'hover:border-red-200';

  return (
    <div className={`
      bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden 
      cursor-pointer transition-all duration-300 
      hover:shadow-2xl hover:-translate-y-1 
      ${bgHover} ${bordeHover} 
    `}>
      
      {/* Header */}
      <div className={`flex justify-between items-center p-4 ${bgHeader}`}>
        <h3 className={`font-bold text-sm uppercase tracking-wide `}>
          {titulo}
        </h3>
        {Icono && (
          <div className={`p-2 rounded-full bg-white/60 ${colorBase}`}>
            <Icono size={20} />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5">
        <p className="text-3xl font-extrabold text-gray-800 mb-3">
          {valor}
        </p>

        {/* Barra */}
        <div className="w-full h-1.5 bg-gray-200/50 rounded-full mb-4 overflow-hidden">
          <div className={`h-full ${colorBarra} w-2/3 rounded-full opacity-80`}></div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center text-xs font-medium">
          <span className={`flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-gray-100/50 shadow-sm ${colorBase}`}>
            {variacion > 0 && <ArrowUpRight size={16} />}
            {variacion < 0 && <ArrowDownRight size={16} />}
            {variacion === 0 && <Minus size={16} />}
            {variacion > 0 ? `+${variacion}%` : `${variacion}%`}
          </span>

          <span className="text-gray-500 opacity-80">
            {subtexto || "vs. Dato anterior"}
          </span>
        </div>
      </div>
    </div>
  )
}