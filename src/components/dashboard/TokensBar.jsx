import { memo } from 'react';
import { Crown } from 'lucide-react';

const DESCRICAO = 'Triplica os pontos do capitão na rodada (1 por temporada).';

const COR = {
  ativo: 'from-yellow-500/30 to-amber-500/20 border-yellow-400/60 text-yellow-100',
  usado: 'from-yellow-900/40 to-amber-900/30 border-yellow-700/40 text-yellow-300/60',
  icone: 'text-yellow-300',
  botao: 'bg-yellow-500 hover:bg-yellow-400 text-black',
};

function TokenCard({ total, disponiveis, usando, onUsar, desabilitado }) {
  const todosUsados = disponiveis === 0;

  return (
    <div
      className={`relative flex flex-col gap-2 p-3 sm:p-3.5 rounded-xl border bg-gradient-to-br ${
        todosUsados ? COR.usado : COR.ativo
      } transition-all`}
    >
      <div className="flex items-start gap-2.5">
        <div className={`shrink-0 p-1.5 rounded-lg bg-black/30 ${todosUsados ? '' : 'shadow-inner'}`}>
          <Crown className={`w-5 h-5 ${COR.icone}`} strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-[12px] sm:text-[13px] font-black uppercase tracking-wider leading-tight truncate">
              Capitão Triplo
            </h3>
            <span className={`text-[10px] sm:text-[11px] font-bold ${todosUsados ? 'opacity-60' : ''}`}>
              {disponiveis}/{total}
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] leading-snug opacity-80 mt-0.5">
            {DESCRICAO}
          </p>
        </div>
      </div>

      <button
        onClick={() => onUsar('capitao_triplo')}
        disabled={todosUsados || usando === 'capitao_triplo' || desabilitado}
        className={`w-full text-[10px] sm:text-xs font-black uppercase tracking-wider py-1.5 rounded-md transition-all ${
          todosUsados
            ? 'bg-black/30 text-white/40 cursor-not-allowed'
            : `${COR.botao} active:scale-95 shadow-md`
        }`}
      >
        {usando === 'capitao_triplo'
          ? 'Ativando...'
          : todosUsados
            ? '✓ Usado'
            : 'Usar Token'}
      </button>
    </div>
  );
}

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
