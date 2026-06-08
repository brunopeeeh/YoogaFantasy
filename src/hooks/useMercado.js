import { useState, useEffect, useCallback, useRef } from 'react';
import { buscarJogadoresMercado } from '../services/mercadoService';

const LIMIT = 12;
const DEBOUNCE_MS = 250;

export function useMercado({ posicaoFixa, enabled = true } = {}) {
  const [pesquisa, setPesquisa] = useState('');
  const [selecaoSelecionada, setSelecaoSelecionada] = useState('');
  const [posicaoFiltro, setPosicaoFiltro] = useState(posicaoFixa || '');
  const [ordemPreco, setOrdemPreco] = useState('DESC');
  const [pagina, setPagina] = useState(0);
  const [listaMercado, setListaMercado] = useState([]);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const controllerRef = useRef(null);

  // Sincroniza posicaoFiltro com posicaoFixa quando muda (clique em slot)
  useEffect(() => {
    if (posicaoFixa) {
      setPosicaoFiltro(posicaoFixa);
      setPagina(0);
    }
  }, [posicaoFixa]);

  // Reset paginação quando filtros mudam
  useEffect(() => {
    setPagina(0);
  }, [pesquisa, posicaoFiltro, selecaoSelecionada, ordemPreco]);

  const fetchDados = useCallback(async () => {
    if (!enabled) return;

    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    const controller = new AbortController();
    controllerRef.current = controller;

    setCarregando(true);
    setErro(null);
    try {
      const { dados, total } = await buscarJogadoresMercado({
        posicao: posicaoFiltro || undefined,
        selecaoId: selecaoSelecionada || undefined,
        pesquisa,
        ordemPreco,
        pagina,
        limit: LIMIT,
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      setListaMercado(dados);
      setTotalRegistros(total);
    } catch (e) {
      if (e.name === 'AbortError' || controller.signal.aborted) return;
      setErro(e);
    } finally {
      if (!controller.signal.aborted) {
        setCarregando(false);
      }
    }
  }, [enabled, posicaoFiltro, selecaoSelecionada, pesquisa, ordemPreco, pagina]);

  useEffect(() => {
    if (!enabled) return;
    const timer = setTimeout(fetchDados, DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [fetchDados, enabled]);

  const totalPaginas = Math.max(1, Math.ceil(totalRegistros / LIMIT));

  return {
    // Filtros
    pesquisa, setPesquisa,
    selecaoSelecionada, setSelecaoSelecionada,
    posicaoFiltro, setPosicaoFiltro,
    ordemPreco, setOrdemPreco,
    // Paginação
    pagina, setPagina,
    totalRegistros, totalPaginas,
    // Resultados
    listaMercado, carregando, erro,
    // Ações
    recarregar: fetchDados,
  };
}
