import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class DashboardErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { erro: null };
  }

  static getDerivedStateFromError(erro) {
    return { erro };
  }

  componentDidCatch(erro, info) {
    console.error('[DashboardErrorBoundary]', erro, info);
  }

  handleReset = () => {
    this.setState({ erro: null });
    if (this.props.onReset) this.props.onReset();
  };

  render() {
    if (this.state.erro) {
      return (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-stat-injured/20 border border-stat-injured/40 rounded-glass p-6 text-white">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={20} className="text-red-400" />
              <h2 className="text-lg font-black">Erro no time</h2>
            </div>
            <p className="text-sm text-red-200 mb-4">
              {this.props.mensagem || 'Não foi possível carregar seu time.'}
            </p>
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold uppercase tracking-wider flex items-center gap-2"
            >
              <RefreshCw size={14} />
              Tentar novamente
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
