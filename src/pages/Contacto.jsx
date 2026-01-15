import { useState } from 'react';
import { Mail, MapPin, Send, MessageSquare, ArrowRight } from 'lucide-react';

/**
 * PÁGINA DE CONTACTO (Contrast Fixed)
 * Mejora de Accesibilidad en Light Mode:
 * - Labels: slate-400 -> slate-600 (Más legible).
 * - Textos: slate-500 -> slate-600/700.
 * - Bordes: slate-200 -> slate-300 (Mejor delimitación de inputs).
 */
export const Contacto = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manejo de estado de los inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Simulación de envío
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Aquí iría la lógica de conexión con API/Backend
    setTimeout(() => {
      alert("Mensaje enviado (Simulación)");
      setIsSubmitting(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B1121] transition-colors duration-300 font-sans pb-20">
      
      {/* --- 1. HEADER (Dark Mode Force - Intacto porque tiene buen contraste) --- */}
      <div className="bg-slate-900 pt-20 pb-32 px-4 border-b border-white/5 relative overflow-hidden">
        {/* Decoración Atmosférica */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center justify-center p-3 bg-white/5 rounded-2xl mb-6 border border-white/10 backdrop-blur-sm shadow-lg">
             <MessageSquare size={24} className="text-emerald-400" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
            Hablemos
          </h1>
          <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto leading-relaxed font-medium">
            ¿Tenés dudas sobre los indicadores o necesitás un plan a medida? 
            Estamos listos para potenciar tu análisis financiero.
          </p>
        </div>
      </div>

      {/* --- 2. CONTENIDO PRINCIPAL (Superpuesto) --- */}
      <div className="max-w-6xl mx-auto px-4 -mt-20 relative z-20">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* --- COLUMNA IZQUIERDA: INFO DE CONTACTO (4/12) --- */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Card 1: Email */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none hover:border-emerald-500/30 transition-all duration-300 group">
              <div className="flex items-start gap-5">
                <div className="p-3.5 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50 group-hover:scale-110 transition-transform duration-300">
                  <Mail size={24} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Correo Electrónico</h3>
                  {/* CAMBIO: slate-500 -> slate-600 para mejor lectura */}
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-3 leading-relaxed font-medium">
                    Para consultas generales, soporte técnico y feedback.
                  </p>
                  <a href="mailto:contacto@monitoreco.com" className="inline-flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold hover:underline">
                    contacto@monitoreco.com <ArrowRight size={14} />
                  </a>
                </div>
              </div>
            </div>

            {/* Card 2: Ubicación */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none hover:border-purple-500/30 transition-all duration-300 group">
              <div className="flex items-start gap-5">
                <div className="p-3.5 bg-purple-50 dark:bg-purple-900/20 rounded-2xl text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800/50 group-hover:scale-110 transition-transform duration-300">
                  <MapPin size={24} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Oficina Central</h3>
                  {/* CAMBIO: slate-500 -> slate-600 */}
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-3 leading-relaxed font-medium">
                    Equipo de Desarrollo y Análisis Económico.
                  </p>
                  <p className="text-slate-800 dark:text-slate-200 font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg inline-block text-sm border border-slate-200 dark:border-slate-700">
                    Salta, Argentina 🇦🇷
                  </p>
                </div>
              </div>
            </div>

            {/* Card Decorativa */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-3xl border border-slate-700/50 text-white shadow-2xl relative overflow-hidden hidden lg:block">
               <div className="absolute top-0 right-0 p-8 opacity-10">
                 <Send size={120} />
               </div>
               <h4 className="font-bold text-xl mb-2 relative z-10">Respuesta Rápida</h4>
               <p className="text-slate-300 text-sm relative z-10 leading-relaxed max-w-[200px]">
                 Nuestro equipo suele responder en menos de 24 horas hábiles.
               </p>
            </div>

          </div>

          {/* --- COLUMNA DERECHA: FORMULARIO (8/12) --- */}
          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-200 dark:border-slate-800 p-8 md:p-10 relative overflow-hidden">
              
              {/* Formulario */}
              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Input Nombre */}
                  <div className="space-y-2">
                    {/* CAMBIO: Label slate-600 (antes 400) */}
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      /* CAMBIO: Border-slate-300 y placeholder-slate-500 */
                      className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold placeholder:text-slate-500 dark:placeholder:text-slate-500 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                      placeholder="Ej: Juan Pérez"
                    />
                  </div>

                  {/* Input Email */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">
                      Email Corporativo
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold placeholder:text-slate-500 dark:placeholder:text-slate-500 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                      placeholder="juan@empresa.com"
                    />
                  </div>
                </div>

                {/* Input Asunto */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">
                    Motivo de contacto
                  </label>
                  <div className="relative">
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Seleccioná una opción...</option>
                      <option value="soporte">Soporte Técnico</option>
                      <option value="ventas">Planes y Precios</option>
                      <option value="api">Acceso a API</option>
                      <option value="otro">Otro motivo</option>
                    </select>
                    {/* Flecha más oscura */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600 dark:text-slate-400">
                      <ArrowRight size={16} className="rotate-90" />
                    </div>
                  </div>
                </div>

                {/* Textarea Mensaje */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">
                    Mensaje
                  </label>
                  <textarea
                    name="message"
                    required
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium placeholder:text-slate-500 dark:placeholder:text-slate-500 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all resize-none"
                    placeholder="Contanos en qué podemos ayudarte..."
                  ></textarea>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-4 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold tracking-wide shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {isSubmitting ? 'Enviando...' : (
                    <>
                      Enviar Mensaje 
                      <Send size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};