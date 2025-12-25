import { ArrowUpRight, ArrowDownRight, Minus, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * StatCard Component v3.4 (Structured & Filled)
 * Mejora Visual: Añade fondos sutiles (Headers/Footers) para eliminar la sensación de vacío.
 * Mantiene intacta la lógica responsive híbrida (Grid en móvil / Flex en desktop).
 */
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
  const esNeutro = variacion === 0;
  const tieneDatosPrevios = datoAnterior && datoAnterior !== "-" && datoAnterior !== null;

  // 2. SISTEMA DE DISEÑO
  const theme = esBuenaNoticia 
    ? {
        color: 'text-emerald-600 dark:text-emerald-400',
        bgIcon: 'bg-emerald-100 dark:bg-emerald-900/30', // Más intenso para llenar visualmente
        borderHover: 'group-hover:border-emerald-300 dark:group-hover:border-emerald-700',
        badgeBg: 'bg-emerald-100 dark:bg-emerald-500/20',
        badgeText: 'text-emerald-700 dark:text-emerald-400',
        bar: 'bg-emerald-500',
        bar1: 'bg-emerald-600/50',
        textHover: 'group-hover:text-emerald-800 dark:group-hover:text-emerald-300',
        gradient: 'from-emerald-500/5 to-transparent' // Gradiente de fondo
      }
    : {
        color: 'text-red-600 dark:text-red-400',
        bgIcon: 'bg-red-100 dark:bg-red-900/30',
        borderHover: 'group-hover:border-red-300 dark:group-hover:border-red-700',
        badgeBg: 'bg-red-100 dark:bg-red-500/20',
        badgeText: 'text-red-700 dark:text-red-400',
        bar: 'bg-red-500',
        bar1: 'bg-red-500/60',
        textHover: 'group-hover:text-red-800 dark:group-hover:text-red-300',
        gradient: 'from-red-500/5 to-transparent'
      };
    
  if (esNeutro) {
    theme.color = 'text-gray-500 dark:text-gray-400';
    theme.bgIcon = 'bg-gray-100 dark:bg-gray-800';
    theme.borderHover = 'group-hover:border-gray-300';
    theme.badgeBg = 'bg-gray-100 dark:bg-gray-800';
    theme.badgeText = 'text-gray-600 dark:text-gray-300';
    theme.bar = 'bg-gray-300 dark:bg-gray-600';
    theme.bar1 = 'bg-gray-300 dark:bg-gray-600';
    theme.textHover = 'group-hover:text-gray-900 dark:group-hover:text-white';
    theme.gradient = 'from-slate-500/5 to-transparent';
  }

  const FlechaVariacion = variacion > 0 ? ArrowUpRight : (variacion < 0 ? ArrowDownRight : Minus);

  return (
    <Link to={`/indicador/${id}`} className="block group h-full">
      <div className={`
        relative flex flex-col justify-between h-full overflow-hidden
        bg-white dark:bg-slate-900 
        rounded-2xl border border-slate-300 dark:border-slate-700/60
        shadow-sm hover:shadow-lg dark:shadow-none
        transition-all duration-300 ease-in-out
        ${theme.borderHover}
      `}>
        
        {/* DECORACIÓN DE FONDO: Blob sutil para dar textura */}
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${theme.gradient} rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

        {/* --- HEADER (Ahora con fondo para separar visualmente) --- */}
        <div className={`flex justify-between items-center p-3 sm:p-4 border-b border-slate-100 dark:border-slate-800 ${theme.bar1} dark:bg-slate-800/20`}>
          <div className="flex items-center gap-2 w-full overflow-hidden">
                {/* Icono a la izquierda del título para estilo más "App" */}
                {Icono && (
                    <div className={`
                      p-1.5 rounded-md ${theme.bgIcon} ${theme.color} shrink-0
                    `}>
                      <Icono size={14} className="sm:w-4 sm:h-4" strokeWidth={2.5} />
                    </div>
                )}
                <h3 className={`
                  font-black text-xs sm:text-sm uppercase tracking-tight 
                  text-slate-700 dark:text-slate-200 truncate
                  transition-colors duration-300
                  ${theme.textHover}
                `}>
                  {titulo}
                </h3>
             </div>
             
             {/* Indicador sutil de realtime */}
             <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse ml-2 shrink-0"></div>
        </div>

        {/* --- BODY (Contenido Principal) --- */}
        <div className="px-3 sm:px-4 pt-3 sm:pt-4 flex-1">
            {/* Precio y Badge alineados */}
            <div className="flex flex-col gap-1">
                <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums leading-none">
                    {valor}
                </p>
                
                {/* Badge de variación */}
                <div className="flex items-center gap-2 mt-1">
                    <div className={`
                        inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-bold
                        ${theme.badgeBg} ${theme.badgeText}
                    `}>
                        <FlechaVariacion size={10} strokeWidth={3} />
                        <span className="tabular-nums">{variacion > 0 ? '+' : ''}{variacion}%</span>
                    </div>
                    <span className="text-[9px] text-slate-400 font-medium">vs ayer</span>
                </div>
            </div>
        </div>

        {/* --- FOOTER DE DATOS (Contenedor "Relleno") --- */}
        {/* Aquí es donde añadimos el "Relleno" visual: un fondo gris suave (bg-slate-50) */}
        <div className="mt-3 mx-3 sm:mx-4 mb-3 sm:mb-4">
            <div className={`
                rounded-xl p-2.5 sm:p-3
                bg-${theme.color} dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50
            `}>
                {tieneDatosPrevios ? (
                   // LÓGICA RESPONSIVE MANTENIDA: Grid en móvil, Flex en desktop
                   <div className="grid grid-cols-2 gap-2 lg:flex lg:flex-row lg:items-center lg:justify-between lg:gap-0">
                       
                       {/* Bloque Izquierdo */}
                       <div className="flex flex-col lg:flex-row lg:items-center lg:gap-2">
                          <span className="text-[9px] font-black text-slate-800 uppercase tracking-widest leading-none mb-1 lg:mb-0">
                            Prev
                            <span className="hidden lg:inline">:</span>
                          </span>
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-300 tabular-nums leading-none">
                            {datoAnterior}
                          </span>
                       </div>

                       {/* Separador vertical solo visible en móvil para dar estructura */}
                       <div className="absolute left-1/2 top-1/2 -translate-y-1/2 w-px h-6 bg-slate-200 lg:hidden hidden"></div>

                       {/* Bloque Derecho */}
                       <div className="flex flex-col items-end lg:flex-row lg:items-center lg:gap-2">
                          <span className="text-[9px] font-black text-slate-800 uppercase tracking-widest leading-none mb-1 lg:mb-0">
                            Cambio
                          </span>
                          <span className={`text-xs font-bold tabular-nums leading-none ${theme.color}`}>
                            {cambioAbsoluto || "-"}
                          </span>
                       </div>
                   </div>
                ) : (
                   <div className="h-8 flex items-center justify-center opacity-40">
                      <span className="text-[9px] text-slate-600 uppercase">Sin datos previos</span>
                   </div>
                )}
            </div>

            {/* Subtexto final (Source/Time) fuera de la caja para cerrar */}
            <div className="flex justify-between items-center mt-2 px-1">
                 <span className="text-[9px] font-bold text-slate-600 dark:text-slate-600 uppercase tracking-widest">
                   {subtexto || "REALTIME"}
                </span>
                {/* Barra pequeña */}
                <div className={`h-1 w-8 rounded-full ${theme.bar} opacity-40`}></div>
            </div>
        </div>

      </div>
    </Link>
  );
}