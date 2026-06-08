-- Implementa regras de fase: transferências limitadas, orçamento dinâmico, max seleção variável

-- ===== 1. Helper: limites por rodada =====
CREATE OR REPLACE FUNCTION public.get_limites_fase(p_rodada INT)
RETURNS JSONB
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  RETURN CASE
    WHEN p_rodada = 0 THEN
      jsonb_build_object('transferencias_gratis', 999, 'max_por_selecao', 3, 'orcamento_maximo', 100.0)
    WHEN p_rodada BETWEEN 1 AND 3 THEN
      jsonb_build_object('transferencias_gratis', 3, 'max_por_selecao', 3, 'orcamento_maximo', 100.0)
    WHEN p_rodada = 4 THEN
      jsonb_build_object('transferencias_gratis', 999, 'max_por_selecao', 3, 'orcamento_maximo', 105.0)
    WHEN p_rodada = 5 THEN
      jsonb_build_object('transferencias_gratis', 5, 'max_por_selecao', 4, 'orcamento_maximo', 105.0)
    WHEN p_rodada = 6 THEN
      jsonb_build_object('transferencias_gratis', 5, 'max_por_selecao', 5, 'orcamento_maximo', 105.0)
    WHEN p_rodada = 7 THEN
      jsonb_build_object('transferencias_gratis', 5, 'max_por_selecao', 6, 'orcamento_maximo', 105.0)
    WHEN p_rodada = 8 THEN
      jsonb_build_object('transferencias_gratis', 5, 'max_por_selecao', 7, 'orcamento_maximo', 105.0)
    ELSE
      jsonb_build_object('transferencias_gratis', 3, 'max_por_selecao', 3, 'orcamento_maximo', 100.0)
  END;
END;
$$;

-- ===== 2. Colunas de controle de transferências =====
ALTER TABLE public.times_usuarios
  ADD COLUMN IF NOT EXISTS transferencias_usadas_rodada INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS penalidade_transferencias_rodada NUMERIC(8,2) NOT NULL DEFAULT 0;

-- ===== 3. salvar_elenco com validação de fase =====
DROP FUNCTION IF EXISTS public.salvar_elenco(JSONB, NUMERIC);

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
    VALUES (v_usuario_id, 'Meu Time', 100.0)
    RETURNING id INTO v_time_id;
  END IF;

  -- Obter limites da fase atual
  v_limites := public.get_limites_fase(v_rodada_atual);
  v_orcamento_max := (v_limites->>'orcamento_maximo')::NUMERIC;
  v_max_por_selecao := (v_limites->>'max_por_selecao')::INT;
  v_transferencias_gratis := (v_limites->>'transferencias_gratis')::INT;

  -- Validar quantidade de jogadores
  v_count := jsonb_array_length(p_jogadores);
  IF v_count > v_elenco_max THEN
    RAISE EXCEPTION 'Elenco excede o maximo de % jogadores (recebido: %)',
      v_elenco_max, v_count USING ERRCODE = '23514';
  END IF;

  -- Validar orçamento com limite dinâmico da fase
  IF p_orcamento_gasto IS NULL OR p_orcamento_gasto < 0 THEN
    RAISE EXCEPTION 'Orcamento gasto invalido: %', p_orcamento_gasto USING ERRCODE = '23514';
  END IF;
  IF p_orcamento_gasto > v_orcamento_max THEN
    RAISE EXCEPTION 'Orcamento estourado: EUR%M (max: EUR%M)',
      p_orcamento_gasto, v_orcamento_max USING ERRCODE = '23514';
  END IF;

  -- Extrair IDs dos jogadores
  SELECT array_agg((j->>'id')::BIGINT) INTO v_ids
  FROM jsonb_array_elements(p_jogadores) j;

  -- Validar existência dos jogadores
  IF v_count > 0 THEN
    SELECT COUNT(*) INTO v_existentes
    FROM public.jogadores
    WHERE id_sofascore = ANY(v_ids);
    IF v_existentes <> v_count THEN
      RAISE EXCEPTION 'Um ou mais jogador_id nao existem (existentes: %, recebidos: %)',
        v_existentes, v_count USING ERRCODE = '23502';
    END IF;
  END IF;

  -- Validar max_por_selecao dinâmico da fase (server-side)
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

  -- Se mercado fechado, verificar se as remoções são apenas de jogadores machucados
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

  -- Verificar se é o primeiro save (sem elenco anterior) — pula contagem de transferências
  SELECT COUNT(*) INTO v_elenco_anterior
  FROM public.elencos_usuarios
  WHERE time_usuario_id = v_time_id;

  IF v_elenco_anterior > 0 THEN
    -- Contabilizar transferências
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

  -- Persistir elenco
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

-- ===== 4. abrir_proxima_rodada com lógica de fase =====
DROP FUNCTION IF EXISTS public.abrir_proxima_rodada(TIMESTAMPTZ);

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

  -- Obter limites da nova fase
  v_limites := public.get_limites_fase(v_nova_rodada);

  -- Aumentar orçamento ao entrar na fase de mata-mata (pós rodada 3)
  IF v_nova_rodada = 4 THEN
    v_aumento := 5.0;
    UPDATE public.times_usuarios
    SET banco_cartoletas = banco_cartoletas + v_aumento,
        updated_at = NOW();
  END IF;

  -- Resetar contadores de transferência
  UPDATE public.times_usuarios
  SET transferencias_usadas_rodada = 0,
      penalidade_transferencias_rodada = 0,
      updated_at = NOW();

  -- Atualizar config_rodada
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
