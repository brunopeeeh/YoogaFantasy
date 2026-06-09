CREATE OR REPLACE FUNCTION public.leaderboard_global()
RETURNS TABLE (
  posicao INT,
  usuario_id UUID,
  nome_exibicao TEXT,
  nome_time TEXT,
  avatar_url TEXT,
  pontos NUMERIC,
  ultima_rodada_pontos NUMERIC
)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  WITH pontos_agregados AS (
    SELECT
      t.usuario_id,
      COALESCE(SUM(pur.pontos_ganhos), 0)::NUMERIC AS total_pontos
    FROM public.times_usuarios t
    LEFT JOIN public.pontuacao_usuarios_rodada pur ON pur.time_usuario_id = t.id
    GROUP BY t.usuario_id
  ),
  ultima_rodada AS (
    SELECT DISTINCT ON (pur.time_usuario_id)
      t.usuario_id,
      pur.pontos_ganhos
    FROM public.pontuacao_usuarios_rodada pur
    JOIN public.times_usuarios t ON t.id = pur.time_usuario_id
    ORDER BY pur.time_usuario_id, pur.rodada DESC
  )
  SELECT
    ROW_NUMBER() OVER (ORDER BY pa.total_pontos DESC)::INT AS posicao,
    pa.usuario_id,
    COALESCE(p.nome_exibicao, 'Treinador')::TEXT,
    COALESCE(t.nome_time, 'Meu Time')::TEXT,
    COALESCE(p.avatar_url, '')::TEXT,
    pa.total_pontos,
    COALESCE(ur.pontos_ganhos, 0)::NUMERIC
  FROM pontos_agregados pa
  JOIN public.times_usuarios t ON t.usuario_id = pa.usuario_id
  LEFT JOIN public.perfis_usuario p ON p.usuario_id = pa.usuario_id
  LEFT JOIN ultima_rodada ur ON ur.usuario_id = pa.usuario_id
  ORDER BY pa.total_pontos DESC;
$$;
