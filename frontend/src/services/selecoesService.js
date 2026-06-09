import { supabase } from './supabaseClient';

export async function listSelecoes() {
  const { data, error } = await supabase
    .from('selecoes')
    .select('id, nome, bandeira_url')
    .order('nome', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function getTeamStrength() {
  const { data, error } = await supabase
    .from('jogadores')
    .select('selecao_id, preco')
    .not('preco', 'is', null)
    .not('selecao_id', 'is', null);

  if (error) throw error;

  const groups = {};
  for (const j of (data || [])) {
    if (!groups[j.selecao_id]) groups[j.selecao_id] = [];
    groups[j.selecao_id].push(Number(j.preco));
  }

  const strengths = Object.entries(groups)
    .map(([id, precos]) => {
      const media = precos.reduce((a, b) => a + b, 0) / precos.length;
      return { selecao_id: Number(id), media };
    })
    .sort((a, b) => a.media - b.media);

  const count = strengths.length;
  const thresholds = {
    easy: count > 0 ? strengths[Math.floor(count / 3)].media : 6,
    hard: count > 0 ? strengths[Math.floor(count * 2 / 3)].media : 8,
  };

  const map = {};
  for (const s of strengths) {
    if (s.media <= thresholds.easy) map[s.selecao_id] = 'easy';
    else if (s.media >= thresholds.hard) map[s.selecao_id] = 'hard';
    else map[s.selecao_id] = 'medium';
  }

  return map;
}
