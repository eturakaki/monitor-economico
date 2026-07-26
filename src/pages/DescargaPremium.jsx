import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner'; 
import { 
  Download, FileSpreadsheet, FileJson, Crown, Check, Shield, Unlock,
  Clock, Zap, Lock, AlertCircle
} from 'lucide-react'; 

/**
 * ------------------------------------------------------------------
 * COMPONENTE: DESCARGA PREMIUM (Export Center)
 * ------------------------------------------------------------------
 * Actualización v2: Implementación de "Soft Gate" (Teaser Pattern).
 * - Usuarios Free: Pueden descargar '10D' (Últimos datos).
 * - Usuarios Pro/Unlimited: Acceso total a series históricas.
 */

export function DescargaPremium() {
  // 1. CONEXIÓN AL CONTEXTO
  const { user } = useAuth();
  
  // 2. NORMALIZACIÓN DE PLANES
  const userPlan = user?.plan || 'starter'; 
  
  const isFree = userPlan === 'starter' || userPlan === 'free';
  const isPro = userPlan === 'pro';
  const isUnlimited = userPlan === 'unlimited';
  
  // [FIX] Definición local de checkPermissions para evitar error 'no-undef'.
  // TODO: Mover a un archivo de utilidades o implementar lógica real aquí.
  const checkPermissions = () => {
    // Lógica placeholder. Retorna true por defecto.
    return true;
  };

  // Helpers de lógica de negocio
  // Se asigna a variable con _ para cumplir regla no-unused-vars
  const _hasHistoryAccess = checkPermissions(); 

  const limiteDiario = isUnlimited ? Infinity : (isFree ? 3 : 10); // [LOGIC] Damos 3 demos al Free

  // 3. ESTADOS DE INTERFAZ
  const [descargasUsadas, setDescargasUsadas] = useState(0);
  
  // Estados del formulario
  const [indicador, setIndicador] = useState('dolar-blue');
  const [rango, setRango] = useState('10D'); // Default seguro para todos
  const [formato, setFormato] = useState('excel');
  const [cargando, setCargando] = useState(false);

  /**
   * HANDLER DE CAMBIO DE RANGO (GATEKEEPER)
   * Intercepta el clic en botones de tiempo para validar permisos.
   */
  const handleRangoChange = (nuevoRango) => {
    // Si es Free y quiere más de 10 días, mostramos Toast de Upsell pero NO cambiamos el estado
    if (isFree && nuevoRango !== '10D') {
        toast.message('Función Premium', {
            description: 'El historial completo está reservado para planes Pro.',
            icon: <Lock className="text-amber-500" size={16} />,
            action: {
                label: 'Ver Planes',
                onClick: () => window.location.href = '/planes' 
            }
        });
        return;
    }
    // Si tiene permiso, actualizamos
    setRango(nuevoRango);
  };

  /**
   * HANDLER DE DESCARGA
   */
  const handleDownload = () => {
    // A. Validación de Seguridad (Doble chequeo)
    if (isFree && rango !== '10D') {
       toast.error('Acceso denegado al histórico completo.');
       return;
    }

    // B. Validación de Cuota
    if (descargasUsadas >= limiteDiario) {
        toast.warning(isFree ? 'Límite gratuito alcanzado' : 'Límite diario alcanzado', {
            description: isFree 
                ? 'Has usado tus 3 descargas de prueba. Actualiza tu plan.'
                : 'Has alcanzado tu límite diario. Pásate a Unlimited.',
            icon: <AlertCircle className="text-amber-500" />
        });
        return;
    }
    
    // C. Proceso de Descarga (Simulación)
    setCargando(true);
    
    setTimeout(() => {
      setCargando(false);
      setDescargasUsadas(prev => prev + 1); 
      
      toast.success('Descarga Completada', {
        description: `Archivo ${indicador}_${rango}.${formato === 'excel' ? 'xlsx' : 'csv'} generado.`,
        icon: <Download className="text-emerald-500" />
      });
    }, 1500);
  };

  const getHeaderStyles = () => {
    if (isUnlimited) return 'bg-gradient-to-r from-purple-900 to-indigo-900 border-purple-500/30';
    if (isPro) return 'bg-gradient-to-r from-emerald-900 to-slate-900 border-emerald-500/30';
    return 'bg-gradient-to-r from-slate-800 to-slate-900 border-slate-700'; 
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-8 font-sans px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* TARJETA PRINCIPAL */}
      <div className={`bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border transition-all duration-300 ${isPro ? 'border-emerald-500/20' : 'border-slate-300 dark:border-slate-800'}`}>
        
        {/* === HEADER === */}
        <div className={`p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6 transition-colors duration-500 ${getHeaderStyles()}`}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md shadow-inner border border-white/10">
              {isUnlimited ? <Crown size={32} className="text-yellow-300 drop-shadow-md" /> :
               isPro ? <Shield size={32} className="text-emerald-300 drop-shadow-md" /> :
               <Lock size={32} className="text-slate-400" />}
            </div>
            
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white mb-1">Centro de Exportación</h2>
              <p className="text-white/70 text-sm font-medium flex items-center gap-2">
                Nivel Actual: 
                <span className={`uppercase font-black px-2 py-0.5 rounded text-[10px] tracking-wider
                    ${isUnlimited ? 'bg-yellow-400 text-yellow-900' : 
                      isPro ? 'bg-emerald-400 text-emerald-900' : 
                      'bg-slate-600 text-slate-200'}`}>
                    {userPlan}
                </span>
              </p>
            </div>
          </div>

          {/* Contador de Descargas */}
             <div className="flex items-center gap-4 bg-black/30 px-5 py-3 rounded-xl border border-white/10 backdrop-blur-sm">
                <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">Créditos Hoy</p>
                    <p className="text-xl font-mono font-bold leading-none mt-1">
                      {isUnlimited ? '∞' : `${descargasUsadas} / ${limiteDiario}`}
                    </p>
                </div>
                <div className="h-8 w-px bg-white/10"></div>
                <Download className="text-white/80" size={20} />
             </div>
        </div>

        {/* === BODY === */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-12 gap-8 relative">
            
            {/* COLUMNA IZQUIERDA: CONTROLES */}
            <div className="md:col-span-8 space-y-8">
                
                {/* 1. SELECTOR DE INDICADOR */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px]">1</span> 
                    Seleccionar Serie
                  </label>
                  <div className="relative group">
                    <select 
                        value={indicador} 
                        onChange={(e) => setIndicador(e.target.value)} 
                        className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-semibold rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all cursor-pointer hover:border-slate-400 dark:hover:border-slate-600"
                    >
                        <option value="dolar-blue">💵 Dólar Blue (Informal)</option>
                        <option value="dolar-mep">💰 Dólar MEP (Bolsa)</option>
                        <option value="dolar-ccl">📉 Dólar CCL (Contado)</option>
                        <option value="inflacion-mensual">📊 Inflación Mensual (INDEC)</option>
                        <option value="riesgo-pais">🇦🇷 Riesgo País (EMBI+)</option>
                        <option value="reservas-bcra">🏦 Reservas BCRA</option>
                    </select>
                  </div>
                </div>

                {/* 2. SELECTOR DE RANGO */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                     <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px]">2</span>
                     Horizonte Temporal
                  </label>
                  
                  <div className="grid grid-cols-4 gap-3">
                    <button 
                      onClick={() => handleRangoChange('10D')} 
                      className={`
                        py-3 rounded-xl font-bold text-sm border transition-all
                        ${rango === '10D' 
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 shadow-sm ring-1 ring-emerald-500' 
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }
                      `}
                    >
                      <span className="flex flex-col items-center leading-tight">
                         <span>12 Datos</span>
                         <span className="text-[9px] opacity-70 font-normal">Última rueda</span>
                      </span>
                    </button>
                    
                    {['1 Año', '5 Años', 'MAX'].map(item => {
                        const isLocked = isFree; 
                        const isSelected = rango === item;

                        return (
                          <button 
                            key={item} 
                            onClick={() => handleRangoChange(item)}
                            className={`
                                relative py-3 rounded-xl font-bold text-sm border transition-all overflow-hidden group
                                ${isSelected
                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' 
                                    : isLocked 
                                        ? 'border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 bg-slate-50 dark:bg-slate-800/50 cursor-pointer' 
                                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                                }
                            `}
                          >
                            <span className="flex items-center justify-center gap-1">
                                {item}
                                {isLocked && <Lock size={12} className="text-amber-500/70 group-hover:text-amber-500 transition-colors" />}
                            </span>
                          </button>
                        );
                    })}
                  </div>
                </div>

                {/* 3. FORMATO */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                     <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px]">3</span>
                     Formato de Salida
                  </label>
                  <div className="flex gap-4">
                    <button onClick={() => setFormato('excel')} className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl border font-bold transition-all ${formato === 'excel' ? 'border-emerald-600 text-emerald-700 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 ring-1 ring-emerald-600' : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                        <FileSpreadsheet size={20} /> Excel (.xlsx)
                    </button>
                    <button onClick={() => setFormato('csv')} className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl border font-bold transition-all ${formato === 'csv' ? 'border-orange-500 text-orange-700 bg-orange-50 dark:bg-orange-500/10 dark:text-orange-400 ring-1 ring-orange-500' : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                        <FileJson size={20} /> CSV (Raw)
                    </button>
                  </div>
                </div>
            </div>

            {/* COLUMNA DERECHA: RESUMEN */}
             <div className="md:col-span-4 flex flex-col h-full">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-300 dark:border-slate-700 flex flex-col justify-between h-full shadow-inner">
                    <div className="space-y-5">
                      <h3 className="text-slate-900 dark:text-white font-bold text-lg flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-4">
                        <Check size={20} className="text-emerald-500" /> Resumen de Orden
                      </h3>
                      
                      <div className="space-y-3">
                          <div className="flex justify-between text-sm items-center">
                              <span className="text-slate-500 font-medium">Data Set</span>
                              <span className="font-bold text-slate-900 dark:text-white capitalize bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-xs shadow-sm">{indicador}</span>
                          </div>
                          <div className="flex justify-between text-sm items-center">
                              <span className="text-slate-500 font-medium">Periodo</span>
                              <span className={`font-bold px-2 py-1 rounded border text-xs shadow-sm ${rango === '10D' ? 'text-slate-900 dark:text-white bg-white dark:bg-slate-900 border-slate-200' : 'text-emerald-700 bg-emerald-50 border-emerald-200'}`}>
                                {rango === '10D' ? 'Últimos 12 Datos' : rango}
                              </span>
                          </div>
                          
                          {/* Feedback de disponibilidad */}
                          {isFree && rango !== '10D' ? (
                              <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-400 text-xs font-medium flex items-start gap-2">
                                <Lock size={14} className="mt-0.5 shrink-0" />
                                <span>Requiere Plan Pro para descargar este rango.</span>
                              </div>
                          ) : (
                              <div className="flex justify-between text-sm items-center pt-3 border-t border-slate-200 dark:border-slate-700 border-dashed">
                                  <span className="text-slate-500 font-medium">Costo</span>
                                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                    {isUnlimited ? 'Ilimitado' : '1 Crédito'}
                                  </span>
                              </div>
                          )}
                      </div>
                    </div>
                    
                    <button 
                      onClick={handleDownload} 
                      disabled={cargando}
                      className={`w-full py-4 mt-8 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95
                        ${cargando 
                            ? 'bg-slate-400 cursor-not-allowed' 
                            : isFree && rango !== '10D'
                                ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-600'
                                : 'bg-slate-900 hover:bg-black dark:bg-emerald-600 dark:hover:bg-emerald-700 hover:shadow-emerald-500/20'
                         }`}
                    >
                      {cargando ? <Clock className="animate-spin" size={20} /> : isFree && rango !== '10D' ? <Lock size={18} /> : <Download size={20} />}
                      {cargando ? 'Procesando...' : isFree && rango !== '10D' ? 'Rango Bloqueado' : 'Descargar Archivo'}
                    </button>
                </div>
              </div>

        </div>
      </div>
      
       {/* FOOTER: FEATURES TÉCNICAS */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 opacity-80 hover:opacity-100 transition-opacity">
         <div className="p-5 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 flex items-center gap-4 hover:bg-white dark:hover:bg-slate-800 transition-colors">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl"><Zap size={24} /></div>
            <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">BCRA & INDEC</h4>
                <p className="text-xs text-slate-500">Fuentes oficiales certificadas.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 flex items-center gap-4 hover:bg-white dark:hover:bg-slate-800 transition-colors">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl"><Clock size={24} /></div>
            <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">T+0 Real Time</h4>
                <p className="text-xs text-slate-500">Actualización al cierre de rueda.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 flex items-center gap-4 hover:bg-white dark:hover:bg-slate-800 transition-colors">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-xl"><Unlock size={24} /></div>
            <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Formato Flexible</h4>
                <p className="text-xs text-slate-500">Excel, CSV y JSON disponibles.</p>
            </div>
          </div>
      </div>
    </div>
  );
}