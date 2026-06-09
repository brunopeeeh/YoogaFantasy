import React, { memo } from 'react';
import { useDroppable } from '@dnd-kit/core';

import PitchField from './PitchField';
import PlayerChip, { EmptySlot } from './PlayerChip';
import { POSICAO_LABEL, SIGLA_POR_POSICAO, getQtdTitular, FORMACOES } from '../../lib/posicoes';
import { makeSlotId, parseSlotId } from '../../hooks/useDragDropElenco';
import { useMediaQuery, bp } from '../../hooks/useMediaQuery';

// Droppable slot wrapper
function DroppableSlot({ posicao, index, children }) {
  const id = makeSlotId(posicao, index);
  const { isOver, active } = useDroppable({ id });
  const activeJogador = active?.data?.current?.jogador;
  const validPos = activeJogador ? isValidPosicao(jogadorPos(activeJogador), SIGLA_POR_POSICAO[posicao]) : true;

  return (
    <div className="relative">
      {React.cloneElement(children, {
        isOver: isOver && !!active,
        isInvalidDrop: isOver && !validPos,
      })}
    </div>
  );
}

function jogadorPos(j) {
  // aceita tanto sigla (G/D/M/F) quanto nome (Goleiro/Defensor/MeioCampista/Atacante)
  if (typeof j?.posicao === 'string') {
    if (j.posicao.length === 1) return j.posicao;
    return { Goleiro: 'G', Defensor: 'D', MeioCampista: 'M', Atacante: 'F' }[j.posicao] || j.posicao;
  }
  return j?.posicao;
}

function isValidPosicao(sigla, esperado) {
  return sigla === esperado;
}

export default memo(function Pitch({
  elenco,
  formacao = '4-4-2',
  onSlotClick,
  onRemoverJogador,
  capitaoId,
  onDefinirCapitao,
  overSlot = null,
  activeJogador = null,
  slotSelecionado = null,
  onFilterPosicao,
  posicaoFiltrada = null,
  onDetalhes,
}) {
  const isMobile = useMediaQuery(bp.mobile);

  // Gera linhas apenas com titulares baseados na formação
  const linhas = [
    { posicao: 'Goleiro', slots: Array(getQtdTitular(formacao, 'Goleiro')).fill(null) },
    { posicao: 'Defensor', slots: Array(getQtdTitular(formacao, 'Defensor')).fill(null) },
    { posicao: 'MeioCampista', slots: Array(getQtdTitular(formacao, 'MeioCampista')).fill(null) },
    { posicao: 'Atacante', slots: Array(getQtdTitular(formacao, 'Atacante')).fill(null) },
  ];

  return (
    <div className="w-full px-2 sm:px-4 flex flex-col gap-3 sm:gap-4 h-full">
      {/* O campo em si */}
      <div className="relative">
        <PitchField>
          {linhas.map((linha) => {
            let linhaClass = "flex items-center w-full ";
            if (linha.posicao === 'Goleiro') {
              linhaClass += "justify-center gap-8 sm:gap-32";
            } else if (linha.posicao === 'Atacante') {
              linhaClass += "justify-center gap-4 sm:gap-24";
            } else {
              linhaClass += "justify-center flex-wrap gap-x-6 gap-y-2 sm:justify-between sm:flex-nowrap sm:px-16";
            }

            return (
              <div
                key={linha.posicao}
                className={linhaClass}
                data-posicao={linha.posicao}
              >
                {linha.slots.map((_, idx) => {
                  const jogador = elenco[linha.posicao]?.[idx];
                  const slotId = makeSlotId(linha.posicao, idx);

                  return (
                    <DroppableSlot
                      key={slotId}
                      posicao={linha.posicao}
                      index={idx}
                    >
                      {jogador ? (
                        <PlayerChip
                          jogador={jogador}
                          isCaptain={jogador.id === capitaoId}
                          isActive={overSlot?.posicao === linha.posicao && overSlot?.index === idx}
                          isSelected={slotSelecionado?.posicao === linha.posicao && slotSelecionado?.index === idx}
                          onClick={() => onDetalhes && onDetalhes(jogador)}
                          onRemove={() => onRemoverJogador(linha.posicao, idx)}
                          onCaptain={() => onDefinirCapitao(jogador.id)}

                          size={isMobile ? 'sm' : 'md'}
                        />
                      ) : (
                        <EmptySlot
                          posLabel={POSICAO_LABEL[linha.posicao]}
                          isActive={overSlot?.posicao === linha.posicao && overSlot?.index === idx}
                          isSelected={slotSelecionado?.posicao === linha.posicao && slotSelecionado?.index === idx}
                          onClick={() => onSlotClick(linha.posicao, idx)}
                        />
                      )}
                    </DroppableSlot>
                  );
                })}
              </div>
            );
          })}
        </PitchField>


      </div>
    </div>
  );
});
