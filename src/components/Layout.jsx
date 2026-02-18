//Solo ordenará las piezas (navbar(otro componente) + contenido(outlet) + footer(dentro de este componente))
// src/components/Layout.jsx
import { Outlet, Link } from 'react-router-dom';
import { LineChart } from 'lucide-react';
import { sectores } from '../data/sectores';

// Importamos el componente Navbar que ahora contiene toda la lógica
import { Navbar } from './layout/NavBar'; 

export function Layout() {
  // LIMPIEZA TOTAL:
  // Hemos eliminado useState, useAuth, useLocation y todas las funciones
  // como closeMenu o logout. El Layout ahora es 100% visual y ligero.

  return (
    <div className="flex flex-col min-h-screen font-sans dark:bg-slate-950 transition-colors duration-100">
      
      {/* 1. NAVBAR (El Cerebro de Navegación) */}
      <Navbar />

      {/* 2. CONTENIDO PRINCIPAL (Donde se renderizan las páginas) */}
      <main className="flex-1 dark:bg-slate-950 transition-colors duration-300">
        <Outlet />
      </main>
      
      {/* 3. FOOTER (Información estática) */}
      <footer className="bg-gray-900 text-white border-gray-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Branding Column */}
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
            
            {/* Acceso Rápido Column */}
             <div className="col-span-1 md:col-span-2">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Acceso Rápido</h3>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                {sectores.slice(0, 6).map((sector) => (
                  <Link key={sector.id} to={`/categoria/${sector.id}`} className="text-gray-400 hover:text-emerald-400 text-sm transition-colors flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full bg-${sector.color}-500`}></span>
                    {sector.titulo}
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Info Column */}
            <div className="col-span-1">
               <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Info</h3>
               <ul className="space-y-2 text-sm text-gray-400">
                 <li><Link to="/glosario" className="hover:text-white transition-colors">Glosario</Link></li>
                 <li><Link to="/sobre-mi" className="hover:text-white transition-colors">Acerca de mí</Link></li>
               <li><Link to="/contacto" className="hover:text-white transition-colors">Contacto</Link></li>
                 <li><Link to="/api-docs" className="hover:text-white transition-colors">Api Docs</Link></li>
                 <li><Link to="/Terminos" className="hover:text-white transition-colors">Terminos</Link></li>
               
               
               </ul>
            </div>

          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-xs text-gray-500">
            <p>© 2026 MonitorEco. Desarrollado en Argentina.</p>
            <p> Derechos Reservados. Iñaki Etura</p>
          </div>
        </div>
      </footer>
    </div>
  );
}