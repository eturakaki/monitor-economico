import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home'; // Importamos la página que acabamos de crear
import { Layout } from './components/Layout';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* ENVOLTORIO PRINCIPAL */}
        {/* Le decimos: "Usá el Layout como padre de todo" */}
        <Route element={<Layout />}>
          
          {/* Todas estas rutas van ADENTRO del Layout (donde está el Outlet) */}
          <Route path="/" element={<Home />} />
          
          {/* Próximamente... */}
          {/* <Route path="/mercados" element={<Mercados />} /> */}
          
        </Route>

      </Routes>
    </BrowserRouter>
  )
}

export default App;
