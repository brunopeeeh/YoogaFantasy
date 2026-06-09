import { useState, useRef } from 'react';
import { Shield, User, Trophy, Camera, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { completarCadastro, uploadAvatar, atualizarAvatar, sugerirTimeInicial } from '../../services/perfilService';
import { ensureMyTime } from '../../services/timeService';

const STEPS = { FORM: 0, SUGERIR: 1, PRONTO: 2 };

export default function OnboardingScreen({ onComplete, defaults = {} }) {
  const [step, setStep] = useState(STEPS.FORM);
  const [nome, setNome] = useState(defaults.nome || '');
  const [nickname, setNickname] = useState(defaults.nickname || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [sugerindo, setSugerindo] = useState(false);
  const [timeCriado, setTimeCriado] = useState(null);
  const [perfilCriado, setPerfilCriado] = useState(null);
  const fileInputRef = useRef(null);

  async function handleAvatarChange(e) {
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

  function removerAvatar() {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!nome.trim() || nome.trim().length < 2) {
      toast.error('Informe seu nome (mín. 2 caracteres).');
      return;
    }
    if (!nickname.trim() || nickname.trim().length < 3) {
      toast.error('Informe um nickname para o time (mín. 3 caracteres).');
      return;
    }

    setSalvando(true);
    try {
      const { perfil, time } = await completarCadastro({
        nomeExibicao: nome.trim(),
        nomeTime: nickname.trim(),
      });

      if (avatarFile) {
        try {
          const url = await uploadAvatar(avatarFile);
          await atualizarAvatar(url);
          perfil.avatar_url = url;
        } catch {
          toast.error('Não foi possível salvar a foto. Você pode adicionar depois.');
        }
      }

      setPerfilCriado(perfil);
      setTimeCriado(time);
      setStep(STEPS.SUGERIR);
    } catch (err) {
      toast.error(err.message || 'Erro ao salvar cadastro.');
    } finally {
      setSalvando(false);
    }
  }

  async function handleSugerirTime() {
    if (!timeCriado?.id) return;
    setSugerindo(true);
    try {
      await sugerirTimeInicial(timeCriado.id);
      setStep(STEPS.PRONTO);
    } catch (err) {
      toast.error(err.message || 'Erro ao montar time inicial.');
      setStep(STEPS.PRONTO);
    } finally {
      setSugerindo(false);
    }
  }

  function handlePular() {
    setStep(STEPS.PRONTO);
  }

  function handleFinalizar() {
    onComplete();
  }

  if (step === STEPS.SUGERIR) {
    return (
      <div className="min-h-screen w-full bg-fifa-blue flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-6 py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-fifa-blue/10 flex items-center justify-center">
              <Shield size={28} className="text-fifa-blue" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-2">Time criado!</h1>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              Quer que a gente monte um time inicial pra você?<br />
              Selecionamos os melhores atletas dentro do orçamento.
            </p>

            <div className="space-y-3">
              <button
                onClick={handleSugerirTime}
                disabled={sugerindo}
                className="w-full py-3.5 rounded-xl bg-fifa-blue hover:bg-[#007AB0] text-white font-black text-sm uppercase tracking-wider transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {sugerindo ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Montando time...
                  </>
                ) : (
                  'Montar time automaticamente'
                )}
              </button>

              <button
                onClick={handlePular}
                className="w-full py-3 rounded-xl border border-gray-200 text-gray-500 font-bold text-xs uppercase tracking-wider hover:bg-gray-50 transition-colors"
              >
                Prefiro montar meu time agora
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === STEPS.PRONTO) {
    return (
      <div className="min-h-screen w-full bg-fifa-blue flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-6 py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-stat-fit/10 flex items-center justify-center">
              <Check size={28} className="text-stat-fit" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-2">Tudo pronto!</h1>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              Seu time está registrado. Agora é hora de escalar os titulares,<br />
              entrar em ligas e competir!
            </p>

            <button
              onClick={handleFinalizar}
              className="w-full py-3.5 rounded-xl bg-fifa-blue hover:bg-[#007AB0] text-white font-black text-sm uppercase tracking-wider transition-colors"
            >
              Ir para o Fantasy
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-fifa-blue flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div
          className="px-6 py-10 text-center border-b border-gray-100"
          style={{ background: 'linear-gradient(180deg, #009CDE22 0%, #fff 100%)' }}
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-fifa-blue/10 flex items-center justify-center">
            <Trophy size={28} className="text-fifa-blue" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">Bem-vindo ao Fantasy!</h1>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed max-w-sm mx-auto">
            Monte seu time dos sonhos, enfrente seus amigos e dispute o título de melhor técnico da Copa do Mundo.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-3 pb-2">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 hover:border-fifa-blue cursor-pointer transition-colors flex items-center justify-center overflow-hidden group"
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <Camera size={24} className="text-gray-400 group-hover:text-fifa-blue transition-colors" />
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <div className="text-center">
              {avatarPreview ? (
                <button type="button" onClick={removerAvatar} className="text-[11px] text-red-500 hover:underline">
                  Remover foto
                </button>
              ) : (
                <p className="text-[11px] text-gray-400">Clique para adicionar uma foto (opcional)</p>
              )}
            </div>
          </div>

          <label className="block space-y-1.5">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <User size={12} /> Seu nome completo
            </span>
            <input
              type="text"
              autoFocus
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Bruno Oliveira"
              maxLength={40}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 outline-none focus:border-fifa-blue focus:ring-2 focus:ring-fifa-blue/20 transition-all"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <Shield size={12} /> Nome do time
            </span>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Ex: Filipãoo FC"
              maxLength={30}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 outline-none focus:border-fifa-gold focus:ring-2 focus:ring-fifa-gold/20 transition-all"
            />
            <p className="text-[11px] text-gray-400">Esse nome aparece no ranking das ligas.</p>
          </label>

          <button
            type="submit"
            disabled={salvando}
            className="w-full mt-4 py-3.5 rounded-xl bg-fifa-blue hover:bg-[#007AB0] text-white font-black text-sm uppercase tracking-wider transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {salvando ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Criar meu time'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
