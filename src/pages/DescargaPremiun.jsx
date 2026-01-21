import { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // 👈 IMPORT CORREGIDO
import { 
  Download, FileSpreadsheet, FileJson, Crown, Check, Shield, Unlock,
  Database, Clock, Zap, Lock
} from 'lucide-react';

export function DescargaPremium() {
  // 1. CONEXIÓN REAL: Traemos al usuario del contexto
  const { user } = useAuth();
  
  // 2. LÓGICA DE NEGOCIO (SSOT)
  // Si no hay usuario o no tiene plan, asumimos 'free'.
  const tipoUsuario = user?.plan?.toLowerCase() || 'free'; 

  const [descargasUsadas, setDescargasUsadas] = useState(3);
  const limitePremium = 10;
  
  // Estados del formulario
  const [indicador, setIndicador] = useState('dolar-blue');
  const [rango, setRango] = useState(tipoUsuario === 'free' ? '10D' : '1A');
  const [formato, setFormato] = useState('excel');
  const [cargando, setCargando] = useState(false);

  const handleDownload = () => {
    // Validación de seguridad frontend
    if (tipoUsuario === 'premium' && descargasUsadas >= limitePremium) return;
    
    setCargando(true);
    // Simulación de descarga
    setTimeout(() => {
      setCargando(false);
      if (tipoUsuario === 'premium') setDescargasUsadas(prev => prev + 1);
      alert(`✅ Descarga de ${indicador} iniciada.`);
    }, 1500);
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-6 font-sans px-4">
      
      {/* TARJETA PRINCIPAL */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm overflow-hidden border border-slate-300 dark:border-slate-800 transition-colors duration-300">
        
        {/* HEADER DINÁMICO SEGÚN PLAN */}
        <div className={`p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6 transition-colors duration-300
          ${tipoUsuario === 'plus' ? 'bg-gradient-to-r from-purple-900 to-indigo-900' : 
            tipoUsuario === 'premium' ? 'bg-gradient-to-r from-slate-900 to-slate-800' : 
            'bg-gradient-to-r from-blue-600 to-cyan-700'}`}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
              {tipoUsuario === 'plus' ? <Crown size={32} className="text-yellow-300" /> :
               tipoUsuario === 'premium' ? <Shield size={32} className="text-emerald-300" /> :
               <Unlock size={32} className="text-white" />}
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Exportación Técnica</h2>
              <p className="text-white/80 text-sm font-medium">
                Modo Actual: <span className="uppercase font-black text-white decoration-2 underline underline-offset-4 ml-1">{tipoUsuario}</span>
              </p>
            </div>
          </div>

          {/* Contador de Descargas (Solo visible para Premium/Plus) */}
          {tipoUsuario !== 'free' && (
             <div className="flex items-center gap-3 bg-black/20 px-4 py-2 rounded-lg border border-white/10">
                <span className="text-xs font-bold uppercase tracking-wider text-white/70">Créditos Diarios</span>
                <span className="text-xl font-mono font-bold">
                  {tipoUsuario === 'plus' ? '∞' : `${descargasUsadas}/${limitePremium}`}
                </span>
             </div>
          )}
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* COLUMNA IZQUIERDA: CONTROLES (Span 8) */}
            <div className="md:col-span-8 space-y-8">
                
                {/* 1. SELECTOR DE INDICADOR */}
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3 block">1. Seleccionar Dato</label>
                  <div className="relative">
                    <select 
                        value={indicador} 
                        onChange={(e) => setIndicador(e.target.value)} 
                        className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium cursor-pointer"
                    >
                        <option value="dolar-blue">💵 Dólar Blue (Informal)</option>
                        <option value="dolar-mep">💰 Dólar MEP (Bolsa)</option>
                        <option value="dolar-ccl">📉 Dólar CCL (Contado)</option>
                        <option value="inflacion-mensual">📊 Inflación Mensual (INDEC)</option>
                        <option value="riesgo-pais">🇦🇷 Riesgo País (EMBI+)</option>
                        <option value="reservas-bcra">🏦 Reservas BCRA</option>
                    </select>
                    {/* Flecha decorativa */}
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                      <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                    </div>
                  </div>
                </div>

                {/* 2. SELECTOR DE RANGO */}
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3 block">2. Rango de Serie</label>
                  <div className="grid grid-cols-4 gap-3">
                    <button 
                      onClick={() => setRango('10D')} 
                      className={`py-3 rounded-xl font-bold text-sm border transition-all ${rango === '10D' ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-slate-300 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    >
                      Últimos 10
                    </button>
                    {['1 Año', '5 Años', 'Todo'].map(item => (
                      <button 
                        key={item} 
                        disabled={tipoUsuario === 'free'} 
                        onClick={() => setRango(item)}
                        className={`py-3 rounded-xl font-bold text-sm border relative flex items-center justify-center transition-all
                          ${tipoUsuario === 'free' 
                            ? 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 border-slate-200 dark:border-slate-800 cursor-not-allowed opacity-70' 
                            : rango === item ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm' : 'border-slate-300 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                      >
                        {tipoUsuario === 'free' ? (
                          <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-tighter text-slate-400">
                            <Lock size={12} /> PRO
                          </span>
                        ) : item}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. SELECTOR DE FORMATO */}
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3 block">3. Formato de Salida</label>
                  <div className="flex gap-4">
                    <button onClick={() => setFormato('excel')} className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border font-bold transition-all ${formato === 'excel' ? 'border-emerald-600 text-emerald-700 bg-emerald-50 shadow-sm ring-1 ring-emerald-600' : 'border-slate-300 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                        <FileSpreadsheet size={20} /> Excel (.xlsx)
                    </button>
                    <button onClick={() => setFormato('csv')} className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border font-bold transition-all ${formato === 'csv' ? 'border-orange-500 text-orange-700 bg-orange-50 shadow-sm ring-1 ring-orange-500' : 'border-slate-300 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                        <FileJson size={20} /> CSV (Raw)
                    </button>
                  </div>
                </div>
            </div>

            {/* COLUMNA DERECHA: RESUMEN (Span 4) */}
             <div className="md:col-span-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-300 dark:border-slate-700 flex flex-col justify-between shadow-inner h-full">
                <div className="space-y-4">
                  <h3 className="text-slate-900 dark:text-white font-bold text-lg flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-3 mb-2">
                    <Check size={20} className="text-emerald-500" /> Resumen de Orden
                  </h3>
                  <div className="flex justify-between text-sm items-center">
                      <span className="text-slate-500 font-medium">Indicador</span>
                      <span className="font-bold text-slate-900 dark:text-white capitalize bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-xs">{indicador}</span>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                      <span className="text-slate-500 font-medium">Rango</span>
                      <span className="font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-xs">{rango}</span>
                  </div>
                  <div className="flex justify-between text-sm items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500 font-medium">Costo de la operación</span>
                      <span className={`font-bold ${tipoUsuario === 'free' ? 'text-emerald-600' : 'text-blue-600 dark:text-blue-400'}`}>
                          {tipoUsuario === 'free' ? 'GRATIS' : '1 Crédito'}
                      </span>
                  </div>
                </div>
                
                <button 
                  onClick={handleDownload} 
                  disabled={cargando}
                  className={`w-full py-4 mt-8 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95
                    ${cargando ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-black dark:bg-blue-600 dark:hover:bg-blue-700 hover:shadow-xl'}`}
                >
                  {cargando ? <Clock className="animate-spin" size={20} /> : <Download size={20} />}
                  {cargando ? 'Procesando...' : 'Descargar Serie'}
                </button>
              </div>

        </div>
      </div>
      
       {/* GRID DE CARACTERÍSTICAS TÉCNICAS */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-1000 slide-in-from-bottom-4">
        <div className="p-6 rounded-2xl border border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 flex flex-col items-center text-center shadow-sm hover:border-blue-300 transition-colors">
          <Database className="text-blue-500 mb-3" size={32} strokeWidth={1.5} />
          <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">Fuentes Certificadas</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-[200px]">Series procesadas directamente de APIs del BCRA e INDEC.</p>
        </div>
        <div className="p-6 rounded-2xl border border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 flex flex-col items-center text-center shadow-sm hover:border-emerald-300 transition-colors">
          <Clock className="text-emerald-500 mb-3" size={32} strokeWidth={1.5} />
          <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">Actualización Diaria</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-[200px]">Datos actualizados al cierre de cada jornada bursátil (17:00hs).</p>
        </div>
        <div className="p-6 rounded-2xl border border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 flex flex-col items-center text-center shadow-sm hover:border-amber-300 transition-colors">
          <Zap className="text-amber-500 mb-3" size={32} strokeWidth={1.5} />
          <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">Listos para BI</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-[200px]">Formato optimizado para PowerBI, Python o Excel.</p>
        </div>
      </div>
    </div>
  );
}