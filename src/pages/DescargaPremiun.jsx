import { useState } from 'react';
import { Download, FileSpreadsheet, FileJson, Crown, Check, Shield, Unlock } from 'lucide-react';

export function DescargaPremium() {
  
  // ==========================================
  // 1. ESTADO Y CONFIGURACIÓN (La Memoria del Componente)
  // ==========================================

  // SIMULACIÓN DE USUARIO:
  // Esta variable 'tipoUsuario' define qué ve la persona.
  // Valores posibles: 'free' (gratis), 'premium' (intermedio), 'plus' (full).
  // En una app real, esto vendría de tu base de datos o autenticación.
  const [tipoUsuario, setTipoUsuario] = useState('free'); 
  
  // CONTADORES Y LÍMITES:
  // 'descargasUsadas': Cuántas veces bajó datos este mes.
  // 'limitePremium': El tope para los usuarios del plan medio.
  const [descargasUsadas, setDescargasUsadas] = useState(3);
  const limitePremium = 10;
  
  // DATOS DEL FORMULARIO:
  // Aquí guardamos lo que el usuario elige en los selectores.
  const [indicador, setIndicador] = useState('dolar-blue');
  const [rango, setRango] = useState('10D'); // Por defecto '10D' (10 datos) para el plan free.
  const [formato, setFormato] = useState('excel');
  
  // ESTADO DE UI:
  // 'cargando': Para mostrar el "Procesando..." y deshabilitar el botón para que no haga doble click.
  const [cargando, setCargando] = useState(false);

  // ==========================================
  // 2. LÓGICA DE NEGOCIO (El Cerebro)
  // ==========================================
  const handleDownload = () => {
    // REGLA 1: Si es Premium y ya gastó sus 10 balas, lo frenamos.
    if (tipoUsuario === 'premium' && descargasUsadas >= limitePremium) {
      alert("⚠️ Cupo mensual agotado. Pasate a PLUS para descargas ilimitadas.");
      return;
    }
    
    // Si pasa la validación, activamos el modo carga.
    setCargando(true);

    // SIMULAMOS LA DESCARGA (esto tardaría 1.5 seg en la vida real)
    setTimeout(() => {
      setCargando(false);
      
      // REGLA 2: Solo descontamos cupo si es Premium.
      // - Free es ilimitado en CANTIDAD de veces, pero limitado en CALIDAD de datos.
      // - Plus es ilimitado en todo.
      if (tipoUsuario === 'premium') setDescargasUsadas(prev => prev + 1);
      
      // Mensaje de éxito dinámico según el plan
      const cantidadDatos = tipoUsuario === 'free' ? "los últimos 10 datos" : "la serie COMPLETA";
      alert(`✅ Descargando ${cantidadDatos} de ${indicador} en formato ${formato}.`);
    }, 1500);
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-12 font-sans">
      
      {/* --- SELECTOR DE DEMOSTRACIÓN (SOLO PARA DESARROLLO) --- */}
      {/* Estos botones son para que VOS pruebes cómo se ve cada plan sin loguearte. */}
      <div className="flex justify-center gap-4 mb-8">
        {['free', 'premium', 'plus'].map((tipo) => (
          <button 
            key={tipo}
            // Al cambiar de usuario, reseteamos el rango para evitar inconsistencias
            onClick={() => { setTipoUsuario(tipo); setRango(tipo === 'free' ? '10D' : '1A'); }}
            className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider border-2 transition-all
              ${tipoUsuario === tipo 
                ? 'bg-slate-800 text-white border-slate-800 scale-105' 
                : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400'}`}
          >
            Modo {tipo}
          </button>
        ))}
      </div>
      
      {/* ==========================================
          3. LA INTERFAZ VISUAL (El Cuerpo)
         ========================================== */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        
        {/* A. HEADER DINÁMICO: Cambia de color según el plan (Azul, Gris Oscuro o Violeta) */}
        <div className={`p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6
          ${tipoUsuario === 'plus' ? 'bg-gradient-to-r from-purple-900 to-indigo-800' : 
            tipoUsuario === 'premium' ? 'bg-gradient-to-r from-slate-900 to-slate-800' : 
            'bg-gradient-to-r from-blue-500 to-cyan-500'}`}
        >
          <div className="flex items-center gap-4">
            {/* Ícono dinámico según nivel */}
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

          {/* BARRA DE CUPO: Solo se muestra si sos Premium (el que tiene límite) */}
          {tipoUsuario === 'premium' && (
            <div className="bg-black/20 p-4 rounded-xl border border-white/10 min-w-[200px]">
              <div className="flex justify-between text-xs font-bold uppercase mb-2 tracking-wider">
                <span>Cupo Mensual</span>
                <span>{descargasUsadas} / {limitePremium}</span>
              </div>
              {/* Barra de progreso visual */}
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
          
          {/* Columna Izq: Configuración (ocupa 8 de 12 columnas) */}
          <div className="md:col-span-8 space-y-8">
            
            {/* 1. SELECCIÓN DE INDICADOR */}
            <div>
              <label className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 block">1. ¿Qué dato necesitás?</label>
              <select 
                value={indicador}
                onChange={(e) => setIndicador(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-lg font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer hover:bg-slate-100"
              >
                <option value="dolar-blue">💵 Dólar Blue (Informal)</option>
                <option value="dolar-mep">💰 Dólar MEP (Bolsa)</option>
                <option value="inflacion">📈 Inflación Mensual (IPC)</option>
                <option value="riesgo-pais">⚠️ Riesgo País</option>
                <option value="reservas">🏦 Reservas del Banco Central</option>
              </select>
            </div>

            {/* 2. SELECCIÓN DE RANGO (Aquí aplicamos el bloqueo "Freemium") */}
            <div>
              <div className="flex justify-between items-end mb-3">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">2. Rango de Fechas</label>
                {/* Mensaje de venta (Upselling) para usuarios Free */}
                {tipoUsuario === 'free' && (
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    🚀 Pasate a Premium para ver el historial completo
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-4 gap-3">
                {/* Botón siempre disponible: Muestra gratis */}
                <button
                  onClick={() => setRango('10D')}
                  className={`py-3 rounded-xl font-bold text-sm transition-all border-2
                    ${rango === '10D' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-slate-100 text-slate-500 hover:border-slate-300'}`}
                >
                  Últimos 10
                </button>

                {/* Botones Premium: Si es 'free', están desactivados (disabled) */}
                {['1 Año', '5 Años', 'Todo'].map((item) => (
                  <button
                    key={item}
                    disabled={tipoUsuario === 'free'} // <--- EL CANDADO
                    onClick={() => setRango(item)}
                    className={`py-3 rounded-xl font-bold text-sm transition-all border-2 relative overflow-hidden
                      ${tipoUsuario === 'free' 
                        ? 'bg-slate-50 text-slate-300 border-transparent cursor-not-allowed grayscale' // Estilo bloqueado
                        : rango === item 
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700' // Estilo activo
                          : 'border-slate-100 text-slate-600 hover:border-slate-300'}`} // Estilo inactivo
                  >
                    {item}
                    {/* Badge "PRO" sobre los botones bloqueados */}
                    {tipoUsuario === 'free' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-50/50">
                        <span className="text-xs bg-slate-200 text-slate-500 px-1 rounded">PRO</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            {/* 3. SELECCIÓN DE FORMATO */}
            <div>
               <label className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 block">3. Formato</label>
               <div className="flex gap-4">
                  <button 
                    onClick={() => setFormato('excel')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl border-2 font-bold transition-all ${formato === 'excel' ? 'border-green-600 text-green-700 bg-green-50' : 'border-slate-200 text-slate-500'}`}
                  >
                    <FileSpreadsheet size={20} /> Excel
                  </button>
                  <button 
                    onClick={() => setFormato('csv')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl border-2 font-bold transition-all ${formato === 'csv' ? 'border-orange-500 text-orange-700 bg-orange-50' : 'border-slate-200 text-slate-500'}`}
                  >
                    <FileJson size={20} /> CSV
                  </button>
               </div>
            </div>

          </div>

          {/* Columna Der: Resumen y Botón (ocupa 4 de 12 columnas) */}
          <div className="md:col-span-4 bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col justify-between">
            <div>
              <h3 className="text-slate-900 font-bold text-lg mb-4">Resumen de Exportación</h3>
              {/* Lista de detalles dinámicos */}
              <ul className="space-y-4">
                <li className="flex justify-between text-sm">
                  <span className="text-slate-500">Indicador</span>
                  <span className="font-semibold text-slate-900 capitalize">{indicador.replace('-', ' ')}</span>
                </li>
                <li className="flex justify-between text-sm items-center">
                  <span className="text-slate-500">Rango</span>
                  <span className={`font-bold px-2 py-1 rounded text-xs ${tipoUsuario === 'free' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {rango === '10D' ? 'Últimos 10 datos' : rango}
                  </span>
                </li>
                <li className="flex justify-between text-sm">
                  <span className="text-slate-500">Formato</span>
                  <span className="font-semibold text-slate-900 uppercase">{formato}</span>
                </li>
                <hr className="border-slate-200" />
                <li className="flex justify-between text-sm items-center">
                  <span className="text-slate-500">Costo (Cupo)</span>
                  {/* Etiqueta de costo dinámica */}
                  {tipoUsuario === 'free' ? (
                     <span className="text-blue-600 font-bold">GRATIS</span>
                  ) : tipoUsuario === 'plus' ? (
                     <span className="text-purple-600 font-bold">ILIMITADO</span>
                  ) : (
                     <span className="text-slate-900 font-bold">1 Crédito</span>
                  )}
                </li>
              </ul>
            </div>

            {/* BOTÓN DE DESCARGA PRINCIPAL */}
            <button
              onClick={handleDownload}
              // Se deshabilita si está cargando O si se acabó el cupo Premium
              disabled={cargando || (tipoUsuario === 'premium' && descargasUsadas >= limitePremium)}
              className={`w-full py-4 mt-6 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-transform hover:-translate-y-1 active:scale-95
                ${tipoUsuario === 'plus' ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-200' : 
                  tipoUsuario === 'premium' ? (descargasUsadas >= limitePremium ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-300') : 
                  'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}
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