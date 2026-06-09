import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Wallet, RefreshCw, Crown, AlertTriangle } from 'lucide-react';
import { popIn } from '../../design/animations';
import { elencoParaLista } from '../../lib/diffElenco';

function diffElenco(elencoSalvo, elencoDraft) {
  const salvo = elencoParaLista(elencoSalvo || {});
  const draft = elencoParaLista(elencoDraft || {});
  const salvoIds = new Map(salvo.map(j => [j.id, j]));
  const draftIds = new Map(draft.map(j => [j.id, j]));

  const entradas = draft.filter(j => !salvoIds.has(j.id));
  const saidas = salvo.filter(j => !draftIds.has(j.id));

  return { entradas, saidas, draft };
}

export default function SaveConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  salvando,
  elencoSalvo,
  elencoDraft,
  capitaoDraftId,
  capitaoSalvoId,
  saldoDraft,
  custoDraft,
  totalSelecionados,
  mensagensValidacao = [],
}) {
  const { entradas, saidas, draft } = diffElenco(elencoSalvo, elencoDraft);
  const capitao = draft.find(j => j.id === capitaoDraftId);
  const capitaoAlterado = capitaoDraftId !== capitaoSalvoId;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[110] bg-black/65 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <motion.div
            variants={popIn}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="bg-[#18202b] w-full sm:max-w-md rounded-t-2xl sm:rounded-xl shadow-2xl border border-white/10 overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-fifa-navy-900/80">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-fifa-gold" />
                <h2 className="font-display text-lg text-white tracking-wider">Confirmar escalação</h2>
              </div>
              <button onClick={onClose} disabled={salvando} className="text-white/50 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center">
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
              {mensagensValidacao.length > 0 && (
                <div className="flex gap-2 p-3 rounded-lg bg-red-950/40 border border-red-700/40 text-red-200 text-xs">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  <p>{mensagensValidacao[0]}</p>
                </div>
              )}

              {totalSelecionados < 15 && mensagensValidacao.length === 0 && (
                <div className="flex gap-2 p-3 rounded-lg bg-amber-950/40 border border-amber-700/40 text-amber-200 text-xs">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  <p>
                    <strong>Atenção:</strong> Elenco deve ter exatamente 15 jogadores. Atualmente: {totalSelecionados}.<br/>
                    Deseja salvar incompleto mesmo assim?
                  </p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-[#11161d] rounded-lg p-3 border border-white/5 text-center">
                  <Wallet size={14} className="mx-auto text-fifa-gold mb-1" />
                  <div className="text-sm font-black text-white">R${saldoDraft.toFixed(1)}M</div>
                  <div className="text-[9px] text-white/40 uppercase">Saldo</div>
                </div>
                <div className="bg-[#11161d] rounded-lg p-3 border border-white/5 text-center">
                  <div className="text-sm font-black text-white">{totalSelecionados}/15</div>
                  <div className="text-[9px] text-white/40 uppercase">Jogadores</div>
                </div>
                <div className="bg-[#11161d] rounded-lg p-3 border border-white/5 text-center">
                  <div className="text-sm font-black text-white">R${custoDraft.toFixed(1)}M</div>
                  <div className="text-[9px] text-white/40 uppercase">Gasto</div>
                </div>
              </div>

              {(entradas.length > 0 || saidas.length > 0) && (
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold text-white/50 uppercase tracking-widest flex items-center gap-1.5">
                    <RefreshCw size={12} /> Transferências
                  </h3>
                  {saidas.map(j => (
                    <div key={`out-${j.id}`} className="flex items-center gap-2 text-xs bg-red-950/30 border border-red-900/30 rounded-lg px-3 py-2">
                      <span className="text-red-400 font-bold">−</span>
                      <span className="text-white/80 truncate">{j.nome}</span>
                      <span className="ml-auto text-white/40">R${Number(j.preco).toFixed(1)}M</span>
                    </div>
                  ))}
                  {entradas.map(j => (
                    <div key={`in-${j.id}`} className="flex items-center gap-2 text-xs bg-stat-fit/10 border border-stat-fit/30 rounded-lg px-3 py-2">
                      <span className="text-stat-fit font-bold">+</span>
                      <span className="text-white/80 truncate">{j.nome}</span>
                      <span className="ml-auto text-white/40">R${Number(j.preco).toFixed(1)}M</span>
                    </div>
                  ))}
                </div>
              )}

              {capitao && (
                <div className="flex items-center gap-3 bg-fifa-gold/10 border border-fifa-gold/30 rounded-lg px-3 py-2.5">
                  <Crown size={16} className="text-fifa-gold shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[9px] text-fifa-gold/80 uppercase font-bold tracking-wider">Capitão</div>
                    <div className="text-sm font-bold text-white truncate">{capitao.nome}</div>
                  </div>
                  {capitaoAlterado && (
                    <span className="ml-auto text-[9px] bg-fifa-gold/20 text-fifa-gold px-2 py-0.5 rounded uppercase font-bold">Novo</span>
                  )}
                </div>
              )}

              {!capitao && totalSelecionados > 0 && (
                <p className="text-[11px] text-amber-300/80 flex items-center gap-1.5">
                  <AlertTriangle size={12} /> Nenhum capitão definido — pontos normais para todos.
                </p>
              )}
            </div>

            <div className="px-5 py-4 border-t border-white/10 flex gap-3 bg-fifa-navy-950/50">
              <button
                onClick={onClose}
                disabled={salvando}
                className="flex-1 py-2.5 rounded-lg border border-white/15 text-white/70 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                disabled={salvando || mensagensValidacao.length > 0}
                className="flex-1 py-2.5 rounded-lg bg-[#009CDE] hover:bg-[#007AB0] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-glow"
              >
                {salvando ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles size={14} className="text-fifa-gold" />
                    Confirmar
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
