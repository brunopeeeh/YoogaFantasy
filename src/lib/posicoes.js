// Mapeamentos canônicos de posição entre sigla (banco) e nome (UI/elenco)

export const SIGLA_POR_POSICAO = {
  Goleiro: 'G',
  Defensor: 'D',
  MeioCampista: 'M',
  Atacante: 'F',
};

export const POSICAO_POR_SIGLA = {
  G: 'Goleiro',
  D: 'Defensor',
  M: 'MeioCampista',
  F: 'Atacante',
};

export const POSICAO_LABEL = {
  Goleiro: 'GOL',
  Defensor: 'DEF',
  MeioCampista: 'MEI',
  Atacante: 'ATA',
};

export const SIGLA_LABEL = {
  G: 'GOL',
  D: 'DEF',
  M: 'MEI',
  F: 'ATA',
};

// Limites da formação 2-5-5-3 do elenco (15 jogadores)
export const ELENCO_LIMITE = {
  Goleiro: 2,
  Defensor: 5,
  MeioCampista: 5,
  Atacante: 3,
};

export const ELENCO_SLOTS = {
  Goleiro: Array(ELENCO_LIMITE.Goleiro).fill(null),
  Defensor: Array(ELENCO_LIMITE.Defensor).fill(null),
  MeioCampista: Array(ELENCO_LIMITE.MeioCampista).fill(null),
  Atacante: Array(ELENCO_LIMITE.Atacante).fill(null),
};

export const ORCAMENTO_MAXIMO = 100.0;
export const MAX_POR_SELECAO = 3;

// Limites dinâmicos por fase (rodada)
const LIMITES_POR_RODADA = {
  0: { transferenciasGratis: 999, maxPorSelecao: 3, orcamentoMaximo: 100.0 },
  1: { transferenciasGratis: 3,   maxPorSelecao: 3, orcamentoMaximo: 100.0 },
  2: { transferenciasGratis: 3,   maxPorSelecao: 3, orcamentoMaximo: 100.0 },
  3: { transferenciasGratis: 3,   maxPorSelecao: 3, orcamentoMaximo: 100.0 },
  4: { transferenciasGratis: 999, maxPorSelecao: 3, orcamentoMaximo: 105.0 },
  5: { transferenciasGratis: 5,   maxPorSelecao: 4, orcamentoMaximo: 105.0 },
  6: { transferenciasGratis: 5,   maxPorSelecao: 5, orcamentoMaximo: 105.0 },
  7: { transferenciasGratis: 5,   maxPorSelecao: 6, orcamentoMaximo: 105.0 },
  8: { transferenciasGratis: 5,   maxPorSelecao: 7, orcamentoMaximo: 105.0 },
};

export function getLimitesFase(rodada) {
  return LIMITES_POR_RODADA[rodada] || LIMITES_POR_RODADA[1];
}
