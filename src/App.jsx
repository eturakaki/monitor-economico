import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home'; // Importamos la página que acabamos de crear
import { Layout } from './components/Layout';
import { DetalleIndicador } from './pages/DetalleIndicador'; // <--- 1. IMPORTAR
import { Categoria } from './pages/Categorias';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* ENVOLTORIO PRINCIPAL */}
        {/* Le decimos: "Usá el Layout como padre de todo" */}
        <Route element={<Layout />}>
          
          {/* Todas estas rutas van ADENTRO del Layout (donde está el Outlet) */}
          <Route path="/" element={<Home />} />
          
         {/* Ruta para ver un Sector completo (ej: Fiscal) */}
          <Route path="/categoria/:id" element={<Categoria />} />
          
          {/* Ruta para el Detalle de un Indicador (ej: Dólar Blue) */}
          <Route path="/indicador/:id" element={<DetalleIndicador />} />
        </Route>

      </Routes>
    </BrowserRouter>
  )
}

export default App;
