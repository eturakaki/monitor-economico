import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Terminal, 
  Copy, 
  CheckCircle, 
  Server, 
  ArrowLeft, 
  Hash, 
  Code, 
  ChevronRight,
  Shield
} from 'lucide-react';

/**
 * Página: API Documentation (Developer Portal)
 * Diseño: "Stripe-like" - Dark Mode, Sidebar de navegación, Tipografía Monospace para datos.
 */
const ApiDocs = () => {
  const [activeTab, setActiveTab] = useState('curl'); // Estado para simular tabs de código

  return (
    <div className="min-h-screen w-full bg-[#0F172A] text-slate-300 font-sans selection:bg-indigo-500/30">
      
      {/* --- NAVBAR STANDALONE --- */}
      <nav className="border-b border-slate-800 px-6 py-4 bg-[#0F172A]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
               <div className="bg-indigo-500/20 p-2 rounded-lg border border-indigo-500/30">
                 <Terminal size={20} className="text-indigo-400" />
               </div>
               <div>
                 <span className="block font-bold text-white tracking-tight leading-none">MonitorEco <span className="text-indigo-400">DEV</span></span>
                 <span className="text-[10px] font-mono text-slate-500">v1.0.4 Public Beta</span>
               </div>
            </div>
            <Link to="/" className="group flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors border border-slate-700 hover:border-slate-500 px-3 py-1.5 rounded-full bg-slate-900/50">
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform"/>
              Volver al Dashboard
            </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* --- SIDEBAR DE NAVEGACIÓN (Izquierda) --- */}
        <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-32 space-y-8 pr-4">
                
                {/* Grupo 1 */}
                <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Shield size={12} /> General
                    </h3>
                    <ul className="space-y-1 text-sm border-l border-slate-800">
                        <li className="pl-4 border-l border-indigo-500 text-indigo-400 font-medium py-1 cursor-pointer">Introducción</li>
                        <li className="pl-4 border-l border-transparent hover:border-slate-600 text-slate-400 hover:text-slate-200 py-1 transition-colors cursor-pointer">Autenticación</li>
                        <li className="pl-4 border-l border-transparent hover:border-slate-600 text-slate-400 hover:text-slate-200 py-1 transition-colors cursor-pointer">Rate Limits</li>
                    </ul>
                </div>

                {/* Grupo 2 */}
                <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Server size={12} /> Endpoints
                    </h3>
                    <ul className="space-y-1 text-sm border-l border-slate-800">
                        <li className="pl-4 border-l border-transparent hover:border-slate-600 text-slate-400 hover:text-slate-200 py-1 transition-colors cursor-pointer flex items-center justify-between group">
                            <span>Get Dólar</span>
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 rounded border border-emerald-500/20 group-hover:opacity-100 opacity-60">GET</span>
                        </li>
                        <li className="pl-4 border-l border-transparent hover:border-slate-600 text-slate-400 hover:text-slate-200 py-1 transition-colors cursor-pointer flex items-center justify-between group">
                            <span>Get Riesgo País</span>
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 rounded border border-emerald-500/20 group-hover:opacity-100 opacity-60">GET</span>
                        </li>
                    </ul>
                </div>
            </div>
        </aside>

        {/* --- CONTENIDO PRINCIPAL (Derecha) --- */}
        <main className="lg:col-span-9 space-y-16">
            
            {/* HERO SECTION */}
            <section className="space-y-6">
                <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
                    Documentación de <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">API</span>
                </h1>
                <p className="text-lg text-slate-400 leading-relaxed max-w-3xl">
                    Integra datos macroeconómicos argentinos en tiempo real en tus aplicaciones. 
                    Nuestra API REST está diseñada para ser simple, predecible y utilizar códigos HTTP estándar.
                </p>
                
                <div className="flex flex-wrap gap-4">
                     <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20 shadow-sm shadow-emerald-900/20">
                        <CheckCircle size={12} /> API Operational
                     </span>
                     <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20">
                        <Server size={12} /> Base URL: https://api.monitoreco.com/v1
                     </span>
                </div>
            </section>

            <hr className="border-slate-800" />

            {/* SECCIÓN AUTENTICACIÓN */}
            <section className="space-y-6 scroll-mt-24" id="auth">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-800 rounded-lg">
                        <Hash size={20} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Autenticación</h2>
                </div>
                
                <p className="text-slate-400 leading-relaxed">
                    MonitorEco utiliza API Keys para permitir el acceso a la API. Debes incluir tu clave en el header <code className="text-indigo-300 bg-indigo-900/20 px-1.5 py-0.5 rounded border border-indigo-500/30 text-sm font-mono">X-MonitorEco-Key</code> en todas las solicitudes.
                </p>

                {/* BLOQUE DE CÓDIGO CON TABS */}
                <div className="rounded-xl overflow-hidden border border-slate-700 bg-[#0B1121] shadow-2xl">
                    <div className="flex items-center justify-between border-b border-slate-700 bg-slate-800/50 px-4">
                        <div className="flex">
                            <button 
                                onClick={() => setActiveTab('curl')}
                                className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors ${activeTab === 'curl' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                            >
                                cURL
                            </button>
                            <button 
                                onClick={() => setActiveTab('node')}
                                className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors ${activeTab === 'node' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                            >
                                Node.js
                            </button>
                        </div>
                        <div className="flex gap-2">
                             <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                             <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                             <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                        </div>
                    </div>
                    
                    <div className="p-6 overflow-x-auto relative group">
                        <button className="absolute top-4 right-4 p-2 rounded-lg bg-slate-800 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-white hover:bg-slate-700">
                            <Copy size={16} />
                        </button>
                        
                        {activeTab === 'curl' ? (
                            <pre className="font-mono text-sm leading-6">
                                <span className="text-purple-400">curl</span> <span className="text-green-400">"https://api.monitoreco.com/v1/mercados"</span> \<br/>
                                &nbsp;&nbsp;-H <span className="text-yellow-200">"Authorization: Bearer YOUR_API_KEY"</span>
                            </pre>
                        ) : (
                             <pre className="font-mono text-sm leading-6">
                                <span className="text-pink-400">const</span> response = <span className="text-purple-400">await</span> fetch(<span className="text-green-400">'https://api.monitoreco.com/v1/mercados'</span>, {'{'}<br/>
                                &nbsp;&nbsp;headers: {'{'}<br/>
                                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-yellow-200">'Authorization'</span>: <span className="text-green-400">'Bearer YOUR_API_KEY'</span><br/>
                                &nbsp;&nbsp;{'}'}<br/>
                                {'}'});
                            </pre>
                        )}
                    </div>
                </div>
            </section>

             {/* SECCIÓN ENDPOINT EJEMPLO */}
             <section className="space-y-6 scroll-mt-24">
                <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-mono text-sm font-bold">GET</span>
                    <h2 className="text-xl font-bold text-white font-mono">/v1/dolar</h2>
                </div>
                
                <p className="text-slate-400">Devuelve las cotizaciones actuales del dólar (Blue, Oficial, MEP, CCL) con su variación diaria.</p>

                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-4">Respuesta Exitosa (200 OK)</h4>
                
                {/* JSON RESPONSE BLOCK */}
                <div className="rounded-xl overflow-hidden border border-slate-700 bg-[#0B1121] shadow-2xl relative">
                    <div className="absolute top-0 left-0 w-1 bg-emerald-500 h-full"></div>
                    <div className="p-6 overflow-x-auto">
                        <pre className="font-mono text-sm leading-6 text-slate-300">
{`{
  "timestamp": "2025-01-15T15:30:00Z",
  "base": "ARS",
  "cotizaciones": {
    "blue": {
      "compra": `}<span className="text-emerald-400">1180.00</span>{`,
      "venta": `}<span className="text-emerald-400">1200.00</span>{`,
      "variacion": `}<span className="text-green-400">"+2.5%"</span>{`
    },
    "oficial": {
      "compra": 840.50,
      "venta": 880.50
    },
    "mep": {
      "ref": "AL30",
      "valor": `}<span className="text-blue-400">1150.20</span>{`
    }
  }
}`}
                        </pre>
                    </div>
                </div>
            </section>

             {/* Footer interno */}
            <div className="pt-12 border-t border-slate-800 mt-12">
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-center border border-slate-700">
                    <h3 className="text-white font-bold text-xl mb-2">¿Listo para integrar?</h3>
                    <p className="text-slate-400 mb-6 max-w-lg mx-auto">Obtené tu API Key gratuita hoy y empezá a construir. 1000 requests/mes incluidos en el plan gratuito.</p>
                    <Link to="/register" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-lg transition-all shadow-lg shadow-indigo-900/20">
                        Obtener API Key <ChevronRight size={16} />
                    </Link>
                </div>
            </div>

        </main>
      </div>
    </div>
  );
};

export default ApiDocs;