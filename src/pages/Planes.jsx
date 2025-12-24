import { Check, X, Crown, Shield, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Planes() {
  return (
    <div className="min-h-screen bg-gray-50 py-20 px-4 font-sans">
      
      {/* CABECERA DE VENTAS */}
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h2 className="text-blue-600 font-bold tracking-widest uppercase text-sm mb-3">Planes y Precios</h2>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
          Desbloqueá el poder de los datos.
        </h1>
        <p className="text-xl text-slate-500 leading-relaxed">
          Elegí el plan que mejor se adapte a tus necesidades de análisis. 
          Desde estudiantes hasta consultoras macroeconómicas.
        </p>
      </div>

      {/* GRILLA DE PRECIOS */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* --- PLAN FREE --- */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 relative">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-900">Inicial</h3>
            <p className="text-slate-500 text-sm mt-2">Para curiosos y estudiantes.</p>
          </div>
          <div className="mb-6">
            <span className="text-4xl font-black text-slate-900">$0</span>
            <span className="text-slate-400 font-medium">/mes</span>
          </div>
          <Link to="/exportar" className="block w-full py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-center hover:border-slate-900 hover:text-slate-900 transition-colors">
            Comenzar Gratis
          </Link>
          
          <div className="mt-8 space-y-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Incluye:</p>
            <Feature texto="Acceso al Dashboard en vivo" incluido={true} />
            <Feature texto="Gráficos interactivos básicos" incluido={true} />
            <Feature texto="Exportación: Últimos 10 datos" incluido={true} />
            <Feature texto="Series históricas completas" incluido={false} />
            <Feature texto="Soporte prioritario" incluido={false} />
          </div>
        </div>

        {/* --- PLAN PREMIUM (DESTACADO) --- */}
        <div className="bg-slate-900 rounded-3xl p-8 border border-slate-900 shadow-2xl relative transform md:-translate-y-4">
          {/* Etiqueta "Más Popular" */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-emerald-400 to-teal-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
            Más Elegido
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
               <Shield className="text-emerald-400" size={24} />
               <h3 className="text-xl font-bold text-white">Profesional</h3>
            </div>
            <p className="text-slate-400 text-sm">Para analistas e inversores.</p>
          </div>
          <div className="mb-6">
            <span className="text-5xl font-black text-white">$6.00</span>
            <span className="text-slate-500 font-medium">/mes</span>
          </div>
          <button className="block w-full py-4 rounded-xl bg-emerald-500 text-white font-bold text-center hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/20 transition-all">
            Suscribirme Ahora
          </button>
          
          <div className="mt-8 space-y-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Todo lo de Gratis, más:</p>
            <Feature texto="Series históricas completas (10/mes)" incluido={true} dark={true} />
            <Feature texto="Descarga en Excel y CSV" incluido={true} dark={true} />
            <Feature texto="Acceso a indicadores avanzados" incluido={true} dark={true} />
            <Feature texto="Sin publicidad" incluido={true} dark={true} />
            <Feature texto="API Access" incluido={false} dark={true} />
          </div>
        </div>

        {/* --- PLAN PLUS --- */}
        <div className="bg-white rounded-3xl p-8 border border-purple-100 shadow-sm hover:shadow-xl hover:shadow-purple-100/50 transition-all duration-300 relative">
          <div className="mb-6">
             <div className="flex items-center gap-2 mb-2">
               <Crown className="text-purple-600" size={24} />
               <h3 className="text-xl font-bold text-slate-900">Unlimited</h3>
            </div>
            <p className="text-slate-500 text-sm">Para empresas y consultoras.</p>
          </div>
          <div className="mb-6">
            <span className="text-4xl font-black text-slate-900">$12.00</span>
            <span className="text-slate-400 font-medium">/mes</span>
          </div>
          <button className="block w-full py-3 rounded-xl bg-purple-50 text-purple-700 font-bold text-center hover:bg-purple-100 transition-colors">
            Contactar Ventas
          </button>
          
          <div className="mt-8 space-y-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Todo lo de Pro, más:</p>
            <Feature texto="Descargas ILIMITADAS" incluido={true} color="text-purple-600" />
            <Feature texto="Acceso API REST en tiempo real" incluido={true} />
            <Feature texto="Soporte 24/7 vía WhatsApp" incluido={true} />
            <Feature texto="Marca blanca (Whitelabel)" incluido={true} />
          </div>
        </div>

      </div>

      {/* FOOTER DE GARANTÍA */}
      <div className="mt-20 text-center border-t border-gray-200 pt-10">
        <p className="text-gray-500 flex items-center justify-center gap-2">
          <Shield size={18} />
          Pagos seguros procesados por <span className="font-bold text-gray-700">Mercado Pago</span>. Cancelás cuando quieras.
        </p>
      </div>

    </div>
  );
}

// Subcomponente para los items de la lista (Tick o Cruz)
function Feature({ texto, incluido, dark = false, color = "text-emerald-500" }) {
  return (
    <div className="flex items-start gap-3">
      {incluido ? (
        <Check size={18} className={`mt-0.5 shrink-0 ${dark ? 'text-emerald-400' : color}`} />
      ) : (
        <X size={18} className="mt-0.5 shrink-0 text-slate-300" />
      )}
      <span className={`text-sm ${dark ? 'text-slate-300' : 'text-slate-600'} ${!incluido && 'text-slate-400 line-through'}`}>
        {texto}
      </span>
    </div>
  );
}