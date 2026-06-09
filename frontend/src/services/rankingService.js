import { supabase } from './supabaseClient';

export async function buscarRankingGlobal() {
  const { data, error } = await supabase.rpc('leaderboard_global');
  if (error) throw error;
  return data || [];
}
