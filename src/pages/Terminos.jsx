import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, FileText, ArrowLeft } from 'lucide-react';

/**
 * Página: Términos de Uso (Standalone View)
 * * Diseño: "Legal Document" - Enfocado en la legibilidad.
 * No utiliza el Layout principal para evitar distracciones durante la lectura de contratos.
 * Usa la paleta oscura de MonitorEco con tipografía optimizada para lectura densa.
 */
const Terminos = () => {
  
  // Clases utilitarias para consistencia interna
  const sectionTitleClasses = "text-xl font-semibold text-slate-100 mb-4 flex items-center gap-2";
  const paragraphClasses = "text-slate-300 leading-relaxed mb-4";
  const listClasses = "list-disc list-inside space-y-2 text-slate-300 ml-4 mb-4";

  return (
    // Contenedor Principal: Fondo oscuro corporativo, tipografía sans, altura mínima completa.
    <div className="min-h-screen w-full bg-[#0F172A] font-sans selection:bg-indigo-500/30">
      
      {/* Header Minimalista de Navegación */}
      <nav className="border-b border-slate-800/50 px-6 py-4 bg-[#0F172A]/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
            {/* Botón de regreso esencial al estar fuera del layout principal */}
            <Link to="/" className="group inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform"/>
              Volver al Dashboard
            </Link>
            {/* Marca sutil */}
            <div className="flex items-center gap-2 opacity-50 grayscale">
               <span className="font-bold text-white tracking-tight">MonitorEco</span>
            </div>
        </div>
      </nav>

      {/* Contenido del Documento: Centrado y contenido para fácil lectura */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        
        {/* Encabezado del Documento */}
        <header className="mb-12 pb-8 border-b border-slate-800">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                    <Scale className="text-indigo-400" size={24} />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                    Términos de Uso
                </h1>
            </div>
            <p className="text-sm text-slate-400 uppercase tracking-widest font-medium">
                Última actualización: Octubre 2023
            </p>
        </header>

        {/* Cuerpo del Contrato */}
        <div className="space-y-10">

            {/* Sección 1 */}
            <section>
                <h2 className={sectionTitleClasses}>
                    <span className="text-indigo-400">1.</span> Aceptación de los Términos
                </h2>
                <p className={paragraphClasses}>
                    Bienvenido a MonitorEco. Al acceder, navegar o utilizar nuestro dashboard de datos macroeconómicos, servicios API, o cualquier contenido asociado (colectivamente, el "Servicio"), usted reconoce que ha leído, entendido y acepta estar sujeto a estos Términos de Uso.
                </p>
                <p className={paragraphClasses}>
                   Si no está de acuerdo con alguna parte de estos términos, no podrá acceder al Servicio.
                </p>
            </section>

            {/* Sección 2 */}
            <section>
                <h2 className={sectionTitleClasses}>
                    <span className="text-indigo-400">2.</span> Descripción del Servicio y Datos
                </h2>
                <p className={paragraphClasses}>
                    MonitorEco es una herramienta de visualización y análisis.
                </p>
                <ul className={listClasses}>
                    <li><strong className="text-slate-200">Origen de Datos:</strong> Los datos presentados (cotizaciones, inflación, etc.) provienen de fuentes públicas oficiales y APIs de terceros (ej. BCRA, DolarApi).</li>
                    <li><strong className="text-slate-200">No es Asesoramiento Financiero:</strong> La información se proporciona únicamente con fines informativos y educativos. MonitorEco no es un asesor financiero y la información no debe interpretarse como una recomendación de inversión.</li>
                </ul>
            </section>

            {/* Sección 3 */}
            <section>
                <h2 className={sectionTitleClasses}>
                    <span className="text-indigo-400">3.</span> Uso Aceptable y Restricciones API
                </h2>
                <p className={paragraphClasses}>
                    Usted se compromete a utilizar el Servicio solo para fines legales.
                </p>
                <ul className={listClasses}>
                    <li>No debe intentar eludir las medidas de seguridad o autenticación.</li>
                    <li>Para usuarios de la API: Se prohíbe el "scraping" excesivo que degrade el rendimiento del servicio para otros usuarios.</li>
                    <li>El uso comercial de los datos está sujeto a los límites del plan contratado (Ver sección "Planes").</li>
                </ul>
            </section>

            {/* Sección 4 */}
            <section>
                <h2 className={sectionTitleClasses}>
                    <span className="text-indigo-400">4.</span> Limitación de Responsabilidad
                </h2>
                <div className="bg-[#1E293B]/50 p-6 rounded-xl border border-slate-700/50 backdrop-blur-md">
                    <p className={`${paragraphClasses} mb-0 text-sm italic`}>
                        <FileText size={16} className="inline mr-2 text-slate-400"/>
                        "En la máxima medida permitida por la ley aplicable, MonitorEco no será responsable por daños indirectos, incidentales, especiales, consecuentes o punitivos, ni por ninguna pérdida de beneficios o ingresos, ya sea incurrida directa o indirectamente, o cualquier pérdida de datos, uso, buena voluntad u otras pérdidas intangibles, resultantes de (i) su acceso o uso o incapacidad para acceder o usar el Servicio; (ii) cualquier conducta o contenido de cualquier tercero en el Servicio."
                    </p>
                </div>
            </section>

             {/* Sección 5 */}
            <section>
                <h2 className={sectionTitleClasses}>
                    <span className="text-indigo-400">5.</span> Modificaciones
                </h2>
                <p className={paragraphClasses}>
                    Nos reservamos el derecho, a nuestra sola discreción, de modificar o reemplazar estos Términos en cualquier momento. Si una revisión es material, intentaremos proporcionar un aviso de al menos 30 días antes de que entren en vigor los nuevos términos.
                </p>
            </section>

        </div>
        
        {/* Footer del documento */}
        <footer className="mt-16 pt-8 border-t border-slate-800 text-center">
            <p className="text-slate-500 text-sm">
                ¿Preguntas sobre estos términos? Contáctanos en <a href="/contacto" className="text-indigo-400 hover:underline">Contacto</a>
            </p>
        </footer>

      </main>
    </div>
  );
};

export default Terminos;