import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LineChart,
  Home,
  Menu,
  X,
  ChevronRight,
  //iconos nuevos para las herramientas
  BookOpen,     // Glosario
  BarChart2,    // Analytics
  Download,     // Exportar
  Calculator    // Calculadora
} from 'lucide-react'; 
import { sectores } from '../data/sectores';
import { herramientas } from '../data/herramientas';


export function Layout() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Función para saber si un botón debe estar "prendido"
  const isActive = (path) => location.pathname === path;

  // Cierra el menú al hacer clic
  const closeMenu = () => setIsMenuOpen(false);


  return (
    <div className="flex flex-col min-h-screen font-sans bg-gray-50">
      
      {/* --- HEADER --- */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm relative">
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group" onClick={closeMenu}>
            <div className="bg-emerald-600 p-2 rounded-lg shadow-sm group-hover:bg-emerald-700 transition-colors">
              <LineChart className="text-white" size={24} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight text-gray-900 leading-none">
                Monitor<span className="text-emerald-600">Eco</span>
              </span>
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mt-0.5 hidden sm:block">
                Tablero Macroeconómico
              </span>
            </div>
          </Link>

          {/* Derecha: Datos + HAMBURGUESA */}
          <div className="flex items-center gap-4">
            
            <div className="hidden md:block text-right border-r border-gray-200 pr-4 mr-1">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Actualizado</p>
              <p className="text-xs font-bold text-gray-700">
                {new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })} • 
                <span className="ml-1 text-emerald-600">En tiempo real</span>
              </p>
            </div>

            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                En vivo
              </span>
            </div>

            {/* Menú Hamburguesa (Visible en Laptops < 2xl) */}
            <div className="2xl:hidden border-l border-gray-200 pl-4 ml-1">
                <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-md focus:outline-none transition-colors"
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

          </div>
        </div>

        {/* --- BARRA DE NAVEGACIÓN (Solo Monitores Gigantes) --- */}
        <div className="hidden 2xl:block border-t border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center h-12 justify-center space-x-1">
              <Link 
                to="/" 
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 mr-2 flex-shrink-0 ${isActive('/') ? 'bg-emerald-600 text-white shadow-md ring-1 ring-emerald-600' : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'}`}
              >
                <Home size={16} /> Inicio
              </Link>
              <div className="w-px h-6 bg-gray-200 mx-2 flex-shrink-0"></div>
              {sectores.map((sector) => {
                const Icono = sector.Icono;
                const ruta = `/categoria/${sector.id}`;
                const activo = isActive(ruta);
                return (
                  <Link key={sector.id} to={ruta} className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0 focus:outline-none ${activo ? `bg-${sector.color}-100 text-${sector.color}-800` : `text-gray-500 hover:bg-${sector.color}-50 hover:text-${sector.color}-700`}`}>
                    <Icono size={16} className={`transition-transform duration-200 ${activo ? `text-${sector.color}-700` : `text-gray-400 group-hover:text-${sector.color}-600 group-hover:scale-110`}`} />
                    {sector.titulo}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* --- MEGA MENÚ DESPLEGABLE (Diseño Grid para Laptops) --- */}
        {isMenuOpen && (
            <div className="2xl:hidden absolute top-full left-0 w-full bg-white border-b border-gray-200 shadow-xl z-40 animate-in slide-in-from-top-5 fade-in duration-200">
                <div className="max-h-[85vh] overflow-y-auto">
                    <div className="max-w-4xl mx-auto p-6"> {/* Centrado y con margen */}
                        
                        {/* 1. SECCIÓN PRINCIPAL */}
                        <div className="mb-6">
                            <Link 
                                to="/" 
                                onClick={closeMenu}
                                className={`flex items-center p-4 rounded-xl border transition-all shadow-sm group
                                    ${isActive('/') 
                                        ? 'bg-emerald-50 border-emerald-100' 
                                        : 'bg-white border-gray-100 hover:border-emerald-200 hover:shadow-md'
                                    }`}
                            >
                                <div className={`p-3 rounded-lg mr-4 ${isActive('/') ? 'bg-white text-emerald-600' : 'bg-gray-50 text-gray-500 group-hover:bg-emerald-50 group-hover:text-emerald-600'}`}>
                                    <Home size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">Inicio / Dashboard</h3>
                                    <p className="text-sm text-gray-500">Resumen general del mercado en tiempo real.</p>
                                </div>
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            
                            {/* 2. COLUMNA SECTORES (GRID) */}
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <LineChart size={14} /> Sectores Económicos
                                </h3>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {sectores
                                      .map((sector) => {
                                        
                                        const Icono = sector.Icono;
                                        const ruta = `/categoria/${sector.id}`;
                                        const activo = isActive(ruta);
                                        
                                        return (
                                            <Link
                                                key={sector.id}
                                                to={ruta}
                                                onClick={closeMenu}
                                                className={`
                                                    flex items-center gap-3 p-3 rounded-xl border transition-all
                                                    ${activo 
                                                        ? `bg-${sector.color}-50 border-${sector.color}-100 ring-1 ring-${sector.color}-100` 
                                                        : 'bg-white border-gray-100 hover:border-gray-300 hover:shadow-sm'}
                                                `}
                                            >
                                                <div className={`p-2 rounded-lg ${activo ? 'bg-white' : 'bg-gray-50'}`}>
                                                    <Icono size={18} className={activo ? `text-${sector.color}-600` : 'text-gray-500'} />
                                                </div>
                                                <span className={`font-medium text-sm ${activo ? `text-${sector.color}-900` : 'text-gray-700'}`}>
                                                    {sector.titulo}
                                                </span>
                                            </Link>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* 3. COLUMNA HERRAMIENTAS (NUEVO) */}
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Calculator size={14} /> Herramientas & Recursos
                                </h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {herramientas.map((tool) => {
                                        const Icono = tool.Icono; // Ojo que en la data nueva lo puse con Mayúscula "Icono"
                                        return (
                                            <Link
                                                key={tool.id}
                                                to={tool.ruta}
                                                onClick={closeMenu}
                                                className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-white hover:border-gray-300 hover:shadow-sm transition-all group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg bg-${tool.color}-50 text-${tool.color}-600 group-hover:scale-110 transition-transform`}>
                                                        <Icono size={18} />
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-gray-700 block">{tool.titulo}</span>
                                                        {/* Opcional: Mostrar la descripción chiquita */}
                                                        <span className="text-[10px] text-gray-400 hidden sm:block">{tool.descripcion}</span>
                                                    </div>
                                                </div>
                                                <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500" />
                                            </Link>
                                        );
                                    })}
                                </div>
                                
{/* ==BANNER PROMOCIONAL MODO PRO================= */}

<div className="mt-auto pt-6 px-2"> {/* mt-auto lo empuja hacia el fondo del menú */}
  <Link
    to="/planes"
    onClick={closeMenu}
    className="block relative overflow-hidden group rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-5 shadow-xl transition-all hover:scale-[1.02] active:scale-95"
  >
    {/* Efecto decorativo: Círculo de luz de fondo */}
    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500 rounded-full mix-blend-overlay filter blur-2xl opacity-20 -translate-y-8 translate-x-8 group-hover:opacity-40 transition-opacity"></div>

    <div className="relative z-10">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">🚀</span>
        <h3 className="font-black text-white text-sm uppercase tracking-wider">
          Modo Pro
        </h3>
      </div>
      
      <p className="text-slate-400 text-xs mb-4 leading-relaxed">
        Desbloqueá descargas ilimitadas y acceso a series históricas completas.
      </p>

      {/* Usamos un <span> con estilo de botón para evitar el error de 
          "button inside anchor" pero manteniendo la misma estética. 
      */}
      <div className="w-full py-2 bg-white text-slate-900 text-[11px] font-black text-center rounded-lg group-hover:bg-blue-50 transition-colors uppercase tracking-tighter">
        Ver planes disponibles
      </div>
    </div>
  </Link>
  
  {/* Texto legal muy pequeño opcional */}
  <p className="text-[10px] text-center text-gray-400 mt-3 opacity-50 uppercase tracking-tighter">
    MonitorEco Pro © 2025
  </p>
</div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        )}

      </header>
      <main className="flex-1"><Outlet /></main>
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
