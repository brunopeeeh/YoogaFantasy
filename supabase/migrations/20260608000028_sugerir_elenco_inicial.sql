-- Sugere elenco inicial automático: pega os jogadores mais baratos de cada
-- posição respeitando o limite de 1 GOL, 4 DEF, 4 MEI, 3 ATA (12 + 3 reservas).
-- Uso: SELECT * FROM sugerir_elenco_inicial(p_time_usuario_id := 1);

CREATE OR REPLACE FUNCTION public.sugerir_elenco_inicial(p_time_usuario_id BIGINT)
RETURNS TABLE (jogador_id BIGINT, posicao_jogador TEXT, preco_jogador NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INT;
BEGIN
  -- Limpa elenco anterior
  DELETE FROM public.elencos_usuarios WHERE time_usuario_id = p_time_usuario_id;

  -- 1 GOL mais barato
  INSERT INTO public.elencos_usuarios (time_usuario_id, jogador_id)
  SELECT p_time_usuario_id, id_sofascore
  FROM (
    SELECT id_sofascore FROM public.jogadores
    WHERE posicao = 'G' AND preco IS NOT NULL
    ORDER BY preco ASC
    LIMIT 1
  ) sub;

  -- 4 DEF mais baratos
  INSERT INTO public.elencos_usuarios (time_usuario_id, jogador_id)
  SELECT p_time_usuario_id, id_sofascore
  FROM (
    SELECT id_sofascore FROM public.jogadores
    WHERE posicao = 'D' AND preco IS NOT NULL
    ORDER BY preco ASC
    LIMIT 4
  ) sub;

  -- 4 MEI mais baratos
  INSERT INTO public.elencos_usuarios (time_usuario_id, jogador_id)
  SELECT p_time_usuario_id, id_sofascore
  FROM (
    SELECT id_sofascore FROM public.jogadores
    WHERE posicao = 'M' AND preco IS NOT NULL
    ORDER BY preco ASC
    LIMIT 4
  ) sub;

  -- 3 ATA mais baratos
  INSERT INTO public.elencos_usuarios (time_usuario_id, jogador_id)
  SELECT p_time_usuario_id, id_sofascore
  FROM (
    SELECT id_sofascore FROM public.jogadores
    WHERE posicao = 'F' AND preco IS NOT NULL
    ORDER BY preco ASC
    LIMIT 3
  ) sub;

  -- 3 reservas (qualquer posição) mais baratos disponíveis
  INSERT INTO public.elencos_usuarios (time_usuario_id, jogador_id)
  SELECT p_time_usuario_id, id_sofascore
  FROM (
    SELECT j.id_sofascore FROM public.jogadores j
    WHERE j.preco IS NOT NULL
      AND j.id_sofascore NOT IN (
        SELECT jogador_id FROM public.elencos_usuarios
        WHERE time_usuario_id = p_time_usuario_id
      )
    ORDER BY j.preco ASC
    LIMIT 3
  ) sub;

  -- Retorna os jogadores selecionados
  RETURN QUERY
  SELECT eu.jogador_id, j.posicao::TEXT, j.preco::NUMERIC
  FROM public.elencos_usuarios eu
  JOIN public.jogadores j ON j.id_sofascore = eu.jogador_id
  WHERE eu.time_usuario_id = p_time_usuario_id
  ORDER BY
    CASE j.posicao
      WHEN 'G' THEN 1
      WHEN 'D' THEN 2
      WHEN 'M' THEN 3
      WHEN 'F' THEN 4
      ELSE 5
    END,
    j.preco ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.sugerir_elenco_inicial(BIGINT) TO authenticated;
