import { supabase } from './supabaseClient';

export async function buscarStatsJogador(jogadorId) {
  const fallback = {
    ptsPartida: '—',
    forma: '—',
    selPorcentagem: '—',
    total: '—',
    gols: 0,
    assistencias: 0,
    amarelos: 0,
    vermelhos: 0,
    minutos: 0,
    fonte: 'indisponivel',
  };

  try {
    const [scoutsResult, statsResult] = await Promise.all([
      supabase
        .from('scouts_atleta_rodada')
        .select('pontuacao_final_calculada, rodada, gols, assistencias, cartao_amarelo, cartao_vermelho, minutos_jogados')
        .eq('jogador_id', jogadorId)
        .order('rodada', { ascending: false }),
      supabase.rpc('estatisticas_jogadores', { p_jogador_ids: [jogadorId] }),
    ]);

    const scoutsError = scoutsResult.error;
    const scoutsData = scoutsResult.data;

    const selPorcentagem = statsResult?.data?.[0]?.sel_porcentagem ?? '—';

    if (scoutsError || !scoutsData?.length) {
      return { ...fallback, selPorcentagem };
    }

    const total = scoutsData.reduce((acc, row) => acc + Number(row.pontuacao_final_calculada || 0), 0);
    const ptsPartida = (total / scoutsData.length).toFixed(1);
    const ultima = Number(scoutsData[0].pontuacao_final_calculada || 0);

    // Soma das estatísticas acumuladas
    const gols = scoutsData.reduce((acc, row) => acc + Number(row.gols || 0), 0);
    const assistencias = scoutsData.reduce((acc, row) => acc + Number(row.assistencias || 0), 0);
    const amarelos = scoutsData.reduce((acc, row) => acc + Number(row.cartao_amarelo || 0), 0);
    const vermelhos = scoutsData.reduce((acc, row) => acc + Number(row.cartao_vermelho || 0), 0);
    const minutos = scoutsData.reduce((acc, row) => acc + Number(row.minutos_jogados || 0), 0);

    return {
      ptsPartida,
      forma: ultima.toFixed(1),
      selPorcentagem,
      total: total.toFixed(1),
      gols,
      assistencias,
      amarelos,
      vermelhos,
      minutos,
      rodadasComDados: scoutsData.length,
      fonte: 'scouts',
    };
  } catch {
    return fallback;
  }
}
