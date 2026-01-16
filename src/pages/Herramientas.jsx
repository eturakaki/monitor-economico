import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calculator } from 'lucide-react';
import { Grid } from '../components/Grid';
// IMPORTAMOS LA DATA CENTRALIZADA
import { toolsRegistry, categoryLabels } from '../data/toolsRegistry';

export function Calculadoras() {
  
  // Agrupamos las herramientas por categoría automáticamente
  const herramientasPorCategoria = useMemo(() => {
    const grupos = {};
    toolsRegistry.forEach(tool => {
      if (!grupos[tool.category]) grupos[tool.category] = [];
      grupos[tool.category].push(tool);
    });
    return grupos;
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* NAVEGACIÓN */}
        <Link to="/" className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-medium mb-6 hover:underline group">
          <ArrowLeft size={20} className="mr-2 transition-transform group-hover:-translate-x-1" />
          Volver al Inicio
        </Link>

        {/* HEADER */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/20">
              <Calculator size={28} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Centro de Herramientas
            </h1>
          </div>
          <p className="text-gray-500 dark:text-slate-400 text-lg max-w-2xl">
            Acceso directo a más de 40 simuladores financieros profesionales.
          </p>
        </div>

        {/* GRILLA SECCIONADA POR CATEGORÍAS */}
        <div className="space-y-16">
          {Object.entries(herramientasPorCategoria).map(([catKey, tools]) => (
            <section key={catKey} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              
              {/* Título de Categoría */}
              <div className="flex items-center gap-4 mb-6 border-b border-gray-200 dark:border-slate-800 pb-2">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white uppercase tracking-wider">
                  {categoryLabels[catKey] || catKey}
                </h2>
                <span className="bg-gray-100 dark:bg-slate-800 text-gray-500 text-xs font-bold px-2 py-1 rounded-full">
                  {tools.length}
                </span>
              </div>

              {/* Cards */}
              <Grid>
                {tools.map((tool) => (
                  <Link
                    key={tool.id}
                    to={tool.path}
                    className={`
                      group relative flex flex-col justify-between
                      bg-white dark:bg-slate-900 
                      rounded-2xl p-6 
                      border border-gray-200 dark:border-slate-800 
                      shadow-sm hover:shadow-xl dark:hover:shadow-emerald-900/10
                      transition-all duration-300 ease-out hover:scale-[1.02] hover:border-${tool.color}-500/30
                    `}
                  >
                    {/* Hover Glow */}
                    <div className={`absolute inset-0 bg-gradient-to-br from-${tool.color}-50/50 to-transparent dark:from-${tool.color}-900/10 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                    <div>
                      <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className={`
                          p-3 rounded-xl 
                          bg-${tool.color}-100 dark:bg-${tool.color}-900/30 
                          text-${tool.color}-600 dark:text-${tool.color}-400
                        `}>
                          <tool.icon size={24} strokeWidth={2} />
                        </div>
                        {tool.badge && (
                          <span className="px-2 py-1 text-xs font-bold uppercase tracking-wider text-gray-500 bg-gray-100 dark:bg-slate-800 dark:text-gray-400 rounded-md">
                            {tool.badge}
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 relative z-10 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {tool.title}
                      </h3>
                      <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed relative z-10">
                        {tool.desc}
                      </p>
                    </div>

                    <div className="mt-6 flex items-center text-sm font-semibold text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 relative z-10">
                      Abrir <ArrowLeft className="ml-2 rotate-180" size={16} />
                    </div>
                  </Link>
                ))}
              </Grid>
            </section>
          ))}
        </div>

      </div>
    </div>
  );
}