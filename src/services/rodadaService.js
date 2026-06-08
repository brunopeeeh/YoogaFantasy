import { supabase } from './supabaseClient';

export async function getMinhaPontuacaoRodada(timeId, rodada) {
  if (!timeId || rodada == null) return null;
  const { data, error } = await supabase
    .from('pontuacao_usuarios_rodada')
    .select('rodada, pontos_ganhos, pontos_jogadores, bonus_capitao, penalidade_transferencias')
    .eq('time_usuario_id', timeId)
    .eq('rodada', rodada)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getHistoricoPontuacao(timeId, limit = 5) {
  if (!timeId) return [];
  const { data, error } = await supabase
    .from('pontuacao_usuarios_rodada')
    .select('rodada, pontos_ganhos')
    .eq('time_usuario_id', timeId)
    .order('rodada', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}
