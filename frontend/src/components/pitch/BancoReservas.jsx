import PlayerChip, { EmptySlot } from './PlayerChip';
import { POSICAO_LABEL, SIGLA_POR_POSICAO } from '../../lib/posicoes';

export default function BancoReservas({
  reservas,
  onSlotClick,
  onRemoverJogador,
  onDetalhes,
}) {
  const posicoes = ['Goleiro', 'Defensor', 'MeioCampista', 'Atacante'];

  return (
    <div className="w-full min-h-[95px] flex-shrink-0 px-2 sm:px-3 py-1.5">
      <div className="text-[8px] font-bold text-white/30 uppercase tracking-widest mb-1 text-center">
        Banco
      </div>
        <div className="flex items-center justify-center gap-2 sm:gap-3">
        {posicoes.map((pos) => {
          const jogador = reservas[pos]?.[0] || null;
          const sigla = SIGLA_POR_POSICAO[pos];
          return (
            <div key={pos} className="flex flex-col items-center gap-1">
              {jogador ? (
                <div className="relative">
                  <PlayerChip
                    jogador={jogador}
                    size="sm"
                    compact={false}
                    onClick={() => onDetalhes?.(jogador)}
                    onRemove={() => onRemoverJogador(pos, null)}
                  />
                </div>
              ) : (
                <EmptySlot
                  compact
                  posLabel={POSICAO_LABEL[pos]}
                  onClick={() => onSlotClick(pos, null)}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
