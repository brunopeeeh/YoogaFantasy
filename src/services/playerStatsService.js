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
    const { data, error } = await supabase
      .from('scouts_atleta_rodada')
      .select('pontuacao_final_calculada, rodada')
      .eq('jogador_id', jogadorId)
      .order('rodada', { ascending: false })
      .limit(5);

    if (error || !data?.length) return fallback;

    const total = data.reduce((acc, row) => acc + Number(row.pontuacao_final_calculada || 0), 0);
    const ptsPartida = (total / data.length).toFixed(1);
    const ultima = Number(data[0].pontuacao_final_calculada || 0);

    return {
      ptsPartida,
      forma: ultima.toFixed(1),
      selPorcentagem: fallback.selPorcentagem,
      total: total.toFixed(1),
      rodadasComDados: data.length,
      fonte: 'scouts',
    };
  } catch {
    return fallback;
  }
}
