import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Revisamos si ya hay algo guardado, sino arrancamos en light
    if (typeof window !== "undefined") {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    // Limpiamos clases viejas y ponemos la nueva
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    // Guardamos en memoria
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 👇 ESTA LÍNEA MÁGICA HACE QUE DESAPAREZCA EL ERROR ROJO
// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext);