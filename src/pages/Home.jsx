// src/pages/Home.jsx
import { Grid } from '../components/Grid' // Fíjate los dos puntos (..) para salir de la carpeta pages
import { StatCard } from '../components/StatCard'
import { DollarSign, TrendingDown, Briefcase, Activity, Factory, TrendingUp } from 'lucide-react'

export function Home() {
  
  // TUS DATOS FIJOS (Por ahora seguimos usando estos arrays manuales)
  const datosFinancieros = [
    { titulo: "Dólar Blue", valor: "$1.200", variacion: 2.5, esInverso: true, Icono: DollarSign, subtexto: "Brecha: 20%" },
    { titulo: "Riesgo País", valor: "1.450 pts", variacion: -2.1, esInverso: true, Icono: Activity },
    { titulo: "Reservas BCRA", valor: "US$ 24.000M", variacion: 1.2, Icono: Briefcase, subtexto: "Objetivo: 30MM" },
    { titulo: "Merval (S&P)", valor: "1.120.500", variacion: 3.4, Icono: TrendingUp },
  ];

  const datosEcoReal = [
    { titulo: "Inflación Mensual", valor: "12.4%", variacion: -0.5, esInverso: true, Icono: TrendingDown, subtexto: "Interanual: 210%" },
    { titulo: "Superávit Fiscal", valor: "$518.000M", variacion: 0.8 },
    { titulo: "Desempleo", valor: "6.2%", variacion: 0.1, esInverso: true },
    { titulo: "Actividad Industrial", valor: "-12.0%", variacion: -1.5, Icono: Factory }
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Título de la Sección */}
      <h1 className="text-3xl font-bold text-center text-gray-800 pt-8 pb-2">
        Monitor Económico Argentina
      </h1>
      {/* --- REFERENCIA  Logica  "semantica" color --- */}
      <div className="flex justify-center gap-4 mb-8 text-sm font-medium">
        <span className="flex items-center text-gray-600">
          <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
          Mejora para el País
        </span>
        <span className="flex items-center text-gray-600">
          <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
          Empeora para el País
        </span>
      </div>
      <h2 className="text-xl font-bold text-gray-700 ml-4 md:ml-10 mb-4 max-w-5xl mx-auto">
        Dashboard Macroeconómico
      </h2>

      {/* --- SECCIÓN 1: FINANZAS --- */}
      <h3 className="text-xl font-bold text-gray-700 ml-4 md:ml-10 mb-4 max-w-5xl mx-auto">
        Variables Financieras
      </h3>
      {/* Contenedor de Tarjetas */}
      <Grid>
        {datosFinancieros.map((item, index) => (
          <StatCard 
            key={index} // React necesita un ID único para no perderse
            titulo={item.titulo}
            valor={item.valor}
            variacion={item.variacion}
            esInverso={item.esInverso}
            Icono={item.Icono}
            subtexto={item.subtexto}
          />
        ))}
      </Grid>

      {/* --- SECCIÓN 2: ECONOMÍA REAL --- */}
      <h3 className="text-xl font-bold text-gray-700 ml-4 md:ml-10 mt-10 mb-4 max-w-5xl mx-auto">
        Economía Real
      </h3>
              {/* Contenedor de Tarjetas */}
      <Grid>
        {datosEcoReal.map((item, index) => (
          <StatCard 
            key={index} // React necesita un ID único para no perderse
            titulo={item.titulo}
            valor={item.valor}
            variacion={item.variacion}
            esInverso={item.esInverso}
            Icono={item.Icono}
            subtexto={item.subtexto}
          />
        ))}
      </Grid>

      
      
    </div>
  )
}