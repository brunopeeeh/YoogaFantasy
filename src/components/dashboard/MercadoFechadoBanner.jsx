function formatarDataHora(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function MercadoFechadoBanner({ config }) {
  if (!config) return null;
  if (config.mercado_aberto !== false) return null;

  const rodada = config.rodada_atual ?? '?';
  const deadline = config.deadline;

  return (
    <div className="w-full bg-gradient-to-r from-red-700 via-red-600 to-red-700 border-b-2 border-red-800 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3 text-white">
        <span className="text-2xl select-none">🔒</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black uppercase tracking-wider leading-tight">
            Mercado fechado — Rodada {rodada}
          </p>
          <p className="text-[11px] text-red-100 leading-tight">
            {deadline
              ? `Reabre em ${formatarDataHora(deadline)}`
              : 'Aguarde a próxima rodada para fazer alterações.'}
          </p>
        </div>
        <div className="hidden sm:flex flex-col items-end leading-none">
          <span className="text-[9px] uppercase font-bold tracking-wider text-red-200">Status</span>
          <span className="text-[11px] font-black uppercase tracking-wider">Travado</span>
        </div>
      </div>
    </div>
  );
}
