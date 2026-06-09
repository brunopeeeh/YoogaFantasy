import { supabase } from './supabaseClient';

export async function buscarStatsJogador(jogadorId) {
  const fallback = {
    ptsPartida: '—',
    forma: '—',
    selPorcentagem: '—',
    total: '—',
    fonte: 'indisponivel',
  };

  try {
    const [scoutsResult, statsResult] = await Promise.all([
      supabase
        .from('scouts_atleta_rodada')
        .select('pontuacao_final_calculada, rodada')
        .eq('jogador_id', jogadorId)
        .order('rodada', { ascending: false })
        .limit(5),
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

    return {
      ptsPartida,
      forma: ultima.toFixed(1),
      selPorcentagem,
      total: total.toFixed(1),
      rodadasComDados: scoutsData.length,
      fonte: 'scouts',
    };
  } catch {
    return fallback;
  }
}
