import { supabase } from './supabaseClient';

export async function buscarJogosDaRodada(rodadaNumero) {
  let query = supabase
    .from('jogos_copa')
    .select(`
      id_sofascore,
      rodada_numero,
      grupo_rodada,
      data_local_brt,
      timestamp_bruto,
      time_casa:selecoes!time_casa_id(id, nome, bandeira_url),
      time_fora:selecoes!time_fora_id(id, nome, bandeira_url)
    `)
    .order('timestamp_bruto', { ascending: true });

  if (rodadaNumero != null) {
    query = query.eq('rodada_numero', rodadaNumero);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function buscarJogosAgrupados() {
  const jogos = await buscarJogosDaRodada(null);
  const grupos = {};
  for (const jogo of jogos) {
    const r = jogo.rodada_numero;
    if (!grupos[r]) grupos[r] = [];
    grupos[r].push(jogo);
  }
  return grupos;
}
