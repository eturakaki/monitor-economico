import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

class VideoErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("🔥 Video Engine Crash:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
    // Pequeño hack para forzar re-render del padre si es necesario, 
    // aunque resetear el estado suele bastar.
    if (this.props.onRetry) this.props.onRetry();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full bg-gray-900 flex flex-col items-center justify-center text-white space-y-4">
          <AlertTriangle className="w-12 h-12 text-amber-500" />
          <div className="text-center">
            <h3 className="font-bold text-lg">Error de Reproducción</h3>
            <p className="text-gray-400 text-sm max-w-xs mx-auto">
              El reproductor ha encontrado un problema inesperado.
            </p>
          </div>
          <button 
            onClick={this.handleRetry}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors font-medium text-sm"
          >
            <RefreshCcw size={16} />
            Recargar Reproductor
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default VideoErrorBoundary;