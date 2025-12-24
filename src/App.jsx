import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Home } from './pages/Home';
import { Layout } from './components/Layout';
import { DetalleIndicador } from './pages/DetalleIndicador';
import { Categorias } from './pages/Categorias';
import { Glosario } from './pages/Glosario';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* ENVOLTORIO PRINCIPAL (Layout) */}
        <Route element={<Layout />}>
          
          {/* 1. PAGINA DE INICIO */}
          <Route path="/" element={<Home />} />
          
          {/* 2. GLOSARIO (Ruta limpia, separada de categorías) */}
          <Route path="/glosario" element={<Glosario />} />
          
          {/* 3. RUTAS DINÁMICAS (Categorías y Detalles) */}
          <Route path="/categoria/:id" element={<Categorias />} />
          <Route path="/indicador/:id" element={<DetalleIndicador />} />
          
          {/* 4. CATCH-ALL (Error 404) */}
          <Route path="*" element={
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-gray-700">Página no encontrada</h2>
                <Link to="/" className="text-emerald-600 font-bold hover:underline">
                  Volver al inicio
                </Link>
            </div>
          } />

        </Route>

      </Routes>
    </BrowserRouter>
  )
}

export default App;