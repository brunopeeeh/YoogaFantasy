// Formações táticas pré-definidas.
// Cada formação é uma lista de linhas; cada linha é um número de jogadores naquela linha.
// O total deve ser 11 (ou menos, com 4 opções de "banco" disponíveis no elenco).

export const FORMACOES = [
  { id: '1-3-5-2', label: '1-3-5-2', linhas: [1, 3, 5, 2] },
  { id: '1-4-4-2', label: '1-4-4-2', linhas: [1, 4, 4, 2] },
  { id: '1-4-3-3', label: '1-4-3-3', linhas: [1, 4, 3, 3] },
  { id: '1-5-4-1', label: '1-5-4-1', linhas: [1, 5, 4, 1] },
  { id: '1-4-5-1', label: '1-4-5-1', linhas: [1, 4, 5, 1] },
  { id: '1-3-4-3', label: '1-3-4-3', linhas: [1, 3, 4, 3] },
];

export const FORMACAO_DEFAULT = FORMACOES[0];

// Mapeia cada linha da formação a uma posição do elenco.
// linha 0 = Goleiro, linha 1 = Defensor, linha 2 = MeioCampista, linha 3 = Atacante.
export const LINHA_PARA_POSICAO = {
  0: 'Goleiro',
  1: 'Defensor',
  2: 'MeioCampista',
  3: 'Atacante',
};

export function getFormacao(id) {
  return FORMACOES.find(f => f.id === id) || FORMACAO_DEFAULT;
}

// Distribui os slots do pitch de acordo com a formação.
// Retorna array de linhas, onde cada linha é { posicao, slots: [null, null, ...] }.
export function slotsPorFormacao(formacao) {
  const f = typeof formacao === 'string' ? getFormacao(formacao) : formacao;
  return f.linhas.map((qtd, idx) => ({
    posicao: LINHA_PARA_POSICAO[idx],
    slots: Array(qtd).fill(null),
  }));
}
