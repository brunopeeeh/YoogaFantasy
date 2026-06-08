-- Ciclo de rodadas: scouts, pontuação de usuários, snapshot de elenco

-- ===== Scouts por atleta/rodada =====
CREATE TABLE IF NOT EXISTS public.scouts_atleta_rodada (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jogador_id                  BIGINT NOT NULL,
  rodada                      INT NOT NULL,
  minutos_jogados             INT NOT NULL DEFAULT 0,
  gols                        INT NOT NULL DEFAULT 0,
  assistencias                INT NOT NULL DEFAULT 0,
  cartao_amarelo              INT NOT NULL DEFAULT 0,
  cartao_vermelho             INT NOT NULL DEFAULT 0,
  gols_contra                 INT NOT NULL DEFAULT 0,
  saldo_gols                  BOOLEAN NOT NULL DEFAULT FALSE,
  gols_sofridos_selecao       INT NOT NULL DEFAULT 0,
  passes_tentados             INT NOT NULL DEFAULT 0,
  precisao_passes             NUMERIC(5,2) NOT NULL DEFAULT 0,
  desarmes                    INT NOT NULL DEFAULT 0,
  cortes                      INT NOT NULL DEFAULT 0,
  passes_decisivos            INT NOT NULL DEFAULT 0,
  perdas_bola                 INT NOT NULL DEFAULT 0,
  pontuacao_final_calculada   NUMERIC(8,2) NOT NULL DEFAULT 0,
  eventos_processados         INT NOT NULL DEFAULT 0,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (jogador_id, rodada)
);

CREATE INDEX IF NOT EXISTS idx_scouts_rodada ON public.scouts_atleta_rodada (rodada);
CREATE INDEX IF NOT EXISTS idx_scouts_jogador ON public.scouts_atleta_rodada (jogador_id);

DROP TRIGGER IF EXISTS scouts_atleta_rodada_touch ON public.scouts_atleta_rodada;
CREATE TRIGGER scouts_atleta_rodada_touch
  BEFORE UPDATE ON public.scouts_atleta_rodada
  FOR EACH ROW EXECUTE FUNCTION public.trg_touch_updated_at();

ALTER TABLE public.scouts_atleta_rodada ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read scouts" ON public.scouts_atleta_rodada;
CREATE POLICY "Public read scouts" ON public.scouts_atleta_rodada
  FOR SELECT USING (TRUE);

-- ===== Pontuação por time/rodada =====
CREATE TABLE IF NOT EXISTS public.pontuacao_usuarios_rodada (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  time_usuario_id             BIGINT NOT NULL REFERENCES public.times_usuarios(id) ON DELETE CASCADE,
  rodada                      INT NOT NULL,
  pontos_jogadores            NUMERIC(8,2) NOT NULL DEFAULT 0,
  bonus_capitao               NUMERIC(8,2) NOT NULL DEFAULT 0,
  penalidade_transferencias     NUMERIC(8,2) NOT NULL DEFAULT 0,
  pontos_ganhos                 NUMERIC(8,2) NOT NULL DEFAULT 0,
  created_at                    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (time_usuario_id, rodada)
);

CREATE INDEX IF NOT EXISTS idx_pontuacao_rodada ON public.pontuacao_usuarios_rodada (rodada DESC);

ALTER TABLE public.pontuacao_usuarios_rodada ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own pontuacao" ON public.pontuacao_usuarios_rodada;
CREATE POLICY "Users read own pontuacao" ON public.pontuacao_usuarios_rodada
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.times_usuarios t
      WHERE t.id = pontuacao_usuarios_rodada.time_usuario_id
        AND t.usuario_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Public read pontuacao for ligas" ON public.pontuacao_usuarios_rodada;
CREATE POLICY "Public read pontuacao for ligas" ON public.pontuacao_usuarios_rodada
  FOR SELECT TO authenticated USING (TRUE);

-- ===== Snapshot do elenco no fechamento do mercado =====
CREATE TABLE IF NOT EXISTS public.elenco_snapshot_rodada (
  time_usuario_id   BIGINT NOT NULL REFERENCES public.times_usuarios(id) ON DELETE CASCADE,
  rodada            INT NOT NULL,
  jogador_id        BIGINT NOT NULL,
  eh_capitao        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (time_usuario_id, rodada, jogador_id)
);

CREATE INDEX IF NOT EXISTS idx_snapshot_rodada ON public.elenco_snapshot_rodada (rodada);

ALTER TABLE public.elenco_snapshot_rodada ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own snapshot" ON public.elenco_snapshot_rodada;
CREATE POLICY "Users read own snapshot" ON public.elenco_snapshot_rodada
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.times_usuarios t
      WHERE t.id = elenco_snapshot_rodada.time_usuario_id
        AND t.usuario_id = auth.uid()
    )
  );

-- ===== Backup para token Ajuste Rápido =====
CREATE TABLE IF NOT EXISTS public.ajuste_rapido_backup (
  time_usuario_id   BIGINT NOT NULL REFERENCES public.times_usuarios(id) ON DELETE CASCADE,
  rodada            INT NOT NULL,
  jogadores         JSONB NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (time_usuario_id, rodada)
);

-- ===== Controle de jogos processados =====
ALTER TABLE public.jogos_copa
  ADD COLUMN IF NOT EXISTS pontos_processados BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS processado_em TIMESTAMPTZ;

-- ===== Fecha mercado e congela elencos =====
CREATE OR REPLACE FUNCTION public.fechar_mercado_rodada()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rodada INT;
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

  RETURN jsonb_build_object('rodada', v_rodada, 'mercado_aberto', FALSE);
END;
$$;

GRANT EXECUTE ON FUNCTION public.fechar_mercado_rodada() TO service_role;

-- ===== Abre próxima rodada: transferências, mercado, deadline =====
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

  UPDATE public.times_usuarios
  SET transferencias_gratis = LEAST(COALESCE(transferencias_gratis, 0) + 1, 2),
      transferencias_total_rodada = 0,
      pontos_penalidade_transferencia = 0;

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

-- ===== Sincroniza pontos acumulados nas ligas =====
CREATE OR REPLACE FUNCTION public.sincronizar_pontos_ligas(p_rodada INT)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INT := 0;
BEGIN
  UPDATE public.usuarios_ligas ul
  SET pontos_acumulados = ul.pontos_acumulados + sub.pontos
  FROM (
    SELECT t.usuario_id, pur.pontos_ganhos AS pontos
    FROM public.pontuacao_usuarios_rodada pur
    JOIN public.times_usuarios t ON t.id = pur.time_usuario_id
    WHERE pur.rodada = p_rodada
  ) sub
  WHERE ul.usuario_id = sub.usuario_id;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.sincronizar_pontos_ligas(INT) TO service_role;
