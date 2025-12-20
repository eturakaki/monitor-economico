import { StatCard } from './components/StatCard'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Título de la Sección */}
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Monitor Económico
      </h1>

      {/* Contenedor de Tarjetas */}
      <div className="flex flex-wrap gap-4">
        <StatCard
          titulo="Dólar Blue"
          valor="$1.200"
          variacion="+2.5%"
        />

        <StatCard
          titulo="Inflación Mensual"
          valor="12.4%"
          variacion="-0.5%"
        />
        <StatCard
          titulo="Reservas BCRA"
          valor="US$ 24.000M"
          variacion="+1.2%"
        />

      </div>
    </div>
  )
}

export default App