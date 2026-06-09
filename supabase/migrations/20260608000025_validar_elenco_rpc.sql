-- RPC de validação de elenco (fonte única da verdade)
-- Uso: SELECT * FROM validar_elenco('[{"id":1,"posicao":"G","preco":8.5,"selecao_id":1}]'::jsonb, 1);
-- Retorna: { valido: bool, erros: string[] }

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

    -- Contagem por posição
    v_qtd_pos := COALESCE((v_contagem_pos->>v_pos)::INT, 0);
    v_contagem_pos := jsonb_set(v_contagem_pos, ARRAY[v_pos], to_jsonb(v_qtd_pos + 1));

    -- Contagem por seleção
    IF v_sel_id IS NOT NULL AND v_sel_id <> '' THEN
      v_qtd_sel := COALESCE((v_contagem_sel->>v_sel_id)::INT, 0);
      v_contagem_sel := jsonb_set(v_contagem_sel, ARRAY[v_sel_id], to_jsonb(v_qtd_sel + 1));
    END IF;
  END LOOP;

  -- Valida quantidade total
  IF v_total != v_elenco_max THEN
    v_erros := array_append(v_erros, format('O elenco deve ter exatamente %s jogadores. Atualmente tem %s.', v_elenco_max, v_total));
  END IF;

  -- Valida limites por posição (G: 2, D: 5, M: 5, F: 3)
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

  -- Valida limite por seleção
  v_keys := ARRAY(SELECT jsonb_object_keys(v_contagem_sel));
  FOREACH v_key IN ARRAY v_keys
  LOOP
    v_qtd_sel := COALESCE((v_contagem_sel->>v_key)::INT, 0);
    IF v_qtd_sel > v_max_por_sel THEN
      v_erros := array_append(v_erros, format('Limite de %s jogadores por seleção excedido para a seleção %s (%s).', v_max_por_sel, v_key, v_qtd_sel));
    END IF;
  END LOOP;

  -- Valida orçamento
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
