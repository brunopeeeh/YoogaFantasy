import React, { createContext, useContext, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useTokens } from '../hooks/useTokens';
import { useConfig } from './ConfigContext';

const TokensContext = createContext(null);

export function TokensProvider({ children }) {
  const { mercadoAbertoConfig } = useConfig();
  const { tokens, usando, usar, refetch: refetchTokens } = useTokens();
  const bloqueadoMercado = !mercadoAbertoConfig;

  const handleUsarToken = useCallback(async (tipo) => {
    if (bloqueadoMercado) {
      toast.error('Mercado fechado. Não é possível ativar tokens agora.');
      return { ok: false };
    }
    if (!window.confirm(`Ativar token "Capitão Triplo" nesta rodada?`)) {
      return { ok: false };
    }
    const res = await usar(tipo);
    if (res.ok) {
      toast.success('Token Capitão Triplo ativado!');
    } else {
      toast.error(res.error?.message || 'Falha ao ativar token.');
    }
    return res;
  }, [usar, bloqueadoMercado]);

  const value = {
    tokens,
    usando,
    tokenUsando: usando,
    handleUsarToken,
    refetchTokens,
  };

  return (
    <TokensContext.Provider value={value}>
      {children}
    </TokensContext.Provider>
  );
}

export function useTokensContext() {
  const ctx = useContext(TokensContext);
  if (!ctx) throw new Error('useTokensContext deve ser usado dentro de <TokensProvider>');
  return ctx;
}
