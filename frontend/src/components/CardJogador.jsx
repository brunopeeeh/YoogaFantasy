import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Plus } from 'lucide-react';
import { makeCardId } from '../hooks/useDragDropElenco';
import { AVATAR_FALLBACK } from '../design/tokens';
import { POSICAO_POR_SIGLA } from '../lib/posicoes';

const MAPA_LETRAS_POSICAO = {
  Goleiro: 'G',
  Defensor: 'D',
  MeioCampista: 'M',
  Atacante: 'F'
};

export default function CardJogador({ jogador, onContratar, onDetalhes, elenco, slotSelecionado, draggable = true, agendaBase }) {
  const jaNoElenco = elenco
    ? Object.values(elenco).flat().some(j => j && j.id === jogador.id)
    : false;

  const posicaoJogador = POSICAO_POR_SIGLA[jogador.posicao] || 'Goleiro';
  const posicaoEsperada = slotSelecionado?.posicao;
  const posicaoIncompativel = posicaoEsperada
    ? (posicaoJogador !== posicaoEsperada)
    : elenco
      ? !(elenco[posicaoJogador] || []).some(j => j === null)
      : false;

  const pts = jogador.pontos ?? 0;

  const agenda = agendaBase || { proximo: 'TBD', jogos: [] };
  const fdrJogos = agenda.jogos;

  const temAlerta = jogador.status && jogador.status.toLowerCase() !== 'disponivel';

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: makeCardId(jogador.id),
    data: { jogador },
    disabled: !draggable || jaNoElenco || posicaoIncompativel,
  });

  const style = transform
    ? { transform: CSS.Translate.toString(transform), zIndex: 50 }
    : undefined;

  const colorMapFdr = {
    easy: 'bg-stat-fit',
    medium: 'bg-[#009CDE]',
    hard: 'bg-stat-injured',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onDetalhes && onDetalhes(jogador)}
      className={`flex items-center justify-between py-2 px-3 border-b border-white/5 hover:bg-white/5 transition-all group cursor-pointer active:cursor-grabbing ${
        isDragging ? 'opacity-40' : ''
      } ${posicaoIncompativel ? 'opacity-50' : ''}`}
    >
      {/* Coluna Esquerda: Avatar + Nome + Seleção */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="relative flex-shrink-0 select-none">
          <img
            src={jogador.foto || AVATAR_FALLBACK}
            alt={jogador.nome}
            className="w-10 h-10 rounded-full object-cover bg-fifa-navy-900 border-2 border-white/20 shadow-inner group-hover:border-fifa-blue transition-colors"
            onError={(e) => {
              if (e.currentTarget.src !== AVATAR_FALLBACK) e.currentTarget.src = AVATAR_FALLBACK;
            }}
            draggable={false}
          />
          {jogador.bandeira && (
            <img
              src={jogador.bandeira}
              alt={jogador.selecao}
              className="absolute -bottom-1 -left-1 w-4.5 h-3 rounded-sm border border-fifa-navy-950 shadow-md object-cover"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
              draggable={false}
            />
          )}
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white border border-fifa-navy-950 flex items-center justify-center shadow-md">
            <span className="text-[9px] font-black text-[#11161d] font-mono leading-none">
              {MAPA_LETRAS_POSICAO[posicaoJogador] || jogador.posicao}
            </span>
          </div>
        </div>

        <div className="overflow-hidden flex-1 leading-tight">
          <h4 className="text-[12px] font-bold text-gray-100 truncate flex items-center gap-1 group-hover:text-fifa-gold transition-colors">
            {jogador.nome}
            {temAlerta && (
              <span className="text-red-500 font-bold animate-pulse text-[10px] select-none" title={`Atenção: ${jogador.status}`}>
                ⚠️
              </span>
            )}
          </h4>
          <span className="text-[10px] text-white/40 font-bold tracking-wide uppercase">
            {jogador.selecao}
          </span>
        </div>
      </div>

      {/* Coluna Direita: Confrontos + Preço + Pts */}
      <div className="flex items-center gap-2 sm:gap-4 text-center text-[11px] font-bold text-white/80 flex-shrink-0">
        {/* Confrontos (sempre visível) */}
        <div className="flex gap-1 justify-end flex-shrink-0 w-auto min-w-[36px] sm:min-w-[72px]">
          {fdrJogos.slice(0, 3).map((jogo, idx) => (
            <div
              key={idx}
              className="w-5 h-6 sm:w-5.5 sm:h-6.5 bg-fifa-navy-800 border border-white/10 rounded flex flex-col items-center justify-between p-[1.5px] flex-shrink-0"
              title={`${jogo.nome} — ${jogo.nivel === 'easy' ? 'Fácil' : jogo.nivel === 'hard' ? 'Difícil' : 'Médio'}`}
            >
              <img
                src={jogo.flag}
                alt={jogo.nome}
                className="w-full h-3.5 sm:h-3.5 object-cover rounded-[1px]"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                draggable={false}
              />
              <div className={`w-full h-[2px] rounded-full ${colorMapFdr[jogo.nivel] || 'bg-fifa-blue'}`} />
            </div>
          ))}
        </div>

        {/* PREÇO + ADICIONAR */}
        <div className="flex items-center gap-1.5 justify-center min-w-[64px] sm:min-w-[84px]">
          {jaNoElenco ? (
            <span className="text-white/40 text-[10px] font-extrabold select-none">Elenco</span>
          ) : posicaoIncompativel ? (
            <span className="text-white/30 text-[10px] font-extrabold select-none" title="Sem vagas disponíveis">Incomp.</span>
          ) : (
            <>
              <span className="text-[#009CDE] font-black font-mono text-[11px] tracking-wide whitespace-nowrap">
                €{Number(jogador.preco).toFixed(1)}M
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onContratar(jogador);
                }}
                onPointerDown={(e) => e.stopPropagation()}
                className="w-5 h-5 sm:w-5 sm:h-5 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white transition-all flex-shrink-0 active:scale-90"
                title="Adicionar jogador"
                aria-label="Adicionar jogador"
              >
                <Plus size={12} strokeWidth={2.5} />
              </button>
            </>
          )}
        </div>

        {/* PTS */}
        <div className="w-8 font-mono text-white/60">{pts}</div>
      </div>
    </div>
  );
}
