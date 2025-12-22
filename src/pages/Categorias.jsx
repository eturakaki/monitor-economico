import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Grid } from '../components/Grid';
import { StatCard } from '../components/StatCard';
import { misIndicadores } from '../data/monitores'; // Datos numéricos
import { sectores } from '../data/sectores';       // Datos de categorías (títulos, descripciones)

export function Categoria() {
  const { id } = useParams(); // Leemos de la URL (ej: "fiscal")

  // 1. Buscamos la info del SECTOR (Título, descripción, color)
  const infoSector = sectores.find(s => s.id === id);

  // 2. Buscamos los INDICADORES de ese sector
  const indicadores = misIndicadores.filter(item => item.categoria === id);

  // Seguridad: Si el sector no existe (ej: /categoria/ovnis)
  if (!infoSector) {
    return <div className="p-10 text-center">Categoría no encontrada 🛸</div>;
  }

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
            <div className={`p-2 rounded-lg bg-${infoSector.color}-100`}>
              <infoSector.Icono size={28} className={`text-${infoSector.color}-600`} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{infoSector.titulo}</h1>
          </div>
          
          <p className="text-gray-500 text-lg max-w-3xl">
            {infoSector.descripcion}
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
            <p className="text-gray-400 mb-2">Aún no hay indicadores cargados en {infoSector.titulo}.</p>
            <Link to="/" className="text-emerald-600 font-medium hover:underline">
              Volver al panel principal
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}