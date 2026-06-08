import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserTime } from './useUserTime';
import { listarTokensPorTime, usarToken as usarTokenService } from '../services/tokensService';

export function useTokens() {
  const { user } = useAuth();
  const { time, refetch: refetchTime } = useUserTime();
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [usando, setUsando] = useState(null);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    if (!time?.id) {
      setTokens([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const rows = await listarTokensPorTime(time.id);
      setTokens(rows);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [time?.id]);

  useEffect(() => {
    refetch();
  }, [refetch, user?.id]);

  const disponiveisPorTipo = (tipo) =>
    tokens.filter(t => t.tipo === tipo && t.disponivel).length;

  const totalPorTipo = (tipo) =>
    tokens.filter(t => t.tipo === tipo).length;

  const usadosNaRodadaPorTipo = (tipo, rodada) =>
    tokens.filter(t => t.tipo === tipo && t.rodada_usado === rodada).length;

  const usar = useCallback(async (tipo) => {
    if (usando) return { ok: false, error: new Error('Operação já em andamento') };
    setUsando(tipo);
    setError(null);
    try {
      const data = await usarTokenService(tipo);
      await refetch();
      await refetchTime();
      return { ok: true, data };
    } catch (e) {
      setError(e);
      return { ok: false, error: e };
    } finally {
      setUsando(null);
    }
  }, [usando, refetch, refetchTime]);

  return {
    tokens,
    loading,
    usando,
    error,
    refetch,
    usar,
    disponiveisPorTipo,
    totalPorTipo,
    usadosNaRodadaPorTipo,
  };
}
