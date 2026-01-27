import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// --- CORRECCIÓN ---
// ANTES (Incorrecto): import { AuthProvider } from './context/AuthContext.js'
// AHORA (Correcto): Apuntamos al archivo .jsx donde vive el componente
import { AuthProvider } from './context/AuthProvider.jsx' 

import { ShopProvider } from './context/ShopContext'
import { ThemeProvider } from './context/ThemeContext'
import { BrowserRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider> 
      <AuthProvider>
        <ShopProvider>
          <BrowserRouter>
              <App />
          </BrowserRouter>
        </ShopProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
)