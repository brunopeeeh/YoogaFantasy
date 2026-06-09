import { supabase } from './supabaseClient';

export async function criarLiga(nomeLiga, tipoLiga = 'privada') {
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) throw new Error("Usuário não autenticado.");

  const codigoConvite = Math.random().toString(36).substring(2, 8).toUpperCase();

  // 1. Criar a Liga
  const { data: liga, error: erroLiga } = await supabase
    .from('ligas')
    .insert([{ 
      nome: nomeLiga, 
      criado_por: user.user.id, 
      tipo: tipoLiga, 
      codigo_convite: codigoConvite 
    }])
    .select()
    .single();

  if (erroLiga) throw erroLiga;

  // 2. Adicionar o criador na liga recém-criada
  const { error: erroViculo } = await supabase
    .from('usuarios_ligas')
    .insert([{ 
      liga_id: liga.id, 
      usuario_id: user.user.id,
      pontos_acumulados: 0 
    }]);

  if (erroViculo) throw erroViculo;

  return liga;
}

export async function entrarLigaPorCodigo(codigo) {
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) throw new Error("Usuário não autenticado.");

  // 1. Buscar liga pelo código
  const { data: liga, error: erroBusca } = await supabase
    .from('ligas')
    .select('*')
    .eq('codigo_convite', codigo.toUpperCase())
    .single();

  if (erroBusca || !liga) throw new Error("Liga não encontrada com este código.");

  // 2. Verificar se o usuário já está na liga
  const { data: existente } = await supabase
    .from('usuarios_ligas')
    .select('id')
    .eq('liga_id', liga.id)
    .eq('usuario_id', user.user.id)
    .single();

  if (existente) throw new Error("Você já faz parte desta liga.");

  // 3. Inserir o usuário na liga
  const { error: erroViculo } = await supabase
    .from('usuarios_ligas')
    .insert([{ 
      liga_id: liga.id, 
      usuario_id: user.user.id,
      pontos_acumulados: 0 
    }]);

  if (erroViculo) throw erroViculo;

  return liga;
}

export async function buscarMinhasLigas() {
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return [];

  const { data: meusVinculos, error } = await supabase
    .from('usuarios_ligas')
    .select('liga_id, pontos_acumulados')
    .eq('usuario_id', user.user.id);

  if (error) throw error;
  if (!meusVinculos?.length) return [];

  const ligaIds = meusVinculos.map(v => v.liga_id);
  const { data: ligasData, error: ligasError } = await supabase
    .from('ligas')
    .select('*')
    .in('id', ligaIds);

  if (ligasError) throw ligasError;

  return meusVinculos.map(v => {
    const liga = ligasData?.find(l => l.id === v.liga_id);
    return {
      id: v.liga_id,
      nome: liga?.nome || '—',
      tipo: liga?.tipo || 'privada',
      codigo_convite: liga?.codigo_convite,
      criado_por: liga?.criado_por,
      meus_pontos: v.pontos_acumulados,
    };
  });
}

export async function atualizarLiga(ligaId, novosDados) {
  const { data, error } = await supabase
    .from('ligas')
    .update({ nome: novosDados.nome })
    .eq('id', ligaId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function excluirLiga(ligaId) {
  const { error } = await supabase
    .from('ligas')
    .delete()
    .eq('id', ligaId);

  if (error) throw error;
}

export async function buscarLeaderboard(ligaId) {
  const { data, error } = await supabase.rpc('leaderboard_liga', { p_liga_id: ligaId });
  if (error) throw error;

  return (data || []).map((d) => ({
    posicao: d.posicao,
    usuario_id: d.usuario_id,
    nome_exibicao: d.nome_exibicao,
    nome_time: d.nome_time,
    pontos: parseFloat(d.pontos || 0),
  }));
}
