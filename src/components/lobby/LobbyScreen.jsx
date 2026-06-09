import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronRight, Plus, Trophy, Users, Shirt, Zap } from 'lucide-react';
import { useFantasy } from '../../contexts/FantasyContext';
import { usePontuacaoRodada } from '../../hooks/usePontuacaoRodada';
import { useJogosRodada } from '../../hooks/useJogosRodada';
import { useEffect, useState } from 'react';
import { buscarMinhasLigas } from '../../services/ligasService';
import { POSICAO_LABEL, ELENCO_LIMITE } from '../../lib/posicoes';
import { JogoCard } from '../shared/JogoCard';

const POS_ORDEM = ['Goleiro', 'Defensor', 'MeioCampista', 'Atacante'];
const MAX_JOGOS_LOBBY = 8;

export default function LobbyScreen() {
  const navigate = useNavigate();
  const { totalSelecionados, elencoSalvo, capitaoSalvoId, limitesFase, transferenciasNoDraft, saldoDraft, listaSelecionados, mercadoAbertoConfig, configRodada } = useFantasy();
  const { ultimaRodada, totalTemporada } = usePontuacaoRodada();
  const rodada = configRodada?.rodada_atual;
  const { jogos, loading: carregandoJogos } = useJogosRodada(rodada);

  const [ligas, setLigas] = useState([]);
  const [carregandoLigas, setCarregandoLigas] = useState(true);

  useEffect(() => {
    buscarMinhasLigas()
      .then(setLigas)
      .catch(() => setLigas([]))
      .finally(() => setCarregandoLigas(false));
  }, []);

  const contagemPorPos = {};
  for (const pos of POS_ORDEM) {
    contagemPorPos[pos] = (elencoSalvo?.[pos] || []).filter(Boolean).length;
  }

  const capitaoJogador = capitaoSalvoId
    ? listaSelecionados.find(j => Number(j.id) === Number(capitaoSalvoId))
    : null;

  const gratisp = limitesFase?.transferenciasGratis ?? 3;
  const restantes = Math.max(0, gratisp - transferenciasNoDraft);

  const jogosPreview = jogos.slice(0, MAX_JOGOS_LOBBY);
  const temMaisJogos = jogos.length > MAX_JOGOS_LOBBY;

  return (
    <div className="flex-1 bg-fifa-blue overflow-y-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">

        {/* Métricas */}
        <div className="grid grid-cols-3 gap-3">
          <div className="glass-panel rounded-xl p-3 sm:p-4 text-center">
            <div className="text-[9px] text-white/50 uppercase font-bold tracking-wider">Saldo</div>
            <div className="text-base sm:text-lg font-black text-white mt-0.5 font-display tracking-wide">
              €{saldoDraft.toFixed(1)}M
            </div>
          </div>
          <div className="glass-panel rounded-xl p-3 sm:p-4 text-center">
            <div className="text-[9px] text-white/50 uppercase font-bold tracking-wider">Última</div>
            <div className="text-base sm:text-lg font-black text-white mt-0.5 font-display tracking-wide">
              {ultimaRodada != null ? Number(ultimaRodada.pontos_ganhos).toFixed(1) : '—'}
            </div>
          </div>
          <div className="glass-panel rounded-xl p-3 sm:p-4 text-center">
            <div className="text-[9px] text-white/50 uppercase font-bold tracking-wider">Total</div>
            <div className="text-base sm:text-lg font-black text-white mt-0.5 font-display tracking-wide">
              {totalTemporada.toFixed(0)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Coluna esquerda — Time + Ações */}
          <div className="lg:col-span-1 space-y-4">
            <div className="glass-panel rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-black uppercase tracking-widest text-white/80">
                  Meu time
                </h2>
                <span className="text-[10px] font-bold text-white/40 font-mono">
                  R{rodada ?? '?'}
                </span>
              </div>

              <div className="space-y-2.5 mb-4">
                {POS_ORDEM.map((pos) => {
                  const limite = ELENCO_LIMITE[pos];
                  const ocupado = contagemPorPos[pos] || 0;
                  const pct = limite > 0 ? (ocupado / limite) * 100 : 0;
                  return (
                    <div key={pos}>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-bold text-white/70 uppercase tracking-wider">
                          {POSICAO_LABEL[pos]}
                        </span>
                        <span className="text-white/40 font-mono">
                          {ocupado}/{limite}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-fifa-gold/70 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-3 mb-3">
                <div className="flex items-center gap-2 text-[11px] text-white/60">
                  <Shirt size={13} className="text-white/40" />
                  <span className="font-bold">{totalSelecionados}/15</span>
                  <span className="text-white/30">escalados</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-white/60">
                  <Zap size={13} className="text-fifa-gold" />
                  <span className="font-bold text-white/80">{restantes}/{gratisp >= 999 ? '∞' : gratisp}</span>
                  <span className="text-white/30">transf.</span>
                </div>
              </div>

              {capitaoJogador && (
                <div className="text-[11px] text-white/50 mb-3 flex items-center gap-1.5 bg-white/5 rounded-lg px-3 py-2">
                  <Trophy size={12} className="text-fifa-gold" />
                  Capitão: <span className="font-bold text-white/80">{capitaoJogador.nome}</span>
                </div>
              )}

              <button
                onClick={() => navigate('/escalar')}
                className="w-full py-3.5 rounded-xl bg-fifa-gold hover:bg-yellow-500 text-fifa-navy-900 font-black text-xs uppercase tracking-widest shadow-lg shadow-fifa-gold/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Users size={16} />
                Escalar meu time
              </button>

              {totalSelecionados < 15 && mercadoAbertoConfig && (
                <p className="text-center text-[10px] text-amber-300/80 mt-2 font-medium">
                  {15 - totalSelecionados} vaga(s) não preenchida(s)
                </p>
              )}
            </div>
          </div>

          {/* Coluna direita — Ligas + Jogos */}
          <div className="lg:col-span-2 space-y-4">
            <div className="glass-panel rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-xs font-black uppercase tracking-widest text-white/80 flex items-center gap-2">
                  <Trophy size={15} className="text-fifa-gold" />
                  Ligas
                </h2>
                <button
                  onClick={() => navigate('/ligas')}
                  className="text-[10px] font-bold text-fifa-blue uppercase tracking-wider hover:underline flex items-center gap-0.5"
                >
                  Ver todas <ChevronRight size={12} />
                </button>
              </div>

              <div className="p-5">
                {carregandoLigas ? (
                  <div className="py-6 text-center text-xs text-white/40 animate-pulse">Carregando ligas...</div>
                ) : ligas.length === 0 ? (
                  <div className="py-5 text-center">
                    <p className="text-xs text-white/50 mb-4">Você ainda não participa de nenhuma liga.</p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <button
                        onClick={() => navigate('/ligas', { state: { aba: 'criar' } })}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-fifa-blue text-white text-[10px] font-bold uppercase tracking-wider hover:bg-[#007AB0] transition-colors"
                      >
                        <Plus size={13} /> Criar liga
                      </button>
                      <button
                        onClick={() => navigate('/ligas', { state: { aba: 'entrar' } })}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/10 text-white/70 text-[10px] font-bold uppercase tracking-wider hover:bg-white/5 transition-colors"
                      >
                        Entrar com código
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {ligas.slice(0, 5).map((liga) => (
                      <button
                        key={liga.id}
                        onClick={() => navigate('/ligas')}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-white/5 hover:border-fifa-blue/40 hover:bg-white/5 transition-all text-left group"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-white text-sm truncate">{liga.nome}</div>
                          <div className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">
                            {liga.tipo === 'privada' ? 'Privada' : 'Pública'}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black text-fifa-gold font-mono">
                            {Number(liga.meus_pontos || 0).toFixed(1)} pts
                          </span>
                          <ChevronRight size={14} className="text-white/20 group-hover:text-fifa-blue transition-colors" />
                        </div>
                      </button>
                    ))}
                    <button
                      onClick={() => navigate('/ligas', { state: { aba: 'criar' } })}
                      className="w-full mt-2 py-2.5 rounded-xl border-2 border-dashed border-white/10 text-[10px] font-bold text-white/40 uppercase tracking-wider hover:border-fifa-blue hover:text-fifa-blue transition-all flex items-center justify-center gap-1.5"
                    >
                      <Plus size={13} /> Nova liga
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Jogos da Rodada */}
            <div className="glass-panel rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-black uppercase tracking-widest text-white/80 flex items-center gap-2">
                  <Calendar size={15} className="text-fifa-blue" />
                  Jogos da rodada {rodada ?? '?'}
                </h2>
                {temMaisJogos && (
                  <button
                    onClick={() => navigate('/jogos')}
                    className="text-[10px] font-bold text-fifa-blue uppercase tracking-wider hover:underline flex items-center gap-0.5"
                  >
                    Ver todos ({jogos.length}) <ChevronRight size={12} />
                  </button>
                )}
              </div>

              {carregandoJogos ? (
                <div className="py-8 text-center text-xs text-white/40 animate-pulse">Carregando jogos...</div>
              ) : jogos.length === 0 ? (
                <div className="py-6 text-center text-xs text-white/40">
                  Nenhum jogo cadastrado para esta rodada.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {jogosPreview.map((jogo) => (
                    <JogoCard key={jogo.id_sofascore} jogo={jogo} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
