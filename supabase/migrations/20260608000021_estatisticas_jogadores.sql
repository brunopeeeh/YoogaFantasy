-- RPC para buscar estatísticas reais de jogadores em lote
-- Retorna pontos totais, última pontuação (forma), média e % de seleção

CREATE OR REPLACE FUNCTION public.estatisticas_jogadores(p_jogador_ids BIGINT[])
RETURNS TABLE (
  jogador_id       BIGINT,
  total_pontos     NUMERIC,
  ultima_pontuacao NUMERIC,
  media_pontos     NUMERIC,
  sel_porcentagem  NUMERIC
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_times INT;
BEGIN
  SELECT COUNT(*) INTO v_total_times FROM public.times_usuarios;

  RETURN QUERY
  SELECT
    j.id_sofascore,
    COALESCE(ROUND(SUM(s.pontuacao_final_calculada)::NUMERIC, 1), 0),
    COALESCE(ROUND(ult.ultima::NUMERIC, 1), 0),
    COALESCE(ROUND(AVG(s.pontuacao_final_calculada)::NUMERIC, 1), 0),
    CASE
      WHEN v_total_times > 0 THEN
        ROUND((COUNT(DISTINCT eu.time_usuario_id)::NUMERIC / v_total_times) * 100, 1)
      ELSE 0
    END
  FROM public.jogadores j
  LEFT JOIN public.scouts_atleta_rodada s ON s.jogador_id = j.id_sofascore
  LEFT JOIN public.elencos_usuarios eu ON eu.jogador_id = j.id_sofascore
  LEFT JOIN LATERAL (
    SELECT s2.pontuacao_final_calculada
    FROM public.scouts_atleta_rodada s2
    WHERE s2.jogador_id = j.id_sofascore
    ORDER BY s2.rodada DESC
    LIMIT 1
  ) ult ON TRUE
  WHERE j.id_sofascore = ANY(p_jogador_ids)
  GROUP BY j.id_sofascore, ult.ultima
  ORDER BY j.id_sofascore;
END;
$$;

GRANT EXECUTE ON FUNCTION public.estatisticas_jogadores(BIGINT[]) TO authenticated;
