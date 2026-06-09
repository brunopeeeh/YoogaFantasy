import React, { createContext, useContext, useState, useEffect } from 'react';
import { useMediaQuery, bp } from '../hooks/useMediaQuery';
import { useMercado } from '../hooks/useMercado';

const MercadoContext = createContext(null);

export function MercadoProvider({ children }) {
  const isMobile = useMediaQuery(bp.mobile);
  const [mercadoAberto, setMercadoAberto] = useState(!isMobile);
  const [slotSelecionado, setSlotSelecionado] = useState(null);
  const [posicaoFiltrada, setPosicaoFiltrada] = useState(null);
  const [detalheJogador, setDetalheJogador] = useState(null);

  useEffect(() => {
    if (!isMobile) {
      setMercadoAberto(true);
    }
  }, [isMobile]);

  const mercado = useMercado({ posicaoFixa: posicaoFiltrada, enabled: mercadoAberto });

  const value = {
    mercado,
    isMobile,
    mercadoAberto,
    setMercadoAberto,
    slotSelecionado,
    setSlotSelecionado,
    posicaoFiltrada,
    setPosicaoFiltrada,
    detalheJogador,
    setDetalheJogador,
  };

  return (
    <MercadoContext.Provider value={value}>
      {children}
    </MercadoContext.Provider>
  );
}

export function useMercadoContext() {
  const ctx = useContext(MercadoContext);
  if (!ctx) throw new Error('useMercadoContext deve ser usado dentro de <MercadoProvider>');
  return ctx;
}
