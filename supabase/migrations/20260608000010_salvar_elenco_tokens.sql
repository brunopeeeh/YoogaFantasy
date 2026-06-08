-- salvar_elenco v3: respeita tokens ajuste_rapido / reconstruir na rodada atual
-- (transferências ilimitadas e sem penalidade enquanto o token estiver ativo)

DROP FUNCTION IF EXISTS public.salvar_elenco(JSONB, NUMERIC, INT);

CREATE OR REPLACE FUNCTION public.salvar_elenco(
  p_jogadores           JSONB,
  p_orcamento_gasto     NUMERIC,
  p_transferencias_usadas INT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_usuario_id           UUID := auth.uid();
  v_time_id              BIGINT;
  v_count                INT;
  v_ids                  BIGINT[];
  v_existentes           INT;
  v_orcamento            NUMERIC;
  v_mercado_aberto       BOOLEAN;
  v_rodada_atual         INT;
  v_transferencias_gratis   INT;
  v_pts_penalidade       NUMERIC := 0;
  v_free_used            INT;
  v_extras               INT;
  v_token_ilimitado      BOOLEAN := FALSE;
  v_orcamento_max CONSTANT NUMERIC := 100.0;
  v_elenco_max   CONSTANT INT     := 15;
  v_penalidade_por_extra CONSTANT NUMERIC := 5.0;
BEGIN
  IF v_usuario_id IS NULL THEN
    RAISE EXCEPTION 'Não autenticado' USING ERRCODE = '42501';
  END IF;

  SELECT mercado_aberto, rodada_atual
  INTO v_mercado_aberto, v_rodada_atual
  FROM public.config_rodada WHERE id = 1;

  IF v_mercado_aberto IS DISTINCT FROM TRUE THEN
    RAISE EXCEPTION 'Mercado fechado. Aguarde a próxima rodada para fazer alterações.'
      USING ERRCODE = '23514';
  END IF;

  SELECT id INTO v_time_id FROM public.times_usuarios
  WHERE usuario_id = v_usuario_id LIMIT 1;

  IF v_time_id IS NULL THEN
    INSERT INTO public.times_usuarios (usuario_id, nome_time, banco_cartoletas, transferencias_gratis)
    VALUES (v_usuario_id, 'Meu Time', v_orcamento_max, 1)
    RETURNING id INTO v_time_id;
  END IF;

  v_count := jsonb_array_length(p_jogadores);
  IF v_count > v_elenco_max THEN
    RAISE EXCEPTION 'Elenco excede o máximo de % jogadores (recebido: %)',
      v_elenco_max, v_count USING ERRCODE = '23514';
  END IF;

  IF p_orcamento_gasto IS NULL OR p_orcamento_gasto < 0 THEN
    RAISE EXCEPTION 'Orçamento gasto inválido: %', p_orcamento_gasto USING ERRCODE = '23514';
  END IF;
  IF p_orcamento_gasto > v_orcamento_max THEN
    RAISE EXCEPTION 'Orçamento estourado: €%M (máx: €%M)',
      p_orcamento_gasto, v_orcamento_max USING ERRCODE = '23514';
  END IF;

  IF p_transferencias_usadas IS NULL OR p_transferencias_usadas < 0 THEN
    RAISE EXCEPTION 'Contagem de transferências inválida: %', p_transferencias_usadas USING ERRCODE = '23514';
  END IF;
  IF p_transferencias_usadas > v_elenco_max THEN
    RAISE EXCEPTION 'Transferências suspeitas: % (máx: %)', p_transferencias_usadas, v_elenco_max USING ERRCODE = '23514';
  END IF;

  SELECT array_agg((j->>'id')::BIGINT) INTO v_ids
  FROM jsonb_array_elements(p_jogadores) j;

  IF v_count > 0 THEN
    SELECT COUNT(*) INTO v_existentes
    FROM public.jogadores
    WHERE id_sofascore = ANY(v_ids);
    IF v_existentes <> v_count THEN
      RAISE EXCEPTION 'Um ou mais jogador_id não existem (existentes: %, recebidos: %)',
        v_existentes, v_count USING ERRCODE = '23502';
    END IF;
  END IF;

  SELECT transferencias_gratis INTO v_transferencias_gratis
  FROM public.times_usuarios WHERE id = v_time_id;

  SELECT EXISTS (
    SELECT 1 FROM public.tokens_usuario tk
    WHERE tk.time_usuario_id = v_time_id
      AND tk.tipo IN ('ajuste_rapido', 'reconstruir')
      AND tk.disponivel = FALSE
      AND tk.rodada_usado = v_rodada_atual
  ) INTO v_token_ilimitado;

  IF v_token_ilimitado THEN
    v_free_used := 0;
    v_extras := 0;
    v_pts_penalidade := 0;
  ELSE
    v_free_used := LEAST(p_transferencias_usadas, COALESCE(v_transferencias_gratis, 0));
    v_extras := p_transferencias_usadas - v_free_used;
    v_pts_penalidade := v_extras * v_penalidade_por_extra;
  END IF;

  DELETE FROM public.elencos_usuarios WHERE time_usuario_id = v_time_id;
  IF v_count > 0 THEN
    INSERT INTO public.elencos_usuarios (time_usuario_id, jogador_id, eh_capitao)
    SELECT v_time_id,
           (j->>'id')::BIGINT,
           COALESCE((j->>'eh_capitao')::BOOLEAN, FALSE)
    FROM jsonb_array_elements(p_jogadores) j;
  END IF;

  v_orcamento := v_orcamento_max - p_orcamento_gasto;
  UPDATE public.times_usuarios
  SET banco_cartoletas              = v_orcamento,
      transferencias_gratis        = CASE
        WHEN v_token_ilimitado THEN transferencias_gratis
        ELSE GREATEST(COALESCE(v_transferencias_gratis, 0) - v_free_used, 0)
      END,
      transferencias_total_rodada  = transferencias_total_rodada + p_transferencias_usadas,
      transferencias_extras_usadas = transferencias_extras_usadas + v_extras,
      pontos_penalidade_transferencia = pontos_penalidade_transferencia + v_pts_penalidade
  WHERE id = v_time_id;

  RETURN jsonb_build_object(
    'time_id',              v_time_id,
    'saldo',                v_orcamento,
    'elenco_count',         v_count,
    'transferencias_usadas',  p_transferencias_usadas,
    'transferencias_free',    v_free_used,
    'transferencias_extras',  v_extras,
    'penalidade_pontos',      v_pts_penalidade,
    'token_ilimitado',        v_token_ilimitado,
    'transferencias_gratis_restantes',
      CASE
        WHEN v_token_ilimitado THEN COALESCE(v_transferencias_gratis, 0)
        ELSE GREATEST(COALESCE(v_transferencias_gratis, 0) - v_free_used, 0)
      END
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.salvar_elenco(JSONB, NUMERIC, INT) TO authenticated;
