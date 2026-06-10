import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useUserTime } from '../hooks/useUserTime';
import { useSalvarElenco } from '../hooks/useSalvarElenco';
import { useConfig } from './ConfigContext';
import { useMercadoContext } from './MercadoContext';
import { useTokensContext } from './TokensContext';
import {
  elencoVazio,
  elencoParaLista,
  calcularCusto,
  temMudancas,
  validarElencoDraft,
  clonarElenco,
  contarTransferencias,
} from '../lib/diffElenco';
import { ORCAMENTO_MAXIMO, getLimitesFase, POSICAO_POR_SIGLA, FORMACAO_PADRAO, FORMACOES_LISTA, FORMACOES, criarElencoVazio, getLimitesPorFormacao, POSICOES } from '../lib/posicoes';

const ElencoContext = createContext(null);

export function ElencoProvider({ children }) {
  const { rodadaAtual, mercadoAbertoConfig } = useConfig();
  const { slotSelecionado, setSlotSelecionado, setMercadoAberto, isMobile } = useMercadoContext();
  const { refetchTokens } = useTokensContext();

  const {
    time,
    elencoSalvo,
    capitaoSalvoId,
    loading: timeLoading,
    error: timeError,
    refetch,
  } = useUserTime();

  const mercadoAbertoConfigValue = mercadoAbertoConfig;
  const bloqueadoMercado = !mercadoAbertoConfigValue;

  const [formacaoDraft, setFormacaoDraft] = useState(FORMACAO_PADRAO);
  const [elencoDraft, setElencoDraft] = useState(criarElencoVazio(FORMACAO_PADRAO));
  const [capitaoDraftId, setCapitaoDraftId] = useState(null);
  const [draftInicializado, setDraftInicializado] = useState(false);
  const [saveModalAberto, setSaveModalAberto] = useState(false);

  useEffect(() => {
    if (!timeLoading && !draftInicializado) {
      const formInicial = time?.formacao || FORMACAO_PADRAO;
      setFormacaoDraft(formInicial);
      setElencoDraft(clonarElenco(elencoSalvo || criarElencoVazio(formInicial)));
      setCapitaoDraftId(capitaoSalvoId || null);
      setDraftInicializado(true);
    }
  }, [timeLoading, elencoSalvo, capitaoSalvoId, draftInicializado]);

  const { salvar, salvando } = useSalvarElenco({
    elencoSalvo,
    rodadaAtual,
    onSuccess: async () => {
      toast.success('Escalação salva com sucesso!');
      await refetch();
      await refetchTokens();
      setDraftInicializado(false);
    },
  });

  const isMobileRef = isMobile;

  const handleContratarJogador = useCallback((jogador, slotOverride = null) => {
    if (bloqueadoMercado) {
      toast.error('Mercado fechado. Aguarde a próxima rodada.');
      return;
    }

    let slot = slotOverride || slotSelecionado;

    if (slot && !slotOverride && elencoDraft[slot.posicao]?.[slot.index] !== null) {
      slot = null;
    }

    if (!slot) {
      const posicaoNome = POSICAO_POR_SIGLA[jogador.posicao];
      if (!posicaoNome || !elencoDraft[posicaoNome]) {
        toast.error('Posição inválida!');
        return;
      }
      const vagaIndex = elencoDraft[posicaoNome].findIndex(j => j === null);
      if (vagaIndex === -1) {
        toast.error(`Não há vagas disponíveis!`);
        return;
      }
      slot = { posicao: posicaoNome, index: vagaIndex };
    }
    if (elencoParaLista(elencoDraft).some((j) => Number(j.id) === Number(jogador.id))) {
      toast.error('Jogador já está no elenco!');
      return;
    }

    const custoAtual = calcularCusto(elencoDraft);
    if (custoAtual + Number(jogador.preco) > ORCAMENTO_MAXIMO) {
      toast.error('Orçamento insuficiente!');
      return;
    }

    const updated = clonarElenco(elencoDraft);
    updated[slot.posicao][slot.index] = {
      id: jogador.id,
      nome: jogador.nome,
      posicao: slot.posicao,
      preco: Number(jogador.preco),
      status: jogador.status,
      foto: jogador.foto,
      selecao: jogador.selecao,
      bandeira: jogador.bandeira,
      selecaoId: jogador.selecaoId,
    };
    setElencoDraft(updated);
    toast.success(`${jogador.nome} escalado!`);

    if (!slotOverride && slotSelecionado && isMobile) {
      setMercadoAberto(false);
      setSlotSelecionado(null);
    }
  }, [elencoDraft, slotSelecionado, bloqueadoMercado, isMobile, setMercadoAberto, setSlotSelecionado]);

  const handleRemoverJogador = useCallback((posicaoCampo, index) => {
    if (bloqueadoMercado) {
      toast.error('Mercado fechado. Aguarde a próxima rodada.');
      return;
    }
    const jogador = elencoDraft[posicaoCampo][index];
    if (!jogador) return;
    const updated = clonarElenco(elencoDraft);
    updated[posicaoCampo][index] = null;
    setElencoDraft(updated);
    if (capitaoDraftId === jogador.id) setCapitaoDraftId(null);
    toast(`${jogador.nome} removido`, { icon: '👋' });
  }, [elencoDraft, capitaoDraftId, bloqueadoMercado]);

  const handleDefinirCapitao = useCallback((jogadorId) => {
    if (bloqueadoMercado) {
      toast.error('Mercado fechado. Aguarde a próxima rodada.');
      return;
    }
    setCapitaoDraftId(prev => {
      if (prev === jogadorId) {
        toast('Capitão removido', { icon: '👑' });
        return null;
      }
      const j = elencoParaLista(elencoDraft).find(x => x.id === jogadorId);
      if (j) toast.success(`${j.nome} é o capitão!`);
      return jogadorId;
    });
  }, [elencoDraft, bloqueadoMercado]);

  const handleTrocarFormacao = useCallback((novaFormacao) => {
    if (bloqueadoMercado) {
      toast.error('Mercado fechado. Aguarde a próxima rodada.');
      return;
    }
    if (novaFormacao === formacaoDraft) return;

    const novosLimites = getLimitesPorFormacao(novaFormacao);
    const novoElenco = criarElencoVazio(novaFormacao);

    for (const pos of POSICOES) {
      const slotsDisponiveis = novosLimites[pos];
      let idx = 0;
      for (const jogador of elencoDraft[pos]) {
        if (jogador && idx < slotsDisponiveis) {
          novoElenco[pos][idx] = jogador;
          idx++;
        }
      }
    }

    const perdidos = 15 - elencoParaLista(novoElenco).length;
    setElencoDraft(novoElenco);
    setFormacaoDraft(novaFormacao);
    if (capitaoDraftId && !elencoParaLista(novoElenco).some(j => Number(j.id) === Number(capitaoDraftId))) {
      setCapitaoDraftId(null);
    }

  }, [formacaoDraft, elencoDraft, capitaoDraftId, bloqueadoMercado]);

  const handleLimparElenco = useCallback(() => {
    if (bloqueadoMercado) {
      toast.error('Mercado fechado. Aguarde a próxima rodada.');
      return;
    }
    if (!window.confirm('⚠️ Deseja realmente remover todos os jogadores do rascunho?')) return;
    setElencoDraft(criarElencoVazio(formacaoDraft));
    setCapitaoDraftId(null);
    toast('Elenco limpo', { icon: '🧹' });
  }, [bloqueadoMercado, formacaoDraft]);

  const handleDescartar = useCallback(() => {
    setElencoDraft(clonarElenco(elencoSalvo || criarElencoVazio(formacaoDraft)));
    setCapitaoDraftId(capitaoSalvoId);
    toast('Mudanças descartadas', { icon: '↩️' });
  }, [elencoSalvo, capitaoSalvoId, formacaoDraft]);

  const listaSelecionados = useMemo(() => elencoParaLista(elencoDraft), [elencoDraft]);
  const totalSelecionados = listaSelecionados.length;
  const custoDraft = useMemo(() => calcularCusto(elencoDraft), [elencoDraft]);
  const saldoDraft = ORCAMENTO_MAXIMO - custoDraft;
  const dirty = temMudancas(elencoSalvo || criarElencoVazio(formacaoDraft), elencoDraft, capitaoSalvoId, capitaoDraftId);
  const mensagensValidacao = useMemo(() => validarElencoDraft(elencoDraft, { rodada: rodadaAtual, formacao: formacaoDraft }), [elencoDraft, rodadaAtual, formacaoDraft]);
  const podeSalvar = mensagensValidacao.length === 0 && !bloqueadoMercado;

  const handleSalvar = useCallback(async () => {
    if (salvando) return;
    if (bloqueadoMercado) {
      toast.error('Mercado fechado. Aguarde a próxima rodada.');
      return;
    }
    if (mensagensValidacao.length > 0) {
      toast.error(mensagensValidacao[0]);
      return;
    }
    setSaveModalAberto(true);
  }, [salvando, bloqueadoMercado, podeSalvar, dirty, mensagensValidacao]);

  const confirmarSalvar = useCallback(async () => {
    if (salvando) return;

    const res = await salvar({
      elencoDraft,
      capitaoId: capitaoDraftId,
      formacao: formacaoDraft,
    });

    if (!res.ok) {
      toast.error(res.error?.message || 'Falha ao salvar.');
    } else {
      setSaveModalAberto(false);
    }
  }, [salvando, elencoDraft, capitaoDraftId, salvar]);

  const fecharModalSalvar = useCallback(() => {
    if (!salvando) setSaveModalAberto(false);
  }, [salvando]);

  const limitesFase = useMemo(() => getLimitesFase(rodadaAtual), [rodadaAtual]);
  const transferenciasNoDraft = useMemo(
    () => rodadaAtual != null ? contarTransferencias(elencoSalvo, elencoDraft) : 0,
    [rodadaAtual, elencoSalvo, elencoDraft]
  );

  const value = {
    time,
    timeLoading,
    timeError,
    refetch,
    elencoSalvo,
    capitaoSalvoId,
    elencoDraft,
    capitaoDraftId,
    draftInicializado,
    formacaoDraft,
    listaSelecionados,
    totalSelecionados,
    custoDraft,
    saldoDraft,
    dirty,
    mensagensValidacao,
    salvando,
    podeSalvar,
    saveModalAberto,
    limitesFase,
    transferenciasNoDraft,
    handleContratarJogador,
    handleRemoverJogador,
    handleDefinirCapitao,
    handleLimparElenco,
    handleDescartar,
    handleTrocarFormacao,
    handleSalvar,
    confirmarSalvar,
    fecharModalSalvar,
  };

  return (
    <ElencoContext.Provider value={value}>
      {children}
    </ElencoContext.Provider>
  );
}

export function useElenco() {
  const ctx = useContext(ElencoContext);
  if (!ctx) throw new Error('useElenco deve ser usado dentro de <ElencoProvider>');
  return ctx;
}
