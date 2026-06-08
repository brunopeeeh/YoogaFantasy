// Card de atleta exibido na lista do Mercado.
// Inclui foto, nome, clube, posição, stats (forma, preço, pontos, PR, sel%),
// e FDR dos próximos jogos.

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { makeCardId } from '../hooks/useDragDropElenco';

const labelsPosicoes = { G: 'GOL', D: 'DEF', M: 'MEI', F: 'ATA' };
const MAPA_LETRAS_POSICAO = {
  Goleiro: 'G',
  Defensor: 'D',
  MeioCampista: 'M',
  Atacante: 'F'
};

function getStatusColor(status) {
  if (!status) return 'bg-stat-fit';
  const s = String(status).toLowerCase();
  if (s.includes('les') || s.includes('cont') || s.includes('inj') || s.includes('susp')) return 'bg-stat-injured';
  if (s.includes('duv') || s.includes('doub')) return 'bg-stat-doubt';
  return 'bg-stat-fit';
}

export default function CardJogador({ jogador, onContratar, onDetalhes, elenco, slotSelecionado, draggable = true, agendaBase }) {
  const jaNoElenco = elenco
    ? Object.values(elenco).flat().some(j => j && j.id === jogador.id)
    : false;

  const mapaInverso = { G: 'Goleiro', D: 'Defensor', M: 'MeioCampista', F: 'Atacante' };
  const posicaoJogador = mapaInverso[jogador.posicao];
  const posicaoEsperada = slotSelecionado?.posicao;
  const posicaoIncompativel = posicaoEsperada ? (posicaoJogador !== posicaoEsperada) : false;

  const forma = jogador.forma ?? 0;
  const pts = jogador.pontos ?? 0;
  const selPorcentagem = jogador.sel ?? 0;
  const pr = jogador.pr ?? 0;

  // Usando os dados reais dos jogos fornecidos pelo Supabase via useJogosCopa
  const agenda = agendaBase || { proximo: 'TBD', jogos: [] };
  const fdrJogos = agenda.jogos;

  const temAlerta = jogador.status && jogador.status.toLowerCase() !== 'disponivel';

  // Drag and drop
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
    medium: 'bg-[#009CDE]', // fifa-blue
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
      {/* Coluna Esquerda: Avatar + Informações Básicas */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="relative flex-shrink-0 select-none">
          <img
            src={jogador.foto || 'https://api.sofascore.app/static/images/default-avatar.png'}
            alt={jogador.nome}
            className="w-10 h-10 rounded-full object-cover bg-fifa-navy-900 border-2 border-white/20 shadow-inner group-hover:border-fifa-blue transition-colors"
            onError={(e) => {
              e.currentTarget.src = 'https://api.sofascore.app/static/images/default-avatar.png';
            }}
            draggable={false}
          />
          {/* Bandeira (Bottom-Left) */}
          {jogador.bandeira && (
            <img
              src={jogador.bandeira}
              alt={jogador.selecao}
              className="absolute -bottom-1 -left-1 w-4.5 h-3 rounded-sm border border-fifa-navy-950 shadow-md object-cover"
              draggable={false}
            />
          )}
          {/* Letra da Posição (Bottom-Right) */}
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

      {/* Coluna Direita: Métricas Numéricas e FDR */}
      <div className="flex items-center gap-2 sm:gap-4 text-center text-[11px] font-bold text-white/80 flex-shrink-0">
        {/* FORMA */}
        <div className="hidden sm:block w-10 font-mono text-white/60">{Number(forma).toFixed(1)}</div>

        {/* PREÇO (Clickable Text em azul) */}
        <div className="w-16 flex justify-center">
          {jaNoElenco ? (
            <span className="text-white/40 text-[10px] font-extrabold select-none">
              Elenco
            </span>
          ) : posicaoIncompativel ? (
            <span className="text-white/30 text-[10px] font-extrabold select-none" title="Posição incompatível">
              Incomp.
            </span>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onContratar(jogador);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="text-[#009CDE] hover:text-[#007AB0] font-black font-mono transition-colors tracking-wide hover:underline cursor-pointer"
              title="Contratar jogador"
            >
              €{Number(jogador.preco).toFixed(1)}M
            </button>
          )}
        </div>

        {/* PTS */}
        <div className="w-8 font-mono text-white/60">{pts}</div>

        {/* P/R */}
        <div className="hidden sm:block w-8 font-mono text-white/40">{Number(pr).toFixed(1)}</div>

        {/* SEL% */}
        <div className="hidden sm:block w-12 font-mono text-white/65">{Number(selPorcentagem).toFixed(1)}%</div>

        {/* FDR Block (3 cards com bandeira e linha) */}
        <div className="hidden sm:flex w-20 gap-1 justify-end flex-shrink-0">
          {fdrJogos.map((jogo, idx) => (
            <div
              key={idx}
              className="w-5.5 h-6.5 bg-[#18202b] border border-white/10 rounded flex flex-col items-center justify-between p-[1.5px] flex-shrink-0"
              title={`Adversário: ${jogo.nome} - Dificuldade: ${jogo.nivel}`}
            >
              <img
                src={jogo.flag}
                alt={jogo.nome}
                className="w-full h-3.5 object-cover rounded-[1px]"
                draggable={false}
              />
              <div className={`w-full h-[2px] rounded-full ${colorMapFdr[jogo.nivel] || 'bg-fifa-blue'}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
