import React from 'react';
import { Link } from 'react-router-dom';
import { PlayCircle, GraduationCap, Clock, Award } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export default function MyCoursesPage() {
  const { myCourses } = useShop();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1121] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <GraduationCap className="text-emerald-500" size={32} />
            Mis Cursos
          </h1>
        </div>
        {myCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Aún no tienes cursos inscritos</h3>
            <Link to="/academia" className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all mt-4">
                Explorar Academia
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCourses.map((course) => (
              <div key={course.id} className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-2xl transition-all">
                <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img src={course.image} alt={course.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"/>
                </div>
                <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">{course.title}</h3>
                    <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 mb-6">
                        {course.duracion && <span className="flex items-center gap-1.5"><Clock size={14}/> {course.duracion}</span>}
                    </div>
                    <button className="w-full py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm flex items-center justify-center gap-2">
                        <PlayCircle size={18} /> Continuar Aprendiendo
                    </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}