import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, ChevronRight, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getKit } from '../../lib/kits';
import { popIn } from '../../design/animations';
import { AVATAR_FALLBACK } from '../../design/tokens';
import { useJogosCopa } from '../../hooks/useJogosCopa';
import { buscarStatsJogador } from '../../services/playerStatsService';

export default function PlayerDetailsModal({ jogador, isOpen, onClose }) {
  const { jogosPorSelecao } = useJogosCopa();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [carregandoStats, setCarregandoStats] = useState(false);

  useEffect(() => {
    if (!isOpen || !jogador?.id) {
      setStats(null);
      return;
    }
    let ativo = true;
    setCarregandoStats(true);
    buscarStatsJogador(jogador.id)
      .then((dados) => { if (ativo) setStats(dados); })
      .finally(() => { if (ativo) setCarregandoStats(false); });
    return () => { ativo = false; };
  }, [isOpen, jogador?.id]);

  if (!isOpen || !jogador) return null;

  const kit = getKit(jogador.selecaoId, jogador.selecao);
  const fotoSrc = jogador.foto || AVATAR_FALLBACK;

  const ptsPartida = stats?.ptsPartida ?? '—';
  const forma = stats?.forma ?? '—';
  const selPorcentagem = stats?.selPorcentagem ?? '—';
  const total = stats?.total ?? '—';
  const fonteLabel = stats?.fonte === 'scouts'
    ? `${stats.rodadasComDados} rodada(s) reais`
    : 'Estimativa';

  const agendaBase = jogosPorSelecao[jogador.selecaoId];
  const proximosJogos = agendaBase?.jogos?.slice(0, 3) || [];

  const mapaInverso = { G: 'Goleiro', D: 'Defensor', M: 'Meio-Campista', F: 'Atacante' };
  const posicaoExtenso = mapaInverso[jogador.posicao] || jogador.posicao || '—';

  const colorMapFdr = {
    easy: 'bg-stat-fit',
    medium: 'bg-[#009CDE]',
    hard: 'bg-stat-injured',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              variants={popIn}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="bg-[#18202b] w-full max-w-[400px] rounded-xl shadow-2xl overflow-hidden border border-white/10 flex flex-col"
            >
              <div
                className="relative flex flex-col items-center pt-8 pb-4"
                style={{
                  background: `linear-gradient(180deg, ${kit.primary} 0%, #18202b 100%)`,
                }}
              >
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <X size={20} />
                </button>

                <div className="relative mb-3">
                  <div className="w-[72px] h-[72px] rounded-full border-4 border-white bg-fifa-navy-900 overflow-hidden shadow-lg">
                    <img src={fotoSrc} alt={jogador.nome} className="w-full h-full object-cover" />
                  </div>
                  {jogador.bandeira && (
                    <div className="absolute -bottom-2 -left-2 w-7 h-7 rounded-full border-2 border-white overflow-hidden shadow-md bg-fifa-navy-900 flex items-center justify-center">
                      <img src={jogador.bandeira} alt={jogador.selecao} className="w-full h-full object-cover scale-[1.2]" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-white border-2 border-white flex items-center justify-center shadow-md">
                    <span className="text-[10px] font-black text-[#11161d] font-mono leading-none mt-[1px]">
                      {{ Goleiro: 'G', Defensor: 'D', MeioCampista: 'M', Atacante: 'F', G: 'G', D: 'D', M: 'M', F: 'F' }[jogador.posicao] || jogador.posicao?.charAt(0)}
                    </span>
                  </div>
                </div>

                <h2 className="text-lg font-black text-white text-center leading-tight">
                  {jogador.nome}
                </h2>
                <div className="text-xs font-bold text-white/60 flex items-center gap-1.5 mt-1">
                  <span className="text-fifa-gold">R${Number(jogador.preco || 0).toFixed(1)}M</span>
                  <span>•</span>
                  <span>{posicaoExtenso}</span>
                </div>
              </div>

              <div className="p-4 flex flex-col gap-5 bg-[#18202b]">
                <div className="grid grid-cols-4 gap-2 bg-[#11161d] rounded-lg p-3 border border-white/5">
                  {[
                    { label: 'PTS/Partida', value: ptsPartida },
                    { label: 'Forma', value: forma },
                    { label: 'Sel %', value: `${selPorcentagem}%` },
                    { label: 'Total', value: total },
                  ].map((item, idx) => (
                    <div
                      key={item.label}
                      className={`flex flex-col items-center justify-center ${idx < 3 ? 'border-r border-white/10 pr-2' : 'pl-2'}`}
                    >
                      <span className="text-[8px] sm:text-[9px] font-bold text-white/50 uppercase">{item.label}</span>
                      <span className="text-sm font-black text-white">
                        {carregandoStats ? '…' : item.value}
                      </span>
                      <span className="text-[7px] text-white/40 uppercase mt-1">{fonteLabel}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-[1px] flex-1 bg-white/10" />
                    <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Calendário</span>
                    <div className="h-[1px] flex-1 bg-white/10" />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {proximosJogos.map((jogo, i) => (
                      <div key={i} className="flex flex-col items-center gap-1.5 bg-[#11161d] rounded-lg p-2 border border-white/5">
                        <span className="text-[10px] font-bold text-white/50">R{i + 1}</span>
                        <div className="w-8 h-6 rounded overflow-hidden shadow-sm">
                          <img src={jogo.flag} alt={jogo.nome} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        </div>
                        <span className="text-[9px] font-bold text-white/70 truncate w-full text-center leading-tight">
                          {jogo.nome}
                        </span>
                        <div className="flex items-center gap-1 w-full">
                          <div className={`flex-1 h-1 rounded-full ${colorMapFdr[jogo.nivel] || 'bg-fifa-blue'}`} />
                          <span className={`text-[7px] font-black uppercase ${
                            jogo.nivel === 'easy' ? 'text-stat-fit' :
                            jogo.nivel === 'hard' ? 'text-stat-injured' :
                            'text-[#009CDE]'
                          }`}>
                            {jogo.nivel === 'easy' ? 'Fácil' : jogo.nivel === 'hard' ? 'Difícil' : 'Médio'}
                          </span>
                        </div>
                      </div>
                    ))}
                    {proximosJogos.length === 0 && (
                      <div className="col-span-3 text-center text-xs text-white/40 py-2">Sem agenda disponível</div>
                    )}
                  </div>
                </div>

                {proximosJogos.length > 0 && (
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-[1px] flex-1 bg-white/10" />
                      <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Próxima Partida</span>
                      <div className="h-[1px] flex-1 bg-white/10" />
                    </div>

                    <div className="flex items-center justify-between bg-[#11161d] rounded-lg p-3 border border-white/5">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-white/50 uppercase tracking-wide">Adversário</span>
                        <span className="text-[13px] font-black text-white">
                          {proximosJogos[0].nome}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-white/50 font-bold">
                          <Calendar size={10} />
                          {proximosJogos[0].data || 'A definir'}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex flex-col items-center gap-0.5">
                          <div className="w-8 h-6 rounded overflow-hidden border border-white/20 shadow-sm">
                            <img src={jogador.bandeira || ''} alt={jogador.selecao} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                          </div>
                          <span className="text-[8px] font-bold text-white/50 truncate max-w-[50px]">{jogador.selecao}</span>
                        </div>
                        <span className="text-[10px] font-black text-white/30">VS</span>
                        <div className="flex flex-col items-center gap-0.5">
                          <div className="w-8 h-6 rounded overflow-hidden border border-white/20 shadow-sm">
                            <img src={proximosJogos[0].flag || ''} alt={proximosJogos[0].nome} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                          </div>
                          <span className="text-[8px] font-bold text-white/70 truncate max-w-[50px]">{proximosJogos[0].nome}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div 
                  onClick={() => {
                    onClose();
                    navigate('/regras');
                  }}
                  className="bg-[#11161d] border border-white/10 hover:border-white/20 hover:bg-[#1a222f] transition-colors rounded-lg p-3 flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-2 text-white/70 group-hover:text-white transition-colors">
                    <Info size={14} className="text-white/50 group-hover:text-fifa-gold" />
                    <span className="text-[10px] font-bold">Aprenda como os jogadores marcam pontos</span>
                  </div>
                  <ChevronRight size={14} className="text-white/30 group-hover:text-white/70" />
                </div>
              </div>

              <div className="p-4 border-t border-white/5 flex justify-end">
                <button
                  onClick={onClose}
                  className="text-xs font-black text-[#009CDE] uppercase tracking-wider hover:text-white transition-colors px-4 py-2.5"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
