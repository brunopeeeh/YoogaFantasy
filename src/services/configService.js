import { supabase } from './supabaseClient';

const SELECT = 'id, rodada_atual, deadline, mercado_aberto, updated_at';

export async function getConfigRodada() {
  const { data, error } = await supabase
    .from('config_rodada')
    .select(SELECT)
    .eq('id', 1)
    .maybeSingle();
  if (error) throw error;
  return data;
}
