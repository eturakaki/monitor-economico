import { useState } from 'react';
import { Download, FileSpreadsheet, FileJson, Crown, Check, Shield, Unlock } from 'lucide-react';

export function DescargaPremium() {
  
  // ==========================================
  // 1. ESTADO Y CONFIGURACIÓN
  // ==========================================
  const [tipoUsuario, setTipoUsuario] = useState('free'); 
  const [descargasUsadas, setDescargasUsadas] = useState(3);
  const limitePremium = 10;
  
  const [indicador, setIndicador] = useState('dolar-blue');
  const [rango, setRango] = useState('10D');
  const [formato, setFormato] = useState('excel');
  const [cargando, setCargando] = useState(false);

  // ==========================================
  // 2. LÓGICA DE NEGOCIO
  // ==========================================
  const handleDownload = () => {
    if (tipoUsuario === 'premium' && descargasUsadas >= limitePremium) {
      alert("⚠️ Cupo mensual agotado. Pasate a PLUS para descargas ilimitadas.");
      return;
    }
    
    setCargando(true);

    setTimeout(() => {
      setCargando(false);
      if (tipoUsuario === 'premium') setDescargasUsadas(prev => prev + 1);
      
      const cantidadDatos = tipoUsuario === 'free' ? "los últimos 10 datos" : "la serie COMPLETA";
      alert(`✅ Descargando ${cantidadDatos} de ${indicador} en formato ${formato}.`);
    }, 1500);
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-12 font-sans px-4">
      
      {/* --- SELECTOR DE DEMOSTRACIÓN --- */}
      <div className="flex justify-center gap-4 mb-8">
        {['free', 'premium', 'plus'].map((tipo) => (
          <button 
            key={tipo}
            onClick={() => { setTipoUsuario(tipo); setRango(tipo === 'free' ? '10D' : '1A'); }}
            className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider border-2 transition-all
              ${tipoUsuario === tipo 
                ? 'bg-slate-800 text-white border-slate-800 scale-105 dark:bg-white dark:text-slate-900 dark:border-slate' 
                : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400 dark:bg-slate-900 dark:text-slate-500 dark:border-slate-700 dark:hover:border-slate-500'}`}
          >
            Modo {tipo}
          </button>
        ))}
      </div>
      
      {/* ==========================================
          3. LA INTERFAZ VISUAL
         ========================================== */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800 transition-colors duration-300">
        
        {/* A. HEADER DINÁMICO */}
        <div className={`p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6
          ${tipoUsuario === 'plus' ? 'bg-gradient-to-r from-purple-900 to-indigo-1000' : 
            tipoUsuario === 'premium' ? 'bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900' : 
            'bg-gradient-to-r from-blue-500 to-cyan-1000'}`}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
              {tipoUsuario === 'plus' ? <Crown size={32} className="text-yellow-400" /> :
               tipoUsuario === 'premium' ? <Shield size={32} className="text-emerald-400" /> :
               <Unlock size={32} className="text-white" />}
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">
                {tipoUsuario === 'plus' ? 'Zona Premium PLUS' : 
                 tipoUsuario === 'premium' ? 'Zona Premium' : 
                 'Zona de Descargas Gratuitas'}
              </h2>
              <p className="text-white/80 text-sm font-medium">
                {tipoUsuario === 'plus' ? 'Acceso total sin límites.' : 
                 tipoUsuario === 'premium' ? 'Series completas. 10 descargas/mes.' : 
                 'Acceso básico: Últimos 10 registros.'}
              </p>
            </div>
          </div>

          {/* BARRA DE CUPO */}
          {tipoUsuario === 'premium' && (
            <div className="bg-black/20 p-4 rounded-xl border border-white/10 min-w-[200px]">
              <div className="flex justify-between text-xs font-bold uppercase mb-2 tracking-wider">
                <span>Cupo Mensual</span>
                <span>{descargasUsadas} / {limitePremium}</span>
              </div>
              <div className="h-2 w-full bg-black/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-400 transition-all duration-500" 
                  style={{ width: `${(descargasUsadas / limitePremium) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* B. CUERPO DEL FORMULARIO */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-12 gap-8 relative">
          
          {/* Columna Izq: Configuración */}
          <div className="md:col-span-8 space-y-8">
            
            {/* 1. SELECCIÓN DE INDICADOR */}
            <div>
              <label className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">1. ¿Qué dato necesitás?</label>
              <select 
                value={indicador}
                onChange={(e) => setIndicador(e.target.value)}
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-semibold text-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <option value="dolar-blue">💵 Dólar Blue (Informal)</option>
                <option value="dolar-mep">💰 Dólar MEP (Bolsa)</option>
                <option value="inflacion">📈 Inflación Mensual (IPC)</option>
                <option value="riesgo-pais">⚠️ Riesgo País</option>
                <option value="reservas">🏦 Reservas del Banco Central</option>
              </select>
            </div>

            {/* 2. SELECCIÓN DE RANGO */}
            <div>
              <div className="flex justify-between items-end mb-3">
                <label className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">2. Rango de Fechas</label>
                {tipoUsuario === 'free' && (
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">
                    🚀 Pasate a Premium para ver el historial completo
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-4 gap-3">
                {/* Botón siempre disponible */}
                <button
                  onClick={() => setRango('10D')}
                  className={`py-3 rounded-xl font-bold text-sm transition-all border-2
                    ${rango === '10D' 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' 
                      : 'border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'}`}
                >
                  Últimos 10
                </button>

                {/* Botones Premium */}
                {['1 Año', '5 Años', 'Todo'].map((item) => (
                  <button
                    key={item}
                    disabled={tipoUsuario === 'free'}
                    onClick={() => setRango(item)}
                    className={`py-3 rounded-xl font-bold text-sm transition-all border-2 relative overflow-hidden
                      ${tipoUsuario === 'free' 
                        ? 'bg-slate-50 dark:bg-slate-800/50 text-slate-300 dark:text-slate-600 border-transparent cursor-not-allowed grayscale' 
                        : rango === item 
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' 
                          : 'border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'}`}
                  >
                    {item}
                    {tipoUsuario === 'free' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/50">
                        <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300 px-1 rounded">PRO</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            {/* 3. SELECCIÓN DE FORMATO */}
            <div>
               <label className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 block">3. Formato</label>
               <div className="flex gap-4">
                  <button 
                    onClick={() => setFormato('excel')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl border-2 font-bold transition-all 
                      ${formato === 'excel' 
                        ? 'border-green-600 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20' 
                        : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'}`}
                  >
                    <FileSpreadsheet size={20} /> Excel
                  </button>
                  <button 
                    onClick={() => setFormato('csv')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl border-2 font-bold transition-all 
                      ${formato === 'csv' 
                        ? 'border-orange-500 text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20' 
                        : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'}`}
                  >
                    <FileJson size={20} /> CSV
                  </button>
               </div>
            </div>

          </div>

          {/* Columna Der: Resumen */}
          <div className="md:col-span-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 flex flex-col justify-between">
            <div>
              <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-4">Resumen de Exportación</h3>
              <ul className="space-y-4">
                <li className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Indicador</span>
                  <span className="font-semibold text-slate-900 dark:text-white capitalize">{indicador.replace('-', ' ')}</span>
                </li>
                <li className="flex justify-between text-sm items-center">
                  <span className="text-slate-500 dark:text-slate-400">Rango</span>
                  <span className={`font-bold px-2 py-1 rounded text-xs ${tipoUsuario === 'free' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'}`}>
                    {rango === '10D' ? 'Últimos 10 datos' : rango}
                  </span>
                </li>
                <li className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Formato</span>
                  <span className="font-semibold text-slate-900 dark:text-white uppercase">{formato}</span>
                </li>
                <hr className="border-slate-200 dark:border-slate-700" />
                <li className="flex justify-between text-sm items-center">
                  <span className="text-slate-500 dark:text-slate-400">Costo (Cupo)</span>
                  {tipoUsuario === 'free' ? (
                      <span className="text-blue-600 dark:text-blue-400 font-bold">GRATIS</span>
                  ) : tipoUsuario === 'plus' ? (
                      <span className="text-purple-600 dark:text-purple-400 font-bold">ILIMITADO</span>
                  ) : (
                      <span className="text-slate-900 dark:text-white font-bold">1 Crédito</span>
                  )}
                </li>
              </ul>
            </div>

            {/* BOTÓN DE DESCARGA PRINCIPAL */}
            <button
              onClick={handleDownload}
              disabled={cargando || (tipoUsuario === 'premium' && descargasUsadas >= limitePremium)}
              className={`w-full py-4 mt-6 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-transform hover:-translate-y-1 active:scale-95
                ${tipoUsuario === 'plus' ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-200 dark:shadow-none' : 
                  tipoUsuario === 'premium' ? (descargasUsadas >= limitePremium ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-700 shadow-slate-300 dark:shadow-none') : 
                  'bg-blue-600 hover:bg-blue-700 shadow-blue-200 dark:shadow-none'}`}
            >
              {cargando ? 'Procesando...' : (
                <>
                  <Download size={20} />
                  {tipoUsuario === 'free' ? 'Descargar Muestra' : 'Descargar Serie'}
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}