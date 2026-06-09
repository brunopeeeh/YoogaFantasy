import { FORMACOES } from '../../lib/posicoes';

export default function FormacaoSelector({ formacaoAtiva, onTrocar, desabilitado }) {
  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(FORMACOES).map(([chave, form]) => {
        const ativa = chave === formacaoAtiva;
        return (
          <button
            key={chave}
            onClick={() => onTrocar(chave)}
            disabled={desabilitado}
            className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all border ${
              ativa
                ? 'bg-fifa-gold text-fifa-navy-900 border-fifa-gold shadow-glow'
                : 'bg-fifa-navy-800/60 text-white/70 border-white/10 hover:border-white/30 hover:text-white'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
            title={form.descricao}
          >
            {form.label}
          </button>
        );
      })}
    </div>
  );
}
