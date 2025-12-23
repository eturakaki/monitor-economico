import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Grid } from '../components/Grid';
import { StatCard } from '../components/StatCard';
import { misIndicadores } from '../data/monitores';
import { sectores } from '../data/sectores'; // <--- 1. Importamos los sectores

export function Home() {
  
  // Filtros de datos
  const datosFinancieros = misIndicadores.filter(item => 
    item.categoria === "financiero" || 
    item.categoria === "cambiario" || 
    item.categoria === "monetario"
    );
  // Tomamos solo los primeros 4 para no saturar arriba
  const destacadosFinancieros = datosFinancieros.slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* --- HEADER --- */}
      <div className="pt-10 pb-6 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          Monitor Económico Argentina
        </h1>
        <p className="text-gray-500 mt-2">Tablero de control macroeconómico en tiempo real</p>
      </div>
      
     

      {/* --- SECCIÓN 1: INDICADORES CLAVE (KPIs) --- */}
      <div className="max-w-7xl mx-auto px-4 mb-12">
        <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
          Dashboard Macroeconómico
        </h2>
        <p className="text-gray-500 mt-2">Indicadores económicos principales de Argentina</p>

         {/* Referencia de colores (Semáforo) */}
      <div className="flex justify-center gap-4 mb-10 text-sm font-medium">
        <span className="flex items-center text-emerald-600">
          <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
          Mejora
        </span>
        <span className="flex items-center text-red-600">
          <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
          Empeora
        </span>
      </div>
        <Grid>
          {destacadosFinancieros.map((item) => (
            <StatCard key={item.id} {...item} />
          ))}
        </Grid>
      </div>

      {/* --- SECCIÓN 2: NAVEGACIÓN POR SECTORES (NUEVO) --- */}
      <div className="max-w-7xl mx-auto px-4 mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-700">Explorar por Sectores</h2>
          <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Seleccione una categoría</span>
        </div>

        {/* GRILLA DE SECTORES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sectores.map((sector) => {
            // Extraemos el ícono para usarlo como componente
            const Icono = sector.Icono;
            
            return (
              <Link 
                key={sector.id} 
                to={`/categoria/${sector.id}`}
                className="group bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all flex items-center gap-4"
              >
                {/* Ícono con fondo de color */}
                <div className={`p-3 rounded-lg bg-${sector.color}-50 text-${sector.color}-600 group-hover:scale-110 transition-transform`}>
                  <Icono size={24} />
                </div>
                
                {/* Textos */}
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                    {sector.titulo}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-1">
                    {sector.subtitulo}
                  </p>
                </div>

                {/* Flechita decorativa */}
                <ArrowRight size={16} className="text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* --- SECCIÓN 3:  pensar*/}

    </div>
  )
}