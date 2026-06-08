import { useState } from 'react';
import { Shield, User, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';
import { completarCadastro } from '../../services/perfilService';

export default function OnboardingScreen({ onComplete, defaults = {} }) {
  const [nome, setNome] = useState(defaults.nome || '');
  const [nickname, setNickname] = useState(defaults.nickname || '');
  const [salvando, setSalvando] = useState(false);

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
      await completarCadastro({
        nomeExibicao: nome.trim(),
        nomeTime: nickname.trim(),
      });
      toast.success('Bem-vindo ao Fantasy! Seu time foi criado.');
      onComplete();
    } catch (err) {
      toast.error(err.message || 'Erro ao salvar cadastro.');
    } finally {
      setSalvando(false);
    }
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
