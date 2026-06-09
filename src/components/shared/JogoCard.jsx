import { memo } from 'react';

function siglaTime(nome) {
  if (!nome) return '???';
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].slice(0, 3).toUpperCase();
  return partes.map((p) => p[0]).join('').slice(0, 3).toUpperCase();
}

function formatarData(jogo) {
  if (!jogo.timestamp_bruto) return 'Data a definir';
  return new Date(jogo.timestamp_bruto * 1000).toLocaleString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const JogoCard = memo(function JogoCard({ jogo }) {
  const casa = jogo.time_casa;
  const fora = jogo.time_fora;

  return (
    <div className="group bg-fifa-navy-900 rounded-xl overflow-hidden border border-white/[0.04] hover:border-fifa-blue/30 transition-all duration-300">
      <div className="h-0.5 w-full bg-gradient-to-r from-fifa-blue to-fifa-gold/80" />
      <div className="p-3.5">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[10px] font-medium text-white/50 uppercase tracking-wider">
            {formatarData(jogo)}
          </span>
          {jogo.grupo_rodada && (
            <span className="text-[9px] font-bold text-fifa-blue/70 uppercase tracking-widest bg-fifa-blue/5 px-2 py-0.5 rounded-full">
              {jogo.grupo_rodada}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
            {casa?.bandeira_url ? (
              <img src={casa.bandeira_url} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-white/[0.06]" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-fifa-navy-800 flex items-center justify-center text-[10px] font-bold text-white/30">
                {siglaTime(casa?.nome)}
              </div>
            )}
            <span className="text-[11px] font-bold text-white/70 truncate max-w-full leading-tight">
              {siglaTime(casa?.nome)}
            </span>
          </div>
          <span className="text-base font-light text-white/20 flex-shrink-0 select-none">×</span>
          <div className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
            {fora?.bandeira_url ? (
              <img src={fora.bandeira_url} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-white/[0.06]" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-fifa-navy-800 flex items-center justify-center text-[10px] font-bold text-white/30">
                {siglaTime(fora?.nome)}
              </div>
            )}
            <span className="text-[11px] font-bold text-white/70 truncate max-w-full leading-tight">
              {siglaTime(fora?.nome)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});
