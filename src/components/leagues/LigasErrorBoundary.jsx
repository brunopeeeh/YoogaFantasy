import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class LigasErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { erro: null };
  }

  static getDerivedStateFromError(erro) {
    return { erro };
  }

  componentDidCatch(erro, info) {
    console.error('[LigasErrorBoundary]', erro, info);
  }

  handleReset = () => {
    this.setState({ erro: null });
    if (this.props.onReset) this.props.onReset();
  };

  render() {
    if (this.state.erro) {
      return (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-fifa-navy-800/80 border border-white/10 rounded-xl p-6 text-white text-center">
            <AlertTriangle size={28} className="text-amber-400 mx-auto mb-3" />
            <h2 className="text-lg font-black mb-1">Erro nas ligas</h2>
            <p className="text-sm text-white/60 mb-4">
              Não foi possível carregar suas ligas. Tente novamente.
            </p>
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold uppercase tracking-wider"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
