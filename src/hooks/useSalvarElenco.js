import { useState, useCallback } from 'react';
import { salvarElencoRpc, validarElencoRpc } from '../services/elencoService';
import { elencoParaLista, validarElencoDraft, elencoDraftParaPayloadRpc, contarTransferencias } from '../lib/diffElenco';

function elencoParaPayloadValidacao(elencoDraft) {
  return elencoParaLista(elencoDraft).map(j => ({
    id: Number(j.id),
    posicao: j.posicao,
    preco: Number(j.preco || 0),
    selecao_id: j.selecaoId || j.selecao_id || null,
  }));
}

export function useSalvarElenco({ onSuccess, elencoSalvo, rodadaAtual } = {}) {
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);

  const salvar = useCallback(async ({ elencoDraft, capitaoId }) => {
    setErro(null);
    const errosValidacao = validarElencoDraft(elencoDraft, { rodada: rodadaAtual });
    if (errosValidacao.length > 0) {
      const e = new Error(errosValidacao.join('\n'));
      setErro(e);
      return { ok: false, error: e, validationErrors: errosValidacao };
    }

    if (rodadaAtual != null) {
      const payloadRpc = elencoParaPayloadValidacao(elencoDraft);
      validarElencoRpc(payloadRpc, rodadaAtual)
        .then((res) => {
          if (!res?.valido && res?.erros?.length > 0) {
            console.warn('[Validação RPC] Discrepância com validação JS:', res.erros);
          }
        })
        .catch((e) => {
          console.warn('[Validação RPC] Erro ao validar (não bloqueante):', e.message);
        });
    }

    const transferenciasUsadas = rodadaAtual != null
      ? contarTransferencias(elencoSalvo, elencoDraft)
      : 0;

    setSalvando(true);
    try {
      const payload = elencoDraftParaPayloadRpc(elencoDraft, capitaoId);
      const data = await salvarElencoRpc({ ...payload, transferenciasUsadas });
      if (onSuccess) onSuccess(data);
      return { ok: true, data };
    } catch (e) {
      setErro(e);
      return { ok: false, error: e };
    } finally {
      setSalvando(false);
    }
  }, [onSuccess, elencoSalvo, rodadaAtual]);

  return { salvar, salvando, erro };
}
