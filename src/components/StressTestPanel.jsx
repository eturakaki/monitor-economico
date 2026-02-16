import { useState } from 'react';
import { UserStatusService } from '../services/userStatus';
import { toast } from 'sonner';

export const StressTestPanel = () => {
  const [logs, setLogs] = useState([]);
  const [isBusy, setIsBusy] = useState(false);

  // CORRECCIÓN: Eliminamos 'type' ya que no se usa.
  // La lógica de colores se maneja abajo en el render según el contenido del string.
  const addLog = (msg) => {
    const time = new Date().toLocaleTimeString().split(' ')[0];
    setLogs(prev => [`[${time}] ${msg}`, ...prev].slice(0, 10));
  };

  const testAccess = async () => {
    setIsBusy(true);
    addLog('Solicitando datos Premium...', 'wait');
    try {
      await UserStatusService.checkPremiumAccess();
      addLog('✅ ACCESO CONCEDIDO: 200 OK');
      toast.success('Permiso Validado Correctamente');
    } catch (error) {
      if (error.message.includes('403')) {
        addLog(`⛔ BLOQUEADO (Correcto): ${error.message}`);
        toast.error('Bloqueado por el Servidor (Plan insuficiente)');
      } else {
        addLog(`💥 ERROR CRÍTICO: ${error.message}`);
        toast.error(error.message);
      }
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl p-4 z-50 font-mono text-xs opacity-90 hover:opacity-100 transition-opacity">
      <div className="flex justify-between items-center mb-2 border-b border-slate-700 pb-2">
        <h3 className="text-emerald-400 font-bold">🛠️ QA STRESS CONSOLE</h3>
        <span className="text-slate-500">{isBusy ? '⏳ BUSY' : '● IDLE'}</span>
      </div>
      
      <button 
        onClick={testAccess}
        disabled={isBusy}
        className="w-full mb-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-1.5 rounded transition-colors"
      >
        TEST: Acceso Premium (Backend Check)
      </button>

      <div className="bg-black/50 rounded p-2 h-32 overflow-y-auto border border-slate-800">
        {logs.length === 0 && <span className="text-slate-600 italic">Esperando logs...</span>}
        {logs.map((log, i) => (
          <div key={i} className={`mb-1 ${log.includes('✅') ? 'text-emerald-400' : log.includes('⛔') ? 'text-yellow-400' : 'text-red-400'}`}>
            {log}
          </div>
        ))}
      </div>
    </div>
  );
};