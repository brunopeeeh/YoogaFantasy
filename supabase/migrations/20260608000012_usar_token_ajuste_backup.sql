  -- usar_token v2: backup do elenco ao ativar Ajuste Rápido

  DROP FUNCTION IF EXISTS public.usar_token(TEXT);

  CREATE OR REPLACE FUNCTION public.usar_token(p_tipo TEXT)
  RETURNS JSONB
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
  AS $$
  DECLARE
    v_usuario_id  UUID := auth.uid();
    v_time_id     BIGINT;
    v_token_id    UUID;
    v_rodada      INT;
    v_mercado     BOOLEAN;
    v_momento     TIMESTAMPTZ := NOW();
    v_jogadores   JSONB;
  BEGIN
    IF v_usuario_id IS NULL THEN
      RAISE EXCEPTION 'Não autenticado.' USING ERRCODE = '42501';
    END IF;

    IF p_tipo IS NULL OR p_tipo NOT IN ('capitao_triplo', 'ajuste_rapido', 'reconstruir') THEN
      RAISE EXCEPTION 'Tipo de token inválido: %', p_tipo USING ERRCODE = '23514';
    END IF;

    SELECT mercado_aberto, rodada_atual INTO v_mercado, v_rodada
    FROM public.config_rodada WHERE id = 1;

    IF v_mercado IS DISTINCT FROM TRUE THEN
      RAISE EXCEPTION 'Mercado fechado. Não dá para ativar token agora.'
        USING ERRCODE = '23514';
    END IF;

    SELECT id INTO v_time_id FROM public.times_usuarios
    WHERE usuario_id = v_usuario_id LIMIT 1;

    IF v_time_id IS NULL THEN
      RAISE EXCEPTION 'Time não encontrado. Salve uma escalação para criar seu time.'
        USING ERRCODE = '23502';
    END IF;

    SELECT id INTO v_token_id FROM public.tokens_usuario
    WHERE time_usuario_id = v_time_id
      AND tipo = p_tipo
      AND disponivel = TRUE
    ORDER BY created_at ASC
    LIMIT 1;

    IF v_token_id IS NULL THEN
      RAISE EXCEPTION 'Nenhum token do tipo "%" disponível.', p_tipo
        USING ERRCODE = '23502';
    END IF;

    IF p_tipo = 'ajuste_rapido' THEN
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object('id', eu.jogador_id, 'eh_capitao', eu.eh_capitao)
        ORDER BY eu.jogador_id
      ), '[]'::jsonb)
      INTO v_jogadores
      FROM public.elencos_usuarios eu
      WHERE eu.time_usuario_id = v_time_id;

      INSERT INTO public.ajuste_rapido_backup (time_usuario_id, rodada, jogadores)
      VALUES (v_time_id, v_rodada, v_jogadores)
      ON CONFLICT (time_usuario_id, rodada) DO UPDATE
      SET jogadores = EXCLUDED.jogadores, created_at = NOW();
    END IF;

    UPDATE public.tokens_usuario
    SET disponivel = FALSE, usado_em = v_momento, rodada_usado = v_rodada
    WHERE id = v_token_id;

    RETURN jsonb_build_object(
      'token_id', v_token_id,
      'tipo', p_tipo,
      'rodada', v_rodada,
      'usado_em', v_momento
    );
  END;
  $$;

  GRANT EXECUTE ON FUNCTION public.usar_token(TEXT) TO authenticated;
