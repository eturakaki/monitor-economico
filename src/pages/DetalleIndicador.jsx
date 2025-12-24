// src/pages/DetalleIndicador.jsx
import { useParams, Link } from 'react-router-dom'; // 1. Importamos las herramientas de navegación
import { ArrowLeft } from 'lucide-react'; // 2. Importamos una flechita para volver
import { misIndicadores } from '../data/monitores';
import { HistoricoChart } from '../components/HistoricoChart';



export function DetalleIndicador() {
  
  // 3. EL TRUCO DE MAGIA: "useParams"
  // Esta línea lee la URL y extrae lo que esté después de la barra.
  // Si la URL es "/indicador/dolar-blue", entonces id = "dolar-blue"
  const { id } = useParams();
  // 2. BUSCAMOS EL DATO CORRECTO
  // "Buscame en la lista el indicador cuyo ID sea igual al ID de la URL"
  const indicador = misIndicadores.find(item => item.id === id);

 if (!indicador) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-6">🔍</div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Ups, indicador no encontrado</h2>
        <p className="text-gray-500 mb-8 text-lg">
          No encontramos ningún dato con el ID <span className="font-mono bg-gray-100 px-2 py-1 rounded">"{id}"</span>.
          <br/>Puede que la dirección sea incorrecta.
        </p>
        
        {/* Botón de Rescate */}
        <Link 
          to="/" 
          className="inline-flex items-center justify-center bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
        >
          <ArrowLeft size={20} className="mr-2" />
          Volver al Inicio
        </Link>
      </div>
    );
  }

  // Definimos el color del gráfico según si sube o baja (verde o rojo)
  // Si no tiene variación, usamos gris.
  const colorGrafico = indicador.variacion >= 0 ? "#10b981" : "#ef4444"; // Verde o Rojo
  
  // 🌟 NUEVO: Detectamos si el valor usa "%" (como Inflación) o no (como Dólar)
  const tienePorcentaje = indicador.valor.includes('%');
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* Encabezado con fondo blanco */}
      <div className="bg-white border-b border-gray-200 pt-8 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          
          {/* Botón Volver */}
          <Link to="/" className="inline-flex items-center text-gray-500 hover:text-emerald-600 mb-6 transition-colors font-medium">
            <ArrowLeft size={18} className="mr-2" />
            Volver al inicio
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            {/* Títulos */}
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider mb-3">
                {indicador.categoria.toUpperCase()}
              </span>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
                {indicador.titulo}
              </h1>
              <p className="text-lg text-gray-500 max-w-xl">
                {indicador.descripcion || "Información detallada y evolución histórica de este indicador."}
              </p>
            </div>

            {/* Precio Gigante */}
            <div className="text-right">
              <div className="text-5xl font-black text-gray-900 tracking-tighter">
                {indicador.valor}
              </div>
              <div className={`text-lg font-bold mt-1 flex items-center justify-end gap-1 ${indicador.variacion >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {indicador.variacion > 0 ? '+' : ''}{indicador.variacion}%
                <span className="text-gray-400 text-sm font-normal ml-1">vs. ayer</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-4xl mx-auto px-4 -mt-8">
        
        {/* Tarjeta del Gráfico (Flotando sobre el borde) */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">

          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800">Evolución Histórica</h3>
           
            {/* Selector de fechas falso (Visual) */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {['1M', '3M', '6M', '1A', 'Todo'].map((label) => (
                <button 
                key={label} 
                className="px-3 py-1 text-xs font-bold text-gray-500 hover:bg-white hover:shadow-sm rounded-md transition-all">
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ACÁ ESTÁ EL GRÁFICO NUEVO */}
          <div className="h-[350px] min-h-[350px] w-full">
            <HistoricoChart 
              datos={indicador.historial} 
              color={colorGrafico} 
              esPorcentaje={tienePorcentaje} 
            />
          </div>
        </div>
          

        {/* Ficha Técnica (Placeholder para Fase 4) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4">Acerca de este indicador</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex justify-between border-b border-gray-100 pb-2">
                <span>Fuente:</span> <span className="font-medium text-gray-900">Oficial / Estimado</span>
              </li>
              <li className="flex justify-between border-b border-gray-100 pb-2">
                <span>Frecuencia:</span> <span className="font-medium text-gray-900">Diaria</span>
              </li>
              <li className="flex justify-between border-b border-gray-100 pb-2">
                <span>Última act.:</span> <span className="font-medium text-gray-900">Hoy</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100 flex flex-col justify-center items-center text-center">
            <p className="font-bold text-emerald-800 mb-2">¿Necesitás la serie histórica?</p>
            <p className="text-sm text-emerald-600 mb-4">Descargá los datos completos en Excel/CSV.</p>
            <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm">
              Descargar Datos
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}