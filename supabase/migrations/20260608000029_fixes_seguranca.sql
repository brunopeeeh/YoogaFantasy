-- ============================================================
-- Migration 29: Correções de segurança e integridade
-- 1. Race condition no usar_token → FOR UPDATE SKIP LOCKED
-- 2. Race condition no resgatar_token → FOR UPDATE SKIP LOCKED  
-- 3. FK em elenco_snapshot_rodada.jogador_id
-- 4. sincronizar_pontos_ligas automático no fechar_mercado
-- ============================================================

-- ===== 1. Fix race condition no usar_token =====
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

  -- 3. Localiza e BLOQUEIA o token disponível mais antigo
  SELECT id INTO v_token_id FROM public.tokens_usuario
  WHERE time_usuario_id = v_time_id
    AND tipo = p_tipo
    AND disponivel = TRUE
  ORDER BY created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;
  IF v_token_id IS NULL THEN
    RAISE EXCEPTION 'Nenhum token do tipo "%" disponível.', p_tipo
      USING ERRCODE = '23502';
  END IF;

  -- 4. Marca como usado
  UPDATE public.tokens_usuario
  SET disponivel    = FALSE,
      usado_em      = v_momento,
      rodada_usado  = v_rodada
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

-- ===== 2. Fix race condition no resgatar_token =====
DROP FUNCTION IF EXISTS public.resgatar_token(TEXT);

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

  -- Localiza e BLOQUEIA token usado na rodada atual
  SELECT id INTO v_token_id FROM public.tokens_usuario
  WHERE time_usuario_id = v_time_id
    AND tipo = p_tipo
    AND disponivel = FALSE
    AND rodada_usado = v_rodada
  ORDER BY usado_em DESC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

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

-- ===== 3. FK em elenco_snapshot_rodada.jogador_id =====
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'fk_snapshot_jogador'
      AND conrelid = 'public.elenco_snapshot_rodada'::regclass
  ) THEN
    ALTER TABLE public.elenco_snapshot_rodada
      ADD CONSTRAINT fk_snapshot_jogador
      FOREIGN KEY (jogador_id) REFERENCES public.jogadores(id_sofascore);
  END IF;
END;
$$;

-- ===== 4. sincronizar_pontos_ligas no fechamento do mercado =====
DROP FUNCTION IF EXISTS public.fechar_mercado_rodada();

CREATE OR REPLACE FUNCTION public.fechar_mercado_rodada()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rodada INT;
  v_result JSONB;
BEGIN
  SELECT rodada_atual INTO v_rodada FROM public.config_rodada WHERE id = 1;

  UPDATE public.config_rodada
  SET mercado_aberto = FALSE, updated_at = NOW()
  WHERE id = 1;

  INSERT INTO public.elenco_snapshot_rodada (time_usuario_id, rodada, jogador_id, eh_capitao)
  SELECT eu.time_usuario_id, v_rodada, eu.jogador_id, eu.eh_capitao
  FROM public.elencos_usuarios eu
  ON CONFLICT (time_usuario_id, rodada, jogador_id) DO UPDATE
  SET eh_capitao = EXCLUDED.eh_capitao;

  -- Sincroniza pontos acumulados nas ligas
  PERFORM public.sincronizar_pontos_ligas(v_rodada);

  RETURN jsonb_build_object('rodada', v_rodada, 'mercado_aberto', FALSE);
END;
$$;

GRANT EXECUTE ON FUNCTION public.fechar_mercado_rodada() TO service_role;
