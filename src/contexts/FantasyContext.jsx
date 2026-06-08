import React, { createContext, useContext } from 'react';
import { ConfigProvider, useConfig } from './ConfigContext';
import { MercadoProvider, useMercadoContext } from './MercadoContext';
import { TokensProvider, useTokensContext } from './TokensContext';
import { ElencoProvider, useElenco } from './ElencoContext';

const FantasyMerged = createContext(null);

function MergeProvider({ children }) {
  const config = useConfig();
  const mercado = useMercadoContext();
  const tokens = useTokensContext();
  const elenco = useElenco();

  const value = {
    ...config,
    ...mercado,
    ...tokens,
    ...elenco,
  };

  return (
    <FantasyMerged.Provider value={value}>
      {children}
    </FantasyMerged.Provider>
  );
}

export function FantasyProvider({ children }) {
  return (
    <ConfigProvider>
      <MercadoProvider>
        <TokensProvider>
          <ElencoProvider>
            <MergeProvider>
              {children}
            </MergeProvider>
          </ElencoProvider>
        </TokensProvider>
      </MercadoProvider>
    </ConfigProvider>
  );
}

export function useFantasy() {
  const ctx = useContext(FantasyMerged);
  if (!ctx) {
    throw new Error('useFantasy deve ser usado dentro de um FantasyProvider');
  }
  return ctx;
}
