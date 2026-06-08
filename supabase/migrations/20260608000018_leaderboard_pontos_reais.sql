-- Recalcula os pontos da leaderboard em tempo real
-- Antes: líder usava usuarios_ligas.pontos_acumulados (nunca atualizado)
-- Agora: soma pontuacao_usuarios_rodada.pontos_ganhos ON THE FLY

CREATE OR REPLACE FUNCTION public.leaderboard_liga(p_liga_id UUID)
RETURNS TABLE (
  posicao         INT,
  usuario_id      UUID,
  nome_exibicao   TEXT,
  nome_time       TEXT,
  pontos          NUMERIC
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH pontos_usuario AS (
    SELECT t.usuario_id, COALESCE(SUM(pur.pontos_ganhos), 0)::NUMERIC AS total_pontos
    FROM public.times_usuarios t
    LEFT JOIN public.pontuacao_usuarios_rodada pur ON pur.time_usuario_id = t.id
    GROUP BY t.usuario_id
  )
  SELECT
    ROW_NUMBER() OVER (ORDER BY pu.total_pontos DESC)::INT AS posicao,
    ul.usuario_id,
    COALESCE(p.nome_exibicao, 'Treinador') AS nome_exibicao,
    COALESCE(t.nome_time, 'Meu Time') AS nome_time,
    pu.total_pontos AS pontos
  FROM public.usuarios_ligas ul
  LEFT JOIN public.perfis_usuario p ON p.usuario_id = ul.usuario_id
  LEFT JOIN public.times_usuarios t ON t.usuario_id = ul.usuario_id
  LEFT JOIN pontos_usuario pu ON pu.usuario_id = ul.usuario_id
  WHERE ul.liga_id = p_liga_id
    AND EXISTS (
      SELECT 1 FROM public.usuarios_ligas mem
      WHERE mem.liga_id = p_liga_id AND mem.usuario_id = auth.uid()
    )
  ORDER BY pu.total_pontos DESC;
$$;
