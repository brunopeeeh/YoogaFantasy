import { supabase } from './supabaseClient';

const ORCAMENTO_MAXIMO = 100.0;

const SELECT_BASE = `
  id, usuario_id, nome_time, banco_cartoletas,
  created_at, updated_at
`;

export async function getMyTime(usuarioId) {
  if (!usuarioId) return null;
  const { data, error } = await supabase
    .from('times_usuarios')
    .select(`${SELECT_BASE}, formacao`)
    .eq('usuario_id', usuarioId)
    .maybeSingle();
  if (error) {
    const { data: fallback } = await supabase
      .from('times_usuarios')
      .select(SELECT_BASE)
      .eq('usuario_id', usuarioId)
      .maybeSingle();
    return fallback;
  }
  return data;
}

export async function ensureMyTime(usuarioId) {
  const existente = await getMyTime(usuarioId);
  if (existente) return existente;
  const { data, error } = await supabase
    .from('times_usuarios')
    .insert({
      usuario_id: usuarioId,
      nome_time: 'Meu Time',
      banco_cartoletas: ORCAMENTO_MAXIMO,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function updateMyTimeNome(timeId, nomeTime) {
  const { error } = await supabase
    .from('times_usuarios')
    .update({ nome_time: nomeTime })
    .eq('id', timeId);
  if (error) throw error;
}
