import { useEffect, useState, useCallback } from 'react';
import { useUserTime } from './useUserTime';
import { useConfigRodada } from './useConfigRodada';
import { getMinhaPontuacaoRodada, getHistoricoPontuacao } from '../services/rodadaService';

export function usePontuacaoRodada() {
  const { time } = useUserTime();
  const { config } = useConfigRodada();
  const [ultimaRodada, setUltimaRodada] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async () => {
    if (!time?.id) return;
    setLoading(true);
    try {
      const hist = await getHistoricoPontuacao(time.id, 5);
      setHistorico(hist);
      const rodadaConsulta = config?.mercado_aberto
        ? Math.max((config?.rodada_atual ?? 1) - 1, 1)
        : (config?.rodada_atual ?? 1);
      const pts = await getMinhaPontuacaoRodada(time.id, rodadaConsulta);
      setUltimaRodada(pts);
    } catch {
      setUltimaRodada(null);
    } finally {
      setLoading(false);
    }
  }, [time?.id, config?.rodada_atual, config?.mercado_aberto]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const totalTemporada = historico.reduce((acc, r) => acc + Number(r.pontos_ganhos || 0), 0);

  return { ultimaRodada, historico, totalTemporada, loading, refetch };
}
