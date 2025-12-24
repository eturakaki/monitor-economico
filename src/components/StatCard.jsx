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

  // 1. LÓGICA
  const esNegativo = variacion < 0;
  const esBuenaNoticia = esInverso ? esNegativo : !esNegativo;

  // 2. COLORES (CORREGIDO: Solo guardamos el nombre del color)
  // Usamos 'emerald' para bien y 'red' para mal.
  const colorName = esBuenaNoticia ? 'emerald' : 'red';

  // 3. VARIABLES DE ICONOS
  const FlechaVariacion = variacion > 0 ? ArrowUpRight : (variacion < 0 ? ArrowDownRight : Minus);
  const FlechaSimple = variacion > 0 ? ArrowUp : ArrowDown;

  return (
    <Link 
      to={`/indicador/${id}`} 
      className="block group" // 'group' activa los efectos hover en los hijos
    >

      <div className={`
        bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden 
        transition-all duration-300 ease-out
        
        /* EFECTOS HOVER (Ahora sí funcionan las clases) */
        group-hover:-translate-y-1 
        group-hover:shadow-xl 
        group-hover:border-${colorName}-200
        group-hover:bg-${colorName}-50/30
      `}>

        {/* --- HEADER --- */}
        <div className={`flex justify-between items-center p-4 bg-${colorName}-50`}>
          <h3 className="font-bold text-sm uppercase tracking-wide text-gray-700">
            {titulo}
          </h3>
          
          {Icono && (
            <div className={`
              p-2 rounded-full bg-white shadow-sm text-${colorName}-600
              transition-transform duration-300 group-hover:scale-110
            `}>
              <Icono size={20} strokeWidth={2.5} />
            </div>
          )}
        </div>

        {/* --- BODY --- */}
        <div className="p-5">

          {/* PRECIO GIGANTE */}
          <p className="text-3xl font-black text-gray-900 tracking-tight mb-4">
            {valor}
          </p>

          {/* DATOS SECUNDARIOS */}
          <div className="flex flex-col gap-1.5 mb-5 text-sm">
            
            {/* Fila: Último Dato */}
            <div className="flex items-center gap-2 text-gray-400 font-medium">
              <span className="text-[10px] uppercase font-bold opacity-70">Último:</span>
              <span>{datoAnterior || "-"}</span>
            </div>
            
            {/* Fila: Cambio Absoluto (Con la flechita chica) */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold opacity-70 text-gray-400">Cambio:</span>
              
              <span className="font-bold text-gray-800">
                {cambioAbsoluto || "-"}
              </span>

              {/* Pequeña flecha indicadora (Solo si hay cambio) */}
              {variacion !== 0 && (
                <span className={`
                  flex items-center justify-center w-5 h-5 rounded-full 
                  bg-${colorName}-100 text-${colorName}-600
                `}>
                  <FlechaSimple size={12} strokeWidth={3} />
                </span>
              )}
            </div>
          </div>

          {/* BARRA DE PROGRESO */}
          <div className="w-full h-1.5 bg-gray-100 rounded-full mb-4 overflow-hidden">
            {/* Fix: Agregado w-1/3 para que se vea la barra */}
            <div className={`h-full bg-${colorName}-500 w-1/3 rounded-full opacity-80`}></div>
          </div>

          {/* --- FOOTER --- */}
          <div className="flex justify-between items-center">
            
            {/* Pill del Porcentaje */}
            <div className={`
              flex items-center gap-1 px-2.5 py-1 rounded-lg shadow-sm
              bg-${colorName}-50 border border-${colorName}-100 
              text-${colorName}-700 text-xs font-bold 
            `}>
              <FlechaVariacion size={14} strokeWidth={3} />
              {variacion > 0 ? `+${variacion}%` : `${variacion}%`}
            </div>

            {/* Fuente */}
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {subtexto || "OFICIAL"}
            </span>

          </div>
        </div>
      </div>
    </Link>
  );
}