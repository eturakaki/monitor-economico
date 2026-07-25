import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Loader2 } from 'lucide-react';

// --- ESTRUCTURALES (carga inmediata: se usan en todas las vistas) ---
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { Layout } from './components/Layout';
import { LearningLayout } from './components/layout/LearningLayout';
import { CartDrawer } from './components/shop/CartDrawer';
import { WishlistProvider } from './context/WishlistContext';

/**
 * Helper de carga diferida (code-splitting).
 * Soporta tanto named exports como default exports.
 * Cada página se descarga sólo cuando el usuario entra a su ruta.
 */
const lazyPage = (loader, name) =>
  lazy(() => loader().then((m) => ({ default: m[name] ?? m.default })));

// --- PÁGINAS GENERALES ---
const Home = lazyPage(() => import('./pages/Home'), 'Home');
const Glosario = lazyPage(() => import('./pages/Glosario'), 'Glosario');
const SobreMi = lazyPage(() => import('./pages/SobreMi'), 'SobreMi');
const Contacto = lazyPage(() => import('./pages/Contacto'), 'Contacto');
const Planes = lazyPage(() => import('./pages/Planes'), 'Planes');
const NotFound = lazyPage(() => import('./pages/NotFound'), 'NotFound');
const Terminos = lazyPage(() => import('./pages/Terminos'), 'Terminos');
const ApiDocs = lazyPage(() => import('./pages/ApiDocs'), 'ApiDocs');
const Categorias = lazyPage(() => import('./pages/Categorias'), 'Categorias');
const Mercados = lazyPage(() => import('./pages/Mercados'), 'Mercados');
const DetalleIndicador = lazyPage(() => import('./pages/DetalleIndicador'), 'DetalleIndicador');
const DescargaPremium = lazyPage(() => import('./pages/DescargaPremium'), 'DescargaPremium');

// --- AUTENTICACIÓN ---
const Login = lazyPage(() => import('./pages/Login'), 'Login');
const Register = lazyPage(() => import('./pages/Register'), 'Register');
const Recovery = lazyPage(() => import('./pages/Recovery'), 'Recovery');

// --- ÁREA PRIVADA ---
const Dashboard = lazyPage(() => import('./pages/DashBoard'), 'Dashboard');
const Perfil = lazyPage(() => import('./pages/Perfil'), 'Perfil');
const AnalyticsPage = lazyPage(() => import('./pages/Analytics'), 'Analytics');
const ApiDashboard = lazyPage(() => import('./pages/ApiDashboard'), 'ApiDashboard');

// --- E-COMMERCE ---
const CartPage = lazyPage(() => import('./pages/CartPage'), 'CartPage');
const WishlistPage = lazyPage(() => import('./pages/WishListPage'), 'WishlistPage');
const CheckoutPage = lazyPage(() => import('./pages/CheckoutPage'), 'CheckoutPage');
const PurchasesPage = lazyPage(() => import('./pages/PurchasesPage'), 'PurchasesPage');

// --- ACADEMIA ---
const Academia = lazyPage(() => import('./pages/Academia'), 'Academia');
const Libreria = lazyPage(() => import('./pages/Libreria'), 'Libreria');
const MyCoursesPage = lazyPage(() => import('./pages/MyCoursesPage'), 'MyCoursesPage');
const CoursePlayerPage = lazyPage(() => import('./pages/CoursePlayerPage'), 'CoursePlayerPage');
const InvestorTestPage = lazyPage(
  () => import('./pages/features/test-inversor/InvestorTestPage'),
  'InvestorTestPage'
);

// --- HUB DE HERRAMIENTAS ---
const Calculadoras = lazyPage(() => import('./pages/Herramientas'), 'Calculadoras');

// --- MÓDULO I: INFLACIÓN ---
const AjusteInflacion = lazyPage(() => import('./pages/herramientas/inflacion/AjusteInflacion'), 'AjusteInflacion');
const SalarioReal = lazyPage(() => import('./pages/herramientas/inflacion/SalarioReal'), 'SalarioReal');
const Stockeo = lazyPage(() => import('./pages/herramientas/inflacion/Stockeo'), 'Stockeo');
const MiIPC = lazyPage(() => import('./pages/herramientas/inflacion/MiIPC'), 'MiIPC');
const ProyectorTarifas = lazyPage(() => import('./pages/herramientas/inflacion/ProyectorTarifas'), 'ProyectorTarifas');
const CanastaRegional = lazyPage(() => import('./pages/herramientas/inflacion/CanastaRegional'), 'CanastaRegional');

// --- MÓDULO II: INVERSIONES ---
const RadarLiquidez = lazyPage(() => import('./pages/herramientas/inversiones/RadarLiquidez'), 'RadarLiquidez');
const PlazoFijoUVA = lazyPage(() => import('./pages/herramientas/inversiones/PlazoFijoUva'), 'PlazoFijoUVA');
const CarryTrade = lazyPage(() => import('./pages/herramientas/inversiones/CarryTrade'), 'CarryTrade');
const RutasDolar = lazyPage(() => import('./pages/herramientas/inversiones/RutasDolar'), 'RutasDolar');
const CalculadoraBonos = lazyPage(() => import('./pages/herramientas/inversiones/CalculadoraBonos'), 'CalculadoraBonos');
const ArbitrajeCedears = lazyPage(() => import('./pages/herramientas/inversiones/ArbitrajeCedears'), 'ArbitrajeCedears');
const InflacionUsdSpy = lazyPage(() => import('./pages/herramientas/inversiones/InflacionUsdSpy'), 'InflacionUsdSpy');
const CalculadoraRetiro = lazyPage(() => import('./pages/herramientas/inversiones/CalculadoraRetiro'), 'CalculadoraRetiro');
const BandasCambiarias = lazyPage(() => import('./pages/herramientas/inversiones/BandasCambiarias'), 'BandasCambiarias');
const MonitorMercado = lazyPage(() => import('./pages/herramientas/inversiones/MonitorMercado'), 'MonitorMercado');
const ScannerBonos = lazyPage(() => import('./pages/herramientas/inversiones/ScannerBonos'), 'ScannerBonos');
const FlujoFondosBonos = lazyPage(() => import('./pages/herramientas/inversiones/FlujoFondosBonos'), 'FlujoFondosBonos');
const CalendarioDividendos = lazyPage(() => import('./pages/herramientas/inversiones/CalendarioDividendos'), 'CalendarioDividendos');

// --- MÓDULO III: CRÉDITO ---
const DecodificadorCFT = lazyPage(() => import('./pages/herramientas/credito/DecodificadorCFT'), 'DecodificadorCFT');
const BolaNieve = lazyPage(() => import('./pages/herramientas/credito/BolaNieve'), 'BolaNieve');
const CapacidadEndeudamiento = lazyPage(() => import('./pages/herramientas/credito/CapacidadEndeudamiento'), 'CapacidadEndeudamiento');
const ConsolidadorDeudas = lazyPage(() => import('./pages/herramientas/credito/ConsolidadorDeudas'), 'ConsolidadorDeudas');
const SimuladorPrendario = lazyPage(() => import('./pages/herramientas/credito/SimuladorPrendario'), 'SimuladorPrendario');
const CuotaSimple = lazyPage(() => import('./pages/herramientas/credito/CuotaSimple'), 'CuotaSimple');

// --- MÓDULO IV: INMOBILIARIO ---
const ComprarAlquilar = lazyPage(() => import('./pages/herramientas/inmobiliario/ComprarAlquilar'), 'ComprarAlquilar');
const HipotecarioUVA = lazyPage(() => import('./pages/herramientas/inmobiliario/HipotecarioUVA'), 'HipotecarioUVA');
const ActualizadorAlquiler = lazyPage(() => import('./pages/herramientas/inmobiliario/ActualizadorAlquiler'), 'ActualizadorAlquiler');
const CostosIngreso = lazyPage(() => import('./pages/herramientas/inmobiliario/CostosIngreso'), 'CostosIngreso');
const RentabilidadInmueble = lazyPage(() => import('./pages/herramientas/inmobiliario/RentabilidadInmueble'), 'RentabilidadInmueble');
const CostoConstruccion = lazyPage(() => import('./pages/herramientas/inmobiliario/CostoConstruccion'), 'CostoConstruccion');
const GastosEscritura = lazyPage(() => import('./pages/herramientas/inmobiliario/GastosEscritura'), 'GastosEscritura');

// --- MÓDULO V: FISCAL ---
const CalculadoraCourier = lazyPage(() => import('./pages/herramientas/fiscal/CalculadoraCourier'), 'CalculadoraCourier');
const GrossingUp = lazyPage(() => import('./pages/herramientas/fiscal/GrossingUp'), 'GrossingUp');
const RetencionesSircreb = lazyPage(() => import('./pages/herramientas/fiscal/RetencionesSircreb'), 'RetencionesSircreb');
const CalculadoraGanancias = lazyPage(() => import('./pages/herramientas/fiscal/CalculadoraGanancias'), 'CalculadoraGanancias');
const CategorizadorMonotributo = lazyPage(() => import('./pages/herramientas/fiscal/CategorizadorMonotributo'), 'CategorizadorMonotributo');
const ExportacionServicios = lazyPage(() => import('./pages/herramientas/fiscal/ExportacionServicios'), 'ExportacionServicios');

// --- MÓDULO VI: ESTILO DE VIDA ---
const CalculadoraDolarTarjeta = lazyPage(() => import('./pages/herramientas/estilo-vida/CalculadoraDolarTarjeta'), 'CalculadoraDolarTarjeta');
const PresupuestoViaje = lazyPage(() => import('./pages/herramientas/estilo-vida/PresupuestoViaje'), 'PresupuestoViaje');
const GestorSuscripciones = lazyPage(() => import('./pages/herramientas/estilo-vida/GestorSuscripciones'), 'GestorSuscripciones');
const OptimizadorOfertas = lazyPage(() => import('./pages/herramientas/estilo-vida/OptimizadorOfertas'), 'OptimizadorOfertas');

// --- MÓDULO VII: CORPORATIVO ---
const DescuentoCheques = lazyPage(() => import('./pages/herramientas/corporativo/DescuentoCheques'), 'DescuentoCheques');
const SimuladorMontecarlo = lazyPage(() => import('./pages/herramientas/corporativo/SimuladorMontecarlo'), 'SimuladorMontecarlo');

/** Fallback mientras se descarga el chunk de una página. */
const PageLoader = () => (
  <div className="flex min-h-[60vh] w-full items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-emerald-600 dark:text-emerald-400" />
  </div>
);

function App() {
  return (
    <WishlistProvider>
      <ScrollToTop />
      <CartDrawer />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ==========================================================
              ZONA A: PÁGINAS STANDALONE (Auth, Legal)
              ========================================================== */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/recovery" element={<Recovery />} />
          <Route path="/terminosdeuso" element={<Terminos />} />
          <Route path="/apidocs" element={<ApiDocs />} />

          {/* ==========================================================
              ZONA B: PLATAFORMA COMERCIAL (Navbar + Footer)
              ========================================================== */}
          <Route element={<Layout />}>
            {/* 1. RUTAS PÚBLICAS */}
            <Route path="/" element={<Home />} />
            <Route path="/glosario" element={<Glosario />} />
            <Route path="/sobre-mi" element={<SobreMi />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route
              path="/planes"
              element={
                <div className="bg-gray-50 min-h-screen pt-4 dark:bg-[#0B1121] transition-colors duration-300">
                  <Planes />
                </div>
              }
            />

            {/* 2. RUTAS PROTEGIDAS (requieren sesión) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/perfil" element={<Perfil />} />
              <Route path="/analytics" element={<AnalyticsPage />} />

              {/* E-Commerce */}
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

              {/* 3. TIER UNLIMITED
                  NOTA: este chequeo es sólo UX. La autorización real
                  debe validarse en el backend en cada request. */}
              <Route element={<ProtectedRoute allowedPlans={['unlimited']} redirectPath="/planes" />}>
                <Route path="/api-keys" element={<ApiDashboard />} />
              </Route>
            </Route>

            {/* ==========================================================
                HERRAMIENTAS (públicas / freemium)
                ========================================================== */}
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
            <Route path="/calculadoras/inversiones/inflacion-usd" element={<InflacionUsdSpy />} />
            <Route path="/calculadoras/inversiones/retiro" element={<CalculadoraRetiro />} />
            <Route path="/calculadoras/inversiones/bandas" element={<BandasCambiarias />} />
            <Route path="/calculadoras/inversiones/monitor" element={<MonitorMercado />} />
            <Route path="/calculadoras/inversiones/scanner-bonos" element={<ScannerBonos />} />
            <Route path="/calculadoras/inversiones/flujo-bonos" element={<FlujoFondosBonos />} />
            <Route path="/calculadoras/inversiones/dividendos" element={<CalendarioDividendos />} />

            {/* Módulo III: Crédito */}
            <Route path="/calculadoras/credito/cft" element={<DecodificadorCFT />} />
            <Route path="/calculadoras/credito/bola-nieve" element={<BolaNieve />} />
            <Route path="/calculadoras/credito/capacidad" element={<CapacidadEndeudamiento />} />
            <Route path="/calculadoras/credito/consolidacion" element={<ConsolidadorDeudas />} />
            <Route path="/calculadoras/credito/prendarios" element={<SimuladorPrendario />} />
            <Route path="/calculadoras/credito/cuota-simple" element={<CuotaSimple />} />

            {/* Módulo IV: Inmobiliario */}
            <Route path="/calculadoras/inmobiliario/comprar-alquilar" element={<ComprarAlquilar />} />
            <Route path="/calculadoras/inmobiliario/hipotecario-uva" element={<HipotecarioUVA />} />
            <Route path="/calculadoras/inmobiliario/alquiler" element={<ActualizadorAlquiler />} />
            <Route path="/calculadoras/inmobiliario/inicio-alquiler" element={<CostosIngreso />} />
            <Route path="/calculadoras/inmobiliario/rentabilidad" element={<RentabilidadInmueble />} />
            <Route path="/calculadoras/inmobiliario/construccion" element={<CostoConstruccion />} />
            <Route path="/calculadoras/inmobiliario/escrituracion" element={<GastosEscritura />} />

            {/* Módulo V: Fiscal */}
            <Route path="/calculadoras/fiscal/importaciones" element={<CalculadoraCourier />} />
            <Route path="/calculadoras/fiscal/grossing-up" element={<GrossingUp />} />
            <Route path="/calculadoras/fiscal/sircreb" element={<RetencionesSircreb />} />
            <Route path="/calculadoras/fiscal/ganancias" element={<CalculadoraGanancias />} />
            <Route path="/calculadoras/fiscal/monotributo" element={<CategorizadorMonotributo />} />
            <Route path="/calculadoras/fiscal/exportacion" element={<ExportacionServicios />} />

            {/* Módulo VI: Estilo de vida */}
            <Route path="/calculadoras/vida/dolar-tarjeta" element={<CalculadoraDolarTarjeta />} />
            <Route path="/calculadoras/vida/viajes" element={<PresupuestoViaje />} />
            <Route path="/calculadoras/vida/suscripciones" element={<GestorSuscripciones />} />
            <Route path="/calculadoras/vida/ofertas" element={<OptimizadorOfertas />} />

            {/* Módulo VII: Corporativo */}
            <Route path="/calculadoras/corporativo/cheques" element={<DescuentoCheques />} />
            <Route path="/calculadoras/corporativo/montecarlo" element={<SimuladorMontecarlo />} />

            {/* Catálogo y mercados */}
            <Route path="/academia" element={<Academia />} />
            <Route path="/libreria" element={<Libreria />} />
            <Route path="/carrito" element={<CartPage />} />
            <Route path="/favoritos" element={<WishlistPage />} />
            <Route path="/categoria/:id" element={<Categorias />} />
            <Route path="/mercados" element={<Mercados />} />
            <Route path="/indicador/:id" element={<DetalleIndicador />} />
            <Route path="/test-inversor" element={<InvestorTestPage />} />
          </Route>

          {/* ==========================================================
              ZONA C: ENTORNO DE APRENDIZAJE (inmersivo)
              ========================================================== */}
          <Route element={<ProtectedRoute />}>
            <Route element={<LearningLayout />}>
              {/* Ruta canónica: lección específica (permite F5 y links compartidos) */}
              <Route path="/curso/:courseId/leccion/:lessonId" element={<CoursePlayerPage />} />
              {/* Fallback: carga la primera lección del curso */}
              <Route path="/curso/:id" element={<CoursePlayerPage />} />
              <Route path="/curso/:id/learn" element={<CoursePlayerPage />} />
            </Route>
          </Route>

          {/* 404 GLOBAL */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>

      <Toaster richColors position="bottom-right" duration={2000} />
    </WishlistProvider>
  );
}

export default App;
