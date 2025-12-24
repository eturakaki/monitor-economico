import { useState } from 'react';
import { BookOpen, Search } from 'lucide-react';
import { terminos } from '../data/glosario'; // Importamos la data

export function Glosario() {
  const [busqueda, setBusqueda] = useState("");

  // Lógica de filtrado:
  // "Quedate con los terminos cuyo título incluya lo que escribí en 'busqueda'"
  const resultados = terminos.filter(t => 
    t.titulo.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* HEADER AZUL */}
      <div className="bg-blue-600 py-12 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-block p-3 rounded-full bg-blue-500 mb-4">
            <BookOpen size={32} />
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
            Diccionario Económico
          </h1>
          <p className="text-blue-100 text-lg mb-8">
            Entendé los conceptos clave sin palabras difíciles.
          </p>

          {/* BARRA DE BÚSQUEDA */}
          <div className="relative max-w-lg mx-auto">
            <input 
              type="text" 
              placeholder="Buscar término (ej: Leliq, PBI)..."
              className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-400/50 transition-all placeholder:text-gray-400 font-medium"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>
      </div>

      {/* RESULTADOS */}
      <div className="max-w-4xl mx-auto px-4 mt-8">
        {resultados.length > 0 ? (
          <div className="grid gap-4">
            {resultados.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-blue-200 transition-colors">
                <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                  {item.titulo}
                </h3>
                <p className="text-gray-600 leading-relaxed ml-4">
                  {item.definicion}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 opacity-50">
            <p className="text-xl font-medium text-gray-400">No encontramos esa palabra 🧐</p>
          </div>
        )}
      </div>

    </div>
  );
}