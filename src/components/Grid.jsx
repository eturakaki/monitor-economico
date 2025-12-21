export function Grid({ children }) {
  return (
    // 1. grid-cols-1: En celular, 1 sola columna (una abajo de otra).
    // 2. md:grid-cols-3: En pantallas medianas/PC, forzamos 3 columnas.
    // 3. gap-6: Espacio entre tarjetas.
    // 4. max-w-7xl mx-auto: Que no se estire infinito, que quede centrado.
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto p-4 mt-10">
      
      {/* AQUÍ OCURRE LA MAGIA 🪄 */}
      {/* React va a agarrar todo lo que pongas adentro de <Grid>...</Grid> y lo va a soltar acá. */}
      {children}

    </div>
  )
}