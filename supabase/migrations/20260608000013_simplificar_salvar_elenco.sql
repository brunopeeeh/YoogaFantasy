-- salvar_elenco v4: sem contagem de transferências
-- Mercado aberto: alterações livres, sem custo
-- Mercado fechado: só permite substituir jogador machucado (status_medico != 'disponivel')

DROP FUNCTION IF EXISTS public.salvar_elenco(JSONB, NUMERIC, INT);

CREATE OR REPLACE FUNCTION public.salvar_elenco(
  p_jogadores           JSONB,
  p_orcamento_gasto     NUMERIC
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
  v_antigos_ids          BIGINT[];
  v_removidos_invalidos  INT;
  v_orcamento_max CONSTANT NUMERIC := 150.0;
  v_elenco_max   CONSTANT INT     := 15;
BEGIN
  IF v_usuario_id IS NULL THEN
    RAISE EXCEPTION 'Não autenticado' USING ERRCODE = '42501';
  END IF;

  SELECT mercado_aberto, rodada_atual
  INTO v_mercado_aberto, v_rodada_atual
  FROM public.config_rodada WHERE id = 1;

  SELECT id INTO v_time_id FROM public.times_usuarios
  WHERE usuario_id = v_usuario_id LIMIT 1;

  IF v_time_id IS NULL THEN
    INSERT INTO public.times_usuarios (usuario_id, nome_time, banco_cartoletas)
    VALUES (v_usuario_id, 'Meu Time', v_orcamento_max)
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
    RAISE EXCEPTION 'Orçamento estourado: R$%M (máx: R$%M)',
      p_orcamento_gasto, v_orcamento_max USING ERRCODE = '23514';
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
        RAISE EXCEPTION 'Mercado fechado. Só é permitido substituir jogadores machucados.'
          USING ERRCODE = '23514';
      END IF;
    END IF;
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
  SET banco_cartoletas = v_orcamento,
      updated_at = NOW()
  WHERE id = v_time_id;

  RETURN jsonb_build_object(
    'time_id',       v_time_id,
    'saldo',         v_orcamento,
    'elenco_count',  v_count
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.salvar_elenco(JSONB, NUMERIC) TO authenticated;
