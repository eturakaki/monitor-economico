export function StatCard({ titulo, valor, variacion }) {
  // Aquí irá la lógica (colores verde/rojo) más tarde

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
      <h3 className="text-gray-500 text-sm font-medium">{titulo}</h3>
      <p className="text-2xl font-bold text-gray-800 mt-1">{valor}</p>
      
      {/* Esto es el equivalente al botón de seguir, pero es tu indicador de % */}
      <span className="text-sm font-semibold text-green-600">
        {variacion}
      </span>
    </div>
  )
}
