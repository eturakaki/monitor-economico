import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';

// --- LÓGICA & UTILIDADES ---
import { useAuth } from './hooks/useAuth';
import ScrollToTop from './components/ScrollToTop';   
import ProtectedRoute from './components/auth/ProtectedRoute'; 

// --- CONTEXTOS (ECOSISTEMA DE DATOS) ---
// Inyectamos los proveedores de estado global aquí
import { ShopProvider } from './context/ShopContext';
import { WishlistProvider } from './context/WishlistContext';

// --- LAYOUTS ---
import { Layout } from './components/Layout'; 

// --- PÁGINAS (APP PRINCIPAL) ---
import { Home } from './pages/Home';
import { DetalleIndicador } from './pages/DetalleIndicador';
import { Categorias } from './pages/Categorias';
import { Glosario } from './pages/TEMP_Glosario';
import { DescargaPremium } from './pages/DescargaPremiun'; 
import Planes from './pages/Planes'; 
import { NotFound } from './pages/NotFound';
import { SobreMi } from './pages/SobreMi';
import { Contacto } from './pages/Contacto';
import Dashboard from './pages/DashBoard';
import Perfil from './pages/Perfil'; 
import ApiDashboard from './pages/ApiDashboard'; 
import { InvestorTestPage } from './pages/features/test-inversor/InvestorTestPage';

// --- HUB DE HERRAMIENTAS & MERCADOS ---
import { Calculadoras } from './pages/Herramientas';
import { Mercados } from './pages/Mercados';

// =====================================================================
// 🛠️ SECCIÓN DE HERRAMIENTAS (CALCULADORAS) - RESTAURADAS
// =====================================================================

// --- MÓDULO I: INFLACIÓN ---
import { AjusteInflacion } from './pages/herramientas/Inflacion (Mod1)/AjusteInflacion';
import { SalarioReal } from './pages/herramientas/Inflacion (Mod1)/SalarioReal';
import { Stockeo } from './pages/herramientas/Inflacion (Mod1)/Stockeo';
import { MiIPC } from './pages/herramientas/Inflacion (Mod1)/MiIPC';
import { ProyectorTarifas } from './pages/herramientas/Inflacion (Mod1)/ProyectorTarifas';
import { CanastaRegional } from './pages/herramientas/Inflacion (Mod1)/CanastaRegional';

// --- MÓDULO II: INVERSIONES ---
import { RadarLiquidez } from './pages/herramientas/inversiones (mod 2)/RadarLiquidez';
import { PlazoFijoUVA } from './pages/herramientas/inversiones (mod 2)/PlazoFijoUVA';
import { CarryTrade } from './pages/herramientas/inversiones (mod 2)/CarryTrade';
import { RutasDolar } from './pages/herramientas/inversiones (mod 2)/RutasDolar';
import { CalculadoraBonos } from './pages/herramientas/inversiones (mod 2)/CalculadoraBonos';
import { ArbitrajeCedears } from './pages/herramientas/inversiones (mod 2)/ArbitrajeCedears';
import { InflacionUsdSpy } from './pages/herramientas/inversiones (mod 2)/InflacionUsdSpy';
import { CalculadoraRetiro } from './pages/herramientas/inversiones (mod 2)/CalculadoraRetiro';
import { BandasCambiarias } from './pages/herramientas/inversiones (mod 2)/BandasCambiarias';
import { MonitorMercado } from './pages/herramientas/inversiones (mod 2)/MonitorMercado';
import { ScannerBonos } from './pages/herramientas/inversiones (mod 2)/ScannerBonos';
import { FlujoFondosBonos } from './pages/herramientas/inversiones (mod 2)/FlujoFondosBonos';
import { CalendarioDividendos } from './pages/herramientas/inversiones (mod 2)/CalendarioDividendos';

// --- MÓDULO III: CRÉDITO ---
import { DecodificadorCFT } from './pages/herramientas/credito(mod3)/DecodificadorCFT';
import { BolaNieve } from './pages/herramientas/credito(mod3)/BolaNieve';
import { CapacidadEndeudamiento } from './pages/herramientas/credito(mod3)/CapacidadEndeudamiento';
import { ConsolidadorDeudas } from './pages/herramientas/credito(mod3)/ConsolidadorDeudas';
import { SimuladorPrendario } from './pages/herramientas/credito(mod3)/SimuladorPrendario';
import { CuotaSimple } from './pages/herramientas/credito(mod3)/CuotaSimple';

// --- MÓDULO IV: INMOBILIARIO ---
import { ComprarAlquilar } from './pages/herramientas/inmobiliario(mod4)/ComprarAlquilar';
import { HipotecarioUVA } from './pages/herramientas/inmobiliario(mod4)/HipotecarioUVA';
import { ActualizadorAlquiler } from './pages/herramientas/inmobiliario(mod4)/ActualizadorAlquiler';
import { CostosIngreso } from './pages/herramientas/inmobiliario(mod4)/CostosIngreso';
import { RentabilidadInmueble } from './pages/herramientas/inmobiliario(mod4)/RentabilidadInmueble';
import { CostoConstruccion } from './pages/herramientas/inmobiliario(mod4)/CostoConstruccion';
import { GastosEscritura } from './pages/herramientas/inmobiliario(mod4)/GastosEscritura';

// --- MÓDULO V: FISCAL ---
import { CalculadoraCourier } from './pages/herramientas/fiscal(mod5)/CalculadoraCourier';
import { GrossingUp } from './pages/herramientas/fiscal(mod5)/GrossingUp';
import { RetencionesSircreb } from './pages/herramientas/fiscal(mod5)/RetencionesSircreb';
import { CalculadoraGanancias } from './pages/herramientas/fiscal(mod5)/CalculadoraGanancias';
import { CategorizadorMonotributo } from './pages/herramientas/fiscal(mod5)/CategorizadorMonotributo';
import { ExportacionServicios } from './pages/herramientas/fiscal(mod5)/ExportacionServicios';

// --- MÓDULO VI: ESTILO DE VIDA ---
import { CalculadoraDolarTarjeta } from './pages/herramientas/estilo-vida(mod6)/CalculadoraDolarTarjeta';
import { PresupuestoViaje } from './pages/herramientas/estilo-vida(mod6)/PresupuestoViaje';
import { GestorSuscripciones } from './pages/herramientas/estilo-vida(mod6)/GestorSuscripciones';
import { OptimizadorOfertas } from './pages/herramientas/estilo-vida(mod6)/OptimizadorOfertas';

// --- MÓDULO VII: CORPORATIVO ---
import { DescuentoCheques } from './pages/herramientas/corporativo(mod7)/DescuentoCheques';
import { SimuladorMontecarlo } from './pages/herramientas/corporativo(mod7)/SimuladorMontecarlo';

// --- PÁGINAS NUEVAS (Feature: Intelligence) ---
import AnalyticsPage from './pages/Analytics';

// --- PÁGINAS (INSTITUCIONALES / STANDALONE) ---
import Terminos from './pages/Terminos'; 
import ApiDocs from './pages/ApiDocs';   

// --- PÁGINAS (AUTH) ---
import  Login  from './pages/Login';
import { Register } from './pages/Register';
import Recovery from './pages/Recovery';

// --- TIENDAS & E-COMMERCE ---
import Academia from './pages/Academia';
import Libreria from './pages/Libreria';

// COMPONENTES DE SHOP
import { CartDrawer } from './components/shop/CartDrawer'; 
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishListPage'; // Corregido case sensitivity (WishListPage vs WishlistPage)
import CheckoutPage from './pages/CheckoutPage'; 
import PurchasesPage from './pages/PurchasesPage'; 
import MyCoursesPage from './pages/MyCoursesPage';


function App() {
  /**
   * -----------------------------------------------------------------
   * HOOK DE AUTENTICACIÓN
   * -----------------------------------------------------------------
   * Usamos 'useAuth' aquí porque AuthProvider envuelve a <App> en main.jsx.
   */
  const { user } = useAuth(); 

  return (
    // 🏗️ ARQUITECTURA DE PROVEEDORES
    // 1. ShopProvider: Maneja el carrito y lógica transaccional.
    // 2. WishlistProvider: Maneja favoritos y sincronización DB (Depende de Auth).
    <ShopProvider>
      <WishlistProvider>
        
        {/* COMPONENTES GLOBALES */}
        <ScrollToTop />
        <CartDrawer /> {/* Ahora tiene acceso seguro al ShopContext */}

        <Routes>
          
          {/* ======================================================
              ZONA A: PÁGINAS "STANDALONE" (Sin Navbar, Sin Footer)
              ====================================================== */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/terminosdeuso" element={<Terminos />} />
          <Route path="/apidocs" element={<ApiDocs />} />
          <Route path="/recovery" element={<Recovery />} />

          {/* ======================================================
              ZONA B: APLICACIÓN PRINCIPAL (Con Layout)
              ====================================================== */}
          <Route element={<Layout />}> 
            
            {/* 1. RUTAS PÚBLICAS */}
            <Route path="/" element={<Home />} />
            <Route path="/glosario" element={<Glosario />} />
            <Route path="/sobre-mi" element={<SobreMi />} />
            <Route path="/contacto" element={<Contacto />} />
            
            {/* Landing de Planes (Con fondo especial) */}
            <Route path="/planes" element={
              <div className="bg-gray-50 min-h-screen pt-4 dark:bg-[#0B1121] transition-colors duration-300">
                <Planes /> 
              </div>
            } />

            {/* 2. RUTAS PROTEGIDAS (Requieren Login) 🛡️ */}
            <Route element={<ProtectedRoute />}>
                {/* Feature: Panel de Usuario */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/perfil" element={<Perfil />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                
                {/* Feature: E-Commerce Personal */}
                <Route path="/mis-compras" element={<PurchasesPage />} />
                <Route path="/mis-cursos" element={<MyCoursesPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route 
                        path="/exportar" 
                        element={
                            <div className="bg-slate-50 min-h-screen dark:bg-[#0B1121] transition-colors duration-300">
                                <DescargaPremium />
                            </div>
                        } 
                    />
                {/* 🛡️ NIVEL 2 ⛔ ESTRATEGIA "HARD GATE" */}
                <Route element={
                    <ProtectedRoute 
                      isAllowed={!!user && ['pro', 'unlimited'].includes(user.plan)} 
                      redirectTo="/planes" 
                    />
                }>
                    {/* Rutas exclusivas Pro/Unlimited podrían ir aquí */}
                </Route>

                {/* 🛡️ NIVEL 3: SOLO EMPRESAS (Unlimited) */}
                <Route element={
                    <ProtectedRoute 
                      isAllowed={!!user && user.plan === 'unlimited'}
                      redirectTo="/planes"
                    />
                }>
                    <Route path="/api-keys" element={<ApiDashboard />} />
                </Route>
            
            </Route>

            {/* =======================================================
                ZONA DE HERRAMIENTAS (PÚBLICAS / FREEMIUM)
                ======================================================= */}
            
            <Route path="/herramientas" element={<Calculadoras />} />

            {/* Módulos de Herramientas (Listado plano respetado) */}
            <Route path="/calculadoras/inflacion/ajuste" element={<AjusteInflacion />} />
            <Route path="/calculadoras/inflacion/salario-real" element={<SalarioReal />} />
            <Route path="/calculadoras/inflacion/stockeo" element={<Stockeo />} />
            <Route path="/calculadoras/inflacion/mi-ipc" element={<MiIPC />} />
            <Route path="/calculadoras/inflacion/tarifas" element={<ProyectorTarifas />} />
            <Route path="/calculadoras/inflacion/canasta-regional" element={<CanastaRegional />} />
            
            <Route path="/calculadoras/inversiones/liquidez" element={<RadarLiquidez />} />
            <Route path="/calculadoras/inversiones/bonos" element={<CalculadoraBonos />} />
            <Route path="/calculadoras/inversiones/cedears" element={<ArbitrajeCedears />} />
            <Route path="/calculadoras/inversiones/plazo-fijo-uva" element={<PlazoFijoUVA />} />
            <Route path="/calculadoras/inversiones/carry-trade" element={<CarryTrade />} />
            <Route path="/calculadoras/inversiones/dolarizacion" element={<RutasDolar />} />
            <Route path="/calculadoras/inversiones/inflacion-usd" element={<InflacionUsdSpy />} />
            <Route path="/calculadoras/inversiones/retiro" element={<CalculadoraRetiro />} />
            <Route path="/calculadoras/inversiones/bandas" element={<BandasCambiarias />} />
            <Route path="/calculadoras/inversiones/monitor" element={<MonitorMercado />} />
            <Route path="/calculadoras/inversiones/scanner-bonos" element={<ScannerBonos />} />
            <Route path="/calculadoras/inversiones/flujo-bonos" element={<FlujoFondosBonos />} />
            <Route path="/calculadoras/inversiones/dividendos" element={<CalendarioDividendos />} />
            
            <Route path="/calculadoras/credito/cft" element={<DecodificadorCFT />} />
            <Route path="/calculadoras/credito/bola-nieve" element={<BolaNieve />} />
            <Route path="/calculadoras/credito/capacidad" element={<CapacidadEndeudamiento />} />
            <Route path="/calculadoras/credito/consolidacion" element={<ConsolidadorDeudas />} />
            <Route path="/calculadoras/credito/prendarios" element={<SimuladorPrendario />} />
            <Route path="/calculadoras/credito/cuota-simple" element={<CuotaSimple />} />
            
            <Route path="/calculadoras/inmobiliario/comprar-alquilar" element={<ComprarAlquilar />} />
            <Route path="/calculadoras/inmobiliario/hipotecario-uva" element={<HipotecarioUVA />} />
            <Route path="/calculadoras/inmobiliario/alquiler" element={<ActualizadorAlquiler />} />
            <Route path="/calculadoras/inmobiliario/inicio-alquiler" element={<CostosIngreso />} />
            <Route path="/calculadoras/inmobiliario/rentabilidad" element={<RentabilidadInmueble />} />
            <Route path="/calculadoras/inmobiliario/construccion" element={<CostoConstruccion />} />
            <Route path="/calculadoras/inmobiliario/escrituracion" element={<GastosEscritura />} />
            
            <Route path="/calculadoras/fiscal/importaciones" element={<CalculadoraCourier />} />
            <Route path="/calculadoras/fiscal/grossing-up" element={<GrossingUp />} />
            <Route path="/calculadoras/fiscal/sircreb" element={<RetencionesSircreb />} />
            <Route path="/calculadoras/fiscal/ganancias" element={<CalculadoraGanancias />} />
            <Route path="/calculadoras/fiscal/monotributo" element={<CategorizadorMonotributo />} />
            <Route path="/calculadoras/fiscal/exportacion" element={<ExportacionServicios />} />
            
            <Route path="/calculadoras/vida/dolar-tarjeta" element={<CalculadoraDolarTarjeta />} />
            <Route path="/calculadoras/vida/viajes" element={<PresupuestoViaje />} />
            <Route path="/calculadoras/vida/suscripciones" element={<GestorSuscripciones />} />
            <Route path="/calculadoras/vida/ofertas" element={<OptimizadorOfertas />} />
            
            <Route path="/calculadoras/corporativo/cheques" element={<DescuentoCheques />} />
            <Route path="/calculadoras/corporativo/montecarlo" element={<SimuladorMontecarlo />} />

            {/* --- SECCIÓN EDUCATIVA & STORE --- */}
            <Route path="/academia" element={<Academia />} />
            <Route path="/libreria" element={<Libreria />} />

            {/* --- Carrito y checkout (Accesos directos) --- */}
            <Route path="/carrito" element={<CartPage />} />
            <Route path="/favoritos" element={<WishlistPage />} />

            {/* Rutas Dinámicas y 404 */}
            <Route path="/categoria/:id" element={<Categorias />} />
            <Route path="/mercados" element={<Mercados />} />
            <Route path="/indicador/:id" element={<DetalleIndicador />} />
            
            {/* TEST INVERSOR */}
            <Route path="/test-inversor" element={<InvestorTestPage />} />
            
            <Route path="*" element={<NotFound />} />
          </Route> 
        </Routes>
        <Toaster richColors position="bottom-right" duration={2000} />
      </WishlistProvider>
    </ShopProvider>
  );
}

export default App;