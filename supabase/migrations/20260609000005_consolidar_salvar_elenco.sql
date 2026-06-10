-- Consolidacao final da RPC salvar_elenco
-- Elimina todas as assinaturas antigas espalhadas por 6 migrations
-- e recria a versao definitiva (v6)

DROP FUNCTION IF EXISTS public.salvar_elenco(JSONB, NUMERIC);
DROP FUNCTION IF EXISTS public.salvar_elenco(JSONB, NUMERIC, INT);
DROP FUNCTION IF EXISTS public.salvar_elenco(JSONB, NUMERIC, INT, TEXT);

CREATE OR REPLACE FUNCTION public.salvar_elenco(
  p_jogadores             JSONB,
  p_orcamento_gasto       NUMERIC,
  p_transferencias_usadas INT DEFAULT 0,
  p_formacao              TEXT DEFAULT '4-4-2'
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_usuario_id             UUID := auth.uid();
  v_time_id                BIGINT;
  v_count                  INT;
  v_ids                    BIGINT[];
  v_existentes             INT;
  v_mercado_aberto         BOOLEAN;
  v_rodada_atual           INT;
  v_antigos_ids            BIGINT[];
  v_removidos_invalidos    INT;
  v_limites                JSONB;
  v_orcamento_max          NUMERIC;
  v_max_por_selecao        INT;
  v_transferencias_gratis  INT;
  v_usadas                 INT := 0;
  v_total_usadas           INT;
  v_extras                 INT := 0;
  v_penalidade             NUMERIC(8,2) := 0;
  v_contagem_por_sel       JSONB;
  v_sel_key                TEXT;
  v_qtd                    INT;
  v_saldo                  NUMERIC;
  v_elenco_anterior        INT := 0;
  v_elenco_max CONSTANT INT := 15;
BEGIN
  IF v_usuario_id IS NULL THEN
    RAISE EXCEPTION 'Nao autenticado' USING ERRCODE = '42501';
  END IF;

  SELECT mercado_aberto, rodada_atual
  INTO v_mercado_aberto, v_rodada_atual
  FROM public.config_rodada WHERE id = 1;

  SELECT id INTO v_time_id FROM public.times_usuarios
  WHERE usuario_id = v_usuario_id LIMIT 1;

  IF v_time_id IS NULL THEN
    INSERT INTO public.times_usuarios (usuario_id, nome_time, banco_cartoletas)
    VALUES (v_usuario_id, 'Meu Time', 150.0)
    RETURNING id INTO v_time_id;
  END IF;

  v_limites := public.get_limites_fase(v_rodada_atual);
  v_orcamento_max := (v_limites->>'orcamento_maximo')::NUMERIC;
  v_max_por_selecao := (v_limites->>'max_por_selecao')::INT;
  v_transferencias_gratis := (v_limites->>'transferencias_gratis')::INT;

  v_count := jsonb_array_length(p_jogadores);
  IF v_count > v_elenco_max THEN
    RAISE EXCEPTION 'Elenco excede o maximo de % jogadores (recebido: %)',
      v_elenco_max, v_count USING ERRCODE = '23514';
  END IF;

  IF p_orcamento_gasto IS NULL OR p_orcamento_gasto < 0 THEN
    RAISE EXCEPTION 'Orcamento gasto invalido: %', p_orcamento_gasto USING ERRCODE = '23514';
  END IF;
  IF p_orcamento_gasto > v_orcamento_max THEN
    RAISE EXCEPTION 'Orcamento estourado: R$%M (max: R$%M)',
      p_orcamento_gasto, v_orcamento_max USING ERRCODE = '23514';
  END IF;

  SELECT array_agg((j->>'id')::BIGINT) INTO v_ids
  FROM jsonb_array_elements(p_jogadores) j;

  IF v_count > 0 THEN
    SELECT COUNT(*) INTO v_existentes
    FROM public.jogadores
    WHERE id_sofascore = ANY(v_ids);
    IF v_existentes <> v_count THEN
      RAISE EXCEPTION 'Um ou mais jogador_id nao existem (existentes: %, recebidos: %)',
        v_existentes, v_count USING ERRCODE = '23502';
    END IF;
  END IF;

  IF v_count > 0 THEN
    SELECT jsonb_object_agg(COALESCE(j.selecao_id::TEXT, 'sem_selecao'), qtd) INTO v_contagem_por_sel
    FROM (
      SELECT j.selecao_id, COUNT(*) AS qtd
      FROM public.jogadores j
      WHERE j.id_sofascore = ANY(v_ids)
        AND j.selecao_id IS NOT NULL
      GROUP BY j.selecao_id
    ) j;

    IF v_contagem_por_sel IS NOT NULL THEN
      FOR v_sel_key, v_qtd IN SELECT * FROM jsonb_each_text(v_contagem_por_sel)
      LOOP
        IF v_qtd > v_max_por_selecao THEN
          RAISE EXCEPTION 'Limite de % jogadores por selecao excedido (selecao: %, tentativa: %)',
            v_max_por_selecao, v_sel_key, v_qtd USING ERRCODE = '23514';
        END IF;
      END LOOP;
    END IF;
  END IF;

  IF v_mercado_aberto IS DISTINCT FROM TRUE THEN
    SELECT array_agg(jogador_id) INTO v_antigos_ids
    FROM public.elencos_usuarios
    WHERE time_usuario_id = v_time_id;

    IF v_antigos_ids IS NOT NULL THEN
      SELECT COUNT(*) INTO v_removidos_invalidos
      FROM unnest(v_antigos_ids) AS antigo_id
      WHERE antigo_id <> ALL(COALESCE(v_ids, ARRAY[]::BIGINT[]))
        AND (
          SELECT COALESCE(status_medico, 'disponivel') FROM public.jogadores
          WHERE id_sofascore = antigo_id
        ) = 'disponivel';

      IF v_removidos_invalidos > 0 THEN
        RAISE EXCEPTION 'Mercado fechado. So eh permitido substituir jogadores machucados.'
          USING ERRCODE = '23514';
      END IF;
    END IF;
  END IF;

  SELECT COUNT(*) INTO v_elenco_anterior
  FROM public.elencos_usuarios
  WHERE time_usuario_id = v_time_id;

  IF v_elenco_anterior > 0 THEN
    SELECT COALESCE(transferencias_usadas_rodada, 0) INTO v_usadas
    FROM public.times_usuarios
    WHERE id = v_time_id;

    v_total_usadas := v_usadas + p_transferencias_usadas;

    IF v_transferencias_gratis < 999 AND p_transferencias_usadas > 0 THEN
      v_extras := GREATEST(0, v_total_usadas - v_transferencias_gratis);
      v_penalidade := v_extras * 5.0;
    END IF;

    UPDATE public.times_usuarios
    SET transferencias_usadas_rodada = v_total_usadas,
        penalidade_transferencias_rodada = v_penalidade,
        updated_at = NOW()
    WHERE id = v_time_id;
  END IF;

  DELETE FROM public.elencos_usuarios WHERE time_usuario_id = v_time_id;
  IF v_count > 0 THEN
    INSERT INTO public.elencos_usuarios (time_usuario_id, jogador_id, eh_capitao)
    SELECT v_time_id,
           (j->>'id')::BIGINT,
           COALESCE((j->>'eh_capitao')::BOOLEAN, FALSE)
    FROM jsonb_array_elements(p_jogadores) j;
  END IF;

  v_saldo := GREATEST(0, v_orcamento_max - p_orcamento_gasto);
  UPDATE public.times_usuarios
  SET banco_cartoletas = v_saldo,
      formacao = p_formacao,
      updated_at = NOW()
  WHERE id = v_time_id;

  RETURN jsonb_build_object(
    'time_id',       v_time_id,
    'saldo',         v_saldo,
    'elenco_count',  v_count,
    'transferencias_usadas', p_transferencias_usadas,
    'transferencias_extras', v_extras,
    'penalidade',    v_penalidade,
    'limites',       v_limites
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.salvar_elenco(JSONB, NUMERIC, INT, TEXT) TO authenticated;
