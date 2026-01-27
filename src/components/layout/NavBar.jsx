import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

// ----------------------------------------------------------------------------------
// IMPORTS: Agregamos iconos nuevos (LayoutDashboard, ShoppingBag, PlayCircle)
// para las secciones privadas del usuario.
// ----------------------------------------------------------------------------------
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
  Heart,
  LayoutDashboard, 
  ShoppingBag,     
  PlayCircle,
  Settings 
} from 'lucide-react';

import { sectores } from '../../data/sectores';
import { herramientas } from '../../data/herramientas';
import { ThemeToggle } from '../ThemeToggle'; 
import { UserMenu } from '../UserMenu';
import { useAuth } from '../../hooks/useAuth';

// --- 1. SEPARACIÓN DE PODERES (Arquitectura Limpia) ---
import { useShop } from '../../context/ShopContext';         // Solo Carrito
import { useWishlist } from '../../context/WishlistContext'; // Solo Favoritos

export function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuth(); 
  
  // --- 2. CONSUMO DE CONTEXTOS INDEPENDIENTES ---
  const { cartCount } = useShop(); // El ShopContext maneja el contador del carrito
  const { wishlist } = useWishlist(); // El WishlistContext maneja el array de favoritos
  
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
    <header className="sticky top-0 z-50 w-full border-b backdrop-blur-xl transition-all duration-300 
      bg-white/90 border-slate-200 
      dark:bg-slate-950/90 dark:border-white/5">    
        
        {/* =================================================================================
            NIVEL 1: BARRA PRINCIPAL (Logo + Acciones) - INTACTO
            ================================================================================= */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* A. IZQUIERDA: LOGOTIPO */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0" onClick={closeMenu}>
            <div className="bg-emerald-600 p-1.5 rounded-lg shadow-sm group-hover:bg-emerald-700 transition-colors">
              <LineChart className="text-white" size={22} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white leading-none">
                Monitor<span className="text-emerald-600">Eco</span>
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest mt-0.5">
                Economic Data
              </span>
            </div>
          </Link>

         {/* B. DERECHA: BARRA DE ACCIONES UNIFICADA */}
          <div className="flex items-center justify-end flex-1 gap-1 sm:gap-2 ml-2">
            
            {/* 1. INDICADOR "EN VIVO" */}
            <div className="flex flex-col items-end border-r border-slate-200 dark:border-gray-800 pr-3 mr-1 sm:pr-4 sm:mr-2">
                <div className="flex items-center gap-1 sm:gap-1.5">
                    <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-emerald-500"></span>
                    </span>
                    <p className="text-[9px] sm:text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-wider leading-none">
                        En Vivo
                    </p>
                </div>
                <p className="text-[9px] sm:text-xs font-bold text-slate-500 dark:text-gray-400 mt-0.5 leading-none">
                    {new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                </p>
            </div>

            {/* 2. FAVORITOS (CONECTADO AL WISHLIST CONTEXT) */}
            <Link to="/favoritos" className="relative p-1.5 sm:p-2 text-slate-500 dark:text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors">
                <Heart size={20} />
                {wishlist.length > 0 && (
                    <span className="absolute top-0.5 right-0.5 h-3.5 w-3.5 bg-rose-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center ring-2 ring-white dark:ring-slate-950 animate-in zoom-in">
                        {wishlist.length}
                    </span>
                )}
            </Link>

           {/* 3. CARRITO (CONECTADO AL SHOP CONTEXT) */}
            <Link 
            to="/carrito"
            className="relative p-1.5 sm:p-2 text-slate-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 h-3.5 w-3.5 bg-emerald-600 rounded-full text-[9px] font-bold text-white flex items-center justify-center animate-in zoom-in ring-2 ring-white dark:ring-slate-950">
                        {cartCount}
                    </span>
                )}
            </Link>

            {/* SEPARADOR EXTRA */}
            <div className="hidden lg:block h-6 w-px bg-slate-200 dark:bg-gray-700/50 mx-1"></div>

            {/* 4. USER MENU (DESKTOP) */}
            <div className="hidden lg:block">
              <UserMenu />
            </div>

            {/* 5. THEME TOGGLE */}
            <div className="flex items-center ml-0.5">
               <ThemeToggle />
            </div>

            {/* 6. HAMBURGUESA (Móvil) */}
            <div className="lg:hidden ml-1">
                <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="p-1.5 text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

          </div>
        </div>

       {/* =================================================================================
           NIVEL 2: BARRA DE NAVEGACIÓN SECUNDARIA (SOLO ESCRITORIO - LG)
           ================================================================================= */}
        <div className="hidden lg:block border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-12">
              <nav className="flex items-center gap-1">
                <Link to="/" className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/') ? 'bg-emerald-600 text-white shadow-md ring-1 ring-emerald-600' : 'text-slate-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-700 dark:hover:text-emerald-400'}`}>
                  <Home size={16} /> Inicio
                </Link>
                {user && (
                    <>
                        <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                        <Link to="/dashboard" className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/dashboard') ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-700 dark:hover:text-emerald-400'}`}>
                            <LayoutDashboard size={16} /> Mi Dashboard
                        </Link>
                        <Link to="/mis-compras" className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/mis-compras') ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-700 dark:hover:text-emerald-400'}`}>
                            <ShoppingBag size={16} /> Mis Compras
                        </Link>
                        <Link to="/mis-cursos" className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/mis-cursos') ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-700 dark:hover:text-emerald-400'}`}>
                            <PlayCircle size={16} /> Mis Cursos
                        </Link>
                    </>
                )}
                <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                
                <div className="relative group">
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors text-slate-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-700 dark:hover:text-emerald-400">
                     <BarChart3 size={16} /> Mercados <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-200" />
                  </button>
                  <div className="absolute top-full left-0 mt-1 w-[400px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top translate-y-2 group-hover:translate-y-0 z-50">
                     <div className="p-3 grid grid-cols-2 gap-2">
                         {sectores.map((sector) => {
                             const Icono = sector.Icono;
                             return (
                                 <Link key={sector.id} to={`/categoria/${sector.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors group/item">
                                     <div className={`p-1.5 rounded-md bg-${sector.color}-50 dark:bg-${sector.color}-900/20 text-${sector.color}-600 group-hover/item:bg-white dark:group-hover/item:bg-slate-700`}><Icono size={16} /></div>
                                     <span className="text-sm font-medium text-slate-700 dark:text-gray-200">{sector.titulo}</span>
                                 </Link>
                             )
                         })}
                     </div>
                  </div>
                </div>
                <div className="relative group">
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors text-slate-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-700 dark:hover:text-emerald-400">
                     <Calculator size={16} /> Herramientas <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-200" />
                  </button>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-72 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top translate-y-2 group-hover:translate-y-0 z-50">
                     <div className="p-2 grid gap-1">
                         {herramientas.map((tool) => {
                             const Icono = tool.Icono;
                             return (
                                 <Link key={tool.id} to={tool.ruta} className="flex items-center gap-3 p-2 rounded-lg hover:bg-emerald-5 dark:hover:bg-slate-800 transition-colors group/item">
                                     <div className={`p-1.5 rounded-md bg-slate-50 dark:bg-slate-800 text-${tool.color}-600 group-hover/item:bg-white dark:group-hover/item:bg-slate-700`}><Icono size={16} /></div>
                                     <div><p className="text-sm font-medium text-slate-700 dark:text-gray-200">{tool.titulo}</p><p className="text-[10px] text-slate-400">{tool.descripcion}</p></div>
                                 </Link>
                             )
                         })}
                     </div>
                  </div>
                </div>
                <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                <Link to="/academia" className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/academia') ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800'}`}>
                  <GraduationCap size={16} /> Academia
                </Link>
                <Link to="/libreria" className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/libreria') ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800'}`}>
                  <BookOpen size={16} /> Librería
                </Link>
                <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                <Link to="/test-inversor" className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${isActive('/test-inversor') ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800'}`}>
                  <ClipboardCheck size={16} /> Test Free
                </Link>
                <Link to="/sobre-mi" className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors whitespace-nowrap">
                  <User size={16} /> Acerca de mí
                </Link>
              </nav>
              <div className="hidden md:flex items-center relative group w-64 ml-4">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-4 w-4 text-slate-400 group-hover:text-emerald-500 transition-colors" /></div>
                 <input type="text" placeholder="Buscar (cmd+k)..." className="block w-full pl-10 pr-4 py-1.5 border border-slate-200 dark:border-gray-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm"/>
              </div>
            </div>
          </div>
        </div>

       {/* =================================================================================
           NIVEL 3: DRAWER MOBILE (Menú Lateral Desplegable)
           ================================================================================= */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-[64px] left-0 w-full bg-slate-50 dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 shadow-2xl z-40 animate-in slide-in-from-top-2 fade-in duration-200 h-[calc(100vh-64px)] overflow-y-auto">
            <div className="p-4 space-y-4 flex flex-col min-h-full"> 
                
                {/* 1. SECCIÓN USUARIO */}
                <div className="bg-white dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
                  {user ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                            <img src={user.avatar} alt="Perfil" className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-600"/>
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold shadow-md">
                                {user.name.charAt(0)}
                            </div>
                        )}
                        <div>
                          <p className="text-slate-900 dark:text-white font-bold text-sm">{user.name}</p>
                          <p className="text-emerald-600 dark:text-emerald-500 text-xs uppercase font-bold tracking-wider">{user.plan || 'Plan Gratuito'}</p>
                        </div>
                      </div>
                      <button onClick={() => { logout(); closeMenu(); }} className="bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
                        <LogOut size={20} />
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <Link to="/login" onClick={closeMenu} className="text-center py-2.5 rounded-lg border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-300 font-medium text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        Iniciar Sesión
                      </Link>
                      <Link to="/register" onClick={closeMenu} className="text-center py-2.5 rounded-lg bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-600/20">
                        REGISTRARSE
                      </Link>
                    </div>
                  )}
                </div>

                {/* 2. ENLACES DE NAVEGACIÓN */}
                <div className="space-y-1">
                    <Link to="/" onClick={closeMenu} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isActive('/') ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800' : 'text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                        <Home size={20} /> <span className="font-medium">Inicio</span>
                    </Link>

                    {user && (
                        <>
                            <Link to="/dashboard" onClick={closeMenu} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isActive('/dashboard') ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800' : 'text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                                <LayoutDashboard size={20} /> <span className="font-medium">Mi Dashboard</span>
                            </Link>
                            
                            <Link to="/perfil" onClick={closeMenu} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isActive('/perfil') ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800' : 'text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                                <Settings size={20} /> <span className="font-medium">Mi Perfil</span>
                            </Link>

                            <Link to="/mis-compras" onClick={closeMenu} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isActive('/mis-compras') ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800' : 'text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                                <ShoppingBag size={20} /> <span className="font-medium">Mis Compras</span>
                            </Link>
                            <Link to="/mis-cursos" onClick={closeMenu} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isActive('/mis-cursos') ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800' : 'text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                                <PlayCircle size={20} /> <span className="font-medium">Mis Cursos</span>
                            </Link>
                            <div className="h-px bg-slate-200 dark:bg-slate-800 my-2 mx-4"></div>
                        </>
                    )}

                    {/* Acordeón Mercados */}
                    <div className="rounded-xl overflow-hidden transition-all">
                        <button onClick={() => toggleMobileSection('mercados')} className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${mobileExpanded === 'mercados' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                            <div className="flex items-center gap-3">
                                <BarChart3 size={20} /> <span className="font-medium">Mercados</span>
                            </div>
                            <ChevronDown size={16} className={`transition-transform duration-200 ${mobileExpanded === 'mercados' ? 'rotate-180' : ''}`} />
                        </button>
                        {mobileExpanded === 'mercados' && (
                            <div className="bg-white dark:bg-slate-900/50 p-2 grid grid-cols-1 gap-1 border-l-2 border-slate-200 dark:border-slate-700 ml-4 my-1">
                                {sectores.map((sector) => {
                                    const Icono = sector.Icono;
                                    return (
                                        <Link key={sector.id} to={`/categoria/${sector.id}`} onClick={closeMenu} className="flex items-center gap-3 p-2 rounded-lg text-slate-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <Icono size={16} /> <span className="text-sm">{sector.titulo}</span>
                                        </Link>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Acordeón Herramientas */}
                    <div className="rounded-xl overflow-hidden transition-all">
                        <button onClick={() => toggleMobileSection('herramientas')} className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${mobileExpanded === 'herramientas' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                            <div className="flex items-center gap-3">
                                <Calculator size={20} /> <span className="font-medium">Herramientas</span>
                            </div>
                            <ChevronDown size={16} className={`transition-transform duration-200 ${mobileExpanded === 'herramientas' ? 'rotate-180' : ''}`} />
                        </button>
                        {mobileExpanded === 'herramientas' && (
                            <div className="bg-white dark:bg-slate-900/50 p-2 grid grid-cols-1 gap-1 border-l-2 border-slate-200 dark:border-slate-700 ml-4 my-1">
                                {herramientas.map((tool) => {
                                    const Icono = tool.Icono;
                                    return (
                                        <Link key={tool.id} to={tool.ruta} onClick={closeMenu} className="flex items-center gap-3 p-2 rounded-lg text-slate-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <Icono size={16} /> <span className="text-sm">{tool.titulo}</span>
                                        </Link>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    <Link to="/academia" onClick={closeMenu} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isActive('/academia') ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                        <GraduationCap size={20} /> <span className="font-medium">Academia</span>
                    </Link>

                    <Link to="/libreria" onClick={closeMenu} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isActive('/libreria') ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                        <BookOpen size={20} /> <span className="font-medium">Librería</span>
                    </Link>
                    
                    <Link to="/test-inversor" onClick={closeMenu} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isActive('/test-inversor') ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                        <ClipboardCheck size={20} /> <span className="font-medium">Test inversor</span>
                    </Link>
                      
                    <div className="h-px bg-slate-200 dark:bg-slate-800 my-4"></div>
                        
                    <Link to="/sobre-mi" onClick={closeMenu} className="flex items-center gap-3 p-3 rounded-xl text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                        <User size={20} /> <span className="font-medium">Acerca de mí</span>
                    </Link>
                </div>
                                    
                {/* 3. CTA UPGRADE */}
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
                  <p className="text-[10px] text-center text-slate-400 mt-3 opacity-50 uppercase tracking-tighter">MonitorEco Pro © 2026</p>
                </div>

            </div>
          </div>
        )}
    </header>
  );
}