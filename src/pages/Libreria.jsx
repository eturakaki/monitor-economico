import React from 'react';
import { products } from '../data/products';
import { ProductCard } from '../components/shop/ProductCard';
import { BookOpen, Library } from 'lucide-react';

export default function Libreria() {
  // 1. FILTRADO (Libros + Recursos)
  const material = products.filter(p => p.type === 'libro' || p.type === 'recurso');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1121] py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Library className="text-blue-600 dark:text-blue-400" size={32} />
                </div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Librería & Recursos
                </h1>
             </div>
             <p className="text-slate-600 dark:text-slate-400 max-w-xl text-lg">
                Lecturas esenciales y plantillas de Excel para potenciar tu análisis.
             </p>
          </div>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {material.map((item) => (
            <div key={item.id} className="h-full">
               <ProductCard product={item} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}