import { supabase } from './supabaseClient';

export async function buscarJogadoresMercado({
  posicao,
  selecaoId,
  pesquisa,
  ordemPreco = 'DESC',
  pagina = 0,
  limit = 12,
}) {
  const de = pagina * limit;
  const ate = de + limit - 1;

  let query = supabase
    .from('jogadores')
    .select('*, selecoes(nome, bandeira_url)', { count: 'exact' });

  if (posicao) query = query.eq('posicao', posicao);
  if (selecaoId) query = query.eq('selecao_id', Number(selecaoId));
  if (pesquisa && pesquisa.trim() !== '') {
    query = query.ilike('nome_completo', `%${pesquisa.trim()}%`);
  }
  const desc = ordemPreco === 'DESC';
  query = query.order('preco', { ascending: !desc });
  query = query.range(de, ate);

  const { data, error, count } = await query;
  if (error) throw error;

  const dadosFormatados = (data || []).map(atleta => ({
    id: atleta.id_sofascore,
    nome: atleta.nome_fantasia,
    posicao: atleta.posicao,
    preco: parseFloat(atleta.preco),
    status: atleta.status_medico,
    foto: atleta.foto_url,
    selecao: atleta.selecoes?.nome || 'Desconhecido',
    bandeira: atleta.selecoes?.bandeira_url,
    selecaoId: atleta.selecao_id,
  }));

  // Buscar estatísticas reais em lote
  if (dadosFormatados.length > 0) {
    try {
      const ids = dadosFormatados.map(j => j.id);
      const { data: stats } = await supabase.rpc('estatisticas_jogadores', { p_jogador_ids: ids });
      if (stats) {
        const statsMap = {};
        for (const s of stats) {
          statsMap[s.jogador_id] = s;
        }
        for (const j of dadosFormatados) {
          const s = statsMap[j.id];
          if (s) {
            j.pontos = s.total_pontos;
            j.forma = s.ultima_pontuacao;
            j.media = s.media_pontos;
            j.sel = s.sel_porcentagem;
            j.pr = j.preco > 0 ? Number((s.total_pontos / j.preco).toFixed(1)) : 0;
          }
        }
      }
    } catch (e) {
      console.warn('Erro ao buscar estatísticas:', e.message);
    }
  }

  return { dados: dadosFormatados, total: count ?? 0 };
}
