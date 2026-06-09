import { motion, AnimatePresence } from 'framer-motion';
import { Crown, RotateCcw, X } from 'lucide-react';
import { popIn } from '../../design/animations';

const CONFIG = {
  usar: {
    titulo: 'Ativar Capitão Triplo?',
    descricao: 'O capitão do seu time ganhará pontos TRIPLICADOS nesta rodada. Use com estratégia!',
    confirmLabel: 'Ativar Token',
    confirmClass: 'bg-yellow-500 hover:bg-yellow-400 text-black',
  },
  resgatar: {
    titulo: 'Resgatar Token?',
    descricao: 'O token voltará a ficar disponível para uso em uma rodada futura. Tem certeza?',
    confirmLabel: 'Resgatar Token',
    confirmClass: 'bg-fifa-blue hover:bg-[#007AB0] text-white',
  },
};

export default function ConfirmarTokenModal({ isOpen, onClose, onConfirm, tipo, salvando }) {
  const cfg = CONFIG[tipo] || CONFIG.usar;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[120] bg-black/65 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            variants={popIn}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="bg-[#18202b] w-full max-w-sm rounded-xl shadow-2xl border border-white/10 overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-yellow-500/20">
                  {tipo === 'resgatar' ? (
                    <RotateCcw size={18} className="text-fifa-blue" />
                  ) : (
                    <Crown size={18} className="text-yellow-400" />
                  )}
                </div>
                <h2 className="text-base font-black text-white tracking-wider">
                  {cfg.titulo}
                </h2>
              </div>
              <button
                onClick={onClose}
                disabled={salvando}
                className="text-white/40 hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-5 py-5">
              <p className="text-sm text-white/70 leading-relaxed">
                {cfg.descricao}
              </p>
            </div>

            <div className="px-5 py-4 border-t border-white/10 flex gap-3">
              <button
                onClick={onClose}
                disabled={salvando}
                className="flex-1 py-2.5 rounded-lg border border-white/15 text-white/60 hover:text-white text-[11px] font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                disabled={salvando}
                className={`flex-1 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-md ${cfg.confirmClass}`}
              >
                {salvando ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  cfg.confirmLabel
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
