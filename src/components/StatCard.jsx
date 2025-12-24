import { ArrowUpRight, ArrowDownRight, Minus, Activity, ArrowUp, ArrowDown } from 'lucide-react';
import { Link } from 'react-router-dom';

export function StatCard({ 
  id, 
  titulo, 
  valor, 
  variacion, 
  esInverso = false, 
  Icono = Activity, 
  subtexto, 
  datoAnterior, 
  cambioAbsoluto 
}) {

  // 1. LÓGICA DE NEGOCIO
  const esNegativo = variacion < 0;
  const esBuenaNoticia = esInverso ? esNegativo : !esNegativo;

  // 2. MAPEO DE CLASES (Ahora con soporte Dark Mode)
  const estilos = esBuenaNoticia 
    ? {
        // En modo oscuro usamos fondos transparentes (/40) y textos más claros (400)
        bgLight: 'bg-emerald-50 dark:bg-emerald-900/40', 
        bgPill: 'bg-emerald-100 dark:bg-emerald-900/40',
        text: 'text-emerald-600 dark:text-emerald-400',
        textDark: 'text-emerald-700 dark:text-emerald-300',
        border: 'border-emerald-100 dark:border-emerald-800/30',
        borderHover: 'group-hover:border-emerald-200 dark:group-hover:border-emerald-700',
        bgHover: 'group-hover:bg-emerald-50/30 dark:group-hover:bg-emerald-900/10',
        bar: 'bg-emerald-500'
      }
    : {
        bgLight: 'bg-red-50 dark:bg-red-900/40',
        bgPill: 'bg-red-100 dark:bg-red-900/40',
        text: 'text-red-600 dark:text-red-400',
        textDark: 'text-red-700 dark:text-red-300',
        border: 'border-red-100 dark:border-red-800/30',
        borderHover: 'group-hover:border-red-200 dark:group-hover:border-red-700',
        bgHover: 'group-hover:bg-red-50/30 dark:group-hover:bg-red-900/10',
        bar: 'bg-red-500'
      };

  // 3. VARIABLES DE ICONOS
  const FlechaVariacion = variacion > 0 ? ArrowUpRight : (variacion < 0 ? ArrowDownRight : Minus);
  const FlechaSimple = variacion > 0 ? ArrowUp : ArrowDown;

  return (
    <Link to={`/indicador/${id}`} className="block group">
      <div className={`
        bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-800 overflow-hidden 
        transition-all duration-300 ease-out
        group-hover:-translate-y-1 group-hover:shadow-xl 
        ${estilos.borderHover} ${estilos.bgHover}
      `}>

        {/* --- HEADER --- */}
        <div className={`flex justify-between items-center p-4 ${estilos.bgLight}`}>
          <h3 className="font-bold text-sm uppercase tracking-wide text-gray-700 dark:text-slate-100">
            {titulo}
          </h3>
          
          {Icono && (
            <div className={`
              p-2 rounded-full bg-white dark:bg-slate-800 shadow-sm ${estilos.text}
              transition-transform duration-300 group-hover:scale-110
            `}>
              <Icono size={20} strokeWidth={2.5} />
            </div>
          )}
        </div>

        {/* --- BODY --- */}
        <div className="p-5">
          <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-4">
            {valor}
          </p>

          <div className="flex flex-col gap-1.5 mb-5 text-sm">
            <div className="flex items-center gap-2 text-gray-400 dark:text-slate-500 font-medium">
              <span className="text-[10px] uppercase font-bold opacity-70">Último:</span>
              <span>{datoAnterior || "-"}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold opacity-70 text-gray-400 dark:text-slate-500">Cambio:</span>
              <span className="font-bold text-gray-800 dark:text-slate-500">{cambioAbsoluto || "-"}</span>

              {/* FLECHA CHICA */}
              {variacion !== 0 && (
                <span className={`
                  flex items-center justify-center w-5 h-5 rounded-full 
                  ${estilos.bgPill} ${estilos.text}
                `}>
                  <FlechaSimple size={12} strokeWidth={3} />
                </span>
              )}
            </div>
          </div>

          {/* BARRA DE PROGRESO */}
          <div className="w-full h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full mb-4 overflow-hidden">
            <div className={`h-full ${estilos.bar} w-1/3 rounded-full opacity-80`}></div>
          </div>

          {/* --- FOOTER --- */}
          <div className="flex justify-between items-center">
            {/* PILL DEL PORCENTAJE */}
            <div className={`
              flex items-center gap-1 px-2.5 py-1 rounded-lg shadow-sm
              ${estilos.bgLight} border ${estilos.border} ${estilos.textDark} text-xs font-bold 
            `}>
              <FlechaVariacion size={14} strokeWidth={3} />
              {variacion > 0 ? `+${variacion}%` : `${variacion}%`}
            </div>

            <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
              {subtexto || "OFICIAL"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}