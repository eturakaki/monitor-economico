/**
 * COMPONENTE: Grid
 * Rationale: Wrapper de layout para asegurar consistencia en todo el dashboard.
 * Define la grilla responsiva:
 * - Mobile: 2 columnas (compacto, estilo Robinhood/Binance).
 * - Tablet/Desktop: 3 o 4 columnas según espacio.
 */
export function Grid({ children, className = "" }) {
  return (
    <div className={`
      grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 
      max-w-7xl mx-auto
      ${className}
    `}>
      {children}
    </div>
  );
}