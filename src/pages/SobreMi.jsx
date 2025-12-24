import { 
  User, MapPin, GraduationCap, Code, 
  TrendingUp, Mail, Linkedin, Github, 
  Briefcase, Database, Instagram, Layout
} from 'lucide-react';

export function SobreMi() {
  return (
    <div className="min-h-screen bg-gray-50/50 font-sans pb-20">
      
      {/* 1. HEADER TIPO "PORTADA" (Estilo MonitorEco) */}
      <div className="bg-slate-900 pt-20 pb-32 px-4 border-b border-white/5 relative overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px]"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          
          {/* FOTO / AVATAR (Con anillo de color) */}
          {/* FOTO / AVATAR */}
        <div className="mx-auto w-48 h-48 rounded-full p-1 bg-gradient-to-tr from-emerald-400 to-blue-500 mb-6 shadow-2xl shadow-emerald-500/20">
            <div className="w-full h-full rounded-full bg-slate-800 border-4 border-slate-900 overflow-hidden">
                <img 
                src="/FotoLinkedIn.jpg" 
                alt="Iñaki Etura" 
                className="w-full h-full object-cover" 
                />
            </div>
        </div>

          <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">
            Iñaki Etura
          </h1>
          <p className="text-xl text-slate-400 font-medium mb-8 max-w-2xl mx-auto">
            Estudiante de Economía (UNSa) & Desarrollador Frontend. 
            <span className="block text-emerald-400 text-lg mt-1">Creador de MonitorEco.</span>
          </p>

          {/* REDES SOCIALES (Botones brillantes) */}
          <div className="flex justify-center gap-4">

            <a
                href="https://instagram.com/inakifinanzas" 
                target="_blank"             // <--- ESTO ABRE LA PESTAÑA NUEVA
                rel="noopener noreferrer"   // <--- ESTO ES SEGURIDAD
                className="p-3 bg-white/5 rounded-xl text-white hover:bg-pink-600 transition-all border border-white/10 hover:scale-110"
                >
                <Instagram size={20} />
            </a>

            <a 
                href="https://www.linkedin.com/in/i%C3%B1akietura/" 
                target="_blank"             // <--- ESTO ABRE LA PESTAÑA NUEVA
                rel="noopener noreferrer"   // <--- ESTO ES SEGURIDAD
                className="p-3 bg-white/5 rounded-xl text-white hover:bg-pink-600 transition-all border border-white/10 hover:scale-110"
                >
                <Linkedin size={20} />
            </a>
            <a href="https://github.com/eturakaki" 
                target="_blank"             // <--- ESTO ABRE LA PESTAÑA NUEVA
                rel="noopener noreferrer"   // <--- ESTO ES SEGURIDAD
                className="p-3 bg-white/5 rounded-xl text-white hover:bg-pink-600 transition-all border border-white/10 hover:scale-110"
                >  
              <Github size={20} />
            </a>
            <a 
            href="mailto:kakieconomic@gmail.com"       // <--- ESTO ABRE LA PESTAÑA NUEVA
            rel="noopener noreferrer"   // <--- ESTO ES SEGURIDAD
            className="p-3 bg-white/5 rounded-xl text-white hover:bg-pink-600 transition-all border border-white/10 hover:scale-110"
                >  
              <Mail size={20} />
            </a>
          </div>
        </div>
      </div>

      {/* 2. CONTENIDO PRINCIPAL (Tarjetas superpuestas al header) */}
      <div className="max-w-5xl mx-auto px-4 -mt-20 relative z-20">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* COLUMNA IZQUIERDA: BIO (8 espacios) */}
          <div className="md:col-span-8 space-y-8">
            
            {/* CARD: MI HISTORIA */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-slate-200/50">
              <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-700"><User size={24} /></div>
                Sobre Mí
              </h2>
              <div className="space-y-4 text-slate-600 leading-relaxed text-lg">
                <p>
                  Soy un apasionado por entender cómo funciona el dinero y la tecnología. Como estudiante avanzado de la <strong>Licenciatura en Economía en la UNSa</strong>, siempre sentí que faltaban herramientas claras para visualizar la realidad argentina.
                </p>
                <p>
                  No me conformé con la teoría: aprendí a programar para construir soluciones. <strong>MonitorEco</strong> es el resultado de fusionar mis dos pasiones: el rigor estadístico de la economía y la potencia del desarrollo web moderno.
                </p>
              </div>
            </div>

            {/* CARD: EL PROYECTO */}
            <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl text-white relative overflow-hidden group">
              {/* Decoración fondo */}
              <div className="absolute right-0 top-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-700">
                 <TrendingUp size={140} />
              </div>

              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                <Briefcase size={20} className="text-emerald-400" />
                ¿Por qué MonitorEco?
              </h3>
              <p className="text-slate-400 mb-6 max-w-lg relative z-10">
                Busco democratizar el acceso a la información financiera. Que cualquier persona, desde un estudiante hasta un inversor, pueda entender qué pasa con el dólar, la inflación y las reservas en tiempo real.
              </p>
              
              <div className="flex gap-8 border-t border-white/10 pt-6 relative z-10">
                <div>
                   <span className="block text-2xl font-black text-emerald-400">100%</span>
                   <span className="text-xs text-slate-500 uppercase font-bold">Datos Oficiales</span>
                </div>
                <div>
                   <span className="block text-2xl font-black text-blue-400">24/7</span>
                   <span className="text-xs text-slate-500 uppercase font-bold">Tiempo Real</span>
                </div>
              </div>
            </div>

          </div>

          {/* COLUMNA DERECHA: SIDEBAR (4 espacios) */}
          <div className="md:col-span-4 space-y-6">
            
            {/* CARD: EDUCACIÓN + HABILIDADES (Fusionados) */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <GraduationCap size={20} className="text-blue-500" /> Formación & Nivel
              </h3>
              
              {/* Bloque 1: Título Universitario */}
              <ul className="space-y-4 mb-6">
                <li className="relative pl-4 border-l-2 border-gray-100">
                  <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-blue-500"></div>
                  <h4 className="font-bold text-slate-800">Lic. en Economía</h4>
                  <p className="text-sm text-slate-500">Universidad Nacional de Salta (UNSa)</p>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded mt-1 inline-block">En curso (Avanzado)</span>
                </li>
              </ul>

              {/* SEPARADOR */}
              <div className="border-t border-gray-100 my-6"></div>

              {/* Bloque 2: Las Barritas de Nivel */}
              <div className="space-y-6">
                
                {/* Economía */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-bold text-slate-700 flex items-center gap-2">
                      <TrendingUp size={14} className="text-emerald-500"/> Economía
                    </span>
                    <span className="text-emerald-600 font-bold text-xs">Avanzado</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[90%] rounded-full shadow-lg shadow-emerald-500/30"></div>
                  </div>
                </div>

                {/* Frontend */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-bold text-slate-700 flex items-center gap-2">
                      <Layout size={14} className="text-blue-500"/> React Frontend
                    </span>
                    <span className="text-blue-500 font-bold text-xs">Intermedio</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[75%] rounded-full shadow-lg shadow-blue-500/30"></div>
                  </div>
                </div>

                {/* Data */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-bold text-slate-700 flex items-center gap-2">
                      <Database size={14} className="text-purple-500"/> Data Analysis
                    </span>
                    <span className="text-purple-500 font-bold text-xs">Básico</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 w-[60%] rounded-full shadow-lg shadow-purple-500/30"></div>
                  </div>
                </div>

              </div>
            </div>
            
            {/* CARD: TECH STACK (Etiquetas) */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Code size={20} className="text-emerald-500" /> Stack Técnico
              </h3>
              <div className="flex flex-wrap gap-2">
                {['React.js', 'Tailwind CSS', 'Vite', 'Recharts', 'APIs REST', 'Git'].map((tag) => (
                  <span key={tag} className="px-3 py-1.5 bg-gray-50 text-slate-600 text-xs font-bold rounded-lg border border-gray-200">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* UBICACIÓN */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-3xl text-white shadow-lg text-center">
               <MapPin size={32} className="mx-auto mb-2 text-white/80" />
               <h3 className="font-bold text-lg">Salta, Argentina</h3>
               <p className="text-emerald-100 text-sm opacity-90">Base de operaciones</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}