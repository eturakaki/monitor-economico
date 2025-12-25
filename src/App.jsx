import { BrowserRouter, Routes, Route } from 'react-router-dom';

// --- LÓGICA & UTILIDADES ---
import { AuthProvider } from './context/AuthContext'; // El cerebro de la sesión
import ScrollToTop from './components/ScrollToTop';   // UX: Resetea scroll al navegar

// --- LAYOUTS ---
import { Layout } from './components/Layout'; // Contiene Navbar y Footer

// --- PÁGINAS (APP PRINCIPAL) ---
import { Home } from './pages/Home';
import { DetalleIndicador } from './pages/DetalleIndicador';
import { Categorias } from './pages/Categorias';
import { Glosario } from './pages/TEMP_Glosario';
import { DescargaPremium } from './pages/DescargaPremiun'; 
import { Planes } from './pages/Planes';
import { NotFound } from './pages/NotFound';
import { SobreMi } from './pages/SobreMi';
import { Contacto } from './pages/Contacto';

// --- PÁGINAS (AUTH) ---
import { Login } from './pages/Login';       
import { Register } from './pages/Register'; 

function App() {
  return (
    // 1. AuthProvider envuelve TODO para proveer estado global
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        
        <Routes>
          
          {/* =======================================================
              ZONA A: PÁGINAS "STANDALONE" (Sin Navbar ni Footer)
              Diseño limpio para maximizar conversión (Login/Registro)
              ======================================================= */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />


          {/* =======================================================
              ZONA B: APLICACIÓN PRINCIPAL (Con Navbar y Footer)
              Usamos un "Wrapper" (Layout) que persiste en la navegación.
              ======================================================= */}
          <Route element={<Layout />}> {/* <--- APERTURA DEL LAYOUT */}
            
            <Route path="/" element={<Home />} />
            <Route path="/glosario" element={<Glosario />} />
            <Route path="/sobre-mi" element={<SobreMi />} />
            <Route path="/contacto" element={<Contacto />} />

            {/* Rutas con contenedores especiales para modo oscuro/claro */}
            <Route 
              path="/exportar" 
              element={
                <div className="bg-gray-50 min-h-screen dark:bg-[#0B1121] transition-colors duration-300">
                  <DescargaPremium /> 
                </div>
              } 
            />

            <Route 
              path="/planes" 
              element={
                <div className="bg-gray-50 min-h-screen pt-4 dark:bg-[#0B1121] transition-colors duration-300">
                  <Planes /> 
                </div>
              } 
            />
            
            {/* Rutas Dinámicas (Detectan ID en la URL) */}
            <Route path="/categoria/:id" element={<Categorias />} />
            <Route path="/indicador/:id" element={<DetalleIndicador />} />
            
            {/* Catch-All (Error 404 dentro del Layout) */}
            <Route path="*" element={<NotFound />} />

          </Route> {/* <--- CIERRE DEL LAYOUT (¡Esto faltaba antes!) */}

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;