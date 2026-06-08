import { useState, useCallback } from 'react';
import { salvarElencoRpc } from '../services/elencoService';
import { validarElencoDraft, elencoDraftParaPayloadRpc, contarTransferencias } from '../lib/diffElenco';

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
