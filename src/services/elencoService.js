import { supabase } from './supabaseClient';

export async function getElencoByTimeId(timeId) {
  if (!timeId) return [];
  const { data, error } = await supabase
    .from('elencos_usuarios')
    .select(`
      jogador_id,
      eh_capitao,
      jogadores: jogadores!inner (
        id_sofascore, nome_fantasia, nome_completo, posicao, preco, status_medico, foto_url, selecao_id,
        selecoes: selecoes ( id, nome, bandeira_url )
      )
    `)
    .eq('time_usuario_id', timeId);
  if (error) throw error;
  return data || [];
}

export async function salvarElencoRpc({ jogadores, orcamentoGasto, transferenciasUsadas = 0 }) {
  const { data, error } = await supabase.rpc('salvar_elenco', {
    p_jogadores: jogadores,
    p_orcamento_gasto: orcamentoGasto,
    p_transferencias_usadas: transferenciasUsadas,
  });
  if (error) throw error;
  return data;
}
