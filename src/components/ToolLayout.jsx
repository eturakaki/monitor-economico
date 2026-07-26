import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const ToolLayout = ({ 
  title, 
  description, 
  icon: Icon, 
  color = "emerald", 
  children 
}) => {
  return (
    // CONTENEDOR PRINCIPAL
    <div className="min-h-screen bg-slate-200 dark:bg-slate-950 pb-20 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* --- NAVEGACIÓN (Regresar al Hub) --- */}
        <Link 
          to="/herramientas" 
          className="inline-flex items-center text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 font-medium mb-6 transition-colors group"
        >
          <ArrowLeft size={20} className="mr-2 transition-transform group-hover:-translate-x-1" />
          Volver a Herramientas
        </Link>

        {/* --- ENCABEZADO DE LA HERRAMIENTA --- */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-md border border-slate-300 dark:border-slate-800 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            
            {/* Icono Dinámico */}
            <div className={`p-4 rounded-xl bg-${color}-100 dark:bg-${color}-900/30 text-${color}-600 dark:text-${color}-400 shadow-inner`}>
              {Icon && <Icon size={32} strokeWidth={1.5} />}
            </div>
            
            {/* Textos */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                {title}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed max-w-2xl">
                {description}
              </p>
            </div>
          </div>
        </div>

        {/* --- ÁREA DE TRABAJO (Aquí se inyecta cada calculadora) --- */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>

      </div>
    </div>
  );
};