import { useState } from 'react';
import { Mail, MapPin, Send, MessageSquare } from 'lucide-react';

/**
 * PÁGINA DE CONTACTO
 * ------------------
 * Interfaz limpia dividida en dos columnas (Grid System).
 * - Columna Izq: Información estática y contexto (Humaniza la marca).
 * - Columna Der: Formulario funcional con validación visual.
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1121] transition-colors duration-300 py-12 px-4 sm:px-6 lg:px-8">
      
      {/* HEADER DE SECCIÓN */}
      <div className="max-w-7xl mx-auto mb-16 text-center">
        <div className="inline-flex items-center justify-center p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl mb-4 text-emerald-600 dark:text-emerald-400">
          <MessageSquare size={24} />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl mb-4">
          Hablemos
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
          ¿Tenés dudas sobre los indicadores o necesitás un plan a medida para tu empresa? 
          Estamos para ayudarte.
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">
        
        {/* COLUMNA IZQUIERDA: Info de Contacto */}
        <div className="space-y-8">
          
          {/* Card 1: Email */}
          <div className="flex items-start gap-4 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
              <Mail size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Correo Electrónico</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">Para consultas generales y soporte.</p>
              <a href="mailto:contacto@monitoreco.com" className="text-emerald-600 font-medium hover:text-emerald-500 transition-colors">
                contacto@monitoreco.com
              </a>
            </div>
          </div>

          {/* Card 2: Ubicación */}
          <div className="flex items-start gap-4 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
              <MapPin size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Oficina Central</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">Desarrollo y Análisis.</p>
              <p className="text-slate-700 dark:text-slate-300 font-medium">
                Salta, Argentina 🇦🇷
              </p>
            </div>
          </div>

        </div>

        {/* COLUMNA DERECHA: Formulario */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Input Nombre */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  placeholder="Tu nombre"
                />
              </div>

              {/* Input Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            {/* Input Asunto */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                Asunto
              </label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              >
                <option value="">Seleccioná un motivo...</option>
                <option value="soporte">Soporte Técnico</option>
                <option value="ventas">Planes y Precios</option>
                <option value="api">Acceso a API</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            {/* Textarea Mensaje */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                Mensaje
              </label>
              <textarea
                name="message"
                required
                rows="4"
                value={formData.message}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
                placeholder="¿En qué podemos ayudarte?"
              ></textarea>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold tracking-wide shadow-lg shadow-emerald-500/20 transform hover:translate-y-[-1px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Enviando...' : (
                <>
                  Enviar Mensaje <Send size={18} />
                </>
              )}
            </button>

          </form>
        </div>

      </div>
    </div>
  );
};