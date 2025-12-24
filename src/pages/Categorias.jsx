import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, SearchX } from 'lucide-react';
import { Grid } from '../components/Grid';
import { StatCard } from '../components/StatCard';
import { sectores } from '../data/sectores';
import { misIndicadores } from '../data/monitores';

export function Categorias() {
  const { id } = useParams();
  const sectorInfo = sectores.find(s => s.id === id);
  const indicadores = misIndicadores.filter(item => item.categoria === id);

  // --- CASO ERROR: SECTOR NO ENCONTRADO ---
  if (!sectorInfo) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 bg-gray-50/50 dark:bg-slate-950 transition-colors duration-300">
        
        <div className="bg-white dark:bg-slate-900 p-6 rounded-full shadow-sm border border-gray-100 dark:border-slate-800 mb-6 relative">
          <div className="absolute inset-0 bg-emerald-50 dark:bg-emerald-900/20 rounded-full opacity-50 blur-xl"></div>
          <SearchX size={48} className="text-gray-400 dark:text-slate-500 relative z-10" strokeWidth={1.5} />
        </div>

        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-3">
          No encontramos ese sector
        </h2>
        
        <p className="text-gray-500 dark:text-slate-400 max-w-md mx-auto mb-8 text-lg">
          Parece que la categoría <span className="font-bold text-gray-800 dark:text-white bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded">"{id}"</span> no existe.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link 
            to="/" 
            className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            <ArrowLeft size={18} />
            Volver al Inicio
          </Link>
          
          <Link 
            to="/" 
            className="px-8 py-3 rounded-xl font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
          >
            Ver Sectores
          </Link>
        </div>

      </div>
    );
  }

  return (
    // FONDO GENERAL OSCURO
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Botón Volver */}
        <Link to="/" className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-medium mb-6 hover:underline">
          <ArrowLeft size={20} className="mr-2" />
          Volver al Inicio
        </Link>

        {/* Encabezado Dinámico del Sector */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            {/* Colores dinámicos adaptados:
                Light: bg-color-100 text-color-600
                Dark: bg-color-900/20 text-color-400 (Más suave y brillante)
            */}
            <div className={`p-2 rounded-lg bg-${sectorInfo.color}-100 dark:bg-${sectorInfo.color}-900/20 transition-colors`}>
              <sectorInfo.Icono size={28} className={`text-${sectorInfo.color}-600 dark:text-${sectorInfo.color}-400 transition-colors`} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors">{sectorInfo.titulo}</h1>
          </div>
          
          <p className="text-gray-500 dark:text-slate-400 text-lg max-w-3xl transition-colors">
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
          // Mensaje Vacío
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-gray-300 dark:border-slate-700 transition-colors">
            <p className="text-gray-400 dark:text-slate-500 mb-2">Aún no hay indicadores cargados en {sectorInfo.titulo}.</p>
            <Link to="/" className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline">
              Volver al panel principal
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}