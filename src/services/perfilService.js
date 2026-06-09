import { supabase } from './supabaseClient';
import { ensureMyTime, updateMyTimeNome } from './timeService';

export async function getMeuPerfil() {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  if (!userId) return null;

  const { data, error } = await supabase
    .from('perfis_usuario')
    .select('usuario_id, nome_exibicao, avatar_url')
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
    .update({ nome_exibicao: nome.trim() })
    .eq('usuario_id', userId)
    .select('usuario_id, nome_exibicao, avatar_url')
    .single();

  if (error) throw error;
  return data;
}

export async function uploadAvatar(file) {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  if (!userId) throw new Error('Usuário não autenticado.');

  const ext = file.name.split('.').pop().toLowerCase();
  const filePath = `${userId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  const publicUrl = urlData?.publicUrl;
  if (!publicUrl) throw new Error('Erro ao obter URL pública do avatar.');

  return publicUrl;
}

export async function atualizarAvatar(url) {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  if (!userId) throw new Error('Usuário não autenticado.');

  const { data, error } = await supabase
    .from('perfis_usuario')
    .update({ avatar_url: url })
    .eq('usuario_id', userId)
    .select('usuario_id, avatar_url')
    .single();

  if (error) throw error;
  return data;
}

export async function sugerirTimeInicial(timeId) {
  const { data, error } = await supabase.rpc('sugerir_elenco_inicial', {
    p_time_usuario_id: timeId,
  });

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
