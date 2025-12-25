import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  // Obtenemos la ruta actual (pathname)
  const { pathname } = useLocation();

  useEffect(() => {
    // Cada vez que la ruta cambia, hacemos scroll suave hacia arriba
    // Si prefieres instantáneo, quita el behavior: 'smooth'
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant", // O usa "smooth" si quieres animación
    });
  }, [pathname]); // El array de dependencias asegura que solo corra al cambiar de ruta

  return null; // Este componente no renderiza nada visualmente
};

export default ScrollToTop;