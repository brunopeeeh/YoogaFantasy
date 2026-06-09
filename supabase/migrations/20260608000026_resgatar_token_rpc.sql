-- RPC para resgatar (desfazer) um token ativado na rodada atual
-- Só permite resgatar se o mercado estiver aberto e o token foi usado na rodada atual

CREATE OR REPLACE FUNCTION public.resgatar_token(p_tipo TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_usuario_id UUID := auth.uid();
  v_time_id    BIGINT;
  v_token_id   UUID;
  v_rodada     INT;
  v_mercado    BOOLEAN;
BEGIN
  IF v_usuario_id IS NULL THEN
    RAISE EXCEPTION 'Não autenticado.' USING ERRCODE = '42501';
  END IF;

  IF p_tipo IS NULL OR p_tipo <> 'capitao_triplo' THEN
    RAISE EXCEPTION 'Tipo de token inválido: %', p_tipo USING ERRCODE = '23514';
  END IF;

  SELECT mercado_aberto, rodada_atual INTO v_mercado, v_rodada
  FROM public.config_rodada WHERE id = 1;

  IF v_mercado IS DISTINCT FROM TRUE THEN
    RAISE EXCEPTION 'Mercado fechado. Não é possível resgatar token agora.'
      USING ERRCODE = '23514';
  END IF;

  SELECT id INTO v_time_id FROM public.times_usuarios
  WHERE usuario_id = v_usuario_id LIMIT 1;

  IF v_time_id IS NULL THEN
    RAISE EXCEPTION 'Time não encontrado.' USING ERRCODE = '23502';
  END IF;

  SELECT id INTO v_token_id FROM public.tokens_usuario
  WHERE time_usuario_id = v_time_id
    AND tipo = p_tipo
    AND disponivel = FALSE
    AND rodada_usado = v_rodada
  ORDER BY usado_em DESC
  LIMIT 1;

  IF v_token_id IS NULL THEN
    RAISE EXCEPTION 'Nenhum token usado nesta rodada para resgatar.'
      USING ERRCODE = '23502';
  END IF;

  UPDATE public.tokens_usuario
  SET disponivel = TRUE, usado_em = NULL, rodada_usado = NULL
  WHERE id = v_token_id;

  RETURN jsonb_build_object(
    'token_id', v_token_id,
    'tipo',     p_tipo,
    'rodada',   v_rodada
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.resgatar_token(TEXT) TO authenticated;
