import { Outlet, Link } from 'react-router-dom';
import { LineChart } from 'lucide-react';

export function Layout() {
  return (
    //Div de Header//
    <div className="flex flex-col min-h-screen">
      
      {/* --- NAVBAR (El Marco de Arriba) --- */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            
            {/* Logo y Nombre */}
            <div className="flex items-center gap-2">
              <div className="bg-emerald-600 p-2 rounded-lg">
                <LineChart className="text-white" size={24} />
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-900">
                Monitor<span className="text-emerald-600">Eco</span>
              </span>
            </div>

            {/* Menú de Navegación */}
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-gray-900 font-medium hover:text-emerald-600 transition-colors">
                Inicio
              </Link>
              <Link to="/mercados" className="text-gray-500 hover:text-emerald-600 transition-colors">
                Mercados
              </Link>
              <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors">
                Suscribirse
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* --- EL CONTENIDO CAMBIANTE (La Foto) --- */}
      {/* Aquí es donde React Router inyectará la Home o el Detalle */}
      <main className="flex-grow">
        <Outlet /> 
      </main>

      {/* --- FOOTER (El Marco de Abajo) --- */}
      <footer className="bg-gray-900 text-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="opacity-60 text-sm">
            © 2025 Iñaki Etura - Monitor Macroeconómico
          </p>
        </div>
      </footer>

    </div>
  );
}