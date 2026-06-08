import { useEffect, useState, useCallback } from 'react';
import { getConfigRodada } from '../services/configService';

const POLLING_MS = 60_000; // 1 min

export function useConfigRodada() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchConfig = useCallback(async () => {
    try {
      const data = await getConfigRodada();
      setConfig(data);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
    const id = setInterval(fetchConfig, POLLING_MS);
    return () => clearInterval(id);
  }, [fetchConfig]);

  return { config, loading, error, refetch: fetchConfig };
}
