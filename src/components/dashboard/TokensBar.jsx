import { memo } from 'react';
import { TokenCard } from '../shared/TokenCard';

export default memo(function TokensBar({
  tokens,
  mercadoAberto,
  usando,
  onUsar,
}) {
  if (!tokens || tokens.length === 0) return null;

  const total = tokens.filter(t => t.tipo === 'capitao_triplo').length;
  const disponiveis = tokens.filter(t => t.tipo === 'capitao_triplo' && t.disponivel).length;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 lg:px-8 pt-4">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-[10px] sm:text-xs font-black uppercase tracking-[2px] text-white/80">
          Tokens Especiais
        </h2>
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-[9px] text-white/50 uppercase tracking-wider">
          Use com sabedoria
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-1 max-w-xs">
        <TokenCard
          total={total}
          disponiveis={disponiveis}
          usando={usando}
          onUsar={onUsar}
          desabilitado={!mercadoAberto}
        />
      </div>
    </div>
  );
});
