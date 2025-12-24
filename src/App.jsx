import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Home } from './pages/Home';
import { Layout } from './components/Layout';
import { DetalleIndicador } from './pages/DetalleIndicador';
import { Categorias } from './pages/Categorias';
import { Glosario } from './pages/TEMP_Glosario';
import { DescargaPremium } from './pages/DescargaPremiun';
import { Planes } from './pages/Planes';
import { NotFound } from './pages/NotFound';
import { SobreMi } from './pages/SobreMi';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* ENVOLTORIO PRINCIPAL (Layout) 
            Todo lo que esté acá adentro va a tener Navbar y Footer automáticos. 
        */}
        <Route element={<Layout />}>
          
          {/* 1. PAGINA DE INICIO */}
          <Route path="/" element={<Home />} />
          
          {/* 2. GLOSARIO (Ruta limpia, separada de categorías) */}
          <Route path="/glosario" element={<Glosario />} />
          {/* 3. Descarga de datps (Ruta limpia, separada de categorías) */}
          <Route 
            path="/exportar" 
            element={
              <div className="bg-gray-50 min-h-screen bg-white dark:bg-[#0B1121] transition-colors duration-300">
                {/* 2. Corregí el nombre aquí también (con M) */}
                <DescargaPremium /> 
              </div>
            } 
          />
          <Route 
            path="/planes" 
            element={
              <div className="bg-gray-50 min-h-screen pt-4 min-h-screen dark:bg-[#0B1121] transition-colors duration-300">
                {/* 2. Corregí el nombre aquí también (con M) */}
                <Planes /> 
              </div>
            } 
          />
          <Route path="/sobre-mi" element={<SobreMi />} />


          
          {/* 5. RUTAS DINÁMICAS (Categorías y Detalles) */}
          <Route path="/categoria/:id" element={<Categorias />} />
          <Route path="/indicador/:id" element={<DetalleIndicador />} />
          

          
          {/* 5. CATCH-ALL (Error 404) 
              Si el usuario escribe una URL que no existe, cae acá. 
          */}
          <Route path="*" element={<NotFound />} />

        </Route>

      </Routes>
    </BrowserRouter>
  )
}

export default App;