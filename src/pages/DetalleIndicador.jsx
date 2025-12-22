// src/pages/DetalleIndicador.jsx
import { useParams, Link } from 'react-router-dom'; // 1. Importamos las herramientas de navegación
import { ArrowLeft } from 'lucide-react'; // 2. Importamos una flechita para volver
import { misIndicadores } from '../data/monitores';



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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      {/* Botón para Volver Atrás */}
      <Link to="/" className="inline-flex items-center text-emerald-600 font-medium mb-6 hover:underline">
        <ArrowLeft size={20} className="mr-2" />
        Volver al Panel
      </Link>

      {/* Tarjeta Principal */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        
        {/* Título Dinámico: Muestra el ID que leímos de la URL */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2 capitalize">
          {id.replace(/-/g, ' ')} {/* Esto cambia los guiones por espacios */}
        </h1>
        
        <p className="text-gray-500 mb-8">
          Análisis detallado y gráficos históricos de {id}.
        </p>

        {/* Espacio para el Gráfico (Lo llenaremos en la Fase 3) */}
        <div className="h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400">
          Acá irá el gráfico de: {id}
        </div>

      </div>
    </div>
  );
}