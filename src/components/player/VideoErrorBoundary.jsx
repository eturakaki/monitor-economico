import React from 'react';
import { AlertTriangle, RefreshCcw, WifiOff } from 'lucide-react';

/**
 * @component VideoErrorBoundary
 * @description "Airbag" visual para el reproductor. Captura errores de renderizado o red
 * y muestra una UI de recuperación amigable en lugar de romper la app.
 * @version 3.0.0 (Clean Professional Style)
 */
class VideoErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }

  // React pasa el error automáticamente, no necesitamos declarar el argumento si no lo usamos.
  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // En un entorno real, aquí enviaríamos el error a Sentry/LogRocket
    console.error("[VideoCrash] Detalle:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorInfo: null });
    // Callback al padre para forzar el remount del componente de video
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      // Intentamos adivinar si es error de red por el stack trace
      const isNetworkError = this.state.errorInfo?.componentStack?.includes('Network') || false;

      return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gray-900 text-white animate-in fade-in duration-300 px-4">
          
          <div className="flex flex-col items-center max-w-sm text-center space-y-4">
            {/* Icono de Estado */}
            <div className="p-4 bg-gray-800 rounded-full shadow-xl ring-1 ring-white/10">
              {isNetworkError ? (
                <WifiOff className="w-8 h-8 text-gray-400" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-amber-500" />
              )}
            </div>

            {/* Mensaje de Error */}
            <div className="space-y-1">
              <h3 className="text-lg font-semibold tracking-tight">
                {isNetworkError ? 'Conexión inestable' : 'No se pudo reproducir el video'}
              </h3>
              <p className="text-sm text-gray-400">
                {isNetworkError 
                  ? 'Verifique su conexión a internet e inténtelo de nuevo.'
                  : 'Hubo un error inesperado en el reproductor.'}
              </p>
            </div>

            {/* Botón de Acción */}
            <button 
              onClick={this.handleRetry}
              className="mt-2 flex items-center gap-2 px-5 py-2.5 bg-white text-gray-900 hover:bg-gray-100 rounded font-medium text-sm transition-colors shadow-lg"
            >
              <RefreshCcw size={16} />
              <span>Intentar de nuevo</span>
            </button>
          </div>

          {/* Código de Error Discreto */}
          <div className="absolute bottom-4 right-4 text-[10px] text-gray-600 font-mono">
            ERR_VPLAYER_0x2
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default VideoErrorBoundary;