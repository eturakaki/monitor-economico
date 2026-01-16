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

// --- HUB DE HERRAMIENTAS ---
import { Calculadoras } from './pages/Herramientas';

// =====================================================================
// 🛠️ SECCIÓN DE HERRAMIENTAS (CALCULADORAS)
// IMPORTANTE: Rutas adaptadas a tus carpetas actuales con paréntesis
// =====================================================================

// --- MÓDULO I: INFLACIÓN ---
import { AjusteInflacion } from './pages/herramientas/Inflacion (Mod1)/AjusteInflacion';
import { SalarioReal } from './pages/herramientas/Inflacion (Mod1)/SalarioReal';
import { Stockeo } from './pages/herramientas/Inflacion (Mod1)/Stockeo';
import { MiIPC } from './pages/herramientas/Inflacion (Mod1)/MiIPC';
import { ProyectorTarifas } from './pages/herramientas/Inflacion (Mod1)/ProyectorTarifas';
import { CanastaRegional } from './pages/herramientas/Inflacion (Mod1)/CanastaRegional';
// --- MÓDULO II: INVERSIONES ---
// Carpeta: "inversiones (mod 2)"
import { RadarLiquidez } from './pages/herramientas/inversiones (mod 2)/RadarLiquidez';
import { PlazoFijoUVA } from './pages/herramientas/inversiones (mod 2)/PlazoFijoUVA';
import { CarryTrade } from './pages/herramientas/inversiones (mod 2)/CarryTrade';
import { RutasDolar } from './pages/herramientas/inversiones (mod 2)/RutasDolar';
import { CalculadoraBonos } from './pages/herramientas/inversiones (mod 2)/CalculadoraBonos';
import { ArbitrajeCedears } from './pages/herramientas/inversiones (mod 2)/ArbitrajeCedears';



// --- MÓDULO III: CRÉDITO ---
// Carpeta: "credito(mod3)"
// import { CuotaSimple } from './pages/herramientas/credito(mod3)/CuotaSimple';
// ... resto del módulo 3

// --- MÓDULO IV: INMOBILIARIO ---
// Carpeta: "inmobiliario(mod4)"
// import { HipotecarioUVA } from './pages/herramientas/inmobiliario(mod4)/HipotecarioUVA';
// ... resto del módulo 4

// --- MÓDULO V: FISCAL ---
// Carpeta: "fiscal(mod5)"
// import { Monotributo } from './pages/herramientas/fiscal(mod5)/Monotributo';
// ... resto del módulo 5

// --- MÓDULO VI: ESTILO DE VIDA ---
// Carpeta: "estilo-vida(mod6)"
// import { PlanificadorViajes } from './pages/herramientas/estilo-vida(mod6)/PlanificadorViajes';
// ... resto del módulo 6

// --- MÓDULO VII: CORPORATIVO ---
// Carpeta: "corporativo(mod7)"
// import { DescuentoCheques } from './pages/herramientas/corporativo(mod7)/DescuentoCheques';


// --- PÁGINAS NUEVAS (Feature: Intelligence) ---
import AnalyticsPage from './pages/Analytics';

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
          
          {/* ZONA A: PÁGINAS "STANDALONE" */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/terminosdeuso" element={<Terminos />} />
          <Route path="/apidocs" element={<ApiDocs />} />

          {/* ZONA B: APLICACIÓN PRINCIPAL */}
          <Route element={<Layout />}> 
            
            <Route path="/" element={<Home />} />
            <Route path="/glosario" element={<Glosario />} />
            <Route path="/sobre-mi" element={<SobreMi />} />
            <Route path="/contacto" element={<Contacto />} />

            {/* --- FEATURES --- */}
            <Route 
              path="/analytics" 
              element={
                <div className="bg-slate-50 min-h-screen dark:bg-[#0B1121] transition-colors duration-300">
                  <AnalyticsPage />
                </div>
              } 
            />

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

            {/* =======================================================
                ZONA DE HERRAMIENTAS (Rutas Públicas Limpias)
                Aunque tus carpetas tengan nombres raros, la URL 
                que ve el usuario debe ser limpia (/calculadoras/...)
                ======================================================= */}
            
            <Route path="/herramientas" element={<Calculadoras />} />

            {/* Módulo I: Inflación */}
            <Route path="/calculadoras/inflacion/ajuste" element={<AjusteInflacion />} />
            <Route path="/calculadoras/inflacion/salario-real" element={<SalarioReal />} />
            <Route path="/calculadoras/inflacion/stockeo" element={<Stockeo />} />
            <Route path="/calculadoras/inflacion/mi-ipc" element={<MiIPC />} />
            <Route path="/calculadoras/inflacion/tarifas" element={<ProyectorTarifas />} />
            <Route path="/calculadoras/inflacion/canasta-regional" element={<CanastaRegional />} />
                        
            {/* Módulo II: Inversiones */}
            <Route path="/calculadoras/inversiones/liquidez" element={<RadarLiquidez />} />
            <Route path="/calculadoras/inversiones/bonos" element={<CalculadoraBonos />} />
            <Route path="/calculadoras/inversiones/cedears" element={<ArbitrajeCedears />} />
            <Route path="/calculadoras/inversiones/plazo-fijo-uva" element={<PlazoFijoUVA />} />
            <Route path="/calculadoras/inversiones/carry-trade" element={<CarryTrade />} />
            <Route path="/calculadoras/inversiones/dolarizacion" element={<RutasDolar />} />
                        
            {/* Módulo III: Crédito */}
            {/* <Route path="/calculadoras/credito/cuota-simple" element={<CuotaSimple />} /> */}
            
            {/* ... Agrega aquí el resto de rutas a medida que crees los archivos ... */}

            {/* Rutas Dinámicas y 404 */}
            <Route path="/categoria/:id" element={<Categorias />} />
            <Route path="/indicador/:id" element={<DetalleIndicador />} />
            <Route path="*" element={<NotFound />} />

          </Route> 
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;