import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import {
  LineChart,
  Home,
  Menu,
  X,
  ChevronDown,
  User,
  Calculator,
  LogOut,
  BarChart3,    
  GraduationCap,
  BookOpen,      
  Search,
  ShoppingCart,
  ClipboardCheck,
  Heart
} from 'lucide-react';

import { sectores } from '../../data/sectores';
import { herramientas } from '../../data/herramientas';
import { ThemeToggle } from '../ThemeToggle'; 
import { UserMenu } from '../UserMenu';       
import { useAuth } from '../../context/AuthContext';
import { useShop } from '../../context/ShopContext';

export function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuth(); 
  const { cartCount, wishlist } = useShop();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(null); 

  const isActive = (path) => location.pathname === path;

  const toggleMobileSection = (section) => {
    if (mobileExpanded === section) {
      setMobileExpanded(null); 
    } else {
      setMobileExpanded(section); 
    }
  };

  const closeMenu = () => {
    setIsMenuOpen(false);     
    setMobileExpanded(null);  
  };
  
  return (
    <header className="sticky top-0 z-50 w-full border-b backdrop-blur-md transition-all duration-300 bg-slate-950/95 border-slate-200 dark:bg-slate-950/80 dark:border-white/5">    
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* A. LOGOTIPO */}
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
          <div className="flex items-center gap-3 md:gap-4">
            
            {/* 1. INDICADOR FUSIONADO (Fecha + En Vivo) */}
            {/* Aquí hicimos el cambio: Quitamos el badge grande y pusimos el puntito aquí */}
            <div className="hidden md:flex flex-col items-end border-r border-gray-700 pr-4 mr-2">
                <div className="flex items-center gap-1.5">
                    {/* Puntito Pulsante */}
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-wider">
                        En Vivo
                    </p>
                </div>
                <p className="text-xs font-bold text-gray-400 dark:text-gray-400 mt-0.5">
                    {new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })} • Actualizado
                </p>
            </div>

            {/* 2. E-COMMERCE ICONS */}
            <div className="hidden md:flex items-center gap-2 mr-2">
                
                {/* FAVORITOS */}
                <Link to="/perfil" className="relative p-2 text-gray-400 hover:text-rose-500 transition-colors">
                    <Heart size={20} />
                    {wishlist.length > 0 && (
                        <span className="absolute top-1 right-0 h-4 w-4 bg-rose-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow-sm">
                            {wishlist.length}
                        </span>
                    )}
                </Link>

                {/* CARRITO */}
                <button className="relative p-2 text-gray-400 hover:text-emerald-500 transition-colors">
                    <ShoppingCart size={20} />
                    {cartCount > 0 && (
                        <span className="absolute top-1 right-0 h-4 w-4 bg-emerald-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow-sm animate-in zoom-in">
                            {cartCount}
                        </span>
                    )}
                </button>
            </div>

            {/* SEPARADOR */}
            <div className="hidden md:block h-6 w-px bg-gray-700/50"></div>

            {/* 3. MENU USUARIO */}
            <div className="hidden md:block">
              <UserMenu />
            </div>

            {/* 4. TOGGLE MODO OSCURO */}
            <ThemeToggle />

            {/* 5. MENU HAMBURGUESA (Mobile) */}
            <div className="lg:hidden border-l border-gray-200 dark:border-gray-700 pl-4 ml-1">
                <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:bg-slate-800 rounded-md transition-colors"
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>
          </div>
        </div>

        {/* ====================================================================
            NAVBAR SECUNDARIO (DESKTOP - 2XL) - SIN CAMBIOS
            ==================================================================== */}
        <div className="hidden lg:block border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              
              <nav className="flex items-center gap-1">
                <Link to="/" className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/') ? 'bg-emerald-600 text-white shadow-md ring-1 ring-emerald-600' : 'text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-700 dark:hover:text-emerald-400'}`}>
                  <Home size={16} /> Inicio
                </Link>
                <div className="w-px h-5 bg-gray-200 dark:bg-slate-700 mx-2"></div>

                {/* Dropdown Mercados */}
                <div className="relative group">
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-700 dark:hover:text-emerald-400">
                     <BarChart3 size={16} /> Mercados
                     <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-200" />
                  </button>
                  <div className="absolute top-full left-0 mt-1 w-[400px] bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top translate-y-2 group-hover:translate-y-0 z-50">
                     <div className="p-3 grid grid-cols-2 gap-2">
                         {sectores.map((sector) => {
                             const Icono = sector.Icono;
                             return (
                                 <Link key={sector.id} to={`/categoria/${sector.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors group/item">
                                     <div className={`p-1.5 rounded-md bg-${sector.color}-50 dark:bg-${sector.color}-900/20 text-${sector.color}-600 group-hover/item:bg-white dark:group-hover/item:bg-slate-700`}>
                                         <Icono size={16} />
                                     </div>
                                     <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{sector.titulo}</span>
                                 </Link>
                             )
                         })}
                     </div>
                  </div>
                </div>

                {/* Dropdown Herramientas */}
                <div className="relative group">
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-700 dark:hover:text-emerald-400">
                     <Calculator size={16} /> Herramientas
                     <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-200" />
                  </button>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-72 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top translate-y-2 group-hover:translate-y-0 z-50">
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

                <div className="w-px h-5 bg-gray-200 dark:bg-slate-700 mx-2"></div>

                <Link to="/academia" className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/academia') ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800'}`}>
                  <GraduationCap size={16} /> Academia
                </Link>

                <Link to="/libreria" className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/libreria') ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800'}`}>
                  <BookOpen size={16} /> Librería
                </Link>

                <div className="w-px h-5 bg-gray-200 dark:bg-slate-700 mx-2"></div>
                {/* 6. TEST INVERSOR */}
                <Link 
                  to="/test-inversor" 
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${isActive('/test-inversor') ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800'}`}
                >
                  {/* Usamos ClipboardCheck que es más representativo de un examen/test */}
                  <ClipboardCheck size={16} /> 
                  Test Free
                </Link>
                {/* 7. ACERCA DE MÍ */}
                <Link 
                  to="/sobre-mi" 
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors whitespace-nowrap"
                >
                  <User size={16} />
                  Acerca de mí
                </Link>
              </nav>

              {/* BUSCADOR */}
              <div className="hidden md:flex items-center relative group w-72 ml-4">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                 </div>
                 <input 
                    type="text"
                    placeholder="Buscar (cmd+k)..."
                    className="block w-full pl-10 pr-10 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-gray-50 dark:bg-slate-900/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm"
                 />
              </div>

            </div>
          </div>
        </div>

        {/* ====================================================================
            MENÚ MOBILE (DRAWER) - SIN CAMBIOS
            ==================================================================== */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-slate-900 border-b border-gray-800 shadow-2xl z-40 animate-in slide-in-from-top-5 fade-in duration-200 h-[calc(100vh-64px)] overflow-y-auto">
            <div className="p-4 space-y-4 flex flex-col min-h-full"> 
                
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  {user ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                            <img src={user.avatar} alt="Perfil" className="w-10 h-10 rounded-full border border-gray-600"/>
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold">
                                {user.name.charAt(0)}
                            </div>
                        )}
                        <div>
                          <p className="text-white font-bold text-sm">{user.name}</p>
                          <p className="text-emerald-500 text-xs uppercase font-bold tracking-wider">{user.plan || 'Plan Gratuito'}</p>
                        </div>
                      </div>
                      <button onClick={() => { logout(); closeMenu(); }} className="bg-red-900/20 text-red-400 p-2 rounded-lg hover:bg-red-900/40 transition-colors">
                        <LogOut size={20} />
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <Link to="/login" onClick={closeMenu} className="text-center py-2.5 rounded-lg border border-gray-600 text-gray-300 font-medium text-sm hover:bg-slate-700 hover:text-white transition-colors">
                        Iniciar Sesión
                      </Link>
                      <Link to="/register" onClick={closeMenu} className="text-center py-2.5 rounded-lg bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/20">
                        REGISTRARSE
                      </Link>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                    <Link to="/" onClick={closeMenu} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isActive('/') ? 'bg-emerald-900/20 text-emerald-400 border border-emerald-800' : 'text-gray-300 hover:bg-slate-800'}`}>
                        <Home size={20} /> <span className="font-medium">Inicio</span>
                    </Link>

                    <div className="rounded-xl overflow-hidden border border-transparent transition-all">
                        <button onClick={() => toggleMobileSection('mercados')} className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${mobileExpanded === 'mercados' ? 'bg-slate-800 text-white' : 'text-gray-300 hover:bg-slate-800'}`}>
                            <div className="flex items-center gap-3">
                                <BarChart3 size={20} /> <span className="font-medium">Mercados</span>
                            </div>
                            <ChevronDown size={16} className={`transition-transform duration-200 ${mobileExpanded === 'mercados' ? 'rotate-180' : ''}`} />
                        </button>
                        {mobileExpanded === 'mercados' && (
                            <div className="bg-slate-900/50 p-2 grid grid-cols-1 gap-1 border-l-2 border-slate-700 ml-4 my-1 animate-in slide-in-from-top-2 fade-in duration-200">
                                {sectores.map((sector) => {
                                    const Icono = sector.Icono;
                                    return (
                                        <Link key={sector.id} to={`/categoria/${sector.id}`} onClick={closeMenu} className="flex items-center gap-3 p-2 rounded-lg text-gray-400 hover:text-emerald-400 hover:bg-slate-800/50 transition-colors">
                                            <Icono size={16} /> <span className="text-sm">{sector.titulo}</span>
                                        </Link>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    <div className="rounded-xl overflow-hidden border border-transparent transition-all">
                        <button onClick={() => toggleMobileSection('herramientas')} className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${mobileExpanded === 'herramientas' ? 'bg-slate-800 text-white' : 'text-gray-300 hover:bg-slate-800'}`}>
                            <div className="flex items-center gap-3">
                                <Calculator size={20} /> <span className="font-medium">Herramientas</span>
                            </div>
                            <ChevronDown size={16} className={`transition-transform duration-200 ${mobileExpanded === 'herramientas' ? 'rotate-180' : ''}`} />
                        </button>
                        {mobileExpanded === 'herramientas' && (
                            <div className="bg-slate-900/50 p-2 grid grid-cols-1 gap-1 border-l-2 border-slate-700 ml-4 my-1 animate-in slide-in-from-top-2 fade-in duration-200">
                                {herramientas.map((tool) => {
                                    const Icono = tool.Icono;
                                    return (
                                        <Link key={tool.id} to={tool.ruta} onClick={closeMenu} className="flex items-center gap-3 p-2 rounded-lg text-${tool.color}-600 hover:text-emerald-400 hover:bg-slate-800/50 transition-colors">
                                            <Icono size={16} /> <span className="text-sm">{tool.titulo}</span>
                                        </Link>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    <Link to="/academia" onClick={closeMenu} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isActive('/academia') ? 'bg-emerald-900/20 text-emerald-400' : 'text-gray-300 hover:bg-slate-800'}`}>
                        <GraduationCap size={20} /> <span className="font-medium">Academia</span>
                    </Link>

                    <Link to="/libreria" onClick={closeMenu} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isActive('/libreria') ? 'bg-emerald-900/20 text-emerald-400' : 'text-gray-300 hover:bg-slate-800'}`}>
                        <BookOpen size={20} /> <span className="font-medium">Librería</span>
                    </Link>
                    {/* 6. TEST INVERSOR */}
                    <Link to="/test-Inversor" onClick={closeMenu} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isActive('/libreria') ? 'bg-emerald-900/20 text-emerald-400' : 'text-gray-300 hover:bg-slate-800'}`}>
                        <ClipboardCheck size={20} /> <span className="font-medium">Test inversor</span>
                    </Link>
                      
                    <div className="h-px bg-slate-800 my-4"></div>
                        
                    <Link to="/sobre-mi" onClick={closeMenu} className="flex items-center gap-3 p-3 rounded-xl text-gray-400 hover:bg-slate-800 transition-all">
                        <User size={20} /> <span className="font-medium">Acerca de mí</span>
                    </Link>
                </div>
                                    
                <div className="mt-auto pt-6 px-2"> 
                  <Link to="/planes" onClick={closeMenu} className="block relative overflow-hidden group rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-5 shadow-xl transition-all hover:scale-[1.02] active:scale-95">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500 rounded-full mix-blend-overlay filter blur-2xl opacity-20 -translate-y-8 translate-x-8 group-hover:opacity-40 transition-opacity"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">🚀</span>
                        <h3 className="font-black text-white text-sm uppercase tracking-wider">Modo Pro</h3>
                      </div>
                      <p className="text-slate-400 text-xs mb-4 leading-relaxed">Desbloqueá descargas ilimitadas y acceso a series históricas completas.</p>
                      <div className="w-full py-2 bg-white text-slate-900 text-[11px] font-black text-center rounded-lg group-hover:bg-blue-50 transition-colors uppercase tracking-tighter">Ver planes disponibles</div>
                    </div>
                  </Link>
                  <p className="text-[10px] text-center text-gray-400 mt-3 opacity-50 uppercase tracking-tighter">MonitorEco Pro © 2026</p>
                </div>

            </div>
          </div>
        )}
    </header>
  );
}