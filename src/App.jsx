import { BrowserRouter, Routes, Route } from 'react-router-dom';

// --- LÓGICA & UTILIDADES ---
import { AuthProvider } from './context/AuthContext'; 
import ScrollToTop from './components/ScrollToTop';   

// --- LAYOUTS ---
import { Layout } from './components/Layout'; 

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

// --- PÁGINAS (INSTITUCIONALES / STANDALONE) ---
import Terminos from './pages/Terminos'; 
import ApiDocs from './pages/ApiDocs';   

// --- PÁGINAS (AUTH) ---
import { Login } from './pages/Login';       
import { Register } from './pages/Register'; 

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        
        <Routes>
          
          {/* =======================================================
              ZONA A: PÁGINAS "STANDALONE" (Sin Navbar global)
              Estas páginas controlan su propio diseño al 100%
              (Login, Register, Docs Técnicos y Legales)
              ======================================================= */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Rutas Institucionales Agregadas */}
          <Route path="/terminosdeuso" element={<Terminos />} />
          <Route path="/apidocs" element={<ApiDocs />} />

          {/* =======================================================
              ZONA B: APLICACIÓN PRINCIPAL (Con Navbar y Footer)
              ======================================================= */}
          <Route element={<Layout />}> 
            
            <Route path="/" element={<Home />} />
            <Route path="/glosario" element={<Glosario />} />
            <Route path="/sobre-mi" element={<SobreMi />} />
            <Route path="/contacto" element={<Contacto />} />

            {/* Rutas con contenedores especiales */}
            <Route path="/exportar" element={<div className="bg-gray-50 min-h-screen dark:bg-[#0B1121] transition-colors duration-300"><DescargaPremium /></div>}/>

            <Route path="/planes" element={<div className="bg-gray-50 min-h-screen pt-4 dark:bg-[#0B1121] transition-colors duration-300"><Planes /> </div>} 
            />
            
            {/* Rutas Dinámicas */}
            <Route path="/categoria/:id" element={<Categorias />} />
            <Route path="/indicador/:id" element={<DetalleIndicador />} />
            
            {/* Catch-All */}
            <Route path="*" element={<NotFound />} />

          </Route> 

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;