-- 003 - RPC salvar_elenco: salva elenco + capitão + orçamento atomicamente
-- Segurança: SECURITY DEFINER garante que o autor da chamada é o auth.uid().

CREATE OR REPLACE FUNCTION public.salvar_elenco(
  p_jogadores JSONB,         -- [{"id": 123, "eh_capitao": true}, ...]
  p_orcamento_gasto NUMERIC  -- total gasto (calculado pelo front)
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_usuario_id UUID := auth.uid();
  v_time_id    UUID;
  v_count      INT;
  v_ids        BIGINT[];
  v_existentes INT;
  v_orcamento  NUMERIC;
  v_orcamento_max CONSTANT NUMERIC := 100.0;
  v_elenco_max CONSTANT INT := 15;
BEGIN
  IF v_usuario_id IS NULL THEN
    RAISE EXCEPTION 'Não autenticado' USING ERRCODE = '42501';
  END IF;

  -- Localiza o time do usuário (cria se primeiro login)
  SELECT id INTO v_time_id
  FROM times_usuarios
  WHERE usuario_id = v_usuario_id
  LIMIT 1;

  IF v_time_id IS NULL THEN
    INSERT INTO times_usuarios (usuario_id, nome_time, banco_cartoletas, transferencias_gratis)
    VALUES (v_usuario_id, 'Meu Time', v_orcamento_max, 1)
    RETURNING id INTO v_time_id;
  END IF;

  -- Valida tamanho
  v_count := jsonb_array_length(p_jogadores);
  IF v_count > v_elenco_max THEN
    RAISE EXCEPTION 'Elenco excede o máximo de % jogadores (recebido: %)',
      v_elenco_max, v_count USING ERRCODE = '23514';
  END IF;

  -- Valida orçamento
  IF p_orcamento_gasto IS NULL OR p_orcamento_gasto < 0 THEN
    RAISE EXCEPTION 'Orçamento gasto inválido: %', p_orcamento_gasto USING ERRCODE = '23514';
  END IF;
  IF p_orcamento_gasto > v_orcamento_max THEN
    RAISE EXCEPTION 'Orçamento estourado: €%M (máx: €%M)',
      p_orcamento_gasto, v_orcamento_max USING ERRCODE = '23514';
  END IF;

  -- Coleta ids dos jogadores
  SELECT array_agg((j->>'id')::BIGINT) INTO v_ids
  FROM jsonb_array_elements(p_jogadores) j;

  -- Se não há jogadores, apenas limpa
  IF v_count = 0 THEN
    DELETE FROM elencos_usuarios WHERE time_usuario_id = v_time_id;
    UPDATE times_usuarios
      SET banco_cartoletas = v_orcamento_max
      WHERE id = v_time_id;
    RETURN jsonb_build_object(
      'time_id', v_time_id, 'saldo', v_orcamento_max, 'elenco_count', 0
    );
  END IF;

  -- Valida que todos os ids existem
  SELECT COUNT(*) INTO v_existentes
  FROM jogadores
  WHERE id_sofascore = ANY(v_ids);
  IF v_existentes <> v_count THEN
    RAISE EXCEPTION 'Um ou mais jogador_id não existem (existentes: %, recebidos: %)',
      v_existentes, v_count USING ERRCODE = '23502';
  END IF;

  -- Substitui elenco em transação
  DELETE FROM elencos_usuarios WHERE time_usuario_id = v_time_id;

  INSERT INTO elencos_usuarios (time_usuario_id, jogador_id, eh_capitao)
  SELECT v_time_id,
         (j->>'id')::BIGINT,
         COALESCE((j->>'eh_capitao')::BOOLEAN, FALSE)
  FROM jsonb_array_elements(p_jogadores) j;

  -- Atualiza saldo
  v_orcamento := v_orcamento_max - p_orcamento_gasto;
  UPDATE times_usuarios
    SET banco_cartoletas = v_orcamento
    WHERE id = v_time_id;

  RETURN jsonb_build_object(
    'time_id', v_time_id,
    'saldo',   v_orcamento,
    'elenco_count', v_count
  );
END;
$$;

-- Garante que anon/authenticated podem chamar
GRANT EXECUTE ON FUNCTION public.salvar_elenco(JSONB, NUMERIC) TO authenticated;
