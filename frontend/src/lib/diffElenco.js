import { ORCAMENTO_MAXIMO, MAX_POR_SELECAO, getLimitesFase, criarElencoVazio, getLimitesPorFormacao, getQtdTitular, FORMACAO_PADRAO } from './posicoes';

export { criarElencoVazio as elencoVazio };

export function clonarElenco(elenco, formacao) {
  if (!elenco) return criarElencoVazio(formacao || FORMACAO_PADRAO);
  const limites = formacao ? getLimitesPorFormacao(formacao) : null;
  const clone = {};
  for (const [posicao, slots] of Object.entries(elenco)) {
    const targetLength = limites ? limites[posicao] : slots.length;
    clone[posicao] = Array(targetLength).fill(null);
    for (let i = 0; i < targetLength; i++) {
      if (slots[i]) {
        clone[posicao][i] = { ...slots[i] };
      }
    }
  }
  return clone;
}

export function elencoParaLista(elenco) {
  if (!elenco) return [];
  return Object.entries(elenco).flatMap(([posicao, lista]) =>
    lista.filter(Boolean).map(j => ({ ...j, posicao }))
  );
}

export function calcularCusto(elenco) {
  return elencoParaLista(elenco).reduce((acc, j) => acc + Number(j.preco || 0), 0);
}

export function temMudancas(elencoSalvo, elencoDraft, capitaoSalvoId, capitaoDraftId) {
  const normId = (id) => (id == null ? null : Number(id));
  const listaSalva = elencoParaLista(elencoSalvo).map((j) => normId(j.id)).sort((a, b) => a - b);
  const listaDraft = elencoParaLista(elencoDraft).map((j) => normId(j.id)).sort((a, b) => a - b);
  if (listaSalva.length !== listaDraft.length) return true;
  for (let i = 0; i < listaSalva.length; i++) {
    if (listaSalva[i] !== listaDraft[i]) return true;
  }
  return normId(capitaoSalvoId) !== normId(capitaoDraftId);
}

export function contarTransferencias(elencoSalvo, elencoDraft) {
  const savedIds = elencoParaLista(elencoSalvo).map(j => Number(j.id));
  const draftIds = elencoParaLista(elencoDraft).map(j => Number(j.id));

  if (savedIds.length === 0) return 0;

  const savedSet = new Set(savedIds);
  const draftSet = new Set(draftIds);

  const removidos = savedIds.filter(id => !draftSet.has(id));
  const adicionados = draftIds.filter(id => !savedSet.has(id));

  return Math.max(removidos.length, adicionados.length);
}

export function extrairTitulares(elenco, formacao) {
  const titulares = {};
  for (const pos of Object.keys(elenco)) {
    const qtd = getQtdTitular(formacao, pos);
    titulares[pos] = elenco[pos].slice(0, qtd);
  }
  return titulares;
}

export function extrairReservas(elenco, formacao) {
  const reservas = {};
  for (const pos of Object.keys(elenco)) {
    const qtd = getQtdTitular(formacao, pos);
    reservas[pos] = elenco[pos].slice(qtd);
  }
  return reservas;
}

export function validarElencoDraft(elencoDraft, { rodada, formacao } = {}) {
  const limites = rodada != null ? getLimitesFase(rodada) : null;
  const maxPorSel = limites?.maxPorSelecao ?? MAX_POR_SELECAO;
  const orcamentoMax = limites?.orcamentoMaximo ?? ORCAMENTO_MAXIMO;
  const limitesPos = getLimitesPorFormacao(formacao || FORMACAO_PADRAO);

  const erros = [];
  const contagemPorPos = { Goleiro: 0, Defensor: 0, MeioCampista: 0, Atacante: 0 };
  const contagemPorSel = {};

  for (const j of elencoParaLista(elencoDraft)) {
    contagemPorPos[j.posicao] = (contagemPorPos[j.posicao] || 0) + 1;
    const sel = j.selecaoId ?? j.selecao_id ?? j.selecao;
    if (sel !== undefined && sel !== null) {
      const key = String(sel);
      contagemPorSel[key] = (contagemPorSel[key] || 0) + 1;
    }
  }

  const total = Object.values(contagemPorPos).reduce((a, b) => a + b, 0);
  // Removido erro bloqueante de 15 jogadores a pedido do usuário
  // O aviso será exibido no modal de confirmação.

  for (const [pos, qtd] of Object.entries(limitesPos)) {
    const atual = contagemPorPos[pos] || 0;
    if (atual > qtd) {
      erros.push(`Limite de ${qtd} ${pos} excedido (${atual}).`);
    }
  }

  for (const [sel, qtd] of Object.entries(contagemPorSel)) {
    if (qtd > maxPorSel) {
      erros.push(`Limite de ${maxPorSel} jogadores por seleção excedido para a seleção ${sel} (${qtd}).`);
    }
  }
  if (calcularCusto(elencoDraft) > orcamentoMax) {
    erros.push(`Orçamento estourado: R$${calcularCusto(elencoDraft).toFixed(1)}M (máx R$${orcamentoMax.toFixed(1)}M).`);
  }
  return erros;
}

export function elencoDraftParaPayloadRpc(elencoDraft, capitaoId, formacao) {
  const lista = elencoParaLista(elencoDraft).map((j) => ({
    id: Number(j.id),
    eh_capitao: Number(j.id) === Number(capitaoId),
    eh_titular: false, // será preenchido pelo backend ou por lógica extra
  }));
  return {
    jogadores: lista,
    orcamentoGasto: calcularCusto(elencoDraft),
    formacao: formacao || FORMACAO_PADRAO,
  };
}
