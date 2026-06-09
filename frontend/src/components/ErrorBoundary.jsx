import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { erro: null };
  }

  static getDerivedStateFromError(erro) {
    return { erro };
  }

  componentDidCatch(erro, info) {
    console.error('[ErrorBoundary]', erro, info);
  }

  render() {
    if (this.state.erro) {
      return (
        <div className="min-h-screen w-full bg-[#001D35] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#18202b] border border-white/10 rounded-xl p-8 text-white text-center space-y-4">
            <div className="mx-auto w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertTriangle size={28} className="text-red-400" />
            </div>
            <h2 className="text-lg font-black">Algo deu errado</h2>
            <p className="text-sm text-white/60">
              Ocorreu um erro inesperado. Tente recarregar a página.
            </p>
            {this.props.mostrarDetalhes && this.state.erro && (
              <pre className="text-[11px] text-red-300 bg-black/40 rounded-lg p-3 text-left overflow-auto max-h-32">
                {this.state.erro.message}
              </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-fifa-gold text-fifa-navy-900 font-black rounded-lg hover:bg-yellow-400 transition-colors text-sm uppercase tracking-wider"
            >
              <RefreshCw size={14} />
              Recarregar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
