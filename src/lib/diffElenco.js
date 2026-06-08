import { ELENCO_LIMITE, ORCAMENTO_MAXIMO, MAX_POR_SELECAO, getLimitesFase } from './posicoes';

export function elencoVazio() {
  return {
    Goleiro: Array(ELENCO_LIMITE.Goleiro).fill(null),
    Defensor: Array(ELENCO_LIMITE.Defensor).fill(null),
    MeioCampista: Array(ELENCO_LIMITE.MeioCampista).fill(null),
    Atacante: Array(ELENCO_LIMITE.Atacante).fill(null),
  };
}

export function clonarElenco(elenco) {
  if (!elenco) return elencoVazio();
  const clone = {};
  for (const [posicao, slots] of Object.entries(elenco)) {
    clone[posicao] = slots.map((j) => (j ? { ...j } : null));
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

export function validarElencoDraft(elencoDraft, { rodada } = {}) {
  const limites = rodada != null ? getLimitesFase(rodada) : null;
  const maxPorSel = limites?.maxPorSelecao ?? MAX_POR_SELECAO;
  const orcamentoMax = limites?.orcamentoMaximo ?? ORCAMENTO_MAXIMO;

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

  for (const [pos, qtd] of Object.entries(ELENCO_LIMITE)) {
    if (qtd === 0) continue;
    if ((contagemPorPos[pos] || 0) > qtd) {
      erros.push(`Limite de ${qtd} ${pos} excedido (${contagemPorPos[pos]}).`);
    }
  }
  for (const [sel, qtd] of Object.entries(contagemPorSel)) {
    if (qtd > maxPorSel) {
      erros.push(`Limite de ${maxPorSel} jogadores por seleção excedido para a seleção ${sel} (${qtd}).`);
    }
  }
  if (calcularCusto(elencoDraft) > orcamentoMax) {
    erros.push(`Orçamento estourado: €${calcularCusto(elencoDraft).toFixed(1)}M (máx €${orcamentoMax.toFixed(1)}M).`);
  }
  return erros;
}

export function elencoDraftParaPayloadRpc(elencoDraft, capitaoId) {
  const lista = elencoParaLista(elencoDraft).map((j) => ({
    id: Number(j.id),
    eh_capitao: Number(j.id) === Number(capitaoId),
  }));
  return {
    jogadores: lista,
    orcamentoGasto: calcularCusto(elencoDraft),
  };
}
