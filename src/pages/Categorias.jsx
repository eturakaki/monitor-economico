import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, SearchX } from 'lucide-react';
import { Grid } from '../components/Grid';
import { StatCard } from '../components/StatCard';
import { sectores } from '../data/sectores';      // Tu lista de metadatos (colores, iconos)
import { misIndicadores } from '../data/monitores'; // Tu base de datos simulada



export function Categorias() {
  const { id } = useParams(); // Leemos de la URL (ej: "fiscal")

  // 1. Buscamos la info del SECTOR (Título, descripción, color)
  const sectorInfo = sectores.find(s => s.id === id);

  // 2. Buscamos los INDICADORES de ese sector
  const indicadores = misIndicadores.filter(item => item.categoria === id);

  // Seguridad: Si el sector no existe (ej: /categoria/ovnis)
 if (!sectorInfo) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 bg-gray-50/50">
        
        {/* Círculo decorativo con icono */}
        <div className="bg-white p-6 rounded-full shadow-sm border border-gray-100 mb-6 relative">
          <div className="absolute inset-0 bg-emerald-50 rounded-full opacity-50 blur-xl"></div> {/* Brillo sutil */}
          <SearchX size={48} className="text-gray-400 relative z-10" strokeWidth={1.5} />
        </div>

        {/* Mensaje Principal */}
        <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-3">
          No encontramos ese sector
        </h2>
        
        <p className="text-gray-500 max-w-md mx-auto mb-8 text-lg">
          Parece que la categoría <span className="font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">"{id}"</span> no existe en nuestra base de datos o la URL es incorrecta.
        </p>

        {/* Botones de Acción */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link 
            to="/" 
            className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            <ArrowLeft size={18} />
            Volver al Inicio
          </Link>
          
          {/* Botón secundario por si quiere reportar o ver otra cosa (opcional) */}
          <Link 
            to="/" 
            className="px-8 py-3 rounded-xl font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
          >
            Ver Sectores
          </Link>
        </div>

      </div>
    );
  }

  const IconoSector = sectorInfo.Icono;
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Botón Volver */}
        <Link to="/" className="inline-flex items-center text-emerald-600 font-medium mb-6 hover:underline">
          <ArrowLeft size={20} className="mr-2" />
          Volver al Inicio
        </Link>

        {/* Encabezado Dinámico del Sector */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            {/* Renderizamos el ícono del sector dinámicamente */}
            <div className={`p-2 rounded-lg bg-${sectorInfo.color}-100`}>
              <sectorInfo.Icono size={28} className={`text-${sectorInfo.color}-600`} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{sectorInfo.titulo}</h1>
          </div>
          
          <p className="text-gray-500 text-lg max-w-3xl">
            {sectorInfo.descripcion}
          </p>
        </div>

        {/* Grilla de Indicadores */}
        {indicadores.length > 0 ? (
          <Grid>
            {indicadores.map((item) => (
              <StatCard key={item.id} {...item} />
            ))}
          </Grid>
        ) : (
          // Mensaje si no hay datos cargados todavía
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-400 mb-2">Aún no hay indicadores cargados en {sectorInfo.titulo}.</p>
            <Link to="/" className="text-emerald-600 font-medium hover:underline">
              Volver al panel principal
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}