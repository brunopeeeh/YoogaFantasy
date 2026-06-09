-- Atualiza orçamento para R$150M (base) / R$160M (mata-mata)
-- e corrige símbolo monetário de EUR → R$

-- ===== 1. get_limites_fase com novos valores =====
CREATE OR REPLACE FUNCTION public.get_limites_fase(p_rodada INT)
RETURNS JSONB
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  RETURN CASE
    WHEN p_rodada = 0 THEN
      jsonb_build_object('transferencias_gratis', 999, 'max_por_selecao', 3, 'orcamento_maximo', 150.0)
    WHEN p_rodada BETWEEN 1 AND 3 THEN
      jsonb_build_object('transferencias_gratis', 3, 'max_por_selecao', 3, 'orcamento_maximo', 150.0)
    WHEN p_rodada = 4 THEN
      jsonb_build_object('transferencias_gratis', 999, 'max_por_selecao', 3, 'orcamento_maximo', 160.0)
    WHEN p_rodada = 5 THEN
      jsonb_build_object('transferencias_gratis', 5, 'max_por_selecao', 4, 'orcamento_maximo', 160.0)
    WHEN p_rodada = 6 THEN
      jsonb_build_object('transferencias_gratis', 5, 'max_por_selecao', 5, 'orcamento_maximo', 160.0)
    WHEN p_rodada = 7 THEN
      jsonb_build_object('transferencias_gratis', 5, 'max_por_selecao', 6, 'orcamento_maximo', 160.0)
    WHEN p_rodada = 8 THEN
      jsonb_build_object('transferencias_gratis', 5, 'max_por_selecao', 7, 'orcamento_maximo', 160.0)
    ELSE
      jsonb_build_object('transferencias_gratis', 3, 'max_por_selecao', 3, 'orcamento_maximo', 150.0)
  END;
END;
$$;

-- ===== 2. salvar_elenco com R$ nas mensagens =====
CREATE OR REPLACE FUNCTION public.salvar_elenco(
  p_jogadores            JSONB,
  p_orcamento_gasto      NUMERIC,
  p_transferencias_usadas INT DEFAULT 0
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

GRANT EXECUTE ON FUNCTION public.salvar_elenco(JSONB, NUMERIC, INT) TO authenticated;

-- ===== 3. abrir_proxima_rodada com aumento de R$10M =====
CREATE OR REPLACE FUNCTION public.abrir_proxima_rodada(p_novo_deadline TIMESTAMPTZ DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rodada_atual   INT;
  v_nova_rodada    INT;
  v_deadline       TIMESTAMPTZ;
  v_limites        JSONB;
  v_aumento        NUMERIC := 0;
BEGIN
  SELECT rodada_atual INTO v_rodada_atual FROM public.config_rodada WHERE id = 1;
  v_nova_rodada := v_rodada_atual + 1;
  v_deadline := COALESCE(p_novo_deadline, NOW() + INTERVAL '7 days');

  v_limites := public.get_limites_fase(v_nova_rodada);

  IF v_nova_rodada = 4 THEN
    v_aumento := 10.0;
    UPDATE public.times_usuarios
    SET banco_cartoletas = banco_cartoletas + v_aumento,
        updated_at = NOW();
  END IF;

  UPDATE public.times_usuarios
  SET transferencias_usadas_rodada = 0,
      penalidade_transferencias_rodada = 0,
      updated_at = NOW();

  UPDATE public.config_rodada
  SET rodada_atual = v_nova_rodada,
      mercado_aberto = TRUE,
      deadline = v_deadline,
      updated_at = NOW()
  WHERE id = 1;

  RETURN jsonb_build_object(
    'rodada_anterior', v_rodada_atual,
    'rodada_atual', v_nova_rodada,
    'deadline', v_deadline,
    'aumento_orcamento', v_aumento,
    'limites', v_limites
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.abrir_proxima_rodada(TIMESTAMPTZ) TO service_role;

-- ===== 4. validar_elenco com R$ nas mensagens =====
CREATE OR REPLACE FUNCTION public.validar_elenco(
  p_jogadores JSONB,
  p_rodada INT
) RETURNS JSONB
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  v_limites       JSONB;
  v_max_por_sel   INT;
  v_orcamento_max NUMERIC;
  v_elenco_max CONSTANT INT := 15;
  v_custo         NUMERIC := 0;
  v_erros         TEXT[] := '{}';
  v_jogador       JSONB;
  v_pos           TEXT;
  v_preco         NUMERIC;
  v_sel_id        TEXT;
  v_contagem_pos  JSONB := '{}'::JSONB;
  v_contagem_sel  JSONB := '{}'::JSONB;
  v_qtd_pos       INT;
  v_qtd_sel       INT;
  v_total         INT := 0;
  v_keys          TEXT[];
  v_key           TEXT;
BEGIN
  v_limites := public.get_limites_fase(p_rodada);
  v_max_por_sel := (v_limites->>'max_por_selecao')::INT;
  v_orcamento_max := (v_limites->>'orcamento_maximo')::NUMERIC;

  FOR v_jogador IN SELECT * FROM jsonb_array_elements(p_jogadores)
  LOOP
    v_total := v_total + 1;
    v_pos := v_jogador->>'posicao';
    v_preco := (v_jogador->>'preco')::NUMERIC;
    v_sel_id := v_jogador->>'selecao_id';

    v_custo := v_custo + COALESCE(v_preco, 0);

    v_qtd_pos := COALESCE((v_contagem_pos->>v_pos)::INT, 0);
    v_contagem_pos := jsonb_set(v_contagem_pos, ARRAY[v_pos], to_jsonb(v_qtd_pos + 1));

    IF v_sel_id IS NOT NULL AND v_sel_id <> '' THEN
      v_qtd_sel := COALESCE((v_contagem_sel->>v_sel_id)::INT, 0);
      v_contagem_sel := jsonb_set(v_contagem_sel, ARRAY[v_sel_id], to_jsonb(v_qtd_sel + 1));
    END IF;
  END LOOP;

  IF v_total != v_elenco_max THEN
    v_erros := array_append(v_erros, format('O elenco deve ter exatamente %s jogadores. Atualmente tem %s.', v_elenco_max, v_total));
  END IF;

  v_qtd_pos := COALESCE((v_contagem_pos->>'G')::INT, 0);
  IF v_qtd_pos > 2 THEN
    v_erros := array_append(v_erros, format('Limite de 2 Goleiros excedido (%s).', v_qtd_pos));
  END IF;
  v_qtd_pos := COALESCE((v_contagem_pos->>'D')::INT, 0);
  IF v_qtd_pos > 5 THEN
    v_erros := array_append(v_erros, format('Limite de 5 Defensores excedido (%s).', v_qtd_pos));
  END IF;
  v_qtd_pos := COALESCE((v_contagem_pos->>'M')::INT, 0);
  IF v_qtd_pos > 5 THEN
    v_erros := array_append(v_erros, format('Limite de 5 Meio-campistas excedido (%s).', v_qtd_pos));
  END IF;
  v_qtd_pos := COALESCE((v_contagem_pos->>'F')::INT, 0);
  IF v_qtd_pos > 3 THEN
    v_erros := array_append(v_erros, format('Limite de 3 Atacantes excedido (%s).', v_qtd_pos));
  END IF;

  v_keys := ARRAY(SELECT jsonb_object_keys(v_contagem_sel));
  FOREACH v_key IN ARRAY v_keys
  LOOP
    v_qtd_sel := COALESCE((v_contagem_sel->>v_key)::INT, 0);
    IF v_qtd_sel > v_max_por_sel THEN
      v_erros := array_append(v_erros, format('Limite de %s jogadores por seleção excedido para a seleção %s (%s).', v_max_por_sel, v_key, v_qtd_sel));
    END IF;
  END LOOP;

  IF v_custo > v_orcamento_max THEN
    v_erros := array_append(v_erros, format('Orçamento estourado: R$%sM (máx R$%sM).', round(v_custo, 1)::TEXT, round(v_orcamento_max, 1)::TEXT));
  END IF;

  IF array_length(v_erros, 1) IS NULL OR array_length(v_erros, 1) = 0 THEN
    RETURN jsonb_build_object('valido', true, 'erros', '[]'::JSONB);
  ELSE
    RETURN jsonb_build_object('valido', false, 'erros', to_jsonb(v_erros));
  END IF;
END;
$$;
