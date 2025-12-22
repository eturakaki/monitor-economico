import { Outlet, Link, useLocation } from 'react-router-dom';
import { LineChart, Home } from 'lucide-react'; 
import { sectores } from '../data/sectores';

export function Layout() {
  const location = useLocation();

  // Función para saber si un botón debe estar "prendido"
  // Si la ruta actual coincide con la del botón, devuelve true
  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex flex-col min-h-screen font-sans bg-gray-50">
      
      {/* --- HEADER PROFESIONAL ESTILO BCRA --- */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        
        {/* FILA 1: Identidad y Status */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-emerald-600 p-2 rounded-lg shadow-sm group-hover:bg-emerald-700 transition-colors">
              <LineChart className="text-white" size={24} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight text-gray-900 leading-none">
                Monitor<span className="text-emerald-600">Eco</span>
              </span>
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mt-0.5">
                Tablero Macroeconómico
              </span>
            </div>
          </Link>

          {/* Cartel "Datos en vivo" */}
          <div className="flex items-center gap-4">
            {/* Fecha (visible solo en PC) */}
            <div className="hidden md:block text-right border-r border-gray-200 pr-4 mr-1">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Actualizado</p>
              <p className="text-xs font-bold text-gray-700">
                {new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })} • 
                <span className="ml-1 text-emerald-600">En tiempo real</span>
              </p>
            </div>

            {/* Pill Verde Pulsante */}
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                Datos en vivo
              </span>
            </div>
          </div>
        </div>

        {/* FILA 2: Menú de Navegación Responsivo */}
        <div className="border-t border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center h-12 overflow-x-auto lg:overflow-visible no-scrollbar lg:justify-center space-x-1">
              
              {/* Botón Inicio (Sólido y fuerte) */}
              <Link 
                to="/" 
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 mr-2 flex-shrink-0
                  ${isActive('/') 
                    ? 'bg-emerald-600 text-white shadow-md ring-1 ring-emerald-600' // Inicio Sólido
                    : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'}
                `}
              >
                <Home size={16} />
                Inicio
              </Link>

              {/* Separador */}
              <div className="w-px h-6 bg-gray-200 mx-2 hidden lg:block flex-shrink-0"></div>

              {/* Lista de Sectores con Efecto "Difuminado" */}
              {sectores.map((sector) => {
                const Icono = sector.Icono;
                const ruta = `/categoria/${sector.id}`;
                const activo = isActive(ruta);
                
                return (
                  <Link 
                    key={sector.id} 
                    to={ruta}
                    // Agregamos focus:outline-none para evitar el recuadro azul del navegador al hacer clic
                    className={`
                      group flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0 focus:outline-none
                      ${activo 
                        /* ACTIVO: Fondo Pastel (Difuminado) + Texto Oscuro. SIN BORDES. */
                        ? `bg-${sector.color}-100 text-${sector.color}-800` 
                        /* INACTIVO: Gris limpio + Hover suave */
                        : `text-gray-500 hover:bg-${sector.color}-50 hover:text-${sector.color}-700`}
                    `}
                  >
                    <Icono 
                      size={16} 
                      className={`
                        transition-transform duration-200
                        ${activo 
                          ? `text-${sector.color}-700` /* Icono oscuro al estar activo */
                          : `text-gray-400 group-hover:text-${sector.color}-600 group-hover:scale-110`
                        }
                      `} 
                    />
                    
                    {sector.titulo}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* --- FOOTER (Mantenemos el que ya teníamos) --- */}
      <footer className="bg-gray-900 text-white border-t border-gray-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Columna 1: Marca */}
            <div className="col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-emerald-600 p-1.5 rounded-lg">
                  <LineChart className="text-white" size={20} />
                </div>
                <span className="font-bold text-lg tracking-tight">
                  Monitor<span className="text-emerald-500">Eco</span>
                </span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Datos macroeconómicos de Argentina en tiempo real. Análisis profesional para la toma de decisiones.
              </p>
            </div>

            {/* Columna 2: Sectores Rápidos */}
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                Acceso Rápido
              </h3>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                {sectores.slice(0, 6).map((sector) => (
                  <Link 
                    key={sector.id} 
                    to={`/categoria/${sector.id}`} 
                    className="text-gray-400 hover:text-emerald-400 text-sm transition-colors flex items-center gap-2"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full bg-${sector.color}-500`}></span>
                    {sector.titulo}
                  </Link>
                ))}
              </div>
            </div>

            {/* Columna 3: Legales */}
            <div className="col-span-1">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                Info
              </h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/categoria/glosario" className="hover:text-white">Glosario</Link></li>
                <li><Link to="/categoria/base-datos" className="hover:text-white">API Docs</Link></li>
                <li><a href="#" className="hover:text-white">Términos de uso</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
            <p>© 2025 Iñaki Etura. Todos los derechos reservados.</p>
            <p className="mt-2 md:mt-0">Desarrollado en Argentina.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}