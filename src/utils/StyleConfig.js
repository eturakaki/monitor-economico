// Definición profesional de variantes de color
// Esto garantiza que Tailwind "lea" las clases completas y las incluya en el CSS final.

const CATEGORY_STYLES = {
  // Variante por defecto (si el color falla)
  default: {
    active: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    inactive: "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-700",
    iconActive: "text-gray-700",
    iconInactive: "text-gray-400 group-hover:text-gray-600"
  },
  // Colores específicos (Asegúrate de tener estos colores en tu tailwind.config o que sean estándar)
  emerald: {
    active: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
    inactive: "text-gray-600 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-700 dark:hover:text-emerald-400",
    iconActive: "text-emerald-700",
    iconInactive: "text-gray-400 group-hover:text-emerald-600"
  },
  blue: {
    active: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    inactive: "text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-700 dark:hover:text-blue-400",
    iconActive: "text-blue-700",
    iconInactive: "text-gray-400 group-hover:text-blue-600"
  },
  purple: {
    active: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    inactive: "text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-slate-800 hover:text-purple-700 dark:hover:text-purple-400",
    iconActive: "text-purple-700",
    iconInactive: "text-gray-400 group-hover:text-purple-600"
  },
  amber: {
    active: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    inactive: "text-gray-600 dark:text-gray-400 hover:bg-amber-50 dark:hover:bg-slate-800 hover:text-amber-700 dark:hover:text-amber-400",
    iconActive: "text-amber-700",
    iconInactive: "text-gray-400 group-hover:text-amber-600"
  },
  rose: {
    active: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
    inactive: "text-gray-600 dark:text-gray-400 hover:bg-rose-50 dark:hover:bg-slate-800 hover:text-rose-700 dark:hover:text-rose-400",
    iconActive: "text-rose-700",
    iconInactive: "text-gray-400 group-hover:text-rose-600"
  }
};

// Función auxiliar para obtener estilos de manera segura

export const getStyles = (color) => CATEGORY_STYLES[color] || CATEGORY_STYLES.default;