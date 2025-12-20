function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      
      {/* Tarjeta de bienvenida */}
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">
          Monitor Económico Argentina 🇦🇷
        </h1>
        <p className="text-gray-600 text-lg">
          Bienvenido Iñaki. Tu entorno profesional está listo para despegar.
        </p>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <span className="font-semibold text-blue-800">Estado del sistema:</span>
          <span className="ml-2 text-green-600 font-bold">● Operativo</span>
        </div>
      </div>

    </div>
  )
}

export default App
