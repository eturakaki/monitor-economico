import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// 1. IMPORTAMOS TODOS LOS CONTEXTOS
import { AuthProvider } from './context/AuthContext'
import { ShopProvider } from './context/ShopContext'
import { ThemeProvider } from './context/ThemeContext' // <--- ¡FALTABA ESTE!
import { BrowserRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* ÁRBOL DE PROVEEDORES (Provider Tree) */}
    
    {/* 1. Tema Visual (Debe envolver todo para que los colores carguen primero) */}
    <ThemeProvider> 
      
      {/* 2. Autenticación (Usuario) */}
      <AuthProvider>
        
        {/* 3. Tienda (Carrito/Compras) - Depende de Auth */}
        <ShopProvider>
          
          {/* 4. Router (Navegación) */}
          <BrowserRouter>
              <App />
          </BrowserRouter>
          
        </ShopProvider>
      </AuthProvider>

    </ThemeProvider>
  </React.StrictMode>,
)