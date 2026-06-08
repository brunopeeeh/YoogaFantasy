import { useEffect, useState } from 'react';
import { buscarJogosDaRodada } from '../services/jogosRodadaService';

export function useJogosRodada(rodadaNumero) {
  const [jogos, setJogos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ativo = true;
    setLoading(true);
    buscarJogosDaRodada(rodadaNumero)
      .then((data) => { if (ativo) setJogos(data); })
      .catch(() => { if (ativo) setJogos([]); })
      .finally(() => { if (ativo) setLoading(false); });
    return () => { ativo = false; };
  }, [rodadaNumero]);

  return { jogos, loading };
}
