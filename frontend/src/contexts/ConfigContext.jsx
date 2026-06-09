import React, { createContext, useContext } from 'react';
import { useConfigRodada } from '../hooks/useConfigRodada';

const ConfigContext = createContext(null);

export function ConfigProvider({ children }) {
  const { config: configRodada, loading: configLoading, error: configError, refetch: refetchConfig } = useConfigRodada();

  const mercadoAbertoConfig = configRodada?.mercado_aberto !== false;
  const rodadaAtual = configRodada?.rodada_atual;

  const value = {
    configRodada,
    configLoading,
    configError,
    refetchConfig,
    mercadoAbertoConfig,
    rodadaAtual,
  };

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error('useConfig deve ser usado dentro de <ConfigProvider>');
  return ctx;
}
