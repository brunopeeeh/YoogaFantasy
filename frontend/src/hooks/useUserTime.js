import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ensureMyTime, getMyTime } from '../services/timeService';
import { getElencoByTimeId } from '../services/elencoService';
import { elencoVazio } from '../lib/diffElenco';
import { POSICAO_POR_SIGLA } from '../lib/posicoes';

// Converte a resposta crua do banco (linhas de elencos_usuarios) na forma
// { Goleiro: [j, j, ...], Defensor: [...], ... } que o componente usa.
function elencoRowsParaObjeto(rows, formacao) {
  const elenco = elencoVazio(formacao);
  let capitaoId = null;
  for (const row of rows) {
    const j = row.jogadores;
    if (!j) continue;
    const posicao = POSICAO_POR_SIGLA[j.posicao] || null;
    if (!posicao) continue;
    const slot = elenco[posicao].findIndex(s => s === null);
    if (slot === -1) continue;
    elenco[posicao][slot] = {
      id: j.id_sofascore,
      nome: j.nome_fantasia,
      posicao: posicao,
      preco: parseFloat(j.preco),
      status: j.status_medico,
      foto: j.foto_url,
      selecao: j.selecoes?.nome || 'Desconhecido',
      bandeira: j.selecoes?.bandeira_url,
      selecaoId: j.selecoes?.id ?? j.selecao_id,
    };
    if (row.eh_capitao) capitaoId = j.id_sofascore;
  }
  return { elenco, capitaoId };
}

export function useUserTime() {
  const { user } = useAuth();
  const [time, setTime] = useState(null);
  const [elencoSalvo, setElencoSalvo] = useState(elencoVazio());
  const [capitaoSalvoId, setCapitaoSalvoId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const t = await ensureMyTime(user.id);
      setTime(t);
      const rows = await getElencoByTimeId(t.id);
      const { elenco, capitaoId } = elencoRowsParaObjeto(rows, t.formacao);
      setElencoSalvo(elenco);
      setCapitaoSalvoId(capitaoId);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) {
      setTime(null);
      setElencoSalvo(elencoVazio());
      setCapitaoSalvoId(null);
      setLoading(false);
      return;
    }
    refetch();
  }, [user?.id, refetch]);

  const saldoAtual = time?.banco_cartoletas != null ? Number(time.banco_cartoletas) : 0;

  return {
    time,
    elencoSalvo,
    capitaoSalvoId,
    saldoAtual,
    loading,
    error,
    refetch,
  };
}
