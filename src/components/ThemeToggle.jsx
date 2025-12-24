import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        p-2 rounded-xl transition-all duration-300 border
        ${theme === 'dark' 
          ? 'bg-slate-800 text-yellow-400 border-slate-700 hover:bg-slate-700' 
          : 'bg-white text-slate-600 border-gray-200 hover:bg-gray-50'
        }
      `}
      title="Cambiar tema"
    >
      {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
}