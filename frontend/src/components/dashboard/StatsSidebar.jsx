import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Zap, Crown } from 'lucide-react';
import { useFantasy } from '../../contexts/FantasyContext';
import ConfirmarTokenModal from '../shared/ConfirmarTokenModal';
import SaveConfirmModal from './SaveConfirmModal';
import FormacaoSelector from '../pitch/FormacaoSelector';

export default function StatsSidebar({ aberto, onFechar }) {
  const {
    handleLimparElenco,
    handleSalvar,
    handleDescartar,
    salvando,
    dirty: temMudancas,
    podeSalvar,
    mercadoAbertoConfig,
    limitesFase,
    transferenciasNoDraft,
    rodadaAtual,
    tokens,
    handleUsarToken,
    handleResgatarToken,
    tokenUsando,
    capitaoDraftId,
    saveModalAberto,
    confirmarSalvar,
    fecharModalSalvar,
    elencoSalvo,
    elencoDraft,
    capitaoSalvoId,
    custoDraft,
    mensagensValidacao,
    formacaoDraft,
    handleTrocarFormacao,
    saldoDraft,
    totalSelecionados,
  } = useFantasy();

  const [confirmToken, setConfirmToken] = useState(null);

  const tokenTotal = (tokens || []).filter(t => t.tipo === 'capitao_triplo').length;
  const tokenDisponiveis = (tokens || []).filter(t => t.tipo === 'capitao_triplo' && t.disponivel).length;
  const podeResgatar = (tokens || []).some(
    t => t.tipo === 'capitao_triplo' && !t.disponivel && t.rodada_usado === rodadaAtual
  );

  function handleConfirmarToken(tipo) {
    setConfirmToken(tipo);
  }

  async function handleExecutarAcaoToken() {
    if (!confirmToken) return;
    const fn = confirmToken === 'usar' ? handleUsarToken : handleResgatarToken;
    await fn('capitao_triplo');
    setConfirmToken(null);
  }

  return (
    <>
      <AnimatePresence>
        {aberto && (
          <motion.div
            key="stats-sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50"
            onClick={onFechar}
          />
        )}
        {aberto && (
          <motion.aside
            key="stats-sidebar-aside"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-72 bg-fifa-navy-900 border-l border-white/10 z-[60] shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <span className="text-sm font-bold text-white/70 uppercase tracking-wider">Time</span>
              <button onClick={onFechar} className="p-1 hover:bg-white/10 rounded-md transition-colors">
                <X size={18} className="text-white/70" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              <div className="pb-2 border-b border-white/10">
                <div className="text-[9px] text-white/40 uppercase tracking-widest mb-2">Formação</div>
                <FormacaoSelector
                  formacaoAtiva={formacaoDraft}
                  onTrocar={handleTrocarFormacao}
                  desabilitado={false}
                />
              </div>

              {limitesFase && (
                <div className="bg-fifa-navy-800/80 border border-white/10 rounded-md py-2 px-3 text-center">
                  <div className={`font-display text-lg tracking-[1px] leading-none flex items-center justify-center gap-1.5 ${transferenciasNoDraft > limitesFase.transferenciasGratis ? 'text-stat-injured' : 'text-white'}`}>
                    <Zap size={14} className="text-fifa-gold" /> {transferenciasNoDraft}/{limitesFase.transferenciasGratis >= 999 ? '∞' : limitesFase.transferenciasGratis}
                  </div>
                  <div className="text-[9px] text-white/50 uppercase tracking-[0.5px] mt-1">
                    Transferências
                  </div>
                </div>
              )}

              {tokenTotal > 0 && (
                <button
                  onClick={() => {
                    if (tokenDisponiveis > 0) handleConfirmarToken('usar');
                    else if (podeResgatar && mercadoAbertoConfig) handleConfirmarToken('resgatar');
                  }}
                  className="w-full bg-fifa-navy-800/80 border border-white/10 rounded-md py-2 px-3 text-center transition-all hover:bg-fifa-navy-700/80"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <Crown size={14} strokeWidth={2.5} className={tokenDisponiveis > 0 && capitaoDraftId ? 'text-yellow-400' : 'text-white/30'} />
                    <span className={`text-sm font-bold font-mono ${tokenDisponiveis > 0 && capitaoDraftId ? 'text-yellow-400' : 'text-white/40'}`}>
                      {tokenDisponiveis}/{tokenTotal}
                    </span>
                  </div>
                  <div className="text-[9px] text-white/50 uppercase tracking-[0.5px] mt-1">
                    Tokens
                  </div>
                </button>
              )}

              <div className="border-t border-white/10 pt-3 space-y-2">
                {temMudancas && (
                  <button
                    onClick={handleDescartar}
                    disabled={salvando}
                    className="w-full bg-transparent hover:bg-white/5 border border-white/20 rounded-md py-2 text-xs font-bold text-white/70 hover:text-white uppercase tracking-wider transition-all disabled:opacity-50"
                  >
                    Descartar
                  </button>
                )}
                <button
                  onClick={handleLimparElenco}
                  disabled={salvando || !mercadoAbertoConfig}
                  className="w-full bg-stat-injured hover:bg-red-700 border border-red-700/30 rounded-md py-2 text-xs font-bold text-white uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  Limpar Elenco
                </button>
                <button
                  onClick={handleSalvar}
                  disabled={salvando || !mercadoAbertoConfig}
                  className={`w-full border rounded-md py-2 text-xs font-bold text-white uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 ${temMudancas && podeSalvar ? 'bg-[#009CDE] hover:bg-[#007AB0] border-[#009CDE]/50' : 'bg-[#009CDE]/40 border-[#009CDE]/30'}`}
                >
                  {salvando ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Sparkles size={14} className="text-fifa-gold" />
                  )}
                  {salvando ? 'Salvando...' : 'Salvar Time'}
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <ConfirmarTokenModal
        isOpen={!!confirmToken}
        onClose={() => setConfirmToken(null)}
        onConfirm={handleExecutarAcaoToken}
        tipo={confirmToken}
        salvando={!!tokenUsando}
      />

      <SaveConfirmModal
        isOpen={saveModalAberto}
        onClose={fecharModalSalvar}
        onConfirm={confirmarSalvar}
        salvando={salvando}
        elencoSalvo={elencoSalvo}
        elencoDraft={elencoDraft}
        capitaoDraftId={capitaoDraftId}
        capitaoSalvoId={capitaoSalvoId}
        saldoDraft={saldoDraft}
        custoDraft={custoDraft}
        totalSelecionados={totalSelecionados}
        mensagensValidacao={mensagensValidacao}
      />
    </>
  );
}
