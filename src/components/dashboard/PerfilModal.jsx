import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Shield, Mail, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { popIn } from '../../design/animations';
import { getMeuPerfil, atualizarNomeExibicao } from '../../services/perfilService';
import { updateMyTimeNome } from '../../services/timeService';

export default function PerfilModal({ isOpen, onClose, user, time, onSaved }) {
  const [nomeExibicao, setNomeExibicao] = useState('');
  const [nomeTime, setNomeTime] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setCarregando(true);
    Promise.all([
      getMeuPerfil().catch(() => null),
    ])
      .then(([perfil]) => {
        setNomeExibicao(perfil?.nome_exibicao || user?.email?.split('@')[0] || '');
        setNomeTime(time?.nome_time || 'Meu Time');
      })
      .finally(() => setCarregando(false));
  }, [isOpen, user?.email, time?.nome_time]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!nomeExibicao.trim() || !nomeTime.trim()) {
      toast.error('Preencha todos os campos.');
      return;
    }
    setSalvando(true);
    try {
      await atualizarNomeExibicao(nomeExibicao.trim());
      if (time?.id) {
        await updateMyTimeNome(time.id, nomeTime.trim());
      }
      toast.success('Perfil atualizado!');
      if (onSaved) await onSaved();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Erro ao salvar perfil.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[110] bg-black/65 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            variants={popIn}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="bg-[#18202b] w-full max-w-[400px] rounded-xl shadow-2xl border border-white/10 overflow-hidden"
          >
            <div
              className="px-5 py-5 border-b border-white/10"
              style={{ background: 'linear-gradient(180deg, #009CDE33 0%, #18202b 100%)' }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-fifa-navy-900 border-2 border-fifa-blue flex items-center justify-center">
                    <User size={22} className="text-fifa-blue" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl text-white tracking-wider">Meu Perfil</h2>
                    <p className="text-[10px] text-white/50 uppercase tracking-wider">Treinador Fantasy</p>
                  </div>
                </div>
                <button onClick={onClose} className="text-white/50 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center">
                  <X size={20} />
                </button>
              </div>
            </div>

            {carregando ? (
              <div className="p-10 flex justify-center">
                <div className="w-8 h-8 border-2 border-white/20 border-t-fifa-blue rounded-full animate-spin" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div className="flex items-center gap-2 text-xs text-white/50 bg-[#11161d] rounded-lg px-3 py-2.5 border border-white/5">
                  <Mail size={14} />
                  <span className="truncate">{user?.email}</span>
                </div>

                <label className="block space-y-1.5">
                  <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider flex items-center gap-1">
                    <User size={11} /> Nome de exibição
                  </span>
                  <input
                    type="text"
                    value={nomeExibicao}
                    onChange={(e) => setNomeExibicao(e.target.value)}
                    maxLength={30}
                    placeholder="Como aparece nas ligas"
                    className="w-full bg-[#11161d] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-fifa-blue transition-colors"
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider flex items-center gap-1">
                    <Shield size={11} /> Nome do time
                  </span>
                  <input
                    type="text"
                    value={nomeTime}
                    onChange={(e) => setNomeTime(e.target.value)}
                    maxLength={30}
                    placeholder="Ex: Seleção Yooga FC"
                    className="w-full bg-[#11161d] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-fifa-gold transition-colors"
                  />
                </label>

                <p className="text-[10px] text-white/40 leading-relaxed">
                  Seu nome aparece no ranking das ligas. O nome do time identifica sua escalação.
                </p>

                <button
                  type="submit"
                  disabled={salvando}
                  className="w-full py-3 rounded-lg bg-fifa-gold hover:bg-yellow-400 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {salvando ? (
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save size={14} />
                      Salvar perfil
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
