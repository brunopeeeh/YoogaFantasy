import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useUserTime } from '../hooks/useUserTime';
import { useSalvarElenco } from '../hooks/useSalvarElenco';
import { useMediaQuery, bp } from '../hooks/useMediaQuery';
import { useMercado } from '../hooks/useMercado';
import { useConfigRodada } from '../hooks/useConfigRodada';
import { useTokens } from '../hooks/useTokens';
import {
  elencoVazio,
  elencoParaLista,
  calcularCusto,
  temMudancas,
  validarElencoDraft,
  clonarElenco,
  contarTransferencias,
} from '../lib/diffElenco';
import { ORCAMENTO_MAXIMO, getLimitesFase } from '../lib/posicoes';

const FantasyContext = createContext();

export function FantasyProvider({ children }) {
  const {
    time,
    elencoSalvo,
    capitaoSalvoId,
    loading: timeLoading,
    error: timeError,
    refetch,
  } = useUserTime();

  const { config: configRodada } = useConfigRodada();
  const { tokens, usando: tokenUsando, usar: usarToken, refetch: refetchTokens } = useTokens();

  const mercadoAbertoConfig = configRodada?.mercado_aberto !== false;

  const [elencoDraft, setElencoDraft] = useState(elencoVazio());
  const [capitaoDraftId, setCapitaoDraftId] = useState(null);
  const [draftInicializado, setDraftInicializado] = useState(false);

  useEffect(() => {
    if (!timeLoading && !draftInicializado) {
      setElencoDraft(clonarElenco(elencoSalvo || elencoVazio()));
      setCapitaoDraftId(capitaoSalvoId || null);
      setDraftInicializado(true);
    }
  }, [timeLoading, elencoSalvo, capitaoSalvoId, draftInicializado]);

  const isMobile = useMediaQuery(bp.mobile);
  const [mercadoAberto, setMercadoAberto] = useState(!isMobile);
  const [slotSelecionado, setSlotSelecionado] = useState(null);
  const [posicaoFiltrada, setPosicaoFiltrada] = useState(null);
  const [detalheJogador, setDetalheJogador] = useState(null);
  const [saveModalAberto, setSaveModalAberto] = useState(false);

  useEffect(() => {
    if (!isMobile) {
      setMercadoAberto(true);
    }
  }, [isMobile]);

  const mercado = useMercado({ posicaoFixa: posicaoFiltrada, enabled: mercadoAberto });

  const rodadaAtual = configRodada?.rodada_atual;

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

  const bloqueadoMercado = !mercadoAbertoConfig;

  const handleContratarJogador = useCallback((jogador, slotOverride = null) => {
    if (bloqueadoMercado) {
      toast.error('Mercado fechado. Aguarde a próxima rodada.');
      return;
    }
    const slot = slotOverride || slotSelecionado;
    if (!slot) return;
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

    if (!slotOverride && isMobile) {
      setMercadoAberto(false);
      setSlotSelecionado(null);
    }
  }, [elencoDraft, slotSelecionado, isMobile, bloqueadoMercado]);

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

  const handleLimparElenco = useCallback(() => {
    if (bloqueadoMercado) {
      toast.error('Mercado fechado. Aguarde a próxima rodada.');
      return;
    }
    if (!window.confirm('⚠️ Deseja realmente remover todos os jogadores do rascunho?')) return;
    setElencoDraft(elencoVazio());
    setCapitaoDraftId(null);
    toast('Elenco limpo', { icon: '🧹' });
  }, [bloqueadoMercado]);

  const handleDescartar = useCallback(() => {
    setElencoDraft(clonarElenco(elencoSalvo || elencoVazio()));
    setCapitaoDraftId(capitaoSalvoId);
    toast('Mudanças descartadas', { icon: '↩️' });
  }, [elencoSalvo, capitaoSalvoId]);

  const handleUsarToken = useCallback(async (tipo) => {
    if (bloqueadoMercado) {
      toast.error('Mercado fechado. Não é possível ativar tokens agora.');
      return { ok: false };
    }
    if (!window.confirm(`Ativar token "Capitão Triplo" nesta rodada?`)) {
      return { ok: false };
    }
    const res = await usarToken(tipo);
    if (res.ok) {
      toast.success('Token Capitão Triplo ativado!');
    } else {
      toast.error(res.error?.message || 'Falha ao ativar token.');
    }
    return res;
  }, [usarToken, bloqueadoMercado]);

  const listaSelecionados = useMemo(() => elencoParaLista(elencoDraft), [elencoDraft]);
  const totalSelecionados = listaSelecionados.length;
  const custoDraft = useMemo(() => calcularCusto(elencoDraft), [elencoDraft]);
  const saldoDraft = ORCAMENTO_MAXIMO - custoDraft;
  const dirty = temMudancas(elencoSalvo || elencoVazio(), elencoDraft, capitaoSalvoId, capitaoDraftId);
  const mensagensValidacao = useMemo(() => validarElencoDraft(elencoDraft, { rodada: rodadaAtual }), [elencoDraft, rodadaAtual]);
  const podeSalvar = dirty && mensagensValidacao.length === 0 && !bloqueadoMercado;

  const handleSalvar = useCallback(async () => {
    if (salvando) return;
    if (bloqueadoMercado) {
      toast.error('Mercado fechado. Aguarde a próxima rodada.');
      return;
    }
    if (!podeSalvar) {
      if (!dirty) {
        toast.error('Nenhuma alteração para salvar.');
        return;
      }
      if (mensagensValidacao.length > 0) {
        toast.error(mensagensValidacao[0]);
      }
      return;
    }
    setSaveModalAberto(true);
  }, [salvando, bloqueadoMercado, podeSalvar, dirty, mensagensValidacao]);

  const confirmarSalvar = useCallback(async () => {
    if (salvando) return;

    const res = await salvar({
      elencoDraft,
      capitaoId: capitaoDraftId,
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
    mercado,
    configRodada,
    mercadoAbertoConfig,
    tokens,
    tokenUsando,
    handleUsarToken,
    elencoSalvo,
    elencoDraft,
    capitaoDraftId,
    draftInicializado,
    mercadoAberto,
    setMercadoAberto,
    slotSelecionado,
    setSlotSelecionado,
    posicaoFiltrada,
    setPosicaoFiltrada,
    detalheJogador,
    setDetalheJogador,
    handleContratarJogador,
    handleRemoverJogador,
    handleDefinirCapitao,
    handleLimparElenco,
    handleDescartar,
    handleSalvar,
    confirmarSalvar,
    saveModalAberto,
    fecharModalSalvar,
    capitaoSalvoId,
    listaSelecionados,
    totalSelecionados,
    custoDraft,
    saldoDraft,
    dirty,
    mensagensValidacao,
    salvando,
    rodadaAtual,
    limitesFase,
    transferenciasNoDraft,
  };

  return (
    <FantasyContext.Provider value={value}>
      {children}
    </FantasyContext.Provider>
  );
}

export function useFantasy() {
  const context = useContext(FantasyContext);
  if (!context) {
    throw new Error('useFantasy deve ser usado dentro de um FantasyProvider');
  }
  return context;
}
