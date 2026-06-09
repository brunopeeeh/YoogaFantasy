import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Mail, Shield, User, LogOut, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useFantasy } from '../../contexts/FantasyContext';
import { getMeuPerfil, atualizarNomeExibicao, uploadAvatar, atualizarAvatar } from '../../services/perfilService';
import { updateMyTimeNome } from '../../services/timeService';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { time, refetch } = useFantasy();
  const navigate = useNavigate();

  const [nomeExibicao, setNomeExibicao] = useState('');
  const [nomeTime, setNomeTime] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
    let ativo = true;
    async function carregar() {
      try {
        const perfil = await getMeuPerfil();
        if (!ativo) return;
        setNomeExibicao(perfil?.nome_exibicao || user?.email?.split('@')[0] || '');
        setNomeTime(time?.nome_time || 'Meu Time');
        setAvatarUrl(perfil?.avatar_url || null);
      } catch {
        if (ativo) {
          setNomeExibicao(user?.email?.split('@')[0] || '');
          setNomeTime(time?.nome_time || 'Meu Time');
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }
    carregar();
    return () => { ativo = false; };
  }, [user?.email, time?.nome_time]);

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
        setAvatarFile(null);
        setAvatarPreview(null);
      }
      await refetch();
      toast.success('Perfil atualizado!');
    } catch (err) {
      toast.error(err.message || 'Erro ao salvar perfil.');
    } finally {
      setSalvando(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  return (
    <div className="w-full max-w-lg mx-auto px-4 pb-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors py-4 text-xs font-bold uppercase tracking-wider"
      >
        <ArrowLeft size={14} />
        Voltar
      </button>

      {carregando ? (
        <div className="flex justify-center py-16">
          <Loader2 size={24} className="animate-spin text-white/40" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative w-20 h-20 rounded-full bg-fifa-navy-900 border-2 border-white/20 overflow-hidden cursor-pointer group flex-shrink-0"
            >
              {(avatarPreview || avatarUrl) ? (
                <img
                  src={avatarPreview || avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User size={32} className="text-white/30" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                <Camera size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
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
              <h2 className="text-lg font-black text-white">{nomeExibicao}</h2>
              <p className="text-xs text-white/50 flex items-center gap-1 mt-0.5">
                <Mail size={11} />
                {user?.email}
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-fifa-navy-800/50 border border-white/10 rounded-xl p-5 space-y-4">
            <label className="block space-y-1.5">
              <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider flex items-center gap-1">
                <User size={11} /> Nome de exibição
              </span>
              <input
                type="text"
                value={nomeExibicao}
                onChange={(e) => setNomeExibicao(e.target.value)}
                maxLength={30}
                className="w-full bg-fifa-navy-900/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-fifa-blue transition-colors"
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
                className="w-full bg-fifa-navy-900/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-fifa-gold transition-colors"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={salvando}
            className="w-full py-3.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-black text-sm uppercase tracking-wider transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-green-600/30"
          >
            {salvando ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <Save size={16} />
                Salvar alterações
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full py-3 rounded-xl bg-red-600/80 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
          >
            <LogOut size={14} />
            Sair da conta
          </button>
        </form>
      )}
    </div>
  );
}
