import React, { useState } from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  Target, 
  ShieldAlert, 
  BrainCircuit,
  Play
} from 'lucide-react';
// Nota: Este componente a veces es una página "Full Screen" y no usa ToolLayout,
// pero si quieres el menú lateral, descomenta la siguiente línea y envuelve el contenido.
// import { ToolLayout } from '../../../components/ToolLayout'; 

/**
 * Componente: Test del Inversor (Onboarding)
 * Estado: Implementación de Landing Page inicial (Paso 0) según diseño.
 */
export const InvestorTestPage = () => {
  const [step, setStep] = useState(0); // 0 = Landing, 1-4 = Pasos del test

  // Simulación de avance
  const startTest = () => setStep(1);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 flex flex-col items-center justify-center">
      
      {/* --- CONTENEDOR CENTRAL --- */}
      <div className="max-w-4xl w-full bg-slate-900/50 border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
        
        {/* Glow Effects de fondo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

        {/* --- HEADER --- */}
        <div className="text-center relative z-10 mb-12">
          <h1 className="text-3xl md:text-5xl font-black text-white mb-6">
            Test del <span className="text-orange-500">Inversor</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Descubrí qué tipo de inversor sos y cómo deberías armar tu cartera.
            Este test te ayuda a entender tu perfil de riesgo y te sugiere cómo organizar 
            tu plata según tus objetivos.
          </p>
        </div>

        {/* --- STEPPER VISUAL --- */}
        <div className="flex items-center justify-center mb-12 relative z-10">
          <StepIndicator number={1} label="Diagnóstico" active={step >= 1} />
          <StepConnector active={step >= 2} />
          <StepIndicator number={2} label="Orden básico" active={step >= 2} />
          <StepConnector active={step >= 3} />
          <StepIndicator number={3} label="Plan" active={step >= 3} />
          <StepConnector active={step >= 4} />
          <StepIndicator number={4} label="Seguimiento" active={step >= 4} />
        </div>

        {/* --- ACTION AREA --- */}
        <div className="text-center relative z-10">
          {step === 0 ? (
            <div className="space-y-8">
              <button 
                onClick={startTest}
                className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-orange-500 font-lg rounded-xl hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/30 focus:outline-none ring-offset-2 focus:ring-2 ring-orange-500"
              >
                Empezar el test
                <Play className="w-5 h-5 ml-2 fill-current" />
              </button>
              
              <p className="text-sm text-slate-500">
                No necesitás crear cuenta ya. Es simple, rápido y 100% gratuito.
              </p>
            </div>
          ) : (
            <div className="py-12 bg-slate-800/50 rounded-2xl border border-slate-700 border-dashed">
              <BrainCircuit className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">El cuestionario comenzaría aquí...</p>
              <button onClick={() => setStep(0)} className="text-sm text-orange-400 mt-4 hover:underline">
                Volver al inicio (Demo)
              </button>
            </div>
          )}
        </div>

      </div>

      {/* --- INFO FOOTER --- */}
      <div className="max-w-3xl w-full mt-12 grid gap-8 md:grid-cols-3 text-center md:text-left">
        <div>
          <h3 className="text-white font-bold mb-2 flex items-center justify-center md:justify-start gap-2">
            <Target className="w-4 h-4 text-orange-500" /> Paso 1 · Diagnóstico
          </h3>
          <p className="text-sm text-slate-500">
            Respondés preguntas simples para entender tu tolerancia al riesgo y horizonte temporal.
          </p>
        </div>
        <div>
          <h3 className="text-white font-bold mb-2 flex items-center justify-center md:justify-start gap-2">
            <ShieldAlert className="w-4 h-4 text-orange-500" /> Paso 2 · Orden
          </h3>
          <p className="text-sm text-slate-500">
            Revisamos si tienes fondo de emergencia y deudas antes de sugerir inversiones.
          </p>
        </div>
        <div>
          <h3 className="text-white font-bold mb-2 flex items-center justify-center md:justify-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-orange-500" /> Paso 3 · Plan
          </h3>
          <p className="text-sm text-slate-500">
            Te entregamos una "Torta de Inversión" ideal sugerida para tu perfil.
          </p>
        </div>
      </div>

    </div>
  );
};

// --- SUBCOMPONENTES UI (Para mantener limpio el código principal) ---

const StepIndicator = ({ number, label, active }) => (
  <div className="flex flex-col items-center gap-2">
    <div className={`
      w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border-2 transition-all duration-500
      ${active 
        ? 'bg-orange-500 border-orange-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.4)]' 
        : 'bg-slate-900 border-slate-700 text-slate-600'
      }
    `}>
      {number}
    </div>
    <span className={`text-xs font-medium transition-colors duration-300 ${active ? 'text-orange-400' : 'text-slate-600'}`}>
      {label}
    </span>
  </div>
);

const StepConnector = ({ active }) => (
  <div className={`w-12 md:w-24 h-0.5 mb-6 transition-colors duration-500 ${active ? 'bg-orange-500' : 'bg-slate-800'}`} />
);