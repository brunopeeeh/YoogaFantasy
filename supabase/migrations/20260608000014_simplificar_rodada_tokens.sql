-- Remove colunas de transferência de times_usuarios
-- Simplifica abrir_proxima_rodada (sem transferências)
-- Remove tokens ajuste_rapido e reconstruir (só mantém capitao_triplo)

ALTER TABLE public.times_usuarios
  DROP COLUMN IF EXISTS transferencias_gratis,
  DROP COLUMN IF EXISTS transferencias_extras_usadas,
  DROP COLUMN IF EXISTS transferencias_total_rodada,
  DROP COLUMN IF EXISTS pontos_penalidade_transferencia;

-- Atualiza abrir_proxima_rodada (sem lógica de transferências)
CREATE OR REPLACE FUNCTION public.abrir_proxima_rodada(p_novo_deadline TIMESTAMPTZ DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rodada INT;
  v_deadline TIMESTAMPTZ;
BEGIN
  SELECT rodada_atual INTO v_rodada FROM public.config_rodada WHERE id = 1;
  v_deadline := COALESCE(p_novo_deadline, NOW() + INTERVAL '7 days');

  UPDATE public.config_rodada
  SET rodada_atual = v_rodada + 1,
      mercado_aberto = TRUE,
      deadline = v_deadline,
      updated_at = NOW()
  WHERE id = 1;

  RETURN jsonb_build_object(
    'rodada_anterior', v_rodada,
    'rodada_atual', v_rodada + 1,
    'deadline', v_deadline
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.abrir_proxima_rodada(TIMESTAMPTZ) TO service_role;

-- Remove backup de ajuste_rapido (não usado mais)
DROP TABLE IF EXISTS public.ajuste_rapido_backup;

-- Atualiza seed de tokens: só capitao_triplo
CREATE OR REPLACE FUNCTION public.seed_tokens_novo_time()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.tokens_usuario (time_usuario_id, tipo) VALUES
    (NEW.id, 'capitao_triplo');
  RETURN NEW;
END;
$$;

-- Remove tokens ajuste_rapido e reconstruir já seedados
DELETE FROM public.tokens_usuario
WHERE tipo IN ('ajuste_rapido', 'reconstruir');

-- Remove a coluna tipo antiga e recria com check só capitao_triplo
-- (precisa dropar e recriar porque CHECK depende do valor)
ALTER TABLE public.tokens_usuario
  DROP CONSTRAINT IF EXISTS tokens_usuario_tipo_check;

ALTER TABLE public.tokens_usuario
  ADD CONSTRAINT tokens_usuario_tipo_check
  CHECK (tipo IN ('capitao_triplo'));

-- Simplifica usar_token: aceita só capitao_triplo
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

  UPDATE public.tokens_usuario
  SET disponivel = FALSE, usado_em = v_momento, rodada_usado = v_rodada
  WHERE id = v_token_id;

  RETURN jsonb_build_object(
    'token_id', v_token_id,
    'tipo',     p_tipo,
    'rodada',   v_rodada,
    'usado_em', v_momento
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.usar_token(TEXT) TO authenticated;
