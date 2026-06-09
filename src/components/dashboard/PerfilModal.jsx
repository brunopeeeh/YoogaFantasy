import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Shield, Mail, Save, Camera, Loader2, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { popIn } from '../../design/animations';
import { getMeuPerfil, atualizarNomeExibicao, uploadAvatar, atualizarAvatar } from '../../services/perfilService';
import { updateMyTimeNome } from '../../services/timeService';

export default function PerfilModal({ isOpen, onClose, user, time, onSaved }) {
  const navigate = useNavigate();
  const [nomeExibicao, setNomeExibicao] = useState('');
  const [nomeTime, setNomeTime] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    setCarregando(true);
    setAvatarFile(null);
    setAvatarPreview(null);
    getMeuPerfil()
      .then((perfil) => {
        setNomeExibicao(perfil?.nome_exibicao || user?.email?.split('@')[0] || '');
        setNomeTime(time?.nome_time || 'Meu Time');
        setAvatarUrl(perfil?.avatar_url || null);
      })
      .finally(() => setCarregando(false));
  }, [isOpen, user?.email, time?.nome_time]);

  function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('A foto deve ter no máximo 2MB.');
      return;
    }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
  }

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

      if (avatarFile) {
        const url = await uploadAvatar(avatarFile);
        await atualizarAvatar(url);
        setAvatarUrl(url);
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
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="relative w-12 h-12 rounded-full bg-fifa-navy-900 border-2 border-fifa-blue flex items-center justify-center overflow-hidden cursor-pointer group"
                  >
                    {avatarPreview || avatarUrl ? (
                      <img
                        src={avatarPreview || avatarUrl}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={22} className="text-fifa-blue" />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <Camera size={14} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
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
                <Loader2 size={24} className="animate-spin text-white/40" />
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
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <>
                      <Save size={14} />
                      Salvar perfil
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => { onClose(); navigate('/perfil'); }}
                  className="w-full py-2.5 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/20 font-bold text-[10px] uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                >
                  <ExternalLink size={11} />
                  Abrir perfil completo
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
