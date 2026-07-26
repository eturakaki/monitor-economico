import { Sparkles } from 'lucide-react';
import { analisisData } from '../data/analisisIA'; // Traemos el texto
import { misIndicadores } from '../data/monitores'; // Traemos los números reales

export function ResumenIA() {
  
  // MAGIA: Buscamos en la "Base de Datos" (monitores) los datos reales 
  // usando los IDs que la IA nos dijo que destaquemos.
  const metricasReales = analisisData.indicadoresDestacados.map(id => {
    // Buscamos el indicador que coincida con el ID
    const indicadorEncontrado = misIndicadores.find(ind => ind.id === id);
    
    // Si lo encontramos, lo usamos. Si no, devolvemos algo genérico para que no rompa.
    return indicadorEncontrado || { id, valor: "N/A", titulo: id };
  });

  return (
    <div className="rounded-2xl p-1 bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 shadow-xl my-8">
      <div className="bg-slate-900/90 backdrop-blur-sm rounded-xl p-6 md:p-8 text-white">
        
        {/* Título */}
        <div className="flex items-center gap-2 mb-8 border-b border-white/10 pb-4">
          <Sparkles className="text-yellow-400" size={24} />
          <h2 className="text-xl font-bold tracking-wide">{analisisData.titulo}</h2>
        </div>

        {/* Métricas (Ahora vienen de monitores.js!) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8 text-center">
          {metricasReales.map((item) => (
            <div key={item.id} className="flex flex-col">
              <span className="text-3xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                {item.valor}
              </span>
              <span className="text-xs md:text-sm font-medium text-slate-400 mt-1 uppercase tracking-wider">
                {/* Usamos titulo o label, segun como lo tengas en monitores.js */}
                {item.titulo} 
              </span>
            </div>
          ))}
        </div>

        {/* Texto de Análisis (Viene de la IA) */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <p className="text-sm md:text-base leading-relaxed text-slate-200">
            <span className="font-bold text-blue-300">Insights: </span>
            {analisisData.analisis}
          </p>
        </div>

      </div>
    </div>
  );
}