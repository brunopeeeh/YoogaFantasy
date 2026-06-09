// Mapeamentos canônicos de posição entre sigla (banco) e nome (UI/elenco)

export const POSICOES = ['Goleiro', 'Defensor', 'MeioCampista', 'Atacante'];

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

// Formações disponíveis: [defensores, meias, atacantes]
export const FORMACOES = {
  '3-4-3': { label: '3-4-3', defensores: 3, meias: 4, atacantes: 3, descricao: 'Equilibra meio e ataque' },
  '3-5-2': { label: '3-5-2', defensores: 3, meias: 5, atacantes: 2, descricao: 'Foco no meio-campo' },
  '4-3-3': { label: '4-3-3', defensores: 4, meias: 3, atacantes: 3, descricao: 'Popular, ofensivo' },
  '4-4-2': { label: '4-4-2', defensores: 4, meias: 4, atacantes: 2, descricao: 'Padrão, equilibrado' },
  '4-5-1': { label: '4-5-1', defensores: 4, meias: 5, atacantes: 1, descricao: 'Defensivo, seguro' },
  '5-3-2': { label: '5-3-2', defensores: 5, meias: 3, atacantes: 2, descricao: 'Linha forte defensiva' },
  '5-4-1': { label: '5-4-1', defensores: 5, meias: 4, atacantes: 1, descricao: 'Contenção máxima' },
};

export const FORMACOES_LISTA = Object.values(FORMACOES);

export const FORMACAO_PADRAO = '4-4-2';

// Cada posição tem 1 reserva fixo, totalizando 15 jogadores (11 titulares + 4 reservas)
export function getLimitesPorFormacao(formacao) {
  const f = FORMACOES[formacao] || FORMACOES[FORMACAO_PADRAO];
  return {
    Goleiro: 2,
    Defensor: f.defensores + 1,
    MeioCampista: f.meias + 1,
    Atacante: f.atacantes + 1,
  };
}

export function getQtdTitular(formacao, posicao) {
  if (posicao === 'Goleiro') return 1;
  const f = FORMACOES[formacao] || FORMACOES[FORMACAO_PADRAO];
  if (posicao === 'Defensor') return f.defensores;
  if (posicao === 'MeioCampista') return f.meias;
  if (posicao === 'Atacante') return f.atacantes;
  return 0;
}

export function getTotalTitulares(formacao) {
  const f = FORMACOES[formacao] || FORMACOES[FORMACAO_PADRAO];
  return 1 + f.defensores + f.meias + f.atacantes;
}

export function criarElencoVazio(formacao) {
  const limites = getLimitesPorFormacao(formacao);
  return {
    Goleiro: Array(limites.Goleiro).fill(null),
    Defensor: Array(limites.Defensor).fill(null),
    MeioCampista: Array(limites.MeioCampista).fill(null),
    Atacante: Array(limites.Atacante).fill(null),
  };
}

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
