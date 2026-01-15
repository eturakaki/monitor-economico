import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LineChart,
  Home,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  User,
  BookOpen,     
  BarChart2,    
  Download,     
  Calculator,
  LogOut // Icono añadido para el logout en mobile
} from 'lucide-react'; 
import { sectores } from '../data/sectores';
import { herramientas } from '../data/herramientas';

// --- IMPORTACIONES DE SISTEMA ---
import { ThemeToggle } from '../components/ThemeToggle';
import { UserMenu } from './UserMenu'; // <--- 1. IMPORTAMOS EL MENÚ DE USUARIO (Desktop)
import { useAuth } from '../context/AuthContext'; // <--- 2. NECESARIO PARA EL MENÚ MOBILE

export function Layout() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Hook de Autenticación para controlar el estado en Mobile
  const { user, logout } = useAuth(); 

  const isActive = (path) => location.pathname === path;
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className="flex flex-col min-h-screen font-sans dark:bg-slate-950 transition-colors duration-100">
      
      {/* ====================================================================
        HEADER PRINCIPAL (STICKY)
        Utiliza backdrop-blur para dar sensación de cristal (Glassmorphism).
        ====================================================================
      */}
      <header className="sticky top-0 z-50 w-full border-b backdrop-blur-md transition-all duration-300 bg-slate-950/95 border-slate-200 dark:bg-slate-950/80 dark:border-white/5">  
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* A. LOGOTIPO & BRANDING */}
          <Link to="/" className="flex items-center gap-3 group" onClick={closeMenu}>
            <div className="bg-emerald-600 p-2 rounded-lg shadow-sm group-hover:bg-emerald-700 transition-colors">
              <LineChart className="text-white" size={24} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight text-white dark:text-white leading-none">
                Monitor<span className="text-emerald-600">Eco</span>
              </span>
              <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-0.5 hidden sm:block">
                Tablero Macroeconómico
              </span>
            </div>
          </Link>

          {/* B. AREA DE ACCIONES (Derecha) */}
          <div className="flex items-center gap-4">
            
            {/* 1. Indicador de Fecha (Solo Desktop) */}
            <div className="hidden md:block text-right border-r border-gray-200 dark:border-gray-700 pr-4 mr-1">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Actualizado</p>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-300">
                {new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })} • 
                <span className="ml-1 text-emerald-600">En tiempo real</span>
              </p>
            </div>

            {/* 2. Badge "En Vivo" (Solo Tablets/Desktop) */}
            <div className="hidden sm:flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 px-3 py-1.5 rounded-full shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                En vivo
              </span>
            </div>

            {/* 3. MENÚ DE USUARIO (NUEVO) 
                Se muestra solo en pantallas medianas hacia arriba.
                En mobile se oculta y usamos el menú hamburguesa.
            */}
            <div className="hidden md:block ml-2">
              <UserMenu />
            </div>

            {/* 4. TOGGLE MODO OSCURO */}
            <ThemeToggle />

            {/* 5. BOTÓN HAMBURGUESA (Solo Mobile/Tablet) */}
            <div className="2xl:hidden border-l border-gray-200 dark:border-gray-700 pl-4 ml-1">
                <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md focus:outline-none transition-colors"
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

          </div>
        </div>

        {/* ====================================================================
          NAVBAR SECUNDARIO (SOLO DESKTOP - 2XL)
          Barra inferior para navegación rápida entre secciones.
          ====================================================================
        */}
        <div className="hidden 2xl:block border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center h-12 justify-center">
              
              <Link 
                to="/" 
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 mr-2 ${isActive('/') ? 'bg-emerald-600 text-white shadow-md ring-1 ring-emerald-600' : 'text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-700 dark:hover:text-emerald-400'}`}
              >
                <Home size={16} /> Inicio
              </Link>

              <div className="w-px h-5 bg-gray-200 dark:bg-slate-700 mx-2"></div>

              {/* Loop de Sectores */}
              <div className="flex items-center gap-1">
                {sectores.map((sector) => {
                  const Icono = sector.Icono;
                  const ruta = `/categoria/${sector.id}`;
                  const activo = isActive(ruta);
                  return (
                    <Link key={sector.id} to={ruta} className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 focus:outline-none ${activo ? `bg-${sector.color}-100 text-${sector.color}-800 dark:bg-${sector.color}-900/30 dark:text-${sector.color}-300` : `text-gray-600 dark:text-gray-400 hover:bg-${sector.color}-50 dark:hover:bg-slate-800 hover:text-${sector.color}-700 dark:hover:text-${sector.color}-400`}`}>
                      <Icono size={16} className={`transition-transform duration-200 ${activo ? `text-${sector.color}-700` : `text-gray-400 group-hover:text-${sector.color}-600 group-hover:scale-110`}`} />
                      {sector.titulo}
                    </Link>
                  );
                })}
              </div>

              <div className="w-px h-5 bg-gray-200 dark:bg-slate-700 mx-4"></div>

              {/* Dropdown Herramientas */}
              <div className="relative group">
                <button className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-700 dark:hover:text-emerald-400`}>
                   <Calculator size={16} /> 
                   Herramientas
                   <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-200" />
                </button>
                
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-64 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top translate-y-2 group-hover:translate-y-0 z-50">
                    <div className="p-2 grid gap-1">
                        {herramientas.map((tool) => {
                            const Icono = tool.Icono;
                            return (
                                <Link key={tool.id} to={tool.ruta} className="flex items-center gap-3 p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors group/item">
                                    <div className={`p-1.5 rounded-md bg-gray-50 dark:bg-slate-800 text-${tool.color}-600 group-hover/item:bg-white dark:group-hover/item:bg-slate-700`}>
                                        <Icono size={16} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{tool.titulo}</p>
                                        <p className="text-[10px] text-gray-400">{tool.descripcion}</p>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </div>
              </div>

              <Link 
                to="/sobre-mi" 
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors whitespace-nowrap"
              >
                <User size={16} className="shrink-0" />
                Acerca de mí
              </Link>
            </nav>
          </div>
        </div>

        {/* ====================================================================
          MENÚ MOBILE (DRAWER)
          Se despliega en pantallas < 2xl. Ahora incluye sección de usuario.
          ====================================================================
        */}
        {isMenuOpen && (
            <div className="2xl:hidden absolute top-full left-0 w-full backdrop-blur-md bg-slate-900 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-xl z-40 animate-in slide-in-from-top-5 fade-in duration-200">
                <div className="max-h-[85vh] overflow-y-auto">
                    <div className="max-w-4xl mx-auto p-6"> 
                        
                        {/* 0. SECCIÓN DE USUARIO (NUEVO PARA MOBILE) */}
                        <div className="mb-6 pb-6 border-b border-gray-800">
                          {user ? (
                            // ESTADO: LOGUEADO EN MOBILE
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <img src={user.avatar} alt="Perfil" className="w-10 h-10 rounded-full border border-gray-700"/>
                                <div>
                                  <p className="text-white font-bold text-sm">{user.name}</p>
                                  <p className="text-emerald-500 text-xs uppercase font-bold tracking-wider">{user.plan || 'Plan Gratuito'}</p>
                                </div>
                              </div>
                              <button onClick={() => { logout(); closeMenu(); }} className="text-gray-400 hover:text-red-400 transition-colors p-2">
                                <LogOut size={20} />
                              </button>
                            </div>
                          ) : (
                            // ESTADO: GUEST EN MOBILE
                            <div className="grid grid-cols-2 gap-3">
                              <Link 
                                to="/login" 
                                onClick={closeMenu}
                                className="text-center py-2.5 rounded-lg border border-gray-700 text-gray-300 font-medium text-sm hover:bg-slate-800 hover:text-white transition-colors"
                              >
                                Iniciar Sesión
                              </Link>
                              <Link 
                                to="/register" 
                                onClick={closeMenu}
                                className="text-center py-2.5 rounded-lg bg-emerald-600 text-white font-bold text-sm tracking-wide shadow-lg shadow-emerald-900/20 hover:bg-emerald-500 transition-colors"
                              >
                                REGISTRARSE
                              </Link>
                            </div>
                          )}
                        </div>

                        {/* 1. NAVEGACIÓN PRINCIPAL */}
                        <div className="mb-6">
                            <Link 
                                to="/" 
                                onClick={closeMenu}
                                className={`flex items-center p-4 rounded-xl border transition-all shadow-sm group
                                    ${isActive('/') 
                                        ? 'bg-slate-950/90 border-emerald-400 dark:bg-emerald-900/10 dark:border-emerald-800' 
                                        : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 hover:border-emerald-200 hover:shadow-md'
                                    }`}
                            >
                                <div className={`p-3 rounded-lg mr-4 ${isActive('/') ? 'bg-white dark:bg-slate-900 text-emerald-600' : 'bg-gray dark:bg-slate-700 text-gray-500 dark:text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-600'}`}>
                                    <Home size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white dark:text-white text-lg">Inicio / Dashboard</h3>
                                    <p className="text-sm text-gray-400 dark:text-gray-400">Resumen general del mercado en tiempo real.</p>
                                </div>
                            </Link>
                        </div>

                        {/* GRID DE SECCIONES */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            
                            {/* 2. COLUMNA SECTORES */}
                            <div>
                                <h3 className="text-xs font-bold text-white dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <LineChart size={14} /> Sectores Económicos
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 ">
                                    {sectores.map((sector) => {
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
                                                        ? `bg-${sector.color}-50 border-${sector.color}-100 ring-1 ring-${sector.color}-100 dark:bg-${sector.color}-900/20 dark:border-${sector.color}-800` 
                                                        : 'bg-slate-950/90 backdrop-blur-xl dark:bg-slate-800 border-emerald-600 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 hover:shadow-sm'}
                                                `}
                                            >
                                                <div className={`p-2 rounded-lg ${activo ? 'bg-white dark:bg-slate-900' : 'bg-gray-50 dark:bg-slate-700'}`}>
                                                    <Icono size={18} className={activo ? `text-${sector.color}-600` : 'text-emerald-600 dark:text-gray-400'} />
                                                </div>
                                                <span className={`font-medium text-sm ${activo ? `text-${sector.color}-900 dark:text-${sector.color}-300` : 'text-white dark:text-gray-300'}`}>
                                                    {sector.titulo}
                                                </span>
                                            </Link>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* 3. COLUMNA HERRAMIENTAS */}
                            <div>
                                <h3 className="text-xs font-bold text-white dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Calculator size={14} /> Herramientas & Recursos
                                </h3>
                                <div className="grid grid-cols-1 gap-3 ">
                                    {herramientas.map((tool) => {
                                        const Icono = tool.Icono;
                                        return (
                                            <Link
                                                key={tool.id}
                                                to={tool.ruta}
                                                onClick={closeMenu}
                                                className="flex items-center justify-between p-3 rounded-xl border border-emerald-600 dark:border-slate-700 bg-slate-950/90 dark:bg-slate-800 hover:border-gray-300 hover:shadow-sm transition-all group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg bg-white dark:bg-${tool.color}-900/20 text-${tool.color}-600 group-hover:scale-110 transition-transform`}>
                                                        <Icono size={18} />
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-white dark:text-gray-300 block">{tool.titulo}</span>
                                                        <span className="text-[10px] text-gray-400 hidden sm:block">{tool.descripcion}</span>
                                                    </div>
                                                </div>
                                                <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500" />
                                            </Link>
                                        );
                                    })}
                                </div>
                                
                                {/* 4. BANNER PROMOCIONAL */}
                                <div className="mt-auto pt-6 px-2"> 
                                  <Link
                                    to="/planes"
                                    onClick={closeMenu}
                                    className="block relative overflow-hidden group rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-5 shadow-xl transition-all hover:scale-[1.02] active:scale-95"
                                  >
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
                                      <div className="w-full py-2 bg-white text-slate-900 text-[11px] font-black text-center rounded-lg group-hover:bg-blue-50 transition-colors uppercase tracking-tighter">
                                        Ver planes disponibles
                                      </div>
                                    </div>
                                  </Link>
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

      {/* --- CONTENT AREA & FOOTER --- */}
      <main className="flex-1 dark:bg-slate-950 transition-colors duration-300"><Outlet /></main>
      
      <footer className="bg-gray-900 text-white border-gray-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
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
            <div className="col-span-1">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                Info
              </h3>
              <ul className="space-y-2 text-sm text-gray-400">
                {/* Enlaces Informativos */}
                <li><Link to="/glosario" className="hover:text-white">Glosario</Link></li>
                <li><Link to="/sobre-mi" className="hover:text-white">Acerca de mí</Link></li>
                <li><Link to="/contacto" className="hover:text-white transition-colors">Contacto</Link></li>
                
                {/* Enlaces Técnicos y Legales  */}
                <li><Link to="/apidocs" className="hover:text-white">API Docs</Link></li>
                <li><Link to="/terminosdeuso" className="hover:text-white">Términos de uso</Link></li>
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