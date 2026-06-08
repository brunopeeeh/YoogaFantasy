import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class MercadoErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { erro: null };
  }

  static getDerivedStateFromError(erro) {
    return { erro };
  }

  componentDidCatch(erro, info) {
    console.error('[MercadoErrorBoundary]', erro, info);
  }

  handleReset = () => {
    this.setState({ erro: null });
    if (this.props.onReset) this.props.onReset();
  };

  render() {
    if (this.state.erro) {
      return (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-fifa-navy-800/80 border border-white/10 rounded-xl p-5 text-white text-center">
            <AlertTriangle size={24} className="text-amber-400 mx-auto mb-2" />
            <h3 className="text-sm font-black mb-1">Erro no mercado</h3>
            <p className="text-xs text-white/60 mb-3">
              Não foi possível carregar o mercado de jogadores.
            </p>
            <button
              onClick={this.handleReset}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold uppercase tracking-wider"
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
