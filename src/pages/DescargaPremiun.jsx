import { useState } from 'react';
// 1. IMPORT CORREGIDO: Añadimos Database y Lock para evitar ReferenceError
import { 
  Download, 
  FileSpreadsheet, 
  FileJson, 
  Crown, 
  Check, 
  Shield, 
  Unlock,
  Database, // <--- REPARADO
  Clock,
  Zap,
  Lock      // <--- PARA EL BADGE PRO
} from 'lucide-react';

export function DescargaPremium() {
  const [tipoUsuario, setTipoUsuario] = useState('free'); 
  const [descargasUsadas, setDescargasUsadas] = useState(3);
  const limitePremium = 10;
  
  const [indicador, setIndicador] = useState('dolar-blue');
  const [rango, setRango] = useState('10D');
  const [formato, setFormato] = useState('excel');
  
  // 2. LINTER FIX: Implementamos el uso de cargando en el botón
  const [cargando, setCargando] = useState(false);

  const handleDownload = () => {
    if (tipoUsuario === 'premium' && descargasUsadas >= limitePremium) return;
    
    setCargando(true);
    setTimeout(() => {
      setCargando(false);
      if (tipoUsuario === 'premium') setDescargasUsadas(prev => prev + 1);
      alert(`✅ Descarga de ${indicador} iniciada.`);
    }, 1500);
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-6 font-sans px-4">
      
      {/* SELECTOR DE MODO */}
      <div className="flex justify-center gap-4 mb-8">
        {['free', 'premium', 'plus'].map((tipo) => (
          <button 
            key={tipo}
            onClick={() => { setTipoUsuario(tipo); setRango(tipo === 'free' ? '10D' : '1A'); }}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border transition-all
              ${tipoUsuario === tipo 
                ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900' 
                : 'bg-white text-slate-400 border-slate-300 dark:bg-slate-900 dark:border-slate-800'}`}
          >
            Modo {tipo}
          </button>
        ))}
      </div>
      
      {/* TARJETA PRINCIPAL */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm overflow-hidden border border-slate-300 dark:border-slate-800">
        <div className={`p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6
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
              <p className="text-white/80 text-sm font-medium">Series completas para análisis profesional.</p>
            </div>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-8 space-y-6">
            {/* 1. Indicador */}
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 block">1. Seleccionar Dato</label>
              <select 
                value={indicador} 
                onChange={(e) => setIndicador(e.target.value)}
                className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-lg font-semibold text-slate-900 dark:text-white outline-none shadow-sm"
              >
                <option value="dolar-blue">💵 Dólar Blue (Informal)</option>
                <option value="dolar-mep">💰 Dólar MEP (Bolsa)</option>
              </select>
            </div>

            {/* 2. Rango Temporal - FIX VISUAL: Eliminamos el solapamiento */}
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3 block">2. Rango de Serie</label>
              <div className="grid grid-cols-4 gap-3">
                <button 
                  onClick={() => setRango('10D')} 
                  className={`py-3 rounded-xl font-bold text-sm border transition-all ${rango === '10D' ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-slate-300 dark:border-slate-700 text-slate-500'}`}
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
                        ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed' 
                        : rango === item ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm' : 'border-slate-300 dark:border-slate-700 text-slate-500'}`}
                  >
                    {/* Condicional para evitar que se pisen los textos */}
                    {tipoUsuario === 'free' ? (
                      <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter">
                        <Lock size={12} /> PRO
                      </span>
                    ) : item}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Formato */}
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3 block">3. Formato</label>
              <div className="flex gap-4">
                <button onClick={() => setFormato('excel')} className={`flex items-center gap-2 px-6 py-3 rounded-xl border font-bold transition-all ${formato === 'excel' ? 'border-emerald-600 text-emerald-700 bg-emerald-50 shadow-sm' : 'border-slate-300 dark:border-slate-700 text-slate-500 hover:bg-slate-50'}`}><FileSpreadsheet size={20} /> Excel</button>
                <button onClick={() => setFormato('csv')} className={`flex items-center gap-2 px-6 py-3 rounded-xl border font-bold transition-all ${formato === 'csv' ? 'border-orange-500 text-orange-700 bg-orange-50 shadow-sm' : 'border-slate-300 dark:border-slate-700 text-slate-500 hover:bg-slate-50'}`}><FileJson size={20} /> CSV</button>
              </div>
            </div>
          </div>

          {/* Columna Resumen */}
          <div className="md:col-span-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-300 dark:border-slate-700 flex flex-col justify-between shadow-inner">
            <div className="space-y-4">
              <h3 className="text-slate-900 dark:text-white font-bold text-lg flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                <Check size={20} className="text-emerald-500" /> Resumen
              </h3>
              <div className="flex justify-between text-sm"><span className="text-slate-500">Indicador</span><span className="font-bold text-slate-900 dark:text-white capitalize">{indicador}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-500">Rango</span><span className="font-bold text-slate-900 dark:text-white">{rango}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-500">Costo</span><span className="font-bold text-blue-600 dark:text-blue-400">{tipoUsuario === 'free' ? 'GRATIS' : '1 Crédito'}</span></div>
            </div>
            {/* Implementación de cargando para limpiar el Linter error */}
            <button 
              onClick={handleDownload} 
              disabled={cargando}
              className={`w-full py-4 mt-6 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95
                ${cargando ? 'bg-slate-400' : 'bg-slate-900 hover:bg-black dark:bg-blue-600 dark:hover:bg-blue-700'}`}
            >
              {cargando ? <Clock className="animate-spin" size={20} /> : <Download size={20} />}
              {cargando ? 'Procesando...' : 'Descargar Serie'}
            </button>
          </div>
        </div>
      </div>

      {/* --- LLENADO DEL ESPACIO VACÍO: GRID TÉCNICO --- */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-1000">
        <div className="p-6 rounded-2xl border border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 flex flex-col items-center text-center shadow-sm">
          <Database className="text-blue-500 mb-3" size={32} strokeWidth={1.5} />
          <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">Fuentes Certificadas</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Series procesadas directamente de APIs del BCRA e INDEC para máxima precisión.</p>
        </div>
        <div className="p-6 rounded-2xl border border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 flex flex-col items-center text-center shadow-sm">
          <Clock className="text-emerald-500 mb-3" size={32} strokeWidth={1.5} />
          <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">Actualización Diaria</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Los datos se actualizan al cierre de cada jornada bursátil (17:00hs ART).</p>
        </div>
        <div className="p-6 rounded-2xl border border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 flex flex-col items-center text-center shadow-sm">
          <Zap className="text-amber-500 mb-3" size={32} strokeWidth={1.5} />
          <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">Listos para BI</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Archivos estructurados para importación directa en PowerBI, Python o Excel Avanzado.</p>
        </div>
      </div>

    </div>
  );
}