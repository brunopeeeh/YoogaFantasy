import { memo } from 'react';
import { Crown, RotateCcw } from 'lucide-react';

const DESCRICAO = 'Triplica os pontos do capitão na rodada (1 por temporada).';

const COR = {
  ativo: 'from-yellow-500/30 to-amber-500/20 border-yellow-400/60 text-yellow-100',
  usado: 'from-yellow-900/40 to-amber-900/30 border-yellow-700/40 text-yellow-300/60',
  icone: 'text-yellow-300',
  botao: 'bg-yellow-500 hover:bg-yellow-400 text-black',
  botaoResgatar: 'bg-fifa-blue hover:bg-[#007AB0] text-white',
};

export const TokenCard = memo(function TokenCard({
  total, disponiveis, usando, onUsar, onResgatar, mercadoAberto, desabilitado, podeResgatar, compacto
}) {
  const todosUsados = disponiveis === 0;
  const podeResgatarAtivo = todosUsados && podeResgatar && mercadoAberto;
  const resgatando = usando === `resgatar_capitao_triplo`;

  if (compacto) {
    return (
      <div className="flex items-center gap-1.5">
        <Crown size={11} className={todosUsados ? 'text-white/30' : 'text-yellow-400'} strokeWidth={2.5} />
        <span className={`text-[10px] font-bold font-mono ${todosUsados ? 'text-white/30' : 'text-yellow-400'}`}>
          {disponiveis}/{total}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`relative flex flex-col gap-2 p-3 sm:p-3.5 rounded-xl border bg-gradient-to-br ${
        todosUsados && !podeResgatarAtivo ? COR.usado : COR.ativo
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
            <span className={`text-[10px] sm:text-[11px] font-bold ${todosUsados && !podeResgatarAtivo ? 'opacity-60' : ''}`}>
              {disponiveis}/{total}
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] leading-snug opacity-80 mt-0.5">
            {DESCRICAO}
          </p>
        </div>
      </div>

      {podeResgatarAtivo ? (
        <button
          onClick={() => onResgatar('capitao_triplo')}
          disabled={resgatando}
          className={`w-full text-[10px] sm:text-xs font-black uppercase tracking-wider py-1.5 rounded-md transition-all flex items-center justify-center gap-1.5 ${COR.botaoResgatar} active:scale-95 shadow-md`}
        >
          {resgatando ? (
            'Resgatando...'
          ) : (
            <><RotateCcw size={12} /> Resgatar Token</>
          )}
        </button>
      ) : (
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
      )}
    </div>
  );
});
