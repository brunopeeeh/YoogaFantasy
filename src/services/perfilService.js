import { supabase } from './supabaseClient';
import { ensureMyTime, updateMyTimeNome } from './timeService';

export async function getMeuPerfil() {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  if (!userId) return null;

  const { data, error } = await supabase
    .from('perfis_usuario')
    .select('usuario_id, nome_exibicao')
    .eq('usuario_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function ensureMeuPerfil(email) {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  if (!userId) return null;

  const existente = await getMeuPerfil();
  if (existente) return existente;

  const nome = email?.split('@')[0] || 'Treinador';
  const { data, error } = await supabase
    .from('perfis_usuario')
    .insert({ usuario_id: userId, nome_exibicao: nome })
    .select('usuario_id, nome_exibicao')
    .single();

  if (error) throw error;
  return data;
}

export async function atualizarNomeExibicao(nome) {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  if (!userId) throw new Error('Usuário não autenticado.');

  const { data, error } = await supabase
    .from('perfis_usuario')
    .upsert({ usuario_id: userId, nome_exibicao: nome.trim() })
    .select('usuario_id, nome_exibicao')
    .single();

  if (error) throw error;
  return data;
}

export function perfilPrecisaOnboarding(perfil, time) {
  if (!perfil?.nome_exibicao?.trim()) return true;
  if (!time?.nome_time?.trim() || time.nome_time === 'Meu Time') return true;
  return false;
}

export async function completarCadastro({ nomeExibicao, nomeTime }) {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  if (!userId) throw new Error('Usuário não autenticado.');

  const perfil = await atualizarNomeExibicao(nomeExibicao);
  const time = await ensureMyTime(userId);
  await updateMyTimeNome(time.id, nomeTime.trim());
  return { perfil, time: { ...time, nome_time: nomeTime.trim() } };
}
