import { supabase } from './supabaseClient';

export async function listarTokensPorTime(timeId) {
  if (!timeId) return [];
  const { data, error } = await supabase
    .from('tokens_usuario')
    .select('id, tipo, disponivel, usado_em, rodada_usado, created_at')
    .eq('time_usuario_id', timeId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function usarToken(tipo) {
  if (!tipo) throw new Error('Tipo de token é obrigatório');
  const { data, error } = await supabase.rpc('usar_token', { p_tipo: tipo });
  if (error) throw error;
  return data;
}

export async function resgatarToken(tipo) {
  if (!tipo) throw new Error('Tipo de token é obrigatório');
  const { data, error } = await supabase.rpc('resgatar_token', { p_tipo: tipo });
  if (error) throw error;
  return data;
}
