import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, UserCircle, Menu, Trophy, Wallet, Users } from 'lucide-react';
import { getMeuPerfil } from '../../services/perfilService';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFantasy } from '../../contexts/FantasyContext';
import { usePontuacaoRodada } from '../../hooks/usePontuacaoRodada';
import StatsSidebar from './StatsSidebar';
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
  const [sidebarAberto, setSidebarAberto] = useState(false);
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
    configRodada,
    mercadoAbertoConfig,
    saldoDraft: bancoCartoletas,
    totalSelecionados,
  } = useFantasy();

  const { ultimaRodada, totalTemporada } = usePontuacaoRodada();

  const deadlineLabel = formatarDeadline(configRodada?.deadline);
  const nomeTime = time?.nome_time || 'Meu Time';

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-fifa-navy-900/70 backdrop-blur-glass border-b border-white/10 shadow-glass">
        <div className="flex items-center justify-between px-4 sm:px-6 py-1.5 gap-2 sm:gap-3 select-none">
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex flex-col leading-none">
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-xl sm:text-[22px] text-white tracking-[2px] leading-none">
                  FIFA
                </span>
                <span className="font-display text-[10px] sm:text-[12px] text-fifa-blue tracking-[1px] uppercase leading-none hidden sm:inline">
                  World Cup™
                </span>
              </div>
              <span className="font-display text-sm sm:text-[17px] text-fifa-gold tracking-[3px] leading-none">
                Fantasy
              </span>
              <span className="text-[7px] sm:text-[8px] text-white/40 tracking-[1px] leading-none hidden sm:flex items-center gap-1">
                POWERED BY <span className="text-stat-fit font-bold">Yooga</span>
              </span>
            </div>

            <div className="hidden md:flex flex-col border-l border-white/10 pl-3">
              <span className="text-[8px] text-white/50 tracking-[0.5px] uppercase leading-tight">
                Prazo R{configRodada?.rodada_atual ?? '?'}
              </span>
              <span className={`font-heading text-xs font-bold leading-tight ${mercadoAbertoConfig ? 'text-white' : 'text-stat-injured'}`}>
                {deadlineLabel}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-1 sm:flex-initial justify-end">
            {naEscalacao && (
              <>
                <div className="bg-fifa-navy-800/80 border border-white/10 rounded-md py-1 px-2 sm:px-2.5 text-center min-w-[54px] sm:min-w-[65px]">
                  <div className="font-display text-sm sm:text-[16px] text-white tracking-[1px] leading-none flex items-center justify-center gap-1">
                    <Trophy size={10} className="text-fifa-gold" />
                    {ultimaRodada != null ? Number(ultimaRodada.pontos_ganhos).toFixed(1) : '—'}
                  </div>
                  <div className="text-[7px] text-white/50 uppercase tracking-[0.5px] mt-0.5 leading-tight">
                    {ultimaRodada ? `R${ultimaRodada.rodada}` : 'Pts'}·{totalTemporada.toFixed(0)}
                  </div>
                </div>
                <div className="bg-fifa-navy-800/80 border border-white/10 rounded-md py-1 px-2 sm:px-2.5 text-center min-w-[54px] sm:min-w-[65px]">
                  <div className="font-display text-sm sm:text-[16px] text-white tracking-[1px] leading-none flex items-center justify-center gap-1">
                    <Wallet size={10} className="text-fifa-gold" /> R${bancoCartoletas.toFixed(1)}M
                  </div>
                  <div className="text-[7px] text-white/50 uppercase tracking-[0.5px] mt-0.5 leading-tight">
                    Orçamento
                  </div>
                </div>
                <div className="bg-fifa-navy-800/80 border border-white/10 rounded-md py-1 px-2 sm:px-2.5 text-center min-w-[54px] sm:min-w-[65px]">
                  <div className="font-display text-sm sm:text-[16px] text-white tracking-[1px] leading-none flex items-center justify-center gap-1">
                    <Users size={10} className="text-fifa-blue" /> {totalSelecionados}/15
                  </div>
                  <div className="text-[7px] text-white/50 uppercase tracking-[0.5px] mt-0.5 leading-tight">
                    {!mercadoAbertoConfig ? <span className="text-stat-injured font-bold">FECHADO</span> : 'Escalado'}
                  </div>
                </div>
              </>
            )}
            {naEscalacao && (
              <button
                onClick={() => setSidebarAberto(true)}
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-md p-2 text-white/70 hover:text-white transition-all"
                title="Abrir painel do time"
                aria-label="Abrir painel do time"
              >
                <Menu size={18} />
              </button>
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

        <div className="w-full bg-fifa-navy-950/50 border-t border-white/5 px-4 sm:px-6 flex gap-6 overflow-x-auto overflow-y-hidden flex-nowrap" style={{ WebkitOverflowScrolling: 'touch' }}>
          <button
            onClick={() => navigate('/')}
            className={`py-1.5 text-[11px] font-bold tracking-widest uppercase transition-colors relative ${viewAtual === 'inicio' ? 'text-fifa-gold' : 'text-white/60 hover:text-white'}`}
          >
            Início
            {viewAtual === 'inicio' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-fifa-gold rounded-t-sm" />}
          </button>

          <button
            onClick={() => navigate('/escalar')}
            className={`py-1.5 text-[11px] font-bold tracking-widest uppercase transition-colors relative ${viewAtual === 'escalacao' ? 'text-fifa-gold' : 'text-white/60 hover:text-white'}`}
          >
            Escalar
            {viewAtual === 'escalacao' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-fifa-gold rounded-t-sm" />}
          </button>

          <button
            onClick={() => navigate('/ligas')}
            className={`py-1.5 text-[11px] font-bold tracking-widest uppercase transition-colors relative ${viewAtual === 'ligas' ? 'text-fifa-gold' : 'text-white/60 hover:text-white'}`}
          >
            Ligas
            {viewAtual === 'ligas' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-fifa-gold rounded-t-sm" />}
          </button>

          <button
            onClick={() => navigate('/ranking')}
            className={`py-1.5 text-[11px] font-bold tracking-widest uppercase transition-colors relative ${viewAtual === 'ranking' ? 'text-fifa-gold' : 'text-white/60 hover:text-white'}`}
          >
            Ranking
            {viewAtual === 'ranking' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-fifa-gold rounded-t-sm" />}
          </button>

          <button
            onClick={() => navigate('/regras')}
            className={`py-1.5 text-[11px] font-bold tracking-widest uppercase transition-colors relative ${viewAtual === 'regras' ? 'text-fifa-gold' : 'text-white/60 hover:text-white'}`}
          >
            Regras
            {viewAtual === 'regras' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-fifa-gold rounded-t-sm" />}
          </button>
        </div>
      </header>

      <PerfilModal
        isOpen={perfilAberto}
        onClose={() => setPerfilAberto(false)}
        user={user}
        time={time}
        onSaved={refetch}
      />

      <StatsSidebar aberto={sidebarAberto} onFechar={() => setSidebarAberto(false)} />
    </>
  );
}
