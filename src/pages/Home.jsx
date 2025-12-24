import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Grid } from '../components/Grid';
import { StatCard } from '../components/StatCard';
import { misIndicadores } from '../data/monitores';
import { sectores } from '../data/sectores'; // <--- 1. Importamos los sectores
import { herramientas } from '../data/herramientas';
import { ResumenIA } from '../components/ResumenIA'; // <--- Componentes IA


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
    // CLAVE: "pt-8" agrega el espacio gris arriba para separarlo del Header global
    <div className="min-h-screen bg-gray-50 pt-8 pb-20">
      
      {/* --- ENCABEZADO DE LA PÁGINA (Tarjeta Flotante) --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            
            {/* Izquierda: Título y Bajada */}
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Monitor Económico
              </h1>
              <p className="text-lg text-gray-500 mt-2">
                Tablero de control macroeconómico en tiempo real.
              </p>
            </div>

            {/* Derecha: Referencias (Pastilla gris ordenada) */}
            <div className="inline-flex items-center bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700">
              <span className="mr-3 text-gray-400">Referencias:</span>
              
              <div className="flex items-center mr-4">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2 ring-2 ring-emerald-100"></span>
                Mejora de dato para el país
              </div>
              
              <div className="flex items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 mr-2 ring-2 ring-red-100"></span>
                Empeora de dato para el país
              </div>
            </div>

          </div>
        </div>
      

      {/* --- FIN DEL ENCABEZADO --- */}
        <Grid>
          {destacadosFinancieros.map((item) => (
            <StatCard key={item.id} {...item} />
          ))}
        </Grid>
      </div>

        {/* 🌟 NUEVO: RESUMEN DE IA 🌟 */}
      <div className="max-w-7xl mx-auto px-4 mt-8 mb-12">
        <ResumenIA />
      </div>
      {/* --------------------------- */}


      {/* --- SECCIÓN 3: NAVEGACIÓN POR SECTORES (NUEVO) --- */}
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


      {/* --- SECCIÓN 4: Herramientas y Recursos --- */}
      <div className="max-w-7xl mx-auto px-4 mb-16">
        
        {/* Encabezado de la Sección (Separado de la grilla) */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-700">Herramientas</h2>
        </div>

        {/* Grilla de Tarjetas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {herramientas.map((herramienta) => {
            const Icono = herramienta.Icono;
            
            return (
              <Link 
                key={herramienta.id} 
                to={herramienta.ruta} // Usamos .ruta (definido en herramientas.js)
                className="group bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all flex items-center gap-4"
              >
                {/* Ícono */}
                <div className={`p-3 rounded-lg bg-${herramienta.color}-50 text-${herramienta.color}-600 group-hover:scale-110 transition-transform`}>
                  <Icono size={24} />
                </div>
                
                {/* Textos */}
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                    {herramienta.titulo}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-1">
                    {/* CORRECCIÓN: Usamos 'descripcion', no 'subtitulo' */}
                    {herramienta.descripcion}
                  </p>
                </div>

                {/* Flecha */}
                <ArrowRight size={16} className="text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
              </Link>
            );
          })}
        </div>
      </div>
    </div> // <--- CIERRE DE LA PÁGINA (Este div envuelve TODO)
  );
}