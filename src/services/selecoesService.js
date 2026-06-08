import { supabase } from './supabaseClient';

export async function listSelecoes() {
  const { data, error } = await supabase
    .from('selecoes')
    .select('id, nome, bandeira_url')
    .order('nome', { ascending: true });
  if (error) throw error;
  return data || [];
}
