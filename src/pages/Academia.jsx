import React from 'react';
import { products } from '../data/products';
import { ProductCard } from '../components/shop/ProductCard';
import { GraduationCap, Sparkles } from 'lucide-react';

export default function Academia() {
  // 1. FILTRADO INTELIGENTE (Solo Cursos)
  const cursos = products.filter(p => p.type === 'curso');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1121] py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER DE SECCIÓN */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <GraduationCap className="text-emerald-600 dark:text-emerald-400" size={32} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Academia Monitor<span className="text-emerald-600">Eco</span>
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl text-lg">
            Formación financiera profesional. Desde bonos soberanos hasta estrategias de cobertura.
          </p>
        </div>

        {/* GRID DE PRODUCTOS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {cursos.map((curso) => (
            <div key={curso.id} className="h-full">
               <ProductCard product={curso} />
            </div>
          ))}
        </div>

        {/* CTA INSTRUCTOR (Opcional) */}
        {cursos.length === 0 && (
           <div className="text-center py-20 opacity-60">
              <Sparkles className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-2 text-slate-500">Próximamente nuevos cursos...</p>
           </div>
        )}
      </div>
    </div>
  );
}