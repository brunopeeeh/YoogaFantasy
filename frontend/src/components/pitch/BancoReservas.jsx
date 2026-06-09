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
    <div className="w-full bg-fifa-navy-900/60 backdrop-blur-sm border border-white/10 rounded-xl p-4">
      <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3 text-center">
        Banco de Reservas
      </div>
      <div className="flex items-center justify-center gap-4 sm:gap-8">
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
