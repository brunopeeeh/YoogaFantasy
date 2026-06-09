import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Wallet, Users, Sparkles, Trophy, UserCircle, Zap, Crown } from 'lucide-react';
import { getMeuPerfil } from '../../services/perfilService';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFantasy } from '../../contexts/FantasyContext';
import { usePontuacaoRodada } from '../../hooks/usePontuacaoRodada';
import ConfirmarTokenModal from '../shared/ConfirmarTokenModal';
import SaveConfirmModal from './SaveConfirmModal';
import PerfilModal from './PerfilModal';

function formatarDeadline(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleString('pt-BR', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const viewAtual = location.pathname === '/ligas'
    ? 'ligas'
    : location.pathname === '/escalar'
      ? 'escalacao'
      : location.pathname === '/regras'
        ? 'regras'
        : location.pathname === '/ranking'
          ? 'ranking'
          : 'inicio';
  const naEscalacao = viewAtual === 'escalacao';
  const [perfilAberto, setPerfilAberto] = useState(false);
  const [confirmToken, setConfirmToken] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    getMeuPerfil()
      .then(p => setAvatarUrl(p?.avatar_url || null))
      .catch(() => {});
  }, [user?.id]);

  const {
    time,
    refetch,
    saldoDraft: bancoCartoletas,
    totalSelecionados,
    handleLimparElenco: onLimparElenco,
    handleSalvar,
    confirmarSalvar,
    fecharModalSalvar,
    saveModalAberto,
    handleDescartar,
    salvando,
    dirty: temMudancas,
    podeSalvar,
    configRodada,
    mercadoAbertoConfig,
    elencoSalvo,
    elencoDraft,
    capitaoDraftId,
    capitaoSalvoId,
    listaSelecionados,
    custoDraft,
    mensagensValidacao,
    limitesFase,
    transferenciasNoDraft,
    rodadaAtual,
    tokens,
    tokenUsando,
    handleUsarToken,
    handleResgatarToken,
    formacaoDraft,
  } = useFantasy();

  const { ultimaRodada, totalTemporada } = usePontuacaoRodada();

  const deadlineLabel = formatarDeadline(configRodada?.deadline);
  const nomeTime = time?.nome_time || 'Meu Time';
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
      <header className="sticky top-0 z-30 w-full bg-fifa-navy-900/70 backdrop-blur-glass border-b border-white/10 shadow-glass">
        <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 gap-3 sm:gap-4 select-none">
          <div className="flex flex-col leading-none flex-shrink-0">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-2xl sm:text-[28px] text-white tracking-[2px] leading-none">
                FIFA
              </span>
              <span className="font-display text-[10px] sm:text-[12px] text-fifa-blue tracking-[1px] uppercase leading-none hidden sm:inline">
                World Cup™
              </span>
            </div>
            <span className="font-display text-base sm:text-[20px] text-fifa-gold tracking-[3px] leading-none">
              Fantasy
            </span>
            <span className="text-[8px] sm:text-[9px] text-white/40 tracking-[1px] mt-0.5 leading-none hidden sm:flex items-center gap-1">
              POWERED BY <span className="text-stat-fit font-bold">Yooga</span>
            </span>
          </div>

          <div className="flex flex-col items-center text-center hidden md:flex">
            <div className="text-[10px] text-white/50 tracking-[0.5px] uppercase mb-0.5">
              Prazo das transferências (R{configRodada?.rodada_atual ?? '?'})
            </div>
            <div className={`font-heading text-base font-bold ${mercadoAbertoConfig ? 'text-white' : 'text-stat-injured'}`}>
              {deadlineLabel}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-1 sm:flex-initial justify-end">
            {naEscalacao && (
              <div className="flex items-center gap-2 mr-2 border-r border-white/10 pr-4">
                {temMudancas && (
                  <button
                    onClick={handleDescartar}
                    disabled={salvando}
                    className="bg-transparent hover:bg-white/5 active:scale-95 border border-white/20 rounded-md py-1.5 px-2.5 sm:px-3 text-[10px] sm:text-xs font-bold text-white/70 hover:text-white uppercase tracking-wider transition-all select-none disabled:opacity-50"
                  >
                    <span className="hidden sm:inline">Descartar</span>
                    <span className="sm:hidden">✖</span>
                  </button>
                )}
                <button
                  onClick={onLimparElenco}
                  disabled={salvando || !mercadoAbertoConfig}
                  className="bg-stat-injured hover:bg-red-700 active:scale-95 border border-red-700/30 rounded-md py-2 px-2.5 sm:px-3 text-[10px] sm:text-xs font-bold text-white uppercase tracking-wider transition-all select-none shadow-md disabled:opacity-50"
                  title="Vender todos os jogadores e resetar orçamento"
                >
                  <span className="hidden sm:inline">Limpar Elenco</span>
                  <span className="sm:hidden">Limpar</span>
                </button>
                <button
                  onClick={handleSalvar}
                  disabled={salvando || !mercadoAbertoConfig}
                  className={`active:scale-95 border rounded-md py-2 px-3 sm:px-4 text-[10px] sm:text-xs font-bold text-white uppercase tracking-wider transition-all shadow-glow select-none disabled:opacity-50 flex items-center gap-1.5 ${temMudancas && podeSalvar
                    ? 'bg-[#009CDE] hover:bg-[#007AB0] border-[#009CDE]/50'
                    : 'bg-[#009CDE]/40 border-[#009CDE]/30 hover:bg-[#009CDE]/60'
                    }`}
                  title={!temMudancas ? 'Nenhuma alteração pendente' : !podeSalvar ? 'Corrija o elenco antes de salvar' : 'Salvar escalação'}
                >
                  {salvando ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Sparkles size={14} className="text-fifa-gold" />
                  )}
                  <span className="hidden sm:inline">{salvando ? 'Salvando...' : 'Salvar Time'}</span>
                  <span className="sm:hidden">{salvando ? '...' : 'Salvar'}</span>
                </button>
              </div>
            )}

            {naEscalacao && (
              <>
                <div className="bg-fifa-navy-800/80 border border-white/10 rounded-md py-1.5 px-2.5 sm:px-4 text-center min-w-[70px] sm:min-w-[90px] hidden sm:block">
                  <div className="font-display text-base sm:text-[20px] text-white tracking-[1px] leading-none flex items-center justify-center gap-1">
                    <Trophy size={12} className="text-fifa-gold" />
                    {ultimaRodada != null ? Number(ultimaRodada.pontos_ganhos).toFixed(1) : '—'}
                  </div>
                  <div className="text-[8px] sm:text-[9px] text-white/50 uppercase tracking-[0.5px] mt-0.5">
                    {ultimaRodada ? `R${ultimaRodada.rodada}` : 'Pts'} · {totalTemporada.toFixed(0)} tot
                  </div>
                </div>
                <div className="bg-fifa-navy-800/80 border border-white/10 rounded-md py-1.5 px-2.5 sm:px-4 text-center min-w-[70px] sm:min-w-[90px]">
                  <div className="font-display text-base sm:text-[20px] text-white tracking-[1px] leading-none flex items-center justify-center gap-1">
                    <Wallet size={12} className="text-fifa-gold" /> €{bancoCartoletas.toFixed(1)}M
                  </div>
                  <div className="text-[8px] sm:text-[9px] text-white/50 uppercase tracking-[0.5px] mt-0.5">
                    Orçamento
                  </div>
                </div>
                <div className="bg-fifa-navy-800/80 border border-white/10 rounded-md py-1.5 px-2.5 sm:px-4 text-center min-w-[70px] sm:min-w-[90px]">
                  <div className="font-display text-base sm:text-[20px] text-white tracking-[1px] leading-none flex items-center justify-center gap-1">
                    <Users size={12} className="text-fifa-blue" /> {totalSelecionados}/15
                  </div>
                  <div className="text-[8px] sm:text-[9px] text-white/50 uppercase tracking-[0.5px] mt-0.5">
                    Escalado
                    {!mercadoAbertoConfig && <span className="text-stat-injured text-[9px] font-bold ml-1">FECHADO</span>}
                  </div>
                </div>
                {naEscalacao && limitesFase && (
                  <div className="hidden sm:block bg-fifa-navy-800/80 border border-white/10 rounded-md py-1.5 px-2.5 sm:px-4 text-center min-w-[70px] sm:min-w-[90px]">
                    <div className={`font-display text-base sm:text-[20px] tracking-[1px] leading-none flex items-center justify-center gap-1 ${transferenciasNoDraft > limitesFase.transferenciasGratis ? 'text-stat-injured' : 'text-white'}`}>
                      <Zap size={12} className="text-fifa-gold" /> {transferenciasNoDraft}/{limitesFase.transferenciasGratis >= 999 ? '∞' : limitesFase.transferenciasGratis}
                    </div>
                    <div className="text-[8px] sm:text-[9px] text-white/50 uppercase tracking-[0.5px] mt-0.5">
                      Transferências
                    </div>
                  </div>
                )}

                {naEscalacao && tokenTotal > 0 && (
                  <button
                    onClick={() => {
                      if (tokenDisponiveis > 0) handleConfirmarToken('usar');
                      else if (podeResgatar && mercadoAbertoConfig) handleConfirmarToken('resgatar');
                    }}
                    className="hidden sm:block bg-fifa-navy-800/80 border border-white/10 rounded-md py-1.5 px-2.5 sm:px-3 text-center min-w-[60px] sm:min-w-[70px] transition-all hover:bg-fifa-navy-700/80"
                    title="Tokens especiais"
                    aria-label="Tokens especiais"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <Crown
                        size={12}
                        strokeWidth={2.5}
                        className={tokenDisponiveis > 0 && capitaoDraftId ? 'text-yellow-400' : 'text-white/30'}
                      />
                      <span className={`text-[11px] sm:text-[13px] font-bold font-mono ${tokenDisponiveis > 0 && capitaoDraftId ? 'text-yellow-400' : 'text-white/40'}`}>
                        {tokenDisponiveis}/{tokenTotal}
                      </span>
                    </div>
                    <div className="text-[8px] sm:text-[9px] text-white/50 uppercase tracking-[0.5px] mt-0.5">
                      Tokens
                    </div>
                  </button>
                )}
              </>
            )}

            {user?.email && (
              <div className="flex items-center gap-1.5 ml-1 pl-3 border-l border-white/10">
                <button
                  onClick={() => navigate('/perfil')}
                  className="hidden lg:flex items-center gap-2 hover:opacity-90 transition-opacity"
                  title="Meu perfil"
                >
                  <div className="w-8 h-8 rounded-full bg-fifa-navy-900 border border-white/20 overflow-hidden flex-shrink-0">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <UserCircle size={18} className="text-white/50" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col text-left leading-tight max-w-[100px]">
                    <div className="text-[10px] text-white font-bold truncate">{nomeTime}</div>
                    <div className="text-[8px] text-white/50 uppercase tracking-[0.5px] truncate">Meu perfil</div>
                  </div>
                </button>
                <button
                  onClick={() => navigate('/perfil')}
                  className="lg:hidden bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 rounded-md p-2 text-white/70 hover:text-white transition-all"
                  title="Meu perfil"
                  aria-label="Meu perfil"
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <UserCircle size={20} />
                  )}
                </button>
                <button
                  onClick={signOut}
                  className="bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 rounded-md p-2.5 text-white/70 hover:text-white transition-all"
                  title="Sair"
                  aria-label="Sair"
                >
                  <LogOut size={18} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="w-full bg-fifa-navy-950/50 border-t border-white/5 px-4 sm:px-6 flex gap-6 mt-1 overflow-x-auto overflow-y-hidden flex-nowrap" style={{ WebkitOverflowScrolling: 'touch' }}>
          <button
            onClick={() => navigate('/')}
            className={`py-2.5 text-xs font-bold tracking-widest uppercase transition-colors relative ${viewAtual === 'inicio' ? 'text-fifa-gold' : 'text-white/60 hover:text-white'}`}
          >
            Início
            {viewAtual === 'inicio' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-fifa-gold rounded-t-sm" />}
          </button>

          <button
            onClick={() => navigate('/escalar')}
            className={`py-2.5 text-xs font-bold tracking-widest uppercase transition-colors relative ${viewAtual === 'escalacao' ? 'text-fifa-gold' : 'text-white/60 hover:text-white'}`}
          >
            Escalar
            {viewAtual === 'escalacao' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-fifa-gold rounded-t-sm" />}
          </button>

          <button
            onClick={() => navigate('/ligas')}
            className={`py-2.5 text-xs font-bold tracking-widest uppercase transition-colors relative ${viewAtual === 'ligas' ? 'text-fifa-gold' : 'text-white/60 hover:text-white'}`}
          >
            Ligas
            {viewAtual === 'ligas' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-fifa-gold rounded-t-sm" />}
          </button>

          <button
            onClick={() => navigate('/ranking')}
            className={`py-2.5 text-xs font-bold tracking-widest uppercase transition-colors relative ${viewAtual === 'ranking' ? 'text-fifa-gold' : 'text-white/60 hover:text-white'}`}
          >
            Ranking
            {viewAtual === 'ranking' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-fifa-gold rounded-t-sm" />}
          </button>

          <button
            onClick={() => navigate('/regras')}
            className={`py-2.5 text-xs font-bold tracking-widest uppercase transition-colors relative ${viewAtual === 'regras' ? 'text-fifa-gold' : 'text-white/60 hover:text-white'}`}
          >
            Regras
            {viewAtual === 'regras' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-fifa-gold rounded-t-sm" />}
          </button>
        </div>
      </header>

      <SaveConfirmModal
        isOpen={saveModalAberto}
        onClose={fecharModalSalvar}
        onConfirm={confirmarSalvar}
        salvando={salvando}
        elencoSalvo={elencoSalvo}
        elencoDraft={elencoDraft}
        capitaoDraftId={capitaoDraftId}
        capitaoSalvoId={capitaoSalvoId}
        saldoDraft={bancoCartoletas}
        custoDraft={custoDraft}
        totalSelecionados={totalSelecionados}
        mensagensValidacao={mensagensValidacao}
      />

      <PerfilModal
        isOpen={perfilAberto}
        onClose={() => setPerfilAberto(false)}
        user={user}
        time={time}
        onSaved={refetch}
      />

      <ConfirmarTokenModal
        isOpen={!!confirmToken}
        onClose={() => setConfirmToken(null)}
        onConfirm={handleExecutarAcaoToken}
        tipo={confirmToken}
        salvando={!!tokenUsando}
      />
    </>
  );
}
