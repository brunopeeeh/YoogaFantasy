import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import { buscarJogosAgrupados } from '../../services/jogosRodadaService';
import { JogoCard } from '../shared/JogoCard';

function agruparPorGrupo(jogos) {
  const grupos = {};
  for (const jogo of jogos) {
    const chave = jogo.grupo_rodada || 'Outros';
    if (!grupos[chave]) grupos[chave] = [];
    grupos[chave].push(jogo);
  }
  return grupos;
}

function ordenarGrupos(grupos) {
  return Object.keys(grupos).sort((a, b) => {
    const na = parseInt(a.replace(/\D/g, ''), 10);
    const nb = parseInt(b.replace(/\D/g, ''), 10);
    return na - nb;
  });
}

export default function JogosScreen() {
  const navigate = useNavigate();
  const [rodadas, setRodadas] = useState({});
  const [rodadaAtiva, setRodadaAtiva] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    buscarJogosAgrupados()
      .then((data) => {
        setRodadas(data);
        const keys = Object.keys(data).sort((a, b) => Number(a) - Number(b));
        if (keys.length > 0) setRodadaAtiva(Number(keys[0]));
      })
      .catch(() => setRodadas({}))
      .finally(() => setLoading(false));
  }, []);

  const rodadasOrdenadas = Object.keys(rodadas).sort((a, b) => Number(a) - Number(b));
  const jogosAtivos = rodadas[rodadaAtiva] || [];
  const grupos = useMemo(() => agruparPorGrupo(jogosAtivos), [jogosAtivos]);
  const gruposOrdenados = useMemo(() => ordenarGrupos(grupos), [grupos]);

  return (
    <div className="flex-1 bg-fifa-blue overflow-y-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={18} className="text-white/70" />
          </button>
          <div>
            <h1 className="text-base font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Calendar size={18} className="text-white/80" />
              Jogos da Copa
            </h1>
            <p className="text-[11px] text-white/40 mt-0.5">Fase de Grupos — todas as rodadas</p>
          </div>
        </div>

        {/* Tabs — underline style */}
        <div className="flex gap-1 mb-6 border-b border-white/[0.04]">
          {rodadasOrdenadas.map((r) => {
            const ativa = Number(r) === rodadaAtiva;
            return (
              <button
                key={r}
                onClick={() => setRodadaAtiva(Number(r))}
                className={`relative px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-colors ${
                  ativa ? 'text-white' : 'text-white/40 hover:text-white/60'
                }`}
              >
                Rodada {r}
                <span className="ml-1 text-[10px] opacity-50">({rodadas[r].length})</span>
                {ativa && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-fifa-gold rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Conteúdo */}
        {loading ? (
          <div className="py-16 text-center text-xs text-white/40 animate-pulse">
            Carregando jogos...
          </div>
        ) : jogosAtivos.length === 0 ? (
          <div className="py-16 text-center text-xs text-white/40">
            Nenhum jogo encontrado para esta rodada.
          </div>
        ) : (
          <div className="space-y-6">
            {gruposOrdenados.map((grupo) => (
              <div key={grupo}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.15em]">
                    {grupo}
                  </span>
                  <span className="flex-1 h-px bg-white/[0.04]" />
                  <span className="text-[9px] text-white/20 font-mono">
                    {grupos[grupo].length} jogos
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {grupos[grupo].map((jogo) => (
                    <JogoCard key={jogo.id_sofascore} jogo={jogo} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
